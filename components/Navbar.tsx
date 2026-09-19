"use client";

import { Drawer } from "@base-ui/react/drawer";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { navigationItems, siteProfile } from "@/app/site-content";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname.startsWith(href);
  }

  // Hide on scroll down, show on scroll up. Only after 200px to avoid hero flicker.
  useEffect(() => {
    if (reduceMotion) return;
    const header = headerRef.current;
    if (!header) return;

    function onScroll() {
      if (rafId.current != null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const y = window.scrollY;
        const delta = y - lastScrollY.current;
        lastScrollY.current = y;

        if (!header) return;
        header.dataset.scrolled = y > 8 ? "true" : "false";

        if (y <= 200) {
          header.dataset.hidden = "false";
        } else if (delta > 4) {
          header.dataset.hidden = "true";
        } else if (delta < -4) {
          header.dataset.hidden = "false";
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [reduceMotion]);

  // Sliding underline indicator for active nav link
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    function updateIndicator() {
      const active = nav!.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
      if (!active) {
        nav!.style.setProperty("--nav-indicator-left", "0px");
        nav!.style.setProperty("--nav-indicator-width", "0px");
        return;
      }
      const navRect = nav!.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      nav!.style.setProperty("--nav-indicator-left", `${rect.left - navRect.left}px`);
      nav!.style.setProperty("--nav-indicator-width", `${rect.width}px`);
    }

    updateIndicator();
    const ro = new ResizeObserver(updateIndicator);
    ro.observe(nav);
    window.addEventListener("resize", updateIndicator);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [pathname]);

  return (
    <header ref={headerRef} className="site-header" data-scrolled="false" data-hidden="false">
      <div key={pathname} className="mx-auto flex h-[72px] w-full max-w-[1440px] animate-[nav-route-enter_300ms_ease-out_both] items-center justify-between gap-4 px-5 sm:px-8 lg:px-6 xl:px-12">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center gap-3"
          aria-label={`${siteProfile.shortName}, kembali ke beranda`}
        >
          <Image
            src="/hmti.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 object-contain"
            priority
          />
          <span className="min-w-0">
            <span className="block truncate font-serif text-xl font-semibold leading-none text-ink">
              {siteProfile.shortName}
            </span>
            <span className="mt-1 hidden text-xs text-ink-muted xl:block">
              {siteProfile.university}
            </span>
          </span>
        </Link>

        <nav ref={navRef} className="site-nav hidden items-center lg:flex" aria-label="Navigasi utama">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="site-nav-link"
              >
                {item.label}
              </Link>
            );
          })}
          <span aria-hidden="true" className="site-nav-indicator" />
        </nav>

        <Drawer.Root
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          swipeDirection="right"
        >
          <Drawer.Trigger className="inline-flex min-h-11 items-center gap-2 border border-ink px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface lg:hidden">
            <span>Menu</span>
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </Drawer.Trigger>

          <Drawer.Portal>
            <Drawer.Backdrop className="fixed inset-0 z-[70] bg-ink/55 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 lg:hidden" />
            <Drawer.Viewport className="pointer-events-none fixed inset-0 z-[80] flex justify-end lg:hidden">
              <Drawer.Popup className="pointer-events-auto h-full w-[min(90vw,26rem)] bg-canvas shadow-[-16px_0_48px_rgba(14,27,42,0.24)] transition-transform duration-200 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
                <Drawer.Content className="flex h-full flex-col overflow-y-auto px-5 pb-8 pt-5 sm:px-8">
                  <div className="flex items-center justify-between border-b border-hairline pb-5">
                    <div>
                      <Drawer.Title className="font-serif text-2xl font-semibold text-ink">
                        Navigasi HMTI
                      </Drawer.Title>
                      <Drawer.Description className="mt-1 text-sm text-ink-muted">
                        Pilih halaman yang ingin dibuka.
                      </Drawer.Description>
                    </div>
                    <Drawer.Close className="inline-flex min-h-11 min-w-11 items-center justify-center border border-ink text-sm font-semibold text-ink transition-colors hover:bg-surface">
                      <span className="sr-only">Tutup menu</span>
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </Drawer.Close>
                  </div>

                  <motion.nav
                    className="mt-5 grid gap-1"
                    aria-label="Navigasi seluler"
                    initial={reduceMotion ? false : "hidden"}
                    animate={mobileMenuOpen ? "visible" : "hidden"}
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { delayChildren: 0.06, staggerChildren: 0.04 },
                      },
                    }}
                  >
                    {navigationItems.map((item, index) => {
                      const active = isActive(item.href);
                      return (
                        <motion.div
                          key={item.href}
                          variants={{
                            hidden: { opacity: 0, y: 12 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
                          }}
                        >
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => {
                              setMobileMenuOpen(false);
                            }}
                            className={`grid min-h-14 grid-cols-[2rem_1fr] items-center border-b px-2 text-base font-semibold transition-colors ${
                              active
                                ? "border-ink bg-ink text-white"
                                : "border-hairline text-ink hover:bg-surface"
                            }`}
                          >
                            <span className={active ? "text-signal" : "text-steel"} aria-hidden="true">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.nav>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </header>
  );
}
