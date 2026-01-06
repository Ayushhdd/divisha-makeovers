"use client";

export default function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      
      {/* Background Image */}
      <div
        className="
          absolute inset-0
          bg-[url('/image-hero/hero2.jpg')]
          bg-no-repeat
          bg-cover

          /* DESKTOP – DO NOT TOUCH */
          md:bg-center
          md:scale-100

          /* MOBILE – PRECISE CONTROL */
          scale-[1.05]
          bg-[75%_50%]

          will-change-transform
        "
      />

      {/* Same overlay you already liked */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
    </div>
  );
}
