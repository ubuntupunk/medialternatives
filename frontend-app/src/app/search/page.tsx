import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchResults from './SearchResults';

export const metadata: Metadata = {
  title: 'Search Results - Medialternatives',
  description: 'Search results for articles and content on Medialternatives',
};

export default function SearchPage() {
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <Suspense fallback={
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading search results...</span>
              </div>
            </div>
          }>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </div>
  );
}