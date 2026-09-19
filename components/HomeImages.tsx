"use client";

import { HeroPhoto } from "@/components/HeroMotion";
import { SlotImageImg, useSiteImage } from "@/components/SlotImage";

// Blok gambar beranda (hero + program) membaca slot dari repository — admin
// bisa mengganti gambar lewat panel Media tanpa mengubah kode. Selama slot
// diambil dari Appwrite, render <img> ditahan supaya fallback statis tidak
// terlihat lalu terganti (flash) oleh gambar asli.
export default function HomeImages() {
  const hero = useSiteImage("home-community");
  const collaboration = useSiteImage("home-collaboration");

  return (
    <div className="home-hero-media">
      {hero.sedangMemutuskan ? null : (
        <HeroPhoto
          src={hero.url}
          alt={hero.alt}
          sizes="(min-width: 1024px) 48vw, 100vw"
          priority
          caption={hero.caption}
        />
      )}
      <div className="home-photo-note">
        <span aria-hidden="true" className="home-note-mark" />
        <p>Tempat gagasan<br /><em>menemukan teman.</em></p>
      </div>
      {collaboration.sedangMemutuskan ? null : (
        <figure className="home-hero-inset">
          <SlotImageImg
            image={collaboration}
            sizes="(min-width: 1024px) 220px, 38vw"
            altFallback="Foto kegiatan kolaborasi HMTI"
            priority
          />
        </figure>
      )}
    </div>
  );
}

export function ProgramImage() {
  const collaboration = useSiteImage("home-collaboration");
  return (
    <figure className="home-program-image" data-pending={collaboration.sedangMemutuskan || undefined}>
      {collaboration.sedangMemutuskan ? null : (
        <SlotImageImg
          image={collaboration}
          sizes="(min-width: 1024px) 55vw, 100vw"
          altFallback="Foto kegiatan program kerja HMTI"
        />
      )}
      {collaboration.caption ? <figcaption>{collaboration.caption}</figcaption> : null}
    </figure>
  );
}
