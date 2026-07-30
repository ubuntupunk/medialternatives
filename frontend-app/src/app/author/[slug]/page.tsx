import React from 'react';
import { notFound } from 'next/navigation';
import { WordPressUser } from '@/types/wordpress';
import Link from 'next/link';
import Image from 'next/image';

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

/**
 * Dynamic author page that displays posts by a specific author
 * Accessible via /author/[slug] URLs from author links
 */
export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;

  // Create author data based on slug
  let author: WordPressUser | null = null;

  if (slug === 'david-robert-lewis' || slug === 'davidrobertlewis') {
    author = {
      id: 1,
      name: 'David Robert Lewis',
      slug: 'david-robert-lewis',
      description: 'Publisher and cognitive dissident, organic intellectual, and activist-at-large. David Robert Lewis is the founder of Medialternatives, South Africa\'s most controversial blog. He has worked for South Africa\'s struggle press, including South Press, Grassroots and New Nation. A graduate of the Centre for African Studies with a degree in political studies, Lewis was involved in the student uprisings of 1987 at UCT. As a technologist, futurist and promoter of free and open source software, he was one of the first to write about software piracy and became a hacktivist involved in early mass online protests. He is a founding member of Earthlife Africa and past steering committee member of the People\'s Health Movement.',
      link: '/author/david-robert-lewis',
      url: '/author/david-robert-lewis',
      avatar_urls: {
        '24': '/images/avatar.webp',
        '48': '/images/avatar.webp',
        '96': '/images/avatar.webp'
      },
      avatar_url: '/images/avatar.webp',
      meta: {}
    };
  } else {
    notFound();
  }

  // Get avatar URL with fallback
  const avatarUrl = author?.avatar_urls?.['96'] || author?.avatar_url || '/images/default-avatar.svg';

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4 mt-5">
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
      <div className="author-header mb-5 mt-5">
        <div className="d-flex align-items-start mb-4">
          <div className="author-avatar me-4">
            <Image
              src={avatarUrl}
              alt={author?.name || 'Author avatar'}
              width={120}
              height={120}
              style={{ borderRadius: '50%' }}
              className="border shadow-sm"
            />
          </div>
          <div className="author-info flex-grow-1">
            <h1 className="author-title mb-3">
              {author?.name}
            </h1>
            <p className="author-meta text-muted mb-3">
              Author & Publisher
            </p>
          </div>
        </div>

        {author?.description && (
          <div className="author-bio-card">
            <div className="author-bio-content">
              <h3 className="bio-title mb-3">About {author.name}</h3>
              <div className="bio-text">
                {author.description}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back to Blog Link */}
      <div className="mt-4 text-center">
        <Link href="/blog" className="btn btn-outline-secondary">
          ← Back to Blog
        </Link>
      </div>
    </>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === 'david-robert-lewis') {
    return {
      title: `David Robert Lewis - Medialternatives`,
      description: 'Publisher and cognitive dissident, organic intellectual, and activist-at-large. Founder of Medialternatives, South Africa\'s most controversial blog.',
      openGraph: {
        title: 'David Robert Lewis - Medialternatives',
        description: 'Publisher and cognitive dissident, organic intellectual, and activist-at-large. Founder of Medialternatives, South Africa\'s most controversial blog.',
        type: 'profile',
        images: ['/images/avatar.webp'],
      },
    };
  }

  return {
    title: 'Author Not Found',
    description: 'The requested author could not be found.'
  };
}