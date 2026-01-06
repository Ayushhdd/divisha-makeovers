"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const testimonials = [
  {
    quote:
      "I found Divisha on Instagram and booked her for my engagement and bridal makeup without ever meeting her before—and it was the best decision I made! She understood exactly what I wanted, made me feel so comfortable, and created the perfect looks for both days.Her makeup was flawless, long-lasting, and enhanced my natural features beautifully. She was punctual, professional, and has such a calm, positive energy that truly made my special days even better.I’m so grateful for her amazing work. If you’re looking for someone who delivers perfection with heart, I highly recommend Divisha Makeover! 💖",
    author: "Dr. Yashika",
    event: "Wedding Day",
    link: "https://share.google/BuIJHbvK8pmINcNoG",
  },
  {
    quote:
      "Mne Divisha makeovers se shagun makeup krvaya she gave me very cute pretty barbie look....makeup stay was veryyyyy good...All products are international branded......Her nature and her team nature were very calm and they gave as family environment.........I loved her makeup very much....thanku sooo much for make my special day more special 😘",
    author: "Chahat K.",
    event: "Engagement",
    link: "https://share.google/6kB7I0wvRdAIBXEVT",
  },
  {
    quote:
      "I got my frst karwachauth makeup from Divisha makeovers .It was fabulous and amazing look she gave to me.she made my day everyone gave me beautiful complements thanks to divisha makeover.may god give u higher success and our blessing always be with you ❤️",
    author: "Mansi",
    event: "Party Event",
    link: "https://share.google/ltgTFBLcHCf46k59Z",
  },
  {
    quote:
      "Divisha is super chill and really talented. Her makeup skills are on another level, and she always knows how to make you feel fabulous! I got my nails done with her, and they turned out so cute! She's definitely someone you want to go to for a glam-up!",
    author: "Prabhnoor Kaur",
    event: "Nail Extensions",
    link: "https://share.google/FoSk7UztoXVEaWbU1",
  },
  {
    quote:
      "I’m so delighted with the amazing work done by Divisha Makeover for my daughter-in-law! From the beautiful South Indian engagement look to the stunning bridal makeover, every detail was handled with such professionalism and talent.Her makeup was flawless, elegant, and perfectly suited for each occasion. Divisha understood exactly what we wanted and enhanced her natural beauty without overdoing anything. The hairstyles, jewelry setting, and overall finish were simply perfect.Thank you, Divisha, for making both events truly memorable. I highly recommend Divisha Makeover to anyone looking for a skilled, reliable, and creative makeup artist!",
    author: "Rekha Rani.",
    event: "Wedding Event",
    link: "https://share.google/FK36jrf388M2x2hMj",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setIndex(
      (prev) =>
        (prev + newDirection + testimonials.length) % testimonials.length
    );
  };

  return (
<section className="relative pt-40 pb-24 md:py-44 text-white bg-black overflow-hidden">

      <div className="max-w-6xl mx-auto px-6">

        {/* PINK FRAME */}
        <div
          className="relative rounded-[3rem] px-6 py-14 sm:px-10 sm:py-20 md:px-16 md:py-24"
          style={{
            border: "4px solid rgba(236,72,153,0.75)",
            boxShadow: "0 0 60px rgba(236,72,153,0.25)",
          }}
        >
         <button
  onClick={() => paginate(-1)}
  className="
    absolute left-4 top-1/2 -translate-y-1/2
    z-50
    text-pink-400 text-3xl
    p-3
    touch-manipulation
    pointer-events-auto
    md:left-6 md:text-3xl
    hover:scale-110 transition
  "
>
  ‹
</button>


          <button
  onClick={() => paginate(1)}
  className="
    absolute right-4 top-1/2 -translate-y-1/2
    z-50
    text-pink-400 text-3xl
    p-3
    touch-manipulation
    pointer-events-auto
    md:right-6 md:text-3xl
    hover:scale-110 transition
  "
>
  ›
</button>


          {/* CONTENT */}
          <div className="relative max-w-3xl mx-auto text-center">

            {/* SECTION TITLE */}
            <h2 className="text-2xl md:text-3xl tracking-wider mb-20">
              What Brides Say
            </h2>

            <AnimatePresence mode="wait" custom={direction}>
             <motion.div
  className="mx-auto max-w-full sm:max-w-3xl pointer-events-none md:pointer-events-auto"


                key={index}
                custom={direction}
                initial={{
                  x: direction > 0 ? 120 : -120,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                exit={{
                  x: direction > 0 ? -120 : 120,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                }}
              >
                {/* QUOTE */}
                <blockquote className="text-base sm:text-lg md:text-2xl leading-[1.7] text-white/90 mb-8">
                  “{testimonials[index].quote}”
                </blockquote>

                {/* META */}
                <div className="flex flex-col items-center gap-1 text-xs tracking-wide">
                  <span>{testimonials[index].author}</span>
                  <span className="text-white/50">
                    {testimonials[index].event}
                  </span>
                  <a
                    href={testimonials[index].link}
                    target="_blank"
                    className="text-pink-300 mt-2 hover:underline"
                  >
                    View on Google ↗
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* INDICATOR DOTS */}
            <div className="flex justify-center gap-3 mt-14">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === index
                      ? "bg-pink-400 scale-125"
                      : "bg-white/30"
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
