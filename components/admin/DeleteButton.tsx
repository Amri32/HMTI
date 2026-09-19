"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Databases } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID } from "@/lib/appwrite/schema";
import { logAudit } from "@/lib/appwrite/admin";
import { deleteMediaFile } from "@/lib/appwrite/media";

// Tombol hapus permanen untuk dokumen admin. Menampilkan dialog konfirmasi
// (ketik HAPUS untuk aktifkan) lalu menghapus dokumen + file storage terkait.
// DeleteButton murni: cocok dipakai di daftar mana pun. DeleteMediaButton
// menerima fileId dan membersihkan bucket hmti-media setelah dokumen hilang.
type ConfirmDeleteDialogProps = {
  label: string;
  deskripsi?: string;
  onCancel: () => void;
  onConfirm: () => void;
  sibuk?: boolean;
};

export function ConfirmDeleteDialog({
  label,
  deskripsi,
  onCancel,
  onConfirm,
  sibuk,
}: ConfirmDeleteDialogProps) {
  const [teks, setTeks] = useState("");
  const tombolRef = useRef<HTMLButtonElement>(null);

  // Dialog hanya di-mount saat terbuka (parent render kondisional), jadi state
  // teks selalu fresh tanpa perlu reset via effect.
  useEffect(() => {
    window.setTimeout(() => tombolRef.current?.focus(), 60);
  }, []);

  return (
    <div className="adm-del-overlay" role="presentation" onClick={sibuk ? undefined : onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-del-title"
        className="adm-del-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="adm-del-title" className="text-sm font-semibold text-ink">
          Hapus permanen?
        </p>
        <p className="adm-del-desc">
          <strong className="text-ink">{label}</strong> akan dihapus selamanya dan tidak bisa
          dikembalikan.
          {deskripsi ? ` ${deskripsi}` : ""}
        </p>
        <label className="adm-del-challenge">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Ketik HAPUS untuk konfirmasi
          </span>
          <input
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="HAPUS"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="adm-del-actions">
          <button type="button" onClick={onCancel} disabled={sibuk} className="adm-btn-ghost">
            Batal
          </button>
          <button
            ref={tombolRef}
            type="button"
            onClick={onConfirm}
            disabled={teks.trim().toUpperCase() !== "HAPUS" || sibuk}
            className="adm-btn adm-btn--danger"
          >
            {sibuk ? "Menghapus…" : "Hapus permanen"}
          </button>
        </div>
      </div>
    </div>
  );
}

type BaseProps = {
  className?: string;
  label?: string;
  title: string;
  deskripsi?: string;
  collectionId: string;
  documentId: string;
  fileId?: string | null;
  onDone: () => Promise<void> | void;
};

export default function DeleteButton({
  className = "adm-btn-ghost adm-btn-ghost--danger",
  label = "Hapus",
  title,
  deskripsi,
  collectionId,
  documentId,
  fileId,
  onDone,
}: BaseProps) {
  const [open, setOpen] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buka = useCallback(() => setOpen(true), []);
  const tutup = useCallback(() => {
    if (!sibuk) setOpen(false);
  }, [sibuk]);

  // Escape menutup dialog (kecuali sedang menghapus).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, tutup]);

  async function hapus() {
    setSibuk(true);
    setError(null);
    try {
      if (fileId) {
        try {
          await deleteMediaFile(fileId);
        } catch {
          // File mungkin sudah tidak ada — dokumen tetap dihapus agar daftar bersih.
        }
      }
      await new Databases(getAppwriteClient()).deleteDocument(
        APPWRITE_DATABASE_ID,
        collectionId,
        documentId
      );
      await logAudit("Hapus permanen", collectionId, documentId, { title });
      await onDone();
      setOpen(false);
    } catch {
      setError("Gagal menghapus. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <>
      <button type="button" onClick={buka} className={className} aria-label={`Hapus ${title}`}>
        {label}
      </button>
      {open ? (
        <ConfirmDeleteDialog
          label={title}
          deskripsi={deskripsi}
          onCancel={tutup}
          onConfirm={hapus}
          sibuk={sibuk}
        />
      ) : error ? (
        <p role="alert" className="adm-alert adm-alert--error mt-2">
          <span>{error}</span>
        </p>
      ) : null}
    </>
  );
}
