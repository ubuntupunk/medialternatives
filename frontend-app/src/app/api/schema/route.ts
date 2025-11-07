import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * GET /api/schema - Generate Schema.org structured data
 *
 * Returns comprehensive Schema.org JSON-LD structured data for SEO.
 * Includes organization, website, webpage, and blog schema definitions.
 *
 * @returns {Promise<NextResponse>} Schema.org JSON-LD data with proper headers
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
  
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": SITE_CONFIG.SITE_TITLE,
        "description": SITE_CONFIG.SITE_DESCRIPTION,
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/images/site-logo.svg`,
          "width": 200,
          "height": 60
        },
        "foundingDate": "2006",
        "foundingLocation": {
          "@type": "Place",
          "name": "South Africa"
        },
        "areaServed": {
          "@type": "Country",
          "name": "South Africa"
        },
        "knowsAbout": [
          "Media Activism",
          "Journalism",
          "Digital Storytelling",
          "Press Freedom",
          "Media Literacy",
          "Investigative Journalism",
          "Alternative Media",
          "Citizen Journalism"
        ],
        "sameAs": [
          // Add your social media profiles
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "editorial",
          "email": "contact@medialternatives.com",
          "availableLanguage": ["English"]
        }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": SITE_CONFIG.SITE_TITLE,
        "description": SITE_CONFIG.SITE_DESCRIPTION,
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "inLanguage": "en-US",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        "url": baseUrl,
        "name": SITE_CONFIG.SITE_TITLE,
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "about": {
          "@id": `${baseUrl}/#organization`
        },
        "description": SITE_CONFIG.SITE_DESCRIPTION,
        "inLanguage": "en-US"
      },
      {
        "@type": "Blog",
        "@id": `${baseUrl}/blog#blog`,
        "url": `${baseUrl}/blog`,
        "name": `${SITE_CONFIG.SITE_TITLE} Blog`,
        "description": "Latest articles on media activism, journalism, and digital storytelling from South Africa",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "inLanguage": "en-US",
        "about": [
          {
            "@type": "Thing",
            "name": "Media Activism"
          },
          {
            "@type": "Thing", 
            "name": "Journalism"
          },
          {
            "@type": "Thing",
            "name": "Digital Storytelling"
          }
        ]
      }
    ]
  };

  return NextResponse.json(schema, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=86400' // 24 hours
    }
  });
}