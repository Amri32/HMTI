import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageViewTracker from "@/components/PageViewTracker";
import ProkerContent from "@/components/ProkerContent";
import { siteProfile } from "../site-content";

export const metadata: Metadata = {
  title: "Program Kerja | HMTI UBSI Margonda",
  description:
    "Program kerja HMTI UBSI Margonda: rencana, pelaksanaan, dan dokumentasi kegiatan himpunan.",
};

function LinkArrow() {
  return (
    <svg aria-hidden="true" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ProgramKerjaPage() {
  return (
    <div>
      <PageViewTracker page="/proker" />
      <PageHeader
        eyebrow="Program Kerja"
        title="Program kerja, dikerjakan dengan tertib."
        intro="Setiap program kerja berjalan dari tujuan yang jelas, pelaksanaan yang terbagi, dokumentasi yang tertib, hingga evaluasi bersama."
      />

      <ProkerContent />
      <p className="pk-preview-disclosure about-container">
        Gambar pratinjau merupakan ilustrasi sementara, bukan dokumentasi resmi HMTI.
      </p>

      <section className="pk-note" aria-labelledby="pk-note-title">
        <div className="about-container pk-note-grid">
          <div>
            <h2 id="pk-note-title">Rincian lain<br /><em>menyusul setelah diverifikasi.</em></h2>
            <p>Jadwal, pelaksana, dan dokumentasi program dipublikasikan setelah dikonfirmasi HMTI.</p>
          </div>
          <div className="pk-note-rule">
            <span aria-hidden="true" className="pk-note-mark" />
            <p>Program kerja periode berjalan</p>
          </div>
        </div>
      </section>

      <section className="about-container pk-contact" aria-labelledby="pk-contact-title">
        <div className="pk-contact-panel">
          <div>
            <h2 id="pk-contact-title">Punya gagasan?<br /><em>Mari mulai percakapan.</em></h2>
            <p>Sampaikan aspirasi atau ajukan kolaborasi untuk program kerja HMTI.</p>
            <Link href="/kontak" className="home-button home-button-light">
              Hubungi HMTI <LinkArrow />
            </Link>
          </div>
          <div className="pk-contact-sekretariat">
            <p>Sekretariat HMTI</p>
            <address>{siteProfile.address}</address>
          </div>
        </div>
      </section>
    </div>
  );
}
