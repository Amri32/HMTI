"use client";

import { useEffect, useState } from "react";
import { getContentRepository, type SocialLink } from "@/lib/content-repo";
import { SOCIAL_PLATFORM_LABEL } from "@/lib/social";

// Ikon digambar khusus, sejalur dengan ikon modul admin (grid 24, stroke 1.5).
const IKON: Record<SocialLink["platform"], string> = {
  instagram:
    "M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5zM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zM16.9 6.8h.01",
};

// Daftar kanal sosial resmi. Handle diatur admin lewat panel Pengaturan;
// selama belum diisi, komponen ini tidak merender apa pun — bukan ikon mati,
// dan bukan ruang kosong yang menyisakan celah di footer.
export default function SocialLinks({ className }: { className?: string }) {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    let aktif = true;
    getContentRepository()
      .getSocialLinks()
      .then((data) => {
        if (aktif) setLinks(data);
      })
      .catch(() => {
        // Gagal fetch → ikon disembunyikan, sisa halaman tetap utuh.
      });
    return () => {
      aktif = false;
    };
  }, []);

  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {links.map((link) => (
        <li key={link.platform}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${SOCIAL_PLATFORM_LABEL[link.platform]} HMTI: @${link.handle}`}
            className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-3 text-sm text-white/80 transition-colors hover:border-signal hover:bg-signal hover:text-ink"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={IKON[link.platform]} />
            </svg>
            <span>@{link.handle}</span>
            <span className="sr-only">(buka di tab baru)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
