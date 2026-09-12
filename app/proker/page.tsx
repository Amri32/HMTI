export default function ProkerPage() {
  return (
    <section id="proker" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-[#EAE0CF] text-3xl md:text-7xl font-bold leading-[40px] md:leading-[92px]">
            Program Kerja
          </h1>
          <p className="text-white text-lg md:text-2xl font-medium leading-6 md:leading-8 mt-4">
            Daftar program kerja HMTI Cabang Margonda periode aktif
          </p>
        </div>
        <hr className="border-white mb-16" />
        <div className="flex flex-col items-start gap-10 w-full">
          <div className="flex flex-col md:flex-row py-4 px-6 justify-between items-start md:items-center rounded-2xl border-2 border-[#EAE0CF] bg-[rgba(255,255,255,0.10)] w-full gap-4">
            <div className="flex flex-col items-start gap-2">
              <h2 className="text-[#FFF] font-inter text-2xl font-semibold leading-8">
                Nama Proker
              </h2>
              <p className="text-[#FFF] font-inter text-xl leading-8">
                Deskripsi singkat proker
              </p>
            </div>
            <div className="flex p-2.5 justify-center items-center rounded-2xl border-2 border-[#34C759] bg-[rgba(52,199,89,0.10)] min-w-[148px]">
              <span className="text-[#34C759] font-inter text-xl font-semibold">
                AKTIF
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row py-4 px-6 justify-between items-start md:items-center rounded-2xl border-2 border-[#EAE0CF] bg-[rgba(255,255,255,0.10)] w-full gap-4">
            <div className="flex flex-col items-start gap-2">
              <h2 className="text-[#FFF] font-inter text-2xl font-semibold leading-8">
                Nama Proker
              </h2>
              <p className="text-[#FFF] font-inter text-xl leading-8">
                Deskripsi singkat proker
              </p>
            </div>
            <div className="flex p-2.5 justify-center items-center rounded-2xl border-2 border-[#B3B3B3] bg-[rgba(179,179,179,0.10)] min-w-[148px]">
              <span className="text-[#B3B3B3] font-inter text-xl font-semibold">
                SELESAI
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
