"use client";

import { useEffect, useState } from "react";
import CountUp from "@/components/motion/CountUp";
import { getContentRepository, type ProkerItem } from "@/lib/content-repo";
import { programKerja, strukturData } from "@/app/site-content";

// Statistik Beranda kini mengikuti data yang sama dengan /struktur dan /proker
// (repository → Appwrite). Fallback awal dihitung dari salinan statis
// site-content.ts supaya angka konsisten bahkan sebelum fetch selesai —
// bukan lagi angka hard-code yang bisa kontradiksi dengan halaman lain.
type Statistik = { divisi: number; pengurus: number; berjalan: number };

function hitungPengurus(s: { bph: unknown[]; divisi: { anggota: unknown[] }[] }): number {
  // Pengurus = BPH + anggota divisi (tanpa koordinator terpisah — sesuai data
  // resmi: 4 BPH + 10 anggota = 14).
  return s.bph.length + s.divisi.reduce((jml, d) => jml + d.anggota.length, 0);
}

function statistikAwal(): Statistik {
  return {
    divisi: strukturData.divisi.length,
    pengurus: hitungPengurus(strukturData),
    berjalan: programKerja.filter((p) => p.status === "Sedang berjalan").length,
  };
}

export function HomeStats() {
  const [stat, setStat] = useState<Statistik>(statistikAwal);

  useEffect(() => {
    let aktif = true;
    const repo = getContentRepository();
    Promise.all([repo.getStruktur(), repo.getProgramKerja()])
      .then(([struktur, proker]) => {
        if (!aktif) return;
        setStat({
          divisi: struktur.divisi.length,
          pengurus: hitungPengurus(struktur),
          berjalan: proker.filter((p) => p.status === "Sedang berjalan").length,
        });
      })
      .catch(() => {
        // Gagal fetch → fallback statis tetap tampil.
      });
    return () => {
      aktif = false;
    };
  }, []);

  return (
    <dl className="home-stats" aria-label="Ringkasan HMTI">
      <div className="home-stat">
        <dd className="home-stat-value">
          <CountUp to={stat.divisi} duration={1.4} />
        </dd>
        <dt className="home-stat-label">Divisi aktif</dt>
      </div>
      <div className="home-stat">
        <dd className="home-stat-value">
          <CountUp to={stat.pengurus} duration={1.4} />
        </dd>
        <dt className="home-stat-label">Pengurus</dt>
      </div>
      <div className="home-stat">
        <dd className="home-stat-value">
          <CountUp to={stat.berjalan} duration={1.4} />
        </dd>
        <dt className="home-stat-label">Program berjalan</dt>
      </div>
    </dl>
  );
}

// Daftar program kerja teaser di Beranda — ditarik dari repository yang sama
// dengan halaman /proker, sehingga proker baru yang diterbitkan admin
// langsung muncul di sini juga.
export function HomeProgramList() {
  const [items, setItems] = useState<{ name: string; status: string }[]>(() =>
    programKerja.map((p) => ({ name: p.name, status: p.status }))
  );

  useEffect(() => {
    let aktif = true;
    getContentRepository()
      .getProgramKerja()
      .then((data: ProkerItem[]) => {
        if (!aktif || data.length === 0) return; // kosong → teaser statis dipakai
        setItems(data.map((p) => ({ name: p.name, status: p.status })));
      })
      .catch(() => {
        // Gagal fetch → fallback statis tetap tampil.
      });
    return () => {
      aktif = false;
    };
  }, []);

  return (
    <ul className="home-program-list" aria-label="Program kerja periode berjalan">
      {items.map((program, index) => (
        <li key={program.name}>
          <span aria-hidden="true" className="home-program-list-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="home-program-list-name">{program.name}</span>
          <span className="home-program-list-status">{program.status}</span>
        </li>
      ))}
    </ul>
  );
}
