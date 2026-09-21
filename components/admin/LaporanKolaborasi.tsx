"use client";

import type { CollabMessageDoc } from "@/lib/appwrite/types";
import {
  STATUS_KOLABORASI,
  URUTAN_STATUS,
  buatKodePengajuan,
  labelStatus,
  normalisasiStatus,
  waktuLengkapWib,
  type StatusKolaborasi,
} from "@/lib/kolaborasi";
import { SelectCustom, textareaCls } from "@/components/admin/AdminForm";

// Dua wajah dari data pengajuan yang sama:
//   LaporanKolaborasiItem → kartu laporan di layar admin (ubah status + catatan)
//   LaporanKolaborasiSheet → halaman A4 untuk dijadikan PDF lewat dialog cetak
//
// Keduanya memakai nomor referensi, waktu WIB, dan status yang sama, jadi
// berkas PDF yang diarsipkan pengurus persis mencerminkan yang dipegang pengaju.

export function kodePengajuan(dokumen: CollabMessageDoc): string {
  return buatKodePengajuan(dokumen.$createdAt, dokumen.$id);
}

export function statusPengajuan(dokumen: CollabMessageDoc): StatusKolaborasi {
  return normalisasiStatus(dokumen.status, dokumen.sudah_dibaca);
}

function LabelSeksi({ children, catatan }: { children: string; catatan?: string }) {
  return (
    <h3 className="lpr-label">
      {children}
      {catatan ? <span>{catatan}</span> : null}
    </h3>
  );
}

