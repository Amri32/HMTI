"use client";

import { useEffect, useState } from "react";
import { Databases, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLL_AUDIT_LOG } from "@/lib/appwrite/schema";
import type { AuditLogDoc } from "@/lib/appwrite/types";
import AdmPageHead from "@/components/admin/AdmPageHead";

export default function AdminAktivitasPage() {
  const [logs, setLogs] = useState<AuditLogDoc[]>([]);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const res = await new Databases(getAppwriteClient()).listDocuments<AuditLogDoc>(
          APPWRITE_DATABASE_ID,
          COLL_AUDIT_LOG,
          [Query.orderDesc("$createdAt"), Query.limit(100)]
        );
        if (!aktif) return;
        setLogs(res.documents);
      } catch {
        if (aktif) setGagal(true);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 07"
        title="Log Aktivitas"
        lede="Jejak perubahan konten: buat, ubah, arsipkan, pulihkan, unggah."
        meta={
          <>
            Portal HMTI Margonda
            <br />
            {logs.length} entri terakhir
          </>
        }
      />

      {gagal ? (
        <p role="alert" className="adm-alert adm-alert--error mt-8">
          <span>Gagal memuat log aktivitas.</span>
        </p>
      ) : logs.length === 0 ? (
        <div className="adm-empty mt-8">
          <span className="adm-empty-mono">Kosong</span>
          Belum ada aktivitas tercatat. Aksi pengelolaan akan muncul di sini.
        </div>
      ) : (
        <ul className="adm-log mt-8">
          {logs.map((log) => (
            <li key={log.$id} className="adm-log-row">
              <div className="min-w-0">
                <p className="adm-log-action">
                  {log.action} · <span className="adm-log-entity">{log.entity}</span>
                  {log.entity_id ? <span className="adm-log-id"> #{log.entity_id.slice(0, 8)}</span> : null}
                </p>
                <p className="truncate text-[12px] text-ink-muted">{log.actor_email ?? "sistem"}</p>
              </div>
              <span className="adm-log-time">
                {new Date(log.$createdAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
