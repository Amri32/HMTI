// Keep verified public copy in one place; replace this boundary when a real CMS is introduced.
export const siteProfile = {
  shortName: "HMTI UBSI Margonda",
  fullName: "Himpunan Mahasiswa Teknologi Informasi UBSI Margonda",
  university: "Universitas Bina Sarana Informatika Kampus Margonda",
  establishedDate: "2 Februari 2020",
  establishedIso: "2020-02-02",
  establishedCity: "Jakarta",
  campus: "Kampus Margonda",
  address:
    "Universitas Bina Sarana Informatika Kampus Margonda, Depok",
} as const;

export const vision =
  "Meningkatkan solidaritas antar anggota HMTI serta mewujudkan program kerja nyata yang berdampak pada masyarakat/kelompok umum.";

export const missions = [
  {
    title: "Kerja yang berdampak",
    description:
      "Melaksanakan minimal satu program kerja yang berdampak kepada masyarakat pada satu periode.",
  },
  {
    title: "Tanggung jawab bersama",
    description:
      "Membentuk tim kerja lintas divisi guna setiap anggota terlibat aktif dan merasa memiliki tanggung jawabnya.",
  },
  {
    title: "Dokumentasi yang tertib",
    description:
      "Membangun sistem dokumentasi dan publikasi pada setiap program kerja yang dilaksanakan.",
  },
  {
    title: "Evaluasi pasca program",
    description:
      "Mengadakan evaluasi pasca program kerja bersama anggota yang terlibat guna mengukur dampak dari terlaksananya suatu program kerja.",
  },
] as const;

export const aboutParagraphs = [
  "Himpunan Mahasiswa Teknologi Informasi (HMTI) adalah wadah aspirasi dan pelayanan bagi mahasiswa Jurusan Teknologi Informasi. HMTI didirikan pada tanggal 2 Februari 2020 bertempat di Jakarta. Himpunan Mahasiswa Teknologi Informasi terbentuk dengan dilatar belakangi oleh kebutuhan mahasiswa program studi Teknologi Informasi untuk terciptanya lingkungan yang mendukung pengembangan skill mahasiswa sebagai calon teknisi dan akademisi aktif yang akan turun ke tengah-tengah masyarakat.",
  "Terbentuknya HMTI adalah sebagai salah satu wadah organisasi yang sangat dibutuhkan oleh seluruh mahasiswa Teknologi Informasi Universitas Bina Sarana Informatika untuk mencurahkan ide-ide brilian dan mengembangkan kemampuan mereka dalam menguasai materi-materi informatika, serta mengembangkan kreativitas yang tidak hanya bersifat teoritis, sehingga mereka menjadi akademisi yang profesional dan patut diteladani.",
  "Memperhatikan realita kemampuan mahasiswa dalam mengelola kepribadian serta kemampuan intelektual dalam sisi akademisi aktif di lingkungan perkuliahan, baik dalam segi teknisi informasi, berkomunikasi atau public speaking dan lain-lain, maka dengan keinginan luhur dan dukungan dari seluruh mahasiswa Teknologi Informasi Universitas Bina Sarana Informatika, disepakati pembentukan sebuah organisasi bernama HMTI sebagai wadah diskusi mahasiswa Teknologi Informasi dan pengembangan softskill secara produktif.",
] as const;

export const aboutAddress =
  "HMTI UBSI Margonda berkedudukan di Universitas Bina Sarana Informatika Kampus Margonda, Depok. HMTI merupakan himpunan tingkat cabang di bawah HMTI UBSI.";

// Email resmi HMTI (dikonfirmasi pengguna 2026-09-14). Ganti di satu tempat ini bila berubah.
export const contactEmail = "hmti.ubsi.margonda@gmail.com";

export const collaborationTypes = [
  "Kolaborasi program kerja",
  "Kerja sama & sponsorship",
  "Pemateri / mentor",
  "Lainnya",
] as const;

