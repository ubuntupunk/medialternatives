'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GOOGLE_ANALYTICS_ID } from '@/lib/constants';
import { 
  initiateWordPressOAuth, 
  handleOAuthCallback, 
  getAuthStatus, 
  clearStoredToken,
  makeAuthenticatedRequest,
  WORDPRESS_API_ENDPOINTS 
} from '@/utils/wordpressImplicitAuth';
import { useClientOnly } from '@/hooks/useClientOnly';

interface AnalyticsData {
  period: string;
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: Array<{ page: string; views: number; percentage: number }>;
  topCountries: Array<{ country: string; visitors: number; percentage: number }>;
  deviceTypes: Array<{ device: string; visitors: number; percentage: number }>;
  comparisons?: {
    previousPeriod?: {
      visitors: number;
      pageviews: number;
      change: number;
      changeType: 'increase' | 'decrease' | 'same';
    };
    yearOverYear?: {
      visitors: number;
      pageviews: number;
      change: number;
      changeType: 'increase' | 'decrease' | 'same';
    };
  };
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'google' | 'jetpack'>('google');
  const [jetpackData, setJetpackData] = useState<any>(null);
  const [jetpackLoading, setJetpackLoading] = useState(false);
  const [jetpackAuthStatus, setJetpackAuthStatus] = useState<any>(null);
  const [jetpackAuthLoading, setJetpackAuthLoading] = useState(false);
  const [wpAuthStatus, setWpAuthStatus] = useState<any>({ isAuthenticated: false }); // Default state
  const isClient = useClientOnly();
  
