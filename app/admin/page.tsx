"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Databases, Query } from "appwrite";
import type { Models } from "appwrite";
import { motion, useReducedMotion } from "motion/react";
import { getAppwriteClient } from "@/lib/appwrite/client";
import {
  APPWRITE_DATABASE_ID,
  COLL_COLLAB_MESSAGES,
  COLL_COLLAB_SIGNALS,
  COLL_PAGE_VIEWS,
} from "@/lib/appwrite/schema";
import type { PageViewDoc, CollabSignalDoc, CollabMessageDoc } from "@/lib/appwrite/types";
import {
  halamanTerpopuler,
  jumlahKunjungan,
  jumlahPerangkatUnik,
  kunjunganHarian,
  sebaranPerangkat,
  type TitikHarian,
} from "@/lib/analytics";
// Status tindak lanjut dan catatan pengajuan dikelola di modul tersendiri
// (/admin/kolaborasi); dashboard hanya menampilkan jumlahnya lalu menautkannya.
import { normalisasiStatus } from "@/lib/kolaborasi";

/* ---------- Data fetchers ---------- */

// Appwrite membatasi satu listDocuments maksimal 100 dokumen per permintaan —
// limit yang lebih besar dari itu diam-diam dipotong jadi 100. Karena itu data
// diambil per halaman sampai total habis (atau batas pengaman tercapai), dan
// total sebenarnya ikut dikembalikan supaya angka dashboard tidak pernah
// menyamar sebagai jumlah utuh padahal terpotong.
const BATAS_HALAMAN = 10; // pengaman: 10 × 100 = 1.000 catatan terbaru

type HasilList<T> = { dokumen: T[]; total: number };

async function listBertahap<T extends Models.Document>(
  collectionId: string,
  queries: string[],
  batasHalaman = BATAS_HALAMAN
): Promise<HasilList<T>> {
  const db = new Databases(getAppwriteClient());
  const dokumen: T[] = [];
  let total = 0;
  for (let halaman = 0; halaman < batasHalaman; halaman += 1) {
    const res = await db.listDocuments<T>(APPWRITE_DATABASE_ID, collectionId, [
      ...queries,
      Query.limit(100),
      Query.offset(halaman * 100),
    ]);
    total = res.total;
    dokumen.push(...res.documents);
    if (res.documents.length === 0 || dokumen.length >= total) break;
  }
  return { dokumen, total };
}

// Urutan naik per $createdAt membuat halaman tetap stabil walau ada kunjungan
// baru masuk di tengah pengambilan: baris baru menempel di ujung, bukan
// menggeser isi halaman sebelumnya.
async function fetchViews(days: number): Promise<HasilList<PageViewDoc>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return listBertahap<PageViewDoc>(COLL_PAGE_VIEWS, [
    Query.greaterThanEqual("$createdAt", cutoff.toISOString()),
    Query.orderAsc("$createdAt"),
  ]);
}

async function fetchSignals(days: number): Promise<HasilList<CollabSignalDoc>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return listBertahap<CollabSignalDoc>(COLL_COLLAB_SIGNALS, [
    Query.greaterThanEqual("$createdAt", cutoff.toISOString()),
    Query.orderAsc("$createdAt"),
  ]);
}

// Proposal kolaborasi dari form /kontak — terbaru dulu, tandai belum dibaca.
async function fetchProposals(): Promise<HasilList<CollabMessageDoc>> {
  return listBertahap<CollabMessageDoc>(COLL_COLLAB_MESSAGES, [Query.orderDesc("$createdAt")], 5);
}

/* ---------- Charts (SVG, no lib) ---------- */

// Semua angka di bawah dihitung dari identitas perangkat/sesi di
// lib/analytics.ts — satu perangkat yang membuka banyak halaman tidak lagi
// terlihat sebagai banyak pengunjung.

