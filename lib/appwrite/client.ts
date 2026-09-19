import { Client } from "appwrite";

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export function isAppwriteConfigured(): boolean {
  return Boolean(projectId && endpoint.startsWith("http"));
}

let client: Client | null = null;

// Client browser Appwrite (SDK web resmi). Tanpa env → isAppwriteConfigured()
// false dan kode publik memakai fallback konten statis.
export function getAppwriteClient(): Client {
  if (!isAppwriteConfigured()) {
    throw new Error(
      "Appwrite belum dikonfigurasi. Set NEXT_PUBLIC_APPWRITE_ENDPOINT dan NEXT_PUBLIC_APPWRITE_PROJECT_ID di .env.local"
    );
  }
  if (!client) {
    client = new Client().setEndpoint(endpoint).setProject(projectId);
  }
  return client;
}
