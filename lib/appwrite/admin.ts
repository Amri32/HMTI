import { Account, Databases, ID, Teams } from "appwrite";
import { getAppwriteClient } from "./client";
import { APPWRITE_ADMIN_TEAM_ID, APPWRITE_DATABASE_ID, COLL_AUDIT_LOG } from "./schema";

export type AdminAccess = "guest" | "forbidden" | "ok";

// Satu pemeriksaan akses untuk guard dan operasi admin.
// Sesi Appwrite membedakan user yang belum masuk dari user yang bukan member team.
// Catatan: teams.list() hanya mengembalikan team yang diikuti sesi ini,
// sehingga keberadaan team "admin" di hasilnya adalah bukti membership.
export async function getAdminAccess(): Promise<AdminAccess> {
  const client = getAppwriteClient();
  try {
    await new Account(client).get();
  } catch {
    return "guest";
  }

  try {
    const teams = await new Teams(client).list();
    return teams.teams.some((team) => team.$id === APPWRITE_ADMIN_TEAM_ID)
      ? "ok"
      : "forbidden";
  } catch {
    return "forbidden";
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminAccess()) === "ok";
}

// Catat aksi admin ke koleksi audit_log (arsip, publish, ubah, upload).
export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  detail?: unknown
): Promise<void> {
  const client = getAppwriteClient();
  const databases = new Databases(client);
  let actorId: string | null = null;
  let email: string | null = null;
  try {
    const akun = await new Account(client).get();
    actorId = akun.$id;
    email = akun.email ?? null;
  } catch {
    actorId = null;
    email = null;
  }
  await databases.createDocument(
    APPWRITE_DATABASE_ID,
    COLL_AUDIT_LOG,
    ID.unique(),
    {
      actor_id: actorId,
      actor_email: email,
      action,
      entity,
      entity_id: entityId ?? null,
      detail: detail === undefined ? null : JSON.stringify(detail),
    }
  );
}
