"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getContentRepository, type VisiMisi } from "@/lib/content-repo";

function LinkArrow() {
  return (
    <svg aria-hidden="true" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function VisiMisiContent() {
  const [data, setData] = useState<VisiMisi | null>(null);

  useEffect(() => {
    let aktif = true;
    getContentRepository()
      .getVisiMisi()
      .then((v) => {
        if (aktif) setData(v);
      })
      .catch(() => {
        if (aktif) setData({ vision: "", missions: [] });
      });
    return () => {
      aktif = false;
    };
  }, []);

  return (
    <>
      <section className="vm-vision" aria-labelledby="vm-vision-title">
        <div className="about-container vm-vision-grid">
          <p className="vm-vision-label" id="vm-vision-title">Visi</p>
          <blockquote className="vm-vision-quote">
            <span aria-hidden="true" className="vm-vision-mark" />
            {data ? data.vision : "Memuat visi…"}
          </blockquote>
        </div>
      </section>

      <section className="about-container vm-missions" aria-labelledby="vm-missions-title">
        <div className="vm-missions-heading">
          <h2 id="vm-missions-title">Komitmen<br /><em>dalam satu periode.</em></h2>
          <p>Setiap misi bisa ditelusuri hasilnya: dari program yang berjalan sampai evaluasi setelah selesai.</p>
        </div>

        <ol className="vm-mission-list">
          {(data?.missions ?? []).map((mission, index) => (
            <li className="vm-mission" key={mission.id}>
              <span aria-hidden="true" className="vm-mission-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
              </div>
            </li>
          ))}
          {data?.missions.length === 0 ? (
            <li className="vm-mission">
              <span aria-hidden="true" className="vm-mission-index">—</span>
              <div>
                <h3>Belum ada misi diterbitkan</h3>
                <p>Tunggu pembaruan dari pengurus HMTI.</p>
              </div>
            </li>
          ) : null}
        </ol>

        <div className="vm-next">
          <Link href="/proker" className="home-directory-link">
            <div>
              <h3>Lihat program kerja.</h3>
              <p>Bukti nyata dari arah kerja ini sedang dikumpulkan di ruang program.</p>
            </div>
            <span className="home-circle-arrow"><LinkArrow /></span>
          </Link>
          <Link href="/struktur" className="home-directory-link">
            <div>
              <h3>Kenali pengurusnya.</h3>
              <p>Misi dijalankan oleh tim lintas divisi. Kenali siapa mengerjakan apa.</p>
            </div>
            <span className="home-circle-arrow"><LinkArrow /></span>
          </Link>
        </div>
      </section>
    </>
  );
}
