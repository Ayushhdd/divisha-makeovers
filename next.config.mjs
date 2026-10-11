/** @type {import('next').NextConfig} */
import { readFileSync } from 'node:fs';
const imageVersions = JSON.parse(readFileSync(new URL('./src/app/generated/image-versions.json', import.meta.url), 'utf8'));
const backendApiUrl = (process.env.BACKEND_API_URL || "http://localhost:5000/api").replace(
  /\/$/,
  ""
);

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  // These files are needed only at build time or run separately on Render.
  outputFileTracingExcludes: {
    '/*': ['./assets/site-images/**/*', './backend/**/*', './.local-logs/**/*', './portal-frontend/**/*'],
  },
  async rewrites() {
    return [
      { source: "/backend-api/:path*", destination: `${backendApiUrl}/:path*` },
      { source: "/portal", destination: "/portal/index.html" },
      { source: "/portal/divisha/:path*", destination: "/portal/index.html" },
      { source: "/portal/admin/:path*", destination: "/portal/index.html" },
    ];
  },
  images: {
    // Encode responsive images once, directly from original/lossless masters.
    formats: ["image/webp"],
    localPatterns: [...new Set(Object.keys(imageVersions).map(src => `/${src.split('/')[1]}/*`))]
      .map(pathname => ({ pathname })),
    deviceSizes: [360, 414, 640, 768, 960, 1080, 1280, 1536, 1920, 2048, 2560, 3072, 3840, 5120, 7680],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [90, 92, 95],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
