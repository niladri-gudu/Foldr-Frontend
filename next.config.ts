import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'n-drive-nalco-mumbai.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://foldr-backend.vercel.app/:path*',
        // destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
