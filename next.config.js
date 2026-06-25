/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tree-shake large barrel-file packages so only the icons/components actually
  // used are bundled (smaller JS, faster first load).
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Strip the X-Powered-By header.
  poweredByHeader: false,
  // Smaller, modern image formats when next/image is used.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
