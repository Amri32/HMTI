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

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "unknown";
  let sid = sessionStorage.getItem("hmti_sid");
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("hmti_sid", sid);
  }
  return sid;
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
