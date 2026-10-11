"use client";

import { getImageProps } from "next/image";
import { photoSource, viewportPhotoSize } from "./SiteImage";

export default function HeroBackground() {
  const common = { alt: "", fill: true, quality: 92, loading: "eager", fetchPriority: "high" };
  const { props: mobile } = getImageProps({ ...common,
    src: photoSource('/image-hero/hero-mobile.webp'), sizes: viewportPhotoSize('/image-hero/hero-mobile.webp', 1.05),
  });
  const { props: desktop } = getImageProps({ ...common,
    src: photoSource('/image-hero/hero2.jpg'), sizes: viewportPhotoSize('/image-hero/hero2.jpg'),
  });
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-[#4a3034]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#4e3838] via-[#6e4248] to-[#351c20]" />
      <picture>
        <source media="(max-width: 767px) and (orientation: portrait)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
      {/* getImageProps keeps the responsive desktop fallback and one eager request. */}
      <img
        {...desktop}
        alt=""
        className="
          object-cover
          md:object-center
          md:scale-100
          scale-[1.05]
          object-[75%_50%]
        "
      />
      </picture>

      {/* Same overlay you already liked */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
    </div>
  );
}
