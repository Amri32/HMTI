"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getContentRepository, type BeritaItem } from "@/lib/content-repo";
import { getBeritaHref, normalizeBeritaSlug } from "@/lib/content-path";

const RELATED_LIMIT = 4;

type ArticleState =
  | { status: "loading" }
  | { status: "ready"; slug: string; article: BeritaItem }
  | { status: "missing"; slug: string }
  | { status: "error"; slug: string };

export default function ArticleDetail() {
  const searchParams = useSearchParams();
  const slug = normalizeBeritaSlug(searchParams.get("slug"));
  const [state, setState] = useState<ArticleState>({ status: "loading" });
  const [otherArticles, setOtherArticles] = useState<BeritaItem[]>([]);

  useEffect(() => {
    if (!slug) return;

    let active = true;
    getContentRepository()
      .getBerita()
      .then((all) => {
        if (active) setOtherArticles(all.filter((item) => item.id !== slug));
      })
      .catch(() => {
        // Daftar terbitan lain bersifat pelengkap: kalau gagal, rail cukup kosong.
        if (active) setOtherArticles([]);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    let active = true;
    getContentRepository()
      .getBeritaBySlug(slug)
      .then((article) => {
        if (!active) return;
        setState(article ? { status: "ready", slug, article } : { status: "missing", slug });
      })
      .catch(() => {
        if (active) setState({ status: "error", slug });
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (slug && (state.status === "loading" || state.slug !== slug)) {
    return (
      <main className="news-page news-article-state" aria-busy="true">
        <p>Memuat artikel…</p>
      </main>
    );
  }

  if (!slug || state.status === "missing" || state.status === "error") {
    return (
      <main className="news-page news-article-state">
        <p className="news-kicker">Ruang publikasi</p>
        <h1>{!slug || state.status === "missing" ? "Artikel tidak ditemukan" : "Artikel belum dapat dimuat"}</h1>
        <p>
          {!slug || state.status === "missing"
            ? "Tautan tidak valid, artikel belum diterbitkan, atau artikel sudah diarsipkan."
            : "Periksa koneksi lalu coba buka artikel ini kembali."}
        </p>
        <Link href="/berita" className="news-article-back">
          <span aria-hidden="true">←</span> Kembali ke berita
        </Link>
      </main>
    );
  }

  if (state.status !== "ready") {
    return (
      <main className="news-page news-article-state" aria-busy="true">
        <p>Memuat artikel…</p>
      </main>
    );
  }

  const { article } = state;
  const paragraphs = article.body.length > 0 ? article.body : [article.excerpt];
  // Rubrik yang sama didahulukan supaya rail terasa sebagai bacaan lanjutan, bukan daftar acak.
  const related = [
    ...otherArticles.filter((item) => item.section === article.section),
    ...otherArticles.filter((item) => item.section !== article.section),
  ].slice(0, RELATED_LIMIT);

  return (
    <main className="news-page">
      <article className="news-container news-article">
        <nav className="news-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <span aria-hidden="true">/</span>
          <Link href="/berita">Berita &amp; Artikel</Link>
          <span aria-hidden="true">/</span>
          <strong>{article.section}</strong>
        </nav>

        <Link href="/berita" className="news-article-back">
          <span aria-hidden="true">←</span> Kembali ke katalog
        </Link>

        <header className="news-article-header">
          <div>
            <p className="news-kicker">{article.section}</p>
            <h1>{article.title}</h1>
          </div>
          <dl className="news-article-meta">
            <div>
              <dt>Diterbitkan</dt>
              <dd>{article.date}</dd>
            </div>
            <div>
              <dt>Penulis</dt>
              <dd>{article.author}</dd>
            </div>
            {article.readTime ? (
              <div>
                <dt>Durasi baca</dt>
                <dd>{article.readTime}</dd>
              </div>
            ) : null}
          </dl>
        </header>

        <p className="news-article-lede">{article.excerpt}</p>

        {article.image ? (
          <figure className="news-article-image">
            <Image
              src={article.image}
              alt={article.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 86vw, 100vw"
            />
          </figure>
        ) : null}

        <div className="news-article-content">
          <div className="news-article-prose">
            {paragraphs.map((paragraph, index) => (
              <p key={`${article.id}-${index}`}>{paragraph}</p>
            ))}
          </div>

          {related.length > 0 ? (
            <aside className="news-related" aria-labelledby="news-related-heading">
              <h2 className="news-related-heading" id="news-related-heading">
                Terbitan lain
              </h2>
              <ul className="news-related-list">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link className="news-related-item" href={getBeritaHref(item.id)}>
                      <span className="news-related-thumb">
                        {item.image ? (
                          <Image src={item.image} alt="" fill sizes="104px" />
                        ) : null}
                      </span>
                      <span className="news-related-copy">
                        <span className="news-related-section">{item.section}</span>
                        <span className="news-related-title">{item.title}</span>
                        <span className="news-related-meta">
                          {item.date}
                          {item.readTime ? (
                            <>
                              {" "}
                              <span aria-hidden="true">·</span> {item.readTime}
                            </>
                          ) : null}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </article>
    </main>
  );
}
