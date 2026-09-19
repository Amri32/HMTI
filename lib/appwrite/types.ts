// Tipe dokumen Appwrite (Models.Document membawa $id, $createdAt, $permissions, dsb).
import type { Models } from "appwrite";

export type ProkerDoc = Models.Document & {
  name: string;
  status: string;
  description: string;
  image: string | null;
  image_alt: string | null;
  sort_order: number;
  published: boolean;
  archived_at: string | null;
};

export type BeritaDoc = Models.Document & {
  slug: string;
  section: string;
  title: string;
  published_at: string;
  read_time: string | null;
  excerpt: string;
  body: string[];
  image: string | null;
  image_alt: string | null;
  author: string | null;
  sort_order: number;
  published: boolean;
  archived_at: string | null;
};

export type VisiMisiDoc = Models.Document & {
  type: "vision" | "mission";
  title: string | null;
  text: string;
  sort_order: number;
  published: boolean;
  archived_at: string | null;
};

export type StrukturDivisiDoc = Models.Document & {
  periode: string;
  nomor: string;
  ikon: string;
  nama: string;
  koordinator: string;
  nim: string;
  tag: string[];
  tugas: string;
  proker: string[];
  sort_order: number;
  published: boolean;
  archived_at: string | null;
};

export type StrukturMemberDoc = Models.Document & {
  periode: string;
  kategori: "bph" | "anggota";
  divisi_id: string | null;
  lencana_peran: string;
  nama: string;
  nim: string;
  deskripsi: string;
  presidium: string;
  email: string;
  // Path foto publik (cth. "/pengurus/9.png"). Opsional — bila kosong, foto
  // dicari dari peta resmi nama→foto di lib/struktur-pengurus.ts.
  foto: string | null;
  utama: boolean;
  sort_order: number;
  published: boolean;
  archived_at: string | null;
};

export type SiteImageDoc = Models.Document & {
  key: string;
  file_path: string;
  alt_text: string | null;
  caption: string | null;
};

export type MediaDoc = Models.Document & {
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt_text: string | null;
  caption: string | null;
  archived_at: string | null;
  created_by: string | null;
};

export type AuditLogDoc = Models.Document & {
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: unknown;
};

export type PageViewDoc = Models.Document & {
  page: string;
  device_type: "mobile" | "tablet" | "desktop";
  user_agent: string;
  screen_w: number | null;
  screen_h: number | null;
  session_id: string | null;
};

export type CollabSignalDoc = Models.Document & {
  signal_type: "contact_click" | "collab_form_open" | "collab_form_submit";
  source_page: string;
  detail: string | null;
};

// Proposal kolaborasi yang disimpan dari form /kontak. `sudah_dibaca` dipakai
// dashboard admin untuk menandai proposal yang sudah ditindaklanjuti.
export type CollabMessageDoc = Models.Document & {
  nama: string;
  email: string;
  jenis: string;
  pesan: string;
  sudah_dibaca: boolean;
};