export function LaporanKolaborasiItem({
  laporan,
  draftCatatan,
  sibukCatatan,
  hasilCatatan,
  onUbahStatus,
  onUbahDraftCatatan,
  onSimpanCatatan,
  onCetak,
}: {
  laporan: CollabMessageDoc;
  draftCatatan: string;
  sibukCatatan: boolean;
  hasilCatatan?: "sukses" | "gagal";
  onUbahStatus: (status: StatusKolaborasi) => void;
  onUbahDraftCatatan: (nilai: string) => void;
  onSimpanCatatan: () => void;
  onCetak: () => void;
}) {
  const status = statusPengajuan(laporan);
  const kode = kodePengajuan(laporan);

  return (
    <article className="lpr-item" data-status={status}>
      <header className="lpr-item-head">
        <div className="lpr-item-id">
          <p className="lpr-kode">{kode}</p>
          <p className="lpr-waktu">Dikirim {waktuLengkapWib(laporan.$createdAt)}</p>
        </div>
        <div className="lpr-item-tools">
          <label className="lpr-tool">
            <span className="lpr-tool-label">Status tindak lanjut</span>
            <SelectCustom<StatusKolaborasi>
              value={status}
              options={URUTAN_STATUS.map((s) => ({ value: s, label: labelStatus(s) }))}
              onChange={onUbahStatus}
              label={`Status tindak lanjut untuk ${laporan.nama}`}
            />
          </label>
          <button type="button" className="adm-btn-ghost" onClick={onCetak}>
            Cetak / PDF
          </button>
        </div>
      </header>

      <div className="lpr-item-body">
        <section className="lpr-section">
          <LabelSeksi>Identitas pengaju</LabelSeksi>
          <dl className="lpr-facts">
            <div>
              <dt>Nama / instansi</dt>
              <dd>{laporan.nama}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${laporan.email}`}>{laporan.email}</a>
              </dd>
            </div>
            <div>
              <dt>Jenis kolaborasi</dt>
              <dd>{laporan.jenis}</dd>
            </div>
          </dl>
        </section>

        <section className="lpr-section">
          <LabelSeksi>Isi pengajuan</LabelSeksi>
          <blockquote className="lpr-pesan">
            <p>{laporan.pesan}</p>
          </blockquote>
        </section>

        <section className="lpr-section">
          <LabelSeksi catatan="tidak terlihat pengaju">Catatan internal tindak lanjut</LabelSeksi>
          <textarea
            className={textareaCls}
            rows={3}
            placeholder="Hasil rapat, kontak balasan, keputusan pengurus…"
            value={draftCatatan}
            onChange={(event) => onUbahDraftCatatan(event.target.value)}
            aria-label={`Catatan internal untuk ${laporan.nama}`}
          />
          <div className="lpr-note-foot">
            <button
              type="button"
              className="adm-btn"
              onClick={onSimpanCatatan}
              disabled={sibukCatatan}
            >
              {sibukCatatan ? "Menyimpan…" : "Simpan catatan"}
            </button>
            {hasilCatatan === "sukses" ? (
              <span className="lpr-note-state" role="status">
                Catatan tersimpan
              </span>
            ) : null}
            {hasilCatatan === "gagal" ? (
              <span className="lpr-note-state" data-gagal="true" role="alert">
                Gagal menyimpan catatan
              </span>
            ) : null}
          </div>
        </section>
      </div>
    </article>
  );
}

// Lembar A4. Semua angka tetap (mm/pt) karena halaman cetak tidak ikut
// menyesuaikan diri seperti layar.
export function LaporanKolaborasiSheet({
  laporan,
  dicetakPada,
}: {
  laporan: CollabMessageDoc;
  dicetakPada: Date;
}) {
  const status = statusPengajuan(laporan);
  const kode = kodePengajuan(laporan);
  const catatan = laporan.catatan?.trim();

  return (
    <section className="lpr-sheet" aria-label={`Laporan ${kode}`}>
      <header className="lpr-sheet-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lpr-sheet-logo" src="/hmti.png" alt="" />
        <div className="lpr-sheet-org">
          <p className="lpr-sheet-org-name">Himpunan Mahasiswa Teknologi Informasi</p>
          <p className="lpr-sheet-org-sub">Universitas Bina Sarana Informatika — Kampus Margonda</p>
          <p className="lpr-sheet-org-sub">hmti.ubsi.margonda@gmail.com</p>
        </div>
        <div className="lpr-sheet-doc">
          <p className="lpr-sheet-doc-title">Laporan pengajuan kolaborasi</p>
          <p className="lpr-sheet-doc-kode">{kode}</p>
        </div>
      </header>

      <table className="lpr-sheet-meta">
        <tbody>
          <tr>
            <th scope="row">Status tindak lanjut</th>
            <td>{labelStatus(status)}</td>
            <th scope="row">Waktu kirim</th>
            <td>{waktuLengkapWib(laporan.$createdAt)}</td>
          </tr>
          <tr>
            <th scope="row">Jenis kolaborasi</th>
            <td>{laporan.jenis}</td>
            <th scope="row">Dicetak</th>
            <td>{waktuLengkapWib(dicetakPada.toISOString())}</td>
          </tr>
          <tr>
            <th scope="row">Nama / instansi</th>
            <td>{laporan.nama}</td>
            <th scope="row">Email pengaju</th>
            <td>{laporan.email}</td>
          </tr>
        </tbody>
      </table>

      <div className="lpr-sheet-block">
        <h2>Rincian pengajuan</h2>
        <p className="lpr-sheet-pesan">{laporan.pesan}</p>
      </div>

      <div className="lpr-sheet-block">
        <h2>Status tindak lanjut</h2>
        <ol className="lpr-sheet-steps">
          {URUTAN_STATUS.map((langkah) => (
            <li
              key={langkah}
              data-aktif={URUTAN_STATUS.indexOf(langkah) <= URUTAN_STATUS.indexOf(status) || undefined}
            >
              <span className="lpr-sheet-step-label">{labelStatus(langkah)}</span>
              <span className="lpr-sheet-step-note">{STATUS_KOLABORASI[langkah].keterangan}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="lpr-sheet-block">
        <h2>Catatan internal pengurus</h2>
        <p className="lpr-sheet-catatan">{catatan || "Belum ada catatan."}</p>
        <p className="lpr-sheet-legend">
          Kolom ini hanya untuk pengurus HMTI dan tidak ditampilkan pada laporan yang diterima
          pengaju.
        </p>
      </div>

      <div className="lpr-sheet-sign">
        <div>
          <p>Disposisi pengurus</p>
          <span className="lpr-sheet-sign-line" aria-hidden="true" />
          <p>Nama &amp; tanggal</p>
        </div>
        <div>
          <p>Nomor arsip</p>
          <span className="lpr-sheet-sign-line" aria-hidden="true" />
          <p>Diisi sekretariat</p>
        </div>
      </div>

      <footer className="lpr-sheet-foot">
        <span>HMTI UBSI Margonda — laporan pengajuan kolaborasi</span>
        <span>{kode}</span>
      </footer>
    </section>
  );
}
