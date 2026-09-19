"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const MAX_MAGNET = 6; // px
const MAX_TILT = 2; // deg

function usePointerFine() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    // Sync initial value via microtask to avoid synchronous setState-in-effect.
    queueMicrotask(() => setFine(mq.matches));
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return fine;
}

export function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const fine = usePointerFine();
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  const enabled = !reduce && fine;

  function onMove(e: React.PointerEvent) {
    if (!enabled || !ref.current) return;
    if (raf.current != null) return;
    const cx = e.clientX;
    const cy = e.clientY;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dx = cx - (rect.left + rect.width / 2);
      const dy = cy - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const scale = Math.min(MAX_MAGNET, dist * 0.15) / dist;
      x.set(dx * scale);
      y.set(dy * scale);
    });
  }

  function onLeave() {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
    x.set(0);
    y.set(0);
  }

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y, display: "inline-flex" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

export function HeroPhoto({
  src,
  alt,
  sizes,
  priority,
  caption,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  caption?: string;
}) {
  const reduce = useReducedMotion();
  const fine = usePointerFine();
  const [loaded, setLoaded] = useState(false);
  const figRef = useRef<HTMLElement>(null);
  const raf = useRef<number | null>(null);

  const enabled = !reduce && fine;

  function onMove(e: React.PointerEvent) {
    if (!enabled || !figRef.current) return;
    if (raf.current != null) return;
    const cx = e.clientX;
    const cy = e.clientY;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      if (!figRef.current) return;
      const rect = figRef.current.getBoundingClientRect();
      const nx = (cx - rect.left) / rect.width - 0.5;
      const ny = (cy - rect.top) / rect.height - 0.5;
      figRef.current.style.transform = `rotateX(${(-ny * MAX_TILT).toFixed(2)}deg) rotateY(${(nx * MAX_TILT).toFixed(2)}deg)`;
    });
  }

  function onLeave() {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
    if (figRef.current) figRef.current.style.transform = "";
  }

  return (
    <figure
      ref={figRef}
      className="home-hero-photo"
      data-loaded={loaded ? "true" : "false"}
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={enabled ? onLeave : undefined}
      style={{ transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
