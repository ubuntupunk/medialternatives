import type { NextConfig } from 'next'

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Disable ESLint and TypeScript checking during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Try to optimize build performance
  compiler: {
    removeConsole: false,
  },

  // DO NOT REMOVE: Clean URL rewrites - remove /post/ prefix
  async rewrites() {
    return [
      // Rewrite clean URLs to /post/[slug] internally
      {
        source: '/:slug',
        destination: '/post/:slug',
      },
    ];
  },

  // DO NOT REMOVE: Basic image configuration
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
        hostname: 'medialternatives.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: 'paypal.com',
      }, 
      {
        protocol: 'https',
        hostname: 'www.paypal.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.creativecommons.org',
      },
      {
        protocol: 'https',
        hostname: 'meshring.netlify.app',
      },

    ],
  },

};

export default nextConfig;

