import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const perPage = searchParams.get('per_page') || '10';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  try {
    // Search WordPress.com API
    const searchUrl = `${WORDPRESS_API_URL}/posts?search=${encodeURIComponent(query.trim())}&per_page=${perPage}&_embed=true`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 5 minutes
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts = await response.json();

    // Transform the response to include relevant fields
    const searchResults = posts.map((post: any) => ({
      ID: post.id,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      slug: post.slug,
      date: post.date,
      modified: post.modified,
      type: post.type,
      link: post.link,
      author: post._embedded?.author?.[0]?.name || 'Unknown',
      featured_media: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      categories: post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.name) || [],
      tags: post._embedded?.['wp:term']?.[1]?.map((tag: any) => tag.name) || []
    }));

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}