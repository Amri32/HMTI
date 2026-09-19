"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isAppwriteConfigured } from "@/lib/appwrite/client";
import { getAdminAccess } from "@/lib/appwrite/admin";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminShell from "@/components/admin/AdminShell";

type State =
  | { status: "checking" }
  | { status: "guest" }
  | { status: "forbidden" }
  | { status: "ok" };

// Guard panel admin: guest melihat form login inline di rute yang diminta,
// bukan member team admin ditolak.
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const unconfigured = !isAppwriteConfigured();
  // Tanpa konfigurasi Appwrite tidak ada sesi untuk diverifikasi: mulai dari guest.
  const [state, setState] = useState<State>(
    unconfigured ? { status: "guest" } : { status: "checking" }
  );

  useEffect(() => {
    if (pathname === "/admin/login" || unconfigured) return;
    let aktif = true;
    getAdminAccess().then((access) => {
      if (!aktif) return;
      setState(
        access === "ok"
          ? { status: "ok" }
          : access === "guest"
            ? { status: "guest" }
            : { status: "forbidden" }
      );
    });
    return () => {
      aktif = false;
    };
  }, [pathname, unconfigured]);

  // Halaman login tidak di-guard oleh shell admin.
  if (pathname === "/admin/login") return <>{children}</>;

  if (state.status === "checking") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-canvas"
        role="status"
        aria-label="Memeriksa sesi admin"
      >
        <span className="admin-guard-spinner" aria-hidden="true" />
        <span className="sr-only">Memeriksa sesi admin…</span>
      </div>
    );
  }

  // Guest: form login langsung tampil di rute admin mana pun.
  if (state.status === "guest") {
    return <AdminLoginForm />;
  }

  if (state.status === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-5">
        <div className="w-full max-w-lg border border-hairline bg-surface p-8">
          <h1 className="font-serif text-2xl leading-snug text-ink">Akses ditolak</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Akun ini tidak memiliki peran admin. Hubungi pengurus HMTI bila Anda merasa ini keliru.
          </p>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
