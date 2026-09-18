"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Databases, ID, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLL_BERITA } from "@/lib/appwrite/schema";
import type { BeritaDoc } from "@/lib/appwrite/types";
import { logAudit } from "@/lib/appwrite/admin";
import { mediaUrl } from "@/lib/appwrite/media";
import ImagePicker from "@/components/admin/ImagePicker";
import DeleteButton from "@/components/admin/DeleteButton";
import { createBeritaSlug, getBeritaHref } from "@/lib/content-path";
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

const RUBRIK_OPTIONS = [
  { value: "Kegiatan", label: "Kegiatan" },
  { value: "Opini & Teknologi", label: "Opini & Teknologi" },
  { value: "Riset & Akademik", label: "Riset & Akademik" },
  { value: "Warta Himpunan", label: "Warta Himpunan" },
] as const;

type FormState = {
  title: string;
  slug: string;
  section: (typeof RUBRIK_OPTIONS)[number]["value"];
  publishedAt: string;
  readTime: string;
  excerpt: string;
  body: string[];
  image: string;
  author: string;
  sortOrder: number;
  published: boolean;
};

const FORM_KOSONG: FormState = {
  title: "",
  slug: "",
  section: "Kegiatan",
  publishedAt: new Date().toISOString().slice(0, 10),
  readTime: "5 mnt baca",
  excerpt: "",
  body: [""],
  image: "",
  author: "HMTI Margonda",
  sortOrder: 0,
  published: true,
};

