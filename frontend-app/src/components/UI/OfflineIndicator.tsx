"use client";

import React, { useState, useEffect } from 'react';

interface OfflineIndicatorProps {
  className?: string;
}

/**
 * Offline Indicator component
 * Shows a banner when the user is offline and content is being served from cache
 */
const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if online
  if (isOnline && !showOfflineBanner) {
    return null;
  }

  return (
    <div 
      className={`offline-indicator ${className}`}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: '#856404',
        color: '#fff3cd',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        zIndex: 1060,
        borderBottom: '1px solid #664d03',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container d-flex align-items-center justify-content-center gap-2">
        <svg 
          width="16" 
          height="16" 
          fill="currentColor" 
          viewBox="0 0 16 16"
          style={{ flexShrink: 0 }}
        >
          <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
          <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
        </svg>
        
        <span style={{ fontWeight: '500' }}>
          {isOnline ? (
            '🟢 Back online! Content is now fresh.'
          ) : (
            '📱 You\'re offline. Reading cached articles.'
          )}
        </span>
        
        {showOfflineBanner && isOnline && (
          <button
            onClick={() => setShowOfflineBanner(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0',
              marginLeft: '8px'
            }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;