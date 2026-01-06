"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServicesLayout({ children }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // 👇 INTENTIONAL LUXURY DELAY (VISIBLE)
  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), 900);

    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="fixed inset-0 z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* BACKDROP */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        />

        {/* TRANSITION BLOCKER (THIS IS THE KEY) */}
        {!ready && (
          <motion.div
            className="absolute inset-0 bg-black z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        )}

        {/* CONTENT PANEL */}
        {ready && (
          <motion.div
  id="scroll-container"
  className="relative w-full h-full bg-black overflow-y-auto"

            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
