"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "@/app/components/SiteImage";
import Navbar from "@/app/components/Navbar";
import ClosingEditorial from "@/app/components/ClosingEditorial";
import GatedPriceAction from "@/app/components/GatedPriceAction";

/* NAIL EXTENSION IMAGES */
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

  /* BODY OVERFLOW FIX (defensive) */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev;
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
    <div
      id="scroll-container"
      className="relative min-h-screen text-white overflow-x-clip"
      style={{ overflowAnchor: "none" }}
    >
      {/* NAVBAR */}
      <Navbar />

      {/* FIXED BACKGROUND (GPU promoted) */}
      <div
        className="fixed inset-0 z-0 overflow-hidden bg-[#1a0b12] pointer-events-none"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        <Image
          src="/nails-bg/nailsbg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          coverViewport
          quality={92}
          className="object-cover"
        />
      </div>

      {/* DEPTH + CONTRAST */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/60 via-black/25 to-black/70 pointer-events-none" />

      {/* SOFT PINK AMBIENT GLOW */}
      <div
        className="fixed inset-0 z-10 pointer-events-none hidden md:block"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(236,72,153,0.18), transparent 60%)",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* EDGE VIGNETTE */}
      <div
        className="fixed inset-0 z-10 pointer-events-none hidden md:block"
        style={{ boxShadow: "inset 0 0 180px rgba(0,0,0,0.85)" }}
      />

      {/* CONTENT */}
      <motion.main
        ref={pageRef}
        className="page-hidden service-page-stable relative z-20 pt-32 md:pt-36 pb-20 md:pb-24"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="px-4 md:px-10">
          {/* HEADER */}
          <motion.div variants={item} className="max-w-6xl mx-auto mb-16 md:mb-20">
            <button
              onClick={() => router.back()}
              className="text-white/60 hover:text-white mb-6 transition tracking-widest text-xs uppercase"
            >
              &larr; Back
            </button>

            <h1 className="text-4xl md:text-5xl mb-4 tracking-wide">Nail Extensions</h1>

            <p className="text-white/70 max-w-2xl leading-relaxed">
              Premium nail extensions and luxury nail art designed to elevate your
              overall look with clean finishes, elegant shapes, and flawless detail.
            </p>
          </motion.div>

          {/* GALLERY */}
          <motion.div
            variants={item}
            className="max-w-6xl mx-auto mb-20 md:mb-28 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8"
          >
            {nailImages.map((src, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              >
                {/* next/image is used -- priority for first two, others lazy by default */}
                <Image
                  src={src}
                  alt="Nail Extension Design"
                  width={1200}
                  height={672}
                  sizes="(max-width: 768px) 90vw, 550px"
                  quality={92}
                  className="w-full h-[170px] sm:h-[240px] md:h-[280px] object-cover"
                  priority={index < 2}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* PACKAGES */}
          <motion.div variants={item} className="max-w-6xl mx-auto mb-28">
            <h2 className="text-3xl mb-8 md:mb-10 tracking-wide">Nail Packages</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {[
                { title: "Temporary Nail Extension (including nail art)", price: "₹1,700" },
                { title: "Gel/Acrylic Nail Extensions (including nail art)", price: "₹2,600" },
                { title: "Shellac(including nail art)", price: "₹1,200" },
              ].map((pkg, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm md:backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-[0_18px_45px_rgba(0,0,0,0.45)] md:shadow-[0_25px_70px_rgba(0,0,0,0.55)] flex flex-col"
                >
                  <div>
                    <h3 className="text-xl mb-2">{pkg.title}</h3>
                  </div>

                  <GatedPriceAction
                    serviceName="Nail Extensions"
                    packageName={pkg.title}
                    price={pkg.price}
                    onBook={() => openWhatsApp(pkg.title, pkg.price)}
                    className="mt-auto"
                    bookButtonClassName="w-full md:w-auto md:self-start bg-pink-500 px-6 py-3 rounded-full tracking-widest uppercase text-xs hover:bg-pink-600 transition-all duration-500"
                    revealedPrice={
                      <p className="text-pink-400 text-2xl mb-6">{pkg.price}</p>
                    }
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={item} className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl mb-6 tracking-wide">Book Your Nail Appointment</h2>

            <button
              onClick={() => openWhatsApp("Nail Extensions Appointment", "Discuss Packages")}
              className="w-full sm:w-auto bg-pink-500 px-10 py-4 rounded-full tracking-widest uppercase text-sm hover:bg-pink-600 transition-all duration-500"
            >
              Book on WhatsApp
            </button>
          </motion.div>
        </div>
      </motion.main>

      {/* TRANSITION */}
      <div className="relative z-20 h-40 bg-gradient-to-b from-transparent to-[#0b0b0c]" />

      {/* FOOTER */}
      <div className="relative z-20">
        <ClosingEditorial />
      </div>
    </div>
  );
}




