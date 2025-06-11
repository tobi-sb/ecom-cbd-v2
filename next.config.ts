import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['mlghexxbhunsxmhbypkr.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mlghexxbhunsxmhbypkr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
  // Optimize for Vercel deployment
  experimental: {
    optimizePackageImports: ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons'],
  },
};

export default nextConfig;
