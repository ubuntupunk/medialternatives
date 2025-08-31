// Re-export all types for easier imports
export * from './wordpress';

import { WordPressUser } from './wordpress';

/**
 * Props for the main layout component
 * @interface LayoutProps
 * @property {React.ReactNode} children - Child components to render
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showSidebar] - Whether to show the sidebar
 */
export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

/**
 * Props for the header component
 * @interface HeaderProps
 * @property {string} [siteTitle] - Site title to display
 * @property {string} [siteDescription] - Site description to display
 * @property {boolean} [showSearch] - Whether to show search functionality
 * @property {boolean} [showSocialMenu] - Whether to show social media menu
 */
export interface HeaderProps {
  siteTitle?: string;
  siteDescription?: string;
  showSearch?: boolean;
  showSocialMenu?: boolean;
}

/**
 * Props for the sidebar component
 * @interface SidebarProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode[]} [widgets] - Array of widget components to render
 */
export interface SidebarProps {
  className?: string;
  widgets?: React.ReactNode[];
}

/**
 * Props for the footer component
 * @interface FooterProps
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showNavigation] - Whether to show navigation links
 * @property {string} [copyrightText] - Copyright text to display
 */
export interface FooterProps {
  className?: string;
  showNavigation?: boolean;
  copyrightText?: string;
}


/**
 * Props for the search form component
 * @interface SearchFormProps
 * @property {string} [placeholder] - Placeholder text for search input
 * @property {string} [className] - Additional CSS classes
 * @property {(query: string) => void} [onSearch] - Callback when search is performed
 */
export interface SearchFormProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

/**
 * Navigation item structure
 * @interface NavigationItem
 * @property {number} id - Unique identifier for the navigation item
 * @property {string} title - Display title of the navigation item
 * @property {string} url - URL the navigation item links to
 * @property {NavigationItem[]} [children] - Child navigation items for dropdowns
 */
export interface NavigationItem {
  id: number;
  title: string;
  url: string;
  children?: NavigationItem[];
}

/**
 * Props for the navigation component
 * @interface NavigationProps
 * @property {NavigationItem[]} items - Array of navigation items to display
 * @property {string} [className] - Additional CSS classes
 * @property {'horizontal' | 'vertical'} [orientation] - Layout orientation of navigation
 */
export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Handbook section structure
 * @interface HandbookSection
 * @property {string} id - Unique identifier for the handbook section
 * @property {string} title - Title of the handbook section
 * @property {string} content - Content of the handbook section
 * @property {string} slug - URL slug for the handbook section
 * @property {number} order - Display order of the handbook section
 */
export interface HandbookSection {
  id: string;
  title: string;
  content: string;
  slug: string;
  order: number;
}

/**
 * Props for the handbook component
 * @interface HandbookProps
 * @property {HandbookSection[]} sections - Array of handbook sections
 * @property {string} [currentSection] - ID of the currently active section
 */
export interface HandbookProps {
  sections: HandbookSection[];
  currentSection?: string;
}

/**
 * State for error boundary component
 * @interface ErrorBoundaryState
 * @property {boolean} hasError - Whether an error has occurred
 * @property {Error} [error] - The error that occurred
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Loading state interface
 * @interface LoadingState
 * @property {boolean} isLoading - Whether content is currently loading
 * @property {string} [error] - Error message if loading failed
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/**
 * Props for SEO meta tags component
 * @interface SEOProps
 * @property {string} [title] - Page title for SEO
 * @property {string} [description] - Page description for SEO
 * @property {string[]} [keywords] - SEO keywords
 * @property {string} [image] - Open Graph image URL
 * @property {string} [url] - Canonical URL
 * @property {'website' | 'article'} [type] - Open Graph type
 * @property {string} [publishedTime] - Article published time (ISO 8601)
 * @property {string} [modifiedTime] - Article modified time (ISO 8601)
 * @property {string} [author] - Article author name
 */
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


/**
 * Props for AdSense widget component
 * @interface AdSenseWidgetProps
 * @property {string} [adSlot] - AdSense ad slot ID
 * @property {string} [adClient] - AdSense client ID
 * @property {string} [adFormat] - Ad format (auto, rectangle, etc.)
 * @property {string} [adLayout] - Ad layout configuration
 * @property {string} [className] - Additional CSS classes
 */
export interface AdSenseWidgetProps {
  adSlot?: string;
  adClient?: string;
  adFormat?: string;
  adLayout?: string;
  className?: string;
}

/**
 * Props for donate widget component
 * @interface DonateWidgetProps
 * @property {string} [title] - Widget title
 * @property {string} paypalHostedButtonId - PayPal hosted button ID
 * @property {string} [buttonText] - Text for the donate button
 */
export interface DonateWidgetProps {
  title?: string;
  paypalHostedButtonId: string;
  buttonText?: string;
}

/**
 * Props for webring widget component
 * @interface WebringWidgetProps
 * @property {string} [title] - Widget title
 * @property {string} [webringUrl] - URL of the webring
 */
export interface WebringWidgetProps {
  title?: string;
  webringUrl?: string;
}

/**
 * Props for category cloud widget component
 * @interface CategoryCloudProps
 * @property {import('./wordpress').WordPressCategory[]} [categories] - Array of categories to display
 * @property {number} [maxFontSize] - Maximum font size for largest category
 * @property {number} [minFontSize] - Minimum font size for smallest category
 * @property {string} [className] - Additional CSS classes
 */
export interface CategoryCloudProps {
  categories?: import('./wordpress').WordPressCategory[];
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}

/**
 * Props for Creative Commons widget component
 * @interface CreativeCommonsWidgetProps
 * @property {string} [title] - Widget title
 * @property {string} [className] - Additional CSS classes
 */
export interface CreativeCommonsWidgetProps {
  title?: string;
  className?: string;
}

/**
 * Props for pagination component
 * @interface PaginationProps
 * @property {number} currentPage - Current active page number
 * @property {number} totalPages - Total number of pages available
 * @property {string} baseUrl - Base URL for pagination links
 * @property {string} [className] - Additional CSS classes
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}
