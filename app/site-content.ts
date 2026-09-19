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

// Source: dikonfirmasi pengguna 2026-09-15; detail baksos dari pengumuman
// resmi panitia (2026-08-29). Dua program kerja periode berjalan. Data detail
// penyelesaian dipakai fallback statis bila Appwrite tidak terkonfigurasi.
export type StaticProker = {
  name: string;
  status: string;
  previewImage: string;
  description: string;
  slug: string;
  completedAt?: string;
  eventTime?: string;
  location?: string;
  mapsUrl?: string;
  dresscode?: string;
};

export const programKerja: readonly StaticProker[] = [
  {
    name: "Pengembangan Website HMTI",
    status: "Sedang berjalan",
    previewImage: "/proker-preview/website.jpg",
    description:
      "Pengembangan website resmi HMTI UBSI Margonda sebagai kanal informasi, publikasi program kerja, dan dokumentasi organisasi.",
    slug: "pengembangan-website-hmti",
  },
  {
    name: "Bakti Sosial Panti Asuhan",
    status: "Selesai",
    previewImage: "/proker-preview/baksos.jpg",
    description:
      "Kegiatan bakti sosial dan kunjungan ke panti asuhan sebagai wujud program kerja nyata yang berdampak langsung kepada masyarakat.",
    slug: "bakti-sosial-panti-asuhan",
    completedAt: "2026-08-29",
    eventTime: "09.00",
    location: "Taman Merdeka",
    mapsUrl: "https://maps.app.goo.gl/GD7RXUbaDzhzm7oM8",
    dresscode: "PDH HMTI",
  },
];

