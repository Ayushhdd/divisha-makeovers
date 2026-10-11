/** @type {import('next').NextConfig} */
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
    // Display the original photo bytes; avoid lossy copies and old optimizer caches.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 70, 75, 78, 82, 86, 88, 90, 92],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
