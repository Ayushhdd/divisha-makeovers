"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "@/app/components/SiteImage";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLockedBodyScroll } from "@/app/hooks/useLockedBodyScroll";

const images = [
  "/gallery/sgl.jpg",
  "/gallery/sgl1.jpg",
  "/gallery/sgl2.jpg",
  "/gallery/sgl6.jpg",
  "/gallery/sgl8.jpg",
  "/gallery/sgl7.jpg",
  
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragY, setDragY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const touchStartY = useRef(null);
  const pinchStartDistance = useRef(null);
  const pinchStartZoom = useRef(1);
  const selectedImage =
    selectedIndex === null ? null : images[selectedIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  useLockedBodyScroll(Boolean(selectedImage));

  const closeImage = useCallback(() => {
    setSelectedIndex(null);
    setZoom(1);
    setDragY(0);
    touchStartY.current = null;
    pinchStartDistance.current = null;
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, closeImage]);

  const openImage = (index) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      return;
    }

    setSelectedIndex(index);
    setZoom(1);
  };

  const getTouchDistance = (touches) => {
    const [first, second] = touches;
    return Math.hypot(
      first.clientX - second.clientX,
      first.clientY - second.clientY
    );
  };

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchStartDistance.current = getTouchDistance(event.touches);
      pinchStartZoom.current = zoom;
      return;
    }

    if (event.touches.length === 1) {
      touchStartY.current = event.touches[0].clientY;
      setDragY(0);
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length === 2 && pinchStartDistance.current) {
      event.preventDefault();
      const distance = getTouchDistance(event.touches);
      const nextZoom = pinchStartZoom.current * (distance / pinchStartDistance.current);
      setZoom(Math.min(1.7, Math.max(1, Number(nextZoom.toFixed(2)))));
      return;
    }

    if (event.touches.length === 1 && zoom <= 1.02 && touchStartY.current !== null) {
      setDragY(event.touches[0].clientY - touchStartY.current);
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistance.current = null;

    if (Math.abs(dragY) > 90 && zoom <= 1.02) {
      closeImage();
      return;
    }

    setDragY(0);
  };

  const lightbox = (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          data-floating-layer="true"
          className="fixed inset-0 z-[1000] flex h-[100dvh] min-h-[100svh] items-center justify-center bg-black/95 px-4 py-5 md:px-10 md:py-10"
          style={{ touchAction: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeImage}
          onTouchMove={(event) => event.preventDefault()}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10">
            <button
              type="button"
              aria-label="Close image"
              onClick={(event) => {
                event.stopPropagation();
                closeImage();
              }}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md"
            >
              <X size={16} />
            </button>
          </div>

          <motion.div
            className="flex h-full w-full touch-none items-center justify-center overflow-hidden"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            initial={{ scale: 0.96, y: 20 }}
            animate={{ scale: 1, y: dragY }}
            exit={{ scale: 0.96, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ scale: zoom }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative h-[calc(100dvh-4rem)] max-h-[92svh] w-full max-w-3xl"
            >
              <Image
                src={selectedImage}
                alt="Makeup Look"
                fill
                sizes="(max-width: 768px) 170vw, 900px"
                quality={95}
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <section className="relative py-20 md:py-32 text-white">
      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
            

          <h2 className="text-4xl mb-4 tracking-wide">
            Signature Looks
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            A curated collection of our bridal and glam transformations.
          </p>
        </motion.div>


        <div className="pink-glow top-1/2 right-10 hidden md:block"></div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
          {images.map((src, index) => (
            <motion.button
              type="button"
              key={index}
              onClick={() => openImage(index)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-sm md:backdrop-blur-md rounded-xl md:rounded-2xl text-left cursor-zoom-in md:cursor-default"
            >
              <div className="relative group overflow-hidden rounded-xl md:rounded-2xl">
                <Image
                  src={src}
                  alt="Makeup Look"
                  width={900}
                  height={1350}
                  sizes="(max-width: 768px) calc((100vw - 60px) / 2), (max-width: 1200px) calc((100vw - 112px) / 3), 352px"
                  quality={92}
                  className="
                    w-full h-auto object-cover
                    transition-transform duration-700 ease-out
                    group-hover:scale-110
                  "
                />

              </div>
            </motion.button>
          ))}
        </div>

      </div>

      {mounted ? createPortal(lightbox, document.body) : null}
    </section>
  );
}
