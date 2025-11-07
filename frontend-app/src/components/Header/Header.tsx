"use client";

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import Navbar from './Navbar';

/**
 * Header component with site branding, navigation and search
 */
interface HeaderProps {
  siteTitle?: string;
  siteDescription?: string;
}

const Header: React.FC<HeaderProps> = ({
  siteTitle = SITE_CONFIG.SITE_TITLE,
  siteDescription = SITE_CONFIG.SITE_DESCRIPTION,
}) => {
  // Use hardcoded site info instead of fetching from API
  const siteInfo = {
    title: siteTitle,
    description: siteDescription
  };

  return (
    <header id="masthead" className="site-header" role="banner">
      <div className="site-branding">
        <div className="top-header container">
          {/* Social menu will be implemented later */}
          
          <div className="clearfix"></div>
        </div>

        <div className="container pt-5">
          <h1 className="site-title text-center">
            <Link href="/" rel="home">
              {siteInfo.title}
            </Link>
          </h1>
          
          <p className="site-description text-center">
            {siteInfo.description}
          </p>
        </div>
        
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
