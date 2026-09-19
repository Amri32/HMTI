"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Account } from "appwrite";
import { useRouter, useSearchParams } from "next/navigation";
import { getAppwriteClient, isAppwriteConfigured } from "@/lib/appwrite/client";
import { ADMIN_SESI_EVENT, getAdminAccess } from "@/lib/appwrite/admin";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import AdminRecoveryFlow from "@/components/admin/AdminRecoveryFlow";

// Form login admin: dipakai halaman /admin/login dan guard RequireAdmin
// (dirender inline di rute admin mana pun saat sesi belum ada).
export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"masuk" | "lupa">("masuk");
  const [tokenDiabaikan, setTokenDiabaikan] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tautan reset dari email membawa userId dan secret. Kehadirannya langsung
  // membuka langkah setel sandi, tanpa perlu klik tambahan.
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");
  const token = !tokenDiabaikan && userId && secret ? { userId, secret } : null;

  function kembaliKeMasuk() {
    setMode("masuk");
    setTokenDiabaikan(true);
    // Parameter token dibuang dari address bar supaya alur tidak terbuka lagi
    // memakai secret yang sudah terpakai.
    if (window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  async function masuk(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setError(null);
    try {
      if (!isAppwriteConfigured()) {
        setError("Appwrite belum dikonfigurasi di .env.local.");
        return;
      }
      const account = new Account(getAppwriteClient());
      try {
        await Promise.race([
          account.createEmailPasswordSession(email.trim(), password),
          new Promise<never>((_, reject) => {
            window.setTimeout(() => reject(new Error("APPWRITE_TIMEOUT")), 10000);
          }),
        ]);
      } catch (error: unknown) {
        // Appwrite menolak pembuatan sesi baru bila sesi masih aktif
        // (mis. login ulang tanpa logout). Itu bukan kredensial yang salah:
        // verifikasi sesi yang ada, lalu lanjut ke panel.
        const errType =
          typeof error === "object" && error !== null && "type" in error
            ? (error as { type?: string }).type
            : undefined;
        if (errType !== "user_session_already_exists") {
          throw error;
        }
        await account.get();
      }
      const access = await getAdminAccess();
      if (access !== "ok") {
        await account.deleteSession("current");
        setError("Akun ini tidak memiliki akses admin HMTI.");
        return;
      }
      // Guard hanya memeriksa ulang sesi saat pathname berubah atau saat
      // event ini dikirim. Dua kasus yang dilayani:
      // - Login inline di rute admin (pathname sama): event membuat guard
      //   memeriksa ulang lalu langsung menampilkan panel, tanpa refresh.
      // - Login di halaman /admin/login: pindah ke /admin lewat router.
      window.dispatchEvent(new Event(ADMIN_SESI_EVENT));
      router.replace("/admin");
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: number }).code
          : undefined;
      setError(
        code === 401
          ? "Email atau kata sandi salah."
          : error instanceof Error && error.message === "APPWRITE_TIMEOUT"
            ? "Appwrite tidak merespons. Pastikan server berjalan dan Web Platform Appwrite mengizinkan localhost:3000."
            : "Login gagal terhubung ke Appwrite. Periksa alamat endpoint dan Web Platform project."
      );
    } finally {
      setSibuk(false);
    }
  }

  if (mode === "lupa" || token) {
    return (
      <AdminRecoveryFlow token={token} onKembali={kembaliKeMasuk} />
    );
  }

  return (
    <AdminAuthShell headingId="login-heading">
      <Link href="/" className="admin-login-back">
        Kembali ke situs
      </Link>
      <p className="admin-login-eyebrow">Akses terbatas / admin</p>
      <h2 id="login-heading">Masuk ke panel</h2>
      <p className="admin-login-description">
        Gunakan akun pengurus yang sudah terdaftar. Panel ini tidak menyediakan pendaftaran umum.
      </p>

      <form onSubmit={masuk} className="admin-login-form">
        <div className="admin-login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-control"
            placeholder="nama@bsi.ac.id"
          />
        </div>

        <div className="admin-login-field">
          <label htmlFor="password">Kata sandi</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-control"
            placeholder="Masukkan kata sandi"
          />
        </div>

        {error ? (
          <p role="alert" className="admin-login-error">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={sibuk} className="admin-login-submit">
          <span>{sibuk ? "Memeriksa akses…" : "Masuk ke ruang kerja"}</span>
          <span aria-hidden="true">↗</span>
        </button>
      </form>

      <div className="admin-login-help">
        <button type="button" className="admin-login-text-action" onClick={() => setMode("lupa")}>
          Lupa kata sandi? Kirim tautan reset
        </button>
        <p>
          Belum punya akun pengurus? Ajukan lewat{" "}
          <a href="mailto:hmti.ubsi.margonda@gmail.com">hmti.ubsi.margonda@gmail.com</a>.
        </p>
      </div>
    </AdminAuthShell>
  );
}
