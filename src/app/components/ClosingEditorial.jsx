"use client";

import { Instagram, Facebook, MessageCircle, Mail, MapPin, Phone } from "lucide-react";


export default function ClosingEditorial() {
  return (
    <footer className="relative w-screen min-h-screen bg-[#0b0b0c] text-white pt-36 pb-4 overflow-hidden">

      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black pointer-events-none" />

      {/* CONTENT GRID */}
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-24">

        {/* BRAND */}
        <div className="relative">
          <div className="absolute -inset-6 bg-pink-500/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="relative text-2xl md:text-3xl tracking-[0.35em] font-medium mb-6 md:mb-8">
            DIVISHA
          </h2>
          <p className="relative text-white/60 text-base leading-[2] max-w-sm">
            A calm, luxury bridal makeup experience focused on elegance,
            confidence, and timeless beauty.
          </p>
        </div>

        {/* EXPLORE */}
        <div>
          <h4 className="text-xl mb-8 relative inline-block font-medium">
            Explore
            <span className="absolute left-0 -bottom-2 w-10 h-[1px] bg-pink-500" />
          </h4>

          <ul className="space-y-4 text-white/65 text-base">
            {[
              { label: "Services", href: "/#services" },
              { label: "Gallery", href: "/#gallery" },
              { label: "Why Choose Us", href: "/#why-choose" },
              { label: "Testimonials", href: "/#testimonials" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="relative inline-block transition-colors duration-300 hover:text-white
                  after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1px]
                  after:bg-pink-500 after:transition-all hover:after:w-full"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CONNECT */}
        <div>
          <h4 className="text-xl mb-8 relative inline-block font-medium">
            Connect
            <span className="absolute left-0 -bottom-2 w-14 h-[1px] bg-pink-500" />
          </h4>

          <ul className="space-y-5 text-white/65 text-base">
            <li>
              <a
                href="https://www.instagram.com/divishamakeovers/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-white transition group"
              >
                <Instagram size={18} className="text-pink-400 group-hover:scale-110 transition" />
                Instagram
              </a>
            </li>



<li>
  <a
    href="https://www.facebook.com/divishamakeovers/"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 hover:text-white transition group"
    aria-label="Facebook"
  >
    <Facebook
      size={18}
      className="text-pink-400 group-hover:scale-110 transition"
    />
    Facebook
  </a>
</li>





            <li>
              <a
  href="https://wa.me/916280879548?text=Hello%20Divisha%20Makeovers,%20I%20would%20like%20to%20enquire%20about%20your%20makeup%20services%20and%20availability."
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-3 hover:text-white transition group"
  aria-label="WhatsApp"
>
  <MessageCircle size={18} className="text-pink-400 group-hover:scale-110 transition" />
  <span>WhatsApp</span>
</a>

            </li>

            <li>
              <a
                href="mailto:divishamakeovers5@gmail.com"
                className="flex items-center gap-3 hover:text-white transition group"
              >
<Mail size={18} className="text-pink-400 group-hover:scale-110 transition" />
                Email
              </a>
            </li>
          </ul>
        </div>

        {/* CONTACT (RESTORED) */}
        <div>
          <h4 className="text-xl mb-8 relative inline-block font-medium">
            Contact
            <span className="absolute left-0 -bottom-2 w-10 h-[1px] bg-pink-500" />
          </h4>

         <ul className="space-y-5 text-white/65 text-base">
  <li className="flex items-center gap-3">
    <MapPin strokeWidth={2.2} className="w-4 h-4 text-pink-400" />
    Jalandhar, Punjab
  </li>

  <li className="flex items-center gap-3">
    <Phone strokeWidth={2.2} className="w-4 h-4 text-pink-400" />
    +91 6280879548
  </li>

  <li className="flex items-center gap-3">
    <Mail strokeWidth={2.2} className="w-4 h-4 text-pink-400" />
    divishamakeovers5@gmail.com
  </li>
</ul>


        </div>

      </div>

      {/* DIVIDER */}
      <div className="mt-28 border-t border-white/10" />

      {/* BOTTOM BAR */}
      <div className="max-w-[1300px] mx-auto px-6 md:px-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-white/45">
        <p>© {new Date().getFullYear()} Divisha Makeovers. All rights reserved.</p>
        <p className="mt-2 md:mt-0 tracking-widest">Designed with elegance.</p>
      </div>

    </footer>
  );
}
