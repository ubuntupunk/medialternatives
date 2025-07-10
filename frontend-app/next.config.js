/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint and TypeScript checking during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Basic image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'davidrobertlewis5.wordpress.com',
      }
    ],
  },
};

module.exports = nextConfig;