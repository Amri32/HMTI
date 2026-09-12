export default function VisiMisiPage() {
  return (
    <section id="visimisi" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-[#EAE0CF] text-3xl md:text-7xl font-bold leading-[40px] md:leading-[92px]">
            Visi, Misi &amp; Tujuan
          </h1>
          <p className="text-white text-lg md:text-2xl font-medium leading-6 md:leading-8 mt-4">
            Arah dan nilai yang menjadi landasan HMTI Cabang Margonda
          </p>
        </div>
        <hr className="border-white mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-6 rounded-2xl border-2 border-[#EAE0CF] bg-white/10">
            <h2 className="text-white text-2xl font-semibold leading-8 mb-4">Visi</h2>
            <p className="text-white text-base leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <div className="p-6 rounded-2xl border-2 border-[#EAE0CF] bg-white/10">
            <h2 className="text-white text-2xl font-semibold leading-8 mb-4">Misi</h2>
            <p className="text-white text-base leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-[#EAE0CF] text-2xl font-semibold leading-8 mb-6">Tujuan HMTI</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-2 border-b border-white/20 pb-4">
                <span className="text-[#EAE0CF] text-base font-medium w-10 h-10 flex items-center justify-center">
                  {n}
                </span>
                <p className="text-white text-base leading-5">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
