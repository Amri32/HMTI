"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#beranda", label: "Beranda" },
  { href: "#tentang", label: "Tentang Kami" },
  { href: "#struktur", label: "Struktur" },
  { href: "#visimisi", label: "Visi & Misi" },
  { href: "#proker", label: "Proker" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-[#EEE6D9] border-b border-[#343B66]/10">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-20">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded flex items-center justify-center text-[8px] md:text-xs text-[#131313]">Logo BSI</div>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded flex items-center justify-center text-[8px] md:text-xs text-[#131313]">Logo HMTI</div>
          </div>
          <div>
            <p className="text-[#131313] font-inter text-sm md:text-xl font-semibold leading-[18px] md:leading-[26px]">HMTI Margonda</p>
            <p className="text-[#131313] font-inter text-[10px] md:text-xs leading-[12px] md:leading-[14px]">Universitas Bina Sarana Informatika</p>
          </div>
        </div>
        {/* hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#131313" strokeWidth="2">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        {/* desktop nav */}
        <ul className="hidden md:flex gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-[#131313] font-inter text-xl font-semibold leading-[26px] hover:text-[#343B66] transition-colors">{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      {/* mobile menu */}
      {open && (
        <div className="md:hidden bg-[#EEE6D9] px-5 pb-4 border-t border-[#343B66]/10">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block py-2 text-[#131313] font-inter text-lg font-semibold" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  );
}
