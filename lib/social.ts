// Normalisasi handle kanal sosial yang diisi admin lewat panel Pengaturan.
// Nilai mentah boleh berupa "@nama", "nama", atau URL profil lengkap — semuanya
// dirapikan jadi handle polos sebelum dipakai membentuk tautan publik, sehingga
// tidak ada nilai aneh yang pernah sampai ke atribut href halaman publik.

export type SocialPlatform = "instagram";

export const SOCIAL_PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
};

// URL profil Instagram (opsional http/www, dengan query seperti ?igsh=...).
const DARI_URL_PROFIL = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/i;
// Aturan handle Instagram: huruf, angka, titik, garis bawah; maks 30 karakter.
const HANDLE_SAH = /^[A-Za-z0-9._]{1,30}$/;

export function normalizeInstagramHandle(input: string | null | undefined): string | null {
  if (!input) return null;
  let nilai = input.trim();
  if (!nilai) return null;

  const dariUrl = nilai.match(DARI_URL_PROFIL);
  if (dariUrl) nilai = dariUrl[1];
  nilai = nilai.replace(/^@+/, "");

  if (!HANDLE_SAH.test(nilai)) return null;
  // Titik tidak boleh di awal/akhir maupun berturut-turut (aturan Instagram).
  if (/^\.|\.$|\.\./.test(nilai)) return null;
  return nilai;
}

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
}
