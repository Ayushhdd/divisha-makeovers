"use client";

import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // wait one frame so browser finishes paint
    requestAnimationFrame(() => setReady(true));
  }, []);

  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
      <motion.main
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.2, ease: "easeOut" }}
>

  {children}
</motion.main>

      </body>
    </html>
  );
}
