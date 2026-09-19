"use client";

import Image from "next/image";
import { HeroPhoto } from "@/components/HeroMotion";
import { useSiteImage } from "@/components/SlotImage";

// Blok gambar beranda (hero + program) membaca slot dari repository — admin
// bisa mengganti gambar lewat panel Media tanpa mengubah kode.
export default function HomeImages() {
  const hero = useSiteImage("home-community");
  const collaboration = useSiteImage("home-collaboration");

  return (
    <div className="home-hero-media">
      <HeroPhoto
        src={hero.url}
        alt={hero.alt}
        sizes="(min-width: 1024px) 48vw, 100vw"
        priority
      />
      <div className="home-photo-note">
        <span aria-hidden="true" className="home-note-mark" />
        <p>Tempat gagasan<br /><em>menemukan teman.</em></p>
      </div>
      <figure className="home-hero-inset">
        <Image
          src={collaboration.url}
          alt={collaboration.alt}
          fill
          sizes="(min-width: 1024px) 220px, 38vw"
          priority
        />
      </figure>
    </div>
  );
}

export function ProgramImage() {
  const collaboration = useSiteImage("home-collaboration");
  return (
    <figure className="home-program-image">
      <Image
        src={collaboration.url}
        alt={collaboration.alt}
        fill
        sizes="(min-width: 1024px) 55vw, 100vw"
      />
      {collaboration.caption ? <figcaption>{collaboration.caption}</figcaption> : null}
    </figure>
  );
}
