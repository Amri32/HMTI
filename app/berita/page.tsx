export default function BeritaPage() {
  return (
    <section id="berita" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-[#FFF] font-inter text-4xl md:text-7xl font-bold leading-tight md:leading-[92px]">
            Berita
          </h1>
          <p className="text-[#FFF] font-inter text-xl md:text-2xl font-medium leading-8 mt-4">
            Berita seputar dunia teknologi informasi
          </p>
        </div>
        <hr className="border-white mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border-2 border-[#EAE0CF] bg-[rgba(255,255,255,0.10)] h-[488px] overflow-hidden relative flex flex-col justify-between"
            >
              <div className="bg-[#D9D9D9] w-full h-[244px] flex items-center justify-center">
                <p className="text-[#000] font-inter text-2xl font-medium leading-8">
                  Image berita
                </p>
              </div>
              <div className="p-7">
                <p className="text-[#FFF] font-inter text-2xl md:text-[28px] font-semibold leading-[38px]">
                  Judul Berita Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
