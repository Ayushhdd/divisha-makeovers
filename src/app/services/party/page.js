"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Navbar from "@/app/components/Navbar";
import ClosingEditorial from "@/app/components/ClosingEditorial";


const partySections = [
  {
    title: "Classic Party Makeup",
    price: "₹2,500",
    desc: "A clean and elegant party look designed to enhance your natural features with a soft, fresh finish—perfect for birthdays, family functions, and intimate gatherings.",
    includes: [
      "Basic Party Makeup",
      "Simple hairstyling",
    ],
    images: [
      "/party/classic1.jpg",
      "/party/classic2.jpg",
      "/party/classic3.jpg",
      "/party/classic4.jpg",
    ],
  },
  {
    title: "HD Party Makeup",
    price: "₹3,500",
    desc: "Our HD Party Makeup delivers a radiant, camera-ready finish using high-quality products for a polished and long-lasting look.",
    includes: [
      "Waterproof HD base makeup",
      "Advanced hairstyling",
      "Luxury eyelashes",
      "Highlight & contour",
      "Premium finishing products",
      "Drapping of outfit"
    ],
    images: [
      "/party/hd-party.jpg",
      "/party/hd-party1.jpg",
      "/party/hd-party2.jpg",
      "/party/hd-party3.jpg",
    ],
    isBestSeller: true,
  },
  {
    title: "Signature Party Makeup",
    price: "₹4,500",
    desc: "Lightweight airbrush makeup that blends seamlessly into the skin for a flawless, smooth, and long-lasting party look.",
    includes: [
      "Airbrush / silicon base makeup",
      "Advanced hairstyling",
      "Luxury eyelashes",
      "HD contour & glow",
      "Long-lasting finish",
      "Colored lenses (optional)",
      "Draping of outfit",
    ],
    images: [
      "/party/uhdsignatureparty1.jpg",
      "/party/uhdsignatureparty2.jpg",
      "/party/uhdsignatureparty3.jpg",
      "/party/uhdsignatureparty4.jpg",
    ],
  },
  {
    title: "AirBrush Party Makeup",
    price: "₹6,500",
    desc: "A red-carpet-inspired party look with bold elegance, luxury detailing, and flawless perfection.",
    includes: [
      "Premium luxury base makeup",
      "International hairstyling",
      "Luxury lashes & eye detailing",
      "Advanced contouring & glow",
      "High-end finishing products",
      "Colored lenses (optional)",
      "Draping of outfit",
    ],
    images: [
      "/party/luxuryglam.jpg",
      "/party/luxuryglam1.jpg",
      "/party/luxuryglam2.jpg",
      "/party/luxuryglam3.jpg",
    ],
    isLuxury: true,
  },
];

const container = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.3, staggerChildren: 0.16 },
  },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function PartyMakeupPage() {
  const pageRef = useRef(null);

  const { scrollY } = useScroll();

  /* PARALLAX — VERY SLOW */
  const bgY = useTransform(scrollY, [0, 1400], [0, -90]);

  useEffect(() => {
    requestAnimationFrame(() => {
      pageRef.current?.classList.add("page-visible");
    });
  }, []);



const openWhatsApp = (packageName, price) => {
  const message = `
Hello Divisha Makeovers,
I am interested in your ${packageName}.

Package Price: ${price}

Please let me know availability and details.
  `;

  const url =
    "https://wa.me/916280879548?text=" + encodeURIComponent(message);

  window.open(url, "_blank");
};





  return (
   <div
  id="scroll-container"
  className="relative text-white min-h-screen overflow-y-auto"
>


<Navbar />


      {/* ===== CINEMATIC PARALLAX BACKGROUND ===== */}
      <motion.div
        className="fixed -inset-[0%] z-0"
        style={{
          y: bgY,
          backgroundImage: "url('/party-bg/partybg1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#14080c",
        }}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* ===== LUXURY DEPTH OVERLAYS ===== */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-black/10" />

      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.38) 65%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(650px at 70% 18%, rgba(236,72,153,0.18), rgba(0,0,0,0) 60%)",
        }}
      />

      {/* ===== CONTENT ===== */}
      <motion.div
        ref={pageRef}
        className="relative z-20 min-h-screen px-6 md:px-10 pt-36 pb-20"

        variants={container}
        initial="show"
        animate="show"
      >
        {/* HEADER */}
        <motion.div variants={item} className="max-w-6xl mx-auto mb-32">

          <button
  onClick={() => window.history.back()}
  className="
    inline-flex items-center gap-2
    text-white/60 hover:text-white
    mb-8 transition
    tracking-widest text-xs uppercase
  "
