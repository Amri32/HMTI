"use client";

import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ID, TablesDB } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLL_COLLAB_MESSAGES } from "@/lib/appwrite/schema";
import { collaborationTypes, contactEmail } from "@/app/site-content";
import { trackCollabSignal } from "@/lib/appwrite/tracking";
import { CollabSuccessCard, CollabSuccessToast } from "@/components/motion/CollabSuccess";
import { buatKodePengajuan, type LaporanKolaborasi } from "@/lib/kolaborasi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPositioner,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";

function ChevronDown() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type Ringkasan = LaporanKolaborasi;

// Throttle kirim di sisi klien: memperlambat pengiriman beruntun dari satu
// browser (kemungkinan bot skrip sederhana). Ini bukan pengganti rate limit
// server — Appwrite belum punya titik masuk server untuk pengajuan (lihat
// scripts/appwrite-setup.mjs, catatan create("any") pada collab_messages).
const KUNCI_THROTTLE = "hmti_kolab_kirim_terakhir";
const JEDA_KIRIM_MS = 30_000;

function buatDrafEmail(nama: string, jenis: string, dari: string, pesan: string) {
  const subject = `[${jenis}] Proposal kolaborasi: ${nama}`;
  const body = [`Jenis: ${jenis}`, `Nama: ${nama}`, `Email pengirim: ${dari}`, "", pesan].join("\n");
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function CollaborationForm() {
  const [type, setType] = useState<string>(collaborationTypes[0]);
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const subjectId = useId();
  const messageId = useId();
  const [mengirim, setMengirim] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null);
  const [toastTerbuka, setToastTerbuka] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mengirim) return;

    // Honeypot: kolom tersembunyi yang tidak pernah terisi manusia. Kalau
    // terisi (bot pengisi otomatis), pengajuan diabaikan diam-diam dan tetap
    // ditampilkan sukses supaya bot tidak belajar dari penolakan.
    if (String(new FormData(event.currentTarget).get("kolaborasi_ref") ?? "").trim() !== "") {
      setRingkasan({
        kode: buatKodePengajuan(new Date().toISOString(), `hp-${Date.now()}`),
        jenis: type,
        nama: name.trim() || "—",
        email: from.trim(),
      });
      return;
    }

    // Throttle: tolak pengiriman kedua dalam jeda singkat dari browser yang sama.
    try {
      const terakhir = Number(localStorage.getItem(KUNCI_THROTTLE) ?? "0");
      const sisa = JEDA_KIRIM_MS - (Date.now() - terakhir);
      if (terakhir > 0 && sisa > 0) {
        setSubmitError(
          `Pengajuan baru saja terkirim dari perangkat ini. Tunggu ${Math.ceil(sisa / 1000)} detik, atau gunakan email cadangan untuk yang mendesak.`
        );
        return;
      }
    } catch {
      // localStorage diblokir → throttle dilewati, pengajuan tetap diizinkan.
    }

    const nama = name.trim();
    const email = from.trim();
    const isi = message.trim();
    setMengirim(true);
    setSubmitError(null);

    let row;
    try {
      row = await new TablesDB(getAppwriteClient()).createRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: COLL_COLLAB_MESSAGES,
        rowId: ID.unique(),
        data: {
          nama,
          email,
          jenis: type,
          pesan: isi,
          // Field alur kerja (status, catatan internal) TIDAK dikirim dari
          // browser — tidak boleh dikendalikan pengunjung. Nilainya berasal
          // dari default atribut tabel (status: "baru") dan kosong, lalu hanya
          // diubah dari panel admin. `sudah_dibaca` dikirim konstan false
          // karena atributnya wajib di skema saat ini.
          sudah_dibaca: false,
        },
      });
      try {
        localStorage.setItem(KUNCI_THROTTLE, String(Date.now()));
      } catch {
        // abaikan — throttle hanya pengaman tambahan.
      }
    } catch {
      setSubmitError(
        "Pengajuan belum tersimpan. Periksa koneksi lalu coba lagi, atau gunakan email cadangan."
      );
      setMengirim(false);
      return;
    }

    const laporan: LaporanKolaborasi = {
      kode: buatKodePengajuan(row.$createdAt, row.$id),
      jenis: type,
      nama,
      email,
    };

    trackCollabSignal("collab_form_submit", "/kontak", type);
    setRingkasan(laporan);
    setToastTerbuka(true);
    setMengirim(false);
  }

  function kirimLagi() {
    setName("");
    setFrom("");
    setMessage("");
    setType(collaborationTypes[0]);
    setRingkasan(null);
    setToastTerbuka(false);
    setSubmitError(null);
  }

  const inputClass =
    "w-full border-b border-hairline bg-transparent px-0 py-3 text-base text-ink transition-colors placeholder:text-ink-muted/70 hover:border-ink-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel";

  return (
    <>
      <AnimatePresence>
        {toastTerbuka && ringkasan ? (
          <CollabSuccessToast
            key="toast-proposal"
            nama={ringkasan.nama}
            kode={ringkasan.kode}
            onClose={() => setToastTerbuka(false)}
          />
        ) : null}
      </AnimatePresence>

      {ringkasan ? (
        <CollabSuccessCard laporan={ringkasan} onReset={kirimLagi} />
      ) : (
        <>
          <form onSubmit={handleSubmit} className="collab-form grid gap-8">
            {/* Honeypot anti-bot: disembunyikan total dari layar dan pembaca
                layar, tetap ada di DOM supaya bot pengisi formulir mengisinya. */}
            <input
              type="text"
              name="kolaborasi_ref"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              defaultValue=""
            />
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
              <div className="collab-select-wrap">
                <Select value={type} onValueChange={(newValue) => setType(newValue ?? collaborationTypes[0])}>
                  <SelectTrigger id={subjectId}>
                    <SelectValue placeholder="Pilih jenis kolaborasi" />
                    <SelectIcon>
                      <ChevronDown />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectPopup>
                      {collaborationTypes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </SelectPositioner>
                </Select>
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
                <span>{mengirim ? "Mengirim..." : "Kirim proposal"}</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="max-w-sm text-xs leading-5 text-ink-muted">
                Jika berhasil, pengajuan tersimpan di panel admin HMTI dan Anda menerima nomor
                referensi.
              </p>
            </div>
            {submitError ? (
              <p className="collab-success-warn" role="alert">
                {submitError}{" "}
                <a href={buatDrafEmail(name.trim(), type, from.trim(), message.trim())}>
                  Buka draf ke {contactEmail}
                </a>
              </p>
            ) : null}
          </form>
        </>
      )}
    </>
  );
}