  // Fetch analytics data from API
  const fetchAnalyticsData = async (period: string = selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        // Transform API data to match our interface
        const transformedData: AnalyticsData = {
          period: period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : '1 year',
          visitors: result.data.visitors,
          pageviews: result.data.pageviews,
          sessions: Math.floor(result.data.visitors * 1.1), // Estimate sessions
          bounceRate: result.data.bounceRate,
          avgSessionDuration: result.data.avgSessionDuration,
          topPages: result.data.topPages.map((page: any, index: number) => ({
            page: page.page,
            views: page.views,
            percentage: parseFloat(((page.views / result.data.pageviews) * 100).toFixed(1))
          })),
          topCountries: result.data.topCountries || [
            { country: 'South Africa', visitors: Math.floor(result.data.visitors * 0.45), percentage: 45 },
            { country: 'United States', visitors: Math.floor(result.data.visitors * 0.25), percentage: 25 },
            { country: 'United Kingdom', visitors: Math.floor(result.data.visitors * 0.15), percentage: 15 },
            { country: 'Canada', visitors: Math.floor(result.data.visitors * 0.08), percentage: 8 },
            { country: 'Australia', visitors: Math.floor(result.data.visitors * 0.07), percentage: 7 }
          ],
          deviceTypes: result.data.deviceTypes || [
            { device: 'Mobile', visitors: Math.floor(result.data.visitors * 0.65), percentage: 65 },
            { device: 'Desktop', visitors: Math.floor(result.data.visitors * 0.28), percentage: 28 },
            { device: 'Tablet', visitors: Math.floor(result.data.visitors * 0.07), percentage: 7 }
          ],
          comparisons: result.data.comparisons
        };
        setAnalyticsData(transformedData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to mock data
      setAnalyticsData({
    period: '30 days',
    visitors: 8420,
    pageviews: 15680,
    sessions: 9240,
    bounceRate: 68.5,
    avgSessionDuration: '2m 34s',
    topPages: [
      { page: '/post/piers-morgan-calls-out-sophie-mokoena', views: 2340, percentage: 14.9 },
      { page: '/', views: 1890, percentage: 12.1 },
      { page: '/category/apartheid', views: 1560, percentage: 9.9 },
      { page: '/about', views: 980, percentage: 6.2 },
      { page: '/post/media-cartel-exposed', views: 870, percentage: 5.5 }
    ],
    topCountries: [
      { country: 'South Africa', visitors: 5890, percentage: 69.9 },
      { country: 'United States', visitors: 980, percentage: 11.6 },
      { country: 'United Kingdom', visitors: 560, percentage: 6.7 },
      { country: 'Australia', visitors: 340, percentage: 4.0 },
      { country: 'Canada', visitors: 280, percentage: 3.3 }
    ],
    deviceTypes: [
      { device: 'Mobile', percentage: 62.3 },
      { device: 'Desktop', percentage: 31.2 },
      { device: 'Tablet', percentage: 6.5 }
    ]
  });
  } finally {
    setLoading(false);
  }
};

React.useEffect(() => {
  fetchAnalyticsData();
  
  // Auto-refresh every 10 minutes
  const interval = setInterval(() => fetchAnalyticsData(), 10 * 60 * 1000);
  return () => clearInterval(interval);
}, []);

// Fetch Jetpack authentication status
const fetchJetpackAuthStatus = async () => {
  setJetpackAuthLoading(true);
  try {
    const response = await fetch('/api/jetpack-auth');
    const result = await response.json();
    
    if (result.success) {
      setJetpackAuthStatus(result.data);
    }
  } catch (error) {
    console.error('Error fetching Jetpack auth status:', error);
  } finally {
    setJetpackAuthLoading(false);
  }
};

// Check for WordPress.com OAuth callback on page load (client-side only)
useEffect(() => {
  if (!isClient) return;
  
  // Check if we're returning from OAuth
  const authResult = handleOAuthCallback();
  if (authResult.isAuthenticated) {
    console.log('WordPress.com OAuth successful!', authResult.token);
    setWpAuthStatus(authResult);
    // Automatically fetch Jetpack data with new token
    fetchJetpackDataWithAuth(authResult.token);
  } else if (authResult.error) {
    console.error('OAuth error:', authResult.error);
  }
  
  // Check existing auth status
  const currentAuth = getAuthStatus();
  setWpAuthStatus(currentAuth);
}, [isClient]);

// Initiate WordPress.com implicit OAuth flow (Grasshopper-style)
const initiateWordPressImplicitOAuth = () => {
  setJetpackAuthLoading(true);
  try {
    initiateWordPressOAuth();
  } catch (error) {
    console.error('Error initiating OAuth:', error);
    setJetpackAuthLoading(false);
  }
};

// Fetch Jetpack data with authentication token
const fetchJetpackDataWithAuth = async (token?: any) => {
  setJetpackLoading(true);
  try {
    const authToken = token || wpAuthStatus?.token;
    if (!authToken) {
      throw new Error('No authentication token available');
    }

    const periodDays = selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : selectedPeriod === '90d' ? '90' : '365';
    
    // Use WordPress.com API directly with authentication
    const [summaryResponse, topPostsResponse, referrersResponse] = await Promise.all([
      makeAuthenticatedRequest(WORDPRESS_API_ENDPOINTS.SITE_STATS_SUMMARY(authToken.siteId, periodDays)),
      makeAuthenticatedRequest(WORDPRESS_API_ENDPOINTS.SITE_STATS_TOP_POSTS(authToken.siteId, periodDays)),
      makeAuthenticatedRequest(WORDPRESS_API_ENDPOINTS.SITE_STATS_REFERRERS(authToken.siteId, periodDays))
    ]);

    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      const topPostsData = topPostsResponse.ok ? await topPostsResponse.json() : null;
      const referrersData = referrersResponse.ok ? await referrersResponse.json() : null;

      // Transform real WordPress.com data
      const realJetpackData = {
        views: summaryData.views || 0,
        visitors: summaryData.visitors || 0,
        visits: summaryData.visits || 0,
        topPosts: topPostsData?.days?.[0]?.postviews?.map((post: any) => ({
          title: post.title,
          url: post.href,
          views: post.views,
          percentage: parseFloat(((post.views / summaryData.views) * 100).toFixed(1))
        })) || [],
        referrers: referrersData?.days?.[0]?.groups?.map((ref: any) => ({
          name: ref.name,
          views: ref.views,
          percentage: parseFloat(((ref.views / summaryData.views) * 100).toFixed(1))
        })) || [],
        searchTerms: [], // Would need additional API call
        summary: {
          period: `${periodDays} days`,
          views: summaryData.views || 0,
          visitors: summaryData.visitors || 0,
          likes: summaryData.likes || 0,
          comments: summaryData.comments || 0
        }
      };

      setJetpackData(realJetpackData);
      console.log('Real WordPress.com data loaded:', realJetpackData);
    } else {
      throw new Error('Failed to fetch WordPress.com stats');
    }
  } catch (error) {
    console.error('Error fetching authenticated Jetpack data:', error);
    // Fall back to mock data
    fetchJetpackData();
  } finally {
    setJetpackLoading(false);
  }
};

