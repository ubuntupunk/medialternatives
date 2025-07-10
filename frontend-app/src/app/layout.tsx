import type { Metadata } from "next";
import { Copse, Quattrocento, Revalia } from "next/font/google";
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
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
          async
        />
      </head>
      <body className={`${copse.variable} ${quattrocento.variable} ${revalia.variable}`}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
