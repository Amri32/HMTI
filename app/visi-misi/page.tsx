import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import VisiMisiContent from "@/components/VisiMisiContent";

export const metadata: Metadata = {
  title: "Visi dan Misi | HMTI UBSI Margonda",
  description:
    "Visi dan misi HMTI UBSI Margonda: solidaritas anggota, program kerja berdampak, dokumentasi tertib, dan evaluasi pasca program.",
};

export default function VisionMissionPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Visi dan Misi"
        title="Arah kerja yang bisa diperiksa bersama."
        intro="Visi menentukan tujuan bersama. Empat misi di bawahnya menerjemahkan tujuan itu menjadi cara kerja organisasi."
      />

      <VisiMisiContent />
    </div>
  );
}
