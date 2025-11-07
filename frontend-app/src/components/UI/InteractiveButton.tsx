"use client";

import React from 'react';
import Link from 'next/link';

interface InteractiveButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Interactive button component with hover effects
 * Client component to handle mouse events
 */
const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  href,
  children,
  className = '',
  style = {}
}) => {
  const defaultStyle = {
    display: 'inline-block',
    padding: '0.5rem 1.25rem',
    backgroundColor: '#ffffff',
    borderColor: '#0d6efd',
    color: '#0d6efd',
    fontWeight: '600',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    border: '2px solid',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    letterSpacing: '0.3px',
    ...style
  };

  return (
    <Link 
      href={href} 
      className={`btn continue-reading-btn ${className}`}
      style={defaultStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#0d6efd';
        e.currentTarget.style.color = '#ffffff';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(13, 110, 253, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = '#0d6efd';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      {children}
    </Link>
  );
};

export default InteractiveButton;