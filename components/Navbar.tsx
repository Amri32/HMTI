"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/struktur", label: "Struktur" },
  { href: "/visi-misi", label: "Visi & Misi" },
  { href: "/proker", label: "Proker" },
  { href: "/berita", label: "Berita" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#EEE6D9] border-b border-[#343B66]/15 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-2 md:gap-4 group">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-8 h-8 md:w-11 md:h-11 bg-[#343B66] rounded-lg flex items-center justify-center text-[9px] md:text-xs font-bold text-[#EAE0CF] shadow-xs">
              BSI
            </div>
            <div className="w-8 h-8 md:w-11 md:h-11 bg-[#343B66] rounded-lg flex items-center justify-center text-[9px] md:text-xs font-bold text-[#EAE0CF] shadow-xs">
              HMTI
            </div>
          </div>
          <div>
            <p className="text-[#131313] font-inter text-sm md:text-xl font-bold leading-[18px] md:leading-[26px] group-hover:text-[#343B66] transition-colors">
              HMTI Margonda
            </p>
            <p className="text-[#343B66]/80 font-inter text-[10px] md:text-xs font-medium leading-[12px] md:leading-[14px]">
              Universitas Bina Sarana Informatika
            </p>
          </div>
        </Link>
        {/* hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#343B66]/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu Navigasi"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#131313"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        {/* desktop nav */}
        <ul className="hidden md:flex items-center gap-2">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`font-inter text-base font-semibold leading-6 px-4 py-2 rounded-xl transition-all duration-200 block ${
                    isActive
                      ? "bg-[#343B66] text-[#EAE0CF] shadow-xs"
                      : "text-[#131313] hover:text-[#343B66] hover:bg-[#343B66]/10"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {/* mobile menu */}
      {open && (
        <div className="md:hidden bg-[#EEE6D9] px-5 pb-5 pt-2 border-t border-[#343B66]/10 space-y-1">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block py-2.5 px-4 rounded-xl font-inter text-base font-semibold transition-all ${
                  isActive
                    ? "bg-[#343B66] text-[#EAE0CF]"
                    : "text-[#131313] hover:bg-[#343B66]/10"
                }`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

