"use client";

import { motion } from "framer-motion";
import Image from "next/image";


export default function About() {
  return (
    <section
      id="about"
      className="relative py-14 sm:py-20 md:py-[7.5rem] text-white overflow-hidden"
    >
      {/* SUBTLE AMBIENT BLOOMS */}
      <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-[#e7b6c3]/20 blur-[180px] md:blur-[220px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#b76e79]/18 blur-[200px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="
          relative
          max-w-[1385px]
          mx-auto
          px-4 sm:px-6 md:px-14
pt-6 pb-0 sm:py-14 md:py-20
          rounded-[2.5rem] md:rounded-[3rem]

          bg-[#5a3a3a]/65
          backdrop-blur-[16px]
          backdrop-saturate-[160%]
          border border-white/10

          shadow-[0_60px_180px_rgba(30,10,10,0.55)]
        "
      >
      {/* SOFT EDGE FADE — DESKTOP ONLY */}
<div className="pointer-events-none absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-b from-[#3a2020]/45 to-transparent rounded-t-[2.5rem] md:rounded-t-[3rem] hidden md:block" />

<div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-[#3a2020]/45 to-transparent rounded-b-[2.5rem] md:rounded-b-[3rem] hidden md:block" />

      {/* GLASS LIGHT SHEEN — DESKTOP ONLY */}
<div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#f2c6c6]/10 via-transparent to-[#2a1414]/40 pointer-events-none hidden md:block" />

        <div className="relative grid md:grid-cols-2 gap-14 sm:gap-20 md:gap-24 items-center z-10">

          {/* TEXT */}
          <div className="max-w-full md:max-w-[680px]">
            <h2 className="text-lg sm:text-2xl md:text-5xl mb-6 sm:mb-10 tracking-[0.16em]">
              About Divisha Makeovers
            </h2>

            <div className="space-y-6 sm:space-y-8 text-white/95 leading-[1.55] sm:leading-[1.65] text-[0.95rem] sm:text-lg md:text-xl font-medium">
              {/* DESCRIPTION — UNCHANGED */}
              <p>
                Divisha is a{" "}
                <span className="text-[#f0d26d] font-semibold">
                  professionally trained freelance makeup artist
                </span>{" "}
                known for creating{" "}
                <span className="text-[#f0d26d] font-semibold">
                  elegant, flawless, and timeless bridal looks
                </span>{" "}
                that enhance natural features with a refined, balanced finish.
              </p>

              <p>
                With a strong understanding of{" "}
                <span className="text-[#f0d26d] font-semibold">
                  skin types, textures, and facial structure
                </span>,
                Divisha believes bridal makeup should feel lightweight, comfortable,
                and true to the bride’s personality — never overdone.
              </p>

              <p>
                Her calm, detail-focused approach ensures every bride feels{" "}
                <span className="text-[#f0d26d] font-semibold">
                  confident, relaxed, and beautiful
                </span>{" "}
                throughout the getting-ready process, from the first brush stroke to
                the final look.
              </p>

              <p>
                Since beginning her professional journey in{" "}
                <span className="text-[#f0d26d] font-semibold">2020</span>,
                Divisha Makeovers has built a strong presence in{" "}
                <span className="text-[#f0d26d] font-semibold">Jalandhar</span>.
                Trained under{" "}
                <span className="text-[#f0d26d] font-semibold">
                  Lakme Academy, Jalandhar
                </span>,
                she blends technical expertise with an artistic eye.
              </p>

              <p>
                As a{" "}
                <span className="text-[#f0d26d] font-semibold">
                  freelance makeup artist
                </span>,
                Divisha offers the convenience of{" "}
                <span className="text-[#f0d26d] font-semibold">
                  travelling to your venue
                </span>,
                allowing brides to enjoy a peaceful, stress-free experience on their
                special day.
              </p>

              <p>
                She is widely appreciated for her{" "}
                <span className="text-[#f0d26d] font-semibold">
                  Glam, Smokey, and Classy
                </span>{" "}
                bridal looks, suitable for Roka, Engagement, Mehendi, Wedding, and
                Reception celebrations.
              </p>

              <p className="pt-2">
                Only{" "}
                <span className="text-[#f0d26d] font-semibold">
                  premium, genuine professional products
                </span>{" "}
                are used to deliver long-lasting, camera-ready results that look
                flawless both in person and in photographs.
              </p>

              <p className="pt-4">
                It would be her{" "}
                <span className="text-[#f0d26d] font-semibold">
                  absolute pleasure
                </span>{" "}
                to be a part of your journey and help create{" "}
                <span className="text-[#f0d26d] font-semibold">
                  memories that last a lifetime
                </span>.
              </p>
            </div>
          </div>

   {/* IMAGES + STATS */}
<div className="flex justify-center w-full md:w-auto">
<div className="relative flex flex-col gap-4 sm:gap-6 md:gap-8 w-full md:w-auto">
    {/* IMAGE 1 */}
    <div className="relative rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
      <Image
        src="/about/about.jpg"
        alt="Divisha Bridal Makeup"
        width={560}
        height={560}
        className="w-full h-[240px] sm:h-[420px] md:w-[560px] md:h-[560px] sm:w-[420px] sm:h-[420px] md:w-[560px] md:h-[560px] object-cover contrast-[1.05] saturate-[1.05]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
    </div>

    {/* IMAGE 2 */}
    <div className="relative rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
      <Image
        src="/about/about1.jpg"
        alt="Divisha Bridal Makeup"
        width={560}
        height={560}
        className="w-full h-[240px] sm:h-[420px] md:w-[560px] md:h-[560px] sm:w-[420px] sm:h-[420px] md:w-[560px] md:h-[560px] object-cover contrast-[1.05] saturate-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
    </div>

    {/* STATS */}
    <div className="
      mt-6 sm:mt-12 md:mt-24
      flex flex-wrap
      justify-center md:justify-start
      gap-6 sm:gap-8 md:gap-16
      text-[#f1e3b0]/95
    ">
      {[
        ["5+", "Years Experience"],
        ["100+", "Happy Brides"],
        ["100%", "Client Satisfaction"],
        ["50+", "Signature Looks"],
      ].map(([num, label]) => (
        <div key={label} className="flex flex-col text-center md:text-left">
          <strong className="text-3xl sm:text-4xl md:text-5xl font-[Playfair_Display] tracking-wide">
            {num}
          </strong>
          <span className="mt-1 text-xs sm:text-sm italic text-[#e6d39a]/90">
            {label}
          </span>
        </div>
      ))}
    </div>

  </div>
</div>
        </div>
      </motion.div>
    </section>
  );
}   