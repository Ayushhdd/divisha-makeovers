"use client";

import { motion } from "framer-motion";



import Navbar from "./components/Navbar";
import HeroBackground from "./components/HeroBackground";
import About from "./components/About";
import WhyChoose from "./components/WhyChoose";
import Gallery from "./components/Gallery";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import ClosingEditorial from "./components/ClosingEditorial";

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Home() {
  return (
    <main className="relative text-white min-h-screen overflow-hidden">
      
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
          <motion.img
            src="/logo/dm2.png"
            alt="Divisha Makeovers Logo"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{
              duration: 1.8,
              ease: "easeOut",
            }}
            className="mx-auto mb-8 w-[180px] sm:w-[220px] md:w-[340px] opacity-90"
          />

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-sm sm:text-lg mb-6 text-white/80 tracking-wider"
          >
            Luxury Bridal Makeup Artist
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
      <motion.section
        id="about"
        className="relative z-10 section-bg"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <About />
      </motion.section>

      {/* ================= WHY CHOOSE ================= */}
      <motion.section
        id="why-choose"
        className="relative z-10 section-bg"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <WhyChoose />
      </motion.section>

      {/* ================= GALLERY ================= */}
      <motion.section
        id="gallery"
        className="relative z-10 section-bg"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="pink-glow top-1/2 right-10"></div>
        <Gallery />
      </motion.section>

      {/* ================= SERVICES ================= */}
      <motion.section
        id="services"
        className="relative z-10 section-bg"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Services />
      </motion.section>

      {/* ================= TESTIMONIALS ================= */}
      <motion.section
        id="testimonials"
        className="relative z-10 section-bg"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Testimonials />
      </motion.section>

      {/* ================= CONTACT ================= */}
      <motion.section
        id="contact"
        className="relative z-10 section-bg"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Contact />
      </motion.section>

      {/* ================= FOOTER ================= */}
      <motion.section
        className="relative z-10 section-bg"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <ClosingEditorial />
      </motion.section>

    </main>
  );
}
