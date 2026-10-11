"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "@/app/components/SiteImage";
import Navbar from "@/app/components/Navbar";
import ClosingEditorial from "@/app/components/ClosingEditorial";
import GatedPriceAction from "@/app/components/GatedPriceAction";

/* ================= DATA ================= */

const engagementSections = [
  {
    title: "Signature High Definition (HD) Engagement/Reception Makeup Package",
    price: "₹10,500",
    isBestSeller: true,
    desc: "Our Signature High Definition Engagement/Reception Makeup is designed to help you look radiant and picture-perfect on your special day. This look is curated after understanding the bride's personal preferences and style. Only premium international brands are used to deliver a flawless, long-lasting, and camera-ready finish with advanced and modern hairstyling techniques. Brands include NARS, Tarte, HUDA BEAUTY, Estee Lauder, Laura Mercier, and Charlotte Tilbury for a luxurious HD glow.",
    includes: [
      "Waterproof HD base makeup",
      "Advanced & international hairstyling",
      "Luxury eyelashes",
      "Hair extensions (if needed)",
      "Outfit draping",
      "Premium finishing products",
    ],
    notes: ["We don't provide hair accessories for ENGAGEMENT and RECEPTION Makeup"],
    images: [
      "/signature-hd/signaturehd1.jpg",
      "/signature-hd/signaturehd2.jpg",
      "/signature-hd/signaturehd3.jpg",
      "/signature-hd/signaturehd4.jpg",
    ],
  },
  {
    title: "Signature AirBrush Engagement Makeup Package",
    price: "₹15,500",
    isLuxury: true,
    desc: "Our Signature Airbrush Engagement Makeup delivers a flawless, ultra-smooth finish with a lightweight feel. Designed for brides who want refined luxury and long-lasting perfection.",
    includes: [
      "Silicon / Airbrush base makeup",
      "Advanced & international hairstyling",
      "Luxury eyelashes",
      "Hair extensions (if needed)",
      "Outfit draping",
      "Premium finishing products",
    ],
    images: [
      "/signature-airbrush/signatureairbrush1.jpg",
      "/signature-airbrush/signatureairbrush2.jpg",
      "/signature-airbrush/signatureairbrush3.jpg",
      "/signature-airbrush/signatureairbrush4.jpg",
    ],
    reverse: true,
  },
];

/* ================= MOTION ================= */

const container = {
  show: { transition: { staggerChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ================= PAGE ================= */

export default function EngagementPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      pageRef.current?.classList.add("page-visible");
    });
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const openWhatsApp = (packageName, price) => {
    const message = `Hello Divisha Makeovers,
I am interested in your ${packageName}.

Package Price: ${price}

Please share availability and further details.`;
    window.open(
      "https://wa.me/916280879548?text=" + encodeURIComponent(message),
      "_blank"
    );
  };

  return (
    <div
      id="scroll-container"
      className="relative min-h-screen text-white overflow-x-clip"
      style={{ overflowAnchor: "none" }}
    >
      <Navbar />

      {/* ===== FIXED BACKGROUND (GPU PROMOTED) ===== */}
      <motion.div
        className="fixed inset-0 z-0 overflow-hidden bg-[#1b0b10] pointer-events-none"
        style={{
          transform: "translate3d(0,0,0)",
          backfaceVisibility: "hidden",
        }}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/engagement-bg/engagementbg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          coverViewport
          quality={92}
          className="object-cover"
        />
      </motion.div>

      {/* OVERLAYS */}
      <div className="fixed inset-0 z-10 bg-black/20 pointer-events-none" />
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/30 via-black/50 to-black/70 pointer-events-none" />

      {/* GLOWS */}
      <div className="pink-glow top-[20%] left-[10%] hidden md:block pointer-events-none" />
      <div className="pink-glow bottom-[10%] right-[5%] hidden md:block pointer-events-none" />

      {/* ===== CONTENT ===== */}
      <motion.div
        ref={pageRef}
        className="page-hidden service-page-stable relative z-20 min-h-screen px-4 md:px-10 pt-32 md:pt-36 pb-16 md:pb-20"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* HERO */}
        <motion.div variants={item} className="max-w-6xl mx-auto mb-20 md:mb-32 text-white">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition tracking-widest text-xs uppercase"
          >
            &larr; Back
          </button>

          <h1 className="text-5xl mb-4 tracking-wide leading-[1.1] text-white/95">
            Engagement & Reception Makeup
          </h1>

          <p className="text-white/70 leading-relaxed max-w-[90%]">
            Elegant and refined engagement looks crafted to highlight your
            natural beauty and create timeless memories.
          </p>
        </motion.div>

        {/* SECTIONS */}
        <div>
          {engagementSections.map((section, idx) => (
            <motion.section
              key={idx}
              variants={item}
              className="max-w-7xl mx-auto mb-28 md:mb-44"
            >
              <div className="grid gap-10 md:gap-16 items-center lg:grid-cols-[2.4fr_2.6fr]">

                {/* IMAGES */}
                <div className={`order-2 ${section.reverse ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {section.images.map((img, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        className="aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 border border-white/10 relative"
                      >
                        <Image
                          src={img}
                          alt={section.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 28vw, 440px"
                          quality={92}
                          className="object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* TEXT */}
                <div
                  className={`order-1 ${section.reverse ? "lg:order-1" : "lg:order-2"} 
                  rounded-3xl bg-black/60 backdrop-blur-sm md:backdrop-blur-md p-6 md:p-10 border border-white/10`}
                >
                  {section.isBestSeller && (
                    <div className="mb-4 px-4 py-1 rounded-full bg-pink-500/20 border border-pink-400 text-pink-300 text-xs uppercase w-fit">
                      Best Seller
                    </div>
                  )}

                  {section.isLuxury && (
                    <div className="mb-5 px-5 py-1.5 rounded-full bg-[#C9A24D]/20 border border-[#E6C87A] text-[#E6C87A] text-xs uppercase w-fit">
                      Luxury & Premium
                    </div>
                  )}

                  <h2 className="text-4xl mb-4 leading-tight">
                    {section.title}
                  </h2>

                  <p className="text-white/70 mb-6">
                    {section.desc}
                  </p>

                  <ul className="space-y-2 mb-8 text-sm text-white/75">
                    {section.includes.map((p, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-pink-400">*</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>

                  {section.notes && (
                    <div className="mb-8 p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-xs uppercase text-white/60 mb-3">
                        Important Note
                      </h4>
                      {section.notes.map((n, i) => (
                        <p key={i} className="text-sm text-white/60">
                          * {n}
                        </p>
                      ))}
                    </div>
                  )}

                  <GatedPriceAction
                    serviceName="Engagement & Reception Makeup"
                    packageName={section.title}
                    price={section.price}
                    onBook={() => openWhatsApp(section.title, section.price)}
                    bookButtonClassName="w-full sm:w-auto bg-pink-500 px-10 py-4 rounded-full tracking-[0.3em] uppercase text-sm hover:bg-pink-600 transition"
                    revealedPrice={
                      <p className="text-[#FF5CA8] text-3xl mb-8">
                        {section.price}
                      </p>
                    }
                  />
                </div>
              </div>
            </motion.section>
          ))}
        </div>

      </motion.div>

      {/* TRANSITION TO FOOTER */}
      <div className="relative z-20 h-40 bg-gradient-to-b from-transparent to-[#0b0b0c]" />

      {/* FOOTER */}
      <div className="relative z-20">
        <ClosingEditorial />
      </div>
    </div>
  );
}



