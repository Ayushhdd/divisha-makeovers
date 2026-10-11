"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

const services = [
  { label: "Bridal Makeup", href: "/services/bridal" },
  { label: "Engagement & Reception Makeup", href: "/services/engagement-reception" },
  { label: "Nails Extensions", href: "/services/nails" },
  { label: "Party Makeup", href: "/services/party" },
];

const dashboardHref = "/portal/divisha/dashboard";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [open, setOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const prefetchServices = () => {
      services.forEach((service) => router.prefetch(service.href));
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetchServices);
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(prefetchServices, 1200);
    return () => window.clearTimeout(id);
  }, [router]);

  /* LOCK BODY SCROLL ON MOBILE MENU */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  const handleLogoClick = (event) => {
    if (!isHome) return;
    event.preventDefault();
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* NAVBAR SPACER */}
      <div className="h-[88px] md:h-[96px]" />

      <nav
        className="fixed top-0 left-0 z-50 w-full"
      >
        {/* GOLD LINE */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f0d26d]/40 to-transparent" />

        {/* MAIN BAR */}
        <div className="backdrop-blur-2xl bg-black/30 border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
            {/* LOGO */}
            <Link href="/" onClick={handleLogoClick}>
              <Image
                src="/logo/dm2.png"
                alt="Divisha Makeovers"
                width={171}
                height={60}
                sizes="171px"
                quality={90}
                className="h-12 w-auto opacity-95 hover:opacity-100 transition"
              />
            </Link>

            {/* DESKTOP LINKS */}
            <ul className="hidden md:flex items-center gap-10 lg:gap-12 text-[11px] font-semibold tracking-[0.35em] uppercase text-white/90">
              {/* HOME */}
              <li
                className="relative"
                onMouseEnter={() => setHomeOpen(true)}
                onMouseLeave={() => setHomeOpen(false)}
              >
                <a href={isHome ? "#home" : "/"}>Home</a>

                <AnimatePresence>
                  {homeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      className="absolute left-1/2 -translate-x-1/2 mt-10 w-56 rounded-3xl bg-black/60 backdrop-blur-3xl border border-white/15 overflow-hidden"
                    >
                      {["about", "why-choose", "testimonials"].map((id) => (
                        <a
                          key={id}
                          href={isHome ? `#${id}` : `/#${id}`}
                          className="block px-8 py-5 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-pink-300 hover:bg-pink-500/10 transition"
                        >
                          {id.replace("-", " ")}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              <li><a href={isHome ? "#gallery" : "/#gallery"}>Gallery</a></li>

              {/* SERVICES */}
              <li
                className="relative"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <a href={isHome ? "#services" : "/#services"}>Services</a>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      className="absolute left-1/2 -translate-x-1/2 mt-10 w-64 rounded-3xl bg-black/60 backdrop-blur-3xl border border-white/15 overflow-hidden"
                    >
                      {services.map((s) => (
                        <Link
                          key={s.label}
                          href={s.href}
                          scroll
                          className="block px-8 py-5 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-pink-300 hover:bg-pink-500/10 transition"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              <li><a href={isHome ? "#contact" : "/#contact"}>Contact</a></li>
            </ul>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={dashboardHref}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#f0d26d]/60 bg-[#f0d26d]/15 px-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f8e7a5] shadow-[0_0_24px_rgba(240,210,109,0.18)] transition hover:-translate-y-0.5 hover:border-[#f0d26d] hover:bg-[#f0d26d]/25 hover:text-white"
              >
                <LayoutDashboard aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                <span>Dashboard</span>
              </a>
              <a
                href={isHome ? "#contact" : "/#contact"}
                className="inline-flex h-10 items-center px-6 rounded-full border border-white/40 text-[10px] tracking-[0.4em] uppercase text-white/90 hover:text-pink-300 hover:border-pink-300 transition"
              >
                Book Now
              </a>
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="mobile-menu-trigger w-10 h-10 shrink-0 rounded-full border border-white/30 items-center justify-center"
            >
              <span className="space-y-1.5">
                <span className="block w-5 h-px bg-white" />
                <span className="block w-5 h-px bg-white" />
                <span className="block w-5 h-px bg-white" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 z-[90]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm z-[100] px-6 py-6"
            >
              <div className="h-full rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 px-6 py-8 overflow-y-auto">
                <div className="flex justify-between mb-10 [&>button]:hidden">
                  <span className="text-xs tracking-[0.35em] uppercase text-white/40">Menu</span>
                  <span>
                    <button
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                      className="w-10 h-10 rounded-full border border-white/20 text-sm text-white/80"
                    >
                      X
                    </button>
                  </span>
                  <button onClick={() => setMobileOpen(false)}>✕</button>
                </div>

                <nav className="flex flex-col gap-8 uppercase tracking-[0.3em] text-sm">
                  <Link onClick={() => setMobileOpen(false)} href="/">Home</Link>
                  <Link onClick={() => setMobileOpen(false)} href="/#about">About</Link>
                  <Link onClick={() => setMobileOpen(false)} href="/#gallery">Gallery</Link>
                  <a
                    onClick={() => setMobileOpen(false)}
                    href={dashboardHref}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-[#f0d26d]/60 bg-[#f0d26d]/15 px-5 py-3 text-[#f8e7a5] shadow-[0_0_24px_rgba(240,210,109,0.16)]"
                  >
                    <LayoutDashboard aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                    Dashboard
                  </a>

                  <div className="pt-6 border-t border-white/10">
                    {services.map((s) => (
                      <Link
                        key={s.label}
                        href={s.href}
                        scroll
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-white/80 hover:text-pink-300"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/#contact"
                    onClick={() => setMobileOpen(false)}
                    className="mt-10 inline-flex justify-center px-6 py-3 rounded-full border border-white/40 tracking-[0.35em]"
                  >
                    Book Now
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
