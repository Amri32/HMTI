import Image from "next/image";
import Link from "next/link";
import { navigationItems, siteProfile } from "@/app/site-content";

export default function Footer() {
  return (
    <footer className="mt-10 border-t-4 border-signal bg-ink text-white sm:mt-16">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <p className="border-b border-white/20 py-6 text-center font-serif text-base italic leading-7 text-white/85 sm:text-lg">
          Wadah aspirasi, pelayanan, dan pengembangan kemampuan mahasiswa Teknologi Informasi.
        </p>
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <Image
                src="/hmti.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain transition-[opacity,transform] duration-200 hover:opacity-85 hover:scale-[0.98]"
              />
              <div>
                <p className="font-serif text-2xl font-semibold">{siteProfile.shortName}</p>
                <p className="text-sm text-steel-light">{siteProfile.university}</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-6 text-white/80">
              Wadah aspirasi, pelayanan, dan pengembangan kemampuan mahasiswa Teknologi Informasi.
            </p>
          </div>

          <div className="lg:col-span-7 lg:pl-10">
            <nav aria-label="Navigasi kaki halaman" className="flex flex-wrap gap-x-6 gap-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="footer-nav-link inline-flex min-h-11 items-center px-1 text-sm text-white/80 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <address className="mt-6 max-w-2xl border-t border-white/20 pt-6 text-sm not-italic leading-6 text-white/80">
              {siteProfile.address}
            </address>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/20 pt-6 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>{siteProfile.fullName}</p>
          <Link
            href="/kontak"
            className="inline-flex min-h-11 items-center underline decoration-white/40 underline-offset-4 hover:decoration-white"
          >
            Alamat dan kontak HMTI
          </Link>
        </div>
      </div>
    </footer>
  );
}
