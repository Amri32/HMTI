// Repository terpusat konten publik HMTI.
// Halaman publik memanggil interface ini; implementasi dipilih otomatis:
// - Appwrite terkonfigurasi (env) → AppwriteContent (read publik via query)
// - env kosong → StaticContent (fallback app/site-content.ts, situs tidak pernah kosong)
import { Databases, Query } from "appwrite";
import { formatTanggalId } from "./format";
import { getAppwriteClient, isAppwriteConfigured } from "./appwrite/client";
import {
  APPWRITE_BUCKET_ID,
  APPWRITE_DATABASE_ID,
  COLL_BERITA,
  COLL_PROKER,
  COLL_SITE_IMAGES,
  COLL_STRUKTUR_DIVISI,
  COLL_STRUKTUR_MEMBERS,
  COLL_VISI_MISI,
} from "./appwrite/schema";
import type {
  BeritaDoc,
  ProkerDoc,
  SiteImageDoc,
  StrukturDivisiDoc,
  StrukturMemberDoc,
  VisiMisiDoc,
} from "./appwrite/types";
import { fotoPengurus } from "./struktur-pengurus";
import {
  missions,
  newsCatalog,
  programKerja,
  siteImageSlots,
  strukturData,
  vision,
} from "@/app/site-content";

// ── Tipe domain (apa yang dikonsumsi halaman publik) ──────────────────────

export type ProkerItem = {
  id: string;
  name: string;
  status: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type BeritaItem = {
  id: string;
  section: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  body: string[];
  author: string;
  image: string;
  imageAlt: string;
};

export type MisiItem = {
  id: string;
  title: string;
  description: string;
};

export type VisiMisi = {
  vision: string;
  missions: MisiItem[];
};

export type StrukturAnggota = { nama: string; peran: string; foto: string | null };

export type StrukturDivisi = {
  id: string;
  nomor: string;
  ikon: string;
  nama: string;
  koordinator: string;
  nim: string;
  tag: string[];
  tugas: string;
  proker: string[];
  anggota: StrukturAnggota[];
};

export type StrukturBph = {
  id: string;
  lencanaPeran: string;
  nama: string;
  nim: string;
  deskripsi: string;
  presidium: string;
  email: string;
  utama: boolean;
  foto: string | null;
};

export type StrukturData = {
  periode: string;
  bph: StrukturBph[];
  divisi: StrukturDivisi[];
};

export type SiteImage = {
  key: string;
  url: string;
  alt: string;
  caption: string;
};

export interface ContentRepository {
  getProgramKerja(): Promise<ProkerItem[]>;
  getBerita(): Promise<BeritaItem[]>;
  getBeritaBySlug(slug: string): Promise<BeritaItem | null>;
  getVisiMisi(): Promise<VisiMisi>;
  getStruktur(): Promise<StrukturData>;
  getSiteImages(): Promise<Record<string, SiteImage>>;
}

// ── Implementasi statis (fallback tanpa Appwrite) ─────────────────────────

class StaticContent implements ContentRepository {
  async getProgramKerja(): Promise<ProkerItem[]> {
    return programKerja.map((p) => ({
      id: p.name,
      name: p.name,
      status: p.status,
      description: p.description,
      image: p.previewImage,
      imageAlt: `Preview program kerja ${p.name}`,
    }));
  }

  async getBerita(): Promise<BeritaItem[]> {
    return newsCatalog.map((n) => ({
      id: n.id,
      section: n.section,
      title: n.title,
      date: n.date,
      readTime: n.readTime,
      excerpt: n.excerpt,
      body: [n.excerpt],
      author: "HMTI Margonda",
      image: n.image,
      imageAlt: n.imageAlt,
    }));
  }

  async getBeritaBySlug(slug: string): Promise<BeritaItem | null> {
    const berita = await this.getBerita();
    return berita.find((item) => item.id === slug) ?? null;
  }

  async getVisiMisi(): Promise<VisiMisi> {
    return {
      vision,
      missions: missions.map((m, i) => ({
        id: String(i + 1),
        title: m.title,
        description: m.description,
      })),
    };
  }

  async getStruktur(): Promise<StrukturData> {
    return {
      periode: strukturData.periode,
      bph: strukturData.bph.map((o, i) => ({
        id: `bph-${i + 1}`,
        lencanaPeran: o.lencanaPeran,
        nama: o.nama,
        nim: o.nim,
        deskripsi: o.deskripsi,
        presidium: o.presidium,
        email: o.email,
        utama: o.utama,
        foto: fotoPengurus(o.nama),
      })),
      divisi: strukturData.divisi.map((d, i) => ({
        id: `divisi-${i + 1}`,
        nomor: d.nomor,
        ikon: d.ikon,
        nama: d.nama,
        koordinator: d.koordinator,
        nim: d.nim,
        tag: [...d.tag],
        tugas: d.tugas,
        proker: [...d.proker],
        anggota: d.anggota.map((a) => ({
          nama: a.nama,
          peran: a.peran,
          foto: fotoPengurus(a.nama),
        })),
      })),
    };
  }

  async getSiteImages(): Promise<Record<string, SiteImage>> {
    return Object.fromEntries(
      Object.entries(siteImageSlots).map(([key, slot]) => [
        key,
        {
          key,
          url: slot.path,
          alt: slot.alt,
          caption: slot.caption,
        },
      ])
    );
  }
}

// ── Implementasi Appwrite (read publik, filter published via query) ───────

// file_path pada dokumen = fileId storage. URL publik: endpoint storage view.
// Wajib menyertakan ?project= — tag <img> tidak mengirim header X-Appwrite-Project.
function resolveImageUrl(filePath: string | null): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const endpoint =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";
  const base = `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${encodeURIComponent(filePath)}/view`;
  return projectId ? `${base}?project=${encodeURIComponent(projectId)}` : base;
}

