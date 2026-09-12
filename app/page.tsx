import StrukturCard from "@/components/StrukturCard";
import Line from "@/components/Line";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ====== HERO / BERANDA ====== */}
      <section id="beranda" className="bg-[#343B66] min-h-screen flex items-center justify-center px-5 md:px-10 py-16">
        <div className="text-center max-w-[747px]">
          <div className="inline-block mb-8">
            <span className="inline-block border-2 border-white rounded-2xl px-3 py-2 text-white text-xl font-semibold">
              Periode 2026/2027
            </span>
          </div>
          <h1 className="text-[#EAE0CF] text-4xl md:text-7xl font-bold leading-[46px] md:leading-[92px] mb-6">HMTI MARGONDA</h1>
          <p className="text-white text-2xl md:text-4xl font-semibold leading-[30px] md:leading-[46px] mb-4">
            Himpunan Mahasiswa Teknologi Informasi
          </p>
          <p className="text-[#EAE0CF] text-lg md:text-2xl font-medium leading-6 md:leading-8 mb-10">
            Universitas Bina Sarana Informatika — Kampus Margonda, Depok
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
            <Link href="/struktur" className="inline-flex items-center gap-2.5 py-3 px-6 rounded-2xl bg-[#EAE0CF] justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <g clipPath="url(#hero-clip-a)">
                  <path d="M0 24V21.9C0 20.9444 0.488889 20.1667 1.46667 19.5667C2.44444 18.9667 3.73333 18.6667 5.33333 18.6667C5.62222 18.6667 5.9 18.6724 6.16667 18.684C6.43333 18.6956 6.68889 18.7231 6.93333 18.7667C6.62222 19.2333 6.38889 19.7222 6.23333 20.2333C6.07778 20.7444 6 21.2778 6 21.8333V24H0ZM8 24V21.8333C8 21.1222 8.19467 20.472 8.584 19.8827C8.97333 19.2933 9.52311 18.7769 10.2333 18.3333C10.9436 17.8898 11.7938 17.5564 12.784 17.3333C13.7742 17.1102 14.8462 16.9991 16 17C17.1778 17 18.2613 17.1111 19.2507 17.3333C20.24 17.5556 21.0898 17.8889 21.8 18.3333C22.5102 18.7778 23.0547 19.2947 23.4333 19.884C23.812 20.4733 24.0009 21.1231 24 21.8333V24H8ZM26 24V21.8333C26 21.2556 25.928 20.7111 25.784 20.2C25.64 19.6889 25.4231 19.2111 25.1333 18.7667C25.3778 18.7222 25.628 18.6947 25.884 18.684C26.14 18.6733 26.4009 18.6676 26.6667 18.6667C28.2667 18.6667 29.5556 18.9613 30.5333 19.5507C31.5111 20.14 32 20.9231 32 21.9V24H26ZM5.33333 17.3333C4.6 17.3333 3.97244 17.0724 3.45067 16.5507C2.92889 16.0289 2.66756 15.4009 2.66667 14.6667C2.66667 13.9111 2.928 13.2778 3.45067 12.7667C3.97333 12.2556 4.60089 12 5.33333 12C6.08889 12 6.72222 12.2556 7.23333 12.7667C7.74444 13.2778 8 13.9111 8 14.6667C8 15.4 7.74444 16.028 7.23333 16.5507C6.72222 17.0733 6.08889 17.3342 5.33333 17.3333ZM26.6667 17.3333C25.9333 17.3333 25.3058 17.0724 24.784 16.5507C24.2622 16.0289 24.0009 15.4009 24 14.6667C24 13.9111 24.2613 13.2778 24.784 12.7667C25.3067 12.2556 25.9342 12 26.6667 12C27.4222 12 28.0556 12.2556 28.5667 12.7667C29.0778 13.2778 29.3333 13.9111 29.3333 14.6667C29.3333 15.4 29.0778 16.028 28.5667 16.5507C28.0556 17.0733 27.4222 17.3342 26.6667 17.3333ZM16 16C14.8889 16 13.9444 15.6111 13.1667 14.8333C12.3889 14.0556 12 13.1111 12 12C12 10.8667 12.3889 9.91689 13.1667 9.15067C13.9444 8.38444 14.8889 8.00089 16 8C17.1333 8 18.0836 8.38356 18.8507 9.15067C19.6178 9.91778 20.0009 10.8676 20 12C20 13.1111 19.6169 14.0556 18.8507 14.8333C18.0844 15.6111 17.1342 16 16 16Z" fill="#343B66"/>
                </g>
                <defs><clipPath id="hero-clip-a"><rect width="32" height="32" fill="white"/></clipPath></defs>
              </svg>
              <span className="text-[#343B66] text-2xl font-semibold">Struktur</span>
            </Link>
            <Link href="/tentang" className="inline-flex items-center gap-2.5 py-3 px-6 rounded-2xl bg-[#EAE0CF] justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M10.6667 4C11.0203 4 11.3594 4.14048 11.6095 4.39052C11.8595 4.64057 12 4.97971 12 5.33333C12 5.68696 11.8595 6.02609 11.6095 6.27614C11.3594 6.52619 11.0203 6.66667 10.6667 6.66667H2.66667V21.3333H17.3333V13.3333C17.3333 12.9797 17.4738 12.6406 17.7239 12.3905C17.9739 12.1405 18.313 12 18.6667 12C19.0203 12 19.3594 12.1405 19.6095 12.3905C19.8595 12.6406 20 12.9797 20 13.3333V21.3333C20 22.0406 19.719 22.7189 19.219 23.219C18.7189 23.719 18.0406 24 17.3333 24H2.66667C1.95942 24 1.28115 23.719 0.781048 23.219C0.280951 22.7189 0 22.0406 0 21.3333V6.66667C0 5.95942 0.280951 5.28115 0.781048 4.78105C1.28115 4.28095 1.95942 4 2.66667 4H10.6667ZM22.6667 0C23.0203 0 23.3594 0.140476 23.6095 0.390524C23.8595 0.640573 24 0.979711 24 1.33333V8C24 8.35362 23.8595 8.69276 23.6095 8.94281C23.3594 9.19286 23.0203 9.33333 22.6667 9.33333C22.313 9.33333 21.9739 9.19286 21.7239 8.94281C21.4738 8.69276 21.3333 8.35362 21.3333 8V4.552L10.276 15.6093C10.0245 15.8522 9.68773 15.9866 9.33813 15.9836C8.98854 15.9805 8.65412 15.8403 8.40691 15.5931C8.1597 15.3459 8.01947 15.0115 8.01644 14.6619C8.0134 14.3123 8.14779 13.9755 8.39067 13.724L19.448 2.66667H16C15.6464 2.66667 15.3072 2.52619 15.0572 2.27614C14.8071 2.02609 14.6667 1.68696 14.6667 1.33333C14.6667 0.979711 14.8071 0.640573 15.0572 0.390524C15.3072 0.140476 15.6464 0 16 0H22.6667Z" fill="#343B66"/>
              </svg>
              <span className="text-[#343B66] text-2xl font-semibold">Tentang Kami</span>
            </Link>
          </div>
        </div>
      </section>
      <Line />
      {/* ====== TENTANG KAMI ====== */}
      <section id="tentang" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="mb-16">
            <h2 className="text-[#EAE0CF] text-3xl md:text-7xl font-bold leading-[40px] md:leading-[92px]">Tentang HMTI</h2>
            <p className="text-white text-lg md:text-2xl font-medium leading-6 md:leading-8 mt-4">
              Mengenal lebih dekat Himpunan Mahasiswa Teknik Informatika Cabang Margonda
            </p>
          </div>
          <hr className="border-white mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Apa itu HMTI?", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
              { title: "Tujuan HMTI", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
              { title: "Apa itu HMTI Margonda?", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-4">
                <h3 className="text-white text-2xl font-semibold leading-8">{item.title}</h3>
                <p className="text-white text-base leading-5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Line />
      {/* ====== STRUKTUR ====== */}
      <section id="struktur" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="mb-16">
            <h2 className="text-[#EAE0CF] text-3xl md:text-7xl font-bold leading-[40px] md:leading-[92px]">Struktur Cabang Margonda</h2>
            <p className="text-white text-lg md:text-2xl font-medium leading-6 md:leading-8 mt-4">
              Susunan pengurus aktif HMTI Cabang Margonda periode 2025/2026
            </p>
          </div>
          <hr className="border-white mb-16" />
          <div className="flex flex-col items-center gap-6 md:gap-10 w-full">
            <div className="flex flex-col md:flex-row items-center gap-6 w-fit">
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-fit">
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-fit">
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-fit">
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-fit">
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-fit">
              <StrukturCard name="Nama" position="Jabatan" />
              <StrukturCard name="Nama" position="Jabatan" />
            </div>
          </div>
        </div>
      </section>
      <Line />
      {/* ====== VISI & MISI ====== */}
      <section id="visimisi" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="mb-16">
            <h2 className="text-[#EAE0CF] text-3xl md:text-7xl font-bold leading-[40px] md:leading-[92px]">Visi, Misi &amp; Tujuan</h2>
            <p className="text-white text-lg md:text-2xl font-medium leading-6 md:leading-8 mt-4">
              Arah dan nilai yang menjadi landasan HMTI Cabang Margonda
            </p>
          </div>
          <hr className="border-white mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="p-4 rounded-2xl border-2 border-[#EAE0CF] bg-white/10">
              <h3 className="text-white text-2xl font-semibold leading-8 mb-4">Visi</h3>
              <p className="text-white text-base leading-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-[#EAE0CF] bg-white/10">
              <h3 className="text-white text-2xl font-semibold leading-8 mb-4">Misi</h3>
              <p className="text-white text-base leading-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-[#EAE0CF] text-2xl font-semibold leading-8 mb-6">Tujuan HMTI</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center gap-2 border-b border-white/20 pb-4">
                  <span className="text-[#EAE0CF] text-base font-medium w-10 h-10 flex items-center justify-center">{n}</span>
                  <p className="text-white text-base leading-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
