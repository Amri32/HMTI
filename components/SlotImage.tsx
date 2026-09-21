"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getContentRepository, type SiteImage } from "@/lib/content-repo";
import { siteImageSlots } from "@/app/site-content";
import { isAppwriteConfigured } from "@/lib/appwrite/client";

// Cek umur cache dipindah ke effect: Date.now() di badan komponen melanggar
// aturan kemurnian render React (react-hooks/purity). Nilai cacheSegar saat
// mount diambil dari lazy initializer useState, yang boleh impure.
function cacheSegarSekarang(): boolean {
  return (
    appwriteAktif && !!cacheTerakhir && Date.now() - cachePadaWaktu < USIA_CACHE_MAX
  );
}

// Satu request dibagi oleh komponen yang mount bersamaan. Hasil terakhir
// diingkat di level module: kunjungan ulang (pindah halaman lalu kembali)
// merender gambar final sejak render pertama, tanpa jendela kosong. Cache
// berumur pendek supaya perubahan dari panel admin tetap terbaca setelah
// cache kedaluwarsa.
let inFlight: Promise<Record<string, SiteImage>> | null = null;
let cacheTerakhir: Record<string, SiteImage> | null = null;
let cachePadaWaktu = 0;
const USIA_CACHE_MAX = 60_000;

// Tanpa Appwrite, fallback statis adalah data final, bukan placeholder.
const appwriteAktif = isAppwriteConfigured();

// URL slot yang sudah dikirim ke cache browser. Preload dijalankan sekali per
// URL begitu slot ter-resolve: klik tab berikutnya tidak menunggu unduhan,
// jadi transisi panel selalu menemukan foto final yang siap tampil.
const sudahDimuat = new Set<string>();
function praMuatGambar(url: string) {
  if (!url || sudahDimuat.has(url)) return;
  sudahDimuat.add(url);
  const img = new window.Image();
  img.src = url;
}

// URL gambar slot (home-community, proker-website, dst). Fallback sementara
// ke path lokal site-content sampai data Appwrite ter-resolve (atau gagal).
//
// `sedangMemutuskan` true selama fetch slot berjalan. Pemakai memakai ini untuk
// menahan render <img>: tanpa itu, gambar fallback statis sempat terlihat
// beberapa ratus milidetik sebelum gambar asli dari panel Media menggantikannya
// (flash ganti gambar saat halaman dibuka).
export function useSiteImage(slot: string): SiteImage & { sedangMemutuskan: boolean } {
  const fallbackSlot = siteImageSlots[slot as keyof typeof siteImageSlots];
  const fallback = useMemo<SiteImage>(
    () => ({
      key: slot,
      url: fallbackSlot?.path ?? "",
      alt: fallbackSlot?.alt ?? "",
      caption: fallbackSlot?.caption ?? "",
    }),
    [fallbackSlot, slot]
  );
  // Hasil cache dianggap keputusan final: tanpa fase menunggu lagi, tidak ada
  // jendela swap sama sekali pada kunjungan ulang dalam 60 detik terakhir.
  const [image, setImage] = useState<SiteImage>(
    () =>
      cacheSegarSekarang() ? cacheTerakhir![slot] ?? fallback : fallback
  );
  // Mulai true hanya bila Appwrite aktif dan tidak ada cache segar; kalau
  // tidak, sumber awal sudah final.
  const [sedangMemutuskan, setSedangMemutuskan] = useState(() => {
    if (!appwriteAktif) return false;
    return !cacheSegarSekarang();
  });

  useEffect(() => {
    if (!appwriteAktif) return;
    let aktif = true;
    inFlight ??= getContentRepository()
      .getSiteImages()
      .catch(() => {
        return {};
      })
      .finally(() => {
        inFlight = null;
      });
    void inFlight.then((imgs) => {
      if (!aktif) return;
      cacheTerakhir = imgs;
      cachePadaWaktu = Date.now();
      // Slot yang belum didaftarkan admin tetap jatuh ke fallback, tapi
      // keputusannya sudah final: tidak ada lagi fase "menunggu".
      const keputusan = imgs[slot] ?? fallback;
      praMuatGambar(keputusan.url);
      setImage(keputusan);
      setSedangMemutuskan(false);
    });
    return () => {
      aktif = false;
    };
  }, [fallback, slot]);

  return { ...image, sedangMemutuskan };
}

// <img> untuk slot Media dengan fade-in saat gambar benar-benar termuat
// (bukan saat URL-nya dipasang). Bidang tetap berlatar solid sampai foto siap,
// jadi pengguna melihat bidang kosong netral — bukan foto lama yang berkedip
// lalu diganti, dan bukan lompatan layout.
export function SlotImageImg({
  image,
  sizes,
  priority = false,
  altFallback,
  onImageLoad,
}: {
  image: SiteImage & { sedangMemutuskan: boolean };
  sizes: string;
  priority?: boolean;
  altFallback: string;
  // Dipakai pemakai yang butuh dimensi asli foto (mis. bidang yang mengikuti
  // rasio foto itu sendiri, bukan rasio tetap milik section). Dipanggil sekali
  // saat foto benar-benar termuat, dengan elemen <img> hasil render.
  onImageLoad?: (el: HTMLImageElement) => void;
}) {
  const [termuat, setTermuat] = useState(false);
  return (
    <Image
      src={image.url}
      alt={image.alt || altFallback}
      fill
      sizes={sizes}
      priority={priority || undefined}
      className={termuat ? "slot-img-loaded" : undefined}
      onLoad={(event) => {
        setTermuat(true);
        onImageLoad?.(event.currentTarget);
      }}
      onError={() => setTermuat(true)}
    />
  );
}
