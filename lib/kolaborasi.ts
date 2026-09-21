// Util kolaborasi halaman /kontak.
//
// Dipakai dua sisi dan harus menghasilkan angka yang sama di keduanya:
//   - pengaju  → menerima nomor referensi di layar begitu form terkirim
//   - pengurus → melihat laporan lengkap (nomor referensi, waktu, status) di
//                panel admin, mengubah status, dan mengisi catatan internal
//
// Nomor referensi sengaja DITURUNKAN dari data dokumen ($id + $createdAt) alih-
// alih disimpan: tidak perlu kolom tambahan, tidak bisa diubah siapa pun, dan
// panel admin bisa mencocokkan kode yang disebut pengaju tanpa pencarian khusus.
//
// Waktu selalu ditampilkan dalam WIB supaya pengaju dan pengurus membaca jam
// yang sama, apa pun zona waktu perangkatnya.

export type StatusKolaborasi = "baru" | "dibaca" | "ditindaklanjuti";

export const STATUS_KOLABORASI: Record<
  StatusKolaborasi,
  { label: string; keterangan: string }
> = {
  baru: {
    label: "Baru",
    keterangan: "Pengajuan sudah masuk dan belum dibuka pengurus.",
  },
  dibaca: {
    label: "Sudah dibaca",
    keterangan: "Pengurus sudah membaca rincian pengajuan ini.",
  },
  ditindaklanjuti: {
    label: "Ditindaklanjuti",
    keterangan: "Pengurus sudah menindaklanjuti, biasanya lewat email balasan.",
  },
};

// Urutan tangga status yang ditampilkan di laporan pengaju.
export const URUTAN_STATUS: StatusKolaborasi[] = ["baru", "dibaca", "ditindaklanjuti"];

// Yang perlu dipegang pengaju setelah kirim: nomor referensi untuk mencocokkan
// balasan, plus identitas pengajuan yang baru saja dia kirim sendiri. Rincian
// status dan catatan tindak lanjut hanya ada di panel admin.
export type LaporanKolaborasi = {
  kode: string;
  jenis: string;
  nama: string;
  email: string;
};

const ZONA_WIB = "Asia/Jakarta";

function bagianWaktuWib(iso: string) {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return null;
  const format = new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONA_WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return Object.fromEntries(format.formatToParts(tanggal).map((p) => [p.type, p.value]));
}

// FNV-1a 32-bit: cukup untuk memampatkan id dokumen jadi empat karakter yang
// terbaca manusia di nomor referensi.
function hashFnv1a(teks: string): number {
  let nilai = 0x811c9dc5;
  for (let i = 0; i < teks.length; i++) {
    nilai ^= teks.charCodeAt(i);
    nilai = Math.imul(nilai, 0x01000193) >>> 0;
  }
  return nilai >>> 0;
}

// KOL-YYYYMMDD-XXXX (tanggal WIB + 4 karakter dari id dokumen).
export function buatKodePengajuan(createdAt: string, id: string): string {
  const bagian = bagianWaktuWib(createdAt);
  const tanggal = bagian ? `${bagian.year}${bagian.month}${bagian.day}` : "00000000";
  const sidik = hashFnv1a(id).toString(16).toUpperCase().padStart(8, "0").slice(0, 4);
  return `KOL-${tanggal}-${sidik}`;
}

export function waktuLengkapWib(iso: string): string {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return "";
  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: ZONA_WIB,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(tanggal) + " WIB"
  );
}

// Catatan lama hanya punya boolean `sudah_dibaca`; dokumen baru memakai `status`.
// Keduanya dipetakan ke satu nilai supaya panel dan laporan tidak pernah
// berbeda bacaan.
export function normalisasiStatus(status: unknown, sudahDibaca?: boolean): StatusKolaborasi {
  if (status === "baru" || status === "dibaca" || status === "ditindaklanjuti") return status;
  return sudahDibaca ? "dibaca" : "baru";
}

export function labelStatus(status: StatusKolaborasi): string {
  return STATUS_KOLABORASI[status].label;
}

// Opsi dropdown status di panel admin, urut tangga tindak lanjut.
export const OPSI_STATUS_KOLABORASI: { value: StatusKolaborasi; label: string }[] =
  URUTAN_STATUS.map((status) => ({ value: status, label: STATUS_KOLABORASI[status].label }));

// Jumlahkan pengajuan per status untuk ringkasan halaman laporan.
export function ringkasStatus(
  items: { status?: unknown; sudah_dibaca?: boolean }[]
): Record<StatusKolaborasi, number> {
  const hitung: Record<StatusKolaborasi, number> = { baru: 0, dibaca: 0, ditindaklanjuti: 0 };
  for (const item of items) {
    hitung[normalisasiStatus(item.status, item.sudah_dibaca)] += 1;
  }
  return hitung;
}
