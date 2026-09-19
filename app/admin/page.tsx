"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Databases, Query } from "appwrite";
import { motion, useReducedMotion } from "motion/react";
import { getAppwriteClient } from "@/lib/appwrite/client";
import {
  APPWRITE_DATABASE_ID,
  COLL_COLLAB_MESSAGES,
  COLL_COLLAB_SIGNALS,
  COLL_PAGE_VIEWS,
} from "@/lib/appwrite/schema";
import type { PageViewDoc, CollabSignalDoc, CollabMessageDoc } from "@/lib/appwrite/types";

/* ---------- Types ---------- */

type ViewPoint = { date: string; count: number };

/* ---------- Data fetchers ---------- */

async function fetchViews(days: number): Promise<PageViewDoc[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const res = await new Databases(getAppwriteClient()).listDocuments<PageViewDoc>(
    APPWRITE_DATABASE_ID,
    COLL_PAGE_VIEWS,
    [Query.greaterThanEqual("$createdAt", cutoff.toISOString()), Query.limit(5000)]
  );
  return res.documents;
}

async function fetchSignals(days: number): Promise<CollabSignalDoc[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const res = await new Databases(getAppwriteClient()).listDocuments<CollabSignalDoc>(
    APPWRITE_DATABASE_ID,
    COLL_COLLAB_SIGNALS,
    [Query.greaterThanEqual("$createdAt", cutoff.toISOString()), Query.limit(1000)]
  );
  return res.documents;
}

// Proposal kolaborasi dari form /kontak — terbaru dulu, tandai belum dibaca.
async function fetchProposals(): Promise<CollabMessageDoc[]> {
  const res = await new Databases(getAppwriteClient()).listDocuments<CollabMessageDoc>(
    APPWRITE_DATABASE_ID,
    COLL_COLLAB_MESSAGES,
    [Query.orderDesc("$createdAt"), Query.limit(25)]
  );
  return res.documents;
}

// Tandai satu proposal sudah dibaca (write team:admin).
async function tandaiDibaca(id: string): Promise<void> {
  await new Databases(getAppwriteClient()).updateDocument(
    APPWRITE_DATABASE_ID,
    COLL_COLLAB_MESSAGES,
    id,
    { sudah_dibaca: true }
  );
}

/* ---------- Helpers ---------- */

function groupByDay(docs: { $createdAt: string }[]): ViewPoint[] {
  const map = new Map<string, number>();
  for (const d of docs) {
    const day = d.$createdAt.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  const out: ViewPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

function deviceBreakdown(docs: PageViewDoc[]): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const d of docs) {
    map.set(d.device_type, (map.get(d.device_type) ?? 0) + 1);
  }
  return [
    { label: "Desktop", value: map.get("desktop") ?? 0 },
    { label: "Mobile", value: map.get("mobile") ?? 0 },
    { label: "Tablet", value: map.get("tablet") ?? 0 },
  ].filter((d) => d.value > 0);
}

function uniqueSessions(docs: PageViewDoc[]): number {
  const set = new Set(docs.map((d) => d.session_id).filter(Boolean));
  return set.size;
}

function topPages(docs: PageViewDoc[]): { page: string; count: number }[] {
  const map = new Map<string, number>();
  for (const d of docs) {
    map.set(d.page, (map.get(d.page) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/* ---------- Charts (SVG, no lib) ---------- */

function LineChart({ data, height = 180 }: { data: ViewPoint[]; height?: number }) {
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
  const [gagal, setGagal] = useState(false);
  const [tanggal, setTanggal] = useState<string | null>(null);

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
        const [vDocs, sDocs, pDocs] = await Promise.all([
          fetchViews(7),
          fetchSignals(7),
          fetchProposals().catch(() => [] as CollabMessageDoc[]),
        ]);
        if (!aktif) return;
        setViews(vDocs);
        setSignals(sDocs);
        setProposals(pDocs);
      } catch {
        if (aktif) setGagal(true);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  const viewSeries = useMemo(() => groupByDay(views), [views]);
  const deviceData = useMemo(() => deviceBreakdown(views), [views]);
  const uniqueVisitors = useMemo(() => uniqueSessions(views), [views]);
  const topPagesData = useMemo(() => topPages(views), [views]);
  const totalViews = views.length;
  const totalSignals = signals.length;
  const belumDibaca = proposals?.filter((p) => !p.sudah_dibaca).length ?? 0;

  async function handleTandaiDibaca(id: string) {
    // Optimistic: UI langsung update, rollback bila gagal.
    const sebelum = proposals;
    setProposals((p) => p?.map((x) => (x.$id === id ? { ...x, sudah_dibaca: true } : x)) ?? null);
    try {
      await tandaiDibaca(id);
    } catch {
      setProposals(sebelum);
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
            <StatCard label="Total kunjungan" value={totalViews} sub="7 hari terakhir" delay={0} />
            <StatCard label="Perangkat unik" value={uniqueVisitors} sub="berdasarkan sesi" delay={1} />
            <StatCard label="Sinyal kolaborasi" value={totalSignals} sub="klik / form kontak" delay={2} />
            <StatCard label="Proposal masuk" value={proposals?.length ?? 0} sub={`${belumDibaca} belum dibaca`} delay={3} />
          </motion.section>

          {/* Charts row */}
          <motion.section className="dash-analytics" aria-label="Analitik" {...masuk(2)}>
            <div className="dash-panel dash-panel--chart">
              <div className="dash-panel-head">
                <h2>Kunjungan harian</h2>
                <span className="dash-panel-sub">7 hari terakhir</span>
              </div>
              <LineChart data={viewSeries} />
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Perangkat</h2>
                <span className="dash-panel-sub">distribusi sesi</span>
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
                <span className="dash-panel-sub">7 hari terakhir</span>
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

          {/* Proposal kolaborasi (pengganti aktivitas terbaru) */}
          <motion.section className="dash-activity" aria-label="Proposal kolaborasi" {...masuk(4)}>
            <div className="dash-activity-head">
              <h2>
                Proposal kolaborasi
                {belumDibaca > 0 ? <span className="dash-proposal-badge">{belumDibaca} baru</span> : null}
              </h2>
              <span className="dash-panel-sub">dari form halaman kontak</span>
            </div>
            {proposals === null ? (
              <p className="dash-log-empty">Memuat proposal…</p>
            ) : proposals.length === 0 ? (
              <p className="dash-log-empty">
                Belum ada proposal masuk. Pengajuan dari halaman kontak akan muncul di sini —
                tanpa perlu membuka Gmail.
              </p>
            ) : (
              <ul className="dash-log">
                {proposals.map((p) => (
                  <li key={p.$id} className="dash-log-row" data-unread={!p.sudah_dibaca || undefined}>
                    <span className="dash-log-dot" aria-hidden="true" />
                    <div className="dash-log-main">
                      <p className="dash-log-action">
                        {p.jenis}
                        <span className="dash-log-entity">{p.nama}</span>
                      </p>
                      <p className="dash-proposal-msg">{p.pesan}</p>
                      <p className="dash-log-actor">
                        <a href={`mailto:${p.email}`}>{p.email}</a>
                      </p>
                    </div>
                    <div className="dash-log-side">
                      <time className="dash-log-time" dateTime={p.$createdAt}>
                        {new Date(p.$createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      {!p.sudah_dibaca ? (
                        <button
                          type="button"
                          className="dash-proposal-readbtn"
                          onClick={() => handleTandaiDibaca(p.$id)}
                        >
                          Tandai dibaca
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        </>
      )}
    </div>
  );
}
