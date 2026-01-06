"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import ClosingEditorial from "@/app/components/ClosingEditorial";

/* 👇 NAIL EXTENSION IMAGES */
const nailImages = [
  "/nails/nails1.png",
  "/nails/nails2.png",
  "/nails/nails3.png",
  "/nails/nails4.png",
  "/nails/nails5.png",
  "/nails/nails6.png",
];

/* FRAMER VARIANTS */
const container = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.25,
      staggerChildren: 0.18,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function NailsExtensionsPage() {
  const pageRef = useRef(null);
  const router = useRouter();

  /* PAGE VISIBLE EFFECT */
  useEffect(() => {
    requestAnimationFrame(() => {
      pageRef.current?.classList.add("page-visible");
    });
  }, []);

  /* BODY OVERFLOW FIX */
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* WHATSAPP CTA */
  const openWhatsApp = (packageName, price) => {
    const message = `Hello Divisha Makeovers,
I am interested in your ${packageName}.

Package Price: ${price}

Please share details, availability, and nail design options.`;

    const url =
      "https://wa.me/916280879548?text=" + encodeURIComponent(message);

    window.open(url, "_blank");
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">

      {/* NAVBAR */}
      <Navbar />

      {/* FIXED BACKGROUND */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/nails-bg/nailsbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#1a0b12",
        }}
      />

      {/* DEPTH + CONTRAST */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/60 via-black/25 to-black/70" />

      {/* SOFT PINK AMBIENT GLOW */}
      <div className="fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.18),transparent_60%)]" />

      {/* EDGE VIGNETTE */}
      <div className="fixed inset-0 z-10 pointer-events-none shadow-[inset_0_0_180px_rgba(0,0,0,0.85)]" />

      {/* CONTENT */}
      <motion.main
        ref={pageRef}
        className="relative z-20 pt-36 pb-24 opacity-0 translate-y-6 transition-all duration-1000"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="px-6 md:px-10">

          {/* HEADER */}
          <motion.div variants={item} className="max-w-6xl mx-auto mb-20">
            <button
              onClick={() => router.back()}
              className="text-white/60 hover:text-white mb-6 transition tracking-widest text-xs uppercase"
            >
              ← Back
            </button>

            <h1 className="text-4xl md:text-5xl mb-4 tracking-wide">
              Nail Extensions
            </h1>

            <p className="text-white/70 max-w-2xl leading-relaxed">
              Premium nail extensions and luxury nail art designed to elevate your
              overall look with clean finishes, elegant shapes, and flawless detail.
            </p>
          </motion.div>

          {/* GALLERY */}
          <motion.div
            variants={item}
            className="max-w-6xl mx-auto mb-28 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          >
            {nailImages.map((src, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              >
                <Image
                  src={src}
                  alt="Nail Extension Design"
                  width={500}
                  height={280}
                  className="w-full h-[280px] object-cover"
                  priority={index < 2}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* PACKAGES */}
          <motion.div variants={item} className="max-w-6xl mx-auto mb-28">
            <h2 className="text-3xl mb-10 tracking-wide">Nail Packages</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Temporary Nail Extension (including nail art)", price: "₹1,700" },
                { title: "Gel/Acrylic Nail Extensions (including nail art)", price: "₹2,600" },
                { title: "Shellac(including nail art)", price: "₹1,200" },
              ].map((pkg, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)] flex flex-col"
                >
                  <div>
                    <h3 className="text-xl mb-2">{pkg.title}</h3>
                    <p className="text-pink-400 text-2xl mb-6">{pkg.price}</p>
                  </div>

                  <button
                    aria-label={`Book ${pkg.title} via WhatsApp`}
                    onClick={() => openWhatsApp(pkg.title, pkg.price)}
                    className="mt-auto bg-pink-500 px-6 py-3 rounded-full tracking-widest uppercase text-xs hover:bg-pink-600 transition-all duration-500"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={item} className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl mb-6 tracking-wide">
              Book Your Nail Appointment
            </h2>

            <button
              onClick={() =>
                openWhatsApp("Nail Extensions Appointment", "Discuss Packages")
              }
              className="bg-pink-500 px-10 py-4 rounded-full tracking-widest uppercase text-sm hover:bg-pink-600 transition-all duration-500"
            >
              Book on WhatsApp
            </button>
          </motion.div>

        </div>
      </motion.main>

      {/* TRANSITION */}
      <div className="relative z-20 h-40 bg-gradient-to-b from-transparent to-[#0b0b0c]" />

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="relative z-20"
      >
        <ClosingEditorial />
      </motion.footer>

    </div>
  );
}
