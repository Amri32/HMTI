import { Suspense } from "react";
import type { Metadata } from "next";
import ProkerDetail from "@/components/ProkerDetail";

export const metadata: Metadata = {
  title: "Detail Program Kerja | HMTI UBSI Margonda",
  description: "Arsip pelaksanaan program kerja HMTI UBSI Margonda.",
};

export default function ProkerDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="news-page news-article-state" aria-busy="true">
          <p>Memuat detail program kerja…</p>
        </main>
      }
    >
      <ProkerDetail />
    </Suspense>
  );
}
