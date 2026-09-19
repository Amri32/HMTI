"use client";

import { useSiteImage, SlotImageImg } from "@/components/SlotImage";

// Gambar besar halaman Tentang mengikuti slot Media (home-community) — sama
// dengan hero beranda. Render <img> ditahan selama slot diambil dari Appwrite
// supaya foto fallback statis tidak terlihat lalu terganti (flash), dan foto
// final menyala lembut saat benar-benar selesai dimuat.
export default function AboutStageImage() {
  const img = useSiteImage("home-community");
  return (
    <figure className="about-stage" data-pending={img.sedangMemutuskan || undefined}>
      {img.sedangMemutuskan ? null : (
        <SlotImageImg
          image={img}
          sizes="(min-width: 1440px) 1360px, 100vw"
          altFallback="Foto suasana belajar dan berdiskusi bersama"
          priority
        />
      )}
      {img.caption ? <figcaption>{img.caption}</figcaption> : null}
    </figure>
  );
}
