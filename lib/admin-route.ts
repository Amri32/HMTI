// Utilitas redirect guard admin.
//
// Saat ini guard nyata berjalan di components/admin/RequireAdmin.tsx
// (client-side), sehingga helper ini tidak dipakai oleh app — tetapi
// dipertahankan karena menjadi kontrak perilaku redirect yang diuji oleh
// tests/content-path.test.mjs. Bila guard pindah ke middleware, helper ini
// yang menjadi titik integrasinya.
export type AdminRouteAccess = "guest" | "forbidden" | "ok" | null;

export function getAdminRedirect(
  pathname: string,
  appwriteConfigured: boolean,
  access: AdminRouteAccess
): string | null {
  if (pathname === "/admin/login") return null;
  if (!appwriteConfigured || access === "guest") return "/admin/login";
  return null;
}
