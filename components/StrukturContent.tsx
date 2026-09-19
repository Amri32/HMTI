"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { IKON_PATH, type Ikon } from "@/components/struktur-ikon";
import { getContentRepository, type StrukturData, type StrukturAnggota } from "@/lib/content-repo";

/*
 * STRUKTUR KEPENGURUSAN HMTI — organization chart editorial.
 *
 * Sumber kebenaran: "PENGURUS HMTI.zip" (14 pengurus, mapping foto di
 * lib/struktur-pengurus.ts). Bukan data lama 5 divisi.
 *
 * Hierarki yang dirender:
 *   Ketua → Wakil Ketua → Sekretaris + Bendahara → PSDM | KOMINFO | LITBANG.
 *
 * Animasi: motion/react (sudah ada di project) — reveal halus ala React Bits
 * BlurFade, connector line "draw" saat masuk viewport, stagger pendek, dan
 * penuh hormat pada prefers-reduced-motion (semua animasi dimatikan).
 */

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Ikon garis (stroke 1.7, grid 24; daftar lengkap di struktur-ikon.tsx) ──

function IkonKecil({ nama, ukuran = 16 }: { nama: Ikon; ukuran?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d={IKON_PATH[nama]} />
    </svg>
  );
}

function LabelTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
      {children}
    </span>
  );
}

// ── Motion helpers (reduced-motion aware) ─────────────────────────────────

