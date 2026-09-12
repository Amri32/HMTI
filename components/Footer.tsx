import Link from "next/link";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/struktur", label: "Struktur" },
  { href: "/visi-misi", label: "Visi & Misi" },
  { href: "/proker", label: "Proker" },
  { href: "/berita", label: "Berita" },
];

export default function Footer() {
  return (
    <footer className="bg-[#EAE0CF] border-t border-[#343B66]/10 py-10 md:py-16">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex flex-col md:flex-row justify-between gap-8 md:gap-12">
        <div className="w-full md:w-[320px]">
          <h3 className="text-[#343B66] text-3xl md:text-5xl font-bold leading-tight mb-2">
            HMTI Margonda
          </h3>
          <p className="text-[#131313] text-lg font-medium leading-relaxed">
            Himpunan Mahasiswa Teknologi Informasi Cabang Margonda
          </p>
        </div>

        <div className="w-full md:w-[220px]">
          <p className="text-[#343B66] text-lg md:text-xl font-bold mb-4 tracking-wide">
            NAVIGASI
          </p>
          <ul className="space-y-2.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[#131313] text-base md:text-lg font-medium hover:text-[#343B66] transition-colors block"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-[240px]">
          <p className="text-[#343B66] text-lg md:text-xl font-bold mb-4 tracking-wide">
            PROGRAM KERJA
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link
                href="/proker"
                className="text-[#131313] text-base md:text-lg font-medium hover:text-[#343B66] transition-colors block"
              >
                Bakti Sosial
              </Link>
            </li>
            <li>
              <Link
                href="/proker"
                className="text-[#131313] text-base md:text-lg font-medium hover:text-[#343B66] transition-colors block"
              >
                Seminar Jaringan
              </Link>
            </li>
          </ul>
        </div>

        <div className="w-full md:w-[280px]">
          <p className="text-[#343B66] text-lg md:text-xl font-bold mb-4 tracking-wide">
            KONTAK
          </p>
          <ul className="space-y-2.5 text-[#131313] text-base md:text-lg font-medium">
            <li>hmti.margonda@bsi.ac.id</li>
            <li>@hmti_margonda</li>
            <li>Kampus Margonda, Depok</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

