import Image from "next/image";
import Link from "next/link";
import StudentLife from "@/components/StudentLife";
import { MagneticButton } from "@/components/HeroMotion";
import HomeImages, { ProgramImage } from "@/components/HomeImages";
import { HomeStats, HomeProgramList } from "@/components/HomeLiveData";
import { aboutParagraphs, missions, siteProfile, vision } from "./site-content";

function LinkArrow() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero home-container" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <span aria-hidden="true" className="home-kicker" />
          <h1 id="home-title">Gagasan mahasiswa,<br />dikerjakan <em>bersama.</em></h1>
          <p>Wadah aspirasi, pengembangan kemampuan, dan kerja nyata mahasiswa Teknologi Informasi.</p>
          <div className="home-actions">
            <MagneticButton>
              <Link href="/proker" className="home-button">Lihat program kerja <LinkArrow /></Link>
            </MagneticButton>
            <Link href="/tentang" className="home-text-link">Kenali HMTI</Link>
          </div>
        </div>

        <HomeImages />
        <p className="home-photo-disclosure">
          Foto pada halaman ini merupakan ilustrasi sementara dari Unsplash, bukan dokumentasi resmi HMTI.
        </p>
      </section>

      <div className="home-container">
        <div className="home-affiliation">
          <div className="home-university">
            <Image src="/logo-bsi.png" alt="Logo Universitas Bina Sarana Informatika" width={38} height={38} />
            <p>Himpunan Mahasiswa Teknologi Informasi<span>{siteProfile.university}</span></p>
          </div>
          <p className="home-established">Berdiri di {siteProfile.establishedCity}<time dateTime={siteProfile.establishedIso}>{siteProfile.establishedDate}</time></p>
          <a href="#ruang-bersama" className="home-scroll-link">Temukan ruangmu <span aria-hidden="true">↓</span></a>
        </div>

        <HomeStats />
      </div>

      <section id="ruang-bersama" className="home-container home-about" aria-labelledby="home-about-title">
        <h2 id="home-about-title"><span className="home-about-index" aria-hidden="true">01</span>Ruang untuk belajar,<br />bertumbuh, dan<br /><em>mengambil peran.</em></h2>
        <div className="home-about-copy">
          <p>{aboutParagraphs[0]}</p>
          <Link href="/tentang" className="home-text-link">Baca sejarah dan latar belakang <LinkArrow /></Link>
        </div>
      </section>

      <section className="home-container home-life" aria-labelledby="home-life-title">
        <div className="home-section-heading">
          <h2 id="home-life-title">Pertemuan kecil.<br /><em>Kemungkinan besar.</em></h2>
          <p>Ruang untuk memperdalam ilmu, bertukar gagasan, dan belajar bekerja bersama.</p>
        </div>
        <StudentLife />
      </section>

      <section className="home-vision" aria-labelledby="home-vision-title">
        <div className="home-container home-vision-grid">
          <div className="home-vision-statement">
            <h2 id="home-vision-title">Satu arah,<br /><em>kerja bersama.</em></h2>
            <p className="home-vision-quote">{vision}</p>
            <Link href="/visi-misi" className="home-text-link">Baca visi dan misi <LinkArrow /></Link>
          </div>
          <div className="home-missions">
            {missions.map((mission) => (
              <div className="home-mission" key={mission.title}>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-container home-programs" aria-labelledby="home-programs-title">
        <div className="home-section-heading">
          <h2 id="home-programs-title">Dari gagasan<br /><em>menjadi kegiatan.</em></h2>
          <p>Ikuti program kerja, orang-orang yang menggerakkannya, dan cerita dari HMTI.</p>
        </div>
        <div className="home-program-feature">
          <ProgramImage />
          <div className="home-program-copy">
            <h3>Program kerja HMTI</h3>
            <p>Rencana, pelaksanaan, dokumentasi, dan evaluasi. Setiap kegiatan punya tujuan dan pembelajaran yang bisa dibagikan.</p>
            <HomeProgramList />
            <Link href="/proker" className="home-text-link">Lihat ruang program kerja <LinkArrow /></Link>
          </div>
        </div>
        <div className="home-directory">
          <Link href="/struktur" className="home-directory-link">
            <div><h3>Orang-orang di balik HMTI.</h3><p>Kenali susunan pengurus dan peran setiap divisi.</p></div>
            <span className="home-circle-arrow"><LinkArrow /></span>
          </Link>
          <Link href="/berita" className="home-directory-link">
            <div><h3>Catatan dari himpunan.</h3><p>Ruang publikasi kegiatan dan informasi organisasi.</p></div>
            <span className="home-circle-arrow"><LinkArrow /></span>
          </Link>
        </div>
      </section>

      <section className="home-container home-contact" aria-labelledby="home-contact-title">
        <div className="home-contact-panel">
          <div>
            <h2 id="home-contact-title">Punya gagasan?<br /><em>Mari mulai percakapan.</em></h2>
            <p>Temui HMTI di Kampus Margonda, Depok. Ruang untuk menyampaikan aspirasi dan membicarakan kegiatan bersama.</p>
            <Link href="/kontak" className="home-button home-button-light">Hubungi HMTI <LinkArrow /></Link>
          </div>
          <div className="home-contact-address">
            <Image src="/hmti.png" alt="" width={92} height={92} />
            <p>Sekretariat HMTI</p>
            <address>{siteProfile.address}</address>
          </div>
        </div>
      </section>
    </div>
  );
}