function asStringArray(nilai: unknown): string[] {
  return Array.isArray(nilai) ? nilai.filter((v): v is string => typeof v === "string") : [];
}

function mapBeritaDocument(document: BeritaDoc): BeritaItem {
  return {
    id: document.slug || document.$id,
    section: document.section,
    title: document.title,
    date: formatTanggalId(document.published_at),
    readTime: document.read_time ?? "",
    excerpt: document.excerpt,
    body: asStringArray(document.body),
    author: document.author ?? "HMTI Margonda",
    image: resolveImageUrl(document.image),
    imageAlt: document.image_alt ?? document.title,
  };
}

class AppwriteContent implements ContentRepository {
  private databases = new Databases(getAppwriteClient());

  async getProgramKerja(): Promise<ProkerItem[]> {
    const res = await this.databases.listDocuments<ProkerDoc>(APPWRITE_DATABASE_ID, COLL_PROKER, [
      Query.equal("published", true),
      Query.isNull("archived_at"),
      Query.orderAsc("sort_order"),
    ]);
    return res.documents.map((p) => ({
      id: p.$id,
      name: p.name,
      status: p.status,
      description: p.description,
      image: resolveImageUrl(p.image),
      imageAlt: p.image_alt ?? `Preview program kerja ${p.name}`,
    }));
  }

  async getBerita(): Promise<BeritaItem[]> {
    const res = await this.databases.listDocuments<BeritaDoc>(APPWRITE_DATABASE_ID, COLL_BERITA, [
      Query.equal("published", true),
      Query.isNull("archived_at"),
      Query.orderAsc("sort_order"),
    ]);
    return res.documents.map(mapBeritaDocument);
  }

  async getBeritaBySlug(slug: string): Promise<BeritaItem | null> {
    const res = await this.databases.listDocuments<BeritaDoc>(APPWRITE_DATABASE_ID, COLL_BERITA, [
      Query.equal("slug", slug),
      Query.equal("published", true),
      Query.isNull("archived_at"),
      Query.limit(1),
    ]);
    const document = res.documents[0];
    return document ? mapBeritaDocument(document) : null;
  }

