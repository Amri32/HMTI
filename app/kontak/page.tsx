"use client";

import Image from "next/image";
import CollaborationForm from "@/components/CollaborationForm";
import ContactSignal from "@/components/motion/ContactSignal";
import { aboutAddress, contactEmail, siteProfile } from "../site-content";
import { trackCollabSignal } from "@/lib/appwrite/tracking";

function ArrowDown() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v15m0 0 6-6m-6 6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M7 17 17 7m0 0H9m8 0v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteProfile.address)}`;
const [emailLocalPart, emailDomain] = contactEmail.split("@");

export default function ContactPage() {
  return (
    <div className="contact-page">
      <header className="contact-hero">
        <div className="contact-shell contact-hero-grid">
          <div className="contact-hero-copy">
            <span className="contact-identity-rule" aria-hidden="true" />
            <p className="contact-kicker">Kanal komunikasi resmi</p>
            <h1>Mulai percakapan dengan HMTI Margonda.</h1>
            <p>
              Sampaikan rencana kegiatan, tawaran kerja sama, atau kebutuhan informasi melalui kanal resmi kami.
            </p>
            <div className="contact-hero-actions">
              <a
                className="contact-primary-action"
                href="#proposal"
                onClick={() => trackCollabSignal("collab_form_open", "/kontak")}
              >
                <span>Ajukan kolaborasi</span>
                <ArrowDown />
              </a>
              <a
                className="contact-secondary-action"
                href={`mailto:${contactEmail}`}
                onClick={() => trackCollabSignal("contact_click", "/kontak", "email_direct")}
              >
                Kirim email langsung
              </a>
            </div>
          </div>

          <aside className="contact-channel-stage" aria-label="Email resmi HMTI UBSI Margonda">
            <ContactSignal />
            <div className="contact-stage-heading">
              <Image src="/hmti.png" alt="" width={54} height={54} aria-hidden="true" />
              <div>
                <p>HMTI UBSI Margonda</p>
                <span>Alamat email resmi</span>
              </div>
            </div>
            <a className="contact-stage-email" href={`mailto:${contactEmail}`}>
              <span className="contact-stage-email-text">
                <span>{emailLocalPart}</span>
                <span>@{emailDomain}</span>
              </span>
              <ArrowUpRight />
            </a>
            <div className="contact-stage-foot">
              <p>Untuk proposal, undangan, dan pertanyaan organisasi.</p>
              <span>Email telah dikonfirmasi</span>
            </div>
          </aside>
        </div>
      </header>

      <section className="contact-location" aria-labelledby="location-title">
        <div className="contact-shell contact-location-grid">
          <div className="contact-location-copy">
            <p className="contact-kicker">Lokasi sekretariat</p>
            <h2 id="location-title">Datang dan temui kami di kampus.</h2>
            <p>{aboutAddress}</p>
          </div>
          <div className="contact-location-board">
            <p className="contact-location-label">Alamat sekretariat</p>
            <address>{siteProfile.address}</address>
            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <span>Buka lokasi di Google Maps</span>
              <ArrowUpRight />
            </a>
          </div>
        </div>
      </section>

      <section id="proposal" className="contact-proposal" aria-labelledby="proposal-title">
        <div className="contact-shell contact-proposal-grid">
          <div className="contact-proposal-copy">
            <p className="contact-kicker">Ruang kolaborasi</p>
            <h2 id="proposal-title">Ajukan kerja sama yang jelas sejak awal.</h2>
            <p>
              Isi identitas, jenis kolaborasi, dan ringkasan rencana. Form akan menyiapkan draf di aplikasi email Anda.
            </p>
            <a className="contact-inline-email" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          </div>

          <div className="contact-form-frame">
            <div className="contact-form-heading">
              <p>Form proposal</p>
              <span>Dibuka melalui aplikasi email</span>
            </div>
            <CollaborationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
