// Uji lokal fungsi email pengajuan kolaborasi TANPA deploy ke Appwrite.
//
//   node scripts/uji-fungsi-email.mjs
//
// Fungsinya dipanggil dengan payload event tiruan (bentuk yang dikirim Appwrite
// saat row collab_messages dibuat). Permintaan ke Resend dicegat, jadi
// skrip ini tidak mengirim email sungguhan dan tidak butuh kunci API asli.
//
// Gunanya: memastikan entrypoint, pembacaan payload, nomor referensi, isi
// email, dan pengaturan konfirmasi pengaju sudah benar sebelum di-upload.

import assert from "node:assert/strict";
import handler from "../functions/kirim-email-kolaborasi/src/main.js";

const log = [];
const error = [];

// Tangkap permintaan Resend, balas seolah berhasil.
let permintaan = null;
let jumlahPanggilan = 0;
globalThis.fetch = async (url, opsi) => {
  jumlahPanggilan += 1;
  permintaan = { url: String(url), opsi };
  return new Response(JSON.stringify({ id: "uji-123" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

function buatRes() {
  return {
    status: 200,
    badan: null,
    json(badan, status = 200) {
      this.status = status;
      this.badan = badan;
      return this;
    },
  };
}

const dokumen = {
  $id: "661f8c0b1a2d3e",
  $createdAt: "2026-09-20T16:04:00.000Z",
  nama: "Budi Santoso",
  email: "budi@example.com",
  jenis: "Kerja sama & sponsorship",
  pesan: "Kami ingin mengajak HMTI berkolaborasi di acara kampus.\nMohon info lebih lanjut.",
  status: "baru",
  catatan: "Catatan internal — tidak boleh muncul di email.",
};

// Nama event harus memakai pola TablesDB (tables/rows) — pola lama
// collections/documents sudah tidak dipicu Appwrite versi baru.
const EVENT_ROW = "databases.hmti.tables.collab_messages.rows.661f8c0b1a2d3e.create";

// ── Skenario 1: notifikasi admin, konfirmasi pengaju dimatikan ──────────────
process.env.RESEND_API_KEY = "re_kunci_uji";
process.env.EMAIL_KONFIRMASI_PENGAJU = "false";
delete process.env.EMAIL_TUJUAN;
delete process.env.EMAIL_PENGIRIM;

const balasan = buatRes();
await handler({
  req: {
    headers: { "x-appwrite-trigger": "event" },
    body: { events: [EVENT_ROW], payload: dokumen },
  },
  res: balasan,
  log: (t) => log.push(t),
  error: (t) => error.push(t),
});

assert.equal(error.length, 0, `fungsi melaporkan error: ${error.join(" | ")}`);
assert.equal(balasan.badan?.ok, true, "fungsi tidak melaporkan sukses");
assert.equal(balasan.badan?.code, "KOL-20260920-ECCF", "nomor referensi tidak sesuai");
assert.equal(balasan.badan?.adminEmail?.status, "sent", "email admin tidak terkirim");
assert.equal(balasan.badan?.applicantEmail?.status, "disabled", "konfirmasi pengaju harus nonaktif");

const badan = JSON.parse(permintaan.opsi.body);
assert.equal(permintaan.url, "https://api.resend.com/emails");
assert.deepEqual(badan.to, ["hmti.ubsi.margonda@gmail.com"]);
assert.equal(badan.reply_to, "budi@example.com", "reply_to harus email pengaju");
assert.match(badan.subject, /\[Kolaborasi\] Kerja sama & sponsorship - Budi Santoso \(KOL-20260920-ECCF\)/);
assert.match(badan.html, /KOL-20260920-ECCF/);
assert.match(badan.html, /Kerja sama &amp; sponsorship/);
// Nilai `catatan` pada dokumen bersifat internal: tidak boleh bocor ke email.
assert.ok(!badan.html.includes("tidak boleh muncul di email"), "catatan internal bocor ke email");
assert.ok(!badan.text.includes("tidak boleh muncul di email"), "catatan internal bocor ke email");

// ── Skenario 2: konfirmasi pengaju default aktif, tapi pengirim masih domain
// uji Resend → fungsi menolak mengirim konfirmasi dengan alasan yang jelas. ──
delete process.env.EMAIL_KONFIRMASI_PENGAJU;
permintaan = null;
jumlahPanggilan = 0;
const balasanPengaju = buatRes();
await handler({
  req: {
    headers: { "x-appwrite-trigger": "event" },
    body: { events: [EVENT_ROW], payload: dokumen },
  },
  res: balasanPengaju,
  log: (t) => log.push(t),
  error: (t) => error.push(t),
});

assert.equal(balasanPengaju.badan?.ok, false, "konfirmasi lewat domain uji harus ditolak");
assert.equal(
  balasanPengaju.badan?.reason,
  "applicant_email_requires_verified_domain",
  "alasan penolakan konfirmasi pengaju salah"
);
assert.equal(balasanPengaju.badan?.adminEmail?.status, "sent", "email admin tetap harus terkirim");
assert.equal(jumlahPanggilan, 1, "konfirmasi pengaju tidak boleh menyentuh Resend sebelum domain terverifikasi");
assert.match(JSON.parse(permintaan.opsi.body).subject, /^\[Kolaborasi\]/, "satu-satunya email harus notifikasi admin");

// ── Skenario 3: pemanggilan langsung tanpa header event Appwrite ditolak 403
// tanpa menyentuh Resend — inilah pagar anti-spam bila URL fungsi diketahui. ──
process.env.RESEND_API_KEY = "re_kunci_uji";
jumlahPanggilan = 0;
const balasanLangsung = buatRes();
await handler({
  req: { headers: {}, body: { payload: dokumen } },
  res: balasanLangsung,
  log: (t) => log.push(t),
  error: (t) => error.push(t),
});
assert.equal(balasanLangsung.status, 403, "POST langsung tanpa event harus 403");
assert.equal(balasanLangsung.badan?.reason, "forbidden_source", "alasan penolakan salah");
assert.equal(jumlahPanggilan, 0, "penolakan 403 tidak boleh menyentuh Resend");

// ── Skenario 4: header event ada, tapi nama event salah → tetap ditolak. ────
jumlahPanggilan = 0;
const balasanPalsu = buatRes();
await handler({
  req: {
    headers: { "x-appwrite-trigger": "event" },
    body: {
      events: ["databases.hmti.collections.collab_messages.documents.uji.create"],
      payload: dokumen,
    },
  },
  res: balasanPalsu,
  log: (t) => log.push(t),
  error: (t) => error.push(t),
});
assert.equal(balasanPalsu.status, 403, "event dengan nama lama (collections/documents) harus 403");
assert.equal(jumlahPanggilan, 0, "event palsu tidak boleh menyentuh Resend");

// ── Skenario 5: tanpa kunci API, fungsi berhenti dengan pesan yang jelas. ───
delete process.env.RESEND_API_KEY;
jumlahPanggilan = 0;
const balasanKosong = buatRes();
await handler({
  req: {
    headers: { "x-appwrite-trigger": "event" },
    body: { events: [EVENT_ROW], payload: dokumen },
  },
  res: balasanKosong,
  log: (t) => log.push(t),
  error: (t) => error.push(t),
});
assert.equal(balasanKosong.status, 500);
assert.equal(balasanKosong.badan?.reason, "missing_resend_api_key");
assert.equal(jumlahPanggilan, 0, "tidak boleh menghubungi Resend tanpa kunci");

console.log("✓ uji fungsi email lolos");
console.log(`  nomor referensi : ${balasan.badan.code}`);
console.log(`  subjek          : ${badan.subject}`);
console.log(`  log             : ${log[0]}`);
