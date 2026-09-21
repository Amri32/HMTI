"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getContentRepository, type VisiMisi } from "@/lib/content-repo";
import { SignalPath } from "@/components/motion/EditorialMotion";

type VisiMisiState =
  | { status: "loading" }
  | { status: "ready"; data: VisiMisi }
  | { status: "empty" }
  | { status: "error" };

function LinkArrow() {
  return (
    <svg aria-hidden="true" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function VisiMisiContent() {
  const [state, setState] = useState<VisiMisiState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getContentRepository()
      .getVisiMisi()
      .then((data) => {
        if (!active) return;
        const hasContent = data.vision.trim().length > 0 || data.missions.length > 0;
        setState(hasContent ? { status: "ready", data } : { status: "empty" });
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const data = state.status === "ready" ? state.data : null;

  function retry() {
    setState({ status: "loading" });
    setReloadKey((key) => key + 1);
  }

  return (
    <>
      <section className="vm-vision" aria-labelledby="vm-vision-title">
        <div className="about-container vm-vision-grid" aria-busy={state.status === "loading"}>
          <p className="vm-vision-label" id="vm-vision-title">Visi</p>
          <blockquote className="vm-vision-quote">
            <span aria-hidden="true" className="vm-vision-mark" />
            {state.status === "loading" ? "Visi sedang dimuat." : null}
            {state.status === "ready" ? state.data.vision : null}
            {state.status === "empty" ? "Visi belum diterbitkan oleh pengurus HMTI." : null}
            {state.status === "error" ? "Visi belum dapat dimuat saat ini." : null}
          </blockquote>
          {state.status === "error" ? (
            <button type="button" className="vm-state-action" onClick={retry}>
              Coba muat kembali
            </button>
          ) : null}
        </div>
      </section>

      <section className="about-container vm-missions" aria-labelledby="vm-missions-title">
        <div className="vm-missions-heading">
          <h2 id="vm-missions-title">Komitmen<br /><em>dalam satu periode.</em></h2>
          <p>Setiap misi bisa ditelusuri hasilnya: dari program yang berjalan sampai evaluasi setelah selesai.</p>
        </div>

        <div className="vm-mission-flow" aria-busy={state.status === "loading"}>
          {state.status === "ready" && state.data.missions.length > 0 ? (
            <SignalPath className="vm-signal-path" />
          ) : null}
          <ol className="vm-mission-list">
            {(data?.missions ?? []).map((mission, index) => (
              <li className="vm-mission" key={mission.id}>
                <span aria-hidden="true" className="vm-mission-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{mission.title}</h3>
                  <p>{mission.description}</p>
                </div>
              </li>
            ))}
            {state.status !== "ready" || state.data.missions.length === 0 ? (
              <li className="vm-mission vm-mission-state">
                <span aria-hidden="true" className="vm-mission-index">00</span>
                <div>
                  <h3>
                    {state.status === "loading" ? "Misi sedang dimuat" : null}
                    {state.status === "empty" || (state.status === "ready" && state.data.missions.length === 0)
                      ? "Belum ada misi diterbitkan"
                      : null}
                    {state.status === "error" ? "Misi belum dapat dimuat" : null}
                  </h3>
                  <p>
                    {state.status === "error"
                      ? "Periksa koneksi lalu coba muat kembali."
                      : "Pembaruan akan tampil setelah diterbitkan oleh pengurus HMTI."}
                  </p>
                </div>
              </li>
            ) : null}
          </ol>
        </div>

        <div className="vm-next">
          <Link href="/proker" className="home-directory-link">
            <div>
              <h3>Lihat program kerja.</h3>
              <p>Bukti nyata dari arah kerja ini sedang dikumpulkan di ruang program.</p>
            </div>
            <span className="home-circle-arrow"><LinkArrow /></span>
          </Link>
          <Link href="/struktur" className="home-directory-link">
            <div>
              <h3>Kenali pengurusnya.</h3>
              <p>Misi dijalankan oleh tim lintas divisi. Kenali siapa mengerjakan apa.</p>
            </div>
            <span className="home-circle-arrow"><LinkArrow /></span>
          </Link>
        </div>
      </section>
    </>
  );
}
