'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

/**
 * API Documentation Page
 *
 * Interactive API documentation using Swagger UI
 */
export default function DocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error('Failed to fetch OpenAPI specification');
        }
        const specData = await response.json();
        setSpec(specData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading API documentation...</span>
          </div>
          <p className="mt-3">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error Loading Documentation</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Please check that the API is running and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="bg-light border-bottom p-3">
        <div className="container">
          <h1 className="h3 mb-0">Media Alternatives API Documentation</h1>
          <p className="text-muted mb-0">
            Interactive API documentation for the Media Alternatives platform
          </p>
        </div>
      </div>

      <div style={{ height: 'calc(100vh - 100px)' }}>
        {spec && (
          <SwaggerUI
            spec={spec}
            tryItOutEnabled={true}
            docExpansion="list"
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={1}
            showExtensions={true}
            showCommonExtensions={true}
            filter={true}
            persistAuthorization={true}
          />
        )}
      </div>
    </div>
  );
}