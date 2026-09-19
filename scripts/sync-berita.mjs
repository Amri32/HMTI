// Sinkronkan konten berita dummy ke koleksi `berita` Appwrite.
//
// Target: dokumen yang masih berisi placeholder ("Tulisan ini adalah konten
// contoh…"). Dokumen yang sudah diedit admin (placeholder hilang) dilewati,
// sehingga hasil edit admin TIDAK pernah ditimpa.
//
// Jalankan: npm run berita:sync
// (kredensial dari scripts/.appwrite-cred.json, sama dengan appwrite-setup)

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CRED_FILE = join(dirname(fileURLToPath(import.meta.url)), ".appwrite-cred.json");
const cred = JSON.parse(readFileSync(CRED_FILE, "utf8"));
const ENDPOINT = (process.env.APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1").replace(/\/+$/, "");
const H = {
  "X-Appwrite-Project": cred.projectId,
  "X-Appwrite-Key": cred.apiKey,
  "Content-Type": "application/json",
};

async function api(method, path, body) {
  const res = await fetch(`${ENDPOINT}${path.replace(/^\/v1/, "")}`, {
    method,
    headers: H,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return res.status === 204 ? {} : text ? JSON.parse(text) : {};
}

// Placeholder penanda dokumen yang belum pernah diedit admin.
const PLACEHOLDER = "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.";

// Sumber konten: sama dengan app/site-content.ts (fallback statis).
const KONTEN = {
  "rekapitulasi-study-club": {
    excerpt:
      "Contoh ringkasan berita kegiatan mahasiswa untuk memperlihatkan ritme katalog publikasi HMTI.",
    body: [
      "Study Club HMTI menutup periode ini dengan empat sesi belajar yang diikuti mahasiswa Teknologi Informasi lintas angkatan. Materi yang dibahas meliputi dasar pemrograman web, pengenalan basis data, hingga latihan presentasi teknis.",
      "Format belajarnya menggabungkan sesi tutorial dan kerja kelompok. Setiap sesi ditutup dengan tanya jawab agar materi yang belum dipahami bisa dibahas langsung bersama pembina sesi.",
      "Catatan rekapitulasi setiap sesi diarsipkan di portal HMTI supaya anggota yang terhalang jadwal tetap bisa mengejar materi secara mandiri. Rekap juga menjadi bahan evaluasi penyelenggaraan sesi berikutnya.",
      "Jadwal study club periode berikutnya akan diumumkan melalui portal dan kanal informasi anggota. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
  },
  "pembukaan-pendaftaran": {
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
  },
  "digitalisasi-pembukuan": {
    excerpt:
      "Contoh dokumentasi program kerja yang menghubungkan kemampuan teknologi dengan kebutuhan sekitar.",
    body: [
      "Tim pengabdian HMTI menggelar sesi pendampingan digitalisasi pembukuan sederhana bagi pengelola usaha kecil di sekitar kampus Margonda. Kegiatan ini menjadi wujud program kerja yang berdampak langsung kepada masyarakat.",
      "Peserta dibimbing menyusun catatan pemasukan dan pengeluaran memakai aplikasi lembar kerja gratis, lengkap dengan template ringkas yang bisa dipakai ulang. Pendamping juga mempraktikkan cara membuat rekap bulanan sederhana.",
      "Sesi ditutup dengan diskusi kebutuhan pencatatan tiap usaha karena kebiasaan pencatatan setiap jenis usaha berbeda. Template diserahkan dalam bentuk digital agar mudah disesuaikan.",
      "Dokumentasi lengkap kegiatan akan dipublikasikan di portal HMTI. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
  },
  "arsitektur-microservices": {
    excerpt:
      "Contoh kolom teknologi dengan bahasa yang dekat, kontekstual, dan dapat dipahami pembaca mahasiswa.",
    body: [
      "Banyak aplikasi mahasiswa dimulai dari satu proyek kecil yang terus tumbuh hingga sulit dirawat. Arsitektur microservices menawarkan jalan keluarnya: memecah aplikasi besar menjadi layanan-layanan kecil yang berdiri sendiri, masing-masing fokus pada satu tanggung jawab.",
      "Keuntungan terbesarnya ada di sisi perawatan. Tim bisa memperbarui satu layanan tanpa menyentuh bagian lain, dan layanan yang sibuk bisa diskalakan sendiri. Konsekuensinya, komunikasi antar layanan dan pengelolaan data menjadi lebih rumit dibanding aplikasi monolitik.",
      "Untuk proyek kuliah atau portofolio awal, monolitik yang tertata sering kali lebih realistis. Microservices baru layak dipertimbangkan saat tim sudah terbagi, beban antar fitur mulai berbeda, dan kebutuhan deploy terpisah muncul nyata.",
      "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
  },
  "kolaborasi-mahasiswa": {
    excerpt:
      "Contoh tulisan akademik populer yang menempatkan proses belajar sebagai kerja kolektif.",
    body: [
      "Kelompok belajar riset HMTI membuka sesi kolaborasi bagi mahasiswa yang sedang menyiapkan penelitian. Fokusnya sederhana: membantu tiap mahasiswa mempertajam rumusan masalah sebelum data mulai dikumpulkan.",
      "Pada sesi pertama, setiap peserta memaparkan ide penelitiannya selama lima menit lalu menerima masukan dari rekan satu kelompok. Masukan yang paling sering muncul menyangkut batasan populasi dan alat ukur yang belum jelas.",
      "Kolaborasi akan berlanjut dengan pendampingan penyusunan instrumen dan latihan membaca jurnal. Hasil tiap sesi dicatat sebagai arsip belajar bersama.",
      "Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
  },
  "refleksi-organisasi": {
    excerpt: "Contoh warta organisasi untuk arsip, refleksi, dan pembelajaran anggota HMTI.",
    body: [
      "Kongres mahasiswa periode ini meninggalkan satu catatan penting bagi HMTI: transparansi digital bukan sekadar arsip, melainkan kebiasaan membuka informasi secara rutin bagi seluruh anggota.",
      "Peserta kongres sepakat mempublikasikan laporan kegiatan dan penggunaan anggaran melalui portal secara berkala. Anggota dapat mengaksesnya tanpa menunggu forum resmi.",
      "Refleksi ini menjadi pegangan redaksi portal dalam merawat kebiasaan baru tersebut. Tulisan ini adalah konten contoh yang akan diganti oleh admin melalui panel HMTI.",
    ],
  },
};

// Appwrite 2.x menerima query sebagai JSON string.
const q = encodeURIComponent(JSON.stringify({ method: "limit", values: [100] }));

async function main() {
  console.log(`→ Appwrite ${ENDPOINT} (project ${cred.projectId})`);
  const res = await api("GET", `/databases/hmti/collections/berita/documents?queries[]=${q}`);
  const docs = res?.documents ?? [];

  let diisi = 0;
  let dilewati = 0;

  for (const doc of docs) {
    const konten = KONTEN[doc.slug];
    if (!konten) continue;

    const masihPlaceholder = Array.isArray(doc.body) && doc.body.some((p) => p === PLACEHOLDER);
    if (!masihPlaceholder) {
      dilewati += 1;
      console.log(`  = ${doc.slug} (sudah diedit admin, dilewati)`);
      continue;
    }

    await api("PATCH", `/databases/hmti/collections/berita/documents/${doc.$id}`, {
      data: { excerpt: konten.excerpt, body: konten.body },
    });
    diisi += 1;
    console.log(`  ✓ ${doc.slug} (konten dummy lengkap diisi)`);
  }

  console.log(`\nSelesai: ${diisi} diisi, ${dilewati} dilewati dari ${docs.length} dokumen.`);
}

main().catch((err) => {
  console.error("\nGAGAL:", err.message);
  process.exit(1);
});
