import type { Metadata } from "next";
import { Copse, Quattrocento, Revalia, Quicksand, Roboto } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import Layout from "@/components/Layout/Layout"; // Import the custom Layout component

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
  keywords: ["media activism", "global south", "alternative media", "journalism"],
  authors: [{ name: "Medialternatives" }],
  creator: "Medialternatives",
  publisher: "Medialternatives",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://medialternatives.com",
    title: SITE_CONFIG.SITE_TITLE,
    description: SITE_CONFIG.SITE_DESCRIPTION,
    siteName: SITE_CONFIG.SITE_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.SITE_TITLE,
    description: SITE_CONFIG.SITE_DESCRIPTION,
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#e3e3e3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Medialternatives" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
          async
        />
      </head>
      <body className={`${copse.variable} ${quattrocento.variable} ${revalia.variable} ${quicksand.variable} ${roboto.variable}`}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
