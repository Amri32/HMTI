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
    ],
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
      ["nim", "string", { size: 64, required: true }],
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
      ["nim", "string", { size: 64, required: true }],
      ["deskripsi", "string", { size: 2048, required: true }],
      ["presidium", "string", { size: 64, required: true }],
      ["email", "string", { size: 128, required: true }],
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
    },
    {
      name: "Bakti Sosial Panti Asuhan",
      status: "Direncanakan",
      description:
        "Kegiatan bakti sosial dan kunjungan ke panti asuhan sebagai wujud program kerja nyata yang berdampak langsung kepada masyarakat.",
      image: "proker-baksos",
      image_alt: "Preview program kerja bakti sosial panti asuhan",
      sort_order: 2,
      published: true,
      archived_at: null,
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
        "Contoh ringkasan berita kegiatan mahasiswa untuk memperlihatkan ritme katalog publikasi HMTI.",
        "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
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
      excerpt: "Contoh informasi operasional yang dapat diakses mahasiswa melalui portal HMTI.",
      body: [
        "Contoh informasi operasional yang dapat diakses mahasiswa melalui portal HMTI.",
        "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
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
        "Contoh dokumentasi program kerja yang menghubungkan kemampuan teknologi dengan kebutuhan sekitar.",
        "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
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
        "Contoh kolom teknologi dengan bahasa yang dekat, kontekstual, dan dapat dipahami pembaca mahasiswa.",
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
        "Contoh tulisan akademik populer yang menempatkan proses belajar sebagai kerja kolektif.",
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
        "Contoh warta organisasi untuk arsip, refleksi, dan pembelajaran anggota HMTI.",
        "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
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
    // terpisah di sumber, jadi field koordinator/nim kosong.
    {
      periode: "2024/2025",
      nomor: "01",
      ikon: "komunitas",
      nama: "PSDM",
      koordinator: "",
      nim: "",
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
      nim: "",
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
      nim: "",
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
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
      utama: true,
      sort_order: 1,
    },
    {
      lencana_peran: "Wakil Ketua",
      nama: "Muhammad Arrid Wana Syafiq",
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
      utama: false,
      sort_order: 2,
    },
    {
      lencana_peran: "Sekretaris",
      nama: "Haidar Sazili Putra",
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
      utama: false,
      sort_order: 3,
    },
    {
      lencana_peran: "Bendahara",
      nama: "Farista Ardhiana Lestari",
      nim: "",
      deskripsi: "",
      presidium: "",
      email: "",
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
          },
        });
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
              nim: "",
              deskripsi: "",
              presidium: "",
              email: "",
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
    const files = (await api("GET", "/v1/storage/buckets/hmti-media/files?queries[]=" + QLIMIT(20)))?.files ?? [];
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



