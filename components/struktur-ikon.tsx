// Ikon garis (stroke 1.7, grid 24) — satu sumber untuk halaman struktur
// publik dan form admin (dropdown pilih ikon divisi).
export type Ikon =
  | "pohon"
  | "chevron"
  | "surat"
  | "terminal"
  | "sosial"
  | "kampanye"
  | "komunitas"
  | "genggam"
  | "jadwal"
  | "mata"
  | "palu"
  | "kirim"
  | "lokasi";

export const IKON_PATH: Record<Ikon, string> = {
  pohon: "M5 19V9l8-5 8 5v10M8 19v-5h8v5M3 19h18",
  chevron: "m9 6 6 6-6 6",
  surat: "M4 6h16v12H4zM4 7l8 6 8-6",
  terminal: "m5 7 5 5-5 5M12 17h7",
  sosial: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z",
  kampanye: "M4 10v4h3l6 4V6l-6 4H4ZM17 9a4 4 0 0 1 0 6M8 18v2",
  komunitas: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19c0-2.7 2.7-4 6-4s6 1.3 6 4M14 15.3c.7-.2 1.3-.3 2-.3 2.6 0 5 1.2 5 4",
  genggam: "M8 12l3-3 2 2 3-3 4 4-6 6-3-3-3 3-4-4 4-2Z",
  jadwal: "M5 5h14v16H5V5Zm0 5h14M8 3v4m8-4v4M8 14h3v3H8z",
  mata: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Zm9 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  palu: "M13 4l7 7-2 2-7-7 2-2Zm-2 4L4 18l2 2 7-10M14 20h7",
  kirim: "M4 12l16-7-5 16-3-6-8-3Z",
  lokasi: "M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};

// Daftar ikon yang bisa dipilih admin.
export const OPSI_IKON: { value: Ikon; label: string }[] = [
  { value: "terminal", label: "Terminal — Riset & Pengembangan" },
  { value: "kampanye", label: "Kampanye — Media & Komunikasi" },
  { value: "sosial", label: "Sosial — Pengabdian Masyarakat" },
  { value: "komunitas", label: "Komunitas — Minat & Bakat" },
  { value: "genggam", label: "Genggam — Humas & Kemitraan" },
  { value: "pohon", label: "Pohon — Struktur & Kepengurusan" },
  { value: "chevron", label: "Chevron — Navigasi" },
  { value: "surat", label: "Surat — Korespondensi" },
  { value: "jadwal", label: "Jadwal — Agenda & Rapat" },
  { value: "mata", label: "Mata — Transparansi & Pengawasan" },
  { value: "palu", label: "Palu — Tata Kelola & Kode Etik" },
  { value: "kirim", label: "Kirim — Kontak & Pengiriman" },
  { value: "lokasi", label: "Lokasi — Alamat & Kedudukan" },
];
