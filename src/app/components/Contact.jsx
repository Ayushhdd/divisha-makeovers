"use client";

import { motion } from "framer-motion";
import { useState } from "react";


export default function Contact() {



  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage = `
Hello Divisha Makeovers,
My name is ${formData.name}.
Email: ${formData.email}
Event Date: ${formData.date}
Event Details: ${formData.message}
    `;

    const whatsappURL = `https://wa.me/916280879548?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappURL, "_blank");
  };



  return (
<section className="relative pt-16 pb-24 md:py-24 text-white overflow-hidden">

      {/* Fade from testimonials */}
<div className="absolute top-0 left-0 w-full h-16 sm:h-24 md:h-48 bg-gradient-to-b from-black to-transparent z-0"></div>


      {/* Ambient Pink Glow */}
<div className="pink-glow top-1/3 left-1/2 -translate-x-1/2 opacity-40"></div>


      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
         <h2 className="text-4xl mb-4 tracking-wide font-light">
  Book Your Appointment
</h2>
<p className="text-white/60 max-w-xl mx-auto">
  Let us be a part of your special day. Get in touch to check availability.
</p>

        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
         className="
  bg-white/5
  backdrop-blur-2xl
  border border-white/10
  rounded-3xl
p-6 sm:p-8 md:p-12
  max-w-3xl
  mx-auto
  shadow-[0_0_120px_rgba(236,72,153,0.18)]
"


        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">

           <input
  type="text"
  name="name"
  placeholder="Your Name"
  required
  onChange={handleChange}
  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-pink-400"
/>

            <input
  type="email"
  name="email"
  placeholder="Email Address"
  required
  onChange={handleChange}
  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-pink-400"
/>

            <input
  type="text"
  name="date"
  placeholder="Event Date"
  required
  onChange={handleChange}
  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-pink-400"
/>

            <textarea
  name="message"
  placeholder="Tell us about your event"
  rows="4"
  required
  onChange={handleChange}
  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-pink-400"
/>


            <button
              type="submit"
              className="
  bg-pink-500/90
  hover:bg-pink-600
  transition-all duration-500
  py-3
  rounded-full
  tracking-widest uppercase text-sm
  shadow-[0_0_40px_rgba(236,72,153,0.4)]
"

            >
              Send Enquiry
            </button>
          </form>

          {/* WhatsApp */}
          <div className="text-center mt-8 text-white/70">
            Or WhatsApp us directly at  
            <a
href="https://wa.me/916280879548"
              target="_blank"
              className="block text-pink-400 mt-2 hover:underline"
            >
            +91 6280879548
            </a>
          </div>
        </motion.div>

      </div>


      {/* Fade into footer */}
<div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 md:h-40 bg-gradient-to-b from-transparent to-black"></div>

    </section>
  );
}
