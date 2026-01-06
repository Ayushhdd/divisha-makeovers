"use client";

import { motion } from "framer-motion";

const images = [
  "/gallery/sgl.jpg",
  "/gallery/sgl1.jpg",
  "/gallery/sgl2.jpg",
  "/gallery/sgl6.jpg",
  "/gallery/sgl8.jpg",
  "/gallery/sgl7.jpg",
  
];

export default function Gallery() {
  return (
    <section className="relative py-32 text-white">
      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
            

          <h2 className="text-4xl mb-4 tracking-wide">
            Signature Looks
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            A curated collection of our bridal and glam transformations.
          </p>
        </motion.div>


        <div className="pink-glow top-1/2 right-10"></div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-md rounded-2xl"
            >
              <div className="relative group overflow-hidden rounded-2xl">
               <img
  src={src}
  alt="Makeup Look"
  className="
    w-full h-full object-cover
    transition-transform duration-700 ease-out
    group-hover:scale-110
  "
/>


               
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
