"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const [isGameMode, setIsGameMode] = useState(false);
  const [activeBricks, setActiveBricks] = useState<Set<number>>(new Set());
  const [explodingBricks, setExplodingBricks] = useState<Set<number>>(new Set());
  const [gameScore, setGameScore] = useState(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Easter egg: Enable game mode after hovering for 3 seconds
  const handleWidgetMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsGameMode(true);
      // Add some visual feedback
      if (typeof window !== 'undefined') {
        // Create a subtle vibration effect
        navigator.vibrate?.(100);
      }
    }, 3000); // 3 seconds
  };

  const handleWidgetMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };





  // Initialize active bricks when entering game mode
  useEffect(() => {
    if (isGameMode && activeBricks.size === 0) {
      const allBrickIds = new Set(categories.map(cat => cat.id));
      setActiveBricks(allBrickIds);
      setExplodingBricks(new Set());
      setGameScore(0);
    }
  }, [isGameMode, categories, activeBricks.size]);

  // Handle explosion animation cleanup
  useEffect(() => {
    if (explodingBricks.size > 0) {
      const timeout = setTimeout(() => {
        setExplodingBricks(new Set());
      }, 600); // Animation duration
      return () => clearTimeout(timeout);
    }
  }, [explodingBricks]);

  // Handle brick clicking for popping/exploding with physics
  const handleBrickClick = (categoryId: number, event: React.MouseEvent) => {
    if (!isGameMode || !activeBricks.has(categoryId)) return;

    event.preventDefault();

    // Add to exploding bricks for animation
    setExplodingBricks(prev => new Set(prev).add(categoryId));

    // Trigger vibration feedback and sound simulation
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    // Simulate explosion sound with console (could be replaced with actual audio)
    console.log('💥 BOOM! Brick exploded!');

    // Create shockwave effect - make nearby bricks shake
    const clickedCategory = categories.find(cat => cat.id === categoryId);
    if (clickedCategory) {
      // Find nearby bricks and make them shake
      categories.forEach(cat => {
        if (cat.id !== categoryId && activeBricks.has(cat.id) && !explodingBricks.has(cat.id)) {
          // Add a temporary shake effect
          const element = document.querySelector(`[href="/category/${cat.slug}"]`) as HTMLElement;
          if (element) {
            element.style.animation = 'shake 0.3s ease-in-out';
            setTimeout(() => {
              element.style.animation = '';
            }, 300);
          }
        }
      });
    }

    // Remove from active bricks after animation
    setTimeout(() => {
      setActiveBricks(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
      setGameScore(prev => prev + 50); // Higher score for popping bricks
    }, 400);

    // Check for victory
    setTimeout(() => {
      setActiveBricks(current => {
        if (current.size === 1) { // Will be 0 after this removal
          // Victory! All bricks cleared
          setTimeout(() => {
            setIsGameMode(false);
            setActiveBricks(new Set());
            setExplodingBricks(new Set());
            // Trigger victory effects
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100, 50, 200]);
            }
            console.log('🎉 VICTORY! All bricks cleared! Final Score:', gameScore);
          }, 500);
        }
        return current;
      });
    }, 450);
  };

  // Exit game mode when clicking outside or after some time
  useEffect(() => {
    if (isGameMode) {
      const exitGameMode = () => {
        setIsGameMode(false);
        setActiveBricks(new Set());
        setExplodingBricks(new Set());
        setGameScore(0);
      };
      gameTimeoutRef.current = setTimeout(exitGameMode, 60000); // 60 seconds for brick popping game

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.category-cloud-enhanced')) {
          exitGameMode();
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => {
        if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isGameMode]);

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
    <div
      className={`widget category-cloud-enhanced ${className} ${isGameMode ? 'game-mode' : ''}`}
      style={{ marginTop: '30px' }}
      onMouseEnter={handleWidgetMouseEnter}
      onMouseLeave={handleWidgetMouseLeave}
    >
      <h3 className="widget-title">
        Categories
        {isGameMode && activeBricks.size === 0 && (
          <span className="victory-indicator" style={{
            fontSize: '0.9em',
            color: '#ffd700',
            marginLeft: '8px',
            animation: 'victoryFlash 0.5s ease-in-out infinite alternate',
            fontWeight: 'bold'
          }}>
            🎉 VICTORY! Final Score: {gameScore}
          </span>
        )}
        {isGameMode && activeBricks.size > 0 && (
          <span className="game-mode-indicator" style={{
            fontSize: '0.8em',
            color: '#ff6b6b',
            marginLeft: '8px',
            animation: 'pulse 1s infinite'
          }}>
            💥 Brick Popper! Score: {gameScore} | Bricks Left: {activeBricks.size}
          </span>
        )}
      </h3>
      <div className={`tagcloud ${layout === 'list' ? 'tagcloud-list' : layout === 'grid' ? 'tagcloud-grid' : ''}`}>
        {categories.map((category, index) => {
          const fontSize = calculateCategoryFontSize(
            category,
            categories,
            minFontSize,
            maxFontSize
          );

          const isActive = activeCategory === category.slug;
          const isVisible = !isGameMode || activeBricks.has(category.id);
          const isExploding = explodingBricks.has(category.id);
          const colorClass = `category-${index % 9}`;

          if (!isVisible) return null;

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`tag-link ${colorClass} ${isActive ? 'active' : ''} ${isGameMode ? 'game-mode-link pop-brick' : ''} ${isExploding ? 'exploding' : ''}`}
              onClick={(e) => isGameMode && handleBrickClick(category.id, e)}
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
                transition: isGameMode ? 'all 0.3s ease' : 'all 0.3s ease',
                border: isActive ? '2px solid #fff' : '2px solid transparent',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                position: 'relative',
                zIndex: isActive ? 10 : 1,
                cursor: isGameMode ? 'pointer' : 'pointer',
                transform: isExploding ? 'scale(1.5) translateY(-20px)' : 'scale(1)',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isGameMode) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.opacity = '0.9';
                } else if (isGameMode && !isExploding) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isGameMode) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '0.8';
                } else if (isGameMode && !isExploding) {
                  e.currentTarget.style.transform = 'scale(1)';
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