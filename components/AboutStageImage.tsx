"use client";

import Image from "next/image";
import { useSiteImage } from "@/components/SlotImage";

// Gambar besar halaman Tentang kini mengikuti slot Media (home-community) —
// sama dengan hero beranda. Sebelumnya path /home-community.jpg hard-code,
// sehingga pergantian gambar di panel Media tidak pernah tampil di sini.
export default function AboutStageImage() {
  const img = useSiteImage("home-community");
  return (
    <figure className="about-stage">
      <Image
        src={img.url}
        alt={img.alt || "Foto ilustrasi suasana belajar dan berdiskusi bersama di perpustakaan"}
        fill
        priority
        sizes="(min-width: 1440px) 1360px, 100vw"
      />
      <figcaption>{img.caption || "Foto ilustrasi · Unsplash"}</figcaption>
    </figure>
  );
}
