import type { NextConfig } from "next";

const config: NextConfig = {
  // ─── Image optimization ───
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ─── Compression ───
  compress: true,

  // ─── Redirects ───
  async redirects() {
    return [
      { source: '/watches', destination: '/shop', permanent: true },
      { source: '/watch/:slug', destination: '/product/:slug', permanent: true },
      { source: '/collection/:slug', destination: '/collections/:slug', permanent: true },
    ];
  },

  // ─── Headers ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ─── Performance ───
  experimental: {
    optimizePackageImports: ['lucide-react', '@reduxjs/toolkit'],
  },

  // ─── Dev ───
  allowedDevOrigins: ['127.0.0.1'],

  // ─── Type safety ───
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default config;
