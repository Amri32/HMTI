import assert from "node:assert/strict";
import test from "node:test";
import {
  buatKodePengajuan,
  labelStatus,
  normalisasiStatus,
  ringkasStatus,
  waktuLengkapWib,
} from "../lib/kolaborasi.ts";

test("nomor referensi punya bentuk tetap dan stabil", () => {
  const kode = buatKodePengajuan("2026-09-20T16:04:00.000Z", "661f8c0b1a2d3e");
  assert.match(kode, /^KOL-\d{8}-[0-9A-F]{4}$/);
  // Sumber yang sama selalu menghasilkan kode yang sama — itu syaratnya, karena
  // panel admin menghitung kode dari dokumen, bukan dari kolom tersimpan.
  assert.equal(kode, buatKodePengajuan("2026-09-20T16:04:00.000Z", "661f8c0b1a2d3e"));
  assert.notEqual(kode, buatKodePengajuan("2026-09-20T16:04:00.000Z", "661f8c0b1a2d3e9"));
});

test("tanggal pada kode memakai hari WIB, bukan hari UTC", () => {
  // 20 Sep 17:30 UTC = 21 Sep 00:30 WIB → kode harus memakai 21 September.
  assert.match(buatKodePengajuan("2026-09-20T17:30:00.000Z", "abc"), /^KOL-20260921-/);
  // 20 Sep 16:00 UTC = 20 Sep 23:00 WIB → masih tanggal 20.
  assert.match(buatKodePengajuan("2026-09-20T16:00:00.000Z", "abc"), /^KOL-20260920-/);
});

test("status baru dan dokumen lama dipetakan ke satu nilai", () => {
  assert.equal(normalisasiStatus("ditindaklanjuti", false), "ditindaklanjuti");
  assert.equal(normalisasiStatus("baru", true), "baru");
  // Dokumen lama hanya punya boolean sudah_dibaca.
  assert.equal(normalisasiStatus(null, false), "baru");
  assert.equal(normalisasiStatus(undefined, true), "dibaca");
  // Nilai asing tidak lolos apa adanya.
  assert.equal(normalisasiStatus("entah", undefined), "baru");
  assert.equal(labelStatus("dibaca"), "Sudah dibaca");
});

test("waktu kirim selalu dibaca dalam WIB", () => {
  const teks = waktuLengkapWib("2026-09-20T16:04:00.000Z");
  assert.match(teks, /2026/);
  assert.match(teks, /September/i);
  assert.match(teks, /WIB$/);
  assert.equal(waktuLengkapWib("bukan-tanggal"), "");
});

test("ringkasan status menghitung dokumen lama dan baru dengan aturan yang sama", () => {
  const ringkas = ringkasStatus([
    { status: "baru", sudah_dibaca: false },
    { status: "ditindaklanjuti", sudah_dibaca: true },
    // Dokumen lama: hanya punya boolean sudah_dibaca.
    { sudah_dibaca: false },
    { sudah_dibaca: true },
  ]);

  assert.deepEqual(ringkas, { baru: 2, dibaca: 1, ditindaklanjuti: 1 });
});

test("ringkasan status kosong tetap punya tiga kunci", () => {
  assert.deepEqual(ringkasStatus([]), { baru: 0, dibaca: 0, ditindaklanjuti: 0 });
});
