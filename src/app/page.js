"use client";

import { motion } from "framer-motion";
import Image from "@/app/components/SiteImage";



import Navbar from "./components/Navbar";
import HeroBackground from "./components/HeroBackground";
import About from "./components/About";
import WhyChoose from "./components/WhyChoose";
import Gallery from "./components/Gallery";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import ClosingEditorial from "./components/ClosingEditorial";

export default function Home() {
  return (
    <main className="relative min-h-screen text-white">
      
      {/* Background */}
      <HeroBackground />

      {/* Navbar */}
      <Navbar />

      {/* ================= HERO ================= */}
     <section
  id="home"
className="
  relative z-10
  min-h-[100svh] md:h-screen
  flex items-center justify-center
  overflow-hidden
  pt-28 md:pt-24
"
>

        {/* Pink Glow */}
        <div className="pink-glow top-1/4 left-1/2 -translate-x-1/2 -z-10"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.35,
              },
            },
          }}
          className="text-center"
        >
          <h1 className="sr-only">
            Divisha Makeovers - Bridal Makeup Artist in Jalandhar, Punjab
          </h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{
              duration: 1.8,
              ease: "easeOut",
            }}
            className="mx-auto mb-8 w-[180px] sm:w-[220px] md:w-[340px] opacity-90"
          >
            <Image
              src="/logo/dm2.png"
              alt="Divisha Makeovers Logo"
              width={681}
              height={239}
              sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 340px"
              priority
              quality={92}
              className="w-full h-auto"
            />
          </motion.div>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-sm sm:text-lg mb-6 text-white/80 tracking-wider"
          >
            Luxury Bridal Makeup Artist in Jalandhar, Punjab
          </motion.p>

          <motion.a
  href="https://wa.me/916280879548?text=Hello%20Divisha%20Makeovers,%20I%20would%20like%20to%20book%20a%20makeup%20appointment."
  target="_blank"
  rel="noopener noreferrer"
  variants={{
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }}
  className="
    bg-pink-500 hover:bg-zinc-950
    transition-all duration-700
    px-7 py-3 sm:px-10
    rounded-full
    tracking-widest uppercase text-xs sm:text-sm
    inline-block
  "
>
  Book Appointment
</motion.a>


        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.2, repeat: Infinity, duration: 2 }}
        >
          SCROLL
        </motion.div>
      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="relative z-10 section-bg"
      >
        <About />
      </section>

      {/* ================= WHY CHOOSE ================= */}
      <section
        id="why-choose"
        className="relative z-10 section-bg"
      >
        <WhyChoose />
      </section>

      {/* ================= GALLERY ================= */}
      <section
        id="gallery"
        className="relative z-10 section-bg"
      >
        <div className="pink-glow top-1/2 right-10"></div>
        <Gallery />
      </section>

      {/* ================= SERVICES ================= */}
      <section
        id="services"
        className="relative z-10 section-bg"
      >
        <Services />
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section
        id="testimonials"
        className="relative z-10 section-bg"
      >
        <Testimonials />
      </section>

      {/* ================= CONTACT ================= */}
      <section
        id="contact"
        className="relative z-10 section-bg"
      >
        <Contact />
      </section>

      {/* ================= FOOTER ================= */}
      <section
        className="relative z-10 section-bg"
      >
        <ClosingEditorial />
      </section>

    </main>
  );
}
