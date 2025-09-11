import React from 'react';
import Link from 'next/link';
import { FooterProps } from '@/types';

/**
 * Footer component with copyright and navigation
 */
const Footer: React.FC<FooterProps> = ({
  className = '',
  copyrightText
}) => {
  const year = new Date().getFullYear();
  const defaultCopyrightText = `© 2005-${year}`;
  
  return (
    <footer id="colophon" className={`site-footer mt-5 ${className}`} role="contentinfo">
      {/* Divider */}
      <div className="footer-divider">
        <div className="container">
          <hr className="border-secondary opacity-25" />
        </div>
      </div>
      
      <div className="site-info py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8 col-sm-12 mb-2 mb-md-0">
              <p className="mb-0" style={{ 
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '14px',
                color: '#6c757d'
              }}>
                {copyrightText || defaultCopyrightText} Medialternatives
              </p>
            </div>
            
            <div className="col-md-4 col-sm-12 text-md-end">
              {/* Social Links */}
              <div className="footer-social-links mb-2">
                <a 
                  href="/feed.atom" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Subscribe to Atom Feed"
                  className="text-decoration-none me-3"
                  style={{ color: '#6c757d', fontSize: '18px' }}
                >
                  <i className="bi bi-rss"></i>
                </a>
                <a 
                  href="https://x.com/davidrobertlewis" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Follow on X"
                  className="text-decoration-none me-3"
                  style={{ color: '#6c757d', fontSize: '18px' }}
                >
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a 
                  href="https://facebook.com/davidrobertlewis" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Follow on Facebook"
                  className="text-decoration-none"
                  style={{ color: '#6c757d', fontSize: '18px' }}
                >
                  <i className="bi bi-facebook"></i>
                </a>
              </div>
              
              <Link 
                href="https://netbones.co.za/" 
                className="text-decoration-none text-nowrap"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '13px',
                  color: '#8B008B',
                  fontWeight: '500'
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Powered by Netbones South&nbsp;Africa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
