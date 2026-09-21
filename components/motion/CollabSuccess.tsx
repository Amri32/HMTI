"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import CollabCourier from "./CollabCourier";
import type { LaporanKolaborasi } from "@/lib/kolaborasi";

// Konfirmasi hanya dirender setelah Appwrite menerima row pengajuan.
// Rincian status dan laporan lengkap ada di panel admin, bukan di sini.

export function CollabSuccessCard({
  laporan,
  onReset,
}: {
  laporan: LaporanKolaborasi;
  onReset: () => void;
}) {
  const reduce = useReducedMotion();
  const judulRef = useRef<HTMLHeadingElement>(null);

  // Fokus dipindah ke judul konfirmasi: pengguna keyboard langsung tahu form
  // sudah berganti keadaan, tanpa kehilangan posisi halaman.
  useEffect(() => {
    judulRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      className="collab-success"
      role="status"
      aria-live="polite"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <CollabCourier />

      <p className="collab-success-kicker">
        <span aria-hidden="true" />
        Tercatat
      </p>
      <h3 className="collab-success-title" tabIndex={-1} ref={judulRef}>
        Pengajuan {laporan.nama ? `dari ${laporan.nama} ` : ""}sudah tercatat.
      </h3>
      <p className="collab-success-body">
        Data <strong>{laporan.jenis}</strong> sudah tersimpan di panel admin HMTI. Pengurus akan
        membalas melalui email Anda.
      </p>

      {/* Nomor referensi: satu klik memilih seluruh kode untuk dicopy saat
          menanyakan status ke pengurus. */}
      <p className="collab-success-ref">
        <span className="collab-success-ref-label">Nomor referensi</span>
        <span className="collab-success-ref-kode">{laporan.kode}</span>
      </p>

      <div className="collab-success-actions">
        <button type="button" className="collab-success-reset" onClick={onReset}>
          Kirim proposal lain
        </button>
      </div>
    </motion.div>
  );
}

export function CollabSuccessToast({
  nama,
  kode,
  onClose,
}: {
  nama: string;
  kode: string;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  // Hilang sendiri, tapi selalu bisa ditutup manual — dan timer dihentikan saat
  // kursor berhenti di atasnya supaya tidak lenyap saat sedang dibaca.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timer.current = setTimeout(onClose, 8000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onClose]);

  return (
    <motion.div
      className="collab-toast"
      role="status"
      aria-live="polite"
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => {
        if (timer.current) clearTimeout(timer.current);
      }}
    >
      <CollabCourier padat />
      <div className="collab-toast-copy">
        <p className="collab-toast-title">Pengajuan tercatat</p>
        <p className="collab-toast-text">
          {`Pengajuan${nama ? ` dari ${nama}` : ""} tersimpan di panel admin HMTI. Nomor referensi ${kode}.`}
        </p>
      </div>
      <button type="button" className="collab-toast-close" onClick={onClose} aria-label="Tutup notifikasi">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <span className="collab-toast-timer" aria-hidden="true" />
    </motion.div>
  );
}
