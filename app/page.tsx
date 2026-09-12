import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] w-full mx-auto px-5 lg:px-12 pt-10 pb-16 lg:pt-14 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Hero Content (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1eee6] border border-[#e2ddd3] text-xs font-semibold text-[#3c608b] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#3c608b]"></span>
              <span>Himpunan Mahasiswa Teknologi Informasi · UBSI Margonda</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-[#0e1b2a] leading-[1.12] tracking-tight mb-6">
              Tumbuh bersama, berdampak melalui teknologi.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#526071] leading-relaxed max-w-2xl mb-8">
              Ruang kolaborasi mahasiswa Teknologi Informasi Universitas Bina Sarana Informatika Kampus Margonda untuk belajar, berkarya, dan memberikan kontribusi nyata bagi dunia digital.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href="/proker"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-[#0e1b2a] text-white text-sm font-semibold hover:bg-[#3c608b] transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Lihat Program Kerja</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>

              <Link
                href="/tentang"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl border border-[#e2ddd3] bg-white text-[#0e1b2a] text-sm font-semibold hover:bg-[#f6f3eb] hover:border-[#0e1b2a] transition-all active:scale-[0.98]"
              >
                Kenali HMTI
              </Link>
            </div>
          </div>

          {/* Hero Visual Card (Right 5 Cols) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative bg-white border border-[#e2ddd3] rounded-2xl p-6 sm:p-8 shadow-xs overflow-hidden">
              {/* Subtle background watermark */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 opacity-[0.06] pointer-events-none select-none">
                <Image
                  src="/hmti.png"
                  alt="HMTI Watermark"
                  width={256}
                  height={256}
                  className="object-contain w-full h-full"
                />
              </div>

              {/* Top Card Header */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#e2ddd3]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-xs font-semibold text-[#0e1b2a] uppercase tracking-wider">
                    Periode Aktif 2025/2026
                  </span>
                </div>
                <span className="text-xs font-medium text-[#3c608b] bg-[#3c608b]/10 px-2.5 py-1 rounded-md">
                  Kampus Margonda
                </span>
              </div>

              {/* Graphic Feature Box */}
              <div className="relative aspect-[16/10] bg-[#f6f3eb] border border-[#e2ddd3] rounded-xl flex flex-col items-center justify-center p-6 text-center mb-6 overflow-hidden group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e2ddd3] flex items-center justify-center text-[#0e1b2a] mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                  <Image
                    src="/hmti.png"
                    alt="Logo HMTI"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <p className="font-serif text-lg font-semibold text-[#0e1b2a]">
                  Himpunan Mahasiswa Teknologi Informasi
                </p>
                <p className="text-xs text-[#526071] mt-1">
                  Mewadahi aspirasi &amp; akselerasi talenta digital mahasiswa
                </p>
              </div>

              {/* Micro Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#fcf9f1] rounded-xl border border-[#e2ddd3]">
                  <p className="font-serif text-xl font-bold text-[#0e1b2a]">300+</p>
                  <p className="text-[11px] text-[#526071] mt-0.5">Mahasiswa</p>
                </div>
                <div className="p-3 bg-[#fcf9f1] rounded-xl border border-[#e2ddd3]">
                  <p className="font-serif text-xl font-bold text-[#3c608b]">12+</p>
                  <p className="text-[11px] text-[#526071] mt-0.5">Program Kerja</p>
                </div>
                <div className="p-3 bg-[#fcf9f1] rounded-xl border border-[#e2ddd3]">
                  <p className="font-serif text-xl font-bold text-[#0e1b2a]">5</p>
                  <p className="text-[11px] text-[#526071] mt-0.5">Divisi Ahli</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: TICKER & AGENDA BAR                                            */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#f6f3eb] py-6 border-y border-[#e2ddd3]">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#e2ddd3]">
            {/* Item 1 */}
            <div className="flex flex-col gap-1 md:pr-4 pt-3 md:pt-0">
              <span className="text-[11px] text-[#3c608b] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3c608b]"></span>
                Periode Kepengurusan
              </span>
              <p className="text-base font-semibold text-[#0e1b2a]">Tahun Akademik 2025 / 2026</p>
              <span className="text-xs text-[#526071]">Kabinet Sinergi &amp; Akselerasi Digital</span>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-1 md:px-6 pt-3 md:pt-0">
              <span className="text-[11px] text-[#3c608b] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Agenda Terdekat
              </span>
              <p className="text-base font-semibold text-[#0e1b2a]">IT Tech Fest Margonda 2026</p>
              <span className="text-xs text-[#526071]">Seminar Nasional &amp; Kompetisi Web Design</span>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-1 md:pl-6 pt-3 md:pt-0">
              <span className="text-[11px] text-[#3c608b] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3c608b]"></span>
                Afiliasi Kampus
              </span>
              <p className="text-base font-semibold text-[#0e1b2a]">UBSI Kampus Margonda Depok</p>
              <span className="text-xs text-[#526071]">Program Studi Teknologi Informasi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: TENTANG HMTI & 3 PILAR NILAI                                   */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] w-full mx-auto px-5 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: 5 Cols */}
          <div className="lg:col-span-5 flex flex-col pr-0 lg:pr-6">
            <span className="text-xs text-[#3c608b] uppercase tracking-widest font-bold mb-3">
              TENTANG HMTI
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0e1b2a] leading-snug">
              Ruang untuk belajar, bertumbuh, dan bergerak bersama.
            </h2>
            <p className="text-sm sm:text-base text-[#526071] leading-relaxed mt-6">
              Himpunan Mahasiswa Teknologi Informasi (HMTI) UBSI Margonda merupakan organisasi kemahasiswaan yang mewadahi aspirasi, kreasi, dan penguatan kompetensi civitas akademika Program Studi Teknologi Informasi.
            </p>
            <div className="mt-8">
              <Link
                href="/tentang"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors group"
              >
                <span>Pelajari sejarah &amp; latar belakang</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 7 Cols (Numbered Rows) */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-[#e2ddd3] border-t border-b border-[#e2ddd3]">
            {/* Row 01: Belajar */}
            <div className="py-6 sm:py-8 flex items-start gap-6">
              <span className="font-serif text-3xl sm:text-4xl text-[#3c608b] font-semibold min-w-[48px]">
                01
              </span>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl text-[#0e1b2a] font-semibold">
                  Belajar
                </h3>
                <p className="text-sm text-[#526071] leading-relaxed">
                  Mengembangkan kompetensi teknis dan nalar analitis mahasiswa TI melalui workshop berkala, pelatihan pemrograman modern, kecerdasan buatan, jaringan komputer, serta diskusi akademik yang mendalam.
                </p>
              </div>
            </div>

            {/* Row 02: Berkolaborasi */}
            <div className="py-6 sm:py-8 flex items-start gap-6">
              <span className="font-serif text-3xl sm:text-4xl text-[#3c608b] font-semibold min-w-[48px]">
                02
              </span>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl text-[#0e1b2a] font-semibold">
                  Berkolaborasi
                </h3>
                <p className="text-sm text-[#526071] leading-relaxed">
                  Membangun jejaring sinergis lintas angkatan, bekerja sama dalam tim proyek, serta menghubungkan mahasiswa dengan dosen, alumni berprestasi, dan praktisi industri teknologi terkemuka.
                </p>
              </div>
            </div>

            {/* Row 03: Berdampak */}
            <div className="py-6 sm:py-8 flex items-start gap-6">
              <span className="font-serif text-3xl sm:text-4xl text-[#3c608b] font-semibold min-w-[48px]">
                03
              </span>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl text-[#0e1b2a] font-semibold">
                  Berdampak
                </h3>
                <p className="text-sm text-[#526071] leading-relaxed">
                  Menghadirkan karya nyata, solusi digital aplikatif, dan kontribusi sosial kemasyarakatan yang bermanfaat langsung bagi kampus, lingkungan sekitar Kota Depok, dan bangsa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: VISI & MISI SPOTLIGHT                                          */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] w-full mx-auto px-5 lg:px-12 py-8">
        <div className="bg-white border border-[#e2ddd3] rounded-2xl p-8 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Visi Side (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <span className="text-xs text-[#3c608b] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#3c608b]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                VISI UTAMA
              </span>

              <blockquote className="font-serif text-xl sm:text-2xl text-[#0e1b2a] italic leading-relaxed">
                “Menjadi wadah pengembangan mahasiswa Teknologi Informasi yang unggul, berintegritas, adaptif terhadap kemajuan era digital, dan berdaya saing global.”
              </blockquote>

              <div className="mt-8 pt-4 border-t border-[#e2ddd3]">
                <span className="text-[11px] text-[#526071] uppercase tracking-wider block font-semibold">
                  Landasan Organisasi
                </span>
                <p className="text-xs text-[#0e1b2a] mt-1 font-medium">
                  Pedoman Dasar Anggaran Rumah Tangga &amp; Kongres HMTI UBSI
                </p>
              </div>
            </div>

            {/* Misi Side (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <span className="text-xs text-[#3c608b] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#3c608b]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                MISI STRATEGIS
              </span>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#fcf9f1] border border-[#e2ddd3]">
                  <span className="w-5 h-5 rounded-full bg-[#0e1b2a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-xs sm:text-sm text-[#0e1b2a] leading-relaxed">
                    Menyelenggarakan kegiatan penguatan kompetensi teknis, coding bootcamp, dan pengenalan inovasi teknologi mutakhir bagi seluruh mahasiswa.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#fcf9f1] border border-[#e2ddd3]">
                  <span className="w-5 h-5 rounded-full bg-[#0e1b2a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-xs sm:text-sm text-[#0e1b2a] leading-relaxed">
                    Membangun iklim organisasi yang kolaboratif, profesional, beretika, dan inklusif di lingkungan Universitas Bina Sarana Informatika.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#fcf9f1] border border-[#e2ddd3]">
                  <span className="w-5 h-5 rounded-full bg-[#0e1b2a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-xs sm:text-sm text-[#0e1b2a] leading-relaxed">
                    Menggalang kemitraan aktif dengan industri teknologi, perguruan tinggi lain, serta instansi masyarakat guna memperluas dampak kemanfaatan.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/visi-misi"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors"
                >
                  <span>Baca Visi &amp; Misi Selengkapnya</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: PROGRAM KERJA UNGGULAN                                         */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] w-full mx-auto px-5 lg:px-12 py-16 lg:py-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs text-[#3c608b] uppercase tracking-widest font-bold block mb-2">
              PROGRAM UNGGULAN
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0e1b2a]">
              Program yang sedang kami jalankan
            </h2>
          </div>
          <p className="text-sm text-[#526071] max-w-md">
            Inisiatif terstruktur untuk mengasah kemampuan teknis, kepemimpinan, dan jejaring kerja mahasiswa TI Margonda.
          </p>
        </div>

        {/* 1. Large Featured Program Card */}
        <div className="bg-white border border-[#e2ddd3] rounded-2xl p-6 lg:p-8 shadow-xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Box */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] bg-[#ede9df] border border-[#dcd7cc] rounded-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-white border border-[#e2ddd3] flex items-center justify-center text-[#3c608b] mb-3 shadow-2xs">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="font-serif text-xl font-bold text-[#0e1b2a]">
                  IT Tech Fest Margonda 2026
                </p>
                <span className="text-xs text-[#526071] mt-1">
                  Event Akbar Tahunan HMTI UBSI
                </span>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Pendaftaran Terbuka
                </div>
              </div>
            </div>

            {/* Details Box */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3c608b] uppercase tracking-wider mb-2">
                <span>Flagship Annual Event</span>
                <span>•</span>
                <span>Seminar &amp; Kompetisi</span>
              </div>
              <h3 className="font-serif text-2xl lg:text-3xl text-[#0e1b2a] mb-3">
                IT Tech Fest Margonda: Akselerasi Talenta Menuju Era AI
              </h3>
              <p className="text-sm text-[#526071] leading-relaxed mb-6">
                Pekan teknologi terbesar yang menghadirkan Seminar Nasional bersama pakar industri, Lomba UI/UX Design &amp; Web Development tingkat mahasiswa, serta Pameran Proyek Akhir karya mahasiswa TI Margonda.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full pt-4 mb-6 border-t border-[#e2ddd3]">
                <div>
                  <span className="text-[11px] text-[#526071] block">Sasaran Peserta</span>
                  <span className="text-xs font-semibold text-[#0e1b2a]">Mahasiswa &amp; Umum</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#526071] block">Format Acara</span>
                  <span className="text-xs font-semibold text-[#0e1b2a]">Hybrid (Aula &amp; Online)</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#526071] block">Sertifikat</span>
                  <span className="text-xs font-semibold text-[#0e1b2a]">SKPI Diakui</span>
                </div>
              </div>

              <Link
                href="/proker"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0e1b2a] px-5 py-2.5 rounded-xl hover:bg-[#3c608b] transition-all shadow-xs"
              >
                <span>Lihat Detail Program</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Sibling Program Cards (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white border border-[#e2ddd3] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#3c608b] uppercase tracking-wider">
                  Divisi Pendidikan &amp; Riset
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  Sedang Berjalan
                </span>
              </div>
              <h4 className="font-serif text-xl font-bold text-[#0e1b2a] mb-2">
                Coding Bootcamp &amp; Cloud Workshop Series
              </h4>
              <p className="text-xs sm:text-sm text-[#526071] leading-relaxed mb-6">
                Pelatihan intensif mingguan yang membahas pengembangan web modern (Next.js, Tailwind), fundamental arsitektur cloud, dan dasar-dasar machine learning untuk mahasiswa.
              </p>
            </div>
            <Link
              href="/proker"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors pt-4 border-t border-[#e2ddd3]"
            >
              <span>Detail kurikulum &amp; jadwal</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#e2ddd3] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#3c608b] uppercase tracking-wider">
                  Divisi Sosial &amp; Pengabdian
                </span>
                <span className="text-[11px] font-semibold text-[#3c608b] bg-[#3c608b]/10 px-2.5 py-0.5 rounded-md">
                  Mendatang
                </span>
              </div>
              <h4 className="font-serif text-xl font-bold text-[#0e1b2a] mb-2">
                HMTI Mengabdi: Edukasi Literasi Digital &amp; Keamanan Siber
              </h4>
              <p className="text-xs sm:text-sm text-[#526071] leading-relaxed mb-6">
                Program pengabdian masyarakat untuk memberikan edukasi literasi digital, pencegahan penipuan online, dan pemanfaatan perangkat digital bagi UMKM dan pelajar sekolah.
              </p>
            </div>
            <Link
              href="/proker"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors pt-4 border-t border-[#e2ddd3]"
            >
              <span>Jadwal &amp; lokasi pengabdian</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* View All Proker Link */}
        <div className="text-center pt-2">
          <Link
            href="/proker"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors"
          >
            <span>Lihat Katalog Seluruh Program Kerja</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: KEPENGURUSAN / ORANG-ORANG DI BALIK HMTI                       */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] w-full mx-auto px-5 lg:px-12 py-16 lg:py-24 border-t border-[#e2ddd3]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs text-[#3c608b] uppercase tracking-widest font-bold block mb-2">
              KEPENGURUSAN
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0e1b2a]">
              Orang-orang di balik HMTI
            </h2>
          </div>
          <p className="text-sm text-[#526071] max-w-md">
            Kolaborator yang mendedikasikan waktu, tenaga, dan gagasan untuk kemajuan seluruh anggota himpunan.
          </p>
        </div>

        {/* 4-Column Portrait Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Pengurus 1: Ketua Umum */}
          <div className="bg-white border border-[#e2ddd3] rounded-2xl p-4 shadow-xs flex flex-col group hover:border-[#0e1b2a] transition-all">
            <div className="relative w-full aspect-[3/4] bg-[#ede9df] border border-[#dcd7cc] rounded-xl overflow-hidden mb-4 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#e2ddd3] flex items-center justify-center text-[#526071] mb-2 group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-xs text-[#526071] font-medium">BPH Utama</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#3c608b] uppercase tracking-wider font-bold">
                Ketua Umum
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0e1b2a] mt-0.5">
                Ketua HMTI Margonda
              </h3>
              <p className="text-xs text-[#526071] mt-1">
                Teknologi Informasi · Angkatan 2023
              </p>
            </div>
          </div>

          {/* Pengurus 2: Wakil Ketua */}
          <div className="bg-white border border-[#e2ddd3] rounded-2xl p-4 shadow-xs flex flex-col group hover:border-[#0e1b2a] transition-all">
            <div className="relative w-full aspect-[3/4] bg-[#ede9df] border border-[#dcd7cc] rounded-xl overflow-hidden mb-4 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#e2ddd3] flex items-center justify-center text-[#526071] mb-2 group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-xs text-[#526071] font-medium">BPH Utama</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#3c608b] uppercase tracking-wider font-bold">
                Wakil Ketua Umum
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0e1b2a] mt-0.5">
                Wakil Ketua HMTI
              </h3>
              <p className="text-xs text-[#526071] mt-1">
                Teknologi Informasi · Angkatan 2023
              </p>
            </div>
          </div>

          {/* Pengurus 3: Sekretaris */}
          <div className="bg-white border border-[#e2ddd3] rounded-2xl p-4 shadow-xs flex flex-col group hover:border-[#0e1b2a] transition-all">
            <div className="relative w-full aspect-[3/4] bg-[#ede9df] border border-[#dcd7cc] rounded-xl overflow-hidden mb-4 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#e2ddd3] flex items-center justify-center text-[#526071] mb-2 group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-xs text-[#526071] font-medium">BPH Administrasi</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#3c608b] uppercase tracking-wider font-bold">
                Sekretaris Umum
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0e1b2a] mt-0.5">
                Sekretaris HMTI
              </h3>
              <p className="text-xs text-[#526071] mt-1">
                Teknologi Informasi · Angkatan 2024
              </p>
            </div>
          </div>

          {/* Pengurus 4: Bendahara */}
          <div className="bg-white border border-[#e2ddd3] rounded-2xl p-4 shadow-xs flex flex-col group hover:border-[#0e1b2a] transition-all">
            <div className="relative w-full aspect-[3/4] bg-[#ede9df] border border-[#dcd7cc] rounded-xl overflow-hidden mb-4 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#e2ddd3] flex items-center justify-center text-[#526071] mb-2 group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-xs text-[#526071] font-medium">BPH Keuangan</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#3c608b] uppercase tracking-wider font-bold">
                Bendahara Umum
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0e1b2a] mt-0.5">
                Bendahara HMTI
              </h3>
              <p className="text-xs text-[#526071] mt-1">
                Teknologi Informasi · Angkatan 2024
              </p>
            </div>
          </div>
        </div>

        {/* View Full Structure Link */}
        <div className="text-center">
          <Link
            href="/struktur"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors"
          >
            <span>Lihat Struktur Organisasi Lengkap (BPH &amp; Seluruh Divisi)</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: KABAR TERBARU DARI HMTI                                        */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] w-full mx-auto px-5 lg:px-12 py-16 lg:py-24 border-t border-[#e2ddd3]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs text-[#3c608b] uppercase tracking-widest font-bold block mb-2">
              KABAR &amp; ARTIKEL
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0e1b2a]">
              Kabar terbaru dari HMTI
            </h2>
          </div>
          <Link
            href="/berita"
            className="text-xs font-semibold text-[#3c608b] hover:text-[#0e1b2a] transition-colors"
          >
            Lihat semua warta kegiatan →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Featured Article (Left: 6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#e2ddd3] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="relative w-full aspect-[16/9] bg-[#ede9df] border border-[#dcd7cc] rounded-xl overflow-hidden mb-6 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-white border border-[#e2ddd3] flex items-center justify-center text-[#526071] mb-2 shadow-2xs">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <p className="font-serif text-base font-semibold text-[#0e1b2a]">
                  Dokumentasi Kegiatan HMTI
                </p>
                <span className="text-xs text-[#526071] mt-0.5">
                  Rilis Warta &amp; Publikasi Kampus
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#526071] mb-3">
                <span className="font-semibold text-[#3c608b]">WARTA UTAMA</span>
                <span>•</span>
                <span>September 2026</span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl text-[#0e1b2a] mb-3 leading-snug">
                Pembukaan Rangkaian IT Tech Fest 2026: Kolaborasi Mahasiswa Menjawab Tantangan Disrupsi Digital
              </h3>

              <p className="text-xs sm:text-sm text-[#526071] leading-relaxed mb-6">
                HMTI UBSI Kampus Margonda resmi meluncurkan agenda kompetisi dan lokakarya tahunan, mempertemukan puluhan perwakilan mahasiswa untuk mengeksplorasi kecerdasan buatan dan rekayasa perangkat lunak.
              </p>
            </div>

            <Link
              href="/berita"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors pt-4 border-t border-[#e2ddd3]"
            >
              <span>Baca Rilis Selengkapnya</span>
              <span>→</span>
            </Link>
          </div>

          {/* Stacked Articles (Right: 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Article Item 1 */}
            <div className="bg-white border border-[#e2ddd3] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-[#526071] mb-2">
                  <span className="font-semibold text-[#3c608b]">BOOTCAMP</span>
                  <span>•</span>
                  <span>Agustus 2026</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#0e1b2a] mb-2 leading-snug">
                  Workshop Fullstack Web Development dengan Next.js &amp; Tailwind CSS
                </h4>
                <p className="text-xs sm:text-sm text-[#526071] leading-relaxed mb-4">
                  Sesi praktikal pembuatan aplikasi web interaktif bersama mentor alumni yang berkarir sebagai Software Engineer di industri tech unicorn.
                </p>
              </div>
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors pt-3 border-t border-[#e2ddd3]"
              >
                <span>Baca Selengkapnya</span>
                <span>→</span>
              </Link>
            </div>

            {/* Article Item 2 */}
            <div className="bg-white border border-[#e2ddd3] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-[#526071] mb-2">
                  <span className="font-semibold text-[#3c608b]">PENGABDIAN</span>
                  <span>•</span>
                  <span>Juli 2026</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#0e1b2a] mb-2 leading-snug">
                  Sosialisasi Keamanan Data Pribadi dan Internet Sehat untuk Generasi Muda di Depok
                </h4>
                <p className="text-xs sm:text-sm text-[#526071] leading-relaxed mb-4">
                  Inisiatif pengabdian masyarakat oleh divisi Sosial HMTI untuk membangun kesadaran keamanan siber dan perlindungan privasi digital bagi masyarakat.
                </p>
              </div>
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0e1b2a] hover:text-[#3c608b] transition-colors pt-3 border-t border-[#e2ddd3]"
              >
                <span>Baca Selengkapnya</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: KOLABORASI & CTA BANNER                                        */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] w-full mx-auto px-5 lg:px-12 pb-16 pt-4">
        <div className="bg-[#0e1b2a] text-white rounded-2xl p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-md">
          {/* Watermark in CTA */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.05] pointer-events-none select-none">
            <Image
              src="/hmti.png"
              alt="HMTI Logo"
              width={320}
              height={320}
              className="object-contain w-full h-full"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Copy (8 cols) */}
            <div className="lg:col-span-8">
              <span className="text-[11px] text-[#a8ccfd] uppercase tracking-widest font-bold block mb-3">
                KOLABORASI &amp; SINERGI
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#fcf9f1] mb-4 leading-tight">
                Punya ide atau ingin berkolaborasi?
              </h2>
              <p className="text-sm sm:text-base text-[#bac7dc] mb-8 max-w-xl leading-relaxed">
                HMTI terbuka untuk gagasan, kegiatan bersama, sponsorship, dan kemitraan strategis yang memberi manfaat langsung bagi mahasiswa serta ekosistem teknologi kampus.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/tentang#kontak"
                  className="min-h-[46px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#fcf9f1] text-[#0e1b2a] text-sm font-semibold hover:bg-white transition-all shadow-xs active:scale-[0.98]"
                >
                  Hubungi HMTI
                </Link>

                <a
                  href="mailto:hmti.margonda@bsi.ac.id"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <svg
                    className="w-4 h-4"
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
                  <span>Kirim Proposal</span>
                </a>
              </div>
            </div>

            {/* Right Information Box (4 cols) */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a8ccfd] mb-3">
                Sekretariat HMTI
              </h3>
              <p className="text-xs text-[#bac7dc] leading-relaxed mb-4">
                Gedung Kampus UBSI Margonda, Lantai 2 Ruang B.204. Jl. Margonda Raya No. 8, Depok.
              </p>
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-[#bac7dc]">
                <div className="flex items-center justify-between">
                  <span>Waktu Respon:</span>
                  <span className="font-semibold text-white">1 - 2 Hari Kerja</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Surel Resmi:</span>
                  <span className="font-semibold text-white">hmti.margonda@bsi.ac.id</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