// Editorial preview data for the public news layout. Replace with verified
// publications before institutional launch. `body` berisi paragraf lengkap
// artikel (satu string per paragraf) agar fallback statis menampilkan artikel
// utuh, selaras dengan seed berita di scripts/appwrite-setup.mjs.
export const newsCatalog = [
  {
    id: "rekapitulasi-study-club",
    section: "Kegiatan",
    title: "Rekapitulasi Study Club: ruang belajar yang terus bertumbuh",
    date: "20 Mei 2024",
    readTime: "5 mnt baca",
    excerpt:
      "Contoh ringkasan berita kegiatan mahasiswa untuk memperlihatkan ritme katalog publikasi HMTI.",
    body: [
      "Study Club HMTI menutup periode ini dengan empat sesi belajar yang diikuti mahasiswa Teknologi Informasi lintas angkatan. Materi yang dibahas meliputi dasar pemrograman web, pengenalan basis data, hingga latihan presentasi teknis.",
      "Format belajarnya menggabungkan sesi tutorial dan kerja kelompok. Setiap sesi ditutup dengan tanya jawab agar materi yang belum dipahami bisa dibahas langsung bersama pembina sesi.",
      "Catatan rekapitulasi setiap sesi diarsipkan di portal HMTI supaya anggota yang terhalang jadwal tetap bisa mengejar materi secara mandiri. Rekap juga menjadi bahan evaluasi penyelenggaraan sesi berikutnya.",
      "Jadwal study club periode berikutnya akan diumumkan melalui portal dan kanal informasi anggota. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
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
      "HMTI Margonda membuka pendaftaran kegiatan periode ini. Berikut jadwal, alur, dan ketentuan yang perlu disiapkan calon peserta.",
    body: [
      "Himpunan Mahasiswa Teknologi Informasi UBSI Margonda resmi membuka pendaftaran rangkaian kegiatan periode ini. Pendaftaran terbuka untuk seluruh mahasiswa Teknologi Informasi Kampus Margonda dan dapat diakses melalui portal resmi HMTI.",
      "Kegiatan yang dibuka mencakup study club mingguan, kelas pengembangan skill digital, dan kegiatan sosial yang melibatkan seluruh divisi. Setiap kegiatan dirancang agar anggota baru maupun lama mendapat ruang belajar yang aktif dan kolaboratif.",
      "Pendaftaran dibuka mulai 20 Mei dan ditutup 31 Mei 2024. Pengumuman peserta disebar melalui portal HMTI dan grup informasi anggota pada awal Juni. Calon peserta disarankan menyiapkan data diri serta alasan mengikuti kegiatan sejak awal agar proses pendaftaran berjalan cepat.",
      "Alur pendaftarannya terdiri dari tiga langkah. Pertama, buka halaman kegiatan di portal HMTI lalu pilih kegiatan yang dituju. Kedua, isi formulir pendaftaran dengan data sesuai kartu mahasiswa. Ketiga, tunggu email konfirmasi dari redaksi HMTI sebagai tanda pendaftaran diterima.",
      "Ketentuan peserta cukup sederhana: mahasiswa Teknologi Informasi UBSI Kampus Margonda yang masih aktif, bersedia mengikuti kegiatan secara penuh, dan menyetujui tata tertib yang berlaku. Tidak ada biaya pendaftaran untuk seluruh kegiatan HMTI.",
      "Pertanyaan seputar pendaftaran dapat dikirim ke hmti.ubsi.margonda@gmail.com. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
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
    body: [
      "Tim pengabdian HMTI menggelar sesi pendampingan digitalisasi pembukuan sederhana bagi pengelola usaha kecil di sekitar kampus Margonda. Kegiatan ini menjadi wujud program kerja yang berdampak langsung kepada masyarakat.",
      "Peserta dibimbing menyusun catatan pemasukan dan pengeluaran memakai aplikasi lembar kerja gratis, lengkap dengan template ringkas yang bisa dipakai ulang. Pendamping juga mempraktikkan cara membuat rekap bulanan sederhana.",
      "Sesi ditutup dengan diskusi kebutuhan pencatatan tiap usaha karena kebiasaan pencatatan setiap jenis usaha berbeda. Template diserahkan dalam bentuk digital agar mudah disesuaikan.",
      "Dokumentasi lengkap kegiatan akan dipublikasikan di portal HMTI. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
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
    body: [
      "Banyak aplikasi mahasiswa dimulai dari satu proyek kecil yang terus tumbuh hingga sulit dirawat. Arsitektur microservices menawarkan jalan keluarnya: memecah aplikasi besar menjadi layanan-layanan kecil yang berdiri sendiri, masing-masing fokus pada satu tanggung jawab.",
      "Keuntungan terbesarnya ada di sisi perawatan. Tim bisa memperbarui satu layanan tanpa menyentuh bagian lain, dan layanan yang sibuk bisa diskalakan sendiri. Konsekuensinya, komunikasi antar layanan dan pengelolaan data menjadi lebih rumit dibanding aplikasi monolitik.",
      "Untuk proyek kuliah atau portofolio awal, monolitik yang tertata sering kali lebih realistis. Microservices baru layak dipertimbangkan saat tim sudah terbagi, beban antar fitur mulai berbeda, dan kebutuhan deploy terpisah muncul nyata.",
      "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
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
    body: [
      "Kelompok belajar riset HMTI membuka sesi kolaborasi bagi mahasiswa yang sedang menyiapkan penelitian. Fokusnya sederhana: membantu tiap mahasiswa mempertajam rumusan masalah sebelum data mulai dikumpulkan.",
      "Pada sesi pertama, setiap peserta memaparkan ide penelitiannya selama lima menit lalu menerima masukan dari rekan satu kelompok. Masukan yang paling sering muncul menyangkut batasan populasi dan alat ukur yang belum jelas.",
      "Kolaborasi akan berlanjut dengan pendampingan penyusunan instrumen dan latihan membaca jurnal. Hasil tiap sesi dicatat sebagai arsip belajar bersama.",
      "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
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
    body: [
      "Kongres mahasiswa periode ini meninggalkan satu catatan penting bagi HMTI: transparansi digital bukan sekadar arsip, melainkan kebiasaan membuka informasi secara rutin bagi seluruh anggota.",
      "Peserta kongres sepakat mempublikasikan laporan kegiatan dan penggunaan anggaran melalui portal secara berkala. Anggota dapat mengaksesnya tanpa menunggu forum resmi.",
      "Refleksi ini menjadi pegangan redaksi portal dalam merawat kebiasaan baru tersebut. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
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
      deskripsi: "",
      presidium: "",
      utama: true,
    },
    {
      lencanaPeran: "Wakil Ketua",
      nama: "Muhammad Arrid Wana Syafiq",
      deskripsi: "",
      presidium: "",
      utama: false,
    },
    {
      lencanaPeran: "Sekretaris",
      nama: "Haidar Sazili Putra",
      deskripsi: "",
      presidium: "",
      utama: false,
    },
    {
      lencanaPeran: "Bendahara",
      nama: "Farista Ardhiana Lestari",
      deskripsi: "",
      presidium: "",
      utama: false,
    },
  ],
  divisi: [
    {
      nomor: "01",
      ikon: "komunitas",
      nama: "PSDM",
      koordinator: "",
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
