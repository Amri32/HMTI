import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

// Kerangka bersama semua layar autentikasi admin (masuk, minta tautan reset,
// setel sandi baru). Dipisah supaya blok identitas dan panelnya tidak disalin
// tiga kali, dan supaya ketiganya tetap satu bahasa visual.
export default function AdminAuthShell({
  headingId,
  children,
}: {
  headingId: string;
  children: ReactNode;
}) {
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

      <section className="admin-login-panel" aria-labelledby={headingId}>
        <div className="admin-login-panel-inner">{children}</div>
      </section>
    </div>
  );
}
