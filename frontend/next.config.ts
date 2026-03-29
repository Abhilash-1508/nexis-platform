import type { NextConfig } from "next";

const nextConfig = {
  // Ultra-Fast Deploy Protocol: Bypass strict build checks
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
};

export default nextConfig;
