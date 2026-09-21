"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getContentRepository, type ProkerItem } from "@/lib/content-repo";
import { formatTanggalId } from "@/lib/format";
import { MediaReveal } from "@/components/motion/EditorialMotion";

type ProkerState =
  | { status: "loading" }
  | { status: "ready"; items: ProkerItem[] }
  | { status: "empty" }
  | { status: "error" };

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
  const [state, setState] = useState<ProkerState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getContentRepository()
      .getProgramKerja()
      .then((data) => {
        if (!active) return;
        setState(data.length > 0 ? { status: "ready", items: data } : { status: "empty" });
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retry() {
    setState({ status: "loading" });
    setReloadKey((key) => key + 1);
  }

  if (state.status === "loading") {
    return (
      <section className="about-container pk-state pk-state--loading" aria-label="Daftar program kerja" aria-busy="true">
        <p>Memuat program kerja HMTI.</p>
      </section>
    );
  }

  if (state.status === "empty") {
    return (
      <section className="about-container pk-state" aria-label="Daftar program kerja">
        <h2>Belum ada program kerja yang diterbitkan.</h2>
        <p>Pembaruan akan tampil setelah program dipublikasikan oleh pengurus HMTI.</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="about-container pk-state" aria-label="Daftar program kerja" role="alert">
        <h2>Program kerja belum dapat dimuat.</h2>
        <p>Periksa koneksi lalu coba muat kembali.</p>
        <button type="button" onClick={retry}>
          Coba muat kembali
        </button>
      </section>
    );
  }

  return (
    <section className="about-container pk-list" aria-label="Daftar program kerja">
      {state.items.map((program, index) => (
        <article
          className={`pk-item ${program.status === "Selesai" ? "pk-item--done" : ""}`}
          key={program.id}
        >
          {program.image ? (
            <>
              <Image
                className="pk-item-backdrop"
                src={program.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                fill
                sizes="1440px"
              />
              <span className="pk-item-backdrop-veil" aria-hidden="true" />
            </>
          ) : null}
          <span aria-hidden="true" className="pk-item-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <MediaReveal className="pk-item-media">
            {program.image ? (
              <Image
                className="pk-item-preview"
                src={program.image}
                alt={program.imageAlt}
                loading="lazy"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            ) : (
              <span className="pk-item-image-empty">Gambar belum tersedia</span>
            )}
          </MediaReveal>
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
