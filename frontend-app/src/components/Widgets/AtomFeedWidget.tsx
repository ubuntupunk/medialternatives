'use client';

import React, { useState } from 'react';

interface AtomFeedWidgetProps {
  className?: string;
  title?: string;
  showAsBanner?: boolean;
  showAsFooter?: boolean;
}

export default function AtomFeedWidget({
  className = '',
  title = 'Never miss a story!',
  showAsBanner = false,
  showAsFooter = false
}: AtomFeedWidgetProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible && showAsBanner) {
    return null;
  }

  const feedUrl = '/feed.atom';
  const rssReaderUrl = 'https://www.feedreader.com';

  if (showAsBanner) {
    return (
      <div className={`bg-blue-600 text-white p-4 text-center relative ${className}`}>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white hover:text-gray-200 text-xl leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
        <p className="mb-2">
          {title} Install{' '}
          <a
            href={rssReaderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            RSS Feed Reader
          </a>{' '}
          and add our feed:{' '}
          <a
            href={feedUrl}
            className="underline hover:no-underline font-semibold"
          >
            /feed.atom
          </a>
        </p>
      </div>
    );
  }

  if (showAsFooter) {
    return (
      <div className={`bg-gray-100 border-t border-gray-200 p-4 text-center ${className}`}>
        <p className="text-sm text-gray-600 mb-2">
          {title}
        </p>
        <div className="flex justify-center items-center gap-4 text-sm">
          <a
            href={rssReaderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Install RSS Reader
          </a>
          <span className="text-gray-400">•</span>
          <a
            href={feedUrl}
            className="text-blue-600 hover:text-blue-800 underline font-mono"
          >
            /feed.atom
          </a>
        </div>
      </div>
    );
  }

  // Default widget style
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-blue-600 text-2xl">
          <i className="bi bi-rss"></i>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">{title}</h3>
          <p className="text-sm text-blue-700 mb-3">
            Stay updated with our latest articles and analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={rssReaderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              <i className="bi bi-download me-1"></i>
              Get RSS Reader
            </a>
            <a
              href={feedUrl}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <i className="bi bi-rss me-1"></i>
              Subscribe to Feed
            </a>
          </div>
          <p className="text-xs text-blue-600 mt-2 font-mono">
            Feed URL: {feedUrl}
          </p>
        </div>
      </div>
    </div>
  );
}