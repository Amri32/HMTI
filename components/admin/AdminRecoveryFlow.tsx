"use client";

import { useState, type FormEvent } from "react";
import { Account } from "appwrite";
import { getAppwriteClient, isAppwriteConfigured } from "@/lib/appwrite/client";
import AdminAuthShell from "@/components/admin/AdminAuthShell";

const SANDAI_MIN = 8;

export type RecoveryToken = { userId: string; secret: string };

// Alur lupa sandi memakai token bawaan Appwrite:
// 1. createRecovery() mengirim email berisi tautan balik ke /admin/login dengan
//    parameter userId dan secret. Tautannya berlaku 1 jam.
// 2. Saat halaman dibuka dengan parameter itu, updateRecovery() menetapkan sandi baru.
// Token dioper sebagai prop dari AdminLoginForm, yang merupakan satu-satunya
// pembaca useSearchParams, supaya komponen ini tetap murni tampilan.
export default function AdminRecoveryFlow({
  token,
  onKembali,
}: {
  token: RecoveryToken | null;
  onKembali: () => void;
}) {
  const [cariTautanBaru, setCariTautanBaru] = useState(false);
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);

  const langkah = token && !cariTautanBaru ? "setel" : "minta";

  function kembali() {
    setError(null);
    setSukses(false);
    setTerkirim(null);
    setCariTautanBaru(false);
    onKembali();
  }

  async function mintaTautan(e: FormEvent) {
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
      await account.createRecovery(email.trim(), `${window.location.origin}/admin/login`);
      setTerkirim(email.trim());
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? (err as { code?: number }).code
          : undefined;
      // 404 berarti email itu tidak terdaftar. Balasannya sengaja dibuat sama
      // dengan kasus email terdaftar supaya halaman ini tidak bisa dipakai
      // menebak alamat akun pengurus (lihat ADMIN_SCOPE.md).
      if (code === 404) {
        setTerkirim(email.trim());
      } else {
        setError("Permintaan reset gagal dikirim. Periksa koneksi lalu coba lagi.");
      }
    } finally {
      setSibuk(false);
    }
  }

  async function setelSandi(e: FormEvent) {
    e.preventDefault();
    if (sibuk || !token) return;
    if (sandi.length < SANDAI_MIN) {
      setError(`Kata sandi minimal ${SANDAI_MIN} karakter.`);
      return;
    }
    if (sandi !== ulangi) {
      setError("Ulangi kata sandi belum sama.");
      return;
    }
    setSibuk(true);
    setError(null);
    try {
      const account = new Account(getAppwriteClient());
      await account.updateRecovery(token.userId, token.secret, sandi);
      setSukses(true);
      setSandi("");
      setUlangi("");
    } catch {
      setError(
        "Tautan reset sudah kedaluwarsa atau tidak valid. Minta tautan baru, lalu buka tautan terbaru dari email."
      );
    } finally {
      setSibuk(false);
    }
  }

  if (sukses) {
    return (
      <AdminAuthShell headingId="recovery-heading">
        <p className="admin-login-eyebrow">Akses pengurus / pemulihan</p>
        <h2 id="recovery-heading">Kata sandi tersimpan</h2>
        <p className="admin-login-description">
          Kata sandi baru sudah aktif. Masuk kembali dengan kata sandi itu untuk membuka panel.
        </p>
        <button type="button" className="admin-login-submit admin-login-submit-standalone" onClick={kembali}>
          <span>Ke halaman masuk</span>
          <span aria-hidden="true">↗</span>
        </button>
      </AdminAuthShell>
    );
  }

  if (langkah === "setel" && token) {
    return (
      <AdminAuthShell headingId="recovery-heading">
        <button type="button" className="admin-login-text-action" onClick={kembali}>
          Kembali ke halaman masuk
        </button>
        <p className="admin-login-eyebrow">Akses pengurus / sandi baru</p>
        <h2 id="recovery-heading">Buat kata sandi baru</h2>
        <p className="admin-login-description">
          Tautan dari email hanya berlaku satu jam. Setelah tersimpan, pakai kata sandi ini untuk
          masuk ke panel.
        </p>

        <form onSubmit={setelSandi} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="password-baru">Kata sandi baru</label>
            <input
              id="password-baru"
              type="password"
              autoComplete="new-password"
              minLength={SANDAI_MIN}
              autoFocus
              required
              value={sandi}
              onChange={(e) => setSandi(e.target.value)}
              className="admin-control"
              placeholder={`Minimal ${SANDAI_MIN} karakter`}
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="password-ulangi">Ulangi kata sandi baru</label>
            <input
              id="password-ulangi"
              type="password"
              autoComplete="new-password"
              minLength={SANDAI_MIN}
              required
              value={ulangi}
              onChange={(e) => setUlangi(e.target.value)}
              className="admin-control"
              placeholder={`Minimal ${SANDAI_MIN} karakter`}
            />
          </div>

          {error ? (
            <p role="alert" className="admin-login-error">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={sibuk} className="admin-login-submit">
            <span>{sibuk ? "Menyimpan…" : "Simpan kata sandi baru"}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <div className="admin-login-help">
          <button
            type="button"
            className="admin-login-text-action"
            onClick={() => {
              setCariTautanBaru(true);
              setError(null);
            }}
          >
            Tautan kedaluwarsa? Minta tautan baru
          </button>
        </div>
      </AdminAuthShell>
    );
  }

  return (
    <AdminAuthShell headingId="recovery-heading">
      <button type="button" className="admin-login-text-action" onClick={kembali}>
        Kembali ke halaman masuk
      </button>
      <p className="admin-login-eyebrow">Akses pengurus / pemulihan</p>
      <h2 id="recovery-heading">Kirim tautan reset</h2>
      <p className="admin-login-description">
        Masukkan email akun pengurus Anda. Kami kirim tautan untuk membuat kata sandi baru, berlaku
        satu jam sejak dikirim.
      </p>

      <form onSubmit={mintaTautan} className="admin-login-form">
        <div className="admin-login-field">
          <label htmlFor="recovery-email">Email akun pengurus</label>
          <input
            id="recovery-email"
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

        {terkirim ? (
          <p role="status" className="admin-login-note">
            Kalau {terkirim} terdaftar sebagai pengurus, tautan reset sudah dikirim ke alamat itu.
            Cek juga folder spam. Belum menerima? Tunggu satu menit, lalu kirim ulang.
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="admin-login-error">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={sibuk} className="admin-login-submit">
          <span>{sibuk ? "Mengirim…" : "Kirim tautan reset"}</span>
          <span aria-hidden="true">↗</span>
        </button>
      </form>

      <p className="admin-login-help">
        Belum punya akun pengurus? Ajukan lewat{" "}
        <a href="mailto:hmti.ubsi.margonda@gmail.com">hmti.ubsi.margonda@gmail.com</a>.
      </p>
    </AdminAuthShell>
  );
}
