"use client";

// Tracker kunjungan halaman publik: satu titik pemasangan di SiteChrome,
// menggantikan trackPageView manual per-halaman. Hook usePathname membuat
// navigasi client-side antar halaman ikut tercatat, bukan hanya reload.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/appwrite/tracking";

export default function PageViewTracker() {
  const pathname = usePathname();
  const sudah = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    // Satu catatan per pathname per sesi: navigasi bolak-balik tidak
    // menggelembungkan hit, reload tetap tercatat (state modul hilang).
    if (sudah.current.has(pathname)) return;
    sudah.current.add(pathname);
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
