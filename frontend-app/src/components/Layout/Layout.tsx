"use client";

import React, { useState } from 'react';
import { LayoutProps } from '@/types';
import { LAYOUT_CONFIG } from '@/lib/constants';
import Header from '../Header/Header';
import Navigation from '../Header/Navigation';
import CustomHeader from '../Header/CustomHeader';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Main layout component that wraps all pages
 * Includes header, footer, and sidebar
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  showSidebar = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div id="page" className="site">
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <CustomHeader />
      <Navigation isMenuOpen={isMenuOpen} />
      
      <div id="content" className="site-content container">
        <div id="primary" className="content-area row">
          <main 
            id="main" 
            className={`site-main ${showSidebar ? LAYOUT_CONFIG.MAIN_COLUMN_CLASS : 'col-md-12'} ${className}`}
            role="main"
          >
            {children}
          </main>
          
          {showSidebar && <Sidebar />}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;