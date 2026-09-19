// Setup otomatis backend Appwrite untuk situs HMTI.
// Jalankan: node scripts/appwrite-setup.mjs <PROJECT_ID> <API_KEY> [ENDPOINT]
// (API key dari console â†’ Settings â†’ API Keys; scopes: databases.write,
//  storage.write, teams.write)
//
// Yang dilakukan:
//   1. Database `hmti` + 8 koleksi + atribut + index unik
//   2. Bucket `hmti-media` (baca publik, tulis hanya team admin)
//   3. Team `admin` + undangan super admin (email invite dikirim)
//   4. Seed konten terverifikasi (proker, berita, visi-misi, struktur, site_images)
//   5. Upload gambar dari public/ ke bucket
//
// Skrip idempoten: aman dijalankan ulang (skip yang sudah ada).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [projectIdArg, apiKeyArg, endpointInput] = process.argv.slice(2);
let projectId = projectIdArg;
let apiKey = apiKeyArg;

// Dukungan kredensial via file scripts/.appwrite-cred.json agar key tidak
// muncul di command line. Format: {"projectId": "...", "apiKey": "..."}
const CRED_FILE = join(dirname(fileURLToPath(import.meta.url)), ".appwrite-cred.json");
try {
  const cred = JSON.parse(readFileSync(CRED_FILE, "utf8"));
  projectId = projectId ?? cred.projectId;
  apiKey = apiKey ?? cred.apiKey;
} catch {
  // file tidak ada â€” lanjut dengan argv
}

const ENDPOINT = (endpointInput ?? "https://sgp.cloud.appwrite.io/v1").replace(/\/+$/, "");
const SITE_URL = process.env.APPWRITE_SITE_URL ?? "http://localhost:3000";
const SUPER_ADMIN_EMAIL = process.env.APPWRITE_ADMIN_EMAIL ?? "hmti.ubsi.margonda@gmail.com";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!projectId || !apiKey) {
  console.error("Usage: node scripts/appwrite-setup.mjs <PROJECT_ID> <API_KEY> [ENDPOINT]");
  process.exit(1);
}

const H = { "X-Appwrite-Project": projectId, "X-Appwrite-Key": apiKey, "Content-Type": "application/json" };

async function api(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${ENDPOINT}${path.replace(/^\/v1/, "")}`, {
    method,
    headers: { ...H, ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 409 || text.includes("already exists")) return null; // idempoten
    throw new Error(`${method} ${path} â†’ ${res.status}: ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return {};
  return res.json();
}

const exists = (list, id) => list?.some((x) => x.$id === id || x.key === id);

// Appwrite 2.x menerima query sebagai JSON string (bukan sintaks `limit(1)`).
const QLIMIT = (n) => encodeURIComponent(JSON.stringify({ method: "limit", attribute: "", values: [n] }));

