// Re-export all types for easier imports
export * from './wordpress';

// Additional component types
export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

export interface HeaderProps {
  siteTitle?: string;
  siteDescription?: string;
  showSearch?: boolean;
  showSocialMenu?: boolean;
}

export interface SidebarProps {
  className?: string;
  widgets?: React.ReactNode[];
}

export interface FooterProps {
  className?: string;
  showNavigation?: boolean;
  copyrightText?: string;
}

// AdSense component types
export interface AuthorWidgetProps {
  authorId?: number;
  author?: WordPressUser; // Add this line
  title?: string;
  showSocialMenu?: boolean;
}

// Search component types
export interface SearchFormProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

// Navigation types
export interface NavigationItem {
  id: number;
  title: string;
  url: string;
  children?: NavigationItem[];
}

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

// Handbook types
export interface HandbookSection {
  id: string;
  title: string;
  content: string;
  slug: string;
  order: number;
}

export interface HandbookProps {
  sections: HandbookSection[];
  currentSection?: string;
}

// Error handling types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// SEO types
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

// Global window extensions
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface AuthorWidgetProps {
  authorId?: number;
  author?: WordPressUser; // Add this line
  title?: string;
  showSocialMenu?: boolean;
}

export interface AdSenseWidgetProps {
  adSlot?: string;
  adClient?: string;
  adFormat?: string;
  adLayout?: string;
  className?: string;
}
