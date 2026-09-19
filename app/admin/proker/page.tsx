"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Databases, ID, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import {
  APPWRITE_DATABASE_ID,
  COLL_PROKER,
} from "@/lib/appwrite/schema";
import type { ProkerDoc } from "@/lib/appwrite/types";
import { logAudit } from "@/lib/appwrite/admin";
import { mediaUrl } from "@/lib/appwrite/media";
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
};

const FORM_KOSONG: FormState = {
  name: "",
  status: "Direncanakan",
  description: "",
  image: "",
  sortOrder: 0,
  published: true,
};

export default function AdminProkerPage() {
  const [items, setItems] = useState<ProkerDoc[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_KOSONG);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

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
      };
      if (editId) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_PROKER, editId, data);
        await logAudit("Perbarui", "proker", editId, { name: data.name });
        setSukses("Program kerja diperbarui.");
      } else {
        const doc = await db.createDocument(APPWRITE_DATABASE_ID, COLL_PROKER, ID.unique(), data);
        await logAudit("Buat", "proker", doc.$id, { name: data.name });
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 02"
        title="Program Kerja"
        lede="Kelola program kerja himpunan. Perubahan langsung tampil di halaman publik /proker."
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

          <Field label="Status">
            <SelectCustom
              value={form.status}
              options={[...STATUS_OPTIONS]}
              onChange={(status) => setForm({ ...form, status })}
              label="Pilih status"
            />
          </Field>

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