function LineChart({ data, height = 180 }: { data: TitikHarian[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 100 / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => `${i * w},${100 - (d.count / max) * 85}`).join(" ");
  const areaPoints = `0,100 ${points} ${(data.length - 1) * w},100`;

  return (
    <div className="dash-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="dash-chart-svg" style={{ height }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-steel)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--color-steel)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#areaFill)" />
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-steel)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => (
          <circle
            key={d.date}
            cx={i * w}
            cy={100 - (d.count / max) * 85}
            r="2.5"
            fill="var(--color-paper)"
            stroke="var(--color-steel)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="dash-chart-labels">
        {data.map((d) => (
          <span key={d.date}>{d.date.slice(8)}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="dash-bars">
      {data.map((d) => (
        <div key={d.label} className="dash-bar-row">
          <span className="dash-bar-label">{d.label}</span>
          <div className="dash-bar-track">
            <motion.div
              className="dash-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="dash-bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 40;
  const c = 2 * Math.PI * r;
  const colors = ["var(--color-steel)", "var(--color-signal)", "var(--color-ink-muted)"];
  // offset segmen dihitung fungsional via reduce — react-compiler melarang
  // reassign variabel (let) di dalam render.
  const segmen = data.reduce<{ d: { label: string; value: number }; dash: number; start: number; warna: string }[]>(
    (list, d, i) => {
      const frac = total ? d.value / total : 0;
      const dash = frac * c;
      const start = list.reduce((s, prev) => s + prev.dash, 0);
      return [...list, { d, dash, start, warna: colors[i % colors.length] }];
    },
    [],
  );

  return (
    <div className="dash-donut-wrap">
      <svg viewBox="0 0 100 100" className="dash-donut">
        {segmen.map(({ d, dash, start, warna }) => (
          <circle
            key={d.label}
            r={r}
            cx="50"
            cy="50"
            fill="none"
            stroke={warna}
            strokeWidth="14"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-start}
            strokeLinecap="butt"
            transform="rotate(-90 50 50)"
          />
        ))}
        <text x="50" y="52" textAnchor="middle" className="dash-donut-total">
          {total}
        </text>
      </svg>
      <div className="dash-donut-legend">
        {data.map((d, i) => (
          <div key={d.label} className="dash-donut-item">
            <span className="dash-donut-swatch" style={{ background: colors[i % colors.length] }} />
            <span>{d.label}</span>
            <span className="dash-donut-num">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- UI primitives ---------- */

function StatCard({
  label,
  value,
  sub,
  href,
  delay,
}: {
  label: string;
  value: number;
  sub?: string;
  href?: string;
  delay: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => (reduce ? value : 0));
  const ref = useRef({ from: 0 });

  useEffect(() => {
    if (reduce) {
      const raf = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const from = ref.current.from;
    const dur = 800;
    let raf = 0;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else ref.current.from = value;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  const inner = (
    <>
      <span className="dash-stat-label">{label}</span>
      <span className="dash-stat-value">{display}</span>
      {sub ? <span className="dash-stat-sub">{sub}</span> : null}
    </>
  );

  const cls = "dash-stat";
  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: delay * 0.06, ease: [0.16, 1, 0.3, 1] as const },
      };

  if (href) {
    return (
      <motion.div {...motionProps}>
        <Link href={href} className={cls}>
          {inner}
        </Link>
      </motion.div>
    );
  }
  return (
    <motion.div className={cls} {...motionProps}>
      {inner}
    </motion.div>
  );
}

/* ---------- Page ---------- */

export default function AdminDashboardPage() {
  const reduce = useReducedMotion();
  const [views, setViews] = useState<PageViewDoc[]>([]);
  const [signals, setSignals] = useState<CollabSignalDoc[]>([]);
  const [proposals, setProposals] = useState<CollabMessageDoc[] | null>(null);
  // Total sebenarnya dari Appwrite (res.total) — bisa lebih besar dari array
  // yang termuat bila data melebihi batas halaman pada fetchers di atas.
  const [totalViews, setTotalViews] = useState(0);
  const [totalSignals, setTotalSignals] = useState(0);
  const [totalProposals, setTotalProposals] = useState(0);
  const [gagal, setGagal] = useState(false);
  const [tanggal, setTanggal] = useState<string | null>(null);
  const [mereset, setMereset] = useState(false);
  const [jumlahDihapus, setJumlahDihapus] = useState<number | null>(null);
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [resetGagal, setResetGagal] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTanggal(
        new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())
      );
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const [vHasil, sHasil, pHasil] = await Promise.all([
          fetchViews(7),
          fetchSignals(7),
          fetchProposals().catch(() => ({ dokumen: [] as CollabMessageDoc[], total: 0 })),
        ]);
        if (!aktif) return;
        setViews(vHasil.dokumen);
        setTotalViews(vHasil.total);
        setSignals(sHasil.dokumen);
        setTotalSignals(sHasil.total);
        setProposals(pHasil.dokumen);
        setTotalProposals(pHasil.total);
      } catch {
        if (aktif) setGagal(true);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  // Semua turunan di bawah memakai identitas perangkat/sesi, bukan jumlah
  // catatan halaman — satu desktop yang membuka 30 halaman tetap 1 perangkat.
  const viewSeries = useMemo(() => kunjunganHarian(views), [views]);
  const deviceData = useMemo(() => sebaranPerangkat(views), [views]);
  const totalPerangkat = useMemo(() => jumlahPerangkatUnik(views), [views]);
  const totalKunjungan = useMemo(() => jumlahKunjungan(views), [views]);
  const topPagesData = useMemo(() => halamanTerpopuler(views), [views]);
  const totalSinyalTermuat = signals.length;
  // Sebagian data tidak termuat bila melebihi batas pengambilan — angka ini
  // hanya dipakai untuk memilih catatan kejujuran di UI, bukan untuk hitungan.
  const terpotong =
    totalViews > views.length ||
    totalSignals > totalSinyalTermuat ||
    totalProposals > (proposals?.length ?? 0);
  const belumDibaca =
    proposals?.filter((p) => normalisasiStatus(p.status, p.sudah_dibaca) === "baru").length ?? 0;
  // Berapa halaman yang dibuka satu perangkat: konteks kenapa angkanya beda
  // dengan total kunjungan.
  const halamanPerPerangkat = totalPerangkat ? (views.length / totalPerangkat).toFixed(1) : "0";

  // Atur ulang data kunjungan: hapus catatan lama yang belum punya identitas
  // perangkat, supaya dashboard dihitung dari nol dengan aturan baru.
  async function handleResetKunjungan() {
    if (mereset) return;
    if (!window.confirm("Hapus semua catatan kunjungan? Angka dashboard akan dihitung ulang dari nol.")) {
      return;
    }
    setMereset(true);
    setResetGagal(false);
    setResetInfo(null);
    setJumlahDihapus(0);
    const db = new Databases(getAppwriteClient());
    let dihapus = 0;
    try {
      // Appwrite tidak punya hapus massal: ambil per 100 lalu hapus satu-satu.
      for (;;) {
        const res = await db.listDocuments<PageViewDoc>(APPWRITE_DATABASE_ID, COLL_PAGE_VIEWS, [
          Query.limit(100),
        ]);
        if (res.documents.length === 0) break;
        for (const doc of res.documents) {
          await db.deleteDocument(APPWRITE_DATABASE_ID, COLL_PAGE_VIEWS, doc.$id);
          dihapus += 1;
        }
        setJumlahDihapus(dihapus);
      }
      setViews([]);
      setResetInfo(`${dihapus} catatan kunjungan lama dihapus. Angka baru mulai dari kunjungan berikutnya.`);
    } catch {
      setResetGagal(true);
    } finally {
      setMereset(false);
    }
  }

  const masuk = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className="dash-wrap">
      <motion.header className="dash-masthead" {...masuk(0)}>
        <div>
          <p className="dash-index">01 / Ringkasan & analitik</p>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-lede">
            Kelola konten, pantau kunjungan, dan deteksi minat kolaborasi dari satu tempat.
          </p>
        </div>
        <div className="dash-meta">
          <span className="dash-meta-date">{tanggal ?? "\u00a0"}</span>
          <span className="dash-meta-sub">Portal HMTI UBSI Margonda</span>
        </div>
      </motion.header>

      {gagal ? (
        <p role="alert" className="dash-error">
          Gagal memuat data — periksa koneksi dan permission Appwrite.
        </p>
      ) : (
        <>
          {/* Stat cards */}
          <motion.section className="dash-stats" aria-label="Statistik utama" {...masuk(1)}>
            <StatCard label="Total kunjungan" value={totalPerangkat} sub="perangkat berbeda · 7 hari" delay={0} />
            <StatCard label="Sesi kunjungan" value={totalKunjungan} sub="buka ulang dihitung baru" delay={1} />
            <StatCard label="Sinyal kolaborasi" value={totalSignals} sub="klik / form kontak" delay={2} />
            <StatCard label="Proposal masuk" value={totalProposals} sub={`${belumDibaca} berstatus baru`} delay={3} />
          </motion.section>
          {terpotong ? (
            <p className="dash-panel-sub" role="status">
              Data melebihi batas pemuatan — kartu di atas memakai total sebenarnya dari Appwrite,
              sedangkan grafik dihitung dari catatan yang berhasil dimuat.
            </p>
          ) : null}

          {/* Charts row */}
          <motion.section className="dash-analytics" aria-label="Analitik" {...masuk(2)}>
            <div className="dash-panel dash-panel--chart">
              <div className="dash-panel-head">
                <h2>Kunjungan harian</h2>
                <span className="dash-panel-sub">perangkat berbeda per hari</span>
              </div>
              <LineChart data={viewSeries} />
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Perangkat</h2>
                <span className="dash-panel-sub">perangkat unik per jenis</span>
              </div>
              {deviceData.length > 0 ? (
                <DonutChart data={deviceData} />
              ) : (
                <p className="dash-empty-note">Belum ada data perangkat.</p>
              )}
            </div>
          </motion.section>

          {/* Second row: top pages + signals */}
          <motion.section className="dash-analytics" aria-label="Detail kunjungan" {...masuk(3)}>
            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Halaman terpopuler</h2>
                <span className="dash-panel-sub">kunjungan unik per halaman</span>
              </div>
              {topPagesData.length > 0 ? (
                <BarChart data={topPagesData.map((p) => ({ label: p.page, value: p.count }))} />
              ) : (
                <p className="dash-empty-note">Belum ada kunjungan tercatat.</p>
              )}
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Sinyal kolaborasi</h2>
                <span className="dash-panel-sub">interaksi kontak</span>
              </div>
              {signals.length > 0 ? (
                <ul className="dash-signal-list">
                  {signals.slice(0, 5).map((s) => (
                    <li key={s.$id} className="dash-signal-row">
                      <span className="dash-signal-type">{s.signal_type.replace(/_/g, " ")}</span>
                      <span className="dash-signal-page">{s.source_page}</span>
                      <time className="dash-signal-time" dateTime={s.$createdAt}>
                        {new Date(s.$createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dash-empty-note">Belum ada sinyal kolaborasi.</p>
              )}
            </div>
          </motion.section>

          {/* Pengelolaan pengajuan pindah ke modul tersendiri agar dashboard tetap
              ringkas: kartu di bawah hanya menautkan ke arsipnya. */}
          <motion.section className="dash-activity" aria-label="Laporan kolaborasi" {...masuk(4)}>
            <div className="dash-activity-head">
              <h2>
                Laporan kolaborasi
                {belumDibaca > 0 ? <span className="dash-proposal-badge">{belumDibaca} baru</span> : null}
              </h2>
              <span className="dash-panel-sub">arsip pengajuan · cetak PDF</span>
            </div>
            <p className="dash-log-empty">
              {proposals === null
                ? "Memuat pengajuan…"
                : proposals.length === 0
                  ? "Belum ada pengajuan kolaborasi. Kiriman dari halaman kontak akan muncul di modul Laporan Kolaborasi."
                  : proposals.length === totalProposals
                    ? `${proposals.length} pengajuan tersimpan dari form halaman kontak. Ubah status tindak lanjut, isi catatan internal, dan cetak laporannya jadi PDF di modul khusus.`
                    : `${proposals.length} pengajuan terbaru dari total ${totalProposals} tersimpan. Arsip lengkap, ubah status, dan cetak PDF ada di modul khusus.`}
            </p>
            <div className="dash-reset-row">
              <Link href="/admin/kolaborasi" className="dash-reset-btn">
                Buka laporan kolaborasi
              </Link>
            </div>
          </motion.section>

          {/* Data mentah: penjelasan aturan hitung + tombol atur ulang. */}
          <motion.section className="dash-activity" aria-label="Data mentah analitik" {...masuk(5)}>
            <div className="dash-activity-head">
              <h2>Aturan hitung kunjungan</h2>
              <span className="dash-panel-sub">
                {totalViews > views.length
                  ? `${views.length} dari ${totalViews} catatan halaman · 7 hari`
                  : `${views.length} catatan halaman · 7 hari`}
              </span>
            </div>
            <p className="dash-log-empty">
              Satu perangkat dihitung sekali sebagai pengunjung, berapa pun halaman yang dibukanya
              (rata-rata {halamanPerPerangkat} halaman per perangkat). Identitas perangkat dibuat
              acak di browser pengunjung — bukan alamat IP.
            </p>
            {resetInfo ? (
              <p className="dash-reset-note" role="status">
                {resetInfo}
              </p>
            ) : null}
            {resetGagal ? (
              <p className="dash-reset-note" role="alert" data-gagal="true">
                Gagal menghapus catatan lama — periksa permission write(team:admin) pada koleksi
                page_views.
              </p>
            ) : null}
            <div className="dash-reset-row">
              <button
                type="button"
                className="dash-reset-btn"
                onClick={handleResetKunjungan}
                disabled={mereset}
              >
                {mereset ? `Menghapus… ${jumlahDihapus ?? 0}` : "Atur ulang data kunjungan"}
              </button>
              <p className="dash-reset-hint">
                Menghapus seluruh catatan kunjungan lama. Proposal kolaborasi tidak tersentuh.
              </p>
            </div>
          </motion.section>
        </>
      )}
    </div>
  );
}
