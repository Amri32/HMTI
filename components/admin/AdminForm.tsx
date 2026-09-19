"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Select } from "@base-ui/react/select";
import { Switch } from "@base-ui/react/switch";
import { motion, useReducedMotion } from "motion/react";

// Posisi popup relatif trigger: "bottom" slide turun, "top" slide naik.
type PopupSide = "top" | "bottom";

// Spring KokonutUI untuk entrance: responsif tapi tidak boneless.
const SPRING_POPUP = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.9 };
const SPRING_ITEM = { type: "spring" as const, stiffness: 480, damping: 32 };
const SPRING_CHEVRON = { type: "spring" as const, stiffness: 400, damping: 28 };
// Durasi exit tween; popup tetap ter-mount selama animasi keluar berjalan.
const EXIT_MS = 160;

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="adm-label">{label}</span>
      {children}
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </label>
  );
}

export const inputCls = "adm-input";

export const textareaCls = "adm-textarea";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
      className="adm-switch"
    >
      <span className="adm-switch-track" aria-hidden="true">
        <Switch.Thumb className="adm-switch-thumb" />
      </span>
      <span className="adm-switch-text">{label}</span>
    </Switch.Root>
  );
}

// Dropdown di atas primitive Base UI Select (navigasi keyboard bawaan).
//
// Animasi gaya KokonutUI/ReactBits:
// - Entrance: Motion spring (scale + slide + blur) + item staggered + centang pop.
// - Exit    : Motion tween fade + slide + zoom (panel saja; item ikut ter-fade).
//
// Lifecycle popup dikendalikan penuh di level React karena unmount internal
// Base UI (useOpenChangeComplete -> getAnimations pada elemen popup) tidak
// mendeteksi animasi Motion yang berjalan di elemen anak, sehingga popup
// bisa tertahan di DOM:
// 1. `open` dikendalikan (controlled). Saat diminta tutup, commit `open=false`
//    ditunda selama durasi exit agar popup tidak dibongkar sebelum animasi.
// 2. `<Select.Portal>` hanya dirender saat `open` true — commit `open=false`
//    membuat React membongkar seluruh portal secara deterministik.
// 3. Portal ter-mount ulang tiap siklus buka, jadi `initial` Motion (stagger,
//    centang pop) otomatis direset — item tidak perlu animasi "balik".
// Membuka lagi di tengah exit membatalkan timer dan panel spring balik
// (interruptible), persis perilaku dropdown KokonutUI.
export function SelectCustom<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  const reduce = useReducedMotion();
  // `open` = popup ada di DOM (true selama exit animasi berjalan).
  const [open, setOpen] = useState(false);
  // `terbuka` = menu terlihat penuh (false saat sedang exit).
  const [terbuka, setTerbuka] = useState(false);
  const [side, setSide] = useState<PopupSide>("bottom");
  const exitTimer = useRef<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Arah animasi mengikuti sisi popup (Base UI flip otomatis saat ruang sempit).
  // Dibaca via ref popup sendiri — bukan querySelector global — agar tidak salah
  // menangkap popup milik dropdown lain yang sedang exit.
  useEffect(() => {
    if (!open) return undefined;
    const popup = popupRef.current;
    if (!popup) return undefined;
    const update = () => {
      const s = popup.getAttribute("data-side");
      if (s === "top" || s === "bottom") setSide(s);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(popup, { attributes: true, attributeFilter: ["data-side"] });
    return () => observer.disconnect();
  }, [open]);

  const clearExitTimer = () => {
    if (exitTimer.current != null) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  };

  useEffect(() => clearExitTimer, []);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      clearExitTimer();
      setTerbuka(true);
      setOpen(true);
      return;
    }
    // Sudah dalam proses exit — abaikan permintaan tutup ganda.
    if (exitTimer.current != null) return;
    if (reduce) {
      setTerbuka(false);
      setOpen(false);
      return;
    }
    setTerbuka(false); // mulai tween keluar, popup masih ter-mount
    exitTimer.current = window.setTimeout(() => {
      exitTimer.current = null;
      setOpen(false); // React membongkar portal di sini
    }, EXIT_MS + 30);
  };

  const panelVisible = {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  };
  const panelHidden = reduce
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: side === "top" ? 8 : -8,
        scale: 0.96,
        filter: "blur(4px)",
      };

  return (
    <Select.Root
      items={[...options]}
      value={value}
      open={open}
      onOpenChange={handleOpenChange}
      onValueChange={(v) => {
        if (v != null) onChange(v as T);
      }}
    >
      <Select.Trigger className="adm-select-trigger" aria-label={label}>
        <Select.Value className="truncate" placeholder={label} />
        <Select.Icon className="adm-select-chevron">
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden="true"
            initial={false}
            animate={reduce ? undefined : { rotate: terbuka ? 180 : 0 }}
            transition={SPRING_CHEVRON}
          >
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>
        </Select.Icon>
      </Select.Trigger>
      {open ? (
        <Select.Portal>
          <Select.Positioner
            className="adm-select-positioner"
            sideOffset={6}
            alignItemWithTrigger={false}
          >
            <Select.Popup ref={popupRef} className="adm-select-menu">
              <motion.div
                className="adm-select-motion"
                data-closing={!terbuka || undefined}
                initial={panelHidden}
                animate={terbuka ? panelVisible : panelHidden}
                transition={
                  reduce
                    ? { duration: 0.12 }
                    : terbuka
                      ? SPRING_POPUP
                      : { duration: EXIT_MS / 1000, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <Select.List>
                  {options.map((o, i) => (
                    <Select.Item key={o.value} value={o.value} className="adm-select-item">
                      <motion.span
                        className="adm-select-item-inner"
                        initial={reduce ? undefined : { opacity: 0, x: -10 }}
                        animate={
                          reduce
                            ? undefined
                            : {
                                opacity: 1,
                                x: 0,
                                transition: {
                                  ...SPRING_ITEM,
                                  delay: Math.min(i, 8) * 0.04,
                                },
                              }
                        }
                      >
                        <Select.ItemText>{o.label}</Select.ItemText>
                        <Select.ItemIndicator className="adm-select-check">
                          <motion.svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            aria-hidden="true"
                            initial={reduce ? undefined : { scale: 0, rotate: -45 }}
                            animate={reduce ? undefined : { scale: 1, rotate: 0 }}
                            transition={{
                              ...SPRING_ITEM,
                              delay: Math.min(i, 8) * 0.04 + 0.08,
                            }}
                          >
                            <path
                              d="M2.5 6.5l2.5 2.5 4.5-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </motion.svg>
                        </Select.ItemIndicator>
                      </motion.span>
                    </Select.Item>
                  ))}
                </Select.List>
              </motion.div>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      ) : null}
    </Select.Root>
  );
}

export function KotakError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="adm-alert adm-alert--error">
      <span>{children}</span>
    </p>
  );
}

export function KotakSukses({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="adm-alert adm-alert--ok">
      <span>{children}</span>
    </p>
  );
}
