"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CategoryCloudProps, WordPressCategory } from '@/types';
import { wordpressApi } from '@/services/wordpress-api';
import { calculateCategoryFontSize } from '@/utils/helpers';

interface CategoryCloudEnhancedProps extends CategoryCloudProps {
  activeCategory?: string | null;
  showCounts?: boolean;
  layout?: 'cloud' | 'list' | 'grid';
}

/**
 * Enhanced category cloud widget with active states and additional features
 * Builds on the existing CategoryCloud design with improvements
 */
const CategoryCloudEnhanced: React.FC<CategoryCloudEnhancedProps> = ({
  categories: initialCategories,
  maxFontSize = 24,
  minFontSize = 12,
  className = '',
  activeCategory = null,
  showCounts = false,
  layout = 'cloud'
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
            per_page: 50,
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
  }, [initialCategories]);

  if (isLoading) {
    return <div className="widget category-cloud-enhanced">Loading categories...</div>;
  }

  if (error) {
    return <div className="widget category-cloud-enhanced">Error: {error}</div>;
  }

  if (!categories || categories.length === 0) {
    return <div className="widget category-cloud-enhanced">No categories found.</div>;
  }

  return (
    <div className={`widget category-cloud-enhanced ${className}`} style={{ marginTop: '30px' }}>
      <h3 className="widget-title">Categories</h3>
      <div className={`tagcloud ${layout === 'list' ? 'tagcloud-list' : layout === 'grid' ? 'tagcloud-grid' : ''}`}>
        {categories.map((category, index) => {
          const fontSize = calculateCategoryFontSize(
            category,
            categories,
            minFontSize,
            maxFontSize
          );
          
          const isActive = activeCategory === category.slug;
          const colorClass = `category-${index % 9}`;
          
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`tag-link ${colorClass} ${isActive ? 'active' : ''}`}
              style={{
                fontSize: `${fontSize}px`,
                display: layout === 'list' ? 'block' : 'inline-block',
                margin: layout === 'list' ? '0 0 5px 0' : '0 5px 5px 0',
                padding: '0 6px',
                lineHeight: '30px',
                borderRadius: '5px',
                color: '#FFF',
                opacity: isActive ? 1 : 0.8,
                fontFamily: 'cambria',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: isActive ? '2px solid #fff' : '2px solid transparent',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                position: 'relative',
                zIndex: isActive ? 10 : 1
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
            >
              {category.name}
              {showCounts && (
                <span 
                  style={{
                    fontSize: '0.8em',
                    opacity: 0.9,
                    marginLeft: '4px'
                  }}
                >
                  ({category.count})
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Optional "View All" link */}
      <div className="mt-3 text-center">
        <Link 
          href="/blog" 
          className="btn btn-sm btn-outline-secondary"
          style={{ fontSize: '12px' }}
        >
          View All Posts
        </Link>
      </div>
    </div>
  );
};

export default CategoryCloudEnhanced;