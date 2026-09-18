import { Storage } from "appwrite";
import { getAppwriteClient } from "./client";
import { APPWRITE_BUCKET_ID } from "./schema";

// Endpoint wajib membawa query ?project= untuk resource yang diakses langsung
// oleh tag <img>/<video>: elemen HTML tidak bisa mengirim header
// X-Appwrite-Project seperti SDK, sehingga tanpa parameter ini Appwrite
// menjawab 404 (bug "gambar rusak" di daftar admin maupun halaman publik).
function projectParam(): string {
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";
  return projectId ? `project=${encodeURIComponent(projectId)}` : "";
}

// URL publik file di bucket (bucket public read → tanpa auth).
export function mediaUrl(fileId: string, width?: number): string {
  const endpoint =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
  const base = `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${encodeURIComponent(fileId)}/view`;
  const project = projectParam();
  if (!project) return base;
  return width ? `${base}?${project}&width=${width}` : `${base}?${project}`;
}

// Hapus permanen file storage (dipakai alur hapus gambar/arsip media).
export async function deleteMediaFile(fileId: string): Promise<void> {
  await new Storage(getAppwriteClient()).deleteFile(APPWRITE_BUCKET_ID, fileId);
}
