import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CountUp from "@/components/motion/CountUp";
import { MediaReveal } from "@/components/motion/EditorialMotion";
import AboutStageImage from "@/components/AboutStageImage";
import { aboutAddress, aboutParagraphs, siteProfile } from "../site-content";

function LinkArrow() {
  return (
    <svg aria-hidden="true" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const directory = [
  {
    href: "/visi-misi",
    title: "Arah kerja HMTI.",
    description: "Visi dan misi yang menuntun setiap periode kepengurusan.",
  },
  {
    href: "/struktur",
    title: "Orang-orang di baliknya.",
    description: "Susunan pengurus dan peran setiap divisi.",
  },
  {
    href: "/kontak",
    title: "Datang bergabung.",
    description: "Alamat sekretariat dan cara menghubungi HMTI.",
  },
] as const;

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Tentang HMTI"
        title="Dibentuk untuk menampung gagasan dan melatih kemampuan."
        intro="HMTI UBSI Margonda menjadi ruang bersama bagi mahasiswa Teknologi Informasi untuk menyampaikan aspirasi, belajar, dan bekerja secara produktif."
      />

      <section className="about-container about-stage-wrap" aria-label="Suasana kegiatan mahasiswa">
        <MediaReveal>
          <AboutStageImage />
        </MediaReveal>
      </section>

      <section className="about-container about-facts" aria-label="Profil singkat HMTI">
        <dl>
          <div className="about-fact">
            <dt>Didirikan</dt>
            <dd>
              <CountUp to={2020} from={1990} duration={2.2} className="about-count" />
              <span className="about-fact-sub">{siteProfile.establishedDate}</span>
            </dd>
          </div>
          <div className="about-fact">
            <dt>Kedudukan</dt>
            <dd>
              Kampus Margonda<span className="about-fact-sub">Universitas Bina Sarana Informatika, Depok</span>
            </dd>
          </div>
          <div className="about-fact">
            <dt>Institusi</dt>
            <dd className="about-fact-wide">
              Universitas Bina Sarana Informatika
              <span className="about-fact-sub">Himpunan tingkat cabang di bawah HMTI UBSI</span>
            </dd>
          </div>
        </dl>
      </section>

      <article className="about-container about-article">
        <div className="about-article-heading">
          <h2 className="font-serif text-[clamp(2.1rem,3.8vw,3.25rem)] font-[550] leading-[1.08] tracking-[-0.01em] text-ink">
            Latar belakang pembentukan.
          </h2>
          <p className="about-article-kicker">Dari kebutuhan mahasiswa, menjadi organisasi.</p>
        </div>
        <div>
          <div className="about-article-body">
            {aboutParagraphs.map((paragraph, index) => (
              <p key={paragraph} className={index === 0 ? "about-lede about-dropcap" : undefined}>{paragraph}</p>
            ))}
          </div>

          <div className="about-pull">
            <span aria-hidden="true" className="about-pull-mark" />
            <p>
              Kemampuan teknis perlu berjalan bersama komunikasi, tanggung jawab, dan keberanian menyampaikan gagasan.
            </p>
          </div>
        </div>
      </article>

      <section className="about-container about-branch" aria-label="Status kepengurusan cabang">
        <p>{aboutAddress}</p>
      </section>

      <section className="about-container about-directory" aria-label="Halaman terkait">
        {directory.map((item) => (
          <Link key={item.href} href={item.href} className="home-directory-link">
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <span className="home-circle-arrow"><LinkArrow /></span>
          </Link>
        ))}
      </section>
    </div>
  );
}
