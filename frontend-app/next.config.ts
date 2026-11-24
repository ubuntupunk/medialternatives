import type { NextConfig } from 'next'

// PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Force enable PWA for debugging
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/public-api\.wordpress\.com\/wp\/v2\/sites\/.*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'wordpress-api',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^\/post\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'posts',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /^\/$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'homepage',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});

const unoptimizedImages = process.env.NEXT_IMAGE_UNOPTIMIZED === 'true';

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

  // Vercel-only rewrites moved here so Cloudflare Workers gets the same routes.
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/feed.xml',
        destination: '/api/feed',
      },
      // DO NOT REMOVE: Clean URL rewrites - remove /post/ prefix
      {
        source: '/:slug',
        destination: '/post/:slug',
      },
    ];
  },

  // Mirror vercel.json headers on any platform that runs Next.js.
  async headers() {
    return [
      {
        source: '/:path*\\.(jpg|jpeg|png|gif|svg|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // DO NOT REMOVE: Basic image configuration
  images: {
    unoptimized: unoptimizedImages,
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
        hostname: 'paypalobjects.com',
      },
      {
        protocol: 'https',
        hostname: 'www.paypalobjects.com',
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
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },

    ],
  },

};

export default withPWA(nextConfig);

