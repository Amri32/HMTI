"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Databases, ID, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite/client";
import {
  APPWRITE_DATABASE_ID,
  COLL_STRUKTUR_DIVISI,
  COLL_STRUKTUR_MEMBERS,
} from "@/lib/appwrite/schema";
import type { StrukturDivisiDoc, StrukturMemberDoc } from "@/lib/appwrite/types";
import { logAudit } from "@/lib/appwrite/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  Field,
  inputCls,
  textareaCls,
  KotakError,
  KotakSukses,
  SelectCustom,
  Toggle,
} from "@/components/admin/AdminForm";
import AdmPageHead from "@/components/admin/AdmPageHead";
import { OPSI_IKON, type Ikon } from "@/components/struktur-ikon";

// Satu sumber dengan halaman publik — semua 13 ikon bisa dipilih admin.
const IKON_OPTIONS = OPSI_IKON;

type DivisiForm = {
  periode: string;
  nomor: string;
  ikon: Ikon;
  nama: string;
  koordinator: string;
  tag: string[];
  tugas: string;
  proker: string[];
  sortOrder: number;
  published: boolean;
};

const DIVISI_KOSONG: DivisiForm = {
  periode: "2024/2025",
  nomor: "",
  ikon: "terminal",
  nama: "",
  koordinator: "",
  tag: [""],
  tugas: "",
  proker: [""],
  sortOrder: 0,
  published: true,
};

type MemberForm = {
  kategori: "bph" | "anggota";
  divisiId: string;
  lencanaPeran: string;
  nama: string;
  deskripsi: string;
  presidium: string;
  foto: string;
  utama: boolean;
  sortOrder: number;
  published: boolean;
};

const MEMBER_KOSONG: MemberForm = {
  kategori: "anggota",
  divisiId: "",
  lencanaPeran: "",
  nama: "",
  deskripsi: "",
  presidium: "",
  foto: "",
  utama: false,
  sortOrder: 0,
  published: true,
};