export default function AdminBeritaPage() {
  const [items, setItems] = useState<BeritaDoc[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_KOSONG);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const res = await new Databases(getAppwriteClient()).listDocuments<BeritaDoc>(
      APPWRITE_DATABASE_ID,
      COLL_BERITA,
      [Query.orderAsc("sort_order")]
    );
    setItems(res.documents);
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        await muat();
      } catch {
        if (aktif) setError("Gagal memuat data berita.");
      }
    })();
    return () => {
      aktif = false;
    };
  }, [muat]);

  async function simpan(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    const slug = createBeritaSlug(form.slug || form.title);
    if (!slug) {
      setError("Slug harus memuat huruf atau angka.");
      return;
    }
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const data = {
        slug,
        section: form.section,
        title: form.title.trim(),
        published_at: new Date(form.publishedAt).toISOString(),
        read_time: form.readTime.trim() || null,
        excerpt: form.excerpt.trim(),
        body: form.body.map((p) => p.trim()).filter(Boolean),
        image: form.image || null,
        image_alt: form.image ? form.title.trim() : null,
        author: form.author.trim() || null,
        sort_order: Number(form.sortOrder) || 0,
        published: form.published,
      };
      const db = new Databases(getAppwriteClient());
      if (editId) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_BERITA, editId, data);
        await logAudit("Perbarui", "berita", editId, { title: data.title });
        setSukses("Berita diperbarui.");
      } else {
        const doc = await db.createDocument(APPWRITE_DATABASE_ID, COLL_BERITA, ID.unique(), data);
        await logAudit("Buat", "berita", doc.$id, { title: data.title });
        setSukses("Berita dibuat.");
      }
      setForm(FORM_KOSONG);
      setEditId(null);
      await muat();
    } catch {
      setError("Gagal menyimpan berita. Periksa slug agar unik.");
    } finally {
      setSibuk(false);
    }
  }

  async function arsipkan(doc: BeritaDoc, arsip: boolean) {
    const db = new Databases(getAppwriteClient());
    await db.updateDocument(APPWRITE_DATABASE_ID, COLL_BERITA, doc.$id, {
      archived_at: arsip ? new Date().toISOString() : null,
    });
    await logAudit(arsip ? "Arsipkan" : "Pulihkan", "berita", doc.$id, { title: doc.title });
    await muat();
  }

  function mulaiEdit(doc: BeritaDoc) {
    setEditId(doc.$id);
    setForm({
      title: doc.title,
      slug: doc.slug,
      section: (RUBRIK_OPTIONS.some((r) => r.value === doc.section)
        ? doc.section
        : "Kegiatan") as FormState["section"],
      publishedAt: doc.published_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      readTime: doc.read_time ?? "",
      excerpt: doc.excerpt,
      body: doc.body.length ? [...doc.body] : [""],
      image: doc.image ?? "",
      author: doc.author ?? "",
      sortOrder: doc.sort_order,
      published: doc.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 03"
        title="Berita"
        lede="Kelola katalog terbitan. Isi berita berupa paragraf terstruktur (bukan HTML bebas)."
        meta={
          <>
            Portal HMTI Margonda
            <br />
            rute publik /berita
            <Link href="/berita" className="adm-meta-link">
              Buka halaman publik
            </Link>
          </>
        }
      />

      <div className="adm-layout">
        {/* Form */}
        <form onSubmit={simpan} className="adm-panel adm-panel-body space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="adm-panel-title">{editId ? "Ubah Berita" : "Berita Baru"}</h2>
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

          <Field label="Judul">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                  slug: createBeritaSlug(e.target.value),
                })
              }
              placeholder="Judul terbitan…"
              required
            />
          </Field>

          <Field label="Slug" hint="Otomatis dari judul. Ubah bila perlu — harus unik.">
            <input
              className={`${inputCls} font-mono text-[13px]`}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="judul-terbitan"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Rubrik">
              <SelectCustom
                value={form.section}
                options={[...RUBRIK_OPTIONS]}
                onChange={(section) => setForm({ ...form, section })}
                label="Pilih rubrik"
              />
            </Field>
            <Field label="Tanggal terbit">
              <input
                type="date"
                className={inputCls}
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                required
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Durasi baca">
              <input
                className={inputCls}
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                placeholder="5 mnt baca"
              />
            </Field>
            <Field label="Penulis">
              <input
                className={inputCls}
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="HMTI Margonda"
              />
            </Field>
          </div>

          <Field label="Ringkasan" hint="Cuplikan pendek di kartu katalog.">
            <textarea
              className={`${textareaCls} min-h-20`}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Ringkasan satu-dua kalimat…"
              required
            />
          </Field>

          <Field label="Isi (paragraf)" hint="Tiap baris menjadi satu paragraf.">
            <div className="space-y-2">
              {form.body.map((paragraf, i) => (
                <div key={i} className="flex items-start gap-2">
                  <textarea
                    className={`${textareaCls} min-h-20 flex-1`}
                    value={paragraf}
                    onChange={(e) => {
                      const body = [...form.body];
                      body[i] = e.target.value;
                      setForm({ ...form, body });
                    }}
                    placeholder={`Paragraf ${i + 1}…`}
                    required={form.body.length === 1}
                  />
                  {form.body.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, body: form.body.filter((_, j) => j !== i) })
                      }
                      className="adm-btn-ghost adm-btn-ghost--quiet mt-1"
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, body: [...form.body, ""] })}
                className="adm-btn-ghost"
              >
                + Tambah paragraf
              </button>
            </div>
          </Field>

          <Field label="Gambar sampul" hint="Pilih file gambar dari perangkat Anda. File langsung terunggah ke bucket hmti-media.">
            <ImagePicker value={form.image} onChange={(image) => setForm({ ...form, image })} />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Urutan tampil">
              <input
                type="number"
                className={inputCls}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                min={0}
              />
            </Field>
            <div className="flex items-end pb-2">
              <Toggle
                checked={form.published}
                onChange={(published) => setForm({ ...form, published })}
                label="Terbitkan"
              />
            </div>
          </div>

          {error ? <KotakError>{error}</KotakError> : null}
          {sukses ? <KotakSukses>{sukses}</KotakSukses> : null}

          <button type="submit" disabled={sibuk} className="adm-btn">
            {sibuk ? "Menyimpan…" : editId ? "Simpan Perubahan" : "Buat Berita"}
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
                      <p className="truncate text-sm font-semibold text-ink">{doc.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
                        <span className="adm-badge adm-badge--live">{doc.section}</span>
                        <span>{doc.published_at?.slice(0, 10)}</span>
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
                      <Link href={getBeritaHref(doc.slug)} className="adm-btn-ghost">
                        Lihat artikel
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
                      title={doc.title}
                      deskripsi="Artikel akan hilang dari daftar berita dan URL-nya mati."
                      collectionId={COLL_BERITA}
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
                Belum ada berita. Terbitkan yang pertama lewat formulir.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
