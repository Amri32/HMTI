import assert from "node:assert/strict";
import test from "node:test";
import {
  halamanTerpopuler,
  jumlahKunjungan,
  jumlahPerangkatUnik,
  kunjunganHarian,
  sebaranPerangkat,
  tanggalLokal,
} from "../lib/analytics.ts";

// Satu catatan = satu halaman yang dibuka. Catatan inilah yang lama dihitung
// mentah sebagai "kunjungan", sehingga satu orang bisa terlihat seperti
// ratusan pengunjung.
function catatan(page, { device = "desktop", visitor, session, at = "2026-09-20T12:00:00.000Z" } = {}) {
  return {
    page,
    device_type: device,
    $createdAt: at,
    visitor_id: visitor,
    session_id: session,
  };
}

test("satu perangkat yang membuka banyak halaman tetap satu kunjungan", () => {
  const views = [
    catatan("/", { visitor: "vid-1", session: "sid-1" }),
    catatan("/tentang", { visitor: "vid-1", session: "sid-1" }),
    catatan("/berita", { visitor: "vid-1", session: "sid-1" }),
    catatan("/proker", { visitor: "vid-1", session: "sid-1" }),
    catatan("/kontak", { visitor: "vid-1", session: "sid-1" }),
  ];

  assert.equal(views.length, 5, "lima catatan halaman");
  assert.equal(jumlahPerangkatUnik(views), 1, "tetap satu perangkat");
  assert.equal(jumlahKunjungan(views), 1, "tetap satu sesi kunjungan");
});

test("perangkat berbeda dihitung terpisah walau beda sesi", () => {
  const views = [
    catatan("/", { visitor: "vid-1", session: "sid-1" }),
    catatan("/", { visitor: "vid-2", session: "sid-2" }),
    // Perangkat yang sama kembali membuka situs di sesi baru → kunjungan baru,
    // tapi tetap satu perangkat.
    catatan("/berita", { visitor: "vid-1", session: "sid-3" }),
  ];

  assert.equal(jumlahPerangkatUnik(views), 2);
  assert.equal(jumlahKunjungan(views), 3);
});

test("sebaran perangkat dihitung per perangkat, bukan per halaman", () => {
  const views = [
    catatan("/", { device: "desktop", visitor: "vid-1", session: "sid-1" }),
    catatan("/berita", { device: "desktop", visitor: "vid-1", session: "sid-1" }),
    catatan("/struktur", { device: "desktop", visitor: "vid-1", session: "sid-1" }),
    catatan("/", { device: "mobile", visitor: "vid-2", session: "sid-2" }),
  ];

  assert.deepEqual(sebaranPerangkat(views), [
    { label: "Desktop", value: 1 },
    { label: "Mobile", value: 1 },
  ]);
});

test("jenis perangkat mengikuti catatan terakhir perangkat itu", () => {
  const views = [
    catatan("/", { device: "mobile", visitor: "vid-1", session: "sid-1", at: "2026-09-19T12:00:00.000Z" }),
    catatan("/", { device: "desktop", visitor: "vid-1", session: "sid-2", at: "2026-09-20T12:00:00.000Z" }),
  ];

  assert.deepEqual(sebaranPerangkat(views), [{ label: "Desktop", value: 1 }]);
});

test("catatan lama tanpa visitor_id jatuh ke sesi, bukan menumpuk jadi satu", () => {
  const views = [
    catatan("/", { visitor: null, session: "sid-lama-1" }),
    catatan("/", { visitor: null, session: "sid-lama-2" }),
    catatan("/", { visitor: null, session: "sid-lama-3" }),
  ];

  assert.equal(jumlahPerangkatUnik(views), 3);
  assert.deepEqual(sebaranPerangkat(views), [{ label: "Desktop", value: 3 }]);
});

test("kunjungan harian memakai tanggal lokal dan mengisi hari kosong", () => {
  const views = [
    catatan("/", { visitor: "vid-1", session: "sid-1", at: "2026-09-20T12:00:00.000Z" }),
    catatan("/berita", { visitor: "vid-1", session: "sid-1", at: "2026-09-20T13:00:00.000Z" }),
    catatan("/", { visitor: "vid-2", session: "sid-2", at: "2026-09-20T13:00:00.000Z" }),
    catatan("/", { visitor: "vid-3", session: "sid-3", at: "2026-09-18T12:00:00.000Z" }),
  ];

  const seri = kunjunganHarian(views, 7, new Date("2026-09-20T12:00:00.000Z"));
  assert.equal(seri.length, 7, "selalu tujuh titik");

  const hariIni = tanggalLokal("2026-09-20T12:00:00.000Z");
  const duaHariLalu = tanggalLokal("2026-09-18T12:00:00.000Z");
  const kemarin = tanggalLokal("2026-09-19T12:00:00.000Z");

  assert.equal(seri.at(-1).date, hariIni, "titik terakhir = hari ini");
  assert.equal(seri.find((t) => t.date === hariIni).count, 2, "dua perangkat berbeda hari ini");
  assert.equal(seri.find((t) => t.date === duaHariLalu).count, 1);
  assert.equal(seri.find((t) => t.date === kemarin).count, 0, "hari kosong tetap 0");
});

test("halaman terpopuler menghitung kunjungan unik per halaman", () => {
  const views = [
    catatan("/", { visitor: "vid-1", session: "sid-1" }),
    catatan("/", { visitor: "vid-1", session: "sid-1" }),
    catatan("/", { visitor: "vid-2", session: "sid-2" }),
    catatan("/berita", { visitor: "vid-1", session: "sid-1" }),
    catatan("/kontak", { visitor: "vid-3", session: "sid-3" }),
  ];

  assert.deepEqual(halamanTerpopuler(views), [
    { page: "/", count: 2 },
    { page: "/berita", count: 1 },
    { page: "/kontak", count: 1 },
  ]);
});

test("tanggalLokal menolak nilai tanggal yang tidak valid", () => {
  assert.equal(tanggalLokal("bukan-tanggal"), "");
});
