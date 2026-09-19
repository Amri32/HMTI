"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Databases, ID, Query, Storage } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import {
  APPWRITE_BUCKET_ID,
  APPWRITE_DATABASE_ID,
  COLL_PROKER,
} from "@/lib/appwrite/schema";
import type { ProkerDoc } from "@/lib/appwrite/types";
import { logAudit } from "@/lib/appwrite/admin";
import { mediaUrl } from "@/lib/appwrite/media";
import {
  cekFileGambar,
  cekHasilKompresi,
  kompresGambar,
} from "@/lib/image-compress";
import ImagePicker from "@/components/admin/ImagePicker";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  Field,
  inputCls,
  textareaCls,
  KotakError,
  KotakSukses,
  SelectCustom,
  Toggle,
} from "@/components/admin/AdminForm";
import AdmPageHead from "@/components/admin/AdmPageHead";

const STATUS_OPTIONS = [
  { value: "Sedang berjalan", label: "Sedang berjalan" },
  { value: "Direncanakan", label: "Direncanakan" },
  { value: "Selesai", label: "Selesai" },
] as const;

type FormState = {
  name: string;
  status: (typeof STATUS_OPTIONS)[number]["value"];
  description: string;
  image: string;
  sortOrder: number;
  published: boolean;
  // Slug URL (detail proker selesai: /proker/detail?slug=...). Diisi otomatis
  // dari nama bila dibiarkan kosong.
  slug: string;
  // Detail penyelesaian — tampil di form saat status "Selesai".
  completedAt: string; // yyyy-MM-dd dari input date
  eventTime: string;
  location: string;
  mapsUrl: string;
  dresscode: string;
  announcementNote: string; // kutipan arsip pengumuman (verbatim)
  outcome: string; // hasil & evaluasi pasca-kegiatan
  documentation: string[]; // fileId dokumentasi, urut tampil
};

const FORM_KOSONG: FormState = {
  name: "",
  status: "Direncanakan",
  description: "",
  image: "",
  sortOrder: 0,
  published: true,
  slug: "",
  completedAt: "",
  eventTime: "",
  location: "",
  mapsUrl: "",
  dresscode: "",
  announcementNote: "",
  outcome: "",
  documentation: [],
};

