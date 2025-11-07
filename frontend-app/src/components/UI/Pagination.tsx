import React from 'react';
import Link from 'next/link';
import { PaginationProps } from '@/types';

/**
 * Pagination component with styling from additional.css
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl,
  className = ''
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range if current page is near the beginning or end
    if (currentPage <= 2) {
      endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
    } else if (currentPage >= totalPages - 1) {
      startPage = Math.max(2, totalPages - maxPagesToShow + 2);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add pages in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page if more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={`page_nav ${className}`} aria-label="Pagination">
      {/* Previous page link */}
      {currentPage > 1 && (
        <Link 
          href={`${baseUrl}${currentPage === 2 ? '' : `/page/${currentPage - 1}`}`}
          className="page-numbers prev"
          aria-label="Previous page"
        >
          &laquo; Prev
        </Link>
      )}
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return <span key={`ellipsis-${index}`} className="page-numbers dots">&hellip;</span>;
        }
        
        const pageNum = page as number;
        const isCurrentPage = pageNum === currentPage;
        const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}/page/${pageNum}`;
        
        return isCurrentPage ? (
          <span key={pageNum} className="page-numbers current" aria-current="page">
            {pageNum}
          </span>
        ) : (
          <Link key={pageNum} href={pageUrl} className="page-numbers">
            {pageNum}
          </Link>
        );
      })}
      
      {/* Next page link */}
      {currentPage < totalPages && (
        <Link 
          href={`${baseUrl}/page/${currentPage + 1}`}
          className="page-numbers next"
          aria-label="Next page"
        >
          Next &raquo;
        </Link>
      )}
    </nav>
  );
};

export default Pagination;