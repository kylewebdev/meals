import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.meals.kylewebdev.com',
      },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
