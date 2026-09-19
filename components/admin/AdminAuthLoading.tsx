// Dipakai sebagai fallback Suspense: panel autentikasi membaca parameter
// userId/secret dari tautan reset, jadi pohon itu dirender di klien.
export default function AdminAuthLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-canvas"
      role="status"
      aria-label="Memuat form masuk"
    >
      <span className="admin-guard-spinner" aria-hidden="true" />
      <span className="sr-only">Memuat form masuk…</span>
    </div>
  );
}
