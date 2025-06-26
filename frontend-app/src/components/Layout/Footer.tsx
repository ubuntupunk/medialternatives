import React from 'react';
import Link from 'next/link';
import { FooterProps } from '@/types';

/**
 * Footer component with copyright and navigation
 */
const Footer: React.FC<FooterProps> = ({
  className = '',
  showNavigation = true,
  copyrightText
}) => {
  const year = new Date().getFullYear();
  const defaultCopyrightText = `© ${year} - Powered by Next.js and WordPress.com`;
  
  return (
    <footer id="colophon" className={`site-footer ${className}`} role="contentinfo">
      <div className="site-info">
        <div className="container">
          <div className="row">
            <div className="copyright-info col-md-6 col-sm-12">
              <Link href="https://wordpress.org/">Proudly powered by WordPress</Link>
              <span className="sep"> | </span>
              {copyrightText || defaultCopyrightText}
            </div>
            
            {showNavigation && (
              <div className="main-footer-navigation col-md-6 col-sm-12">
                <nav className="footer-navigation">
                  <ul id="footer-menu" className="menu">
                    <li className="menu-item">
                      <Link href="/">Home</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/about">About</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/handbook">Handbook</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/contact">Contact</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;