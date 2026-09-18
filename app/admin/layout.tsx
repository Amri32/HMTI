import type { Metadata } from "next";
import type { ReactNode } from "react";
import RequireAdmin from "@/components/admin/RequireAdmin";

export const metadata: Metadata = {
  title: "Panel Admin | HMTI UBSI Margonda",
  description: "Panel pengelolaan konten situs HMTI UBSI Kampus Margonda.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
