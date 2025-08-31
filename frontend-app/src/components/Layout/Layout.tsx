"use client";

import React from 'react';
import { LayoutProps } from '@/types';
import { LAYOUT_CONFIG } from '@/lib/constants';
import Header from '../Header/Header';
import CustomHeader from '../Header/CustomHeader';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AddToHomeScreen from '../UI/AddToHomeScreen';
import OfflineIndicator from '../UI/OfflineIndicator';

/**
 * Main Layout Component
 *
 * Provides the overall page structure for the Media Alternatives application.
 * Includes header, sidebar, main content area, and footer components.
 *
 * @component
 * @param {LayoutProps} props - The component props
 * @returns {JSX.Element} The rendered layout
 *
 * @example
 * ```tsx
 * <Layout showSidebar={true}>
 *   <h1>Welcome to Media Alternatives</h1>
 *   <p>Main content goes here...</p>
 * </Layout>
 * ```
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  showSidebar = true
}) => {
  return (
    <div id="page" className="site">
      <OfflineIndicator />
      <Header />
      <CustomHeader />
      
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
      <AddToHomeScreen />
    </div>
  );
};

export default Layout;
