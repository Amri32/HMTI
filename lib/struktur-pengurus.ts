// Sumber kebenaran foto pengurus: "PENGURUS HMTI.zip" (diekstrak ke
// public/pengurus/). Pasangan nama → foto ini FIXED dan tidak boleh ditukar:
// dipakai data statis (app/site-content.ts) maupun data Appwrite
// (struktur_members) sehingga foto selalu mengikuti nama yang benar.
//
// Foto yang dipakai versi BERSIH (public/pengurus/clean/): hasil crop
// presisi area di dalam frame ungu template zip — tanpa frame, marker sudut,
// 3 logo kampus, gradient nama, dan teks "PSDM" yang menempel di file sumber
// (nama divisi/kartu sudah ditampilkan halaman; teks di foto = dobel).
//
// 15.png SENGKAJAH TIDAK ADA di peta ini — file itu berisi logo, bukan foto
// pengurus, dan tidak boleh dipakai sebagai member card.
//
// Ejaan nama harus PERSIS seperti data resmi pengurus. Jangan mengubah,
// menambah, atau menghapus entri di sini tanpa data resmi baru.
export const FOTO_PENGURUS: Record<string, string> = {
  "Firmansyah Rizki Pratama": "/pengurus/clean/9.png",
  "Muhammad Arrid Wana Syafiq": "/pengurus/clean/7.png",
  "Haidar Sazili Putra": "/pengurus/clean/2.png",
  "Farista Ardhiana Lestari": "/pengurus/clean/3.png",
  "Masayu Putri Safana": "/pengurus/clean/1.png",
  "Naufal Muhammad Yusuf": "/pengurus/clean/11.png",
  "Khaila Hikmah Agustina": "/pengurus/clean/12.png",
  "Zahrotul Mulkiyah": "/pengurus/clean/4.png",
  "Muhamad Taufiq": "/pengurus/clean/6.png",
  "Sutan Arlie Johan": "/pengurus/clean/13.png",
  "Fadillah Vergiawan Pamungkas": "/pengurus/clean/14.png",
  "Amru Ibrahim": "/pengurus/clean/5.png",
  "Abu Hasan Burhori": "/pengurus/clean/8.png",
  "Muhammad Aqib Yazid Ilmany": "/pengurus/clean/10.png",
};

// Foto untuk satu nama. Mengembalikan null bila nama tidak terdaftar di peta
// resmi — komponen pemanggil lalu menampilkan avatar inisial, bukan foto salah.
export function fotoPengurus(nama: string): string | null {
  return FOTO_PENGURUS[nama] ?? null;
}

// Jumlah pengurus resmi saat ini (untuk pemeriksaan konsistensi data).
export const TOTAL_PENGURUS = 14;
