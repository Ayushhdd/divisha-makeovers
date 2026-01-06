"use client";
import { motion } from "framer-motion";

export default function PriceGateModal({ onClose, onSuccess }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0b0b0c] border border-white/20 rounded-3xl p-10 w-full max-w-md text-white"
      >
        <h2 className="text-2xl mb-4 tracking-wide">
          Unlock Pricing
        </h2>

        <p className="text-white/60 mb-6 text-sm">
          Please share a few details to view our exclusive packages.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSuccess();
          }}
          className="space-y-4"
        >
          <input
            required
            placeholder="Full Name"
            className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3"
          />

          <input
            required
            placeholder="Phone / WhatsApp"
            className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3"
          />

          <select
            required
            className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3"
          >
            <option value="">Occasion</option>
            <option>Bridal</option>
            <option>Engagement</option>
            <option>Party</option>
          </select>

          <button
            type="submit"
            className="w-full bg-pink-500 py-3 rounded-full tracking-widest uppercase text-sm"
          >
            View Prices
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-6 text-white/40 text-xs tracking-widest"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
