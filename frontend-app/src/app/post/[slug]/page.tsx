import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost } from '@/types/wordpress';
import { formatDate, getFeaturedImageUrl, getPostAuthor, decodeHtmlEntities } from '@/utils/helpers';
import AuthorWidget from '@/components/Widgets/AuthorWidget';
import { mockPosts } from '@/utils/mockData';

interface PostPageProps {
  params: {
    slug: string;
  };
}

/**
 * Single post page that displays full post content
 * Accessible via /post/[slug] URLs from PostCard components
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params;
  
  let post: WordPressPost | null = null;
  let error: string | null = null;

  try {
    // Get post by slug from WordPress.com API
    post = await wordpressApi.getPost(slug);
    
    if (!post) {
      notFound();
    }

  } catch (err) {
    console.error('Error fetching post:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching post';
    
    // Fallback to mock data for development
    const mockPost = mockPosts.find(p => p.slug === slug);
    if (mockPost) {
      post = mockPost;
    } else {
      notFound();
    }
  }

  // If we still don't have a post, show 404
  if (!post) {
    notFound();
  }

  const featuredImageUrl = getFeaturedImageUrl(post, 'full');
  const author = getPostAuthor(post);

  return (
    <Layout>
      <article id={`post-${post.id}`} className="single-post">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/blog">Blog</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {decodeHtmlEntities(post.title.rendered)}
            </li>
          </ol>
        </nav>

        {/* Error Display */}
        {error && (
          <div className="alert alert-warning mb-4">
            <strong>API Error:</strong> {error}
            <p>Displaying fallback mock data.</p>
          </div>
        )}

        {/* Post Header */}
        <header className="entry-header mb-4">
          <h1 className="entry-title" dangerouslySetInnerHTML={{ 
            __html: decodeHtmlEntities(post.title.rendered) 
          }} />
          
          <div className="entry-meta mb-3">
            <time className="entry-date published" dateTime={post.date}>
              Published on {formatDate(post.date)}
            </time>
            
            {post.modified !== post.date && (
              <time className="entry-date updated ms-3" dateTime={post.modified}>
                (Updated {formatDate(post.modified)})
              </time>
            )}
            
            {author && (
              <div className="author-info mt-2">
                <AuthorWidget author={author} showSocialMenu={false} title="By" />
              </div>
            )}
          </div>

          {/* Categories and Tags */}
          {post.categories && post.categories.length > 0 && (
            <div className="entry-categories mb-2">
              <strong>Categories: </strong>
              {post.categories.map((categoryId, index) => (
                <span key={categoryId}>
                  <Link href={`/category/${categoryId}`} className="category-link">
                    Category {categoryId}
                  </Link>
                  {index < post.categories.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="entry-tags mb-3">
              <strong>Tags: </strong>
              {post.tags.map((tagId, index) => (
                <span key={tagId}>
                  <Link href={`/tag/${tagId}`} className="tag-link">
                    Tag {tagId}
                  </Link>
                  {index < post.tags.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {featuredImageUrl && (
          <div className="entry-thumbnail mb-4">
            <div style={{ position: 'relative', width: '100%', height: '400px' }}>
              <Image 
                src={featuredImageUrl}
                alt={decodeHtmlEntities(post.title.rendered)}
                fill
                style={{ objectFit: 'cover' }}
                sizes="100vw"
                priority
                className="rounded"
              />
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="entry-content">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: post.content.rendered 
            }}
            style={{
              lineHeight: '1.6',
              fontSize: '16px'
            }}
          />
        </div>

        {/* Post Footer */}
        <footer className="entry-footer mt-5 pt-4 border-top">
          <div className="row">
            <div className="col-md-6">
              <div className="post-navigation">
                <Link href="/blog" className="btn btn-outline-secondary">
                  ← Back to Blog
                </Link>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="share-buttons">
                <small className="text-muted">Share this post:</small>
                <div className="mt-2">
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}&text=${encodeURIComponent(decodeHtmlEntities(post.title.rendered))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary me-2"
                  >
                    Twitter
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-light border rounded">
            <h6>Post Debug Info:</h6>
            <small>
              ID: {post.id} | 
              Slug: {post.slug} | 
              Status: {post.status} | 
              Type: {post.type} | 
              Categories: {post.categories?.length || 0} | 
              Tags: {post.tags?.length || 0}
            </small>
          </div>
        )}
      </article>
    </Layout>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = await wordpressApi.getPost(params.slug);
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.'
      };
    }

    const cleanTitle = decodeHtmlEntities(post.title.rendered);
    const excerpt = post.excerpt.rendered 
      ? decodeHtmlEntities(post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160))
      : `Read ${cleanTitle} on ${SITE_CONFIG.SITE_TITLE}`;

    return {
      title: `${cleanTitle} - ${SITE_CONFIG.SITE_TITLE}`,
      description: excerpt,
      openGraph: {
        title: cleanTitle,
        description: excerpt,
        type: 'article',
        publishedTime: post.date,
        modifiedTime: post.modified,
        authors: post._embedded?.author?.[0]?.name ? [post._embedded.author[0].name] : undefined,
        images: getFeaturedImageUrl(post) ? [getFeaturedImageUrl(post)!] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: cleanTitle,
        description: excerpt,
        images: getFeaturedImageUrl(post) ? [getFeaturedImageUrl(post)!] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Post',
      description: 'Blog post'
    };
  }
}