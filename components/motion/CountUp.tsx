"use client";

import {
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";

/*
 * Port of React Bits CountUp (public/r/CountUp-TS-TW.json).
 * Spring-driven number counter, fires once in view.
 * Source: https://github.com/DavidHDev/react-bits (MIT + Commons Clause)
 */

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const startValue = direction === "down" ? to : from;
  const endValue = direction === "down" ? from : to;
  const motionValue = useMotionValue(startValue);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  const formatValue = useCallback(
    (latest: number) => {
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      };
      const formatted = Intl.NumberFormat("id-ID", options).format(latest);
      return separator ? formatted.replace(/\./g, separator) : formatted;
    },
    [separator],
  );

  useEffect(() => {
    if (!ref.current) return;

    if (reducedMotion) {
      motionValue.jump(endValue);
      springValue.jump(endValue);
      ref.current.textContent = formatValue(endValue);
      return;
    }

    if (!isInView || !startWhen) return;

    motionValue.jump(startValue);
    springValue.jump(startValue);
    ref.current.textContent = formatValue(startValue);
    onStart?.();

    const timeoutId = window.setTimeout(() => {
      motionValue.set(endValue);
    }, delay * 1000);
    const endTimeoutId = window.setTimeout(
      () => onEnd?.(),
      delay * 1000 + duration * 1000,
    );

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(endTimeoutId);
    };
  }, [
    delay,
    duration,
    endValue,
    formatValue,
    isInView,
    motionValue,
    onEnd,
    onStart,
    reducedMotion,
    springValue,
    startValue,
    startWhen,
  ]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest: number) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest);
      }
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return (
    <span className={className} aria-label={formatValue(to)}>
      <span ref={ref} aria-hidden="true">
        {formatValue(to)}
      </span>
    </span>
  );
}
