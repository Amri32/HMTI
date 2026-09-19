"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getContentRepository, type ProkerItem } from "@/lib/content-repo";
import { formatTanggalId } from "@/lib/format";

function LinkArrow() {
  return (
    <svg aria-hidden="true" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Tanggal selesai = data (bukan label) → sentence case per aturan audit-002;
// pk-status induknya uppercase, jadi chip ini menimpa transform.
function formatTanggalSelesai(iso: string | null): string {
  return iso ? formatTanggalId(iso) : "";
}

// Daftar program kerja dari repository (Appwrite bila terkonfigurasi,
// fallback ke konten statis site-content.ts bila belum).
export default function ProkerContent() {
  const [items, setItems] = useState<ProkerItem[] | null>(null);

  useEffect(() => {
    let aktif = true;
    getContentRepository()
      .getProgramKerja()
      .then((data) => {
        if (aktif) setItems(data);
      })
      .catch(() => {
        if (aktif) setItems([]);
      });
    return () => {
      aktif = false;
    };
  }, []);

  if (items === null) {
    return (
      <section className="about-container pk-list" aria-label="Daftar program kerja">
        {[0, 1].map((i) => (
          <article className="pk-item" key={i} aria-hidden="true">
            <span className="pk-item-veil" />
            <div className="pk-item-body">
              <p className="pk-status">Memuat…</p>
              <h2>&nbsp;</h2>
              <p className="pk-item-desc">&nbsp;</p>
            </div>
          </article>
        ))}
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="about-container" aria-label="Daftar program kerja">
        <p className="pk-empty">Belum ada program kerja yang diterbitkan.</p>
      </section>
    );
  }

  return (
    <section className="about-container pk-list" aria-label="Daftar program kerja">
      {items.map((program, index) => (
        <article
          className={`pk-item ${program.status === "Selesai" ? "pk-item--done" : ""}`}
          key={program.id}
        >
          {program.image ? (
            <Image
              className="pk-item-preview"
              src={program.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              fill
              sizes="(min-width: 1440px) 1440px, 100vw"
            />
          ) : null}
          <span className="pk-item-veil" aria-hidden="true" />
          <span aria-hidden="true" className="pk-item-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="pk-item-body">
            <p className="pk-status">
              <span aria-hidden="true" className="pk-status-mark" />
              {program.status}
              {formatTanggalSelesai(program.completedAt) ? (
                <span className="pk-status-date">
                  {formatTanggalSelesai(program.completedAt)}
                </span>
              ) : null}
            </p>
            <h2>{program.name}</h2>
            <p className="pk-item-desc">{program.description}</p>
            {program.status === "Selesai" && program.completedAt ? (
              <Link
                href={`/proker/detail?slug=${encodeURIComponent(program.slug)}`}
                className="home-text-link"
              >
                Lihat detail proker <LinkArrow />
              </Link>
            ) : (
              <Link href="/kontak" className="home-text-link">
                Tanya program ini <LinkArrow />
              </Link>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
