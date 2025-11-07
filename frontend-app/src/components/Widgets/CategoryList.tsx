"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordPressCategory } from '@/types/wordpress';
import { wordpressApi } from '@/services/wordpress-api';

interface CategoryListProps {
  categories?: WordPressCategory[];
  activeCategory?: string | null;
  showCounts?: boolean;
  maxCategories?: number;
  className?: string;
}

/**
 * Bootstrap list group style category widget
 * Clean, accessible list format with badges for post counts
 */
const CategoryList: React.FC<CategoryListProps> = ({
  categories: initialCategories,
  activeCategory = null,
  showCounts = true,
  maxCategories = 20,
  className = ''
}) => {
  const [categories, setCategories] = useState<WordPressCategory[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(!initialCategories);
  const [error, setError] = useState<string | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);

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
          
          // Calculate total posts across all categories
          const total = data.reduce((sum, cat) => sum + cat.count, 0);
          setTotalPosts(total);
        } catch (err) {
          setError('Failed to load categories');
          console.error('Error fetching categories:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCategories();
    } else {
      const total = initialCategories.reduce((sum, cat) => sum + cat.count, 0);
      setTotalPosts(total);
    }
  }, [initialCategories, maxCategories]);

  if (isLoading) {
    return (
      <div className={`widget category-list ${className}`}>
        <h3 className="widget-title">Categories</h3>
        <div className="list-group list-group-flush">
          <div className="list-group-item">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`widget category-list ${className}`}>
        <h3 className="widget-title">Categories</h3>
        <div className="alert alert-sm alert-warning">Error: {error}</div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={`widget category-list ${className}`}>
        <h3 className="widget-title">Categories</h3>
        <div className="list-group list-group-flush">
          <div className="list-group-item">No categories found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`widget category-list ${className}`}>
      <h3 className="widget-title">Categories</h3>
      <div className="list-group list-group-flush">
        {/* All Posts option */}
        <Link 
          href="/blog" 
          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${!activeCategory ? 'active' : ''}`}
        >
          <span>All Posts</span>
          {showCounts && (
            <span className={`badge rounded-pill ${!activeCategory ? 'bg-light text-dark' : 'bg-primary'}`}>
              {totalPosts}
            </span>
          )}
        </Link>
        
        {/* Category list */}
        {categories.map(category => {
          const isActive = activeCategory === category.slug;
          
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isActive ? 'active' : ''}`}
            >
              <span>{category.name}</span>
              {showCounts && (
                <span className={`badge rounded-pill ${isActive ? 'bg-light text-dark' : 'bg-secondary'}`}>
                  {category.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Footer with total count */}
      <div className="mt-2 text-center">
        <small className="text-muted">
          {categories.length} categories • {totalPosts} total posts
        </small>
      </div>
    </div>
  );
};

export default CategoryList;