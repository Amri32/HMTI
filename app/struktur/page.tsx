import StrukturCard from "@/components/StrukturCard";

export default function StrukturPage() {
  return (
    <section id="struktur" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-[#EAE0CF] text-3xl md:text-7xl font-bold leading-[40px] md:leading-[92px]">
            Struktur Cabang Margonda
          </h1>
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
  );
}
