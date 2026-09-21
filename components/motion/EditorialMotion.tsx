"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Media-only reveal keeps editorial copy immediately readable; add variants only if another real media stage needs them.
export function MediaReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0 0 12% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.72, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}

// Adapted from Motion Primitives Animated Tabs (MIT): https://21st.dev/@ibelick/components/animated-tabs
export function SelectionIndicator({ layoutId }: { layoutId: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span aria-hidden="true" className="news-filter-indicator" />;
  }

  return (
    <motion.span
      aria-hidden="true"
      className="news-filter-indicator"
      layoutId={layoutId}
      transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
    />
  );
}

// Adapted from Motion Primitives In View (MIT): https://21st.dev/@ibelick/components/in-view
export function SignalPath({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 320"
      preserveAspectRatio="none"
      focusable="false"
    >
      <path className="vm-signal-track" d="M20 0V142C20 162 30 162 30 182V320" />
      <motion.path
        className="vm-signal-progress"
        d="M20 0V142C20 162 30 162 30 182V320"
        initial={reduceMotion ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.72, ease: EASE_OUT_EXPO }}
      />
    </svg>
  );
}