export const navigationItems = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/visi-misi", label: "Visi & Misi" },
  { href: "/struktur", label: "Struktur" },
  { href: "/proker", label: "Program Kerja" },
  { href: "/berita", label: "Berita" },
  { href: "/kontak", label: "Kontak" },
] as const;

// Source: dikonfirmasi pengguna 2026-09-15. Dua program kerja periode berjalan.
export const programKerja = [
  {
    name: "Pengembangan Website HMTI",
    status: "Sedang berjalan",
    previewImage: "/proker-preview/website.jpg",
    description:
      "Pengembangan website resmi HMTI UBSI Margonda sebagai kanal informasi, publikasi program kerja, dan dokumentasi organisasi.",
  },
  {
    name: "Bakti Sosial Panti Asuhan",
    status: "Direncanakan",
    previewImage: "/proker-preview/baksos.jpg",
    description:
      "Kegiatan bakti sosial dan kunjungan ke panti asuhan sebagai wujud program kerja nyata yang berdampak langsung kepada masyarakat.",
  },
] as const;

// Editorial preview data for the public news layout. Replace with verified
// publications before institutional launch.
export const newsCatalog = [
  {
    id: "rekapitulasi-study-club",
    section: "Kegiatan",
    title: "Rekapitulasi Study Club: ruang belajar yang terus bertumbuh",
    date: "20 Mei 2024",
    readTime: "5 mnt baca",
    excerpt:
      "Contoh ringkasan berita kegiatan mahasiswa untuk memperlihatkan ritme katalog publikasi HMTI.",
    image: "/home-learning.jpg",
    imageAlt: "Ilustrasi mahasiswa berdiskusi menggunakan laptop",
  },
  {
    id: "pembukaan-pendaftaran",
    section: "Kegiatan",
    title: "Pengumuman pembukaan pendaftaran kegiatan HMTI",
    date: "15 Mei 2024",
    readTime: "3 mnt baca",
    excerpt:
      "Contoh informasi operasional yang dapat diakses mahasiswa melalui portal HMTI.",
    image: "/home-community.jpg",
    imageAlt: "Ilustrasi kelompok mahasiswa berkolaborasi",
  },
  {
    id: "digitalisasi-pembukuan",
    section: "Kegiatan",
    title: "HMTI mengabdi: digitalisasi pembukuan sederhana",
    date: "08 Mei 2024",
    readTime: "4 mnt baca",
    excerpt:
      "Contoh dokumentasi program kerja yang menghubungkan kemampuan teknologi dengan kebutuhan sekitar.",
    image: "/home-collaboration.jpg",
    imageAlt: "Ilustrasi mahasiswa mengerjakan proyek digital",
  },
  {
    id: "arsitektur-microservices",
    section: "Opini & Teknologi",
    title: "Mengenal arsitektur microservices: dari monolitik menuju modular",
    date: "02 Mei 2024",
    readTime: "5 mnt baca",
    excerpt:
      "Contoh kolom teknologi dengan bahasa yang dekat, kontekstual, dan dapat dipahami pembaca mahasiswa.",
    image: "/proker-preview/website.jpg",
    imageAlt: "Ilustrasi kode program pada layar komputer",
  },
  {
    id: "kolaborasi-mahasiswa",
    section: "Riset & Akademik",
    title: "Kolaborasi riset mahasiswa: menemukan solusi pendidikan",
    date: "25 April 2024",
    readTime: "7 mnt baca",
    excerpt:
      "Contoh tulisan akademik populer yang menempatkan proses belajar sebagai kerja kolektif.",
    image: "/home-community.jpg",
    imageAlt: "Ilustrasi mahasiswa berdiskusi dalam kelompok",
  },
  {
    id: "refleksi-organisasi",
    section: "Warta Himpunan",
    title: "Refleksi kongres mahasiswa: merawat transparansi digital",
    date: "18 April 2024",
    readTime: "4 mnt baca",
    excerpt:
      "Contoh warta organisasi untuk arsip, refleksi, dan pembelajaran anggota HMTI.",
    image: "/home-collaboration.jpg",
    imageAlt: "Ilustrasi kelompok bekerja bersama di sekitar meja",
  },
] as const;

