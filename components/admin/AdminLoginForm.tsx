"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Account } from "appwrite";
import { getAppwriteClient, isAppwriteConfigured } from "@/lib/appwrite/client";
import { getAdminAccess } from "@/lib/appwrite/admin";

// Form login admin: dipakai halaman /admin/login dan guard RequireAdmin
// (dirender inline di rute admin mana pun saat sesi belum ada).
export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="admin-login-page">
      <aside className="admin-login-identity">
        <Link href="/" className="admin-login-brand">
          <span className="admin-brand-mark" aria-hidden="true">
            <Image src="/hmti.png" alt="" width={44} height={44} priority />
          </span>
          <span>
            <span className="admin-login-brand-kicker">Himpunan mahasiswa</span>
            <span className="admin-login-brand-title">HMTI UBSI Margonda</span>
          </span>
        </Link>
        <div className="admin-login-statement">
          <p className="admin-login-index">01 / Akses pengurus</p>
          <h1>Kerja yang rapi dimulai dari ruang yang jelas.</h1>
          <p>
            Kelola program kerja, berita, struktur organisasi, dan media HMTI dari satu ruang
            kerja yang tertib.
          </p>
        </div>
        <div className="admin-login-identity-foot">
          <span className="admin-signal-line" aria-hidden="true" />
          <span>Portal HMTI Margonda</span>
        </div>
      </aside>

      <section className="admin-login-panel" aria-labelledby="login-heading">
        <div className="admin-login-panel-inner">
          <Link href="/" className="admin-login-back">
            Kembali ke situs
          </Link>
          <p className="admin-login-eyebrow">Akses terbatas / admin</p>
          <h2 id="login-heading">Masuk ke panel</h2>
          <p className="admin-login-description">
            Gunakan akun pengurus yang sudah terdaftar. Panel ini tidak menyediakan pendaftaran
            umum.
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

          <p className="admin-login-help">
            Kehilangan akses? Hubungi super admin HMTI melalui{" "}
            <a href="mailto:hmti.ubsi.margonda@gmail.com">hmti.ubsi.margonda@gmail.com</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
