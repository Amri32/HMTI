"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// Kepala halaman modul admin dengan entrance singkat, hormati prefers-reduced-motion.
export default function AdmPageHead({
  kicker,
  title,
  lede,
  meta,
}: {
  kicker: string;
  title: ReactNode;
  lede: string;
  meta?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const props = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
      };
  return (
    <motion.div className="adm-page-head" {...props}>
      <div>
        <p className="adm-kicker">{kicker}</p>
        <h1 className="adm-title">{title}</h1>
        <p className="adm-lede">{lede}</p>
      </div>
      {meta ? <p className="adm-page-meta">{meta}</p> : null}
    </motion.div>
  );
}
