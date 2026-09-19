"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminEditBar from "@/components/admin/AdminEditBar";
import PageViewTracker from "@/components/PageViewTracker";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdminRoute ? <Navbar /> : null}
      <PageViewTracker />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!isAdminRoute ? <Footer /> : null}
      {!isAdminRoute ? <AdminEditBar /> : null}
    </>
  );
}