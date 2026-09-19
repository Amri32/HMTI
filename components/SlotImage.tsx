"use client";

import { useEffect, useMemo, useState } from "react";
import { getContentRepository, type SiteImage } from "@/lib/content-repo";
import { siteImageSlots } from "@/app/site-content";

// Satu request dibagi oleh komponen yang mount bersamaan. Hasil tidak disimpan
// permanen agar perubahan dari panel admin terbaca setelah kembali ke situs.
let inFlight: Promise<Record<string, SiteImage>> | null = null;

// URL gambar slot (home-community, proker-website, dst). Fallback sementara
// ke path lokal site-content sampai data Appwrite ter-resolve (atau gagal).
export function useSiteImage(slot: string): SiteImage {
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
  const [image, setImage] = useState<SiteImage>(fallback);

  useEffect(() => {
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
      if (aktif) setImage(imgs[slot] ?? fallback);
    });
    return () => {
      aktif = false;
    };
  }, [fallback, slot]);

  return image;
}
