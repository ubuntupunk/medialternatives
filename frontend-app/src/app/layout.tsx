import type { Metadata } from "next";
import { Copse, Quattrocento, Revalia, Quicksand, Roboto } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import Layout from "@/components/Layout/Layout"; // Import the custom Layout component
import StructuredData from "@/components/SEO/StructuredData";
import { WordPressAuthProvider } from "@/contexts/WordPressAuthContext";

// Configure Google Fonts
const copse = Copse({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-copse'
});

const quattrocento = Quattrocento({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quattrocento'
});

const revalia = Revalia({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-revalia'
});

// Handbook fonts
const quicksand = Quicksand({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand'
});

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.SITE_TITLE,
    template: `%s | ${SITE_CONFIG.SITE_TITLE}`
  },
  description: SITE_CONFIG.SITE_DESCRIPTION,
  keywords: [
    "media activism",
    "journalism", 
    "south africa",
    "digital storytelling",
    "media literacy",
    "citizen journalism",
    "alternative media",
    "press freedom",
    "media ethics",
    "investigative journalism",
    "global south"
  ],
  authors: [{ name: "Media Alternatives" }],
  creator: "Media Alternatives",
  publisher: "Media Alternatives",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: `${SITE_CONFIG.SITE_TITLE} RSS Feed` }
      ]
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: SITE_CONFIG.SITE_TITLE,
    description: SITE_CONFIG.SITE_DESCRIPTION,
    siteName: SITE_CONFIG.SITE_TITLE,
    images: [
      {
        url: '/images/site-logo.svg',
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.SITE_TITLE,
    description: SITE_CONFIG.SITE_DESCRIPTION,
    site: '@medialternatives',
    creator: '@medialternatives',
    images: ['/images/site-logo.svg'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Viewport and Mobile Configuration */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0031FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Media Alternatives" />
        <meta name="msapplication-TileColor" content="#0031FF" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://public-api.wordpress.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//googleads.g.doubleclick.net" />
        
        {/* Language and Locale */}
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="geo.region" content="ZA" />
        <meta name="geo.country" content="South Africa" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Bootstrap JS */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
          async
        />
        
        {/* Structured Data for Organization and Website */}
        <StructuredData type="website" />
      </head>
      <body className={`${copse.variable} ${quattrocento.variable} ${revalia.variable} ${quicksand.variable} ${roboto.variable}`}>
        <WordPressAuthProvider>
          <Layout>
            {children}
          </Layout>
        </WordPressAuthProvider>
      </body>
    </html>
  );
}
