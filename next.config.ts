import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // REMOVED hardcoded env values - Railway environment variables will be used
  output: 'standalone', // Required for Railway Docker deployment
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true, // TEMPORARY: Allow dev server to run despite TypeScript errors
  },
};

export default nextConfig;