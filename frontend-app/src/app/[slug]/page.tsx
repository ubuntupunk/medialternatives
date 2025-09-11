import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost } from '@/types/wordpress';
import { formatDate, getFeaturedImageUrl, getPostAuthor, getPostAuthorId, decodeHtmlEntities, getPostCategories, getPostTags } from '@/utils/helpers';
import AuthorDisplay from '@/components/UI/AuthorDisplay';
import { mockPosts } from '@/utils/mockData';
import StructuredData from '@/components/SEO/StructuredData';

// Enable ISR - revalidate every 10 minutes for individual posts
export const revalidate = 600; // 10 minutes

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Clean URL post page that displays full post content
 * Accessible via /[slug] URLs (e.g., /south-africas-trade-pivot)
 * This replaces the /post/[slug] structure for cleaner URLs
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
  // Check if this is a known page route that should not be treated as a post
  const knownPages = [
    'blog',
    'about',
    'search',
    'support',
    'support-us', 
    'case',
    'environment',
    'handbook',
    'legal-archive',
    'legal-archive-timeline',
    'republish',
    'dashboard',
    'auth',
    'profile',
    'components',
    'testing',
    'pagination-test',
    'api-test',
    'api-debug',
    'adsense-test',
    'category-demo'
  ];

  // If it's a known page, return 404 (let the actual page handle it)
  if (knownPages.includes(slug)) {
    notFound();
  }

  // If it starts with known prefixes, return 404
  if (
    slug.startsWith('category') ||
    slug.startsWith('tag') ||
    slug.startsWith('author') ||
    slug.startsWith('page') ||
    slug.startsWith('api') ||
    slug.startsWith('_next')
  ) {
    notFound();
  }
  
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
    
    // Try to find in mock data as fallback
    const mockPost = mockPosts.find(p => p.slug === slug);
    if (mockPost) {
      post = mockPost;
      error = null;
    } else {
      notFound();
    }
  }

  if (!post) {
    notFound();
  }

  const featuredImageUrl = getFeaturedImageUrl(post);
  const author = getPostAuthor(post);
  const authorId = getPostAuthorId(post);
  const categories = getPostCategories(post);
  const tags = getPostTags(post);

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData 
        post={post} 
        type="article" 
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: decodeHtmlEntities(post.title.rendered), url: `/${post.slug}` }
        ]}
      />
      
      <article className="container my-4">
      {error && (
        <div className="alert alert-warning mb-4">
          <strong>API Error:</strong> {error}
          <p>Displaying fallback mock data.</p>
        </div>
      )}

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

      {/* Post Header */}
      <header className="mb-4">
        <h1 
          className="display-4 mb-3"
          dangerouslySetInnerHTML={{ 
            __html: decodeHtmlEntities(post.title.rendered)
          }}
        />
        
        <div className="row mb-3">
          <div className="col-md-8">
            <div className="d-flex flex-wrap align-items-center text-muted">
              <span className="me-3">
                <i className="bi bi-calendar3 me-1"></i>
                {formatDate(post.date)}
              </span>
              
              {post.modified !== post.date && (
                <span className="me-3">
                  <i className="bi bi-pencil me-1"></i>
                  Updated {formatDate(post.modified)}
                </span>
              )}
              
              <AuthorDisplay 
                author={author} 
                authorId={authorId}
                showAvatar={true}
                className="me-3"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-3">
            <span className="text-muted me-2">Categories:</span>
            {categories.map((category, index) => (
              <span key={category.id}>
                <Link 
                  href={`/category/${category.slug}`}
                  className="badge bg-primary text-decoration-none me-1"
                >
                  {category.name}
                </Link>
                {index < categories.length - 1 && ' '}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image */}
      {featuredImageUrl && (
        <div className="mb-4">
          <Image
            src={featuredImageUrl}
            alt={decodeHtmlEntities(post.title.rendered)}
            width={800}
            height={400}
            className="img-fluid rounded"
            style={{ width: '100%', height: 'auto' }}
            priority
          />
        </div>
      )}

      {/* Post Content */}
      <div className="row">
        <div className="col-lg-8">
          <div 
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-4 pt-4 border-top">
              <h6 className="text-muted mb-2">Tags:</h6>
              <div>
                {tags.map((tag) => (
                  <Link 
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="badge bg-secondary text-decoration-none me-1 mb-1"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Social Sharing */}
          <div className="mt-4 pt-4 border-top">
            <h6 className="mb-3">Share this article:</h6>
            <div className="d-flex flex-wrap gap-2">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}&text=${encodeURIComponent(decodeHtmlEntities(post.title.rendered))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-twitter me-1"></i>
                Twitter
              </a>
              
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-facebook me-1"></i>
                Facebook
              </a>
              
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-linkedin me-1"></i>
                LinkedIn
              </a>
              
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(post.link)}&title=${encodeURIComponent(decodeHtmlEntities(post.title.rendered))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-reddit me-1"></i>
                Reddit
              </a>
              
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${decodeHtmlEntities(post.title.rendered)} ${post.link}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-success btn-sm"
              >
                <i className="bi bi-whatsapp me-1"></i>
                WhatsApp
              </a>
              
              <a
                href={`mailto:?subject=${encodeURIComponent(decodeHtmlEntities(post.title.rendered))}&body=${encodeURIComponent(`Check out this article: ${decodeHtmlEntities(post.title.rendered)}\n\n${post.link}`)}`}
                className="btn btn-outline-secondary btn-sm"
              >
                <i className="bi bi-envelope me-1"></i>
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '2rem' }}>
            {/* Author Info */}
            {author && (
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">About the Author</h6>
                  <AuthorDisplay 
                    author={author} 
                    authorId={authorId}
                    showAvatar={true}
                    showBio={true}
                    className="mb-0"
                  />
                </div>
              </div>
            )}

            {/* Related Categories */}
            {categories.length > 0 && (
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Related Topics</h6>
                  {categories.map((category) => (
                    <div key={category.id} className="mb-2">
                      <Link 
                        href={`/category/${category.slug}`}
                        className="text-decoration-none"
                      >
                        <i className="bi bi-folder me-2"></i>
                        {category.name}
                          <span className="text-muted ms-1">({category.count || 0} posts)</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="row mt-5 pt-4 border-top">
        <div className="col-12 text-center">
          <Link href="/blog" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Blog
          </Link>
        </div>
      </div>
    </article>
    </>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const post = await wordpressApi.getPost(slug);
    
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