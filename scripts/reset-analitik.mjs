#!/usr/bin/env node
// Atur ulang data analitik HMTI di Appwrite.
//
//   node scripts/reset-analitik.mjs            → hapus semua catatan page_views
//   node scripts/reset-analitik.mjs --sinyal   → sekalian hapus collab_signals
//
// Kenapa perlu: cara hitung lama menganggap setiap halaman yang dibuka sebagai
// satu kunjungan, sehingga satu perangkat bisa terlihat seperti ratusan
// pengunjung. Sejak kunjungan dihitung per perangkat (visitor_id), catatan lama
// tidak punya identitas perangkat dan angkanya tidak bisa diperbaiki — jadi
// dibuang supaya dashboard mulai dari nol dengan hitungan yang benar.
//
// Proposal kolaborasi (collab_messages) TIDAK pernah dihapus oleh skrip ini.
//
// Kredensial dibaca dari scripts/.appwrite-cred.json (projectId + apiKey),
// file yang sama dengan appwrite-setup.mjs. Butuh scope databases.write.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const mulai = Date.now();
const hapusSinyal = process.argv.slice(2).includes("--sinyal");
const KOLEKSI = hapusSinyal ? ["page_views", "collab_signals"] : ["page_views"];

const CRED_FILE = join(dirname(fileURLToPath(import.meta.url)), ".appwrite-cred.json");
let cred;
try {
  cred = JSON.parse(readFileSync(CRED_FILE, "utf8"));
} catch {
  console.error(`File kredensial tidak ditemukan atau tidak valid: ${CRED_FILE}`);
  process.exit(1);
}

const endpoint = (cred.endpoint ?? "https://sgp.cloud.appwrite.io/v1").replace(/\/+$/, "");
const H = {
  "X-Appwrite-Project": cred.projectId,
  "X-Appwrite-Key": cred.apiKey,
  "Content-Type": "application/json",
};

async function api(method, path, body) {
  const res = await fetch(`${endpoint}${path}`, {
    method,
    headers: H,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    // Sudah ada / sudah terhapus = bukan kegagalan.
    if (res.status === 409 || res.status === 404) return null;
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  if (res.status === 204) return {};
  return res.json();
}

const QLIMIT = (n) => encodeURIComponent(JSON.stringify({ method: "limit", attribute: "", values: [n] }));

// Atribut visitor_id wajib ada sebelum situs menulis catatan baru — Appwrite
// menolak data yang memuat atribut tak dikenal, jadi tanpa langkah ini
// tracking akan diam-diam gagal (errornya ditelan trackPageView).
async function pastikanAtributVisitor() {
  const res = await api("GET", "/databases/hmti/collections/page_views/attributes");
  const attrs = res?.attributes ?? [];
  if (attrs.some((a) => a.key === "visitor_id")) {
    console.log("✓ atribut page_views.visitor_id sudah ada");
  } else {
    await api("POST", "/databases/hmti/collections/page_views/attributes/string", {
      key: "visitor_id",
      size: 64,
      required: false,
      array: false,
    });
    console.log("✓ atribut page_views.visitor_id dibuat");
  }

  // Pembuatan atribut berjalan async di Appwrite.
  const batas = Date.now() + 60000;
  for (;;) {
    const now = (await api("GET", "/databases/hmti/collections/page_views/attributes"))?.attributes ?? [];
    const attr = now.find((a) => a.key === "visitor_id");
    if (attr?.status === "available") break;
    if (Date.now() > batas) throw new Error("timeout menunggu atribut visitor_id siap");
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Index hanya mempercepat pembacaan; kegagalannya tidak boleh membatalkan
  // pembersihan data yang justru jadi tujuan skrip ini.
  try {
    const idx = (await api("GET", "/databases/hmti/collections/page_views/indexes"))?.indexes ?? [];
    if (!idx.some((i) => i.key === "idx_visitor_created")) {
      await api("POST", "/databases/hmti/collections/page_views/indexes", {
        key: "idx_visitor_created",
        type: "key",
        attributes: ["visitor_id", "$createdAt"],
        orders: ["ASC", "ASC"],
      });
      console.log("✓ index idx_visitor_created dibuat");
    }
  } catch (e) {
    console.log(`! index idx_visitor_created dilewati: ${e.message}`);
  }
}

async function totalDokumen(koleksi) {
  const res = await api("GET", `/databases/hmti/collections/${koleksi}/documents?queries[]=${QLIMIT(1)}`);
  return res?.total ?? 0;
}

async function kosongkan(koleksi) {
  const total = await totalDokumen(koleksi);
  if (total === 0) {
    console.log(`  (${koleksi} sudah kosong)`);
    return 0;
  }
  console.log(`→ ${koleksi}: menghapus ${total} dokumen…`);

  let dihapus = 0;
  for (;;) {
    const res = await api("GET", `/databases/hmti/collections/${koleksi}/documents?queries[]=${QLIMIT(100)}`);
    const docs = res?.documents ?? [];
    if (docs.length === 0) break;
    for (const doc of docs) {
      await api("DELETE", `/databases/hmti/collections/${koleksi}/documents/${doc.$id}`);
      dihapus += 1;
    }
    console.log(`  ${dihapus}/${total}`);
  }
  return dihapus;
}

async function main() {
  console.log(`→ Appwrite ${endpoint} (project ${cred.projectId})`);
  await pastikanAtributVisitor();

  let total = 0;
  for (const koleksi of KOLEKSI) {
    total += await kosongkan(koleksi);
  }

  const sisa = await totalDokumen("page_views");
  console.log(`\nSelesai: ${total} dokumen dihapus dalam ${((Date.now() - mulai) / 1000).toFixed(1)}s.`);
  console.log(`page_views sekarang berisi ${sisa} dokumen.`);
  console.log("Dashboard akan menghitung ulang dari kunjungan baru — satu perangkat = satu kunjungan.");
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
