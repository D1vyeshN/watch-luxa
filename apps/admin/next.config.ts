import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Allow browser preview for development ───
  allowedDevOrigins: ['127.0.0.1'],

  // ─── Transpile Refine + Ant Design for edge compatibility ───
  transpilePackages: [
    '@refinedev/core',
    '@refinedev/antd',
    '@refinedev/nextjs-router',
    '@ant-design/icons',
    'antd',
  ],

  // ─── Tree-shake Ant Design + Refine imports ───
  experimental: {
    optimizePackageImports: [
      '@refinedev/core',
      '@refinedev/antd',
      '@refinedev/nextjs-router',
      '@ant-design/icons',
      'antd',
    ],
  },

  // ─── Strip dev-only React props + console in prod ───
  compiler: {
    reactRemoveProperties: true,
    removeConsole: { exclude: ['error', 'warn'] },
  },

  // ─── Security headers ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
