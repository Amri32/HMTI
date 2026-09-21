"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Databases, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLL_COLLAB_MESSAGES } from "@/lib/appwrite/schema";
import type { CollabMessageDoc } from "@/lib/appwrite/types";
import {
  OPSI_STATUS_KOLABORASI,
  STATUS_KOLABORASI,
  URUTAN_STATUS,
  buatKodePengajuan,
  ringkasStatus,
  type StatusKolaborasi,
} from "@/lib/kolaborasi";
import { SelectCustom, inputCls } from "@/components/admin/AdminForm";
import AdmPageHead from "@/components/admin/AdmPageHead";
import {
  LaporanKolaborasiItem,
  LaporanKolaborasiSheet,
  kodePengajuan,
  statusPengajuan,
} from "@/components/admin/LaporanKolaborasi";

// Laporan pengajuan kolaborasi — modul tersendiri, bukan lagi bagian dashboard.
//
// Halaman ini adalah arsip kerja pengurus: setiap pengajuan tampil sebagai
// laporan lengkap (nomor referensi, identitas, isi, status, catatan internal),
// bisa dicari dan disaring, lalu dicetak menjadi PDF A4 lewat dialog cetak
// browser (tanpa pustaka PDF tambahan dan tanpa font yang harus ditanam).

type Saringan = "semua" | StatusKolaborasi;

// Referensi kosong yang stabil: dipakai sebelum data selesai dimuat supaya
// memo di bawah tidak dihitung ulang setiap render.
const TANPA_PENGAJUAN: CollabMessageDoc[] = [];

const PILIHAN_SARING: { value: Saringan; label: string }[] = [
  { value: "semua", label: "Semua status" },
  ...OPSI_STATUS_KOLABORASI,
];

async function fetchPengajuan(): Promise<{ dokumen: CollabMessageDoc[]; total: number }> {
  // Konsisten dengan halaman admin lain (Databases.listDocuments) — tipe
  // CollabMessageDoc ditulis untuk bentuk Models.Document, bukan Models.Row.
  //
  // Appwrite membatasi listDocuments maksimal 100 baris per permintaan, jadi
  // arsip diambil per halaman sampai habis (orderDesc tetap stabil karena
  // baris baru selalu masuk di ujung depan halaman pertama, tidak menggeser
  // halaman berikutnya yang sudah terambil... kecuali ada pengajuan baru saat
  // pengambilan berjalan — dampaknya hanya urutan tampil, bukan kehilangan
  // data, karena loop berhenti berdasarkan res.total).
  const db = new Databases(getAppwriteClient());
  const dokumen: CollabMessageDoc[] = [];
  let total = 0;
  const BATAS_HALAMAN = 20; // pengaman: 20 × 100 = 2.000 pengajuan terbaru
  for (let halaman = 0; halaman < BATAS_HALAMAN; halaman += 1) {
    const res = await db.listDocuments<CollabMessageDoc>(
      APPWRITE_DATABASE_ID,
      COLL_COLLAB_MESSAGES,
      [Query.orderDesc("$createdAt"), Query.limit(100), Query.offset(halaman * 100)]
    );
    total = res.total;
    dokumen.push(...res.documents);
    if (res.documents.length === 0 || dokumen.length >= total) break;
  }
  return { dokumen, total };
}

async function simpanStatus(id: string, status: StatusKolaborasi): Promise<void> {
  await new Databases(getAppwriteClient()).updateDocument(
    APPWRITE_DATABASE_ID,
    COLL_COLLAB_MESSAGES,
    id,
    { status, sudah_dibaca: status !== "baru" }
  );
}

async function simpanCatatan(id: string, catatan: string): Promise<void> {
  await new Databases(getAppwriteClient()).updateDocument(
    APPWRITE_DATABASE_ID,
    COLL_COLLAB_MESSAGES,
    id,
    { catatan: catatan || null }
  );
}

