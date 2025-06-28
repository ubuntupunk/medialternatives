import React from 'react';
import { notFound } from 'next/navigation';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, WordPressUser, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';
import Image from 'next/image';

interface AuthorPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

/**
 * Dynamic author page that displays posts by a specific author
 * Accessible via /author/[slug] URLs from author links
 */
export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const { slug } = params;
  const currentPage = parseInt(searchParams.page || '1', 10);
  
  let author: WordPressUser | null = null;
  let posts: WordPressPost[] = [];
  let pagination: PaginationInfo = {
    total: 0,
    totalPages: 1,
    currentPage: currentPage,
    perPage: SITE_CONFIG.POSTS_PER_PAGE,
    hasNext: false,
    hasPrev: false,
    nextPage: undefined,
    prevPage: undefined
  };
  let error: string | null = null;

  try {
    // Get author information by slug
    author = await wordpressApi.getUserBySlug(slug);
    
    if (!author) {
      notFound();
    }

    // Get posts for this author with pagination
    const response = await wordpressApi.getPostsByAuthorWithPagination(author.id, {
      per_page: SITE_CONFIG.POSTS_PER_PAGE,
      page: currentPage,
      _embed: true
    });

    posts = response.data;
    pagination = response.pagination;
    
    console.log(`Author "${slug}" pagination info:`, pagination);

  } catch (err) {
    console.error('Error fetching author data:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching author data';
    
    // Fallback to mock data for development
    posts = mockPosts.slice(0, SITE_CONFIG.POSTS_PER_PAGE);
    const totalPages = Math.ceil(mockPosts.length / SITE_CONFIG.POSTS_PER_PAGE);
    pagination = {
      total: mockPosts.length,
      totalPages: totalPages,
      currentPage: currentPage,
      perPage: SITE_CONFIG.POSTS_PER_PAGE,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
      prevPage: currentPage > 1 ? currentPage - 1 : undefined
    };
  }

  // If author is null due to error, create a fallback with David Robert Lewis bio
  if (!author && error) {
    author = {
      id: 0,
      name: 'David Robert Lewis',
      slug: 'david-robert-lewis',
      description: 'Publisher and cognitive dissident, organic intellectual, and activist-at-large. David Robert Lewis is the founder of Medialternatives, South Africa\'s most controversial blog. He has worked for South Africa\'s struggle press, including South Press, Grassroots and New Nation. A graduate of the Centre for African Studies with a degree in political studies, Lewis was involved in the student uprisings of 1987 at UCT. As a technologist, futurist and promoter of free and open source software, he was one of the first to write about software piracy and became a hacktivist involved in early mass online protests. He is a founding member of Earthlife Africa and past steering committee member of the People\'s Health Movement.',
      link: '',
      url: '',
      avatar_urls: {
        '24': '/images/default-avatar.svg',
        '48': '/images/default-avatar.svg',
        '96': '/images/default-avatar.svg'
      },
      meta: []
    };
  }

  // Get avatar URL with fallback
  const avatarUrl = author?.avatar_urls?.['96'] || author?.avatar_url || '/images/default-avatar.svg';

  return (
    <>
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
            {author?.name}
          </li>
        </ol>
      </nav>

      {/* Author Header */}
      <div className="author-header mb-4">
        <div className="d-flex align-items-center mb-3">
          <div className="author-avatar me-3">
            <Image
              src={avatarUrl}
              alt={author?.name || 'Author avatar'}
              width={96}
              height={96}
              style={{ borderRadius: '50%' }}
              className="border"
            />
          </div>
          <div className="author-info">
            <h1 className="author-title mb-2">
              {author?.name}
            </h1>
            {author?.description && (
              <div className="author-description mb-2">
                <p className="text-muted lh-base" style={{ fontSize: '1.1rem' }}>
                  {author.description}
                </p>
              </div>
            )}
            <p className="author-meta text-muted">
              {pagination.total} {pagination.total === 1 ? 'post' : 'posts'} by this author
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-warning mb-4">
          <strong>API Error:</strong> {error}
          <p>Displaying fallback mock data.</p>
        </div>
      )}

      {/* Posts Display */}
      {posts.length === 0 ? (
        <div className="alert alert-info">
          <h4>No posts found by this author</h4>
          <p>There are currently no posts by "{author?.name}".</p>
          <Link href="/blog" className="btn btn-primary">
            View All Posts
          </Link>
        </div>
      ) : (
        <>
          <PostGrid posts={posts} showFeatured={currentPage === 1} />
          
          {pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/author/${slug}`}
            />
          )}
          
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-light border rounded">
              <h6>Author "{author?.name}" Pagination Debug Info:</h6>
              <small>
                Total posts: {pagination.total} | 
                Total pages: {pagination.totalPages} | 
                Current page: {pagination.currentPage} | 
                Per page: {pagination.perPage} | 
                Has next: {pagination.hasNext ? 'Yes' : 'No'} | 
                Has prev: {pagination.hasPrev ? 'Yes' : 'No'}
              </small>
            </div>
          )}
        </>
      )}

      {/* Back to Blog Link */}
      <div className="mt-4 text-center">
        <Link href="/blog" className="btn btn-outline-secondary">
          ← Back to All Posts
        </Link>
      </div>
    </>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const author = await wordpressApi.getUserBySlug(params.slug);
    
    if (!author) {
      return {
        title: 'Author Not Found',
        description: 'The requested author could not be found.'
      };
    }

    return {
      title: `${author.name} - ${SITE_CONFIG.SITE_TITLE}`,
      description: author.description || `Posts by ${author.name}`,
      openGraph: {
        title: `${author.name} - ${SITE_CONFIG.SITE_TITLE}`,
        description: author.description || `Posts by ${author.name}`,
        type: 'profile',
        images: author.avatar_urls?.['96'] ? [author.avatar_urls['96']] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Author',
      description: 'Author page'
    };
  }
}