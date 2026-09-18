"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Databases, ID } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLL_COLLAB_MESSAGES } from "@/lib/appwrite/schema";
import { collaborationTypes, contactEmail } from "@/app/site-content";
import { trackCollabSignal } from "@/lib/appwrite/tracking";

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="collab-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function CollaborationForm() {
  const [type, setType] = useState<string>(collaborationTypes[0]);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const subjectId = useId();
  const messageId = useId();
  const typeMenuId = useId();
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const subject = `[${type}] Proposal kolaborasi: ${name || "Tanpa nama"}`;

  useEffect(() => {
    function closeTypeMenu(event: PointerEvent) {
      if (!typeMenuRef.current?.contains(event.target as Node)) {
        setIsTypeMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeTypeMenu);
    return () => document.removeEventListener("pointerdown", closeTypeMenu);
  }, []);

  const [mengirim, setMengirim] = useState(false);
  const [gagalSimpan, setGagalSimpan] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackCollabSignal("collab_form_submit", "/kontak", type);
    setMengirim(true);
    setGagalSimpan(false);
    // Simpan salinan proposal ke Appwrite agar admin bisa membacanya dari
    // dashboard tanpa membuka Gmail. Mailto tetap dibuka sebagai cadangan —
    // kegagalan simpan tidak menghalangi pengirim, hanya memberi peringatan.
    try {
      await new Databases(getAppwriteClient()).createDocument(
        APPWRITE_DATABASE_ID,
        COLL_COLLAB_MESSAGES,
        ID.unique(),
        { nama: name.trim(), email: from.trim(), jenis: type, pesan: message.trim(), sudah_dibaca: false }
      );
    } catch {
      setGagalSimpan(true);
    }
    setMengirim(false);
    const body = [
      `Jenis: ${type}`,
      `Nama: ${name}`,
      `Email pengirim: ${from}`,
      "",
      message,
    ].join("\n");
    const url = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  function chooseType(nextType: string) {
    setType(nextType);
    setIsTypeMenuOpen(false);
  }

  const inputClass =
    "w-full border-b border-hairline bg-transparent px-0 py-3 text-base text-ink transition-colors placeholder:text-ink-muted/70 hover:border-ink-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel";

  return (
    <form onSubmit={handleSubmit} className="collab-form grid gap-8">
      <div className="collab-field-row grid gap-8 sm:grid-cols-2">
        <label className="collab-field grid gap-2">
          <span className="collab-field-label">Nama / instansi</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="organization"
            className={inputClass}
          />
        </label>
        <label className="collab-field grid gap-2">
          <span className="collab-field-label">Email Anda</span>
          <input
            required
            type="email"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            autoComplete="email"
            className={inputClass}
          />
        </label>
      </div>

      <div className="collab-field collab-field-row grid gap-2">
        <label className="collab-field-label" htmlFor={subjectId}>
          Jenis kolaborasi
        </label>
        <div className="collab-select-wrap" ref={typeMenuRef}>
          <button
            id={subjectId}
            type="button"
            className="collab-select-trigger"
            aria-haspopup="listbox"
            aria-expanded={isTypeMenuOpen}
            aria-controls={typeMenuId}
            onClick={() => setIsTypeMenuOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsTypeMenuOpen(false);
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIsTypeMenuOpen(true);
              }
            }}
          >
            <span>{type}</span>
            <ChevronDown />
          </button>
          {isTypeMenuOpen && (
            <div className="collab-select-menu" id={typeMenuId} role="listbox" aria-label="Jenis kolaborasi">
              {collaborationTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={type === item}
                  className="collab-select-option"
                  data-selected={type === item}
                  onClick={() => chooseType(item)}
                >
                  <span>{item}</span>
                  {type === item && (
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="collab-field collab-field-row grid gap-2">
        <label className="grid gap-2" htmlFor={messageId}>
          <span className="collab-field-label">Ceritakan rencana kolaborasinya</span>
        </label>
        <textarea
          id={messageId}
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="collab-field-row flex flex-wrap items-center gap-4">
        <button type="submit" className="contact-submit-button" disabled={mengirim}>
          <span>{mengirim ? "Mengirim…" : "Kirim proposal via email"}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="max-w-sm text-xs leading-5 text-ink-muted">
          Pesan tersimpan di panel admin HMTI dan dibuka di aplikasi email menuju {contactEmail}.
        </p>
      </div>
      {gagalSimpan ? (
        <p role="alert" className="text-xs leading-5 text-ink-muted">
          Catatan: salinan pesan gagal tersimpan ke panel admin (kemungkinan koneksi),
          namun email tetap bisa dilanjutkan.
        </p>
      ) : null}
    </form>
  );
}
