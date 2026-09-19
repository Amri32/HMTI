"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Databases, ID, Query, Storage } from "appwrite";
import { motion, useReducedMotion } from "motion/react";
import { getAppwriteClient } from "@/lib/appwrite/client";
import {
  APPWRITE_BUCKET_ID,
  APPWRITE_DATABASE_ID,
  COLL_MEDIA_LIBRARY,
  COLL_SITE_IMAGES,
} from "@/lib/appwrite/schema";
import type { MediaDoc, SiteImageDoc } from "@/lib/appwrite/types";
import { logAudit } from "@/lib/appwrite/admin";
import { deleteMediaFile, mediaUrl } from "@/lib/appwrite/media";
import {
  IMAGE_SIZE_LIMIT,
  cekFileGambar,
  cekHasilKompresi,
  kompresGambar,
  formatUkuran,
} from "@/lib/image-compress";
import { ConfirmDeleteDialog } from "@/components/admin/DeleteButton";
import { KotakError, KotakSukses } from "@/components/admin/AdminForm";
import AdmPageHead from "@/components/admin/AdmPageHead";
import { slotMeta } from "@/lib/appwrite/slot-meta";

// ── Kelompok halaman untuk daftar slot ─────────────────────────────────────

type HalamanGroup = { page: string; pageLabel: string; slots: SiteImageDoc[] };

// Slot dikelompokkan per halaman publik (urutan kemunculan pertama) agar admin
// langsung melihat "gambar di halaman X" tanpa menebak key mentah. Slot tanpa
// pemakaian publik (dipakai: false) disembunyikan — mengubahnya tidak berpengaruh.
function kelompokkanPerHalaman(slots: SiteImageDoc[]): HalamanGroup[] {
  const map = new Map<string, SiteImageDoc[]>();
  for (const s of slots) {
    const meta = slotMeta(s.key);
    if (meta.dipakai === false) continue;
    const list = map.get(meta.page) ?? [];
    list.push(s);
    map.set(meta.page, list);
  }
  return Array.from(map.entries()).map(([page, slotList]) => ({
    page,
    pageLabel: slotMeta(slotList[0].key).pageLabel,
    slots: slotList,
  }));
}