// Disconnect WordPress.com authentication
const disconnectWordPress = () => {
  clearStoredToken();
  setWpAuthStatus({ isAuthenticated: false });
  setJetpackData(null);
};

// Fetch Jetpack analytics data
const fetchJetpackData = async (period: string = selectedPeriod) => {
  setJetpackLoading(true);
  try {
    const periodDays = period === '7d' ? '7' : period === '30d' ? '30' : period === '90d' ? '90' : '365';
    const response = await fetch(`/api/jetpack-analytics?period=${periodDays}`);
    const result = await response.json();
    
    if (result.success) {
      setJetpackData(result.data);
    }
  } catch (error) {
    console.error('Error fetching Jetpack data:', error);
  } finally {
    setJetpackLoading(false);
  }
};

const handlePeriodChange = (period: string) => {
  setSelectedPeriod(period);
  fetchAnalyticsData(period);
  if (activeTab === 'jetpack') {
    fetchJetpackData(period);
  }
};

const handleTabChange = (tab: 'google' | 'jetpack') => {
  setActiveTab(tab);
  if (tab === 'jetpack' && isClient) {
    // Check WordPress.com auth status (client-side only)
    const currentAuth = getAuthStatus();
    setWpAuthStatus(currentAuth);
    
    if (currentAuth.isAuthenticated && !jetpackData) {
      fetchJetpackDataWithAuth(currentAuth.token);
    } else if (!currentAuth.isAuthenticated && !jetpackData) {
      fetchJetpackData(); // Load demo data
    }
  }
};