>

            ← Back
          </button>

          <h1 className="text-5xl mb-4 tracking-wide font-light">
            Party Makeup
          </h1>

          <p className="text-white/70 max-w-2xl leading-relaxed">
            Glamorous and elegant party makeup looks crafted to make you stand
            out effortlessly at every celebration.
          </p>
        </motion.div>

        {/* SECTIONS */}
        {partySections.map((section, idx) => {
          const imageLeft = idx % 2 === 0;

          return (
            <motion.section
              key={idx}
              variants={item}
              className="max-w-7xl mx-auto mb-44"
            >
              <div className="grid gap-20 items-center lg:grid-cols-2">
                {/* IMAGES */}
                <div className={imageLeft ? "lg:order-1" : "lg:order-2"}>
                  <div className="grid grid-cols-2 gap-7">
                    {section.images.map((img, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.6 }}
                        className="aspect-[3/4] overflow-hidden rounded-3xl bg-white/5 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                      >
                        <img
                          src={img}
                          alt={section.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* GLASS TEXT CARD */}
                <div
                  className={`self-center w-full max-w-[720px] rounded-[2.5rem] p-12 backdrop-blur-[18px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_40px_110px_rgba(0,0,0,0.65)]
                  ${
                    imageLeft ? "lg:order-2" : "lg:order-1"
                  }
                  ${
                    section.isLuxury
                      ? "bg-black/55 border-white/20"
                      : section.isBestSeller
                      ? "bg-black/42 border-white/15"
                      : "bg-black/32 border-white/10"
                  }`}
                >
                  {section.isBestSeller && (
                    <div className="inline-block mb-4 px-4 py-1 rounded-full bg-pink-500/20 border border-pink-400 text-pink-300 text-xs tracking-widest uppercase font-semibold">
                      ★ Best Seller
                    </div>
                  )}

                  {section.isLuxury && (
                    <div className="inline-block mb-5 px-5 py-1.5 rounded-full bg-[#C9A24D]/20 border border-[#E6C87A] text-[#E6C87A] text-xs tracking-[0.3em] uppercase font-semibold">
                      Luxury & Premium
                    </div>
                  )}

                  <h2 className="mb-4 text-5xl tracking-[0.04em] font-light">
                    {section.title}
                  </h2>

                  <p className="text-white/70 leading-relaxed mb-6">
                    {section.desc}
                  </p>

                  <ul className="space-y-2 mb-8 text-white/75 text-sm">
                    {section.includes.map((point, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-pink-400">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <p
                    className={`mb-8 ${
                      section.isLuxury
                        ? "text-[#E6C87A] text-4xl"
                        : "text-[#FF5CA8] text-3xl"
                    }`}
                  >
                    {section.price}
                  </p>

                 <button
  onClick={() => openWhatsApp(section.title, section.price)}
  className="inline-block bg-pink-500 px-8 py-3 rounded-full tracking-widest uppercase text-sm hover:bg-pink-600 transition-all duration-500"
>
  Book Now
</button>

                </div>
              </div>
            </motion.section>
          );
        })}

        {/* FINAL CTA */}
        <motion.div variants={item} className="text-center">
          <h2 className="text-3xl mb-6 tracking-wide font-light">
            Book Your Party Look
          </h2>

         <button
  onClick={() =>
    openWhatsApp("Party Makeup Enquiry", "Discuss Packages")
  }
  className="inline-block bg-pink-500 px-10 py-4 rounded-full tracking-widest uppercase text-sm hover:bg-pink-600 transition-all duration-500"
>
  Book on WhatsApp
</button>

        </motion.div>
      </motion.div>


{/* TRANSITION TO FOOTER */}
<div className="relative z-20 h-40 bg-gradient-to-b from-transparent to-[#0b0b0c]" />


{/* ================= FOOTER ================= */}
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
