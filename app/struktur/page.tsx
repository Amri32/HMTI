import type { Metadata } from "next";
import StrukturContent from "@/components/StrukturContent";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Struktur Kepengurusan | HMTI UBSI Margonda",
  description:
    "Struktur kepengurusan HMTI UBSI Margonda: Badan Pengurus Harian serta divisi PSDM, KOMINFO, dan LITBANG.",
};

export default function OrganizationPage() {
  return (
    <div>
      <PageViewTracker page="/struktur" />
      <StrukturContent />
    </div>
  );
}
