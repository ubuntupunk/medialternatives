import React from 'react';
import Layout from '@/components/Layout/Layout';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Test page to verify pagination API functionality
 * This page will show raw pagination data from the WordPress.com API
 */
export default async function PaginationTestPage() {
  let paginationData = null;
  let error = null;
  let apiHeaders = null;

  try {
    // Test the new pagination-aware API
    const response = await wordpressApi.getPostsWithPagination({
      per_page: 5, // Small number to test pagination
      page: 1,
      _embed: true
    });

    paginationData = response.pagination;
    
    // Also test direct API call to see headers
    const directResponse = await fetch(
      `https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/posts?per_page=5&page=1&_embed=true`
    );
    
    apiHeaders = {
      'X-WP-Total': directResponse.headers.get('X-WP-Total'),
      'X-WP-TotalPages': directResponse.headers.get('X-WP-TotalPages'),
      'Link': directResponse.headers.get('Link'),
      'Content-Type': directResponse.headers.get('Content-Type'),
    };

  } catch (err) {
    console.error('Error testing pagination:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <Layout>
      <div className="pagination-test-page">
        <h1>Pagination API Test</h1>
        <p className="lead">
          This page tests the new pagination-aware API methods and shows the data extracted from WordPress.com API headers.
        </p>

        {error && (
          <div className="alert alert-danger">
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        )}

        {paginationData && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Extracted Pagination Data</h5>
                </div>
                <div className="card-body">
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Total Posts:</strong></td>
                        <td>{paginationData.total}</td>
                      </tr>
                      <tr>
                        <td><strong>Total Pages:</strong></td>
                        <td>{paginationData.totalPages}</td>
                      </tr>
                      <tr>
                        <td><strong>Current Page:</strong></td>
                        <td>{paginationData.currentPage}</td>
                      </tr>
                      <tr>
                        <td><strong>Per Page:</strong></td>
                        <td>{paginationData.perPage}</td>
                      </tr>
                      <tr>
                        <td><strong>Has Next:</strong></td>
                        <td>{paginationData.hasNext ? 'Yes' : 'No'}</td>
                      </tr>
                      <tr>
                        <td><strong>Has Previous:</strong></td>
                        <td>{paginationData.hasPrev ? 'Yes' : 'No'}</td>
                      </tr>
                      <tr>
                        <td><strong>Next Page:</strong></td>
                        <td>{paginationData.nextPage || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Previous Page:</strong></td>
                        <td>{paginationData.prevPage || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Raw API Headers</h5>
                </div>
                <div className="card-body">
                  {apiHeaders ? (
                    <table className="table table-sm">
                      <tbody>
                        {Object.entries(apiHeaders).map(([key, value]) => (
                          <tr key={key}>
                            <td><strong>{key}:</strong></td>
                            <td><code>{value || 'null'}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted">No headers data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3>Test Results</h3>
          {paginationData ? (
            <div className="alert alert-success">
              <h5>✅ Pagination API Working!</h5>
              <p>
                Successfully extracted pagination data from WordPress.com API headers. 
                Found {paginationData.total} total posts across {paginationData.totalPages} pages.
              </p>
            </div>
          ) : (
            <div className="alert alert-warning">
              <h5>⚠️ Pagination API Issues</h5>
              <p>
                Could not extract pagination data. This might be due to API limitations or network issues.
                Check the error message above for details.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3>Next Steps</h3>
          <ul>
            <li>✅ Phase 1: API Enhancement - Extract pagination headers</li>
            <li>⏳ Phase 2: Dynamic Routing - Create /page/[page] routes</li>
            <li>⏳ Phase 3: Bootstrap Styling - Apply Bootstrap pagination classes</li>
            <li>⏳ Phase 4: UX Enhancements - Add loading states and transitions</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="btn btn-primary me-3">
            Test Home Page
          </a>
          <a href="/blog" className="btn btn-secondary me-3">
            Test Blog Page
          </a>
          <a href="/category/politics" className="btn btn-outline-secondary">
            Test Category Page
          </a>
        </div>
      </div>
    </Layout>
  );
}