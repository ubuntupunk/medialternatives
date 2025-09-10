'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Search result interface
 * @typedef {Object} SearchResult
 * @property {number} id - Unique identifier
 * @property {string} title - Result title
 * @property {string} excerpt - Result excerpt/summary
 * @property {string} link - URL to the result
 * @property {'post'|'page'} type - Content type
 * @property {string} date - Publication date
 */

/**
 * Search widget props interface
 * @typedef {Object} SearchWidgetProps
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Search Widget Component
 *
 * Provides search functionality for the Media Alternatives website.
 * Features debounced search, live results dropdown, and navigation to full search results.
 * Integrates with WordPress.com search API for content discovery.
 *
 * @component
 * @param {SearchWidgetProps} props - Component props
 * @returns {JSX.Element} The rendered search widget
 *
 * @example
 * ```tsx
 * <SearchWidget className="mt-4" />
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling
 * <SearchWidget className="custom-search-widget" />
 * ```
 */
export const SearchWidget: React.FC<SearchWidgetProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Search WordPress.com API
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&per_page=5`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Transform WordPress.com results
      const searchResults: SearchResult[] = data.map((item: any) => ({
        id: item.ID,
        title: item.title,
        excerpt: item.excerpt || '',
        link: `/post/${item.slug}`,
        type: item.type === 'page' ? 'page' : 'post',
        date: item.date
      }));

      setResults(searchResults);
      setShowResults(true);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search results page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    router.push(result.link);
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
  };

  return (
    <div className={`search-widget mt-4 ${className}`}>
      <div className="widget-header mb-3">
        <h5 className="widget-title text-center">
          <i className="bi bi-search me-2"></i>
          Search
        </h5>
      </div>

      <div className="search-form-container position-relative">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <i className="bi bi-search"></i>
              )}
            </button>
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="search-results position-absolute w-100 mt-1 bg-white border rounded shadow-sm" style={{ zIndex: 1000 }}>
            {error && (
              <div className="p-3 text-danger small">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {error}
              </div>
            )}

            {results.length === 0 && !error && !isLoading && (
              <div className="p-3 text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                No results found for &quot;{query}&quot;
              </div>
            )}

            {results.map((result) => (
              <div
                key={result.id}
                className="search-result-item p-3 border-bottom cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => handleResultClick(result)}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur
              >
                <div className="d-flex align-items-start">
                  <div className="me-2 mt-1">
                    <i className={`bi ${result.type === 'page' ? 'bi-file-text' : 'bi-newspaper'} text-primary`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 small fw-bold" dangerouslySetInnerHTML={{ __html: result.title }}></h6>
                    {result.excerpt && (
                      <p className="mb-1 small text-muted" style={{ fontSize: '0.8rem' }}>
                        {stripHtml(result.excerpt)}
                      </p>
                    )}
                    <div className="small text-muted">
                      <span className="badge bg-light text-dark me-1">
                        {result.type === 'page' ? 'Page' : 'Post'}
                      </span>
                      {new Date(result.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {results.length > 0 && (
              <div className="p-2 bg-light">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary w-100"
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setShowResults(false);
                  }}
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchWidget;