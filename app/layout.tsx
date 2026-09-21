import type { Metadata } from "next";
import { Newsreader, Instrument_Sans } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // display: optional mencegah re-wrap saat webfont datang (CLS font-swap):
  // bila font tidak siap <100ms, fallback serif/sans-tax dipakai di kunjungan itu.
  display: "optional",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "HMTI UBSI Margonda | Himpunan Mahasiswa Teknologi Informasi",
  description:
    "Website Himpunan Mahasiswa Teknologi Informasi Universitas Bina Sarana Informatika Kampus Margonda.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${newsreader.variable} ${instrumentSans.variable} scroll-smooth`}
    >
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Lewati ke konten utama
        </a>
        <SiteChrome>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}

