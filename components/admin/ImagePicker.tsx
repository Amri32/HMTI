"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ID, Storage } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_BUCKET_ID } from "@/lib/appwrite/schema";
import { mediaUrl } from "@/lib/appwrite/media";
import {
  IMAGE_SIZE_LIMIT,
  cekFileGambar,
  cekHasilKompresi,
  kompresGambar,
  formatUkuran,
} from "@/lib/image-compress";

// Input gambar dari perangkat admin: pilih file lokal → kompres otomatis di
// browser (resize + WebP, biasanya dari MB-an jadi ratusan KB) → unggah ke
// bucket hmti-media → fileId disimpan ke dokumen.
export default function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (fileId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [namaFile, setNamaFile] = useState<string | null>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoKompresi, setInfoKompresi] = useState<string | null>(null);

  async function pilihFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const gagal = cekFileGambar(file);
    if (gagal) {
      setError(gagal);
      e.target.value = "";
      return;
    }
    setMengunggah(true);
    setError(null);
    setInfoKompresi(null);
    try {
      const { file: finalFile, dikompresi, ukuranAwal, ukuranAkhir } = await kompresGambar(file);
      const melebihiBatas = cekHasilKompresi(finalFile);
      if (melebihiBatas) {
        setError(melebihiBatas);
        return;
      }
      if (dikompresi) {
        setInfoKompresi(
          `Dikompresi otomatis: ${formatUkuran(ukuranAwal)} → ${formatUkuran(ukuranAkhir)}`
        );
      }
      const res = await new Storage(getAppwriteClient()).createFile(
        APPWRITE_BUCKET_ID,
        ID.unique(),
        finalFile
      );
      setNamaFile(res.name);
      onChange(res.$id);
    } catch {
      setError("Gagal mengunggah gambar. Periksa koneksi lalu coba lagi.");
    } finally {
      setMengunggah(false);
      e.target.value = "";
    }
  }

  function hapusGambar() {
    setNamaFile(null);
    setInfoKompresi(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (value) {
    return (
      <div className="adm-image-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mediaUrl(value)} alt={namaFile ?? "Gambar terpilih"} className="adm-image-preview-img" />
        <div className="adm-image-preview-info">
          <p className="truncate text-[12px] font-semibold text-ink">{namaFile ?? "Gambar tersimpan"}</p>
          <p className="text-[11px] text-ink-muted">
            {infoKompresi ?? "Terunggah ke bucket hmti-media"}
          </p>
        </div>
        <button type="button" onClick={hapusGambar} className="adm-btn-ghost adm-btn-ghost--quiet">
          Ganti / Hapus
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="adm-dropzone">
        <span className="adm-dropzone-icon" aria-hidden="true">
          ↑
        </span>
        <span className="text-sm font-semibold text-ink">
          {mengunggah ? "Mengompres & mengunggah…" : "Pilih gambar dari perangkat"}
        </span>
        <span className="text-[12px] text-ink-muted">
          JPG, PNG, WebP, GIF, AVIF · tersimpan maks {formatUkuran(IMAGE_SIZE_LIMIT)} · dikompresi
          otomatis
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={pilihFile}
          disabled={mengunggah}
        />
      </label>
      {error ? (
        <p role="alert" className="adm-alert adm-alert--error mt-2">
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
