"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/*
 * Premium reveal recipes adapted from React Bits "Blur Fade" and shadcn scroll
 * patterns: blur + rise with expo easing (not the default ease-out fade-up),
 * viewport-triggered once, reduced-motion aware.
 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function BlurFade({
  children,
  delay = 0,
  y = 24,
  blur = 6,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};

export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/*
 * Parallax on scroll (React Bits "Scroll Float" family, restrained dose):
 * media drifts slower than the page. Pure transform — no layout thrash.
 */
export function ScrollParallax({
  children,
  className,
  distance = 40,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ y: distance }}
      whileInView={{ y: 0 }}
      viewport={{ margin: "-8% 0px" }}
      transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
