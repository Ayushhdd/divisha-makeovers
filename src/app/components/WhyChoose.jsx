"use client";

import { motion } from "framer-motion";

export default function WhyChoose() {
  return (
    <section className="relative py-40 text-white overflow-hidden">

      {/* SUBTLE AMBIENT BLOOMS (MATCH ABOUT) */}
      <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-[#e7b6c3]/18 blur-[220px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-[#b76e79]/16 blur-[200px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        viewport={{ once: true }}
        className="
          relative
          max-w-[1400px]
          mx-auto
          px-14
          py-20
          rounded-[3rem]

         bg-[#5a3a3a]/65
backdrop-blur-[18px]
backdrop-saturate-[160%]
border border-white/10

          shadow-[0_60px_180px_rgba(30,10,10,0.55)]

          [mask-image:linear-gradient(to_bottom,transparent,black_2%,black_98%,transparent)]
        "
      >
        {/* TOP SOFT FADE (MATCH ABOUT) */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#3a2020]/40 to-transparent rounded-t-[3rem] pointer-events-none" />

        {/* GLASS SHEEN (MATCH ABOUT) */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-[#f2c6c6]/10 via-transparent to-[#2a1414]/40 pointer-events-none" />

        {/* CONTENT GRID */}
        <div className="relative grid md:grid-cols-2 gap-24 items-center z-10">

          {/* TEXT */}
          <div className="max-w-[680px] space-y-9 text-white/95 leading-[1.75] text-lg md:text-xl font-medium">
            <h2 className="text-4xl md:text-5xl mb-10 tracking-[0.18em] font-medium">
              Why Brides Choose Divisha
            </h2>

            <p>
              Bridal makeup is more than appearance — it is the quiet confidence
              of feeling{" "}
              <span className="text-[#f0d26d] font-semibold">
                comfortable, calm, and completely yourself
              </span>{" "}
              on one of the most meaningful days of your life.
            </p>

            <p>
              Divisha believes that the getting-ready process should feel{" "}
              <span className="text-[#f0d26d] font-semibold">
                unhurried and personal
              </span>,
              allowing brides to enjoy every moment instead of feeling rushed,
              anxious, or overwhelmed.
            </p>

            <p>
              Each look is thoughtfully crafted after understanding your{" "}
              <span className="text-[#f0d26d] font-semibold">
                features, outfit, and personal style
              </span>{" "}
              — so the final result feels like{" "}
              <span className="text-[#f0d26d] font-semibold">you</span>,
              only softer, refined, and more radiant.
            </p>

            <p>
              Only{" "}
              <span className="text-[#f0d26d] font-semibold">
                genuine professional products
              </span>{" "}
              are used, carefully selected according to your skin type to ensure
              comfort, longevity, and a flawless finish that looks beautiful
              both in person and on camera.
            </p>

            <p>
              To make the experience effortless, Divisha offers the convenience
              of{" "}
              <span className="text-[#f0d26d] font-semibold">
                travelling to your venue
              </span>,
              so you can get ready peacefully without worrying about time,
              movement, or logistics.
            </p>
          </div>

          {/* IMAGE */}
          <div className="flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
              <img
                src="/bridal-prep/bridalprep.jpg"
                alt="Bridal preparation moment"
                className="
                  w-[560px]
                  h-[720px]
                  object-cover
                  contrast-[1.05]
                  saturate-[1.08]
                "
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15" />
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