// Atribut Appwrite dibuat async; tunggu sampai semua berstatus "available"
// sebelum membuat index atau memasukkan dokumen.
async function tungguAtribut(koleksiId, timeoutMs = 90000) {
  const mulai = Date.now();
  for (;;) {
    const res = await api("GET", `/databases/hmti/collections/${koleksiId}/attributes`);
    const attrs = res?.attributes ?? [];
    if (attrs.length > 0 && attrs.every((a) => a.status === "available")) return attrs.length;
    if (Date.now() - mulai > timeoutMs) {
      throw new Error(`timeout menunggu atribut koleksi ${koleksiId}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// â”€â”€ Skema koleksi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BACA_PUBLIK = ['read("any")'];
const ADMIN = "team:admin";
const TULIS_ADMIN = [`write("${ADMIN}")`];
const PUBLIC_PERMS = [...BACA_PUBLIK, ...TULIS_ADMIN];
const ADMIN_PERMS = [`read("${ADMIN}")`, `write("${ADMIN}")`];
// Koleksi tracking: admin untuk baca & kelola, tapi SIAPA PUN boleh membuat
// dokumen (create di level koleksi) agar tracking dari pengunjung anonim
// tidak ditolak — inilah sebabnya dashboard analytics pernah selalu kosong.
const TRACKING_PERMS = [`read("${ADMIN}")`, `write("${ADMIN}")`, 'create("any")'];
// Proposal kolaborasi: sama dengan tracking — pengunjung mengirim tanpa login,
// hanya admin yang bisa membaca & menandai sudah dibaca.
const PENGAJUAN_PERMS = [`read("${ADMIN}")`, `write("${ADMIN}")`, 'create("any")'];

const KOLEKSI = [
  {
    id: "proker",
    name: "Program Kerja",
    permissions: PUBLIC_PERMS,
    attributes: [
      ["name", "string", { size: 255, required: true }],
      ["status", "string", { size: 64, required: true }],
      ["description", "string", { size: 4096, required: true }],
      ["image", "string", { size: 255 }],
      ["image_alt", "string", { size: 255 }],
      ["sort_order", "integer", { required: true }],
      ["published", "boolean", { required: true }],
      ["archived_at", "datetime", {}],
      // Detail penyelesaian: diisi admin saat program berstatus "Selesai".
      // CTA halaman publik berganti "Lihat detail proker" hanya lewat status.
      ["slug", "string", { size: 255 }],
      ["completed_at", "datetime", {}],
      ["started_at", "datetime", {}],
      ["event_time", "string", { size: 32 }],
      ["location", "string", { size: 255 }],
      ["maps_url", "string", { size: 512 }],
      ["dresscode", "string", { size: 128 }],
      ["detail_body", "string", { size: 4096, array: true }],
      ["documentation", "string", { size: 255, array: true }],
      ["outcome", "string", { size: 4096 }],
      ["announcement_note", "string", { size: 4096 }],
    ],
    indexes: [{ key: "uniq_slug", type: "unique", attributes: ["slug"] }],
  },
  {
    id: "berita",
    name: "Berita",
    permissions: PUBLIC_PERMS,
    attributes: [
      ["slug", "string", { size: 255, required: true }],
      ["section", "string", { size: 64, required: true }],
      ["title", "string", { size: 512, required: true }],
      ["published_at", "datetime", { required: true }],
      ["read_time", "string", { size: 32 }],
      ["excerpt", "string", { size: 1024, required: true }],
      ["body", "string", { size: 4096, required: true, array: true }],
      ["image", "string", { size: 255 }],
      ["image_alt", "string", { size: 255 }],
      ["author", "string", { size: 128 }],
      ["sort_order", "integer", { required: true }],
      ["published", "boolean", { required: true }],
      ["archived_at", "datetime", {}],
    ],
    indexes: [{ key: "uniq_slug", type: "unique", attributes: ["slug"] }],
  },
  {
    id: "visi_misi",
    name: "Visi & Misi",
    permissions: PUBLIC_PERMS,
    attributes: [
      ["type", "string", { size: 16, required: true }],
      ["title", "string", { size: 255 }],
      ["text", "string", { size: 4096, required: true }],
      ["sort_order", "integer", { required: true }],
      ["published", "boolean", { required: true }],
      ["archived_at", "datetime", {}],
    ],
  },
  {
    id: "struktur_divisi",
    name: "Struktur Divisi",
    permissions: PUBLIC_PERMS,
    attributes: [
      ["periode", "string", { size: 32, required: true }],
      ["nomor", "string", { size: 8, required: true }],
      ["ikon", "string", { size: 32, required: true }],
      ["nama", "string", { size: 255, required: true }],
      ["koordinator", "string", { size: 128, required: true }],
      ["tag", "string", { size: 64, required: true, array: true }],
      ["tugas", "string", { size: 4096, required: true }],
      ["proker", "string", { size: 255, required: true, array: true }],
      ["sort_order", "integer", { required: true }],
      ["published", "boolean", { required: true }],
      ["archived_at", "datetime", {}],
    ],
  },
  {
    id: "struktur_members",
    name: "Struktur Anggota",
    permissions: PUBLIC_PERMS,
    attributes: [
      ["periode", "string", { size: 32, required: true }],
      ["kategori", "string", { size: 16, required: true }],
      ["divisi_id", "string", { size: 36 }],
      ["lencana_peran", "string", { size: 64, required: true }],
      ["nama", "string", { size: 128, required: true }],
      ["deskripsi", "string", { size: 2048, required: true }],
      ["presidium", "string", { size: 64, required: true }],
      ["foto", "string", { size: 255 }],
      ["utama", "boolean", { required: true }],
      ["sort_order", "integer", { required: true }],
      ["published", "boolean", { required: true }],
      ["archived_at", "datetime", {}],
    ],
  },
  {
    id: "site_images",
    name: "Slot Gambar Situs",
    permissions: PUBLIC_PERMS,
    attributes: [
      ["key", "string", { size: 64, required: true }],
      ["file_path", "string", { size: 255, required: true }],
      ["alt_text", "string", { size: 512 }],
      ["caption", "string", { size: 512 }],
    ],
    indexes: [{ key: "uniq_key", type: "unique", attributes: ["key"] }],
  },
  {
    id: "media_library",
    name: "Pustaka Media",
    permissions: PUBLIC_PERMS,
    attributes: [
      ["file_path", "string", { size: 255, required: true }],
      ["file_name", "string", { size: 255, required: true }],
      ["mime_type", "string", { size: 64 }],
      ["size_bytes", "integer", {}],
      ["alt_text", "string", { size: 512 }],
      ["caption", "string", { size: 512 }],
      ["archived_at", "datetime", {}],
      ["created_by", "string", { size: 36 }],
    ],
  },
  {
    id: "audit_log",
    name: "Log Aktivitas",
    permissions: ADMIN_PERMS,
    attributes: [
      ["actor_id", "string", { size: 36 }],
      ["actor_email", "string", { size: 255 }],
      ["action", "string", { size: 64, required: true }],
      ["entity", "string", { size: 64, required: true }],
      ["entity_id", "string", { size: 64 }],
      ["detail", "string", { size: 4096 }],
    ],
  },
  {
    id: "page_views",
    name: "Page Views",
    permissions: TRACKING_PERMS,
    attributes: [
      ["page", "string", { size: 128, required: true }],
      ["device_type", "string", { size: 16, required: true }],
      ["user_agent", "string", { size: 512 }],
      ["screen_w", "integer", {}],
      ["screen_h", "integer", {}],
      ["session_id", "string", { size: 64 }],
    ],
    indexes: [{ key: "idx_page_created", type: "key", attributes: ["page", "$createdAt"] }],
  },
  {
    id: "collab_signals",
    name: "Collaboration Signals",
    permissions: TRACKING_PERMS,
    attributes: [
      ["signal_type", "string", { size: 32, required: true }],
      ["source_page", "string", { size: 128, required: true }],
      ["detail", "string", { size: 1024 }],
    ],
    indexes: [{ key: "idx_signal_type_created", type: "key", attributes: ["signal_type", "$createdAt"] }],
  },
  {
    id: "collab_messages",
    name: "Collaboration Messages",
    permissions: PENGAJUAN_PERMS,
    attributes: [
      ["nama", "string", { size: 128, required: true }],
      ["email", "string", { size: 128, required: true }],
      ["jenis", "string", { size: 64, required: true }],
      ["pesan", "string", { size: 4096, required: true }],
      ["sudah_dibaca", "boolean", { required: true }],
    ],
    indexes: [{ key: "idx_dibaca_created", type: "key", attributes: ["sudah_dibaca", "$createdAt"] }],
  },
];

const ENDPOINT_ATTR = { string: "string", integer: "integer", boolean: "boolean", datetime: "datetime" };

// â”€â”€ Seed (sumber: app/site-content.ts, terverifikasi) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SEED = {
  proker: [
    {
      name: "Pengembangan Website HMTI",
      status: "Sedang berjalan",
      description:
        "Pengembangan website resmi HMTI UBSI Margonda sebagai kanal informasi, publikasi program kerja, dan dokumentasi organisasi.",
      image: "proker-website",
      image_alt: "Preview program kerja pengembangan website HMTI",
      sort_order: 1,
      published: true,
      archived_at: null,
      slug: "pengembangan-website-hmti",
    },
    {
      name: "Bakti Sosial Panti Asuhan",
      status: "Selesai",
      description:
        "Kegiatan bakti sosial dan kunjungan ke panti asuhan sebagai wujud program kerja nyata yang berdampak langsung kepada masyarakat.",
      image: "proker-baksos",
      image_alt: "Preview program kerja bakti sosial panti asuhan",
      sort_order: 2,
      published: true,
      archived_at: null,
      // Detail pelaksanaan: sumber = pengumuman resmi panitia (2026-08-29).
      slug: "bakti-sosial-panti-asuhan",
      completed_at: "2026-08-29T00:00:00.000Z",
      event_time: "09.00",
      location: "Taman Merdeka",
      maps_url: "https://maps.app.goo.gl/GD7RXUbaDzhzm7oM8",
      dresscode: "PDH HMTI",
      announcement_note:
        "Pemberitahuan kepada seluruh anggota cabang, sehubungan akan dilaksanakannya PROKER BAKTI SOSIAL, yang akan diselenggarakan pada: Hari/Tanggal: Sabtu, 29 Agustus 2026; Waktu: 09.00; Titik Kumpul: Taman Merdeka; Dresscode: PDH HMTI. Menimbang betapa pentingnya kegiatan proker ini, maka diharapkan kepada seluruh anggota cabang dapat hadir tepat waktu dan mempersiapkan diri dengan baik. Terima kasih atas perhatian dan kerja samanya.",
    },
  ],
  berita: [
    {
      slug: "rekapitulasi-study-club",
      section: "Kegiatan",
      title: "Rekapitulasi Study Club: ruang belajar yang terus bertumbuh",
      published_at: "2024-05-20T00:00:00.000Z",
      read_time: "5 mnt baca",
      excerpt:
        "Contoh ringkasan berita kegiatan mahasiswa untuk memperlihatkan ritme katalog publikasi HMTI.",
      body: [
        "Study Club HMTI menutup periode ini dengan empat sesi belajar yang diikuti mahasiswa Teknologi Informasi lintas angkatan. Materi yang dibahas meliputi dasar pemrograman web, pengenalan basis data, hingga latihan presentasi teknis.",
        "Format belajarnya menggabungkan sesi tutorial dan kerja kelompok. Setiap sesi ditutup dengan tanya jawab agar materi yang belum dipahami bisa dibahas langsung bersama pembina sesi.",
        "Catatan rekapitulasi setiap sesi diarsipkan di portal HMTI supaya anggota yang terhalang jadwal tetap bisa mengejar materi secara mandiri. Rekap juga menjadi bahan evaluasi penyelenggaraan sesi berikutnya.",
        "Jadwal study club periode berikutnya akan diumumkan melalui portal dan kanal informasi anggota. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
      ],
      image: "slots-home-learning",
      image_alt: "Ilustrasi mahasiswa berdiskusi menggunakan laptop",
      author: "HMTI Margonda",
      sort_order: 1,
      published: true,
      archived_at: null,
    },
    {
      slug: "pembukaan-pendaftaran",
      section: "Kegiatan",
      title: "Pengumuman pembukaan pendaftaran kegiatan HMTI",
      published_at: "2024-05-15T00:00:00.000Z",
      read_time: "3 mnt baca",
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
      image: "slots-home-community",
      image_alt: "Ilustrasi kelompok mahasiswa berkolaborasi",
      author: "HMTI Margonda",
      sort_order: 2,
      published: true,
      archived_at: null,
    },
    {
      slug: "digitalisasi-pembukuan",
      section: "Kegiatan",
      title: "HMTI mengabdi: digitalisasi pembukuan sederhana",
      published_at: "2024-05-08T00:00:00.000Z",
      read_time: "4 mnt baca",
      excerpt:
        "Contoh dokumentasi program kerja yang menghubungkan kemampuan teknologi dengan kebutuhan sekitar.",
      body: [
        "Tim pengabdian HMTI menggelar sesi pendampingan digitalisasi pembukuan sederhana bagi pengelola usaha kecil di sekitar kampus Margonda. Kegiatan ini menjadi wujud program kerja yang berdampak langsung kepada masyarakat.",
        "Peserta dibimbing menyusun catatan pemasukan dan pengeluaran memakai aplikasi lembar kerja gratis, lengkap dengan template ringkas yang bisa dipakai ulang. Pendamping juga mempraktikkan cara membuat rekap bulanan sederhana.",
        "Sesi ditutup dengan diskusi kebutuhan pencatatan tiap usaha karena kebiasaan pencatatan setiap jenis usaha berbeda. Template diserahkan dalam bentuk digital agar mudah disesuaikan.",
        "Dokumentasi lengkap kegiatan akan dipublikasikan di portal HMTI. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
      ],
      image: "slots-home-collaboration",
      image_alt: "Ilustrasi mahasiswa mengerjakan proyek digital",
      author: "HMTI Margonda",
      sort_order: 3,
      published: true,
      archived_at: null,
    },
    {
      slug: "arsitektur-microservices",
      section: "Opini & Teknologi",
      title: "Mengenal arsitektur microservices: dari monolitik menuju modular",
      published_at: "2024-05-02T00:00:00.000Z",
      read_time: "5 mnt baca",
      excerpt:
        "Contoh kolom teknologi dengan bahasa yang dekat, kontekstual, dan dapat dipahami pembaca mahasiswa.",
      body: [
        "Banyak aplikasi mahasiswa dimulai dari satu proyek kecil yang terus tumbuh hingga sulit dirawat. Arsitektur microservices menawarkan jalan keluarnya: memecah aplikasi besar menjadi layanan-layanan kecil yang berdiri sendiri, masing-masing fokus pada satu tanggung jawab.",
        "Keuntungan terbesarnya ada di sisi perawatan. Tim bisa memperbarui satu layanan tanpa menyentuh bagian lain, dan layanan yang sibuk bisa diskalakan sendiri. Konsekuensinya, komunikasi antar layanan dan pengelolaan data menjadi lebih rumit dibanding aplikasi monolitik.",
        "Untuk proyek kuliah atau portofolio awal, monolitik yang tertata sering kali lebih realistis. Microservices baru layak dipertimbangkan saat tim sudah terbagi, beban antar fitur mulai berbeda, dan kebutuhan deploy terpisah muncul nyata.",
        "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
      ],
      image: "proker-website",
      image_alt: "Ilustrasi kode program pada layar komputer",
      author: "HMTI Margonda",
      sort_order: 4,
      published: true,
      archived_at: null,
    },
    {
      slug: "kolaborasi-mahasiswa",
      section: "Riset & Akademik",
      title: "Kolaborasi riset mahasiswa: menemukan solusi pendidikan",
      published_at: "2024-04-25T00:00:00.000Z",
      read_time: "7 mnt baca",
      excerpt:
        "Contoh tulisan akademik populer yang menempatkan proses belajar sebagai kerja kolektif.",
      body: [
        "Kelompok belajar riset HMTI membuka sesi kolaborasi bagi mahasiswa yang sedang menyiapkan penelitian. Fokusnya sederhana: membantu tiap mahasiswa mempertajam rumusan masalah sebelum data mulai dikumpulkan.",
        "Pada sesi pertama, setiap peserta memaparkan ide penelitiannya selama lima menit lalu menerima masukan dari rekan satu kelompok. Masukan yang paling sering muncul menyangkut batasan populasi dan alat ukur yang belum jelas.",
        "Kolaborasi akan berlanjut dengan pendampingan penyusunan instrumen dan latihan membaca jurnal. Hasil tiap sesi dicatat sebagai arsip belajar bersama.",
        "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
      ],
      image: "slots-home-community",
      image_alt: "Ilustrasi mahasiswa berdiskusi dalam kelompok",
      author: "HMTI Margonda",
      sort_order: 5,
      published: true,
      archived_at: null,
    },
    {
      slug: "refleksi-organisasi",
      section: "Warta Himpunan",
      title: "Refleksi kongres mahasiswa: merawat transparansi digital",
      published_at: "2024-04-18T00:00:00.000Z",
      read_time: "4 mnt baca",
      excerpt: "Contoh warta organisasi untuk arsip, refleksi, dan pembelajaran anggota HMTI.",
      body: [
        "Kongres mahasiswa periode ini meninggalkan satu catatan penting bagi HMTI: transparansi digital bukan sekadar arsip, melainkan kebiasaan membuka informasi secara rutin bagi seluruh anggota.",
        "Peserta kongres sepakat mempublikasikan laporan kegiatan dan penggunaan anggaran melalui portal secara berkala. Anggota dapat mengaksesnya tanpa menunggu forum resmi.",
        "Refleksi ini menjadi pegangan redaksi portal dalam merawat kebiasaan baru tersebut. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
      ],
      image: "slots-home-collaboration",
      image_alt: "Ilustrasi kelompok bekerja bersama di sekitar meja",
      author: "HMTI Margonda",
      sort_order: 6,
      published: true,
      archived_at: null,
    },
  ],
  visi_misi: [
    {
      type: "vision",
      title: null,
      text: "Meningkatkan solidaritas antar anggota HMTI serta mewujudkan program kerja nyata yang berdampak pada masyarakat/kelompok umum.",
      sort_order: 1,
      published: true,
      archived_at: null,
    },
    {
      type: "mission",
      title: "Kerja yang berdampak",
      text: "Melaksanakan minimal satu program kerja yang berdampak kepada masyarakat pada satu periode.",
      sort_order: 1,
      published: true,
      archived_at: null,
    },
    {
      type: "mission",
      title: "Tanggung jawab bersama",
      text: "Membentuk tim kerja lintas divisi guna setiap anggota terlibat aktif dan merasa memiliki tanggung jawabnya.",
      sort_order: 2,
      published: true,
      archived_at: null,
    },
    {
      type: "mission",
      title: "Dokumentasi yang tertib",
      text: "Membangun sistem dokumentasi dan publikasi pada setiap program kerja yang dilaksanakan.",
      sort_order: 3,
      published: true,
      archived_at: null,
    },
    {
      type: "mission",
      title: "Evaluasi pasca program",
      text: "Mengadakan evaluasi pasca program kerja bersama anggota yang terlibat guna mengukur dampak dari terlaksananya suatu program kerja.",
      sort_order: 4,
      published: true,
      archived_at: null,
    },
  ],
  struktur_divisi: [
    // Sumber: "PENGURUS HMTI.zip" — tiga divisi resmi. Tidak ada koordinator
    // terpisah di sumber, jadi field koordinator kosong.
    {
      periode: "2024/2025",
      nomor: "01",
      ikon: "komunitas",
      nama: "PSDM",
      koordinator: "",
      tag: [],
      tugas: "Pengembangan Sumber Daya Manusia.",
      proker: [],
      sort_order: 1,
      published: true,
      archived_at: null,
    },
    {
      periode: "2024/2025",
      nomor: "02",
      ikon: "kampanye",
      nama: "KOMINFO",
      koordinator: "",
      tag: [],
      tugas: "Komunikasi dan Informasi.",
      proker: [],
      sort_order: 2,
      published: true,
      archived_at: null,
    },
    {
      periode: "2024/2025",
      nomor: "03",
      ikon: "terminal",
      nama: "LITBANG",
      koordinator: "",
      tag: [],
      tugas: "Penelitian dan Pengembangan.",
      proker: [],
      sort_order: 3,
      published: true,
      archived_at: null,
    },
  ],
  // PENGURUS INTI (BPH) — sumber: "PENGURUS HMTI.zip". Ejaan nama PERSIS;
  // foto dipetakan via lib/struktur-pengurus.ts (jangan tukar pasangan).
  struktur_members_bph: [
    {
      lencana_peran: "Ketua",
      nama: "Firmansyah Rizki Pratama",
      deskripsi: "",
      presidium: "",
      utama: true,
      sort_order: 1,
    },
    {
      lencana_peran: "Wakil Ketua",
      nama: "Muhammad Arrid Wana Syafiq",
      deskripsi: "",
      presidium: "",
      utama: false,
      sort_order: 2,
    },
    {
      lencana_peran: "Sekretaris",
      nama: "Haidar Sazili Putra",
      deskripsi: "",
      presidium: "",
      utama: false,
      sort_order: 3,
    },
    {
      lencana_peran: "Bendahara",
      nama: "Farista Ardhiana Lestari",
      deskripsi: "",
      presidium: "",
      utama: false,
      sort_order: 4,
    },
  ],
  struktur_members_anggota: {
    "01": [
      ["Masayu Putri Safana", "Anggota", "/pengurus/clean/1.png"],
      ["Naufal Muhammad Yusuf", "Anggota", "/pengurus/clean/11.png"],
      ["Khaila Hikmah Agustina", "Anggota", "/pengurus/clean/12.png"],
    ],
    "02": [
      ["Zahrotul Mulkiyah", "Anggota", "/pengurus/clean/4.png"],
      ["Muhamad Taufiq", "Anggota", "/pengurus/clean/6.png"],
      ["Sutan Arlie Johan", "Anggota", "/pengurus/clean/13.png"],
      ["Fadillah Vergiawan Pamungkas", "Anggota", "/pengurus/clean/14.png"],
    ],
    "03": [
      ["Amru Ibrahim", "Anggota", "/pengurus/clean/5.png"],
      ["Abu Hasan Burhori", "Anggota", "/pengurus/clean/8.png"],
      ["Muhammad Aqib Yazid Ilmany", "Anggota", "/pengurus/clean/10.png"],
    ],
  },
  site_images: [
    { key: "home-community", file_path: "slots-home-community", alt_text: "Ilustrasi kelompok mahasiswa berkolaborasi", caption: "" },
    { key: "home-learning", file_path: "slots-home-learning", alt_text: "Ilustrasi mahasiswa berdiskusi menggunakan laptop", caption: "" },
    { key: "home-collaboration", file_path: "slots-home-collaboration", alt_text: "Ilustrasi mahasiswa mengerjakan proyek digital", caption: "" },
    { key: "proker-website", file_path: "proker-website", alt_text: "Preview program kerja pengembangan website HMTI", caption: "" },
    { key: "proker-baksos", file_path: "proker-baksos", alt_text: "Preview program kerja bakti sosial panti asuhan", caption: "" },
  ],
};

const FILE_UPLOADS = [
  { local: "public/home-community.jpg", fileId: "slots-home-community" },
  { local: "public/home-learning.jpg", fileId: "slots-home-learning" },
  { local: "public/home-collaboration.jpg", fileId: "slots-home-collaboration" },
  { local: "public/proker-preview/website.jpg", fileId: "proker-website" },
  { local: "public/proker-preview/baksos.jpg", fileId: "proker-baksos" },
  // Foto pengurus resmi (PENGURUS HMTI.zip). 15.png sengaja tidak diunggah —
  // isinya logo, bukan foto anggota.
  { local: "public/pengurus/clean/1.png", fileId: "pengurus-01" },
  { local: "public/pengurus/clean/2.png", fileId: "pengurus-02" },
  { local: "public/pengurus/clean/3.png", fileId: "pengurus-03" },
  { local: "public/pengurus/clean/4.png", fileId: "pengurus-04" },
  { local: "public/pengurus/clean/5.png", fileId: "pengurus-05" },
  { local: "public/pengurus/clean/6.png", fileId: "pengurus-06" },
  { local: "public/pengurus/clean/7.png", fileId: "pengurus-07" },
  { local: "public/pengurus/clean/8.png", fileId: "pengurus-08" },
  { local: "public/pengurus/clean/9.png", fileId: "pengurus-09" },
  { local: "public/pengurus/clean/10.png", fileId: "pengurus-10" },
  { local: "public/pengurus/clean/11.png", fileId: "pengurus-11" },
  { local: "public/pengurus/clean/12.png", fileId: "pengurus-12" },
  { local: "public/pengurus/clean/13.png", fileId: "pengurus-13" },
  { local: "public/pengurus/clean/14.png", fileId: "pengurus-14" },
];

// â”€â”€ Eksekusi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function main() {
  console.log(`â†’ Appwrite ${ENDPOINT} (project ${projectId})`);

  // 1. Database + koleksi
  await api("POST", "/v1/databases", { databaseId: "hmti", name: "HMTI Margonda" });
  console.log("âœ“ database hmti");

  for (const c of KOLEKSI) {
    await api("POST", `/v1/databases/hmti/collections`, {
      collectionId: c.id,
      name: c.name,
      permissions: c.permissions,
      documentSecurity: false,
    });
    console.log(`  âœ“ koleksi ${c.id}`);

    const attrs = (await api("GET", `/v1/databases/hmti/collections/${c.id}/attributes`)) ?? { attributes: [] };
    for (const [key, type, opts] of c.attributes) {
      if (exists(attrs.attributes, key)) continue;
      await api("POST", `/v1/databases/hmti/collections/${c.id}/attributes/${ENDPOINT_ATTR[type]}`, {
        key,
        size: opts.size ?? 255,
        required: opts.required ?? false,
        default: opts.default,
        array: opts.array ?? false,
      });
    }
    console.log(`  âœ“ atribut ${c.id} (${c.attributes.length})`);

    await tungguAtribut(c.id);
    const idxs = (await api("GET", `/v1/databases/hmti/collections/${c.id}/indexes`)) ?? { indexes: [] };
    for (const ix of c.indexes ?? []) {
      if (exists(idxs.indexes, ix.key)) continue;
      await api("POST", `/v1/databases/hmti/collections/${c.id}/indexes`, {
        key: ix.key,
        type: ix.type,
        attributes: ix.attributes,
        orders: ix.attributes.map(() => "ASC"),
      });
    }
  }

  // 1b. Sinkronkan permission koleksi tracking pada project yang SUDAH ADA.
  // Pembuatan koleksi bersifat idempoten (skip bila sudah ada), sehingga
  // permission baru tidak akan pernah diterapkan ke koleksi lama tanpa langkah
  // ini. Verifikasi via GET dulu — PATCH hanya dijalankan bila benar-benar
  // kurang, karena beberapa deployment (termasuk Appwrite Cloud saat ini)
  // belum mengekspos route PATCH-nya.
  for (const id of ["page_views", "collab_signals"]) {
    try {
      const info = await api("GET", `/databases/hmti/collections/${id}`);
      const perms = info?.$permissions ?? [];
      if (perms.includes('create("any")')) {
        console.log(`  âœ“ permission tracking ${id} (create any) sudah benar`);
        continue;
      }
      // Route PATCH berbeda antar versi: legacy /databases vs TablesDB /tablesdb.
      let ok = false;
      for (const path of [`/databases/hmti/collections/${id}`, `/tablesdb/hmti/tables/${id}`]) {
        const res = await fetch(`${ENDPOINT}${path}`, {
          method: "PATCH",
          headers: H,
          body: JSON.stringify({ permissions: TRACKING_PERMS }),
        });
        const text = await res.text();
        if (res.ok) {
          ok = true;
          break;
        }
        if (text.trim().startsWith("<")) continue; // route tidak ada di deployment ini
        throw new Error(`PATCH ${path} → ${res.status}: ${text.slice(0, 200)}`);
      }
      if (ok) {
        console.log(`  âœ“ permission tracking ${id} (create any)`);
      } else {
        console.log(`  ! PATCH tidak tersedia via API — atur manual di Console:`);
        console.log(`    Databases → hmti → ${id} → Permissions → tambah create("any")`);
      }
    } catch (e) {
      console.log(`  ! permission ${id}: ${e.message}`);
    }
  }

  // 1c. Purge atribut PII (nim/email) dari koleksi struktur publik pada
  // project yang SUDAH ADA. Kedua koleksi ber-permission read("any") sehingga
  // NIM/email pengurus tidak boleh tersimpan di sana — siapa pun yang tahu
  // project ID bisa membacanya langsung via API. Penghapusan atribut ikut
  // menghapus nilainya dari semua dokumen (permanen).
  const PII_ATTRS = [
    { koleksi: "struktur_divisi", key: "nim" },
    { koleksi: "struktur_members", key: "nim" },
    { koleksi: "struktur_members", key: "email" },
  ];
  for (const { koleksi, key } of PII_ATTRS) {
    try {
      const attrs = (await api("GET", `/databases/hmti/collections/${koleksi}/attributes`))?.attributes ?? [];
      if (!attrs.some((a) => a.key === key)) continue;
      await api("DELETE", `/databases/hmti/collections/${koleksi}/attributes/${key}`);
      console.log(`  âœ“ purge atribut PII ${koleksi}.${key}`);
    } catch (e) {
      console.log(`  ! purge ${koleksi}.${key} gagal: ${e.message}`);
      console.log(`    Hapus manual di Console: Databases â†’ hmti â†’ ${koleksi} â†’ Attributes â†’ ${key}`);
    }
  }

  // 2. Bucket
  await api("POST", "/v1/storage/buckets", {
    bucketId: "hmti-media",
    name: "HMTI Media",
    permissions: PUBLIC_PERMS,
    fileSecurity: false,
    maximumFileSize: 50000000,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"],
  });
  console.log("âœ“ bucket hmti-media");

  // 3. Team admin + undangan super admin
  const team = await api("POST", "/v1/teams", { teamId: "admin", name: "Admin HMTI" });
  if (team) {
    const memberships = await api("GET", "/v1/teams/admin/memberships");
    const sudah = memberships?.memberships?.some((m) => m.userEmail === SUPER_ADMIN_EMAIL || m.email === SUPER_ADMIN_EMAIL);
    if (!sudah) {
      await api("POST", "/v1/teams/admin/memberships", {
        email: SUPER_ADMIN_EMAIL,
        roles: ["owner"],
        url: `${SITE_URL}/admin`,
      });
      console.log(`âœ“ undangan super admin dikirim ke ${SUPER_ADMIN_EMAIL}`);
    } else {
      console.log(`  (${SUPER_ADMIN_EMAIL} sudah menjadi member)`);
    }
  } else {
    console.log("  (team admin sudah ada)");
  }

  // 4. Seed dokumen
  async function seedKoleksi(id, dokumen) {
    const list = await api("GET", `/v1/databases/hmti/collections/${id}/documents?queries[]=${QLIMIT(1)}`);
    if (list?.total && list.total > 0) {
      console.log(`  (${id} sudah terisi ${list.total} dokumen â€” dilewati)`);
      return;
    }
    await tungguAtribut(id);
    for (const d of dokumen) {
      await api("POST", `/v1/databases/hmti/collections/${id}/documents`, { documentId: "unique()", data: d });
    }
    console.log(`  âœ“ seed ${id} (${dokumen.length} dokumen)`);
  }

  await seedKoleksi("proker", SEED.proker);
  await seedKoleksi("berita", SEED.berita);
  await seedKoleksi("visi_misi", SEED.visi_misi);
  await seedKoleksi("struktur_divisi", SEED.struktur_divisi);

  // 4b. Patch idempoten dokumen proker yang SUDAH ADA (dibuat sebelum atribut
  // detail penyelesaian dibuat): isi slug + data detail bakti sosial.
  // Sumber kebenaran: SEED di atas. Field yang sudah diubah admin lewat panel
  // (mis. documentation, outcome) tidak ditimpa — hanya diisi bila kosong.
  {
    const list = (await api("GET", `/v1/databases/hmti/collections/proker/documents?queries[]=${QLIMIT(50)}`))?.documents ?? [];
    for (const seedProker of SEED.proker) {
      const doc = list.find((d) => d.name === seedProker.name);
      if (!doc) continue;
      const perluUpdate = {};
      if (!doc.slug && seedProker.slug) perluUpdate.slug = seedProker.slug;
      for (const kunci of ["completed_at", "event_time", "location", "maps_url", "dresscode", "announcement_note"]) {
        if ((doc[kunci] ?? "") === "" && seedProker[kunci]) perluUpdate[kunci] = seedProker[kunci];
      }
      if (Object.keys(perluUpdate).length > 0) {
        await api("PATCH", `/v1/databases/hmti/collections/proker/documents/${doc.$id}`, { data: perluUpdate });
        console.log(`  ✓ patch proker "${doc.name}": ${Object.keys(perluUpdate).join(", ")}`);
      }
    }
  }

  // struktur_members: bph + anggota (butuh $id divisi)
  {
    const list = await api("GET", `/v1/databases/hmti/collections/struktur_members/documents?queries[]=${QLIMIT(1)}`);
    if (list?.total && list.total > 0) {
      console.log("  (struktur_members sudah terisi â€” dilewati)");
    } else {
      await tungguAtribut("struktur_members");
      const divs = (await api("GET", `/v1/databases/hmti/collections/struktur_divisi/documents?queries[]=${QLIMIT(10)}`))?.documents ?? [];
      const byNomor = new Map(divs.map((d) => [d.nomor, d.$id]));
      // Foto BPH dari peta resmi (public/pengurus/*) — pasangan nama→foto fixed.
      const FOTO_BPH = {
        "Firmansyah Rizki Pratama": "/pengurus/clean/9.png",
        "Muhammad Arrid Wana Syafiq": "/pengurus/clean/7.png",
        "Haidar Sazili Putra": "/pengurus/clean/2.png",
        "Farista Ardhiana Lestari": "/pengurus/clean/3.png",
      };
      for (const m of SEED.struktur_members_bph) {
        await api("POST", `/v1/databases/hmti/collections/struktur_members/documents`, {
          documentId: "unique()",
          data: {
            ...m,
            foto: FOTO_BPH[m.nama] ?? "",
            periode: "2024/2025",
            kategori: "bph",
            divisi_id: null,
            published: true,
            archived_at: null,
          },        });
      }
      for (const [nomor, anggota] of Object.entries(SEED.struktur_members_anggota)) {
        const divisiId = byNomor.get(nomor);
        let urutan = 0;
        for (const [nama, peran, foto] of anggota) {
          urutan += 1;
          await api("POST", `/v1/databases/hmti/collections/struktur_members/documents`, {
            documentId: "unique()",
            data: {
              periode: "2024/2025",
              kategori: "anggota",
              divisi_id: divisiId ?? null,
              lencana_peran: peran,
              nama,
              deskripsi: "",
              presidium: "",
              foto: foto ?? "",
              utama: false,
              sort_order: urutan,
              published: true,
              archived_at: null,
            },
          });
        }
      }
      console.log("  âœ“ seed struktur_members (4 BPH + 10 anggota divisi)");
    }
  }

  // site_images: upsert per key
  {
    const list = (await api("GET", `/v1/databases/hmti/collections/site_images/documents?queries[]=${QLIMIT(20)}`))?.documents ?? [];
    const ada = new Set(list.map((d) => d.key));
    await tungguAtribut("site_images");
    for (const s of SEED.site_images) {
      if (ada.has(s.key)) continue;
      await api("POST", `/v1/databases/hmti/collections/site_images/documents`, {
        documentId: "unique()",
        data: { key: s.key, file_path: s.file_path, alt_text: s.alt_text, caption: s.caption },
      });
    }
    console.log(`  âœ“ seed site_images (${SEED.site_images.length} slot)`);
  }

  // 5. Upload gambar
  {
    const files = (await api("GET", "/v1/storage/buckets/hmti-media/files?queries[]=" + QLIMIT(100)))?.files ?? [];
    const ada = new Set(files.map((f) => f.$id));
    for (const u of FILE_UPLOADS) {
      if (ada.has(u.fileId)) {
        console.log(`  (${u.fileId} sudah ada)`);
        continue;
      }
      const buffer = readFileSync(join(ROOT, u.local));
      const form = new FormData();
      form.append("fileId", u.fileId);
      form.append("file", new Blob([buffer]), u.local.split("/").pop());
      const res = await fetch(`${ENDPOINT}/storage/buckets/hmti-media/files`, {
        method: "POST",
        headers: { "X-Appwrite-Project": projectId, "X-Appwrite-Key": apiKey },
        body: form,
      });
      if (!res.ok) throw new Error(`upload ${u.local} â†’ ${res.status}: ${(await res.text()).slice(0, 200)}`);
      console.log(`  âœ“ upload ${u.fileId} (${u.local})`);
    }
  }

  console.log("\nSelesai. Langkah manual berikutnya:");
  console.log(`  1. Terima undangan admin di email ${SUPER_ADMIN_EMAIL}`);
  console.log("  2. Isi .env.local: NEXT_PUBLIC_APPWRITE_PROJECT_ID + NEXT_PUBLIC_APPWRITE_ENDPOINT");
  console.log("  3. Auth settings: pastikan domain situs (mis. localhost:3000) diizinkan");
}

main().catch((err) => {
  console.error("\nGAGAL:", err.message);
  process.exit(1);
});



