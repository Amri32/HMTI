// Skema Appwrite HMTI: id database, koleksi, bucket, dan team admin.
// Nilai ini dipakai bersama oleh kode client dan skrip setup server.

export const APPWRITE_DATABASE_ID = "hmti";
export const APPWRITE_BUCKET_ID = "hmti-media";
export const APPWRITE_ADMIN_TEAM_ID = "admin";

export const COLL_PROKER = "proker";
export const COLL_BERITA = "berita";
export const COLL_VISI_MISI = "visi_misi";
export const COLL_STRUKTUR_DIVISI = "struktur_divisi";
export const COLL_STRUKTUR_MEMBERS = "struktur_members";
export const COLL_SITE_IMAGES = "site_images";
export const COLL_MEDIA_LIBRARY = "media_library";
export const COLL_AUDIT_LOG = "audit_log";
export const COLL_PAGE_VIEWS = "page_views";
export const COLL_COLLAB_SIGNALS = "collab_signals";
// Simpanan proposal kolaborasi dari form /kontak — supaya admin bisa membaca
// pengajuan tanpa harus membuka Gmail (mailto tetap dikirim sebagai cadangan).
export const COLL_COLLAB_MESSAGES = "collab_messages";
