import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
   return [
    {
      source: '/api/static/:path*',
      destination: '/api/proxy/:path*'
    }
   ] 
  }
};

export default nextConfig;
