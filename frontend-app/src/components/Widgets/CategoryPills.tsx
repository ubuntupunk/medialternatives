"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordPressCategory } from '@/types/wordpress';
import { wordpressApi } from '@/services/wordpress-api';

interface CategoryPillsProps {
  categories?: WordPressCategory[];
  activeCategory?: string | null;
  layout?: 'horizontal' | 'vertical';
  maxCategories?: number;
  showAll?: boolean;
  className?: string;
}

/**
 * Bootstrap nav pills style category filter
 * Great for horizontal filter bars or vertical navigation
 */
const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories: initialCategories,
  activeCategory = null,
  layout = 'horizontal',
  maxCategories = 8,
  showAll = true,
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
      <div className={`widget category-pills ${className}`}>
        <h3 className="widget-title">Filter by Category</h3>
        <div className="nav nav-pills">
          <span className="nav-link disabled">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`widget category-pills ${className}`}>
        <h3 className="widget-title">Filter by Category</h3>
        <div className="alert alert-sm alert-warning">Error: {error}</div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={`widget category-pills ${className}`}>
        <h3 className="widget-title">Filter by Category</h3>
        <div className="nav nav-pills">
          <span className="nav-link disabled">No categories found.</span>
        </div>
      </div>
    );
  }

  const navClasses = [
    'nav',
    'nav-pills',
    layout === 'vertical' ? 'flex-column' : 'justify-content-center',
    layout === 'horizontal' ? 'flex-wrap' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`widget category-pills ${className}`}>
      <h3 className="widget-title">Filter by Category</h3>
      <ul className={navClasses}>
        {/* All Posts option */}
        {showAll && (
          <li className="nav-item">
            <Link 
              href="/blog" 
              className={`nav-link ${!activeCategory ? 'active' : ''}`}
            >
              All
            </Link>
          </li>
        )}
        
        {/* Category pills */}
        {categories.map(category => {
          const isActive = activeCategory === category.slug;
          
          return (
            <li className="nav-item" key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className={`nav-link ${isActive ? 'active' : ''}`}
                title={`${category.count} posts in ${category.name}`}
              >
                {category.name}
                <span className="badge bg-light text-dark ms-1">
                  {category.count}
                </span>
              </Link>
            </li>
          );
        })}
        
        {/* More categories link if we're limiting the display */}
        {categories.length >= maxCategories && (
          <li className="nav-item">
            <Link 
              href="/categories" 
              className="nav-link text-muted"
              title="View all categories"
            >
              More...
            </Link>
          </li>
        )}
      </ul>
      
      {/* Optional description */}
      {layout === 'horizontal' && (
        <div className="mt-2 text-center">
          <small className="text-muted">
            Click a category to filter posts
          </small>
        </div>
      )}
    </div>
  );
};

export default CategoryPills;