export default function AdminKolaborasiPage() {
  const [pengajuan, setPengajuan] = useState<CollabMessageDoc[] | null>(null);
  // Total sebenarnya dari Appwrite — bisa lebih besar dari array termuat bila
  // arsip melebihi batas pengaman pengambilan di fetchPengajuan.
  const [totalPengajuan, setTotalPengajuan] = useState(0);
  const [gagal, setGagal] = useState(false);
  const [saringan, setSaringan] = useState<Saringan>("semua");
  const [kataKunci, setKataKunci] = useState("");
  const [draftCatatan, setDraftCatatan] = useState<Record<string, string>>({});
  const [catatanSibuk, setCatatanSibuk] = useState<string | null>(null);
  const [catatanHasil, setCatatanHasil] = useState<Record<string, "sukses" | "gagal">>({});

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const hasil = await fetchPengajuan();
        if (!aktif) return;
        setPengajuan(hasil.dokumen);
        setTotalPengajuan(hasil.total);
      } catch {
        if (aktif) setGagal(true);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  const daftar = pengajuan ?? TANPA_PENGAJUAN;

  // Pencarian mencakup nomor referensi juga, supaya pengurus bisa langsung
  // menempelkan kode yang disebut pengaju.
  const tersaring = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return daftar.filter((item) => {
      if (saringan !== "semua" && statusPengajuan(item) !== saringan) return false;
      if (!kunci) return true;
      return [
        kodePengajuan(item),
        item.nama,
        item.email,
        item.jenis,
        item.pesan,
        item.catatan ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(kunci);
    });
  }, [daftar, saringan, kataKunci]);

  const ringkasan = useMemo(() => ringkasStatus(daftar), [daftar]);

  // Antrean cetak: null = ikut hasil saringan (perilaku Ctrl+P biasa).
  const [antreanCetak, setAntreanCetak] = useState<CollabMessageDoc[] | null>(null);
  const [mencetak, setMencetak] = useState(false);
  // Cap waktu dicatat saat tombol cetak ditekan — itu jalur resmi yang dipakai
  // pengurus, jadi lembar PDF selalu menyebut waktu pembuatannya.
  const [waktuCetak, setWaktuCetak] = useState<Date>(() => new Date());
  const judulAsal = useRef<string>("");

  const berkasCetak = antreanCetak ?? tersaring;

  // Lembar A4 dirender lebih dulu, baru dialog cetak dibuka. Judul dokumen
  // ditukar sementara supaya nama berkas PDF bawaan browser sudah rapi.
  useEffect(() => {
    if (!mencetak) return;
    const rangka = requestAnimationFrame(() => {
      const asal = judulAsal.current || document.title;
      judulAsal.current = asal;
      document.title =
        berkasCetak.length === 1
          ? `Laporan kolaborasi ${buatKodePengajuan(berkasCetak[0].$createdAt, berkasCetak[0].$id)}`
          : `Laporan kolaborasi HMTI (${berkasCetak.length} pengajuan)`;
      window.print();
      document.title = asal;
      setMencetak(false);
    });
    return () => cancelAnimationFrame(rangka);
  }, [mencetak, berkasCetak]);

  function cetak(berkas: CollabMessageDoc[] | null) {
    if (berkas && berkas.length === 0) return;
    setAntreanCetak(berkas);
    setWaktuCetak(new Date());
    setMencetak(true);
  }

  async function ubahStatus(id: string, status: StatusKolaborasi) {
    const sebelum = pengajuan;
    setPengajuan(
      (daftarKini) =>
        daftarKini?.map((item) =>
          item.$id === id ? { ...item, status, sudah_dibaca: status !== "baru" } : item
        ) ?? null
    );
    try {
      await simpanStatus(id, status);
    } catch {
      setPengajuan(sebelum);
    }
  }

  async function simpanCatatanItem(id: string) {
    const isi = (draftCatatan[id] ?? "").trim();
    setCatatanSibuk(id);
    try {
      await simpanCatatan(id, isi);
      setPengajuan(
        (daftarKini) =>
          daftarKini?.map((item) => (item.$id === id ? { ...item, catatan: isi || null } : item)) ??
          null
      );
      setDraftCatatan((draft) => {
        const salinan = { ...draft };
        delete salinan[id];
        return salinan;
      });
      setCatatanHasil((hasil) => ({ ...hasil, [id]: "sukses" }));
      setTimeout(() => {
        setCatatanHasil((hasil) => {
          const salinan = { ...hasil };
          delete salinan[id];
          return salinan;
        });
      }, 2600);
    } catch {
      setCatatanHasil((hasil) => ({ ...hasil, [id]: "gagal" }));
    } finally {
      setCatatanSibuk(null);
    }
  }

  return (
    <div className="adm-page">
      <div className="lpr-screen">
        <AdmPageHead
          kicker="Modul 09 · Kotak masuk"
          title="Laporan kolaborasi"
          lede="Semua pengajuan dari halaman kontak, lengkap dengan nomor referensi yang sama seperti yang diterima pengaju. Ubah status tindak lanjut, catat hasilnya, lalu cetak laporannya jadi PDF."
          meta={
            <>
              Portal HMTI Margonda
              <br />
              {totalPengajuan > daftar.length
                ? `${daftar.length} dari ${totalPengajuan} pengajuan dimuat`
                : `${daftar.length} pengajuan tersimpan`}
            </>
          }
        />

        <section className="lpr-ringkas" aria-label="Ringkasan status pengajuan">
          <div className="lpr-ringkas-kartu">
            <span className="lpr-ringkas-label">Total pengajuan</span>
            <span className="lpr-ringkas-angka">{totalPengajuan}</span>
          </div>
          {URUTAN_STATUS.map((status) => (
            <div key={status} className="lpr-ringkas-kartu" data-status={status}>
              <span className="lpr-ringkas-label">{STATUS_KOLABORASI[status].label}</span>
              <span className="lpr-ringkas-angka">{ringkasan[status]}</span>
            </div>
          ))}
        </section>

        <div className="lpr-toolbar">
          <label className="lpr-tool lpr-tool--cari">
            <span className="lpr-tool-label">Cari pengajuan</span>
            <input
              className={inputCls}
              type="search"
              value={kataKunci}
              placeholder="Nomor referensi, nama, email, isi pesan…"
              onChange={(event) => setKataKunci(event.target.value)}
            />
          </label>
          <label className="lpr-tool">
            <span className="lpr-tool-label">Saring status</span>
            <SelectCustom<Saringan>
              value={saringan}
              options={PILIHAN_SARING}
              onChange={setSaringan}
              label="Saring laporan berdasarkan status"
            />
          </label>
          <div className="lpr-tool lpr-tool--aksi">
            <span className="lpr-tool-label">Arsip PDF</span>
            <button
              type="button"
              className="adm-btn"
              onClick={() => cetak(null)}
              disabled={tersaring.length === 0}
            >
              Cetak semua hasil saring ({tersaring.length}
              {totalPengajuan > daftar.length ? " termuat" : ""})
            </button>
          </div>
        </div>

        {gagal ? (
          <p role="alert" className="adm-alert adm-alert--error mt-8">
            <span>Gagal memuat pengajuan — periksa koneksi dan permission Appwrite.</span>
          </p>
        ) : pengajuan === null ? (
          <p className="lpr-kosong">Memuat pengajuan…</p>
        ) : tersaring.length === 0 ? (
          <p className="lpr-kosong">
            {daftar.length === 0
              ? "Belum ada pengajuan kolaborasi. Kiriman dari halaman kontak akan muncul di sini."
              : "Tidak ada pengajuan yang cocok dengan pencarian atau saringan ini."}
          </p>
        ) : (
          <div className="lpr-daftar">
            {tersaring.map((item) => (
              <LaporanKolaborasiItem
                key={item.$id}
                laporan={item}
                draftCatatan={draftCatatan[item.$id] ?? item.catatan ?? ""}
                sibukCatatan={catatanSibuk === item.$id}
                hasilCatatan={catatanHasil[item.$id]}
                onUbahStatus={(status) => ubahStatus(item.$id, status)}
                onUbahDraftCatatan={(nilai) =>
                  setDraftCatatan((draft) => ({ ...draft, [item.$id]: nilai }))
                }
                onSimpanCatatan={() => simpanCatatanItem(item.$id)}
                onCetak={() => cetak([item])}
              />
            ))}
          </div>
        )}

        <p className="lpr-catatan-cetak">
          Tombol cetak membuka dialog cetak browser — pilih &ldquo;Simpan sebagai PDF&rdquo; untuk
          mengarsipkan. Lembar cetak memuat identitas organisasi, rincian pengajuan, tangga status,
          catatan internal, dan kolom disposisi tanda tangan.
        </p>
      </div>

      {/* Lembar A4: tersembunyi di layar, hanya tampil saat dicetak. */}
      <div className="lpr-print" aria-hidden="true">
        {berkasCetak.length === 0 ? (
          <p className="lpr-sheet-kosong">
            Tidak ada pengajuan pada saringan ini, jadi tidak ada laporan untuk dicetak.
          </p>
        ) : (
          berkasCetak.map((item) => (
            <LaporanKolaborasiSheet key={item.$id} laporan={item} dicetakPada={waktuCetak} />
          ))
        )}
      </div>
    </div>
  );
}
