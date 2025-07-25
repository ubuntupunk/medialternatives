import React from 'react';
import LoadMore from '@/components/UI/LoadMore';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';
import Image from 'next/image';

interface DavidRobertLewisPageProps {
  searchParams: {
    page?: string;
  };
}

/**
 * Dedicated author page for David Robert Lewis (site owner)
 * This page serves as the fallback for unknown authors and provides
 * a proper bio page for the site's main author
 */
export default async function DavidRobertLewisPage({ searchParams }: DavidRobertLewisPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  
  // Static author information for David Robert Lewis
  const author = {
    id: 1736555, // The actual author ID from the API report
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
    // Try to get posts by the actual author ID
    const response = await wordpressApi.getPostsByAuthorWithPagination(author.id, {
      per_page: SITE_CONFIG.POSTS_PER_PAGE,
      page: currentPage,
      _embed: true
    });

    posts = response.data;
    pagination = response.pagination;
    
    console.log(`David Robert Lewis page ${currentPage} pagination info:`, pagination);

  } catch (err) {
    console.error('Error fetching David Robert Lewis posts:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching posts';
    
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

  // Get avatar URL with fallback
  const avatarUrl = author.avatar_urls['96'];

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
            {author.name}
          </li>
        </ol>
      </nav>

      {/* Author Header */}
      <div className="author-header mb-4">
        <div className="d-flex align-items-start mb-4">
          <div className="author-avatar me-4">
            <Image
              src={avatarUrl}
              alt={author.name}
              width={120}
              height={120}
              style={{ borderRadius: '50%' }}
              className="border shadow-sm"
            />
          </div>
          <div className="author-info flex-grow-1">
            <h1 className="author-title mb-3" style={{ color: '#0031FF', fontWeight: 'bold' }}>
              {author.name}
            </h1>
            <div className="author-description mb-3">
              <p className="text-dark lh-base" style={{ fontSize: '1.15rem', fontFamily: 'Georgia, serif' }}>
                {author.description}
              </p>
            </div>
            <div className="author-credentials mb-3">
              <h5 className="text-primary mb-2">Background & Credentials</h5>
              <ul className="list-unstyled text-muted">
                <li className="mb-1">• Founder of Medialternatives</li>
                <li className="mb-1">• Former journalist at South Press, Grassroots, and New Nation</li>
                <li className="mb-1">• Graduate of Centre for African Studies, UCT</li>
                <li className="mb-1">• Founding member of Earthlife Africa</li>
                <li className="mb-1">• Past steering committee member of People's Health Movement</li>
                <li className="mb-1">• Technology activist and early hacktivist</li>
              </ul>
            </div>
            <p className="author-meta text-muted">
              <strong>{pagination.total}</strong> {pagination.total === 1 ? 'post' : 'posts'} published
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-warning mb-4">
          <strong>API Note:</strong> {error}
          <p>Displaying available content.</p>
        </div>
      )}

      {/* Posts Display */}
      {posts.length === 0 ? (
        <div className="alert alert-info">
          <h4>Posts Loading</h4>
          <p>Posts by {author.name} are being loaded from the WordPress.com API.</p>
          <Link href="/blog" className="btn btn-primary">
            View All Posts
          </Link>
        </div>
      ) : (
        <div className="posts-section">
          <h3 className="mb-4 text-primary">Latest Posts</h3>
          <LoadMore 
            initialPosts={posts}
            initialPagination={pagination}
            authorId={1}
          />
        </div>
      )}

      {/* Back to Blog Link */}
      <div className="mt-5 text-center">
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
export async function generateMetadata() {
  return {
    title: `David Robert Lewis - ${SITE_CONFIG.SITE_TITLE}`,
    description: 'David Robert Lewis is the founder of Medialternatives, South Africa\'s most controversial blog. Publisher, cognitive dissident, organic intellectual, and activist-at-large.',
    openGraph: {
      title: `David Robert Lewis - ${SITE_CONFIG.SITE_TITLE}`,
      description: 'David Robert Lewis is the founder of Medialternatives, South Africa\'s most controversial blog. Publisher, cognitive dissident, organic intellectual, and activist-at-large.',
      type: 'profile',
    },
  };
}