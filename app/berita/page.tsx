import type { Metadata } from "next";
import NewsCatalog from "@/components/NewsCatalog";
import { BlurFade } from "@/components/motion/Reveal";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Berita | HMTI UBSI Margonda",
  description:
    "Ruang publikasi HMTI UBSI Margonda untuk berita kegiatan, opini teknologi, dan arsip organisasi.",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function NewsPage() {
  return (
    <div className="news-page">
      <PageViewTracker page="/berita" />
      <div className="news-container">
        <div className="news-breadcrumbs" aria-label="Breadcrumb">
          <span>Beranda</span>
          <span aria-hidden="true">/</span>
          <strong>Berita & Artikel</strong>
          <span aria-hidden="true">/</span>
          <span>Ruang publikasi Margonda</span>
        </div>

        <div className="news-utility">
          <span>Portal publikasi & arsip HMTI</span>
          <span>Diperbarui berkala oleh redaksi</span>
        </div>

        <section className="news-hero" aria-labelledby="news-title">
          <BlurFade className="news-hero-copy" y={18} blur={4}>
            <p className="news-kicker">Berita, opini, dan rekam jejak</p>
            <h1 id="news-title">
              Warta terkini, <em>dialektika teknologi,</em> & rekam jejak pengabdian.
            </h1>
            <p className="news-hero-intro">
              Kanal informasi resmi, dokumentasi kegiatan organisasi, dan ruang akademik untuk mahasiswa Teknologi Informasi UBSI Margonda.
            </p>
            <div className="news-hero-actions">
              <a href="#news-catalog-title" className="news-primary-action">
                Lihat katalog <ArrowIcon />
              </a>
            </div>
          </BlurFade>

          <BlurFade className="news-stat-board" y={24} blur={5} delay={0.08}>
            <div className="news-stat-board-top">
              <span>Statistik jurnalistik</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="news-stat-grid">
              <div>
                <strong>01</strong>
                <small>Kegiatan</small>
              </div>
              <div>
                <strong>02</strong>
                <small>Opini &amp; Teknologi</small>
              </div>
              <div>
                <strong>03</strong>
                <small>Riset &amp; Akademik</small>
              </div>
              <div>
                <strong>04</strong>
                <small>Warta Himpunan</small>
              </div>
            </div>
            <div className="news-stat-board-foot">
              <span>Ruang tinjau & kurasi</span>
              <span>HMTI Margonda</span>
            </div>
          </BlurFade>
        </section>

      </div>

      <BlurFade y={28} blur={5}>
        <NewsCatalog />
      </BlurFade>

    </div>
  );
}
