import type { NextConfig } from 'next'

// PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
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

export default withPWA(nextConfig);