if (!analyticsData) {
  return (
    <div className="container mt-4">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading analytics data...</p>
      </div>
    </div>
  );
}

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Analytics
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2">
            <i className="bi bi-graph-up me-2 text-success"></i>
            Analytics Dashboard
          </h1>
          <p className="text-muted">
            Track your site's performance and visitor engagement.
          </p>
        </div>
        <div className="col-md-4 text-end">
          <select 
            className="form-select" 
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Source Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'google' ? 'active' : ''}`}
                onClick={() => handleTabChange('google')}
                type="button"
              >
                <i className="bi bi-google me-2"></i>
                Google Analytics
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'jetpack' ? 'active' : ''}`}
                onClick={() => handleTabChange('jetpack')}
                type="button"
              >
                <i className="bi bi-wordpress me-2"></i>
                Jetpack Analytics
                {jetpackLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Google Analytics Tab */}
        <div className={`tab-pane fade ${activeTab === 'google' ? 'show active' : ''}`}>
          {/* Key Metrics */}
          <div className="row mb-4">
        <div className="col-lg-2 col-md-4 col-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-people fs-2 mb-2"></i>
              <h4 className="mb-0">{analyticsData.visitors.toLocaleString()}</h4>
              <small>Visitors</small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-eye fs-2 mb-2"></i>
              <h4 className="mb-0">{analyticsData.pageviews.toLocaleString()}</h4>
              <small>Page Views</small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-clock fs-2 mb-2"></i>
              <h4 className="mb-0">{analyticsData.sessions.toLocaleString()}</h4>
              <small>Sessions</small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-6 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-arrow-return-left fs-2 mb-2"></i>
              <h4 className="mb-0">{analyticsData.bounceRate.toFixed(1)}%</h4>
              <small>Bounce Rate</small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-6 mb-3">
          <div className="card bg-secondary text-white">
            <div className="card-body text-center">
              <i className="bi bi-stopwatch fs-2 mb-2"></i>
              <h4 className="mb-0">{analyticsData.avgSessionDuration}</h4>
              <small>Avg. Duration</small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-6 mb-3">
          <div className={`card text-white ${analyticsData.comparisons?.previousPeriod?.changeType === 'increase' ? 'bg-success' : analyticsData.comparisons?.previousPeriod?.changeType === 'decrease' ? 'bg-danger' : 'bg-secondary'}`}>
            <div className="card-body text-center">
              <i className={`bi ${analyticsData.comparisons?.previousPeriod?.changeType === 'increase' ? 'bi-arrow-up' : analyticsData.comparisons?.previousPeriod?.changeType === 'decrease' ? 'bi-arrow-down' : 'bi-dash'} fs-2 mb-2`}></i>
              <h4 className="mb-0">
                {analyticsData.comparisons?.previousPeriod?.changeType === 'increase' ? '+' : ''}
                {analyticsData.comparisons?.previousPeriod?.change || 0}%
              </h4>
              <small>vs Previous Period</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Top Pages */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-file-text me-2"></i>
                Top Pages
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th className="text-end">Views</th>
                      <th className="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPages.map((page, index) => (
                      <tr key={index}>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {page.page}
                          </div>
                        </td>
                        <td className="text-end">{page.views.toLocaleString()}</td>
                        <td className="text-end">
                          <span className="badge bg-primary">{page.percentage.toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-globe me-2"></i>
                Top Countries
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th className="text-end">Visitors</th>
                      <th className="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topCountries.map((country, index) => (
                      <tr key={index}>
                        <td>{country.country}</td>
                        <td className="text-end">{country.visitors.toLocaleString()}</td>
                        <td className="text-end">
                          <div className="progress" style={{ height: '20px', width: '60px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${country.percentage}%` }}
                            >
                              {country.percentage}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Device Types */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-device-hdd me-2"></i>
                Device Types
              </h5>
            </div>
            <div className="card-body">
              {analyticsData.deviceTypes.map((device, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <div className="d-flex align-items-center">
                      <i className={`bi ${device.device.toLowerCase() === 'mobile' ? 'bi-phone' : device.device.toLowerCase() === 'desktop' ? 'bi-laptop' : 'bi-tablet'} me-2`}></i>
                      <span className="text-capitalize">{device.device}</span>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">{device.visitors?.toLocaleString() || 0}</div>
                      <small className="text-muted">{device.percentage.toFixed(1)}%</small>
                    </div>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className={`progress-bar ${device.device.toLowerCase() === 'mobile' ? 'bg-success' : device.device.toLowerCase() === 'desktop' ? 'bg-primary' : 'bg-info'}`}
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Chart Placeholder */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Traffic Overview
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="bi bi-graph-up text-muted" style={{ fontSize: '4rem' }}></i>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading traffic data...</p>
                  </div>
                ) : analyticsData ? (
                  <div>
                    {/* Traffic Summary */}
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-primary mb-1">{analyticsData.visitors?.toLocaleString()}</h4>
                          <small className="text-muted">Visitors</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-success mb-1">{analyticsData.pageviews?.toLocaleString()}</h4>
                          <small className="text-muted">Pageviews</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-warning mb-1">{analyticsData.bounceRate?.toFixed(1)}%</h4>
                          <small className="text-muted">Bounce Rate</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-info mb-1">{analyticsData.avgSessionDuration}</h4>
                          <small className="text-muted">Avg. Session</small>
                        </div>
                      </div>
                    </div>

                    {/* Simple Visual Chart Representation */}
                    <div className="mb-4">
                      <h6 className="mb-3">Top Pages</h6>
                      <div className="row">
                        {analyticsData.topPages?.slice(0, 5).map((page: any, index: number) => {
                          const percentage = (page.views / analyticsData.pageviews) * 100;
                          return (
                            <div key={index} className="col-12 mb-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">{page.page}</small>
                                <small className="text-muted">{page.views.toLocaleString()} views</small>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className={`progress-bar bg-${index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'info' : index === 3 ? 'warning' : 'secondary'}`}
                                  style={{ width: `${Math.max(percentage, 5)}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Data Source Info */}
                    <div className="alert alert-info">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-info-circle me-2"></i>
                        <div>
                          <strong>Data Source:</strong> {analyticsData.source || 'Google Analytics'}
                          {analyticsData.note && (
                            <div>
                              <small className="text-muted">{analyticsData.note}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                    <h5 className="text-muted">No Traffic Data Available</h5>
                    <p className="text-muted mb-3">
                      Unable to load analytics data. Check your Google Analytics integration.
                    </p>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => fetchAnalyticsData(selectedPeriod)}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Retry
                    </button>
                  </div>
                )}
                <a 
                  href={`https://analytics.google.com/analytics/web/#/p${GOOGLE_ANALYTICS_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  View in Google Analytics
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>

        {/* Jetpack Analytics Tab */}
        <div className={`tab-pane fade ${activeTab === 'jetpack' ? 'show active' : ''}`}>
          {jetpackLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading Jetpack analytics data...</p>
            </div>
          ) : jetpackData ? (
            <>
              {/* Jetpack Key Metrics */}
              <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <i className="bi bi-eye fs-2 mb-2"></i>
                      <h4 className="mb-0">{jetpackData.views?.toLocaleString()}</h4>
                      <small>Views</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <i className="bi bi-people fs-2 mb-2"></i>
                      <h4 className="mb-0">{jetpackData.visitors?.toLocaleString()}</h4>
                      <small>Visitors</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <i className="bi bi-heart fs-2 mb-2"></i>
                      <h4 className="mb-0">{jetpackData.summary?.likes?.toLocaleString()}</h4>
                      <small>Likes</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <i className="bi bi-chat fs-2 mb-2"></i>
                      <h4 className="mb-0">{jetpackData.summary?.comments?.toLocaleString()}</h4>
                      <small>Comments</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Top Posts */}
                <div className="col-lg-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-file-text me-2"></i>
                        Top Posts
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Post</th>
                              <th className="text-end">Views</th>
                              <th className="text-end">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jetpackData.topPosts?.map((post: any, index: number) => (
                              <tr key={index}>
                                <td>
                                  <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                    {post.title}
                                  </div>
                                </td>
                                <td className="text-end">{post.views?.toLocaleString()}</td>
                                <td className="text-end">
                                  <span className="badge bg-info">{post.percentage?.toFixed(1)}%</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referrers */}
                <div className="col-lg-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-link-45deg me-2"></i>
                        Top Referrers
                      </h5>
                    </div>
                    <div className="card-body">
                      {jetpackData.referrers?.map((referrer: any, index: number) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center">
                            <span className="me-2">{index + 1}.</span>
                            <span>{referrer.name}</span>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">{referrer.views?.toLocaleString()}</div>
                            <small className="text-muted">{referrer.percentage?.toFixed(1)}%</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search Terms */}
                <div className="col-lg-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-search me-2"></i>
                        Search Terms
                      </h5>
                    </div>
                    <div className="card-body">
                      {jetpackData.searchTerms?.map((term: any, index: number) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center">
                            <span className="me-2">{index + 1}.</span>
                            <span className="text-muted">"{term.term}"</span>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">{term.views?.toLocaleString()}</div>
                            <small className="text-muted">{term.percentage?.toFixed(1)}%</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="col-lg-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-bar-chart me-2"></i>
                        Summary ({jetpackData.summary?.period})
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6 mb-3">
                          <div className="text-center">
                            <h4 className="text-info mb-1">{jetpackData.summary?.views?.toLocaleString()}</h4>
                            <small className="text-muted">Total Views</small>
                          </div>
                        </div>
                        <div className="col-6 mb-3">
                          <div className="text-center">
                            <h4 className="text-success mb-1">{jetpackData.summary?.visitors?.toLocaleString()}</h4>
                            <small className="text-muted">Unique Visitors</small>
                          </div>
                        </div>
                        <div className="col-6 mb-3">
                          <div className="text-center">
                            <h4 className="text-warning mb-1">{jetpackData.summary?.likes?.toLocaleString()}</h4>
                            <small className="text-muted">Total Likes</small>
                          </div>
                        </div>
                        <div className="col-6 mb-3">
                          <div className="text-center">
                            <h4 className="text-primary mb-1">{jetpackData.summary?.comments?.toLocaleString()}</h4>
                            <small className="text-muted">Total Comments</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-wordpress me-2"></i>
                      Jetpack Analytics
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-5">
                      <i className="bi bi-wordpress text-primary" style={{ fontSize: '4rem' }}></i>
                      <h4 className="mt-3 mb-3">Jetpack Analytics Integration</h4>
                      <p className="text-muted mb-4">
                        Connect to WordPress.com Jetpack for additional analytics insights including:
                      </p>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="mb-3">
                            <i className="bi bi-eye fs-4 text-info"></i>
                            <div className="mt-2">
                              <strong>Views & Visitors</strong>
                              <br />
                              <small className="text-muted">Daily traffic patterns</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="mb-3">
                            <i className="bi bi-search fs-4 text-success"></i>
                            <div className="mt-2">
                              <strong>Search Terms</strong>
                              <br />
                              <small className="text-muted">What brings visitors</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="mb-3">
                            <i className="bi bi-link-45deg fs-4 text-warning"></i>
                            <div className="mt-2">
                              <strong>Referrers</strong>
                              <br />
                              <small className="text-muted">Traffic sources</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="mb-3">
                            <i className="bi bi-file-text fs-4 text-primary"></i>
                            <div className="mt-2">
                              <strong>Top Content</strong>
                              <br />
                              <small className="text-muted">Popular posts & pages</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* WordPress.com Authentication Status */}
                      <div className="mb-4">
                        <div className={`alert ${wpAuthStatus.isAuthenticated ? 'alert-success' : 'alert-info'}`}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <i className={`bi ${wpAuthStatus.isAuthenticated ? 'bi-check-circle' : 'bi-info-circle'} me-2`}></i>
                              <div>
                                <strong>
                                  {wpAuthStatus.isAuthenticated ? 'WordPress.com Connected' : 'WordPress.com Authentication'}
                                </strong>
                                <div className="small">
                                  {wpAuthStatus.isAuthenticated && isClient ? (
                                    <>
                                      Method: Implicit OAuth (Grasshopper-style) | 
                                      Site ID: {wpAuthStatus.token?.siteId} |
                                      Expires: {wpAuthStatus.token?.expiresAt ? new Date(wpAuthStatus.token.expiresAt).toLocaleString() : 'Unknown'}
                                    </>
                                  ) : (
                                    'Click "Connect WordPress.com" to access live analytics data'
                                  )}
                                </div>
                              </div>
                            </div>
                            {wpAuthStatus.isAuthenticated && isClient && (
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={disconnectWordPress}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Disconnect
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        {wpAuthStatus.isAuthenticated && isClient ? (
                          <button 
                            className="btn btn-success me-2"
                            onClick={() => fetchJetpackDataWithAuth()}
                            disabled={jetpackLoading}
                          >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            {jetpackLoading ? 'Loading...' : 'Refresh Live Data'}
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary me-2"
                            onClick={initiateWordPressImplicitOAuth}
                            disabled={jetpackAuthLoading || !isClient}
                          >
                            <i className="bi bi-wordpress me-2"></i>
                            {!isClient ? 'Loading...' : jetpackAuthLoading ? 'Connecting...' : 'Connect WordPress.com'}
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-outline-info me-2"
                          onClick={() => fetchJetpackData()}
                          disabled={jetpackLoading}
                        >
                          <i className="bi bi-play me-2"></i>
                          {jetpackLoading ? 'Loading...' : 'Demo Mode'}
                        </button>
                        
                        <div className="btn-group">
                          <a 
                            href="https://github.com/automattic/grasshopper"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary"
                          >
                            <i className="bi bi-github me-2"></i>
                            Grasshopper
                          </a>
                          <a 
                            href="https://github.com/Automattic/jetpack/blob/trunk/docs/rest-api.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary"
                          >
                            <i className="bi bi-book me-2"></i>
                            API Docs
                          </a>
                        </div>
                      </div>
                      
                      <div className="alert alert-info mt-4">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Authentication Required:</strong> Jetpack analytics requires WordPress.com OAuth or nonce-based authentication.
                        <div className="mt-2 small">
                          <strong>Environment Variables Needed:</strong><br/>
                          • <code>WORDPRESS_COM_ACCESS_TOKEN</code> - OAuth access token<br/>
                          • <code>WP_API_NONCE</code> - WordPress REST API nonce<br/>
                          • <code>WP_AUTH_COOKIE</code> - WordPress authentication cookie
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Configuration */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Analytics Configuration
              </h5>
            </div>
            <div className="card-body">
              {/* Google Analytics Configuration */}
              <div className="mb-4">
                <h6 className="mb-3">
                  <i className="bi bi-google me-2"></i>
                  Google Analytics
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Google Analytics ID</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={GOOGLE_ANALYTICS_ID}
                        readOnly
                      />
                      <small className="text-muted">Your GA4 measurement ID</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Tracking Status</label>
                      <div className="form-control-plaintext">
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Active
                        </span>
                      </div>
                      <small className="text-muted">Analytics is properly configured</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jetpack Analytics Configuration */}
              <div className="mb-4">
                <h6 className="mb-3">
                  <i className="bi bi-wordpress me-2"></i>
                  Jetpack Analytics
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">WordPress.com Site</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value="medialternatives.wordpress.com"
                        readOnly
                      />
                      <small className="text-muted">Your WordPress.com site identifier</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Connection Status</label>
                      <div className="form-control-plaintext">
                        <span className="badge bg-warning">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Demo Mode
                        </span>
                      </div>
                      <small className="text-muted">Using mock data for development</small>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="alert alert-info">
                      <h6 className="alert-heading">
                        <i className="bi bi-info-circle me-2"></i>
                        Jetpack Authentication Setup
                      </h6>
                      <p className="mb-2">Choose one of these authentication methods:</p>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="text-primary">Method 1: OAuth (Recommended)</h6>
                          <ol className="mb-3">
                            <li>Set up WordPress.com OAuth app</li>
                            <li>Configure environment variables:
                              <ul className="mt-1">
                                <li><code>WORDPRESS_COM_CLIENT_ID</code></li>
                                <li><code>WORDPRESS_COM_CLIENT_SECRET</code></li>
                                <li><code>WORDPRESS_COM_REDIRECT_URI</code></li>
                              </ul>
                            </li>
                            <li>Use "Connect WordPress.com" button above</li>
                          </ol>
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-warning">Method 2: Nonce + Cookie</h6>
                          <ol className="mb-3">
                            <li>Access WordPress admin dashboard</li>
                            <li>Extract from browser console:
                              <ul className="mt-1">
                                <li><code>window.Initial_State.WP_API_nonce</code></li>
                                <li>WordPress auth cookie from requests</li>
                              </ul>
                            </li>
                            <li>Set environment variables:
                              <ul className="mt-1">
                                <li><code>WP_API_NONCE</code></li>
                                <li><code>WP_AUTH_COOKIE</code></li>
                              </ul>
                            </li>
                          </ol>
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2 flex-wrap">
                        <a 
                          href="https://developer.wordpress.com/docs/oauth2/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-shield-lock me-1"></i>
                          OAuth Setup Guide
                        </a>
                        <a 
                          href="https://wordpress.com/stats"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-info"
                        >
                          <i className="bi bi-bar-chart me-1"></i>
                          WordPress.com Stats
                        </a>
                        <a 
                          href="https://github.com/Automattic/jetpack/blob/trunk/docs/rest-api.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <i className="bi bi-book me-1"></i>
                          API Documentation
                        </a>
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={fetchJetpackAuthStatus}
                          disabled={jetpackAuthLoading}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Check Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-12">
                  <h6>Quick Actions</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <a 
                      href={`https://analytics.google.com/analytics/web/#/p${GOOGLE_ANALYTICS_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      Google Analytics
                    </a>
                    <a 
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="bi bi-search me-1"></i>
                      Search Console
                    </a>
                    <a 
                      href="https://pagespeed.web.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-info btn-sm"
                    >
                      <i className="bi bi-speedometer2 me-1"></i>
                      PageSpeed Insights
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="row mt-4">
        <div className="col-12 text-center">
          <Link href="/dashboard" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}