// Wrapper fade + rise halus. Reduced motion → render langsung tanpa animasi.
function Naik({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Garis connector vertikal yang "tergambar" saat masuk viewport.
function GarisTurun({ tinggi = 40 }: { tinggi?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex justify-center" aria-hidden="true" style={{ height: tinggi }}>
      <motion.span
        className="block w-px origin-top bg-hairline"
        style={{ height: "100%" }}
        initial={reduce ? { scaleY: 1 } : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, ease: EASE }}
      />
    </div>
  );
}

// ── Kartu orang ────────────────────────────────────────────────────────────

// Foto: wajib dari file resmi (mapping lib/struktur-pengurus.ts sudah
// menjaminnya). object-top menjaga wajah tetap utuh pada crop portrait.
function FotoAnggota({
  nama,
  jabatan,
  foto,
  ukuranW = 320,
  ukuranH = 400,
  className = "",
}: {
  nama: string;
  jabatan: string;
  foto: string | null;
  ukuranW?: number;
  ukuranH?: number;
  className?: string;
}) {
  if (!foto) {
    // Tidak boleh terjadi pada data resmi (semua 14 punya foto). Kalau terjadi,
    // tampilkan blok kosong bermartabat — bukan foto orang lain.
    return (
      <div
        className={`bg-surface ${className}`}
        style={{ aspectRatio: `${ukuranW} / ${ukuranH}` }}
        aria-hidden="true"
      />
    );
  }
  return (
    <Image
      src={foto}
      alt={`${nama} - ${jabatan} HMTI`}
      width={ukuranW}
      height={ukuranH}
      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 60vw"
      className={`object-cover object-top ${className}`}
    />
  );
}

function KartuSimpul({
  nama,
  jabatan,
  foto,
  utama = false,
  delay = 0,
}: {
  nama: string;
  jabatan: string;
  foto: string | null;
  utama?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const isi = (
    <figure
      className={`group flex w-full max-w-[300px] items-center gap-4 p-4 ${utama ? "bg-ink text-white" : "border border-hairline bg-paper"}`}
    >
      <span className="overflow-hidden">
        <FotoAnggota
          nama={nama}
          jabatan={jabatan}
          foto={foto}
          ukuranW={120}
          ukuranH={120}
          className={`!h-16 !w-16 transition-transform duration-500 group-hover:scale-[1.04] ${utama ? "" : ""}`}
        />
      </span>
      <span className="min-w-0 text-left">
        <span
          className={`block text-[11px] font-semibold uppercase tracking-[0.14em] ${utama ? "text-signal" : "text-steel"}`}
        >
          {jabatan}
        </span>
        <span className="mt-0.5 block font-serif text-lg leading-tight">{nama}</span>
      </span>
    </figure>
  );
  if (reduce) return <div className="flex justify-center">{isi}</div>;
  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {isi}
    </motion.div>
  );
}

// ── Strip anggota divisi: baris scroll-snap manual ─────────────────────────
// Menggantikan grid 2 kolom: halaman lebih pendek, hierarchy tetap terbaca,
// dan nama tetap stabil di halaman (bisa dicari/di-screenshot), berbeda dari
// marquee auto-loop yang terus bergerak. Geser via panah (desktop) atau
// swipe/keyboard (strip bisa fokus, digeser dengan tombol panah).
// ── Marquee anggota divisi: loop pelan, pause saat hover ───────────────────
// Pola ala React Bits/Kokonut: track diduplikasi 2× lalu dianimasikan
// translateX -50%, jadi loop mulus tanpa lompatan. Sesuai konteks halaman
// resmi: kartu kotak (tanpa rounded), nama serif di bawah foto, foto tetap
// berwarna (jersey biru = identitas), gerak pelan, pause saat hover/focus,
// dan mati total saat prefers-reduced-motion (jadi strip scroll manual).
function MarqueeAnggota({ anggota }: { anggota: (StrukturAnggota & { divisi?: string })[] }) {
  const reduce = useReducedMotion();
  if (anggota.length === 0) return null;

  const kartu = (a: StrukturAnggota & { divisi?: string }, duplikat: boolean, kunci: string) => (
    <KartuMember key={kunci} anggota={a} divisi={a.divisi || ""} ariaHidden={duplikat} />
  );

  return (
    <div
      className="st-marquee"
      data-statik={reduce || undefined}
      role="region"
      aria-label="Anggota divisi PSDM, KOMINFO, dan LITBANG"
    >
      <ul className="st-marquee-track">
        {anggota.map((a) => kartu(a, false, a.nama))}
        {!reduce && anggota.map((a) => kartu(a, true, `${a.nama}-dup`))}
      </ul>
    </div>
  );
}

// Kartu anggota divisi: foto portrait jadi fokus visual. Kotak tanpa border
// (dinding putih di beberapa foto melebur bila diberi hairline), nama serif
// di bawah. Statik — gerak loop ditangani track-nya, bukan per kartu.
function KartuMember({
  anggota,
  divisi,
  ariaHidden = false,
}: {
  anggota: StrukturAnggota & { divisi?: string };
  divisi: string;
  ariaHidden?: boolean;
}) {
  return (
    <li className="st-marquee-item" aria-hidden={ariaHidden || undefined}>
      <figure className="group">
        <span className="block overflow-hidden bg-surface">
          <FotoAnggota
            nama={anggota.nama}
            jabatan={`Anggota ${divisi}`}
            foto={anggota.foto}
            ukuranW={360}
            ukuranH={450}
            className="!h-auto !w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </span>
        <figcaption className="pt-3">
          <span className="block font-serif text-[17px] leading-snug text-ink">{anggota.nama}</span>
          <span className="mt-0.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-steel">
            {divisi}
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

// ── Bagan organisasi (desktop: tree; mobile: vertikal) ────────────────────

function BaganOrganisasi({ data }: { data: StrukturData }) {
  const [ketua, wakil, sekretaris, bendahara] = data.bph;

  return (
    <div className="st-chart">
      {/* Ketua */}
      {ketua ? <KartuSimpul nama={ketua.nama} jabatan="Ketua" foto={ketua.foto} utama /> : null}
      <GarisTurun />
      {/* Wakil Ketua */}
      {wakil ? <KartuSimpul nama={wakil.nama} jabatan="Wakil Ketua" foto={wakil.foto} delay={0.05} /> : null}
      <GarisTurun />

      {/* Sekretaris + Bendahara sejajar, dengan connector T */}
      <div className="st-branch-wrap">
        <div className="st-branch-stem" aria-hidden="true" />
        <div className="st-branch-bar" aria-hidden="true" />
        <div className="st-branch-pair">
          {sekretaris ? (
            <div className="st-branch-col">
              <div className="st-branch-drop" aria-hidden="true" />
              <KartuSimpul nama={sekretaris.nama} jabatan="Sekretaris" foto={sekretaris.foto} delay={0.1} />
            </div>
          ) : null}
          {bendahara ? (
            <div className="st-branch-col">
              <div className="st-branch-drop" aria-hidden="true" />
              <KartuSimpul nama={bendahara.nama} jabatan="Bendahara" foto={bendahara.foto} delay={0.15} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Tiga cabang divisi — stem di wrap sudah jadi connector, tanpa garis ganda */}
      <div className="st-divisions-wrap">
        <div className="st-branch-stem" aria-hidden="true" />
        <div className="st-branch-bar st-branch-bar--wide" aria-hidden="true" />
        <div className="st-divisions">
          {data.divisi.map((d, i) => (
            <div className="st-branch-col" key={d.id}>
              <div className="st-branch-drop" aria-hidden="true" />
              <div className="st-division-head">
                <span className="st-division-num">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="st-division-name">{d.nama}</h4>
                <span className="st-division-count">{d.anggota.length} orang</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semua anggota divisi dalam satu marquee loop pelan. */}
      <MarqueeAnggota anggota={data.divisi.flatMap((d) => d.anggota.map((a) => ({ ...a, divisi: d.nama })))} />
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function StrukturContent() {
  const [data, setData] = useState<StrukturData | null>(null);

  useEffect(() => {
    let aktif = true;
    getContentRepository()
      .getStruktur()
      .then((d) => {
        if (aktif) setData(d);
      })
      .catch(() => {
        if (aktif) setData({ periode: "", bph: [], divisi: [] });
      });
    return () => {
      aktif = false;
    };
  }, []);

  if (data === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-sans text-sm text-ink-muted">Memuat struktur organisasi…</p>
      </div>
    );
  }

  const totalPengurus = data.bph.length + data.divisi.reduce((jml, d) => jml + d.anggota.length, 0);

  return (
    <div>
      {/* ── Intro editorial ── */}
      <section className="w-full border-b border-hairline bg-canvas">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:py-20 lg:px-10">
          <Naik>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-steel" />
              <LabelTag>Struktur Kepengurusan HMTI</LabelTag>
            </div>
          </Naik>
          <Naik delay={0.08}>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:text-6xl">
              Empat belas orang, satu arah: <em className="font-normal italic text-steel">mengabdi</em> bagi mahasiswa
              Teknologi Informasi.
            </h1>
          </Naik>
          <Naik delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
              Kepengurusan HMTI UBSI Margonda periode {data.periode || "berjalan"} terdiri atas Badan Pengurus Harian
              (Ketua, Wakil Ketua, Sekretaris, dan Bendahara) serta tiga divisi: PSDM, KOMINFO, dan LITBANG.
            </p>
          </Naik>
          <Naik delay={0.24}>
            <div className="st-intro-stats mt-10 border-t border-hairline pt-6">
              {[
                ["BPH", `${data.bph.length} pengurus inti`],
                ...data.divisi.map((d) => [d.nama, `${d.anggota.length} anggota`] as const),
                ["Total", `${totalPengurus} pengurus`],
              ].map(([kunci, nilai]) => (
                <div key={kunci}>
                  <span className="font-serif text-xl text-ink">{kunci}</span>
                  <span className="font-sans text-[12px] text-ink-muted">{nilai}</span>
                </div>
              ))}
            </div>
          </Naik>
        </div>
      </section>

      {/* ── Organization chart ── */}
      <section aria-label="Bagan organisasi HMTI" className="w-full bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:py-24 lg:px-10">
          <BaganOrganisasi data={data} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full bg-canvas py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-10">
          <Naik>
            <div className="relative overflow-hidden bg-ink p-8 text-white lg:p-12">
              <div className="max-w-2xl space-y-4">
                <LabelTag>
                  <span className="text-signal">Keterbukaan Kolaborasi &amp; Aspirasi</span>
                </LabelTag>
                <h2 className="font-serif text-3xl leading-snug tracking-[-0.015em] sm:text-4xl">
                  Ingin terlibat dalam kegiatan HMTI Margonda?
                </h2>
                <p className="text-lg leading-7 text-white/75">
                  Pintu sekretariat selalu terbuka bagi mahasiswa yang ingin berkontribusi, mengajukan gagasan, atau
                  menjajaki kolaborasi bersama pengurus.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/kontak"
                    className="inline-flex h-11 items-center gap-2 bg-signal px-6 text-sm font-semibold text-ink transition-colors hover:bg-white"
                  >
                    <IkonKecil nama="kirim" ukuran={18} />
                    Hubungi Pengurus
                  </Link>
                  <a
                    href="https://maps.google.com/?q=Universitas+Bina+Sarana+Informatika+Kampus+Margonda"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 bg-white/10 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    <IkonKecil nama="lokasi" ukuran={18} />
                    Kunjungi Sekretariat
                  </a>
                </div>
              </div>
            </div>
          </Naik>
        </div>
      </section>
    </div>
  );
}
