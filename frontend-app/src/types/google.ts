/**
 * Google Adsense API Types
 * Type definitions for Google Adsense API responses and requests
 */

/**
 * Google OAuth2 Code Challenge Method
 */
export type CodeChallengeMethod = 'S256' | 'plain';

/**
 * Google Adsense Account
 */
export interface AdsenseAccount {
  name: string;
  displayName: string;
  state: 'READY' | 'NEEDS_ATTENTION' | 'CLOSED';
  timezone: {
    id: string;
  };
  currencyCode: string;
  createTime: string;
}

/**
 * Google Adsense Ad Unit
 */
export interface AdsenseAdUnit {
  name: string;
  displayName: string;
  state: 'ACTIVE' | 'ARCHIVED';
  contentAdsSettings: {
    size: string;
    type: 'DISPLAY' | 'TEXT_AND_DISPLAY';
  };
  reportingDimensionId: string;
}

/**
 * Google Adsense Report Request
 */
export interface AdsenseReportRequest {
  account: string;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  endDate: {
    year: number;
    month: number;
    day: number;
  };
  dimensions?: string[];
  metrics: string[];
  dateRange?: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'CUSTOM';
  filters?: Array<{
    dimension: string;
    operator: 'EQUAL' | 'NOT_EQUAL' | 'IN' | 'NOT_IN';
    values: string[];
  }>;
}

/**
 * Google Adsense Report Response
 */
export interface AdsenseReportResponse {
  rows?: Array<{
    dimensionValues: {
      [key: string]: {
        value: string;
      };
    };
    metricValues: {
      [key: string]: {
        value: string;
        currencyCode?: string;
      };
    };
  }>;
  totals?: {
    cells: Array<{
      value: string;
      currencyCode?: string;
    }>;
  };
  rowCount: number;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  endDate: {
    year: number;
    month: number;
    day: number;
  };
}

/**
 * Google Adsense API Error
 */
export interface AdsenseApiError {
  error: {
    code: number;
    message: string;
    status: string;
    details?: Array<{
      '@type': string;
      fieldViolations?: Array<{
        field: string;
        description: string;
      }>;
    }>;
  };
}

/**
 * Google OAuth2 Token Response
 */
export interface GoogleOAuth2TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

/**
 * Google OAuth2 Token Error
 */
export interface GoogleOAuth2TokenError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

/**
 * Jetpack Analytics Data Structure
 */
export interface JetpackAnalyticsData {
  visits: number;
  views: number;
  visitors: number;
  topPosts: Array<{
    title: string;
    url: string;
    views: number;
    percentage: number;
  }>;
  referrers: Array<{
    name: string;
    views: number;
    percentage: number;
  }>;
  searchTerms: Array<{
    term: string;
    views: number;
    percentage: number;
  }>;
  summary: {
    period: string;
    views: number;
    visitors: number;
    likes: number;
    comments: number;
  };
}

/**
 * Jetpack API Cache Entry
 */
export interface JetpackCacheEntry {
  data: JetpackAnalyticsData;
  timestamp: number;
}

/**
 * WordPress.com API Response Structure
 */
export interface WordPressComApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    data?: any;
  };
  success: boolean;
}

/**
 * WordPress.com Stats API Response
 */
export interface WordPressComStatsResponse {
  stats: {
    visits: {
      [date: string]: number;
    };
    views: {
      [date: string]: number;
    };
    visitors: {
      [date: string]: number;
    };
  };
  top_posts: Array<{
    id: number;
    title: string;
    url: string;
    views: number;
  }>;
  referrers: Array<{
    name: string;
    views: number;
  }>;
  search_terms: Array<{
    term: string;
    views: number;
  }>;
  summary: {
    period: string;
    views: number;
    visitors: number;
    likes: number;
    comments: number;
  };
}

/**
 * WordPress.com OAuth Token Structure
 */
export interface WordPressComToken {
  access_token: string;
  siteId: string;
  expires_at?: number;
  scope?: string;
}

/**
 * WordPress.com Top Posts Data Structure
 */
export interface WordPressComTopPost {
  title: string;
  href: string;
  views: number;
}

/**
 * WordPress.com Referrer Data Structure
 */
export interface WordPressComReferrer {
  name: string;
  views: number;
}

/**
 * WordPress.com Stats Summary Data
 */
export interface WordPressComStatsSummary {
  visitors: number;
  visits: number;
  views: number;
}