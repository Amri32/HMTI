// Kurir amplop HMTI: tokoh kartun sekali-jalan untuk menutup form kolaborasi.
//
// Satu jalur gerak saja — terbang masuk lewat jalur sinyal, mendarat dengan
// squash, melambai, lalu berhenti. Gerak sepenuhnya diatur keyframes CSS
// (app/globals.css bagian "Kurir amplop") supaya tunduk pada
// prefers-reduced-motion di satu tempat.
//
// `padat` dipakai versi kecil di notifikasi pojok.
export default function CollabCourier({ padat = false }: { padat?: boolean }) {
  const confetti = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className={padat ? "collab-courier collab-courier--padat" : "collab-courier"} aria-hidden="true">
      <svg viewBox="0 0 260 200" role="presentation" focusable="false">
        {/* Jalur sinyal yang ditinggalkan kurir. */}
        <path className="collab-courier-trail" d="M6 188C56 188 60 140 96 120" />

        {/* Bayangan tanah: mengikuti pendaratan — muncul saat kurir masih
            di udara, mengembang saat dia menyentuh tanah. */}
        <ellipse className="collab-courier-shadow" cx="142" cy="172" rx="46" ry="7" />

        {/* Debunya mendarat: dua kepakan kecil di kiri-kanan kaki. */}
        <g className="collab-courier-dust">
          <circle cx="94" cy="166" r="5" />
          <circle cx="84" cy="171" r="3.5" />
          <circle cx="190" cy="166" r="5" />
          <circle cx="200" cy="171" r="3.5" />
        </g>

        <g className="collab-courier-body">
          <path
            className="collab-courier-star"
            d="M188 22 199 44 224 47 206 65 210 90 188 78 166 90 170 65 152 47 177 44Z"
          />

          {/* Kaki: dua garis pendek + sepatu. */}
          <g className="collab-courier-legs">
            <path d="M118 150v16" />
            <path d="M166 150v16" />
            <ellipse cx="115" cy="169" rx="9" ry="4.5" />
            <ellipse cx="169" cy="169" rx="9" ry="4.5" />
          </g>

          {/* Tangan kiri (tidak melambai). */}
          <g className="collab-courier-arm collab-courier-arm--left">
            <path d="M88 116c-16 0-24-10-27-20" />
            <circle cx="59" cy="92" r="7" />
          </g>

          {/* Badan amplop. */}
          <g className="collab-courier-mail">
            <rect className="collab-courier-detail" x="86" y="74" width="112" height="78" rx="9" />
            <path className="collab-courier-flap" d="M92 82 142 122 192 82" />
            <g className="collab-courier-face">
              <circle className="collab-courier-cheek" cx="109" cy="139" r="6.5" />
              <circle className="collab-courier-cheek" cx="175" cy="139" r="6.5" />
              <g className="collab-courier-eyes">
                <circle className="collab-courier-eye" cx="124" cy="130" r="6" />
                <circle className="collab-courier-eye" cx="160" cy="130" r="6" />
                <circle className="collab-courier-glint" cx="126" cy="128" r="1.8" />
                <circle className="collab-courier-glint" cx="162" cy="128" r="1.8" />
              </g>
              <path className="collab-courier-mouth" d="M133 143q9 9 18 0" />
            </g>
          </g>

          {/* Tangan kanan melambai. */}
          <g className="collab-courier-arm collab-courier-arm--right">
            <path d="M196 112c14-4 21-15 23-27" />
            <circle cx="221" cy="80" r="7" />
          </g>

          {/* Lencana centang. */}
          <g className="collab-courier-badge">
            <circle className="collab-courier-badge-ring" cx="212" cy="42" r="20" />
            <path className="collab-courier-check" d="M203 42.5l7 7.5 12-14" />
          </g>
        </g>
      </svg>

      {padat ? null : (
        <span className="collab-courier-confetti">
          {confetti.map((i) => (
            <span key={i} className="collab-courier-piece" data-piece={i % 4} />
          ))}
        </span>
      )}
    </div>
  );
}
