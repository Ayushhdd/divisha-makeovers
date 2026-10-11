"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "@/app/components/SiteImage";
import Navbar from "@/app/components/Navbar";
import ClosingEditorial from "@/app/components/ClosingEditorial";
import GatedPriceAction from "@/app/components/GatedPriceAction";

const partySections = [
  {
    title: "Classic Party Makeup",
    price: "₹ 2,500",
    desc: "A clean and elegant party look designed to enhance your natural features with a soft, fresh finish--perfect for birthdays, family functions, and intimate gatherings.",
    includes: ["Basic Party Makeup", "Simple hairstyling"],
    images: ["/party/classic1.jpg", "/party/classic2.jpg", "/party/classic3.jpg", "/party/classic4.jpg"],
  },
  {
    title: "HD Party Makeup",
    price: "₹ 3,500",
    desc: "Our HD Party Makeup delivers a radiant, camera-ready finish using high-quality products for a polished and long-lasting look.",
    includes: [
      "Waterproof HD base makeup",
      "Advanced hairstyling",
      "Luxury eyelashes",
      "Highlight & contour",
      "Premium finishing products",
      "Draping of outfit",
    ],
    images: ["/party/hd-party.jpg", "/party/hd-party1.jpg", "/party/hd-party2.jpg", "/party/hd-party3.jpg"],
    isBestSeller: true,
  },
  {
    title: "Signature Party Makeup",
    price: "₹ 4,500",
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
    price: "₹ 6,500",
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
    images: ["/party/luxuryglam.jpg", "/party/luxuryglam1.jpg", "/party/luxuryglam2.jpg", "/party/luxuryglam3.jpg"],
    isLuxury: true,
  },
];

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

export default function PartyMakeupPage() {
  const pageRef = useRef(null);
  useEffect(() => {
    requestAnimationFrame(() => {
      pageRef.current?.classList.add("page-visible");
    });
  }, []);

  // Defensive: make sure body scroll remains native
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

Please let me know availability and details.`;
    window.open("https://wa.me/916280879548?text=" + encodeURIComponent(message), "_blank");
  };

  return (
    <div
      id="scroll-container"
      className="relative min-h-screen text-white overflow-x-clip"
      style={{ overflowAnchor: "none" }}
    >
      <Navbar />

      {/* Fixed background - promoted to its own layer */}
      <motion.div
        className="fixed inset-0 z-0 overflow-hidden bg-[#14080c] pointer-events-none"
        style={{
          transform: "translate3d(0,0,0)",
          backfaceVisibility: "hidden",
        }}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/party-bg/partybg1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          coverViewport
          quality={92}
          className="object-cover"
        />
      </motion.div>

      {/* Overlay layers (decorative, pointer-events-none) */}
      <div className="fixed inset-0 z-10 bg-black/25 pointer-events-none" />
      <div
        className="fixed inset-0 z-10 pointer-events-none hidden md:block"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <div
        className="fixed inset-0 z-10 pointer-events-none hidden md:block"
        style={{
          background: "radial-gradient(700px at 20% 12%, rgba(255,215,230,0.20), rgba(0,0,0,0) 60%)",
        }}
      />
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0) 40%)",
        }}
      />

      <div className="pink-glow top-[25%] left-[8%] hidden md:block pointer-events-none" />
      <div className="pink-glow bottom-[12%] right-[6%] hidden md:block pointer-events-none" />

      {/* MAIN CONTENT */}
      <motion.div
        ref={pageRef}
        className="page-hidden service-page-stable relative z-20 min-h-screen px-4 md:px-10 pt-32 md:pt-36 pb-16 md:pb-20"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* HEADER */}
        <motion.div variants={item} className="max-w-6xl mx-auto mb-20 md:mb-32 text-white">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition tracking-widest text-xs uppercase"
          >
            &larr; Back
          </button>

          <h1 className="text-5xl mb-4 tracking-wide leading-[1.1] text-white/95">Party Makeup</h1>

          <p className="text-white/70 leading-relaxed max-w-[90%]">
            Glamorous and elegant party makeup looks crafted to make you stand out effortlessly at every celebration.
          </p>
        </motion.div>

        {/* SECTIONS */}
        {partySections.map((section, idx) => {
          const imageLeft = idx % 2 === 0;

          return (
            <motion.section key={idx} variants={item} className="max-w-7xl mx-auto mb-28 md:mb-44">
              <div className="grid gap-10 md:gap-16 items-center lg:grid-cols-[2.4fr_2.6fr]">
                {/* IMAGES */}
                <div
                  className={`order-2 ${imageLeft ? "lg:order-1 max-w-[700px]" : "lg:order-2 max-w-[900px]"} w-full`}
                >
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {section.images.map((img, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                        className="aspect-[3/4] max-h-[620px] overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.25)] relative"
                      >
                        <Image
                          src={img}
                          alt={section.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 32vw, 480px"
                          quality={92}
                          className="object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* TEXT */}
                <div
                  className={`order-1 ${imageLeft ? "lg:order-2" : "lg:order-1"} relative rounded-3xl bg-black/60 backdrop-blur-sm md:backdrop-blur-md p-6 md:p-10 border border-white/10`}
                >
                  {section.isBestSeller && (
                    <div className="inline-block mb-4 px-4 py-1 rounded-full bg-pink-500/20 border border-pink-400 text-pink-300 text-xs tracking-widest uppercase font-semibold">
                      Best Seller
                    </div>
                  )}

                  {section.isLuxury && (
                    <div className="inline-block mb-5 px-5 py-1.5 rounded-full bg-[#C9A24D]/20 border border-[#E6C87A] text-[#E6C87A] text-xs tracking-[0.3em] uppercase font-semibold">
                      Luxury & Premium Package
                    </div>
                  )}

                  <h2
                    className={`mb-4 tracking-wide ${section.isLuxury
                        ? "text-6xl"
                        : section.isBestSeller
                          ? "text-5xl"
                          : "text-4xl"
                      }`}
                  >
                    {section.title}
                  </h2>

                  <p className="text-white/70 leading-relaxed mb-6">{section.desc}</p>

                  <ul className="space-y-2 mb-8 text-white/75 text-sm">
                    {section.includes.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-pink-400">*</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <GatedPriceAction
                    serviceName="Party Makeup"
                    packageName={section.title}
                    price={section.price}
                    onBook={() => openWhatsApp(section.title, section.price)}
                    revealedPrice={
                      section.isLuxury ? (
                        <p className="text-[#E6C87A] text-4xl font-medium mb-8">{section.price}</p>
                      ) : (
                        <p className="text-pink-400 text-3xl mb-8">{section.price}</p>
                      )
                    }
                  />
                </div>
              </div>
            </motion.section>
          );
        })}

        {/* FINAL CTA */}
        <motion.div variants={item} className="text-center">
          <h2 className="text-3xl mb-6 tracking-wide">Book Your Party Look</h2>

          <button
            onClick={() => openWhatsApp("Party Makeup Enquiry", "Discuss Packages")}
            className="inline-block w-full sm:w-auto bg-pink-500 px-10 py-4 rounded-full tracking-widest uppercase text-sm hover:bg-pink-600 transition-all duration-500"
          >
            Book on WhatsApp
          </button>
        </motion.div>
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