  async getVisiMisi(): Promise<VisiMisi> {
    const res = await this.databases.listDocuments<VisiMisiDoc>(APPWRITE_DATABASE_ID, COLL_VISI_MISI, [
      Query.equal("published", true),
      Query.isNull("archived_at"),
      Query.orderAsc("sort_order"),
    ]);
    const rows = res.documents;
    const visi = rows.find((r) => r.type === "vision");
    return {
      vision: visi?.text ?? "",
      missions: rows
        .filter((r) => r.type === "mission")
        .map((r) => ({
          id: r.$id,
          title: r.title ?? "",
          description: r.text,
        })),
    };
  }

  async getStruktur(): Promise<StrukturData> {
    const [divisiRes, memberRes] = await Promise.all([
      this.databases.listDocuments<StrukturDivisiDoc>(APPWRITE_DATABASE_ID, COLL_STRUKTUR_DIVISI, [
        Query.equal("published", true),
        Query.isNull("archived_at"),
        Query.orderAsc("sort_order"),
      ]),
      this.databases.listDocuments<StrukturMemberDoc>(APPWRITE_DATABASE_ID, COLL_STRUKTUR_MEMBERS, [
        Query.equal("published", true),
        Query.isNull("archived_at"),
        Query.orderAsc("sort_order"),
      ]),
    ]);

    const anggotaPerDivisi = new Map<string, StrukturAnggota[]>();
    const bph: StrukturBph[] = [];

    for (const m of memberRes.documents) {
      // Foto: kolom DB dipakai bila terisi (jalur unggah admin), selain itu
      // fallback ke peta resmi nama→foto agar pasangan nama-foto selalu benar.
      const foto = m.foto?.trim() ? m.foto.trim() : fotoPengurus(m.nama);
      if (m.kategori === "bph") {
        bph.push({
          id: m.$id,
          lencanaPeran: m.lencana_peran,
          nama: m.nama,
          nim: m.nim,
          deskripsi: m.deskripsi,
          presidium: m.presidium,
          email: m.email,
          utama: m.utama,
          foto,
        });
      } else if (m.divisi_id) {
        const list = anggotaPerDivisi.get(m.divisi_id) ?? [];
        list.push({ nama: m.nama, peran: m.lencana_peran, foto });
        anggotaPerDivisi.set(m.divisi_id, list);
      }
    }

    const periode = memberRes.documents[0]?.periode ?? divisiRes.documents[0]?.periode ?? "";
    const divisi: StrukturDivisi[] = divisiRes.documents.map((d) => ({
      id: d.$id,
      nomor: d.nomor,
      ikon: d.ikon,
      nama: d.nama,
      koordinator: d.koordinator,
      nim: d.nim,
      tag: asStringArray(d.tag),
      tugas: d.tugas,
      proker: asStringArray(d.proker),
      anggota: anggotaPerDivisi.get(d.$id) ?? [],
    }));

    return { periode, bph, divisi };
  }

  async getSiteImages(): Promise<Record<string, SiteImage>> {
    const res = await this.databases.listDocuments<SiteImageDoc>(APPWRITE_DATABASE_ID, COLL_SITE_IMAGES, [
      Query.orderAsc("key"),
    ]);
    return Object.fromEntries(
      res.documents.map((r) => [
        r.key,
        {
          key: r.key,
          url: resolveImageUrl(r.file_path),
          alt: r.alt_text ?? "",
          caption: r.caption ?? "",
        },
      ])
    );
  }
}

// ── Factory ────────────────────────────────────────────────────────────────

let repo: ContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (!repo) {
    repo = isAppwriteConfigured() ? new AppwriteContent() : new StaticContent();
  }
  return repo;
}
