import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return mock Atom feed data
    // TODO: Fetch real posts from WordPress.com API and generate proper Atom XML

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
    const currentDate = new Date().toISOString();

    // Mock Atom feed XML
    const atomFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Media Alternatives</title>
  <subtitle>Independent Media Activism and Analysis</subtitle>
  <link href="${baseUrl}/feed/atom" rel="self"/>
  <link href="${baseUrl}" rel="alternate"/>
  <updated>${currentDate}</updated>
  <id>${baseUrl}/feed/atom</id>
  <author>
    <name>David Robert Lewis</name>
    <email>david@medialternatives.com</email>
  </author>

  <entry>
    <title>Sample Article: Media Consolidation and Democracy</title>
    <link href="${baseUrl}/sample-article-1" rel="alternate"/>
    <id>${baseUrl}/sample-article-1</id>
    <updated>${currentDate}</updated>
    <summary>Analysis of how media consolidation affects democratic discourse and public opinion.</summary>
    <content type="html">
      <![CDATA[
        <p>This is a sample article about media consolidation and its impact on democracy...</p>
        <p>Read more at <a href="${baseUrl}/sample-article-1">${baseUrl}/sample-article-1</a></p>
      ]]>
    </content>
    <category term="Media" scheme="${baseUrl}/categories/media"/>
    <category term="Politics" scheme="${baseUrl}/categories/politics"/>
  </entry>

  <entry>
    <title>Sample Article: Alternative News Sources</title>
    <link href="${baseUrl}/sample-article-2" rel="alternate"/>
    <id>${baseUrl}/sample-article-2</id>
    <updated>${new Date(Date.now() - 86400000).toISOString()}</updated>
    <summary>Exploring alternative news sources and their role in media diversity.</summary>
    <content type="html">
      <![CDATA[
        <p>This article explores various alternative news sources...</p>
        <p>Read more at <a href="${baseUrl}/sample-article-2">${baseUrl}/sample-article-2</a></p>
      ]]>
    </content>
    <category term="News" scheme="${baseUrl}/categories/news"/>
    <category term="Media" scheme="${baseUrl}/categories/media"/>
  </entry>
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