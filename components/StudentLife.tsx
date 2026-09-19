"use client";

import Link from "next/link";
import { SlotImageImg, useSiteImage } from "@/components/SlotImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const lifeThemes = [
  {
    value: "learn",
    label: "Belajar",
    slot: "home-learning",
    alt: "Foto ilustrasi dua orang membahas pekerjaan di layar laptop",
    title: "Saling berbagi, saling memahami.",
    description: "Memperdalam materi informatika, bertukar pengetahuan, dan mengembangkan kreativitas yang tidak berhenti pada teori.",
    link: "/tentang",
    linkLabel: "Kenali ruang belajar HMTI",
  },
  {
    value: "collaborate",
    label: "Berkolaborasi",
    slot: "home-collaboration",
    alt: "Foto ilustrasi sekelompok orang bekerja bersama dengan laptop",
    title: "Gagasan bertemu sudut pandang baru.",
    description: "Melalui diskusi dan kerja organisasi, mahasiswa dapat melatih kemampuan teknis, komunikasi, public speaking, dan soft skill secara produktif.",
    link: "/proker",
    linkLabel: "Lihat program kerja",
  },
  {
    value: "organize",
    label: "Berorganisasi",
    slot: "home-community",
    alt: "Foto ilustrasi suasana diskusi kelompok di perpustakaan",
    title: "Ambil peran, tumbuh bersama.",
    description: "Membentuk tim lintas divisi agar setiap anggota terlibat aktif dan memiliki tanggung jawab. Ruang untuk belajar mendengar, menyampaikan gagasan, dan bekerja bersama.",
    link: "/struktur",
    linkLabel: "Kenali struktur organisasi",
  },
] as const;

// Gambar tiap tab dibaca dari slot Media (repository) — admin mengganti foto
// lewat panel Media dan perubahan langsung tampil di sini. Selama slot masih
// diambil dari Appwrite, gambar ditahan (tanpa <img>) supaya foto fallback
// statis tidak sempat terlihat lalu "berkedip" diganti foto asli; setelah
// URL final terpasang, foto menyala lembut saat benar-benar selesai dimuat.
function LifeImage({ slot, altFallback, eager = false }: { slot: string; altFallback: string; eager?: boolean }) {
  const img = useSiteImage(slot);
  const tahan = img.sedangMemutuskan;
  return (
    <figure className="home-life-image" data-pending={tahan || undefined}>
      {tahan ? null : (
        <SlotImageImg image={img} sizes="(min-width: 1024px) 58vw, 100vw" altFallback={altFallback} priority={eager} />
      )}
      {img.caption ? <figcaption>{img.caption}</figcaption> : null}
    </figure>
  );
}

export default function StudentLife() {
  return (
    <Tabs defaultValue="learn" className="home-life-tabs">
      <TabsList aria-label="Ruang pengembangan mahasiswa" activateOnFocus>
        {lifeThemes.map((theme) => (
          <TabsTrigger key={theme.value} value={theme.value}>{theme.label}</TabsTrigger>
        ))}
      </TabsList>
      {lifeThemes.map((theme) => (
        <TabsContent key={theme.value} value={theme.value}>
          <div className="home-life-panel">
            <LifeImage slot={theme.slot} altFallback={theme.alt} eager={theme.value === "learn"} />
            <div className="home-life-copy">
              <h3>{theme.title}</h3>
              <p>{theme.description}</p>
              <Link className="home-text-link" href={theme.link}>{theme.linkLabel}</Link>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