function UbahList({ nilai, onChange }: { nilai: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      {nilai.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            className={inputCls}
            value={v}
            onChange={(e) => {
              const next = [...nilai];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder="Tambah item…"
          />
          {nilai.length > 1 ? (
            <button
              type="button"
              onClick={() => onChange(nilai.filter((_, j) => j !== i))}
              className="mt-1 border border-hairline bg-canvas px-2.5 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              Hapus
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...nilai, ""])}
        className="border border-hairline bg-canvas px-3 py-2 text-[13px] font-medium text-steel transition-colors hover:border-ink hover:text-ink"
      >
        + Tambah
      </button>
    </div>
  );
}

export default function AdminStrukturPage() {
  const [divisi, setDivisi] = useState<StrukturDivisiDoc[]>([]);
  const [members, setMembers] = useState<StrukturMemberDoc[]>([]);
  const [editDivisiId, setEditDivisiId] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [dForm, setDForm] = useState<DivisiForm>(DIVISI_KOSONG);
  const [mForm, setMForm] = useState<MemberForm>(MEMBER_KOSONG);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const db = new Databases(getAppwriteClient());
    const [d, m] = await Promise.all([
      db.listDocuments<StrukturDivisiDoc>(APPWRITE_DATABASE_ID, COLL_STRUKTUR_DIVISI, [
        Query.orderAsc("sort_order"),
      ]),
      db.listDocuments<StrukturMemberDoc>(APPWRITE_DATABASE_ID, COLL_STRUKTUR_MEMBERS, [
        Query.orderAsc("sort_order"),
      ]),
    ]);
    setDivisi(d.documents);
    setMembers(m.documents);
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        await muat();
      } catch {
        if (aktif) setError("Gagal memuat data struktur.");
      }
    })();
    return () => {
      aktif = false;
    };
  }, [muat]);

  async function simpanDivisi(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const data = {
        periode: dForm.periode.trim(),
        nomor: dForm.nomor.trim(),
        ikon: dForm.ikon,
        nama: dForm.nama.trim(),
        koordinator: dForm.koordinator.trim(),
        tag: dForm.tag.map((t) => t.trim()).filter(Boolean),
        tugas: dForm.tugas.trim(),
        proker: dForm.proker.map((p) => p.trim()).filter(Boolean),
        sort_order: Number(dForm.sortOrder) || 0,
        published: dForm.published,
      };
      const db = new Databases(getAppwriteClient());
      if (editDivisiId) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_STRUKTUR_DIVISI, editDivisiId, data);
        await logAudit("Perbarui", "struktur_divisi", editDivisiId, { nama: data.nama });
        setSukses("Divisi diperbarui.");
      } else {
        const doc = await db.createDocument(
          APPWRITE_DATABASE_ID,
          COLL_STRUKTUR_DIVISI,
          ID.unique(),
          data
        );
        await logAudit("Buat", "struktur_divisi", doc.$id, { nama: data.nama });
        setSukses("Divisi dibuat.");
      }
      setDForm(DIVISI_KOSONG);
      setEditDivisiId(null);
      await muat();
    } catch {
      setError("Gagal menyimpan divisi.");
    } finally {
      setSibuk(false);
    }
  }

  async function simpanMember(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setError(null);
    setSukses(null);
    try {
      const data = {
        periode: "2024/2025",
        kategori: mForm.kategori,
        divisi_id: mForm.kategori === "anggota" && mForm.divisiId ? mForm.divisiId : null,
        lencana_peran: mForm.lencanaPeran.trim(),
        nama: mForm.nama.trim(),
        deskripsi: mForm.deskripsi.trim(),
        presidium: mForm.presidium.trim(),
        foto: mForm.foto.trim(),
        utama: mForm.utama,
        sort_order: Number(mForm.sortOrder) || 0,
        published: mForm.published,
      };
      const db = new Databases(getAppwriteClient());
      if (editMemberId) {
        await db.updateDocument(APPWRITE_DATABASE_ID, COLL_STRUKTUR_MEMBERS, editMemberId, data);
        await logAudit("Perbarui", "struktur_members", editMemberId, { nama: data.nama });
        setSukses("Pengurus diperbarui.");
      } else {
        const doc = await db.createDocument(
          APPWRITE_DATABASE_ID,
          COLL_STRUKTUR_MEMBERS,
          ID.unique(),
          data
        );
        await logAudit("Buat", "struktur_members", doc.$id, { nama: data.nama });
        setSukses("Pengurus ditambahkan.");
      }
      setMForm(MEMBER_KOSONG);
      setEditMemberId(null);
      await muat();
    } catch {
      setError("Gagal menyimpan pengurus.");
    } finally {
      setSibuk(false);
    }
  }

  async function arsipkan(koleksi: string, doc: StrukturDivisiDoc | StrukturMemberDoc, arsip: boolean) {
    const db = new Databases(getAppwriteClient());
    await db.updateDocument(APPWRITE_DATABASE_ID, koleksi, doc.$id, {
      archived_at: arsip ? new Date().toISOString() : null,
    });
    await logAudit(arsip ? "Arsipkan" : "Pulihkan", koleksi, doc.$id);
    await muat();
  }

  function mulaiEditDivisi(doc: StrukturDivisiDoc) {
    setEditDivisiId(doc.$id);
    setDForm({
      periode: doc.periode,
      nomor: doc.nomor,
      ikon: (IKON_OPTIONS.some((i) => i.value === doc.ikon) ? doc.ikon : "terminal") as DivisiForm["ikon"],
      nama: doc.nama,
      koordinator: doc.koordinator,
      tag: doc.tag.length ? [...doc.tag] : [""],
      tugas: doc.tugas,
      proker: doc.proker.length ? [...doc.proker] : [""],
      sortOrder: doc.sort_order,
      published: doc.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function mulaiEditMember(doc: StrukturMemberDoc) {
    setEditMemberId(doc.$id);
    setMForm({
      kategori: doc.kategori,
      divisiId: doc.divisi_id ?? "",
      lencanaPeran: doc.lencana_peran,
      nama: doc.nama,
      deskripsi: doc.deskripsi,
      presidium: doc.presidium,
      foto: doc.foto ?? "",
      utama: doc.utama,
      sortOrder: doc.sort_order,
      published: doc.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="adm-page">
      <AdmPageHead
        kicker="Modul 04"
        title="Struktur Organisasi"
        lede="Kelola divisi serta pengurus (BPH & anggota). Anggota dipetakan ke divisi."
        meta={
          <>
            Portal HMTI Margonda
            <br />
            rute publik /struktur
            <Link href="/struktur" className="adm-meta-link">
              Buka halaman publik
            </Link>
          </>
        }
      />

      {error ? (
        <div className="mt-6">
          <KotakError>{error}</KotakError>
        </div>
      ) : null}
      {sukses ? (
        <div className="mt-6">
          <KotakSukses>{sukses}</KotakSukses>
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 xl:grid-cols-2">
        {/* ── Divisi ── */}
        <section>
          <div className="adm-section-head">
            <h2 className="adm-section-title">Divisi</h2>
            <span className="adm-section-count">{divisi.length} entri</span>
          </div>

          <form onSubmit={simpanDivisi} className="adm-panel adm-panel-body mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="adm-kicker">{editDivisiId ? "Ubah Divisi" : "Divisi Baru"}</p>
              {editDivisiId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditDivisiId(null);
                    setDForm(DIVISI_KOSONG);
                  }}
                  className="adm-cancel"
                >
                  Batal
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nomor urut">
                <input
                  className={inputCls}
                  value={dForm.nomor}
                  onChange={(e) => setDForm({ ...dForm, nomor: e.target.value })}
                  placeholder="01"
                  required
                />
              </Field>
              <Field label="Periode">
                <input
                  className={inputCls}
                  value={dForm.periode}
                  onChange={(e) => setDForm({ ...dForm, periode: e.target.value })}
                  required
                />
              </Field>
            </div>

            <Field label="Nama divisi">
              <input
                className={inputCls}
                value={dForm.nama}
                onChange={(e) => setDForm({ ...dForm, nama: e.target.value })}
                placeholder="cth. Media, Komunikasi & Dokumentasi"
                required
              />
            </Field>

            <Field label="Ikon">
              <SelectCustom
                value={dForm.ikon}
                options={[...IKON_OPTIONS]}
                onChange={(ikon) => setDForm({ ...dForm, ikon })}
                label="Pilih ikon"
              />
            </Field>

            <Field label="Koordinator">
              <input
                className={inputCls}
                value={dForm.koordinator}
                onChange={(e) => setDForm({ ...dForm, koordinator: e.target.value })}
                required
              />
            </Field>

            <Field label="Tag" hint="Label singkat (Web Dev, MedSos, dsb).">
              <UbahList nilai={dForm.tag} onChange={(tag) => setDForm({ ...dForm, tag })} />
            </Field>

            <Field label="Tugas pokok">
              <textarea
                className={`${textareaCls} min-h-24`}
                value={dForm.tugas}
                onChange={(e) => setDForm({ ...dForm, tugas: e.target.value })}
                required
              />
            </Field>

            <Field label="Program kerja divisi">
              <UbahList nilai={dForm.proker} onChange={(proker) => setDForm({ ...dForm, proker })} />
            </Field>

            <div className="grid grid-cols-2 items-end gap-4">
              <Field label="Urutan tampil">
                <input
                  type="number"
                  className={inputCls}
                  value={dForm.sortOrder}
                  onChange={(e) => setDForm({ ...dForm, sortOrder: Number(e.target.value) })}
                  min={0}
                />
              </Field>
              <Toggle
                checked={dForm.published}
                onChange={(published) => setDForm({ ...dForm, published })}
                label="Terbitkan"
              />
            </div>

            <button type="submit" disabled={sibuk} className="adm-btn">
              {sibuk ? "Menyimpan…" : editDivisiId ? "Simpan Perubahan" : "Buat Divisi"}
            </button>
          </form>

          <ul className="adm-list mt-4">
            {divisi.map((doc) => (
              <li
                key={doc.$id}
                className={`adm-row ${doc.archived_at ? "adm-row--archived" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {doc.nomor} · {doc.nama}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
                      <span>{doc.koordinator}</span>
                      {!doc.published ? <span className="adm-badge adm-badge--draft">Draf</span> : null}
                      {doc.archived_at ? <span className="adm-badge adm-badge--archived">Arsip</span> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => mulaiEditDivisi(doc)} className="adm-btn-ghost">
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => arsipkan(COLL_STRUKTUR_DIVISI, doc, !doc.archived_at)}
                      className="adm-btn-ghost adm-btn-ghost--quiet"
                    >
                      {doc.archived_at ? "Pulihkan" : "Arsipkan"}
                    </button>
                    <DeleteButton
                      title={doc.nama}
                      deskripsi="Anggota di divisi ini akan ikut kehilangan induk divisi."
                      collectionId={COLL_STRUKTUR_DIVISI}
                      documentId={doc.$id}
                      onDone={muat}
                    />
                  </div>
                </div>
              </li>
            ))}
            {divisi.length === 0 ? (
              <li className="adm-empty">
                <span className="adm-empty-mono">Kosong</span>
                Belum ada divisi.
              </li>
            ) : null}
          </ul>
        </section>

        {/* ── Pengurus ── */}
        <section>
          <div className="adm-section-head">
            <h2 className="adm-section-title">Pengurus</h2>
            <span className="adm-section-count">{members.length} entri</span>
          </div>

          <form onSubmit={simpanMember} className="adm-panel adm-panel-body mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="adm-kicker">{editMemberId ? "Ubah Pengurus" : "Pengurus Baru"}</p>
              {editMemberId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditMemberId(null);
                    setMForm(MEMBER_KOSONG);
                  }}
                  className="adm-cancel"
                >
                  Batal
                </button>
              ) : null}
            </div>

            <Field label="Kategori">
              <SelectCustom
                value={mForm.kategori}
                options={[
                  { value: "bph", label: "BPH (Badan Pengurus Harian)" },
                  { value: "anggota", label: "Anggota divisi" },
                ]}
                onChange={(kategori) => setMForm({ ...mForm, kategori })}
                label="Pilih kategori"
              />
            </Field>

            {mForm.kategori === "anggota" ? (
              <Field label="Divisi">
                <SelectCustom
                  value={mForm.divisiId}
                  options={divisi
                    .filter((d) => !d.archived_at)
                    .map((d) => ({ value: d.$id, label: d.nama }))}
                  onChange={(divisiId) => setMForm({ ...mForm, divisiId })}
                  label="Pilih divisi"
                />
              </Field>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nama">
                <input
                  className={inputCls}
                  value={mForm.nama}
                  onChange={(e) => setMForm({ ...mForm, nama: e.target.value })}
                  required
                />
              </Field>
              <Field label="Peran / lencana">
                <input
                  className={inputCls}
                  value={mForm.lencanaPeran}
                  onChange={(e) => setMForm({ ...mForm, lencanaPeran: e.target.value })}
                  placeholder="cth. FE Dev, Ketua"
                  required
                />
              </Field>
            </div>

            <Field label="Urutan tampil">
              <input
                type="number"
                className={inputCls}
                value={mForm.sortOrder}
                onChange={(e) => setMForm({ ...mForm, sortOrder: Number(e.target.value) })}
                min={0}
              />
            </Field>

            <Field
              label="Path foto (opsional)"
              hint="cth. /pengurus/9.png — kosongkan untuk memakai foto resmi otomatis dari nama."
            >
              <input
                className={inputCls}
                value={mForm.foto}
                onChange={(e) => setMForm({ ...mForm, foto: e.target.value })}
                placeholder="/pengurus/9.png"
              />
            </Field>

            {mForm.kategori === "bph" ? (
              <>
                <Field label="Presidium">
                  <input
                    className={inputCls}
                    value={mForm.presidium}
                    onChange={(e) => setMForm({ ...mForm, presidium: e.target.value })}
                    placeholder="cth. Presidium 01"
                  />
                </Field>
                <Field label="Deskripsi">
                  <textarea
                    className={`${textareaCls} min-h-20`}
                    value={mForm.deskripsi}
                    onChange={(e) => setMForm({ ...mForm, deskripsi: e.target.value })}
                  />
                </Field>
                <Toggle
                  checked={mForm.utama}
                  onChange={(utama) => setMForm({ ...mForm, utama })}
                  label="Pengurus utama (Ketua)"
                />
              </>
            ) : null}

            <div className="flex items-end">
              <Toggle
                checked={mForm.published}
                onChange={(published) => setMForm({ ...mForm, published })}
                label="Terbitkan"
              />
            </div>

            <button type="submit" disabled={sibuk} className="adm-btn">
              {sibuk ? "Menyimpan…" : editMemberId ? "Simpan Perubahan" : "Tambah Pengurus"}
            </button>
          </form>

          <ul className="adm-list mt-4">
            {members.map((doc) => {
              const namaDivisi = divisi.find((d) => d.$id === doc.divisi_id)?.nama;
              return (
                <li
                  key={doc.$id}
                  className={`adm-row ${doc.archived_at ? "adm-row--archived" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{doc.nama}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
                        <span className="adm-badge adm-badge--live">
                          {doc.kategori === "bph" ? "BPH" : namaDivisi ?? "—"}
                        </span>
                        <span>{doc.lencana_peran}</span>
                        {doc.utama ? <span className="adm-badge adm-badge--draft">Utama</span> : null}
                        {!doc.published ? <span className="adm-badge adm-badge--draft">Draf</span> : null}
                        {doc.archived_at ? <span className="adm-badge adm-badge--archived">Arsip</span> : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => mulaiEditMember(doc)} className="adm-btn-ghost">
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => arsipkan(COLL_STRUKTUR_MEMBERS, doc, !doc.archived_at)}
                        className="adm-btn-ghost adm-btn-ghost--quiet"
                      >
                        {doc.archived_at ? "Pulihkan" : "Arsipkan"}
                      </button>
                      <DeleteButton
                        title={doc.nama}
                        deskripsi="Profil anggota akan hilang dari halaman Struktur publik."
                        collectionId={COLL_STRUKTUR_MEMBERS}
                        documentId={doc.$id}
                        onDone={muat}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
            {members.length === 0 ? (
              <li className="adm-empty">
                <span className="adm-empty-mono">Kosong</span>
                Belum ada pengurus.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
