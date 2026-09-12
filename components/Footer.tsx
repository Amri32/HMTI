export default function Footer() {
  return (
    <footer className="bg-[#EAE0CF] py-6 md:py-10">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="w-full md:w-[295px]">
          <p className="text-[#343B66] text-3xl md:text-6xl font-semibold leading-[36px] md:leading-[74px]">HMTI Margonda</p>
          <p className="text-[#131313] text-lg md:text-2xl font-medium leading-6 md:leading-8">
            Himpunan Mahasiswa Teknologi Informasi Cabang Margonda
          </p>
        </div>
        <div className="w-px bg-[#131313] hidden md:block self-stretch" />
        <div className="w-full md:w-[241px]">
          <p className="text-[#343B66] text-lg md:text-[28px] font-semibold mb-2 md:mb-4">NAVIGASI</p>
          <ul className="space-y-1 md:space-y-2 flex md:flex-col gap-3 md:gap-0 flex-wrap">
            {["Beranda", "Tentang Kami", "Struktur", "Visi & Misi", "Proker"].map((item) => (
              <li key={item} className="text-[#131313] text-base md:text-2xl font-medium leading-5 md:leading-8">{item}</li>
            ))}
          </ul>
        </div>
        <div className="w-px bg-[#131313] hidden md:block self-stretch" />
        <div className="w-full md:w-[250px]">
          <p className="text-[#343B66] text-lg md:text-[28px] font-semibold mb-2 md:mb-4">PROGRAM KERJA</p>
          <ul className="space-y-1 md:space-y-2 flex md:flex-col gap-3 md:gap-0 flex-wrap">
            {["Bakti Sosial", "Seminar Jaringan"].map((item) => (
              <li key={item} className="text-[#131313] text-base md:text-2xl font-medium leading-5 md:leading-8">{item}</li>
            ))}
          </ul>
        </div>
        <div className="w-px bg-[#131313] hidden md:block self-stretch" />
        <div className="w-full md:w-[308px]">
          <p className="text-[#343B66] text-lg md:text-[28px] font-semibold mb-2 md:mb-4">KONTAK</p>
          <ul className="space-y-1 md:space-y-2 flex md:flex-col gap-3 md:gap-0 flex-wrap">
            <li className="text-[#131313] text-base md:text-2xl font-medium leading-5 md:leading-8">email HMTI Margonda</li>
            <li className="text-[#131313] text-base md:text-2xl font-medium leading-5 md:leading-8">instagram HMTI Margonda</li>
            <li className="text-[#131313] text-base md:text-2xl font-medium leading-5 md:leading-8">Kampus Margonda, Depok</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
