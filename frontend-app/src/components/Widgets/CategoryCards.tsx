"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordPressCategory } from '@/types/wordpress';
import { wordpressApi } from '@/services/wordpress-api';

interface CategoryCardsProps {
  categories?: WordPressCategory[];
  columns?: 1 | 2 | 3 | 4;
  showDescriptions?: boolean;
  maxCategories?: number;
  className?: string;
}

/**
 * Bootstrap card grid style category display
 * Modern card-based layout perfect for main content areas
 */
const CategoryCards: React.FC<CategoryCardsProps> = ({
  categories: initialCategories,
  columns = 2,
  showDescriptions = false,
  maxCategories = 12,
  className = ''
}) => {
  const [categories, setCategories] = useState<WordPressCategory[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(!initialCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCategories) {
      const fetchCategories = async () => {
        try {
          setIsLoading(true);
          const data = await wordpressApi.getCategories({
            per_page: maxCategories,
            orderby: 'count',
            order: 'desc'
          });
          setCategories(data);
        } catch (err) {
          setError('Failed to load categories');
          console.error('Error fetching categories:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCategories();
    }
  }, [initialCategories, maxCategories]);

  if (isLoading) {
    return (
      <div className={`widget category-cards ${className}`}>
        <h3 className="widget-title">Browse Categories</h3>
        <div className="row">
          {Array.from({ length: columns * 2 }).map((_, index) => (
            <div key={index} className={`col-${12 / columns} mb-3`}>
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`widget category-cards ${className}`}>
        <h3 className="widget-title">Browse Categories</h3>
        <div className="alert alert-warning">Error: {error}</div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={`widget category-cards ${className}`}>
        <h3 className="widget-title">Browse Categories</h3>
        <div className="alert alert-info">No categories found.</div>
      </div>
    );
  }



  return (
    <div className={`widget category-cards ${className}`}>
      <h3 className="widget-title">Browse Categories</h3>
      <div className={`row row-cols-1 row-cols-md-${Math.min(columns, 2)} row-cols-lg-${Math.min(columns, 3)} row-cols-xl-${columns} g-3`}>
        {categories.map((category, index) => {
          // Use a simplified color system for cards
          const colorIndex = index % 6;
          const cardColors = [
            'primary', 'success', 'info', 'warning', 'danger', 'secondary'
          ];
          const cardColor = cardColors[colorIndex];
          
          return (
            <div className="col" key={category.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center d-flex flex-column">
                  <h6 className="card-title mb-2">
                    <Link 
                      href={`/category/${category.slug}`} 
                      className="text-decoration-none stretched-link"
                    >
                      {category.name}
                    </Link>
                  </h6>
                  
                  <div className="mb-2">
                    <span className={`badge bg-${cardColor}`}>
                      {category.count} {category.count === 1 ? 'post' : 'posts'}
                    </span>
                  </div>
                  
                  {showDescriptions && category.description && (
                    <p className="card-text small text-muted mt-auto">
                      {category.description.length > 80 
                        ? `${category.description.substring(0, 80)}...` 
                        : category.description
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer with summary */}
      <div className="mt-3 text-center">
        <small className="text-muted">
          Showing {categories.length} categories
        </small>
        {categories.length >= maxCategories && (
          <>
            {' • '}
            <Link href="/categories" className="small">
              View all categories
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryCards;