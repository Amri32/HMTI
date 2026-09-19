#!/usr/bin/env node
// Ganti password akun admin Appwrite lewat API server-side.
//
// Pakai:
//   node scripts/reset-admin-password.mjs <email> <password-baru>
//
// Kredensial dibaca dari scripts/.appwrite-cred.json (projectId + apiKey),
// file yang sama dengan appwrite-setup.mjs. Password tidak pernah ditulis
// ke disk atau log; hanya dikirim satu kali ke endpoint Appwrite.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
  console.error("Pemakaian: node scripts/reset-admin-password.mjs <email> <password-baru>");
  console.error("Password baru minimal 8 karakter.");
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("Password baru minimal 8 karakter.");
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

const endpoint = (cred.endpoint ?? "https://sgp.cloud.appwrite.io/v1").replace(/\/+$/, "");
const H = {
  "X-Appwrite-Project": cred.projectId,
  "X-Appwrite-Key": cred.apiKey,
  "Content-Type": "application/json",
};

async function main() {
  // 1. Cari user berdasarkan email (pencocokan persis dilakukan di sini,
  //    karena search API Appwrite bersifat fuzzy).
  const searchUrl = `${endpoint}/users?search=${encodeURIComponent(email)}`;
  const searchRes = await fetch(searchUrl, { headers: H });
  if (!searchRes.ok) {
    console.error(`Gagal mencari user: HTTP ${searchRes.status} ${searchRes.statusText}`);
    process.exit(1);
  }
  const found = await searchRes.json();
  const user = (found.users ?? []).find((u) => u.email === email);
  if (!user) {
    console.error(`Tidak ada user dengan email persis: ${email}`);
    console.error(`Kandidat yang dikembalikan pencarian: ${(found.users ?? []).map((u) => u.email).join(", ") || "(kosong)"}`);
    process.exit(1);
  }

  // 2. Set password baru.
  const patchUrl = `${endpoint}/users/${user.$id}/password`;
  const patchRes = await fetch(patchUrl, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({ password: newPassword }),
  });
  if (!patchRes.ok) {
    const body = await patchRes.text();
    console.error(`Gagal set password: HTTP ${patchRes.status} ${patchRes.statusText}`);
    console.error(body.slice(0, 300));
    process.exit(1);
  }

  console.log(`OK. Password untuk ${email} (userId ${user.$id}) sudah diganti.`);
  console.log("Sekarang login di /admin/login dengan email itu dan password baru.");
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
