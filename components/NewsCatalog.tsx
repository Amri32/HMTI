"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getContentRepository, type BeritaItem } from "@/lib/content-repo";
import { getBeritaHref } from "@/lib/content-path";
import { SelectionIndicator } from "@/components/motion/EditorialMotion";

const filters = ["Semua terbitan", "Kegiatan", "Opini & Teknologi", "Riset & Akademik", "Warta Himpunan"] as const;

export default function NewsCatalog() {
  const [stories, setStories] = useState<BeritaItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Semua terbitan");
  const [filterRevision, setFilterRevision] = useState(0);
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let aktif = true;
    getContentRepository()
      .getBerita()
      .then((data) => {
        if (aktif) setStories(data);
      })
      .catch(() => {
        if (aktif) {
          setLoadError(true);
          setStories([]);
        }
      });
    return () => {
      aktif = false;
    };
  }, []);

  const visibleStories = useMemo(() => {
    if (!stories) return [];
    const normalizedQuery = query.trim().toLowerCase();

    return stories.filter((story) => {
      const matchesFilter = activeFilter === "Semua terbitan" || story.section === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        `${story.title} ${story.excerpt} ${story.section}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [stories, activeFilter, query]);

  function selectFilter(filter: (typeof filters)[number]) {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    setFilterRevision((revision) => revision + 1);
  }

  return (
    <section className="news-catalog" aria-labelledby="news-catalog-title">
      <div className="news-container">
        <div className="news-catalog-heading">
          <div>
            <p className="news-kicker">Arsip publikasi</p>
            <h2 id="news-catalog-title">Katalog Terbitan Terbaru</h2>
            <p>Menampilkan rekaman kegiatan, pemikiran, dan hasil riset mahasiswa.</p>
          </div>
          <span className="news-catalog-count">
            {stories ? `${visibleStories.length} dari ${stories.length} terbitan` : "Memuat terbitan…"}
          </span>
        </div>

        <div className="news-toolbar" aria-label="Filter katalog terbitan">
          <label className="news-search">
            <span className="sr-only">Cari terbitan</span>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              type="search"
              placeholder="Cari artikel, topik, atau nama penulis..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="news-filter-list" role="group" aria-label="Pilih rubrik">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className="news-filter"
                data-active={activeFilter === filter}
                aria-pressed={activeFilter === filter}
                onClick={() => selectFilter(filter)}
              >
                {activeFilter === filter ? <SelectionIndicator layoutId="news-active-filter" /> : null}
                <span className="news-filter-label">{filter}</span>
              </button>
            ))}
          </div>
        </div>

        {stories === null ? (
          <p className="news-empty-filter news-loading-catalog">Memuat katalog terbitan…</p>
        ) : loadError ? (
          <p role="alert" className="news-empty-filter">
            Katalog belum dapat dimuat. Periksa koneksi lalu muat ulang halaman.
          </p>
        ) : visibleStories.length > 0 ? (
          <motion.div
            key={filterRevision}
            className="news-card-grid"
            initial={filterRevision === 0 || reduceMotion ? false : { opacity: 0.92, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {visibleStories.map((story, index) => (
              <article className={`news-card ${index === 0 ? "news-card--featured" : ""}`} key={story.id}>
                <div className="news-card-image">
                  {story.image ? (
                    <Image src={story.image} alt={story.imageAlt} fill sizes="(min-width: 1100px) 31vw, (min-width: 680px) 48vw, 100vw" />
                  ) : (
                    <span className="news-card-image-empty">Gambar belum tersedia</span>
                  )}
                  <span className="news-card-label">{story.section}</span>
                </div>
                <div className="news-card-body">
                  <p className="news-card-meta">{story.date} <span aria-hidden="true">·</span> {story.readTime}</p>
                  <h3>{story.title}</h3>
                  <p>{story.excerpt}</p>
                  <Link className="news-card-link" href={getBeritaHref(story.id)}>
                    Baca artikel
                  </Link>
                </div>
              </article>
            ))}
          </motion.div>
        ) : (
          <div className="news-empty-filter">
            <p>Tidak ada terbitan yang cocok dengan pencarian ini.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                if (activeFilter !== "Semua terbitan") {
                  setActiveFilter("Semua terbitan");
                  setFilterRevision((revision) => revision + 1);
                }
              }}
            >
              Reset pencarian
            </button>
          </div>
        )}

        <p className="news-disclosure">
          Hanya berita berstatus terbit dan tidak diarsipkan yang tampil di katalog publik.
        </p>
      </div>
    </section>
  );
}
