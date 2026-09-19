"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getContentRepository, type ProkerItem } from "@/lib/content-repo";
import { formatTanggalId, formatTanggalLengkapId } from "@/lib/format";

// Halaman arsip pelaksanaan program kerja berstatus "Selesai". Struktur
// editorial (bukan dashboard): kicker status+tanggal, judul besar, fakta
// dl, kutipan arsip pengumuman, dokumentasi, hasil. Section tanpa data
// tidak dirender — tidak ada "coming soon" kosong (antislop R-27/R-38).
export default function ProkerDetail() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() || "";
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; slug: string; program: ProkerItem }
    | { status: "missing"; slug: string }
    | { status: "error"; slug: string }
  >({ status: "loading" });
  const [lainnya, setLainnya] = useState<ProkerItem[]>([]);

  useEffect(() => {
    if (!slug) return;
    let aktif = true;
    getContentRepository()
      .getProkerBySlug(slug)
      .then((program) => {
        if (!aktif) return;
        setState(program ? { status: "ready", slug, program } : { status: "missing", slug });
      })
      .catch(() => {
        if (aktif) setState({ status: "error", slug });
      });
    return () => {
      aktif = false;
    };
  }, [slug]);

  // Rail pelengkap: program kerja lain (tanpa yang sedang dibuka). Gagal =
  // rail kosong, bukan error — halaman utama tetap utuh.
  useEffect(() => {
    let aktif = true;
    getContentRepository()
      .getProgramKerja()
      .then((all) => {
        if (aktif) setLainnya(all.filter((p) => p.slug !== slug));
      })
      .catch(() => {
        if (aktif) setLainnya([]);
      });
    return () => {
      aktif = false;
    };
  }, [slug]);

  if (slug && (state.status === "loading" || state.slug !== slug)) {
    return (
      <main className="news-page news-article-state" aria-busy="true">
        <p>Memuat detail program kerja…</p>
      </main>
    );
  }

  if (!slug || state.status === "missing" || state.status === "error") {
    return (
      <main className="news-page news-article-state">
        <p className="news-kicker">Arsip program kerja</p>
        <h1>
          {!slug || state.status === "missing"
            ? "Detail program tidak ditemukan"
            : "Detail belum dapat dimuat"}
        </h1>
        <p>
          {!slug || state.status === "missing"
            ? "Tautan tidak valid atau program belum memiliki halaman detail."
            : "Periksa koneksi lalu coba buka halaman ini kembali."}
        </p>
        <Link href="/proker" className="news-article-back">
          <span aria-hidden="true">←</span> Kembali ke program kerja
        </Link>
      </main>
    );
  }

  if (state.status !== "ready") {
    return (
      <main className="news-page news-article-state" aria-busy="true">
        <p>Memuat detail program kerja…</p>
      </main>
    );
  }

  const { program } = state;
  const tanggalSelesai = program.completedAt ? formatTanggalLengkapId(program.completedAt) : "";
  const tanggalPendek = program.completedAt ? formatTanggalId(program.completedAt) : "";

  return (
    <main className="news-page">
      <article className="news-container news-article pk-detail">
        <nav className="news-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <span aria-hidden="true">/</span>
          <Link href="/proker">Program Kerja</Link>
          <span aria-hidden="true">/</span>
          <strong>{program.name}</strong>
        </nav>

        <Link href="/proker" className="news-article-back">
          <span aria-hidden="true">←</span> Kembali ke katalog
        </Link>

        <header className="news-article-header">
          <div>
            <p className="pk-status">
              <span aria-hidden="true" className="pk-status-mark" />
              {program.status}
              {tanggalPendek ? (
                <span className="pk-status-date">{tanggalPendek}</span>
              ) : null}
            </p>
            <h1>{program.name}</h1>
          </div>
          <dl className="news-article-meta">
            <div>
              <dt>Diselesaikan</dt>
              <dd>{tanggalSelesai || "—"}</dd>
            </div>
          </dl>
        </header>

        <p className="news-article-lede">{program.description}</p>

        {program.image ? (
          <figure className="news-article-image">
            <Image
              src={program.image}
              alt={program.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 86vw, 100vw"
            />
          </figure>
        ) : null}

        <div className="news-article-content">
          <div className="news-article-prose">
            {/* Fakta pelaksanaan — pasangan label/nilai, bukan kartu-kartu. */}
            {program.location || program.eventTime || program.dresscode ? (
              <dl className="pk-detail-facts">
                {program.eventTime ? (
                  <div>
                    <dt>Waktu</dt>
                    <dd>{program.eventTime}</dd>
                  </div>
                ) : null}
                {program.location ? (
                  <div>
                    <dt>Titik kumpul</dt>
                    <dd>
                      {program.mapsUrl ? (
                        <a
                          href={program.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pk-detail-maps"
                        >
                          {program.location}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ) : (
                        program.location
                      )}
                    </dd>
                  </div>
                ) : null}
                {program.dresscode ? (
                  <div>
                    <dt>Dresscode</dt>
                    <dd>{program.dresscode}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {/* Arsip pengumuman pelaksanaan — dokumen asli, verbatim. */}
            {program.announcementNote ? (
              <figure className="pk-detail-announce">
                <blockquote>
                  <p>{program.announcementNote}</p>
                </blockquote>
                <figcaption>Arsip pengumuman pelaksanaan</figcaption>
              </figure>
            ) : null}

            {program.outcome ? (
              <>
                <h2>Hasil &amp; evaluasi</h2>
                <p>{program.outcome}</p>
              </>
            ) : null}
          </div>
        </div>

        {program.documentation.length > 0 ? (
          <PkDokumentasi urls={program.documentation} nama={program.name} />
        ) : null}

        <aside className="pk-detail-cta">
          <p>Sekadar bertanya tentang program ini?</p>
          <Link href="/kontak" className="home-text-link">
            Hubungi HMTI <span aria-hidden="true">→</span>
          </Link>
        </aside>

        {lainnya.length > 0 ? (
          <nav className="pk-detail-rail" aria-labelledby="pk-rail-heading">
            <h2 className="news-related-heading" id="pk-rail-heading">
              Program kerja lainnya
            </h2>
            <ul className="news-related-list">
              {lainnya.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <Link className="news-related-item" href={`/proker/detail?slug=${encodeURIComponent(item.slug)}`}>
                    <span className="news-related-thumb">
                      {item.image ? <Image src={item.image} alt="" fill sizes="104px" /> : null}
                    </span>
                    <span className="news-related-copy">
                      <span className="news-related-section">{item.status}</span>
                      <span className="news-related-title">{item.name}</span>
                      <span className="news-related-meta">
                        {item.completedAt ? formatTanggalId(item.completedAt) : item.description.slice(0, 48) + "…"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </article>
    </main>
  );
}

// Galeri dokumentasi + lightbox: klik foto → dialog fullscreen (elemen
// <dialog> native: Esc tutup, klik backdrop tutup, fokus ter-trap bawaan).
// Tombol prev/next + panah keyboard untuk berpindah foto.
function PkDokumentasi({ urls, nama }: { urls: string[]; nama: string }) {
  const dialogKotak = useRef<HTMLDialogElement>(null);
  const [aktif, setAktif] = useState<number | null>(null);

  const buka = useCallback((i: number) => {
    setAktif(i);
    dialogKotak.current?.showModal();
  }, []);

  const tutup = useCallback(() => {
    dialogKotak.current?.close();
  }, []);

  const geser = useCallback(
    (delta: number) => {
      setAktif((kini) => {
        if (kini === null) return kini;
        return (kini + delta + urls.length) % urls.length;
      });
    },
    [urls.length]
  );

  // Panah keyboard hanya relevan saat dialog terbuka; Esc ditangani native.
  useEffect(() => {
    if (aktif === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") geser(1);
      if (e.key === "ArrowLeft") geser(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aktif, geser]);

  return (
    <section aria-labelledby="pk-doc-heading" className="pk-detail-gallery">
      <h2 className="news-related-heading" id="pk-doc-heading">
        Dokumentasi kegiatan
      </h2>
      <ul className="pk-detail-gallery-grid">
        {urls.map((url, i) => (
          <li key={url}>
            <button
              type="button"
              className="pk-doc-item"
              onClick={() => buka(i)}
              aria-label={`Perbesar foto dokumentasi ${i + 1} dari ${urls.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Dokumentasi ${nama} ${i + 1}`} loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogKotak}
        className="pk-lightbox"
        onClose={() => setAktif(null)}
        onClick={(e) => {
          // Klik area gelap (di luar foto) menutup — perilaku lightbox standar.
          if (e.target === dialogKotak.current) tutup();
        }}
      >
        {aktif !== null ? (
          <div className="pk-lightbox-body">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urls[aktif]} alt={`Dokumentasi ${nama} ${aktif + 1}`} />
            <p className="pk-lightbox-count">
              {aktif + 1} / {urls.length}
            </p>
            {urls.length > 1 ? (
              <>
                <button type="button" className="pk-lightbox-nav pk-lightbox-nav--prev" onClick={() => geser(-1)} aria-label="Foto sebelumnya">
                  <span aria-hidden="true">←</span>
                </button>
                <button type="button" className="pk-lightbox-nav pk-lightbox-nav--next" onClick={() => geser(1)} aria-label="Foto berikutnya">
                  <span aria-hidden="true">→</span>
                </button>
              </>
            ) : null}
            <button type="button" className="pk-lightbox-close" onClick={tutup} aria-label="Tutup tampilan besar">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
