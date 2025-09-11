import { NextResponse } from 'next/server';
import { wordpressApi } from '@/services/wordpress-api';

/**
 * GET /api/feed/atom - Generate Atom feed from WordPress.com posts
 *
 * Creates a valid Atom XML feed using real posts from the WordPress.com API.
 * Includes proper metadata, content, and categories for feed readers.
 *
 * @returns {Promise<NextResponse>} Atom XML feed response
 */
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
    
    // Fetch latest posts from WordPress.com API
    const posts = await wordpressApi.getPosts({
      per_page: 20, // Get latest 20 posts for the feed
      _embed: true, // Include embedded data (featured images, authors, etc.)
      orderby: 'date',
      order: 'desc'
    });

    // Get site info for feed metadata
    const siteInfo = await wordpressApi.getSiteInfo();
    
    const currentDate = new Date().toISOString();
    const feedUpdated = posts.length > 0 ? posts[0].date : currentDate;

    // Helper function to escape XML content
    const escapeXml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // Helper function to strip HTML tags for summary
    const stripHtml = (html: string): string => {
      return html.replace(/<[^>]*>/g, '').trim();
    };

    // Generate entries for each post
    const entries = posts.map(post => {
      const postUrl = `${baseUrl}/${post.slug}`;
      const summary = stripHtml(post.excerpt?.rendered || '').substring(0, 200) + '...';
      const content = post.content?.rendered || '';
      
      // Extract categories and tags
      const categories = post._embedded?.['wp:term']?.[0] || [];
      const tags = post._embedded?.['wp:term']?.[1] || [];
      
      const categoryElements = [
        ...categories.map((cat: any) => `    <category term="${escapeXml(cat.name)}" scheme="${baseUrl}/category/${cat.slug}"/>`),
        ...tags.map((tag: any) => `    <category term="${escapeXml(tag.name)}" scheme="${baseUrl}/tag/${tag.slug}"/>`)
      ].join('\n');

      return `  <entry>
    <title>${escapeXml(post.title?.rendered || 'Untitled')}</title>
    <link href="${postUrl}" rel="alternate"/>
    <id>${postUrl}</id>
    <updated>${post.date}</updated>
    <published>${post.date}</published>
    <summary>${escapeXml(summary)}</summary>
    <content type="html">
      <![CDATA[${content}]]>
    </content>
${categoryElements}
  </entry>`;
    }).join('\n\n');

    // Generate complete Atom feed XML
    const atomFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteInfo?.name || 'Media Alternatives')}</title>
  <subtitle>${escapeXml(siteInfo?.description || 'Independent Media Activism and Analysis')}</subtitle>
  <link href="${baseUrl}/api/feed/atom" rel="self"/>
  <link href="${baseUrl}" rel="alternate"/>
  <updated>${feedUpdated}</updated>
  <id>${baseUrl}/api/feed/atom</id>
  <author>
    <name>David Robert Lewis</name>
    <email>david@medialternatives.com</email>
    <uri>${baseUrl}</uri>
  </author>
  <generator uri="https://nextjs.org/" version="15.3.4">Next.js</generator>
  <rights>© ${new Date().getFullYear()} Media Alternatives. All rights reserved.</rights>

${entries}
</feed>`;

    return new NextResponse(atomFeed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating Atom feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate Atom feed' },
      { status: 500 }
    );
  }
}