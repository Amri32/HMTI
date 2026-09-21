import assert from "node:assert/strict";
import test from "node:test";
import {
  createProposalCode as kodeFungsi,
  formatJakartaTime as waktuFungsi,
} from "../functions/kirim-email-kolaborasi/src/main.js";
import {
  buatKodePengajuan as kodeSitus,
  waktuLengkapWib as waktuSitus,
} from "../lib/kolaborasi.ts";

// Nomor referensi dihitung di dua tempat: situs (laporan pengaju) dan fungsi
// email (notifikasi ke pengurus). Kalau salah satu berubah sendirian, pengurus
// akan menerima email dengan kode yang tidak cocok dengan yang dipegang
// pengaju — tes ini yang menahannya.

test("nomor referensi di fungsi email identik dengan yang di situs", () => {
  const kasus = [
    ["2026-09-20T16:04:00.000Z", "661f8c0b1a2d3e"],
    ["2026-09-20T17:30:00.000Z", "abc"],
    ["2026-01-01T00:00:00.000Z", "kunci-panjang-sekali"],
    ["2026-12-31T23:59:00.000Z", ""],
  ];

  for (const [iso, id] of kasus) {
    assert.equal(kodeFungsi(iso, id), kodeSitus(iso, id), `beda untuk ${iso} / ${id}`);
  }
});

test("waktu kirim di fungsi email identik dengan yang di situs", () => {
  for (const iso of ["2026-09-20T16:04:00.000Z", "2026-01-01T00:00:00.000Z"]) {
    assert.equal(waktuFungsi(iso), waktuSitus(iso));
  }
});
