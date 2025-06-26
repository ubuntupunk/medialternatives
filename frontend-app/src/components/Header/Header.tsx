"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { HeaderProps } from '@/types';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Header component with site branding, navigation and search
 */
const Header: React.FC<HeaderProps> = ({
  siteTitle = SITE_CONFIG.SITE_TITLE,
  siteDescription = SITE_CONFIG.SITE_DESCRIPTION,
  showSearch = true,
  showSocialMenu = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use hardcoded site info instead of fetching from API
  const siteInfo = {
    title: siteTitle,
    description: siteDescription
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header id="masthead" className="site-header" role="banner">
      <div className="site-branding">
        <div className="top-header container">
          {showSocialMenu && (
            <div className="blaskan-social-menu pull-right">
              {/* Social menu will be implemented later */}
              <nav className="social-navigation">
                <ul id="social-menu" className="menu">
                  <li className="menu-item">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <span>Twitter</span>
                    </a>
                  </li>
                  <li className="menu-item">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <span>Facebook</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          )}
          
          {showSearch && (
            <div className="search-header-form-container pull-right">
              <div id="search-header-form" className="search">
                <form role="search" method="get" className="search-form" action="/">
                  <input id="search" type="search" name="s" placeholder="Search ..." />
                  <label htmlFor="search">
                    <i className="fa fa-search" aria-hidden="true"></i>
                  </label>
                </form>
              </div>
            </div>
          )}
          
          <div className="clearfix"></div>
        </div>

        <div className="container">
          <h1 className="site-title">
            <Link href="/" rel="home">
              {siteInfo.title}
            </Link>
          </h1>
          
          <p className="site-description">
            {siteInfo.description}
          </p>
        </div>
      </div>

      <nav id="site-navigation" className="main-navigation container" role="navigation">
        <button 
          className="menu-toggle" 
          aria-controls="primary-menu"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          Menu
        </button>
        
        <div className={`blaskan-main-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul id="primary-menu" className="menu">
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
              <Link href="/components">Components</Link>
            </li>
            <li className="menu-item">
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;