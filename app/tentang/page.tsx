export default function TentangPage() {
  return (
    <section id="tentang" className="bg-[#343B66] min-h-screen flex items-center px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-[#EAE0CF] font-inter text-4xl md:text-7xl font-bold leading-tight">
            Tentang HMTI
          </h1>
          <p className="text-[#FFF] font-inter text-xl md:text-2xl font-medium leading-8 mt-4">
            Mengenal lebih dekat Himpunan Mahasiswa Teknik Informatika Cabang Margonda
          </p>
        </div>
        <hr className="border-white mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-[#FFF] font-inter text-2xl font-semibold leading-8">
              Apa itu HMTI?
            </h2>
            <p className="text-[#FFF] font-inter text-base leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-[#FFF] font-inter text-2xl font-semibold leading-8">
              Tujuan HMTI
            </h2>
            <p className="text-[#FFF] font-inter text-base leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-[#FFF] font-inter text-2xl font-semibold leading-8">
              Apa itu HMTI Margonda?
            </h2>
            <p className="text-[#FFF] font-inter text-base leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
