import type { Metadata } from "next";
import { Newsreader, Work_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HMTI Margonda | Himpunan Mahasiswa Teknologi Informasi UBSI",
  description:
    "Portal resmi Himpunan Mahasiswa Teknologi Informasi (HMTI) Universitas Bina Sarana Informatika Kampus Margonda, Depok. Ruang kolaborasi mahasiswa TI untuk belajar, berkarya, dan berdampak nyata.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${newsreader.variable} ${workSans.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-[#fcf9f1] text-[#0e1b2a] antialiased selection:bg-[#3c608b] selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

