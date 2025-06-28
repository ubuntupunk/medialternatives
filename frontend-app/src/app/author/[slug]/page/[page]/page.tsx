import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, WordPressUser, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';
import Image from 'next/image';

interface AuthorPagePaginatedProps {
  params: {
    slug: string;
    page: string;
  };
}

/**
 * Paginated author page that displays posts for a specific author and page number
 * Accessible via /author/[slug]/page/[page] URLs
 */
export default async function AuthorPagePaginated({ params }: AuthorPagePaginatedProps) {
  const { slug } = params;
  const currentPage = parseInt(params.page, 10);
  
  // Validate page number
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  let author: WordPressUser | null = null;
  let posts: WordPressPost[] = [];
  let pagination: PaginationInfo = {
    total: 0,
    totalPages: 1,
    currentPage: currentPage,
    perPage: SITE_CONFIG.POSTS_PER_PAGE,
    hasNext: false,
    hasPrev: false
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

    // If the requested page is beyond available pages, show 404
    if (currentPage > pagination.totalPages) {
      notFound();
    }

    console.log(`Author "${slug}" page ${currentPage} pagination info:`, pagination);

  } catch (err) {
    console.error('Error fetching author data:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching author data';
    
    // Fallback to mock data for development
    const totalMockPages = Math.ceil(mockPosts.length / SITE_CONFIG.POSTS_PER_PAGE);
    
    if (currentPage > totalMockPages) {
      notFound();
    }

    const startIndex = (currentPage - 1) * SITE_CONFIG.POSTS_PER_PAGE;
    const endIndex = startIndex + SITE_CONFIG.POSTS_PER_PAGE;
    posts = mockPosts.slice(startIndex, endIndex);

    pagination = {
      total: mockPosts.length,
      totalPages: totalMockPages,
      currentPage: currentPage,
      perPage: SITE_CONFIG.POSTS_PER_PAGE,
      hasNext: currentPage < totalMockPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalMockPages ? currentPage + 1 : undefined,
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
    <Layout>
      <div className="author-page-paginated">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/blog">Blog</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href={`/author/${slug}`}>{author?.name}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Page {currentPage}
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
                {author?.name} - Page {currentPage}
              </h1>
              {author?.description && (
                <div className="author-description mb-2">
                  <p className="text-muted lh-base" style={{ fontSize: '1.1rem' }}>
                    {author.description}
                  </p>
                </div>
              )}
              <p className="author-meta text-muted">
                Showing {posts.length} posts on page {currentPage} of {pagination.totalPages} 
                ({pagination.total} total posts by this author)
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
            <h4>No posts found on this page</h4>
            <p>There are no posts by "{author?.name}" on page {currentPage}.</p>
            <Link href={`/author/${slug}`} className="btn btn-primary">
              Go to First Page
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
          </>
        )}

        {/* Back to Blog Link */}
        <div className="mt-4 text-center">
          <Link href="/blog" className="btn btn-outline-secondary">
            ← Back to All Posts
          </Link>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-light border rounded">
            <h6>Author "{author?.name}" Page {currentPage} Debug Info:</h6>
            <small>
              Total posts: {pagination.total} | 
              Total pages: {pagination.totalPages} | 
              Current page: {pagination.currentPage} | 
              Per page: {pagination.perPage} | 
              Has next: {pagination.hasNext ? 'Yes' : 'No'} | 
              Has prev: {pagination.hasPrev ? 'Yes' : 'No'} |
              Posts on this page: {posts.length}
            </small>
          </div>
        )}
      </div>
    </Layout>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: { slug: string; page: string } }) {
  const currentPage = parseInt(params.page, 10);
  
  if (isNaN(currentPage) || currentPage < 1) {
    return {
      title: 'Invalid Page',
      description: 'The requested page number is invalid.'
    };
  }

  try {
    const author = await wordpressApi.getUserBySlug(params.slug);
    
    if (!author) {
      return {
        title: 'Author Not Found',
        description: 'The requested author could not be found.'
      };
    }

    return {
      title: `${author.name} - Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
      description: author.description 
        ? `${author.description} - Page ${currentPage}`
        : `Posts by ${author.name} - Page ${currentPage}`,
      openGraph: {
        title: `${author.name} - Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
        description: author.description 
          ? `${author.description} - Page ${currentPage}`
          : `Posts by ${author.name} - Page ${currentPage}`,
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