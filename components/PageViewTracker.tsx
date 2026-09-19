"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/appwrite/tracking";

export default function PageViewTracker({ page }: { page: string }) {
  useEffect(() => {
    trackPageView(page);
  }, [page]);

  return null;
}
