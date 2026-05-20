import React from 'react';
import { decodeHtmlEntities } from '@/utils/helpers';

interface SocialShareProps {
  url: string;
  title: string;
  className?: string;
}

/**
 * Social sharing component for posts
 * Provides buttons to share content on various social platforms
 */
const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  className = ''
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(decodeHtmlEntities(title));

  return (
    <div className={`social-share ${className}`}>
      <h6 className="mb-3">Share this article:</h6>
      <div className="d-flex flex-wrap gap-2" role="group" aria-label="Share this article">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center share-btn"
          style={{ width: '40px', height: '40px', padding: 0 }}
          aria-label="Share on Twitter"
        >
          <i className="bi bi-twitter"></i>
          <span className="d-none d-md-inline ms-1">Twitter</span>
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center share-btn"
          style={{ width: '40px', height: '40px', padding: 0 }}
          aria-label="Share on Facebook"
        >
          <i className="bi bi-facebook"></i>
          <span className="d-none d-md-inline ms-1">Facebook</span>
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center share-btn"
          style={{ width: '40px', height: '40px', padding: 0 }}
          aria-label="Share on LinkedIn"
        >
          <i className="bi bi-linkedin"></i>
          <span className="d-none d-md-inline ms-1">LinkedIn</span>
        </a>

        <a
          href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center share-btn"
          style={{ width: '40px', height: '40px', padding: 0 }}
          aria-label="Share on Reddit"
        >
          <i className="bi bi-reddit"></i>
          <span className="d-none d-md-inline ms-1">Reddit</span>
        </a>

        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center share-btn"
          style={{ width: '40px', height: '40px', padding: 0 }}
          aria-label="Share on WhatsApp"
        >
          <i className="bi bi-whatsapp"></i>
          <span className="d-none d-md-inline ms-1">WhatsApp</span>
        </a>

        <a
          href={`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check out this article: ${decodeHtmlEntities(title)}\n\n${url}`)}`}
          className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center share-btn"
          style={{ width: '40px', height: '40px', padding: 0 }}
          aria-label="Share via Email"
        >
          <i className="bi bi-envelope"></i>
          <span className="d-none d-md-inline ms-1">Email</span>
        </a>
      </div>
    </div>
  );
};

export default SocialShare;