export default function AdminMediaPage() {
  const reduce = useReducedMotion();
  const [media, setMedia] = useState<MediaDoc[]>([]);
  const [slots, setSlots] = useState<SiteImageDoc[]>([]);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const [hapusTarget, setHapusTarget] = useState<MediaDoc | null>(null);
  const [hapusSibuk, setHapusSibuk] = useState(false);
  // Slot yang sedang diproses — busy state per kartu, bukan global.
  const [slotAktif, setSlotAktif] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const db = new Databases(getAppwriteClient());
    const [m, s] = await Promise.all([
      db.listDocuments<MediaDoc>(APPWRITE_DATABASE_ID, COLL_MEDIA_LIBRARY, [
        Query.orderDesc("$createdAt"),
      ]),
      db.listDocuments<SiteImageDoc>(APPWRITE_DATABASE_ID, COLL_SITE_IMAGES, [
        Query.orderAsc("key"),
      ]),
    ]);
    setMedia(m.documents);
    setSlots(s.documents);
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        await muat();
      } catch {
        if (aktif) setError("Gagal memuat media.");
      }
    })();
    return () => {
      aktif = false;
    };
  }, [muat]);

  // ── Alur utama: ganti gambar slot langsung dari kartu (satu langkah) ─────

  async function gantiGambarSlot(e: ChangeEvent<HTMLInputElement>, slot: SiteImageDoc) {
    const file = e.target.files?.[0];
    if (!file) return;
    const gagal = cekFileGambar(file);
    if (gagal) {
      setError(gagal);
      e.target.value = "";
      return;
    }
    setSibuk(true);
    setError(null);
    setSukses(null);
    setSlotAktif(slot.$id);
    const meta = slotMeta(slot.key);
    try {
      // Kompresi otomatis di browser: foto kamera/HP jadi WebP jauh lebih kecil.
      const { file: finalFile, dikompresi, ukuranAwal, ukuranAkhir } = await kompresGambar(file);
      const melebihiBatas = cekHasilKompresi(finalFile);
      if (melebihiBatas) {
        setError(melebihiBatas);
        return;
      }
      const client = getAppwriteClient();
      const res = await new Storage(client).createFile(APPWRITE_BUCKET_ID, ID.unique(), finalFile);
      await new Databases(client).updateDocument(APPWRITE_DATABASE_ID, COLL_SITE_IMAGES, slot.$id, {
        file_path: res.$id,
        alt_text: slot.alt_text?.trim() || meta.label,
        caption: slot.caption ?? "",
      });
      await logAudit("Perbarui", "site_images", slot.$id, {
        key: slot.key,
        dari: slot.file_path,
        ke: res.$id,
        file: res.name,
      });
      setSukses(
        `${meta.label} berhasil diganti${dikompresi ? ` (dikompresi ${formatUkuran(ukuranAwal)} → ${formatUkuran(ukuranAkhir)})` : ""}.`
      );
      await muat();
    } catch {
      setError("Gagal mengunggah gambar. Periksa koneksi lalu coba lagi.");
    } finally {
      setSibuk(false);
      setSlotAktif(null);
      e.target.value = "";
    }
  }

  // ── Pustaka media lepas: unggah, arsip, hapus permanen ──────────────────

  async function unggahMediaLepas(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const gagal = cekFileGambar(file);
    if (gagal) {
      setError(gagal);
      e.target.value = "";
      return;
    }
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const { file: finalFile, dikompresi } = await kompresGambar(file);
      const melebihiBatas = cekHasilKompresi(finalFile);
      if (melebihiBatas) {
        setError(melebihiBatas);
        return;
      }
      const client = getAppwriteClient();
      const res = await new Storage(client).createFile(APPWRITE_BUCKET_ID, ID.unique(), finalFile);
      await new Databases(client).createDocument(
        APPWRITE_DATABASE_ID,
        COLL_MEDIA_LIBRARY,
        ID.unique(),
        {
          file_path: res.$id,
          file_name: res.name,
          mime_type: finalFile.type || null,
          size_bytes: finalFile.size,
          alt_text: null,
          caption: null,
          archived_at: null,
          created_by: null,
        }
      );
      await logAudit("Unggah", "media", res.$id, { name: res.name });
      setSukses(
        dikompresi
          ? `Berhasil mengunggah ${res.name} (terkompresi otomatis).`
          : `Berhasil mengunggah ${res.name}.`
      );
      await muat();
    } catch {
      setError("Gagal mengunggah file. Periksa ukuran/format.");
    } finally {
      setSibuk(false);
      e.target.value = "";
    }
  }

  async function arsipMedia(doc: MediaDoc, arsip: boolean) {
    await new Databases(getAppwriteClient()).updateDocument(
      APPWRITE_DATABASE_ID,
      COLL_MEDIA_LIBRARY,
      doc.$id,
      { archived_at: arsip ? new Date().toISOString() : null }
    );
    await logAudit(arsip ? "Arsipkan" : "Pulihkan", "media", doc.$id);
    await muat();
  }

  // Hapus permanen: file bucket + dokumen media_library sekalian.
  // Bila file masih dipakai slot gambar halaman, admin diberi tahu agar tidak
  // heran gambar halaman tiba-tiba kosong/rusak.
  async function hapusMediaPermanen() {
    if (!hapusTarget) return;
    const dipakaiSlot = slots.find((s) => s.file_path === hapusTarget.file_path);
    setHapusSibuk(true);
    setError(null);
    try {
      try {
        await deleteMediaFile(hapusTarget.file_path);
      } catch {
        // File mungkin sudah tidak ada — dokumen tetap dibersihkan.
      }
      if (dipakaiSlot) {
        setError(
          `${hapusTarget.file_name} terhapus, tetapi file ini masih dipakai slot “${slotMeta(dipakaiSlot.key).label}”. Ganti gambarnya agar halaman tidak menampilkan gambar rusak.`
        );
      }
      await new Databases(getAppwriteClient()).deleteDocument(
        APPWRITE_DATABASE_ID,
        COLL_MEDIA_LIBRARY,
        hapusTarget.$id
      );
      await logAudit("Hapus permanen", "media", hapusTarget.$id, {
        title: hapusTarget.file_name,
        dipakai_slot: dipakaiSlot?.key ?? null,
      });
      if (!dipakaiSlot) setSukses(`${hapusTarget.file_name} dihapus permanen.`);
      setHapusTarget(null);
      await muat();
    } catch {
      setError("Gagal menghapus media. Coba lagi.");
    } finally {
      setHapusSibuk(false);
    }
  }

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 06"
        title="Media"
        lede="Klik Ganti gambar pada gambar yang ingin diubah, pilih file baru, selesai. Perubahan langsung tampil di halaman publik."
        meta={
          <>
            Portal HMTI Margonda
            <br />
            bucket hmti-media
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

      {/* Peta modul gambar: slot situs di sini, sisanya di modul kontennya. */}
      <div className="adm-media-map mt-8">
        <p className="adm-media-map-title">Di mana gambar dikelola?</p>
        <ul className="adm-media-map-list">
          <li>
            <span>Beranda &amp; Tentang</span>
            <strong>di halaman ini</strong>
          </li>
          <li>
            <span>Program Kerja</span>
            <Link href="/admin/proker">modul Program Kerja</Link>
          </li>
          <li>
            <span>Berita</span>
            <Link href="/admin/berita">modul Berita</Link>
          </li>
        </ul>
      </div>

      <div className="adm-media-layout mt-6">
        {/* Kolom kiri: gambar per halaman (slot situs) */}
        <section aria-label="Gambar halaman situs">
          <div className="adm-section-head">
            <h2 className="adm-section-title">Gambar Halaman</h2>
            <span className="adm-section-count">{slots.length} slot</span>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-ink-muted">
            Klik “Ganti gambar”, pilih file dari perangkat. Tersimpan maksimal{" "}
            {formatUkuran(IMAGE_SIZE_LIMIT)} — foto besar dikompresi otomatis.
          </p>

          <div className="mt-4 space-y-8">
          {kelompokkanPerHalaman(slots).map((group) => (
            <section key={group.page} aria-label={`Gambar halaman ${group.pageLabel}`}>
              <div className="adm-slot-group-head">
                <h3 className="adm-slot-group-title">{group.pageLabel}</h3>
                <Link href={group.page} className="adm-slot-public-link">
                  Lihat halaman ↗
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {group.slots.map((slot, i) => {
                  const meta = slotMeta(slot.key);
                  return (
                    <motion.li
                      key={slot.$id}
                      className="adm-panel adm-panel-body"
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }
                      }
                    >
                      <p className="text-[13px] font-semibold text-ink">{meta.label}</p>
                      {meta.deskripsi ? (
                        <p className="mt-0.5 text-[11px] leading-5 text-ink-muted">{meta.deskripsi}</p>
                      ) : null}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl(slot.file_path)}
                        alt={slot.alt_text ?? meta.label}
                        className="adm-media-slot-img mt-3"
                      />
                      <label
                        className={`adm-btn adm-btn-file mt-3 ${slotAktif === slot.$id ? "is-busy" : ""}`}
                      >
                        {slotAktif === slot.$id ? "Memproses…" : "Ganti gambar"}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => gantiGambarSlot(e, slot)}
                          disabled={sibuk}
                        />
                      </label>
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ))}
          {slots.length === 0 ? (
            <p className="adm-empty">
              <span className="adm-empty-mono">Kosong</span>
              Belum ada slot gambar. Jalankan skrip setup Appwrite terlebih dahulu.
            </p>
          ) : null}
          </div>
        </section>

        {/* Kolom kanan: pustaka media lepas */}
        <aside aria-label="Pustaka media">
          <div className="adm-section-head">
            <h2 className="adm-section-title">Pustaka Media</h2>
            <span className="adm-section-count">{media.length} file</span>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-ink-muted">
            Penyimpanan file lepas. Menghapus file di sini tidak mengubah gambar halaman.
          </p>
        <label className="adm-dropzone mt-4">
          <span className="adm-dropzone-icon" aria-hidden="true">
            ↑
          </span>
          <span className="text-sm font-semibold text-ink">
            {sibuk ? "Mengunggah…" : "Pilih file gambar"}
          </span>
          <span className="text-[12px] text-ink-muted">
            JPG, PNG, WebP, GIF, AVIF · tersimpan maks {formatUkuran(IMAGE_SIZE_LIMIT)} · dikompresi
            otomatis
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={unggahMediaLepas}
            disabled={sibuk}
          />
        </label>

        <ul className="adm-media-grid mt-6">
          {media.map((doc, i) => {
            const arsip = Boolean(doc.archived_at);
            return (
              <motion.li
                key={doc.$id}
                className={`adm-media-card ${arsip ? "adm-media-card--archived" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(doc.file_path)} alt={doc.alt_text ?? doc.file_name} />
                <p className="mt-2 truncate px-0.5 text-[12px] font-medium text-ink">{doc.file_name}</p>
                <p className="truncate px-0.5 text-[11px] text-ink-muted">{doc.mime_type ?? "—"}</p>
                <button
                  type="button"
                  onClick={() => arsipMedia(doc, !arsip)}
                  className="adm-btn-ghost adm-btn-ghost--quiet mt-2 w-full"
                >
                  {arsip ? "Pulihkan" : "Arsipkan"}
                </button>
                <button
                  type="button"
                  onClick={() => setHapusTarget(doc)}
                  className="adm-btn-ghost adm-btn-ghost--danger mt-2 w-full"
                >
                  Hapus permanen
                </button>
              </motion.li>
            );
          })}
          {media.length === 0 ? (
            <li className="adm-empty col-span-2 sm:col-span-3">
              <span className="adm-empty-mono">Kosong</span>
              Belum ada media. Unggah gambar di atas.
            </li>
          ) : null}
        </ul>
        </aside>
      </div>

      {hapusTarget ? (
        <ConfirmDeleteDialog
          label={hapusTarget.file_name}
          deskripsi={
            slots.some((s) => s.file_path === hapusTarget.file_path)
              ? "PERINGATAN: file ini masih dipakai gambar halaman. File di bucket hmti-media juga akan dihapus."
              : "File di bucket hmti-media juga dihapus."
          }
          sibuk={hapusSibuk}
          onCancel={() => (hapusSibuk ? undefined : setHapusTarget(null))}
          onConfirm={hapusMediaPermanen}
        />
      ) : null}
    </div>
  );
}
