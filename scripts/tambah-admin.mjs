#!/usr/bin/env node
// Tambah admin baru: buat user Appwrite (kalau belum ada) lalu masukkan ke
// team "admin" supaya bisa login di /admin/login.
//
// Pakai:
//   node scripts/tambah-admin.mjs <email> [password]
//
// Password minimal 8 karakter; kalau tidak diisi, dibuatkan acak dan
// ditampilkan sekali di layar. Kredensial dari scripts/.appwrite-cred.json
// (file yang sama dengan appwrite-setup.mjs).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [email, passwordArg] = process.argv.slice(2);
if (!email) {
  console.error("Pemakaian: node scripts/tambah-admin.mjs <email> [password]");
  process.exit(1);
}

const password =
  passwordArg ??
  `Hmti-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 6)}`;
if (password.length < 8) {
  console.error("Password minimal 8 karakter.");
  process.exit(1);
}

const CRED_FILE = join(dirname(fileURLToPath(import.meta.url)), ".appwrite-cred.json");
let cred;
try {
  cred = JSON.parse(readFileSync(CRED_FILE, "utf8"));
} catch {
  console.error(`File kredensial tidak ditemukan atau tidak valid: ${CRED_FILE}`);
  process.exit(1);
}

const ENDPOINT = (cred.endpoint ?? "https://sgp.cloud.appwrite.io/v1").replace(/\/+$/, "");
const H = {
  "X-Appwrite-Project": cred.projectId,
  "X-Appwrite-Key": cred.apiKey,
  "Content-Type": "application/json",
};

async function api(method, path, body) {
  const res = await fetch(`${ENDPOINT}${path}`, {
    method,
    headers: H,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 409 || text.includes("already exists")) return null;
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function main() {
  // 1. Cek user sudah ada atau belum.
  const found = await api("GET", `/users?search=${encodeURIComponent(email)}`);
  const existing = (found?.users ?? []).find((u) => u.email === email);

  if (existing) {
    console.log(`User ${email} sudah ada (userId ${existing.$id}) — password tidak diubah.`);
  } else {
    await api("POST", "/users", {
      userId: "unique()",
      email,
      password,
      name: email.split("@")[0],
    });
    console.log(`✓ user ${email} dibuat`);
  }

  // 2. Masukkan ke team admin (skip bila sudah jadi member).
  const memberships = await api("GET", "/teams/admin/memberships");
  const sudah = (memberships?.memberships ?? []).some(
    (m) => (m.userEmail ?? m.email) === email
  );
  if (sudah) {
    console.log(`  (${email} sudah menjadi member team admin)`);
  } else {
    await api("POST", "/teams/admin/memberships", {
      email,
      roles: ["member"],
      url: "https://cloud.appwrite.io/console",
    });
    console.log(`✓ ${email} ditambahkan ke team admin`);
  }

  if (!existing) {
    console.log(`\nPassword sementara (tampilkan sekali, kirim via kanal aman):`);
    console.log(`  ${password}`);
    console.log(`\nMinta dia login di /admin/login lalu ganti password dari Appwrite Console.`);
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
