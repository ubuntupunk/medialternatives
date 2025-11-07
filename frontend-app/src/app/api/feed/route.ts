import { NextResponse } from 'next/server';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { decodeHtmlEntities } from '@/utils/helpers';

/**
 * GET /api/feed - Generate RSS feed for the site
 * @returns {Promise<NextResponse>} RSS XML feed response
 */
export async function GET() {
  try {
    const posts = await wordpressApi.getPosts({ per_page: 20 });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
    
    const rssItems = posts.map(post => {
      const cleanTitle = decodeHtmlEntities(post.title.rendered);
      const cleanExcerpt = post.excerpt?.rendered 
        ? decodeHtmlEntities(post.excerpt.rendered.replace(/<[^>]*>/g, ''))
        : '';
      
      return `
    <item>
      <title><![CDATA[${cleanTitle}]]></title>
      <link>${baseUrl}/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${post.slug}</guid>
      <description><![CDATA[${cleanExcerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category><![CDATA[Media Activism]]></category>
      ${post._embedded?.author?.[0]?.name ? `<author>noreply@medialternatives.com (${post._embedded.author[0].name})</author>` : ''}
    </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${SITE_CONFIG.SITE_TITLE}]]></title>
    <description><![CDATA[${SITE_CONFIG.SITE_DESCRIPTION}]]></description>
    <link>${baseUrl}</link>
    <language>en-US</language>
    <managingEditor>noreply@medialternatives.com (Media Alternatives)</managingEditor>
    <webMaster>noreply@medialternatives.com (Media Alternatives)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js</generator>
    <image>
      <url>${baseUrl}/images/site-logo.svg</url>
      <title><![CDATA[${SITE_CONFIG.SITE_TITLE}]]></title>
      <link>${baseUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    
    // Return minimal RSS feed on error
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${SITE_CONFIG.SITE_TITLE}]]></title>
    <description><![CDATA[${SITE_CONFIG.SITE_DESCRIPTION}]]></description>
    <link>${baseUrl}</link>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;

    return new NextResponse(fallbackRss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
}