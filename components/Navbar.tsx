"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/visi-misi", label: "Visi & Misi" },
  { href: "/struktur", label: "Struktur" },
  { href: "/proker", label: "Program Kerja" },
  { href: "/berita", label: "Berita" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-[#fcf9f1]/95 backdrop-blur-md border-b border-[#e2ddd3] transition-all">
      <div className="h-20 max-w-[1280px] mx-auto px-5 lg:px-12 flex items-center justify-between gap-6">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/hmti.png"
              alt="Logo HMTI Margonda"
              width={40}
              height={40}
              className="object-contain w-full h-full group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl lg:text-2xl text-[#0e1b2a] font-semibold tracking-tight leading-tight group-hover:text-[#3c608b] transition-colors">
              HMTI Margonda
            </span>
            <span className="text-[11px] text-[#526071] tracking-wide font-medium">
              UBSI Kampus Margonda
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2" aria-label="Menu Utama">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`min-h-[44px] inline-flex items-center px-3.5 py-1 text-sm transition-all duration-200 rounded-lg ${
                  isActive
                    ? "text-[#0e1b2a] font-semibold border-b-2 border-[#0e1b2a] bg-[#0e1b2a]/5"
                    : "text-[#526071] font-medium hover:text-[#0e1b2a] hover:bg-[#0e1b2a]/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/tentang#kontak"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl border border-[#0e1b2a] text-[#0e1b2a] text-sm font-medium hover:bg-[#0e1b2a] hover:text-[#ffffff] transition-all duration-200 shadow-xs active:scale-[0.98]"
          >
            Hubungi Kami
          </Link>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[44px] min-w-[44px] p-2 text-[#0e1b2a] hover:bg-[#ebe8e0] rounded-xl transition-colors flex items-center justify-center"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fcf9f1] border-b border-[#e2ddd3] px-5 py-4 space-y-1 animate-fadeIn shadow-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#0e1b2a] text-white font-semibold"
                    : "text-[#0e1b2a] font-medium hover:bg-[#f1eee6]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#e2ddd3]">
            <Link
              href="/tentang#kontak"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl bg-[#0e1b2a] text-white text-sm font-medium hover:bg-[#3c608b] transition-all shadow-xs"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


