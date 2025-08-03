import Head from 'next/head';
import { WordPressPost } from '@/types/wordpress';
import { getFeaturedImageUrl, getPostAuthor, decodeHtmlEntities } from '@/utils/helpers';
import { SITE_CONFIG } from '@/lib/constants';

interface MetaTagsProps {
  title?: string;
  description?: string;
  post?: WordPressPost;
  canonical?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

export default function MetaTags({ 
  title, 
  description, 
  post, 
  canonical, 
  noindex = false,
  type = 'website' 
}: MetaTagsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
  
  // Generate meta data
  const metaTitle = title || (post ? `${decodeHtmlEntities(post.title.rendered)} - ${SITE_CONFIG.SITE_TITLE}` : SITE_CONFIG.SITE_TITLE);
  const metaDescription = description || (post?.excerpt?.rendered 
    ? decodeHtmlEntities(post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160))
    : SITE_CONFIG.SITE_DESCRIPTION);
  const metaUrl = canonical || (post ? `${baseUrl}/${post.slug}` : baseUrl);
  const metaImage = post ? getFeaturedImageUrl(post) : `${baseUrl}/images/site-logo.svg`;
  const author = post ? getPostAuthor(post) : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={metaUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={SITE_CONFIG.SITE_TITLE} />
      <meta property="og:locale" content="en_US" />
      {metaImage && <meta property="og:image" content={metaImage} />}
      {metaImage && <meta property="og:image:width" content="800" />}
      {metaImage && <meta property="og:image:height" content="400" />}
      {metaImage && <meta property="og:image:alt" content={metaTitle} />}
      
      {/* Article specific Open Graph */}
      {post && type === 'article' && (
        <>
          <meta property="article:published_time" content={post.date} />
          <meta property="article:modified_time" content={post.modified} />
          {author && <meta property="article:author" content={author.name} />}
          <meta property="article:section" content="Media Activism" />
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
      <meta name="twitter:site" content="@medialternatives" />
      {author && <meta name="twitter:creator" content={`@${author.slug}`} />}
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content={author?.name || SITE_CONFIG.SITE_TITLE} />
      <meta name="publisher" content={SITE_CONFIG.SITE_TITLE} />
      <meta name="theme-color" content="#0031FF" />
      
      {/* Language and Region */}
      <meta httpEquiv="content-language" content="en-US" />
      <meta name="geo.region" content="ZA" />
      <meta name="geo.country" content="South Africa" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://public-api.wordpress.com" />
      
      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title={`${SITE_CONFIG.SITE_TITLE} RSS Feed`} href={`${baseUrl}/feed.xml`} />
      
      {/* Article specific meta */}
      {post && (
        <>
          <meta name="article:published_time" content={post.date} />
          <meta name="article:modified_time" content={post.modified} />
          <meta name="article:tag" content="media activism, journalism, south africa" />
        </>
      )}
    </Head>
  );
}