"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Navbar from "@/app/components/Navbar";
import ClosingEditorial from "@/app/components/ClosingEditorial";



const engagementSections = [
  {
    title: "Signature High Definition (HD) Engagement/Reception Makeup Package",
    price: "₹10,500",
    isBestSeller: true,
    desc: "Our Signature High Definition Engagement/Reception Makeup is designed to help you look radiant and picture-perfect on your special day. This look is curated after understanding the bride’s personal preferences and style. Only premium international brands are used to deliver a flawless, long-lasting, and camera-ready finish with advanced and modern hairstyling techniques. Brands include NARS, Tarte, HUDA BEAUTY, Estée Lauder, Laura Mercier, and Charlotte Tilbury for a luxurious HD glow.",
    includes: [
      "Waterproof HD base makeup",
      "Advanced & international hairstyling",
      "Luxury eyelashes",
      "Hair extensions (if needed)",
      "Outfit draping",
      "Premium finishing products",
    ],
    notes: [
      "We don't provide hair accessories for ENGAGEMENT and RECEPTION Makeup"
    ],
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

const container = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.35,
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function EngagementPage() {
  const pageRef = useRef(null);

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

Please share availability and further details.
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


      {/* ===== FIXED PREMIUM BACKGROUND ===== */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/engagement-bg/engagementbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* DARK LUXURY OVERLAY */}
      <div className="fixed inset-0 z-10 bg-black/15" />
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />



 {/* 🌸 PINK GLOW – ADD HERE */}
 <div className="pink-glow top-[20%] left-[10%] hidden md:block" />
<div className="pink-glow bottom-[10%] right-[5%] hidden md:block" />




      {/* ===== CONTENT (SCROLLS ABOVE BACKGROUND) ===== */}
      <div className="relative z-20">

        {/* HERO */}
<section className="relative pt-36 pb-14 px-5">





          <div className="max-w-6xl mx-auto">
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

            <h1 className="text-5xl mb-4 tracking-wide leading-[1.1]">
  Engagement & Reception Makeup
</h1>


           <p className="text-white/70 leading-relaxed max-w-[90%]">
  Elegant and refined engagement looks crafted to highlight your
  natural beauty and create timeless memories.
</p>

          </div>
        </section>

        {/* CONTENT */}
       <section
  ref={pageRef}
 className="relative px-4 pt-12 pb-12"

>

          <motion.div
            variants={container}
            initial="show"
            animate="show"
          >
            {engagementSections.map((section, idx) => (
              <motion.section
                key={idx}
                variants={item}
                className="max-w-7xl mx-auto mb-44"
              >
                <div className="grid gap-16 items-center lg:grid-cols-[2.4fr_2.6fr]">

                  {/* IMAGES */}
                  <div
                    className={`${
                      section.reverse
                        ? "lg:order-2 max-w-[900px]"
                        : "lg:order-1 max-w-[700px]"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {section.images.map((img, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.03 }}
                            transition={{
                              duration: 0.75,
                              ease: [0.16, 1, 0.3, 1],
                            }}

                          className="aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
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

                  {/* TEXT */}
                 <div
                  className={`${
                    section.reverse ? "lg:order-1" : "lg:order-2"
                  } ${
                    section.isBestSeller
                      ? "rounded-3xl bg-black/35 backdrop-blur-2xl p-10 border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
                      : section.isLuxury
                      ? "rounded-[2.5rem] bg-black/50 backdrop-blur-2xl p-12 border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
                      : ""
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

                   <h2 className="text-5xl mb-4 tracking-wide leading-[1.1]">
  {section.title}
</h2>


                    <p className="text-white/70 leading-relaxed max-w-[90%] mb-6">
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


{/* NOTES */}
{section.notes && (
  <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/10">
    <h4 className="text-xs tracking-widest uppercase text-white/60 mb-3">
      Important Note
    </h4>

    <ul className="space-y-2 text-white/60 text-sm">
      {section.notes.map((note, i) => (
        <li key={i} className="flex gap-3">
          <span className="text-pink-400">•</span>
          <span>{note}</span>
        </li>
      ))}
    </ul>
  </div>
)}




                    <p className="text-[#FF5CA8] text-3xl mb-8">
                      {section.price}
                    </p>

              <button
  onClick={() => openWhatsApp(section.title, section.price)}
  className="
    inline-block
    bg-pink-500
    px-10 py-4
    rounded-full
    tracking-[0.3em]
    uppercase
    text-sm
    shadow-[0_10px_40px_rgba(236,72,153,0.45)]
    hover:bg-pink-600
    hover:shadow-[0_15px_60px_rgba(236,72,153,0.6)]
    transition-all
    duration-500
  "
>
  Book Now
</button>

                  </div>
                </div>
              </motion.section>
            ))}

            {/* CTA */}
    <motion.div variants={item} className="text-center mt-36">

              <h2 className="text-3xl mb-6 tracking-wide">
                Book Your Engagement Look
              </h2>

            <button
  onClick={() =>
    openWhatsApp("Engagement Makeup Enquiry", "Discuss Packages")
  }
  className="
    inline-block
    bg-pink-500
    px-10 py-4
    rounded-full
    tracking-[0.3em]
    uppercase
    text-sm
    shadow-[0_10px_40px_rgba(236,72,153,0.45)]
    hover:bg-pink-600
    hover:shadow-[0_15px_60px_rgba(236,72,153,0.6)]
    transition-all
    duration-500
  "
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
  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
  viewport={{ once: true }}
  className="relative z-20"
>
  <ClosingEditorial />
</motion.footer>




        </section>

      </div>
    </div>
  );
}
