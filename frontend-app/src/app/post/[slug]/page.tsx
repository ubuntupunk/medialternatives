import React from 'react';
import { notFound } from 'next/navigation';
// import Layout from '@/components/Layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost } from '@/types/wordpress';
import { formatDate, getFeaturedImageUrl, getPostAuthor, getPostAuthorId, decodeHtmlEntities, getPostCategories, getPostTags } from '@/utils/helpers';
import AuthorDisplay from '@/components/UI/AuthorDisplay';
import { mockPosts } from '@/utils/mockData';

// Enable ISR - revalidate every 10 minutes for individual posts
export const revalidate = 600; // 10 minutes

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Single post page that displays full post content
 * Accessible via /post/[slug] URLs from PostCard components
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
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
  const authorId = getPostAuthorId(post);
  const categories = getPostCategories(post);
  const tags = getPostTags(post);

  return (
    <>
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
            {/* 
            {post.modified !== post.date && (
              <time className="entry-date updated ms-3" dateTime={post.modified}>
                (Updated {formatDate(post.modified)})
              </time>
            )} */}
            {' '}
            <AuthorDisplay author={author} authorId={authorId} showPrefix={true} />
          </div>

          {/* Categories and Tags */}
          {categories.length > 0 && (
            <div className="entry-categories mb-2">
              <strong>Categories: </strong>
              {categories.map((category, index) => (
                <span key={category.id}>
                  <Link href={`/category/${category.slug}`} className="category-link">
                    {category.name}
                  </Link>
                  {index < categories.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className="entry-tags mb-3">
              <strong>Tags: </strong>
              {tags.map((tag, index) => (
                <span key={tag.id}>
                  <Link href={`/tag/${tag.slug}`} className="tag-link">
                    {tag.name}
                  </Link>
                  {index < tags.length - 1 && ', '}
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
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 gap-md-4">
            {/* Back Button - Left Side */}
            <div className="post-navigation">
              <Link 
                href="/blog" 
                className="btn btn-outline-secondary d-flex align-items-center"
                style={{
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '500',
                  padding: '0.5rem 1rem'
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  fill="currentColor" 
                  className="me-2" 
                  viewBox="0 0 16 16"
                >
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
                Back
              </Link>
            </div>

            {/* Share Buttons - Right Side */}
            <div className="share-buttons d-flex align-items-center flex-wrap gap-2 justify-content-center justify-content-md-end" style={{ minHeight: 'auto' }}>
              <span 
                className="text-muted me-2" 
                style={{
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontSize: '14px'
                }}
              >
                Share:
              </span>
              
              {/* Twitter */}
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}&text=${encodeURIComponent(decodeHtmlEntities(post.title.rendered))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm d-inline-flex align-items-center share-btn-twitter"
                style={{
                  backgroundColor: '#1da1f2',
                  borderColor: '#1da1f2',
                  color: 'white',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '500',
                  padding: '0.5rem',
                  transition: 'all 0.2s ease',
                  minWidth: '38px',
                  minHeight: '38px'
                }}
              >
                <svg width="16" height="16" fill="currentColor" className="me-md-1" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
                <span className="d-none d-md-inline">Tweet</span>
              </a>

              {/* Facebook */}
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm d-inline-flex align-items-center share-btn-facebook"
                style={{
                  backgroundColor: '#1877f2',
                  borderColor: '#1877f2',
                  color: 'white',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '500',
                  padding: '0.5rem',
                  transition: 'all 0.2s ease',
                  minWidth: '38px',
                  minHeight: '38px'
                }}
              >
                <svg width="16" height="16" fill="currentColor" className="me-md-1" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
                <span className="d-none d-md-inline">Facebook</span>
              </a>

              {/* LinkedIn */}
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm d-inline-flex align-items-center share-btn-linkedin"
                style={{
                  backgroundColor: '#0077b5',
                  borderColor: '#0077b5',
                  color: 'white',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '500',
                  padding: '0.5rem',
                  transition: 'all 0.2s ease',
                  minWidth: '38px',
                  minHeight: '38px'
                }}
              >
                <svg width="16" height="16" fill="currentColor" className="me-md-1" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
                <span className="d-none d-md-inline">LinkedIn</span>
              </a>

              {/* Reddit */}
              <a 
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(post.link)}&title=${encodeURIComponent(decodeHtmlEntities(post.title.rendered))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm d-inline-flex align-items-center share-btn-reddit"
                style={{
                  backgroundColor: '#ff4500',
                  borderColor: '#ff4500',
                  color: 'white',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '500',
                  padding: '0.5rem',
                  transition: 'all 0.2s ease',
                  minWidth: '38px',
                  minHeight: '38px'
                }}
              >
                <svg width="16" height="16" fill="currentColor" className="me-md-1" viewBox="0 0 16 16">
                  <path d="M6.167 8a.831.831 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661zm1.843 3.647c.315 0 1.403-.038 1.976-.611a.232.232 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83.458 0 .83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.203.203 0 0 0-.153.028.186.186 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224c-.02.115-.029.23-.029.353 0 1.795 2.091 3.256 4.669 3.256 2.577 0 4.668-1.451 4.668-3.256 0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165z"/>
                </svg>
                <span className="d-none d-md-inline">Reddit</span>
              </a>

              {/* Email */}
              <a 
                href={`mailto:?subject=${encodeURIComponent(decodeHtmlEntities(post.title.rendered))}&body=${encodeURIComponent(`Check out this article: ${decodeHtmlEntities(post.title.rendered)}\n\n${post.link}`)}`}
                className="btn btn-sm d-flex align-items-center share-btn-email"
                style={{
                  backgroundColor: '#6c757d',
                  borderColor: '#6c757d',
                  color: 'white',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '500',
                  padding: '0.375rem 0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 14H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                </svg>
                Email
              </a>
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
              Categories: {categories.length} ({categories.map(c => c.name).join(', ')}) | 
              Tags: {tags.length} ({tags.map(t => t.name).join(', ')})
            </small>
          </div>
        )}
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
