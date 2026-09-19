"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Databases, ID, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLL_VISI_MISI } from "@/lib/appwrite/schema";
import type { VisiMisiDoc } from "@/lib/appwrite/types";
import { logAudit } from "@/lib/appwrite/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  Field,
  inputCls,
  textareaCls,
  KotakError,
  KotakSukses,
} from "@/components/admin/AdminForm";
import AdmPageHead from "@/components/admin/AdmPageHead";

export default function AdminVisiMisiPage() {
  const [rows, setRows] = useState<VisiMisiDoc[]>([]);
  const [visi, setVisi] = useState("");
  const [misiBaru, setMisiBaru] = useState({ title: "", text: "" });
  const [editMisi, setEditMisi] = useState<VisiMisiDoc | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const res = await new Databases(getAppwriteClient()).listDocuments<VisiMisiDoc>(
      APPWRITE_DATABASE_ID,
      COLL_VISI_MISI,
      [Query.orderAsc("sort_order")]
    );
    setRows(res.documents);
    const visiRow = res.documents.find((r) => r.type === "vision" && !r.archived_at);
    setVisi(visiRow?.text ?? "");
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        await muat();
      } catch {
        if (aktif) setError("Gagal memuat visi & misi.");
      }
    })();
    return () => {
      aktif = false;
    };
  }, [muat]);

  async function simpanVisi(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const db = new Databases(getAppwriteClient());
      const text = visi.trim();
      const ada = rows.find((r) => r.type === "vision");
      if (ada) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_VISI_MISI, ada.$id, { text });
        await logAudit("Perbarui", "visi_misi", ada.$id);
      } else {
        await db.createDocument(APPWRITE_DATABASE_ID, COLL_VISI_MISI, ID.unique(), {
          type: "vision",
          title: null,
          text,
          sort_order: 1,
          published: true,
          archived_at: null,
        });
        await logAudit("Buat", "visi_misi");
      }
      setSukses("Visi disimpan.");
      await muat();
    } catch {
      setError("Gagal menyimpan visi.");
    } finally {
      setSibuk(false);
    }
  }

  async function simpanMisi(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const db = new Databases(getAppwriteClient());
      const data = {
        title: (editMisi ? editMisi.title : misiBaru.title)?.trim() ?? "",
        text: (editMisi ? editMisi.text : misiBaru.text).trim(),
      };
      if (editMisi) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_VISI_MISI, editMisi.$id, data);
        await logAudit("Perbarui", "visi_misi", editMisi.$id);
        setSukses("Misi diperbarui.");
      } else {
        const maxSort = rows
          .filter((r) => r.type === "mission")
          .reduce((maks, r) => Math.max(maks, r.sort_order), 0);
        await db.createDocument(APPWRITE_DATABASE_ID, COLL_VISI_MISI, ID.unique(), {
          type: "mission",
          ...data,
          sort_order: maxSort + 1,
          published: true,
          archived_at: null,
        });
        await logAudit("Buat", "visi_misi");
        setSukses("Misi ditambahkan.");
      }
      setMisiBaru({ title: "", text: "" });
      setEditMisi(null);
      await muat();
    } catch {
      setError("Gagal menyimpan misi.");
    } finally {
      setSibuk(false);
    }
  }

  async function toggleMisi(doc: VisiMisiDoc) {
    const db = new Databases(getAppwriteClient());
    await db.updateDocument(APPWRITE_DATABASE_ID, COLL_VISI_MISI, doc.$id, {
      published: !doc.published,
    });
    await logAudit(doc.published ? "Tarik terbit" : "Terbitkan", "visi_misi", doc.$id);
    await muat();
  }

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 05"
        title="Visi & Misi"
        lede="Visi tunggal dan daftar misi yang tampil di halaman /visi-misi."
        meta={
          <>
            Portal HMTI Margonda
            <br />
            rute publik /visi-misi
            <Link href="/visi-misi" className="adm-meta-link">
              Buka halaman publik
            </Link>
          </>
        }
      />

      {error ? (
        <div className="mt-6">
          <KotakError>{error}</KotakError>
        </div>
      ) : null}
      {sukses ? (
        <div className="mt-6">
          <KotakSukses>{sukses}</KotakSukses>
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Visi */}
        <form onSubmit={simpanVisi} className="adm-panel adm-panel-body h-fit space-y-5">
          <h2 className="adm-panel-title">Visi</h2>
          <Field label="Teks visi">
            <textarea
              className={`${textareaCls} min-h-32`}
              value={visi}
              onChange={(e) => setVisi(e.target.value)}
              required
            />
          </Field>
          <button type="submit" disabled={sibuk} className="adm-btn">
            {sibuk ? "Menyimpan…" : "Simpan Visi"}
          </button>
        </form>

        {/* Misi */}
        <div>
          <form onSubmit={simpanMisi} className="adm-panel adm-panel-body space-y-4">
            <h2 className="adm-panel-title">{editMisi ? "Ubah Misi" : "Tambah Misi"}</h2>
            {editMisi ? (
              <button type="button" onClick={() => setEditMisi(null)} className="adm-cancel">
                Batal ubah
              </button>
            ) : null}
            <Field label="Judul singkat">
              <input
                className={inputCls}
                value={editMisi ? editMisi.title ?? "" : misiBaru.title}
                onChange={(e) =>
                  editMisi
                    ? setEditMisi({ ...editMisi, title: e.target.value })
                    : setMisiBaru({ ...misiBaru, title: e.target.value })
                }
                placeholder="cth. Kerja yang berdampak"
                required
              />
            </Field>
            <Field label="Isi misi">
              <textarea
                className={`${textareaCls} min-h-24`}
                value={editMisi ? editMisi.text : misiBaru.text}
                onChange={(e) =>
                  editMisi
                    ? setEditMisi({ ...editMisi, text: e.target.value })
                    : setMisiBaru({ ...misiBaru, text: e.target.value })
                }
                required
              />
            </Field>
            <button type="submit" disabled={sibuk} className="adm-btn">
              {sibuk ? "Menyimpan…" : editMisi ? "Simpan Perubahan" : "Tambah Misi"}
            </button>
          </form>

          <ul className="adm-list mt-6">
            {rows
              .filter((r) => r.type === "mission")
              .map((doc) => (
                <li
                  key={doc.$id}
                  className={`adm-row ${!doc.published ? "adm-row--archived" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        {doc.title}
                        <span
                          className={`adm-badge ${doc.published ? "adm-badge--live" : "adm-badge--draft"}`}
                        >
                          {doc.published ? "Tayang" : "Draf"}
                        </span>
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-ink-muted">{doc.text}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => setEditMisi(doc)} className="adm-btn-ghost">
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMisi(doc)}
                        className="adm-btn-ghost adm-btn-ghost--quiet"
                      >
                        {doc.published ? "Tarik terbit" : "Terbitkan"}
                      </button>
                      <DeleteButton
                        title={doc.title ?? "Misi"}
                        deskripsi="Misi akan hilang dari halaman Visi & Misi publik."
                        collectionId={COLL_VISI_MISI}
                        documentId={doc.$id}
                        onDone={muat}
                      />
                    </div>
                  </div>
                </li>
              ))}
            {rows.filter((r) => r.type === "mission").length === 0 ? (
              <li className="adm-empty">
                <span className="adm-empty-mono">Kosong</span>
                Belum ada misi.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
