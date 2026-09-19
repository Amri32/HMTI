const BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// "2024-05-20" atau ISO → "20 Mei 2024". Jika tidak bisa di-parse, kembalikan input apa adanya.
export function formatTanggalId(nilai: string): string {
  const tanggal = new Date(nilai);
  if (Number.isNaN(tanggal.getTime())) return nilai;
  return `${tanggal.getDate()} ${BULAN_ID[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// ISO → "Sabtu, 29 Agustus 2026" (dengan nama hari — dipakai detail proker
// selesai, konsisten dengan format pengumuman pelaksanaan).
export function formatTanggalLengkapId(nilai: string): string {
  const tanggal = new Date(nilai);
  if (Number.isNaN(tanggal.getTime())) return nilai;
  return `${HARI_ID[tanggal.getDay()]}, ${formatTanggalId(nilai)}`;
}
