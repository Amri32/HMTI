"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Databases, ID, Query } from "appwrite";
import { getAppwriteClient, isAppwriteConfigured } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLL_SITE_SETTINGS } from "@/lib/appwrite/schema";
import type { SiteSettingDoc } from "@/lib/appwrite/types";
import { logAudit } from "@/lib/appwrite/admin";
import { instagramUrl, normalizeInstagramHandle } from "@/lib/social";
import {
  Field,
  inputCls,
  KotakError,
  KotakSukses,
} from "@/components/admin/AdminForm";
import AdmPageHead from "@/components/admin/AdmPageHead";

// Kunci pengaturan yang dikenal. Menambah kanal baru cukup menambah baris di
// sini — koleksinya pasangan kunci-nilai, jadi tidak perlu ubah skema.
const KEY_INSTAGRAM = "instagram";

export default function AdminPengaturanPage() {
  const [doc, setDoc] = useState<SiteSettingDoc | null>(null);
  const [instagram, setInstagram] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const res = await new Databases(getAppwriteClient()).listDocuments<SiteSettingDoc>(
      APPWRITE_DATABASE_ID,
      COLL_SITE_SETTINGS,
      [Query.limit(100)]
    );
    const baris = res.documents.find((d) => d.key === KEY_INSTAGRAM) ?? null;
    setDoc(baris);
    setInstagram(baris?.value ?? "");
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      if (!isAppwriteConfigured()) {
        if (aktif) setError("Appwrite belum dikonfigurasi — pengaturan tidak bisa dimuat atau disimpan.");
        return;
      }
      try {
        await muat();
      } catch {
        if (aktif) {
          setError(
            "Gagal memuat pengaturan. Pastikan koleksi site_settings sudah dibuat (scripts/appwrite-setup.mjs)."
          );
        }
      }
    })();
    return () => {
      aktif = false;
    };
  }, [muat]);

  const handleRapi = normalizeInstagramHandle(instagram);
  const tautanPratinjau = handleRapi ? instagramUrl(handleRapi) : null;

  async function simpan(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    // Nilai apa pun yang tersimpan akan dipakai membentuk tautan publik, jadi
    // handle tidak valid ditolak sebelum menulis — bukan dibersihkan diam-diam.
    if (instagram.trim() && !handleRapi) {
      setError(
        "Handle Instagram tidak valid. Pakai huruf, angka, titik, atau garis bawah (maks 30 karakter)."
      );
      setSukses(null);
      return;
    }
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const db = new Databases(getAppwriteClient());
      const value = handleRapi ?? "";
      if (doc) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_SITE_SETTINGS, doc.$id, { value });
        await logAudit("Perbarui", "site_settings", doc.$id, { key: KEY_INSTAGRAM });
      } else {
        await db.createDocument(APPWRITE_DATABASE_ID, COLL_SITE_SETTINGS, ID.unique(), {
          key: KEY_INSTAGRAM,
          value,
        });
        await logAudit("Buat", "site_settings", undefined, { key: KEY_INSTAGRAM });
      }
      setSukses(
        value
          ? `Handle @${value} disimpan dan langsung tampil di footer situs.`
          : "Handle dikosongkan — ikon Instagram disembunyikan dari situs."
      );
      await muat();
    } catch {
      setError("Gagal menyimpan pengaturan.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 08"
        title="Pengaturan"
        lede="Kanal resmi situs. Handle Instagram di halaman ini yang tampil sebagai ikon di footer setiap halaman publik."
        meta={
          <>
            Portal HMTI Margonda
            <br />
            tampil di footer situs
            <Link href="/" className="adm-meta-link">
              Buka beranda
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

      <form onSubmit={simpan} className="adm-panel adm-panel-body mt-8 max-w-2xl space-y-5">
        <h2 className="adm-panel-title">Instagram</h2>
        <Field
          label="Handle atau tautan profil"
          hint="Boleh ditulis @namainstagram, namainstagram, atau tempel URL profilnya."
        >
          <input
            className={inputCls}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@namainstagram"
            autoComplete="off"
          />
        </Field>
        <p className="adm-hint">
          {tautanPratinjau ? (
            <>
              Pratinjau tautan:{" "}
              <a href={tautanPratinjau} target="_blank" rel="noreferrer noopener">
                {tautanPratinjau}
              </a>
            </>
          ) : (
            "Kosongkan kolom untuk menyembunyikan ikon Instagram dari situs."
          )}
        </p>
        <button type="submit" disabled={sibuk} className="adm-btn">
          {sibuk ? "Menyimpan…" : "Simpan"}
        </button>
      </form>
    </div>
  );
}
