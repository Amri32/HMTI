"use client";

import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminAuthLoading from "@/components/admin/AdminAuthLoading";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminAuthLoading />}>
      <AdminLoginForm />
    </Suspense>
  );
}
