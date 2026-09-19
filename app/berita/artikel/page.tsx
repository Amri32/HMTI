import { Suspense } from "react";
import type { Metadata } from "next";
import ArticleDetail from "@/components/ArticleDetail";

export const metadata: Metadata = {
  title: "Artikel | HMTI UBSI Margonda",
  description: "Artikel dan berita terbitan HMTI UBSI Margonda.",
};

export default function ArticlePage() {
  return (
    <Suspense
      fallback={
        <main className="news-page news-article-state" aria-busy="true">
          <p>Memuat artikel…</p>
        </main>
      }
    >
      <ArticleDetail />
    </Suspense>
  );
}
