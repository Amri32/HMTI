"use client";

import { useCallback, useState } from "react";
import { useSiteImage, SlotImageImg } from "@/components/SlotImage";

// Bidang besar halaman Tentang mengikuti slot Media (home-community) — sama
// dengan hero beranda. Dua hal dijaga di sini:
//
// 1. Render <img> ditahan selama slot diambil dari Appwrite supaya foto
//    fallback statis tidak terlihat lalu terganti (flash), dan foto final
//    menyala lembut saat benar-benar selesai dimuat.
// 2. Tinggi bidang mengikuti rasio foto itu sendiri, bukan rasio tetap milik
//    section. Admin bebas mengunggah foto dengan bentuk apa pun lewat panel
//    Media; memaksa foto ke satu rasio (mis. 21/9) membuatnya tampak gepeng.
const RASIO_CADANGAN = "3 / 2";

export default function AboutStageImage() {
  const img = useSiteImage("home-community");
  const [rasio, setRasio] = useState(RASIO_CADANGAN);

  const ukurRasio = useCallback((el: HTMLImageElement) => {
    if (!el.naturalWidth || !el.naturalHeight) return;
    setRasio(`${el.naturalWidth} / ${el.naturalHeight}`);
  }, []);

  return (
    <figure
      className="about-stage"
      style={{ aspectRatio: rasio }}
      data-pending={img.sedangMemutuskan || undefined}
    >
      {img.sedangMemutuskan ? null : (
        <SlotImageImg
          image={img}
          sizes="(min-width: 1280px) 1344px, 100vw"
          altFallback="Foto suasana belajar dan berdiskusi bersama"
          priority
          onImageLoad={ukurRasio}
        />
      )}
      {img.caption ? <figcaption>{img.caption}</figcaption> : null}
    </figure>
  );
}
