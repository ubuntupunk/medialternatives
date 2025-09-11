'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostCard from '@/components/Posts/PostCard';

interface SearchResult {
  ID: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  date: string;
  type: string;
  author: string;
  featured_media: string | null;
  categories: string[];
  tags: string[];
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&per_page=20`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data);
      } catch (_err) {
        setError('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-5">
        <h1 className="h3 mb-3">Search</h1>
        <p className="text-muted">Enter a search term to find articles and content.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 mb-2">Search Results</h1>
        <p className="text-muted">
          {isLoading ? (
            'Searching...'
          ) : (
            <>
              {results.length > 0 ? (
                <>Found {results.length} result{results.length !== 1 ? 's' : ''} for <strong>&quot;{query}&quot;</strong></>
              ) : (
                <>No results found for <strong>&quot;{query}&quot;</strong></>
              )}
            </>
          )}
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Searching...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!isLoading && !error && results.length === 0 && query && (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted mb-3"></i>
          <h3 className="h5 text-muted">No results found</h3>
          <p className="text-muted">
            Try different keywords or check your spelling.
          </p>
          <div className="mt-4">
            <Link href="/" className="btn btn-primary">
              <i className="bi bi-house me-2"></i>
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div className="search-results">
          <div className="row">
            {results.map((result) => (
              <div key={result.ID} className="col-12 mb-4">
                <PostCard
                  post={{
                    id: result.ID,
                    date: result.date,
                    date_gmt: result.date,
                    guid: { rendered: '' },
                    modified: result.date,
                    modified_gmt: result.date,
                    slug: result.slug,
                    status: 'publish' as const,
                    type: 'post',
                    link: `/${result.slug}`,
                    title: { rendered: result.title },
                    content: { rendered: result.excerpt || '', protected: false },
                    excerpt: { rendered: result.excerpt || '', protected: false },
                    author: parseInt(result.author) || 0,
                    featured_media: result.featured_media ? parseInt(result.featured_media) : 0,
                    comment_status: 'open' as const,
                    ping_status: 'open' as const,
                    sticky: false,
                    template: '',
                    format: 'standard',
                    meta: {},
                    categories: result.categories.map((cat: string) => parseInt(cat) || 0),
                    tags: result.tags.map((tag: string) => parseInt(tag) || 0)
                  }}
                  showExcerpt={true}
                />
              </div>
            ))}
          </div>

          {results.length >= 20 && (
            <div className="text-center mt-4">
              <p className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Showing first 20 results. Try more specific search terms for better results.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}