"use client";

import { motion } from "framer-motion";

const services = [
  {
    title: "Bridal Makeup Packages",
    desc: "Signature bridal looks designed for timeless elegance, flawless finish, and all-day confidence on your most important day.",
    slug: "bridal",
     image: "/gallery/sgl1.jpg",
  },
  {
    title: "Engagement/Reception Makeup Packages",
    desc: "Soft to glamorous makeup looks curated for engagements, receptions, and pre-wedding celebrations with a refined, natural glow.",
    slug: "engagement&reception",
    image: "/hover/engagement.jpg",
  },
  {
    title: "Party Makeup Packages",
    desc: "Elegant and glamorous makeup tailored for parties, festivities, and special occasions where you want to stand out effortlessly.",
    slug: "party",
      image: "/hover/party.jpg",
  },
  {
    title: "Nail Extensions",
    desc: "Luxury nail art and grooming services crafted to complement your overall look with clean, polished, and stylish finishes.",
   slug: "nails",
    image: "/hover/nails.webp",
  },
];


export default function Services() {
  return (
    <section className="relative text-white py-24 overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2
  className="
    text-3xl md:text-4xl mb-6 
    tracking-[0.28em] uppercase font-medium
    bg-gradient-to-r from-white via-pink-200 to-white
    bg-clip-text text-transparent
    drop-shadow-[0_2px_10px_rgba(255,192,203,0.25)]
  "
>
  Signature Beauty Services
</h2>

<div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-pink-300/70 to-transparent mx-auto mb-6"></div>

          <p className="text-white/70 max-w-xl mx-auto leading-relaxed">
            Tailored luxury makeup services designed to blend seamlessly
            with your personality, style, and special moments.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr">


          {services.map((service, index) => (
           <motion.a
  key={index}
  href={`/services/${service.slug}`}
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: index * 0.12 }}
  viewport={{ once: true }}
  className="
    group
    relative
    block
    rounded-[2.2rem]
p-9
overflow-hidden
min-h-[260px] md:min-h-[300px]
bg-gradient-to-br from-[#6b4242]/70 via-[#5a3a3a]/65 to-[#4a2e2e]/70
backdrop-blur-[20px]
backdrop-saturate-150
border border-white/15

    transition-all
    duration-700
    hover:-translate-y-2
    hover:scale-[1.01]

    hover:border-pink-400/60
    hover:shadow-[0_35px_90px_rgba(236,72,153,0.28)]
  "
>
  {/* HOVER IMAGE LAYER */}
<div
  className="
    absolute
    bottom-0
    right-0
    w-[100%]
    h-[100%]
    bg-cover
    bg-no-repeat
    opacity-0
    scale-[1.05]
    transition-all
    duration-700
    group-hover:opacity-100
    group-hover:scale-100
    pointer-events-none
    rounded-tl-[2rem]
  "
  style={{
    backgroundImage: `url(${service.image})`,
    backgroundPosition: "60% 40%", // 👈 KEY LINE
    maskImage:
      "linear-gradient(to top left, rgba(0,0,0,1), rgba(0,0,0,0))",
    WebkitMaskImage:
      "linear-gradient(to top left, rgba(0,0,0,1), rgba(0,0,0,0))",
  }}
/>


{/* INNER LUXURY SHEEN */}
<div className="
  absolute inset-0
  rounded-[2.2rem]
  bg-gradient-to-br from-white/6 via-transparent to-transparent
  opacity-40
  pointer-events-none
" />





  {/* CONTENT (always above image) */}
  <div className="relative z-10">
    <h3 className="text-xl md:text-2xl mb-3 tracking-[0.04em] font-medium">
      {service.title}
    </h3>

    <p className="text-white/75 leading-relaxed max-w-md">
      {service.desc}
    </p>

    <span className="inline-block mt-6 text-sm tracking-wider text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
      View Packages →
    </span>
  </div>
</motion.a>

          ))}
        </div>

      </div>
    </section>
  );
}
