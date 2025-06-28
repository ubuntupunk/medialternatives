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
  const defaultCopyrightText = `© 2005-${year}`;
  
  return (
    <footer id="colophon" className={`site-footer mt-5 ${className}`} role="contentinfo">
      <div className="site-info">
        <div className="container">
          <div className="row">
            <div className="copyright-info col-md-6 col-sm-12">
              <Link href="https://netbones.co.za/" className="text-nowrap">Proudly powered by Netbones South Africa</Link>
              <span className="sep"> | </span>
              {copyrightText || defaultCopyrightText}
            </div>
            
            {/* {showNavigation && (
              <div className="main-footer-navigation col-md-6 col-sm-12">
                <nav className="footer-navigation">
                  <ul id="footer-menu" className="menu">
                    <li className="menu-item">
                      <Link href="/">Blog</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/about">About</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/handbook">Handbook</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/components">Components</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/contact">Contact</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
