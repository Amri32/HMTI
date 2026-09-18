// Sinkronisasi STRUKTUR KEPENGURUSAN di Appwrite ke data resmi
// "PENGURUS HMTI.zip" (14 orang: 4 BPH + PSDM 3 + KOMINFO 4 + LITBANG 3).
//
// Bukan seed idempoten biasa: semua dokumen struktur_divisi &
// struktur_members LAMA dihapus lalu dibuat ulang (data lama fiktif tidak
// boleh tersisa). Foto tidak diunggah ke bucket — path publik /pengurus/*.png
// langsung disimpan di atribut foto dan dilayani Next.js.
//
// Jalankan: node scripts/sync-struktur.mjs
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

const PERIODE = "2024/2025";

// ── Data resmi (persis sama dengan app/site-content.ts) ────────────────────

const FOTO = {
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

const DIVISI = [
  { nomor: "01", ikon: "komunitas", nama: "PSDM", tugas: "Pengembangan Sumber Daya Manusia." },
  { nomor: "02", ikon: "kampanye", nama: "KOMINFO", tugas: "Komunikasi dan Informasi." },
  { nomor: "03", ikon: "terminal", nama: "LITBANG", tugas: "Penelitian dan Pengembangan." },
];

const BPH = [
  { lencana_peran: "Ketua", nama: "Firmansyah Rizki Pratama", utama: true },
  { lencana_peran: "Wakil Ketua", nama: "Muhammad Arrid Wana Syafiq", utama: false },
  { lencana_peran: "Sekretaris", nama: "Haidar Sazili Putra", utama: false },
  { lencana_peran: "Bendahara", nama: "Farista Ardhiana Lestari", utama: false },
];

const ANGGOTA = {
  "01": ["Masayu Putri Safana", "Naufal Muhammad Yusuf", "Khaila Hikmah Agustina"],
  "02": ["Zahrotul Mulkiyah", "Muhamad Taufiq", "Sutan Arlie Johan", "Fadillah Vergiawan Pamungkas"],
  "03": ["Amru Ibrahim", "Abu Hasan Burhori", "Muhammad Aqib Yazid Ilmany"],
};

// ── Eksekusi ────────────────────────────────────────────────────────────────

async function tungguAtribut(koleksi, timeoutMs = 120000) {
  const mulai = Date.now();
  for (;;) {
    const res = await api("GET", `/databases/hmti/collections/${koleksi}/attributes`);
    const attrs = res?.attributes ?? [];
    if (attrs.length > 0 && attrs.every((a) => a.status === "available")) return;
    if (Date.now() - mulai > timeoutMs) throw new Error(`timeout atribut ${koleksi}`);
    await new Promise((r) => setTimeout(r, 1500));
  }
}

async function hapusSemua(koleksi) {
  for (;;) {
    const q = encodeURIComponent(JSON.stringify({ method: "limit", values: [100] }));
    const res = await api("GET", `/databases/hmti/collections/${koleksi}/documents?queries[]=${q}`);
    const docs = res?.documents ?? [];
    if (docs.length === 0) return 0;
    for (const d of docs) {
      await api("DELETE", `/databases/hmti/collections/${koleksi}/documents/${d.$id}`);
    }
  }
}

async function main() {
  console.log(`→ Appwrite ${ENDPOINT} (project ${cred.projectId})`);

  // 1. Pastikan atribut foto ada di struktur_members (project lama belum punya).
  const attrs = (await api("GET", "/databases/hmti/collections/struktur_members/attributes")).attributes;
  if (!attrs.some((a) => a.key === "foto")) {
    console.log("→ membuat atribut foto (string 255)…");
    await api("POST", "/databases/hmti/collections/struktur_members/attributes/string", {
      key: "foto",
      size: 255,
      required: false,
    });
    await tungguAtribut("struktur_members");
    console.log("  ✓ atribut foto tersedia");
  }

  // 2. Hapus seluruh data struktur lama (fiktif).
  const hd = await hapusSemua("struktur_divisi");
  const hm = await hapusSemua("struktur_members");
  console.log(`  ✓ hapus data lama (${hd} divisi, ${hm} member)`);

  // 3. Buat 3 divisi resmi.
  const divisiId = new Map();
  for (const d of DIVISI) {
    const doc = await api("POST", "/databases/hmti/collections/struktur_divisi/documents", {
      documentId: "unique()",
      data: {
        periode: PERIODE,
        nomor: d.nomor,
        ikon: d.ikon,
        nama: d.nama,
        koordinator: "",
        nim: "",
        tag: [],
        tugas: d.tugas,
        proker: [],
        sort_order: Number(d.nomor),
        published: true,
        archived_at: null,
      },
    });
    divisiId.set(d.nomor, doc.$id);
    console.log(`  ✓ divisi ${d.nama}`);
  }

  // 4. Buat 4 BPH (foto dari peta resmi).
  for (const [i, m] of BPH.entries()) {
    await api("POST", "/databases/hmti/collections/struktur_members/documents", {
      documentId: "unique()",
      data: {
        periode: PERIODE,
        kategori: "bph",
        divisi_id: null,
        lencana_peran: m.lencana_peran,
        nama: m.nama,
        nim: "",
        deskripsi: "",
        presidium: "",
        email: "",
        foto: FOTO[m.nama] ?? "",
        utama: m.utama,
        sort_order: i + 1,
        published: true,
        archived_at: null,
      },
    });
    console.log(`  ✓ BPH ${m.lencana_peran}: ${m.nama}`);
  }

  // 5. Buat 10 anggota divisi (foto dari peta resmi).
  for (const [nomor, daftar] of Object.entries(ANGGOTA)) {
    let urutan = 0;
    for (const nama of daftar) {
      urutan += 1;
      await api("POST", "/databases/hmti/collections/struktur_members/documents", {
        documentId: "unique()",
        data: {
          periode: PERIODE,
          kategori: "anggota",
          divisi_id: divisiId.get(nomor) ?? null,
          lencana_peran: "Anggota",
          nama,
          nim: "",
          deskripsi: "",
          presidium: "",
          email: "",
          foto: FOTO[nama] ?? "",
          utama: false,
          sort_order: urutan,
          published: true,
          archived_at: null,
        },
      });
      console.log(`  ✓ anggota ${nomor}: ${nama}`);
    }
  }

  console.log("\nSelesai. Verifikasi: /struktur harus menampilkan 4 BPH + PSDM(3) + KOMINFO(4) + LITBANG(3) = 14 kartu berfoto.");
}

main().catch((err) => {
  console.error("\nGAGAL:", err.message);
  process.exit(1);
});
