"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function ContactSignal() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      className="contact-signal"
      viewBox="0 0 520 390"
      preserveAspectRatio="none"
      focusable="false"
    >
      <path className="contact-signal-track" d="M24 54H294V178H474V336" />
      <motion.path
        className="contact-signal-path"
        d="M24 54H294V178H474V336"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.18, ease: EASE_OUT_EXPO }}
      />
      <motion.circle
        className="contact-signal-node"
        cx="474"
        cy="336"
        r="6"
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.18, delay: 0.86, ease: EASE_OUT_EXPO }}
        style={{ transformOrigin: "474px 336px" }}
      />
    </svg>
  );
}
