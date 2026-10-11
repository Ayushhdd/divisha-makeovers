"use client";

import Image from "next/image";
import versions from "@/app/generated/image-versions.json";

export function photoSource(src) {
  const version = typeof src === "string" && versions[src]?.version;
  return version ? `${src}?v=${version}-responsive3` : src;
}

export function viewportPhotoSize(src, scale = 1) {
  const photo = versions[src];
  const heightWidth = photo ? Math.ceil(100 * scale * photo.width / photo.height) : 100;
  return `max(${100 * scale}vw, ${heightWidth}svh)`;
}

export default function SiteImage({ src, alt, quality = 92, coverViewport = false, sizes, ...props }) {
  return <Image {...props} alt={alt} src={photoSource(src)} quality={quality}
    sizes={coverViewport ? viewportPhotoSize(src) : sizes} />;
}
