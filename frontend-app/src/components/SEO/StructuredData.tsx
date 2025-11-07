import React from 'react';
import { WordPressPost } from '@/types/wordpress';
import { getFeaturedImageUrl, getPostAuthor, decodeHtmlEntities } from '@/utils/helpers';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Breadcrumb item interface
 * @typedef {Object} BreadcrumbItem
 * @property {string} name - Display name of the breadcrumb
 * @property {string} url - URL path for the breadcrumb
 */

/**
 * Structured data props interface
 * @typedef {Object} StructuredDataProps
 * @property {WordPressPost} [post] - WordPress post data for article schema
 * @property {'article'|'website'|'organization'|'breadcrumb'} [type='website'] - Type of structured data to generate
 * @property {BreadcrumbItem[]} [breadcrumbs] - Breadcrumb navigation data
 */

/**
 * Structured Data Component
 *
 * Generates JSON-LD structured data for SEO and rich snippets.
 * Supports Organization, Website, Article, and Breadcrumb schemas.
 * Automatically generates appropriate schema based on content type and data.
 *
 * @component
 * @param {StructuredDataProps} props - Component props
 * @returns {JSX.Element} Script tags with JSON-LD structured data
 *
 * @example
 * ```tsx
 * // For a website homepage
 * <StructuredData type="website" />
 * ```
 *
 * @example
 * ```tsx
 * // For a blog post
 * <StructuredData
 *   post={postData}
 *   type="article"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With breadcrumbs
 * <StructuredData
 *   type="breadcrumb"
 *   breadcrumbs={[
 *     { name: "Home", url: "/" },
 *     { name: "Articles", url: "/articles" },
 *     { name: "Current Article", url: "/articles/current" }
 *   ]}
 * />
 * ```
 */
export default function StructuredData({ post, type = 'website', breadcrumbs }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
  
  const generateStructuredData = () => {
    const structuredData: any[] = [];

    // Organization Schema
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": SITE_CONFIG.SITE_TITLE,
      "description": SITE_CONFIG.SITE_DESCRIPTION,
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/site-logo.svg`,
        "width": 200,
        "height": 60
      },
      "sameAs": [
        // Add your social media profiles here
        // "https://twitter.com/medialternatives",
        // "https://facebook.com/medialternatives"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "editorial",
        "email": "contact@medialternatives.com"
      }
    };
    structuredData.push(organization);

    // Website Schema
    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE_CONFIG.SITE_TITLE,
      "description": SITE_CONFIG.SITE_DESCRIPTION,
      "url": baseUrl,
      "publisher": {
        "@type": "Organization",
        "name": SITE_CONFIG.SITE_TITLE
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
    structuredData.push(website);

    // Article Schema (for blog posts)
    if (post && type === 'article') {
      const author = getPostAuthor(post);
      const featuredImage = getFeaturedImageUrl(post);
      
      const article = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": decodeHtmlEntities(post.title.rendered),
        "description": post.excerpt?.rendered 
          ? decodeHtmlEntities(post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160))
          : `Read ${decodeHtmlEntities(post.title.rendered)} on ${SITE_CONFIG.SITE_TITLE}`,
        "url": `${baseUrl}/${post.slug}`,
        "datePublished": post.date,
        "dateModified": post.modified,
        "author": {
          "@type": "Person",
          "name": author?.name || "Media Alternatives",
          "url": author ? `${baseUrl}/author/${author.slug}` : baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_CONFIG.SITE_TITLE,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/images/site-logo.svg`,
            "width": 200,
            "height": 60
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${baseUrl}/${post.slug}`
        }
      };

      // Add featured image if available
      if (featuredImage) {
        article.image = {
          "@type": "ImageObject",
          "url": featuredImage,
          "width": 800,
          "height": 400
        };
      }

      // Add article body (first 500 chars)
      if (post.content?.rendered) {
        const textContent = post.content.rendered.replace(/<[^>]*>/g, '').substring(0, 500);
        article.articleBody = decodeHtmlEntities(textContent);
      }

      structuredData.push(article);
    }

    // Breadcrumb Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": `${baseUrl}${crumb.url}`
        }))
      };
      structuredData.push(breadcrumbList);
    }

    return structuredData;
  };

  const structuredData = generateStructuredData();

  return (
    <>
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 2)
          }}
        />
      ))}
    </>
  );
}