import Image from "next/image";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { navigationItems, siteProfile } from "@/app/site-content";

export default function Footer() {
  // Tanpa margin-top: border kuning 4px sudah jadi pemisah, dan margin
  // transparan hanya menghasilkan pita krem saat section di atasnya navy
  // (mis. /kontak).
  return (
    <footer className="border-t-4 border-signal bg-ink text-white">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <p className="border-b border-white/20 py-5 text-center font-serif text-base italic leading-7 text-white/85 sm:text-lg">
          Wadah aspirasi, pelayanan, dan pengembangan kemampuan mahasiswa Teknologi Informasi.
        </p>
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-12">
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
            <SocialLinks className="mt-5" />
          </div>

          <div className="lg:col-span-7 lg:pl-10">
            <nav
              aria-label="Navigasi kaki halaman"
              className="-mx-1 grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4"
            >
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
            <address className="mt-5 max-w-2xl border-t border-white/20 pt-5 text-sm not-italic leading-6 text-white/80">
              {siteProfile.address}
            </address>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/20 pt-5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
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