// "Bakti Sosial Panti Asuhan!" → "bakti-sosial-panti-asuhan"
function slugify(teks: string): string {
  return teks
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// Input <input type="date"> memberi "2026-08-29"; Appwrite datetime menerima
// ISO penuh — samakan format dengan seed ("…T00:00:00.000Z").
function tanggalKeIso(tanggal: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return null;
  return new Date(`${tanggal}T00:00:00.000Z`).toISOString();
}

function isoKeTanggal(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export default function AdminProkerPage() {
  const [items, setItems] = useState<ProkerDoc[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_KOSONG);
  const [sibuk, setSibuk] = useState(false);
  const [dokumenBusy, setDokumenBusy] = useState(false);
  const [dokumenError, setDokumenError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const selesai = form.status === "Selesai";

  const muat = useCallback(async () => {
    const db = new Databases(getAppwriteClient());
    const res = await db.listDocuments<ProkerDoc>(APPWRITE_DATABASE_ID, COLL_PROKER, [
      Query.orderAsc("sort_order"),
    ]);
    setItems(res.documents);
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        await muat();
      } catch {
        if (aktif) setError("Gagal memuat data proker.");
      }
    })();
    return () => {
      aktif = false;
    };
  }, [muat]);

  async function simpan(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    if (selesai && !form.completedAt) {
      setError("Tanggal selesai wajib diisi untuk program berstatus Selesai.");
      return;
    }
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const db = new Databases(getAppwriteClient());
      const data = {
        name: form.name.trim(),
        status: form.status,
        description: form.description.trim(),
        image: form.image || null,
        image_alt: form.image ? `Preview program kerja ${form.name.trim()}` : null,
        sort_order: Number(form.sortOrder) || 0,
        published: form.published,
        slug: slugify(form.slug || form.name),
        // Status bukan "Selesai" → fakta penyelesaian dikosongkan agar tidak
        // ada sisa data lama yang tampil bila status berubah lagi nanti.
        completed_at: selesai ? tanggalKeIso(form.completedAt) : null,
        event_time: selesai ? form.eventTime.trim() || null : null,
        location: selesai ? form.location.trim() || null : null,
        maps_url: selesai ? form.mapsUrl.trim() || null : null,
        dresscode: selesai ? form.dresscode.trim() || null : null,
        announcement_note: selesai ? form.announcementNote.trim() || null : null,
        outcome: selesai ? form.outcome.trim() || null : null,
        documentation: selesai ? form.documentation : [],
      };
      if (editId) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_PROKER, editId, data);
        await logAudit("Perbarui", "proker", editId, { name: data.name, status: data.status });
        setSukses("Program kerja diperbarui.");
      } else {
        const doc = await db.createDocument(APPWRITE_DATABASE_ID, COLL_PROKER, ID.unique(), data);
        await logAudit("Buat", "proker", doc.$id, { name: data.name, status: data.status });
        setSukses("Program kerja dibuat.");
      }
      setForm(FORM_KOSONG);
      setEditId(null);
      await muat();
    } catch {
      setError("Gagal menyimpan program kerja.");
    } finally {
      setSibuk(false);
    }
  }

  // Unggah banyak foto dokumentasi sekaligus: kompres per file di browser,
  // simpan fileId ke array form (disimpan ke dokumen saat tombol Simpan).
  async function tambahDokumentasi(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0 || dokumenBusy) return;
    setDokumenBusy(true);
    setDokumenError(null);
    try {
      const storage = new Storage(getAppwriteClient());
      const ids: string[] = [];
      for (const file of files) {
        const gagal = cekFileGambar(file);
        if (gagal) {
          setDokumenError(`${file.name}: ${gagal}`);
          continue;
        }
        const { file: finalFile } = await kompresGambar(file);
        const melebihiBatas = cekHasilKompresi(finalFile);
        if (melebihiBatas) {
          setDokumenError(`${file.name}: ${melebihiBatas}`);
          continue;
        }
        const res = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), finalFile);
        ids.push(res.$id);
      }
      if (ids.length > 0) {
        setForm((f) => ({ ...f, documentation: [...f.documentation, ...ids] }));
      }
    } catch {
      setDokumenError("Gagal mengunggah dokumentasi. Periksa koneksi lalu coba lagi.");
    } finally {
      setDokumenBusy(false);
    }
  }

  async function arsipkan(doc: ProkerDoc, arsip: boolean) {
    const db = new Databases(getAppwriteClient());
    await db.updateDocument(APPWRITE_DATABASE_ID, COLL_PROKER, doc.$id, {
      archived_at: arsip ? new Date().toISOString() : null,
    });
    await logAudit(arsip ? "Arsipkan" : "Pulihkan", "proker", doc.$id, { name: doc.name });
    await muat();
  }

  function mulaiEdit(doc: ProkerDoc) {
    setEditId(doc.$id);
    setForm({
      name: doc.name,
      status: (STATUS_OPTIONS.some((s) => s.value === doc.status) ? doc.status : "Direncanakan") as FormState["status"],
      description: doc.description,
      image: doc.image ?? "",
      sortOrder: doc.sort_order,
      published: doc.published,
      slug: doc.slug ?? "",
      completedAt: isoKeTanggal(doc.completed_at),
      eventTime: doc.event_time ?? "",
      location: doc.location ?? "",
      mapsUrl: doc.maps_url ?? "",
      dresscode: doc.dresscode ?? "",
      announcementNote: doc.announcement_note ?? "",
      outcome: doc.outcome ?? "",
      documentation: doc.documentation ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 02"
        title="Program Kerja"
        lede="Kelola program kerja himpunan. Program berstatus Selesai mendapat halaman detail publik."
        meta={
          <>
            Portal HMTI Margonda
            <br />
            rute publik /proker
            <Link href="/proker" className="adm-meta-link">
              Buka halaman publik
            </Link>
          </>
        }
      />

      <div className="adm-layout">
        {/* Form */}
        <form onSubmit={simpan} className="adm-panel adm-panel-body space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="adm-panel-title">
              {editId ? "Ubah Program Kerja" : "Program Kerja Baru"}
            </h2>
            {editId ? (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm(FORM_KOSONG);
                }}
                className="adm-cancel"
              >
                Batal
              </button>
            ) : null}
          </div>

          <Field label="Nama program kerja">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="cth. Bakti Sosial Panti Asuhan"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Status">
              <SelectCustom
                value={form.status}
                options={[...STATUS_OPTIONS]}
                onChange={(status) => setForm({ ...form, status })}
                label="Pilih status"
              />
            </Field>
            <Field label="Urutan tampil">
              <input
                type="number"
                className={inputCls}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                min={0}
              />
            </Field>
          </div>

          <Field label="Deskripsi" hint="Teks terstruktur (paragraf), bukan HTML.">
            <textarea
              className={`${textareaCls} min-h-28`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan tujuan dan ruang lingkup program kerja…"
              required
            />
          </Field>

          <Field label="Gambar program kerja" hint="Pilih file gambar dari perangkat Anda. File langsung terunggah ke bucket hmti-media.">
            <ImagePicker value={form.image} onChange={(image) => setForm({ ...form, image })} />
          </Field>

          <Toggle
            checked={form.published}
            onChange={(published) => setForm({ ...form, published })}
            label="Terbitkan"
          />

          {/* ── Detail penyelesaian: hanya relevan untuk program Selesai ── */}
          {selesai ? (
            <fieldset className="adm-panel adm-panel-body space-y-5 border border-dashed border-[var(--color-hairline)]">
              <legend className="px-2 text-sm font-bold uppercase tracking-[0.08em] text-ink">
                Detail penyelesaian
              </legend>
              <p className="adm-hint">
                Data ini tampil di halaman detail publik <code>/proker/detail?slug=…</code>. Bagian
                yang dikosongkan tidak dirender di halaman — isi yang tersedia saja.
              </p>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Tanggal selesai *">
                  <input
                    type="date"
                    className={inputCls}
                    value={form.completedAt}
                    onChange={(e) => setForm({ ...form, completedAt: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Waktu" hint="cth. 09.00">
                  <input
                    className={inputCls}
                    value={form.eventTime}
                    onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                    placeholder="09.00"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Titik kumpul / lokasi">
                  <input
                    className={inputCls}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="cth. Taman Merdeka"
                  />
                </Field>
                <Field label="Dresscode">
                  <input
                    className={inputCls}
                    value={form.dresscode}
                    onChange={(e) => setForm({ ...form, dresscode: e.target.value })}
                    placeholder="cth. PDH HMTI"
                  />
                </Field>
              </div>

              <Field label="Link Google Maps" hint="Tautan lokasi; kosongkan bila tidak ada.">
                <input
                  type="url"
                  className={inputCls}
                  value={form.mapsUrl}
                  onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/…"
                />
              </Field>

              <Field
                label="Arsip pengumuman"
                hint="Teks pengumuman pelaksanaan apa adanya; ditampilkan sebagai kutipan arsip."
              >
                <textarea
                  className={`${textareaCls} min-h-28`}
                  value={form.announcementNote}
                  onChange={(e) => setForm({ ...form, announcementNote: e.target.value })}
                  placeholder="Tempel teks pengumuman yang dulu dikirim ke anggota…"
                />
              </Field>

              <Field label="Hasil & evaluasi" hint="Ringkasan outcome kegiatan; bagian paling bernilai untuk arsip organisasi.">
                <textarea
                  className={`${textareaCls} min-h-28`}
                  value={form.outcome}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                  placeholder="Tuliskan hasil kegiatan setelah pelaksanaan…"
                />
              </Field>

              <Field
                label="Dokumentasi foto"
                hint="Bisa pilih beberapa file sekaligus; dikompresi otomatis. Tekan Simpan untuk menyimpan urutan ini."
              >
                <div className="space-y-3">
                  {form.documentation.length > 0 ? (
                    <ul className="flex flex-wrap gap-3">
                      {form.documentation.map((fileId, i) => (
                        <li key={fileId} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaUrl(fileId, 160)}
                            alt={`Dokumentasi ${i + 1}`}
                            className="h-20 w-28 border border-[var(--color-hairline)] object-cover"
                          />
                          <button
                            type="button"
                            aria-label={`Hapus dokumentasi ${i + 1}`}
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                documentation: f.documentation.filter((id) => id !== fileId),
                              }))
                            }
                            className="absolute -right-2 -top-2 h-6 w-6 border border-[var(--color-hairline)] bg-surface text-[12px] font-bold text-ink hover:bg-ink hover:text-surface"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <label className="adm-dropzone">
                    <span className="adm-dropzone-icon" aria-hidden="true">
                      ↑
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {dokumenBusy ? "Mengompres & mengunggah…" : "Pilih foto dokumentasi"}
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      JPG, PNG, WebP · beberapa file sekaligus
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={tambahDokumentasi}
                      disabled={dokumenBusy}
                    />
                  </label>
                  {dokumenError ? (
                    <p role="alert" className="adm-alert adm-alert--error">
                      <span>{dokumenError}</span>
                    </p>
                  ) : null}
                </div>
              </Field>
            </fieldset>
          ) : null}

          {error ? <KotakError>{error}</KotakError> : null}
          {sukses ? <KotakSukses>{sukses}</KotakSukses> : null}

          <button
            type="submit"
            disabled={sibuk}
            className="adm-btn"
          >
            {sibuk ? "Menyimpan…" : editId ? "Simpan Perubahan" : "Buat Program Kerja"}
          </button>
        </form>

        {/* Daftar */}
        <div>
          <div className="adm-section-head">
            <h2 className="adm-section-title">Daftar</h2>
            <span className="adm-section-count">{items.length} entri</span>
          </div>
          <ul className="adm-list mt-4">
            {items.map((doc) => {
              const arsip = Boolean(doc.archived_at);
              const urlDetail = `/proker/detail?slug=${encodeURIComponent(doc.slug || doc.$id)}`;
              return (
                <li key={doc.$id} className={`adm-row ${arsip ? "adm-row--archived" : ""}`}>
                  <div className="flex items-start gap-3">
                    {doc.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(doc.image)} alt="" className="adm-thumb" />
                    ) : (
                      <span className="adm-thumb">
                        <span className="adm-thumb-label">Tanpa</span>
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{doc.name}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
                        <span className="adm-badge adm-badge--live">{doc.status}</span>
                        <span>urutan {doc.sort_order}</span>
                        {!doc.published ? <span className="adm-badge adm-badge--draft">Draf</span> : null}
                        {arsip ? <span className="adm-badge adm-badge--archived">Arsip</span> : null}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => mulaiEdit(doc)} className="adm-btn-ghost">
                      Ubah
                    </button>
                    {doc.published && !arsip ? (
                      <Link href="/proker" className="adm-btn-ghost">
                        Lihat halaman
                      </Link>
                    ) : null}
                    {doc.published && doc.status === "Selesai" ? (
                      <Link href={urlDetail} className="adm-btn-ghost">
                        Lihat detail
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => arsipkan(doc, !arsip)}
                      className="adm-btn-ghost adm-btn-ghost--quiet"
                    >
                      {arsip ? "Pulihkan" : "Arsipkan"}
                    </button>
                    <DeleteButton
                      title={doc.name}
                      deskripsi="Program akan hilang dari halaman publik /proker dan beranda."
                      collectionId={COLL_PROKER}
                      documentId={doc.$id}
                      fileId={doc.image}
                      onDone={muat}
                    />
                  </div>
                </li>
              );
            })}
            {items.length === 0 ? (
              <li className="adm-empty">
                <span className="adm-empty-mono">Kosong</span>
                Belum ada program kerja. Buat yang pertama lewat formulir.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
