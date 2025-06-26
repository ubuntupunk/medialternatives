import type { Metadata } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";

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
      <body>
        {children}
      </body>
    </html>
  );
}