// Slot gambar situs — dipetakan admin lewat panel Media (koleksi site_images Appwrite).
// Fallback statis ini dipakai bila Appwrite belum dikonfigurasi atau gagal dijangkau.
export const siteImageSlots = {
  "home-community": {
    path: "/home-community.jpg",
    alt: "Ilustrasi kelompok mahasiswa berkolaborasi",
    caption: "",
  },
  "home-learning": {
    path: "/home-learning.jpg",
    alt: "Ilustrasi mahasiswa berdiskusi menggunakan laptop",
    caption: "",
  },
  "home-collaboration": {
    path: "/home-collaboration.jpg",
    alt: "Ilustrasi mahasiswa mengerjakan proyek digital",
    caption: "",
  },
  "proker-website": {
    path: "/proker-preview/website.jpg",
    alt: "Preview program kerja pengembangan website HMTI",
    caption: "",
  },
  "proker-baksos": {
    path: "/proker-preview/baksos.jpg",
    alt: "Preview program kerja bakti sosial panti asuhan",
    caption: "",
  },
} as const;

// Data struktur organisasi — SUMBER: "PENGURUS HMTI.zip" (data resmi pengurus,
// 14 orang). Jangan menambah/mengubah nama tanpa data resmi baru. Foto tiap
// anggota dipetakan otomatis dari lib/struktur-pengurus.ts (nama → file).
// Divisi hanya berisi nama resmi (PSDM/KOMINFO/LITBANG) — tidak ada data tugas,
// tag, atau program kerja divisi karena tidak tercantum di sumber.
export const strukturData = {
  periode: "2024/2025",
  bph: [
    {
      lencanaPeran: "Ketua",
      nama: "Firmansyah Rizki Pratama",
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
      utama: true,
    },
    {
      lencanaPeran: "Wakil Ketua",
      nama: "Muhammad Arrid Wana Syafiq",
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
      utama: false,
    },
    {
      lencanaPeran: "Sekretaris",
      nama: "Haidar Sazili Putra",
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
      utama: false,
    },
    {
      lencanaPeran: "Bendahara",
      nama: "Farista Ardhiana Lestari",
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
      utama: false,
    },
  ],
  divisi: [
    {
      nomor: "01",
      ikon: "komunitas",
      nama: "PSDM",
      koordinator: "",
      nim: "",
      tag: [],
      tugas: "",
      proker: [],
      anggota: [
        { nama: "Masayu Putri Safana", peran: "Anggota" },
        { nama: "Naufal Muhammad Yusuf", peran: "Anggota" },
        { nama: "Khaila Hikmah Agustina", peran: "Anggota" },
      ],
    },
    {
      nomor: "02",
      ikon: "kampanye",
      nama: "KOMINFO",
      koordinator: "",
      nim: "",
      tag: [],
      tugas: "",
      proker: [],
      anggota: [
        { nama: "Zahrotul Mulkiyah", peran: "Anggota" },
        { nama: "Muhamad Taufiq", peran: "Anggota" },
        { nama: "Sutan Arlie Johan", peran: "Anggota" },
        { nama: "Fadillah Vergiawan Pamungkas", peran: "Anggota" },
      ],
    },
    {
      nomor: "03",
      ikon: "terminal",
      nama: "LITBANG",
      koordinator: "",
      nim: "",
      tag: [],
      tugas: "",
      proker: [],
      anggota: [
        { nama: "Amru Ibrahim", peran: "Anggota" },
        { nama: "Abu Hasan Burhori", peran: "Anggota" },
        { nama: "Muhammad Aqib Yazid Ilmany", peran: "Anggota" },
      ],
    },
  ],
};
