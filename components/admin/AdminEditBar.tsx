"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAppwriteConfigured } from "@/lib/appwrite/client";
import { getAdminAccess } from "@/lib/appwrite/admin";

type AdminAccess = "guest" | "forbidden" | "ok";

// Peta rute publik → modul admin yang mengelola konten halaman tersebut.
const PETA_MODUL: { cocok: (p: string) => boolean; href: string; label: string }[] = [
  { cocok: (p) => p === "/proker", href: "/admin/proker", label: "Program kerja" },
  { cocok: (p) => p.startsWith("/berita"), href: "/admin/berita", label: "Berita" },
  { cocok: (p) => p === "/struktur", href: "/admin/struktur", label: "Struktur" },
  { cocok: (p) => p === "/visi-misi", href: "/admin/visi-misi", label: "Visi & misi" },
  { cocok: (p) => p === "/", href: "/admin/media", label: "Gambar halaman" },
];

// Halaman yang memakai slot gambar site_images (hero beranda dipakai lintas
// halaman), sehingga tautan "Ganti gambar" tetap relevan di mana pun.
const HALAMAN_BERGAMBAR = new Set(["/", "/tentang", "/proker"]);

// Bar edit untuk pengurus: hanya muncul saat sesi admin aktif, menautkan
// halaman publik yang sedang dilihat ke modul admin yang mengelolanya.
export default function AdminEditBar() {
  const pathname = usePathname();
  const [access, setAccess] = useState<AdminAccess | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (!isAppwriteConfigured()) return;
    let aktif = true;
    getAdminAccess().then((hasil) => {
      if (aktif) setAccess(hasil);
    });
    return () => {
      aktif = false;
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;
  if (access !== "ok") return null;

  const modul = PETA_MODUL.find((m) => m.cocok(pathname));

  return (
    <aside className="admin-editbar" aria-label="Aksi admin untuk halaman ini">
      <span className="admin-editbar-chip">
        <span className="admin-editbar-dot" aria-hidden="true" />
        Mode admin
      </span>
      {modul ? (
        <Link href={modul.href} className="admin-editbar-link">
          Kelola {modul.label}
        </Link>
      ) : null}
      {HALAMAN_BERGAMBAR.has(pathname) ? (
        <Link href="/admin/media" className="admin-editbar-link">
          Ganti gambar
        </Link>
      ) : null}
      <Link href="/admin" className="admin-editbar-link admin-editbar-link--ghost">
        Dashboard
      </Link>
    </aside>
  );
}
