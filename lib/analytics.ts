// Perhitungan analitik dashboard admin.
//
// Aturan mainnya satu: satu perangkat tidak boleh menggelembungkan angka hanya
// karena membuka banyak halaman.
//   visitor_id → identitas perangkat (localStorage, permanen per browser)
//   session_id → satu sesi buka situs (sessionStorage, hilang saat tab ditutup)
// Setiap metrik di bawah dihitung dari kedua identitas itu, bukan dari jumlah
// catatan tampilan halaman.
//
// Fungsi murni (tanpa akses jaringan/DOM) supaya bisa diuji di tests/analytics.test.mjs.

export type JenisPerangkat = "mobile" | "tablet" | "desktop";

export type ViewRecord = {
  page: string;
  device_type: JenisPerangkat | string;
  $createdAt: string;
  $id?: string;
  visitor_id?: string | null;
  session_id?: string | null;
};

export type TitikHarian = { date: string; count: number };
export type BarisPerangkat = { label: string; value: number };
export type HalamanPopuler = { page: string; count: number };

// Urutan tetap supaya legenda donut tidak berubah-ubah antar render.
const URUTAN_PERANGKAT: JenisPerangkat[] = ["desktop", "mobile", "tablet"];
const LABEL_PERANGKAT: Record<JenisPerangkat, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

export function labelPerangkat(jenis: string): string {
  return LABEL_PERANGKAT[jenis as JenisPerangkat] ?? jenis;
}

// Kunci perangkat. Catatan lama (direkam sebelum visitor_id ada) jatuh ke
// session_id agar tidak semua menumpuk menjadi satu "perangkat" raksasa.
function kunciPerangkat(view: ViewRecord): string {
  const vid = view.visitor_id?.trim();
  if (vid) return `v:${vid}`;
  const sid = view.session_id?.trim();
  if (sid) return `s:${sid}`;
  return `r:${view.$id ?? view.$createdAt}`;
}

// Kunci kunjungan: satu sesi tab = satu kunjungan, walau halaman dibuka
// berkali-kali. Perangkat yang kembali di sesi baru dihitung kunjungan baru.
function kunciKunjungan(view: ViewRecord): string {
  const sid = view.session_id?.trim();
  return sid ? `s:${sid}` : kunciPerangkat(view);
}

export function jumlahPerangkatUnik(views: ViewRecord[]): number {
  return new Set(views.map(kunciPerangkat)).size;
}

export function jumlahKunjungan(views: ViewRecord[]): number {
  return new Set(views.map(kunciKunjungan)).size;
}

// Sebaran perangkat: tiap perangkat dihitung SEKALI memakai jenis terakhir yang
// terlihat, jadi satu laptop yang membuka 30 halaman tetap satu Desktop.
export function sebaranPerangkat(views: ViewRecord[]): BarisPerangkat[] {
  const jenisTerakhir = new Map<string, { jenis: string; waktu: string }>();
  for (const view of views) {
    const kunci = kunciPerangkat(view);
    const sebelumnya = jenisTerakhir.get(kunci);
    if (!sebelumnya || view.$createdAt >= sebelumnya.waktu) {
      jenisTerakhir.set(kunci, { jenis: view.device_type, waktu: view.$createdAt });
    }
  }

  const hitung = new Map<string, number>();
  for (const { jenis } of jenisTerakhir.values()) {
    hitung.set(jenis, (hitung.get(jenis) ?? 0) + 1);
  }

  return URUTAN_PERANGKAT.map((j) => ({ label: LABEL_PERANGKAT[j], value: hitung.get(j) ?? 0 }))
    .filter((baris) => baris.value > 0)
    .concat(
      // Jenis tak dikenal (data lama/korup) tetap tampil, tidak disembunyikan.
      [...hitung.entries()]
        .filter(([jenis]) => !URUTAN_PERANGKAT.includes(jenis as JenisPerangkat))
        .map(([jenis, value]) => ({ label: labelPerangkat(jenis), value }))
    );
}

// Kunci hari memakai waktu LOKAL perangkat admin. Memakai potongan ISO mentah
// akan menggeser kunjungan dini hari (WIB) ke tanggal sebelumnya.
export function tanggalLokal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const tanggal = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${tanggal}`;
}

// Daftar tanggal (lokal) berurutan, berakhir di `sampai`.
export function rangkaianHari(jumlahHari: number, sampai: Date = new Date()): string[] {
  const hari: string[] = [];
  for (let i = jumlahHari - 1; i >= 0; i--) {
    const d = new Date(sampai);
    d.setDate(d.getDate() - i);
    hari.push(tanggalLokal(d.toISOString()));
  }
  return hari;
}

// Perangkat berbeda per hari — bukan jumlah tampilan halaman per hari.
export function kunjunganHarian(
  views: ViewRecord[],
  jumlahHari = 7,
  sampai: Date = new Date()
): TitikHarian[] {
  const perHari = new Map<string, Set<string>>();
  for (const view of views) {
    const hari = tanggalLokal(view.$createdAt);
    if (!hari) continue;
    const set = perHari.get(hari) ?? new Set<string>();
    set.add(kunciPerangkat(view));
    perHari.set(hari, set);
  }

  return rangkaianHari(jumlahHari, sampai).map((date) => ({
    date,
    count: perHari.get(date)?.size ?? 0,
  }));
}

// Halaman terpopuler: hitung kunjungan unik per halaman, bukan tiap muat ulang.
export function halamanTerpopuler(views: ViewRecord[], batas = 5): HalamanPopuler[] {
  const perHalaman = new Map<string, Set<string>>();
  for (const view of views) {
    const set = perHalaman.get(view.page) ?? new Set<string>();
    set.add(kunciKunjungan(view));
    perHalaman.set(view.page, set);
  }

  return [...perHalaman.entries()]
    .map(([page, set]) => ({ page, count: set.size }))
    .sort((a, b) => b.count - a.count || a.page.localeCompare(b.page))
    .slice(0, batas);
}
