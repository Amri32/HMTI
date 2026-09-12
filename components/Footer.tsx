import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#f1eee6] border-t border-[#e2ddd3] mt-16 text-[#0e1b2a]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#e2ddd3]">
          {/* Column 1: Info & Afiliasi */}
          <div className="lg:col-span-5 flex flex-col gap-4 pr-0 lg:pr-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src="/hmti.png"
                  alt="Logo HMTI Margonda"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-[#0e1b2a]">
                HMTI Margonda
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#0e1b2a]">
                Himpunan Mahasiswa Teknologi Informasi
              </h4>
              <p className="text-xs text-[#526071] leading-relaxed">
                Universitas Bina Sarana Informatika Kampus Margonda
              </p>
            </div>

            {/* Academic Affiliation Card */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e2ddd3] flex items-center gap-3.5 my-1 max-w-md shadow-2xs">
              <div className="relative h-9 w-12 shrink-0">
                <Image
                  src="/logo-bsi.png"
                  alt="UBSI Logo"
                  width={48}
                  height={36}
                  className="object-contain h-full w-auto"
                />
              </div>
              <div className="border-l border-[#e2ddd3] pl-3.5">
                <p className="text-[10px] tracking-wider text-[#3c608b] uppercase font-bold">
                  Afiliasi Akademik
                </p>
                <p className="text-xs text-[#0e1b2a] font-medium">
                  Universitas Bina Sarana Informatika
                </p>
              </div>
            </div>

            <p className="text-xs text-[#526071] flex items-start gap-2 pt-1 leading-relaxed">
              <svg
                className="w-4 h-4 text-[#75777d] shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                Jl. Margonda Raya No. 8, Pondok Cina, Kecamatan Beji, Kota Depok, Jawa Barat 16424
              </span>
            </p>
          </div>

          {/* Column 2: Navigasi */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h5 className="text-xs uppercase tracking-wider font-bold text-[#0e1b2a]">
              Navigasi
            </h5>
            <ul className="flex flex-col gap-2 text-xs text-[#526071]">
              <li>
                <Link href="/" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/visi-misi" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Visi &amp; Misi
                </Link>
              </li>
              <li>
                <Link href="/struktur" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Susunan Pengurus
                </Link>
              </li>
              <li>
                <Link href="/proker" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Program Kerja
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Berita &amp; Artikel
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tautan Mahasiswa */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h5 className="text-xs uppercase tracking-wider font-bold text-[#0e1b2a]">
              Tautan Kampus
            </h5>
            <ul className="flex flex-col gap-2 text-xs text-[#526071]">
              <li>
                <a
                  href="https://bsi.ac.id"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#3c608b] transition-colors py-1 block"
                >
                  Portal Mahasiswa UBSI ↗
                </a>
              </li>
              <li>
                <a
                  href="https://pmb.bsi.ac.id"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#3c608b] transition-colors py-1 block"
                >
                  PMB UBSI Margonda ↗
                </a>
              </li>
              <li>
                <Link href="/proker" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Prodi Teknologi Informasi
                </Link>
              </li>
              <li>
                <Link href="/tentang#kontak" className="hover:text-[#3c608b] transition-colors py-1 block">
                  Kolaborasi &amp; Pengabdian
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kontak & Media */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h5 className="text-xs uppercase tracking-wider font-bold text-[#0e1b2a]">
              Kontak &amp; Sekretariat
            </h5>
            <ul className="flex flex-col gap-3 text-xs text-[#526071]">
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#75777d] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a href="mailto:hmti.margonda@bsi.ac.id" className="hover:text-[#3c608b] transition-colors">
                  hmti.margonda@bsi.ac.id
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#75777d] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                <a
                  href="https://instagram.com/hmti_margonda"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#0e1b2a] hover:text-[#3c608b] transition-colors"
                >
                  @hmti_margonda
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-[#75777d] shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>Ruang Sekretariat HMTI Kampus Margonda, Gedung B</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#526071]">
          <p>© 2026 HMTI Universitas Bina Sarana Informatika Kampus Margonda. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-3">
            <span>Kode Etik Organisasi</span>
            <span>•</span>
            <span>Panduan Identitas Visual</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


