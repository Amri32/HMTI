"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Account } from "appwrite";
import { motion, useReducedMotion } from "motion/react";
import { getAppwriteClient } from "@/lib/appwrite/client";

// Ikon digambar khusus untuk tiap modul (stroke 1.5, grid 24), bukan set library.
const IKON = {
  dashboard: "M4 4h7v9H4zM4 17h7v3H4zM13 4h7v5h-7zM13 13h7v7h-7z",
  proker: "M4 5h16M4 12h16M4 19h10M7 3v4M17 3v4",
  berita: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  struktur: "M12 4v4M12 8H6v4M12 8h6v4M4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z",
  visi: "M12 5c5 0 8 4.5 9 7-1 2.5-4 7-9 7S4 14.5 3 12c1-2.5 4-7 9-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  media: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9.5a1.5 1.5 0 1 0 0 .01",
  aktivitas: "M4 12h4l2-6 4 12 2-6h4",
} as const;

export const MODUL: { href: string; label: string; ikon: keyof typeof IKON }[] = [
  { href: "/admin", label: "Dashboard", ikon: "dashboard" },
  { href: "/admin/proker", label: "Program Kerja", ikon: "proker" },
  { href: "/admin/berita", label: "Berita", ikon: "berita" },
  { href: "/admin/struktur", label: "Struktur", ikon: "struktur" },
  { href: "/admin/visi-misi", label: "Visi & Misi", ikon: "visi" },
  { href: "/admin/media", label: "Media", ikon: "media" },
  { href: "/admin/aktivitas", label: "Log Aktivitas", ikon: "aktivitas" },
];

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      className="admin-nav-ikon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

type SidebarAdminProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
};

export default function SidebarAdmin({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapse,
}: SidebarAdminProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  async function keluar() {
    try {
      await new Account(getAppwriteClient()).deleteSession("current");
    } finally {
      router.replace("/admin/login");
    }
  }

  // Desktop: lipat/bentangkan rail. Mobile: tutup drawer.
  function tombolSidebar() {
    if (window.matchMedia("(max-width: 899px)").matches) {
      onCloseMobile();
      return;
    }
    onToggleCollapse();
  }

  return (
    <aside
      id="admin-sidebar"
      className={`admin-sidebar ${collapsed ? "is-collapsed" : ""} ${
        mobileOpen ? "is-mobile-open" : ""
      }`}
      aria-label="Navigasi panel admin"
    >
      <div className="admin-sidebar-brand">
        <Link href="/admin" className="admin-brand-link" onClick={onCloseMobile}>
          <span className="admin-brand-mark" aria-hidden="true">
            <Image src="/hmti.png" alt="" width={36} height={36} />
          </span>
          <span className="admin-brand-copy">
            <span className="admin-brand-kicker">Panel admin</span>
            <span className="admin-brand-title">HMTI Margonda</span>
          </span>
        </Link>
        <button
          type="button"
          className="admin-sidebar-collapse"
          onClick={tombolSidebar}
          aria-expanded={!collapsed}
          aria-controls="admin-sidebar"
          aria-label={collapsed ? "Tampilkan menu" : "Sembunyikan menu"}
        >
          <span className="admin-collapse-icon" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="admin-close-glyph" aria-hidden="true">
            ×
          </span>
        </button>
      </div>

      <div className="admin-sidebar-rule" />
      <p className="admin-nav-caption">Kelola situs</p>
      <nav className="admin-nav" aria-label="Modul admin">
        {MODUL.map((modul) => {
          const aktif = pathname === modul.href;
          return (
            <Link
              key={modul.href}
              href={modul.href}
              aria-current={aktif ? "page" : undefined}
              aria-label={modul.label}
              className={`admin-nav-link ${aktif ? "is-active" : ""}`}
              onClick={onCloseMobile}
            >
              <span className="admin-nav-sel" aria-hidden="true">
                {aktif ? (
                  <motion.span
                    layoutId="admin-nav-active"
                    className="admin-nav-active"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", bounce: 0.18, duration: 0.45 }
                    }
                  />
                ) : null}
              </span>
              <NavIcon path={IKON[modul.ikon]} />
              <span className="admin-nav-label">{modul.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <Link href="/" className="admin-public-link" onClick={onCloseMobile}>
          <span aria-hidden="true">↗</span>
          <span className="admin-nav-label">Lihat situs publik</span>
        </Link>
        <button type="button" onClick={keluar} className="admin-logout">
          <span className="admin-logout-mark" aria-hidden="true">
            →
          </span>
          <span className="admin-nav-label">Keluar</span>
        </button>
        <p className="admin-sidebar-note">Ruang kerja pengurus HMTI UBSI Margonda</p>
      </div>
    </aside>
  );
}
