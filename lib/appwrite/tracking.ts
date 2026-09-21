import { Databases, ID } from "appwrite";
import { getAppwriteClient } from "./client";
import {
  APPWRITE_DATABASE_ID,
  COLL_PAGE_VIEWS,
  COLL_COLLAB_SIGNALS,
} from "./schema";
import type { PageViewDoc, CollabSignalDoc } from "./types";

function getDeviceType(): PageViewDoc["device_type"] {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

function idAcak(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

// Satu sesi buka situs = satu kunjungan. sessionStorage hilang saat tab ditutup.
// Null berarti browser menolak storage: biar dashboard yang memutuskan
// fallback-nya, jangan mengarang id palsu yang menyatukan semua pengunjung.
function getSessionId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    let sid = sessionStorage.getItem("hmti_sid");
    if (!sid) {
      sid = idAcak();
      sessionStorage.setItem("hmti_sid", sid);
    }
    return sid;
  } catch {
    return null;
  }
}

// Identitas perangkat: dibuat sekali per browser lalu disimpan permanen di
// localStorage. Inilah yang membuat "berapa device berbeda" bisa dihitung —
// satu perangkat yang membuka 10 halaman, atau kembali minggu depan, tetap
// satu perangkat. Tidak ada IP yang disimpan.
function getVisitorId(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    let vid = localStorage.getItem("hmti_vid");
    if (!vid) {
      vid = idAcak();
      localStorage.setItem("hmti_vid", vid);
    }
    return vid;
  } catch {
    // localStorage bisa diblokir (mode privat/kebijakan browser). Catatan tetap
    // dikirim tanpa visitor_id, dan dashboard jatuh ke session_id untuk
    // catatan itu alih-alih menyatukan semua orang jadi satu "perangkat".
    return null;
  }
}

export async function trackPageView(page: string): Promise<void> {
  try {
    const client = getAppwriteClient();
    const db = new Databases(client);
    await db.createDocument<PageViewDoc>(
      APPWRITE_DATABASE_ID,
      COLL_PAGE_VIEWS,
      ID.unique(),
      {
        page,
        device_type: getDeviceType(),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        screen_w: typeof screen !== "undefined" ? screen.width : null,
        screen_h: typeof screen !== "undefined" ? screen.height : null,
        session_id: getSessionId(),
        visitor_id: getVisitorId(),
      }
    );
  } catch {
    // Tracking must not break the page.
  }
}

export async function trackCollabSignal(
  signalType: CollabSignalDoc["signal_type"],
  sourcePage: string,
  detail?: string
): Promise<void> {
  try {
    const client = getAppwriteClient();
    const db = new Databases(client);
    await db.createDocument<CollabSignalDoc>(
      APPWRITE_DATABASE_ID,
      COLL_COLLAB_SIGNALS,
      ID.unique(),
      {
        signal_type: signalType,
        source_page: sourcePage,
        detail: detail ?? null,
      }
    );
  } catch {
    // Tracking must not break the page.
  }
}
