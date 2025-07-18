'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { wordpressApi } from '@/services/wordpress-api';
import { WordPressPost } from '@/types/wordpress';
import { formatDate } from '@/utils/helpers';

interface OverviewStats {
  posts: {
    total: number;
    published: number;
    drafts: number;
    thisMonth: number;
  };
  analytics: {
    visitors: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: string;
    topPage: string;
    topPageViews: number;
  };
  performance: {
    lighthouseScore: number;
    loadTime: number;
    uptime: number;
    coreWebVitals: 'good' | 'needs-improvement' | 'poor';
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    impressions: number;
    ctr: number;
  };
  social: {
    totalShares: number;
    facebookShares: number;
    twitterShares: number;
    linkedinShares: number;
  };
}

export default function OverviewPage() {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [adSenseData, setAdSenseData] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch real-time data from APIs
  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/analytics?period=7d');
      const analyticsResult = await analyticsResponse.json();
      if (analyticsResult.success) {
        setAnalyticsData(analyticsResult.data);
      }

      // Fetch performance data
      const performanceResponse = await fetch('/api/performance');
      const performanceResult = await performanceResponse.json();
      if (performanceResult.success) {
        setPerformanceData(performanceResult.data);
      }

      // Fetch AdSense data
      const adSenseResponse = await fetch('/api/adsense/data');
      const adSenseResult = await adSenseResponse.json();
      if (adSenseResult.report) {
        setAdSenseData(adSenseResult);
      }

      // Fetch SEO data
      const seoResponse = await fetch('/api/seo/metrics?period=30d');
      const seoResult = await seoResponse.json();
      if (seoResult.success) {
        setSeoData(seoResult.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Mock overview stats - enhanced with real data when available
  const getStats = (): OverviewStats => ({
    posts: {
      total: 247,
      published: 245,
      drafts: 2,
      thisMonth: 12
    },
    analytics: {
      visitors: analyticsData?.visitors || 8420,
      pageviews: analyticsData?.pageviews || 15680,
      bounceRate: analyticsData?.bounceRate || 68.5,
      avgSessionDuration: analyticsData?.avgSessionDuration || '2m 34s',
      topPage: analyticsData?.topPages?.[0]?.page || '/post/piers-morgan-calls-out-sophie-mokoena',
      topPageViews: analyticsData?.topPages?.[0]?.views || 2340
    },
    performance: {
      lighthouseScore: performanceData?.lighthouse?.performance || 94,
      loadTime: performanceData?.loadTime || 1.8,
      uptime: 99.9, // This would come from uptime monitoring service
      coreWebVitals: performanceData?.coreWebVitals?.status || 'good'
    },
    revenue: {
      thisMonth: 89.50,
      lastMonth: 76.20,
      impressions: 21370,
      ctr: 2.1
    },
    social: {
      totalShares: 2470,
      facebookShares: 1240,
      twitterShares: 890,
      linkedinShares: 340
    }
  });

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoading(true);
        const posts = await wordpressApi.getPosts({
          per_page: 5,
          _embed: true,
          orderby: 'date',
          order: 'desc'
        });
        setRecentPosts(posts);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch both posts and dashboard data on component mount
    fetchRecentPosts();
    fetchDashboardData();

    // Set up auto-refresh for dashboard data every 5 minutes
    const dashboardInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    return () => clearInterval(dashboardInterval);
  }, []);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const getRevenueChange = () => {
    const change = ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      color: change > 0 ? 'success' : 'danger',
      icon: change > 0 ? 'bi-arrow-up' : 'bi-arrow-down'
    };
  };

  const stats = getStats();
  const revenueChange = getRevenueChange();

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Overview
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            Site Overview
          </h1>
          <p className="text-muted">
            Complete overview of your Medialternatives blog performance and metrics.
          </p>
        </div>
        <div className="col-md-4 text-end">
          <div className="text-muted small">
            <i className="bi bi-clock me-1"></i>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button 
            className="btn btn-outline-primary btn-sm mt-2"
            onClick={fetchDashboardData}
            disabled={dataLoading}
          >
            {dataLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Refreshing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="row mb-4">
        <div className="col-12 mb-3">
          <h4>
            <i className="bi bi-graph-up me-2"></i>
            Key Performance Indicators
          </h4>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Monthly Visitors</h6>
                  <h3 className="mb-0">{stats.analytics.visitors.toLocaleString()}</h3>
                  <small className="opacity-75">+12.5% from last month</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-people fs-1"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link href="/dashboard/analytics" className="text-white text-decoration-none small">
                <i className="bi bi-arrow-right me-1"></i>
                View Analytics
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Revenue</h6>
                  <h3 className="mb-0">${stats.revenue.thisMonth.toFixed(2)}</h3>
                  <small className="opacity-75">
                    <i className={`bi ${revenueChange.icon} me-1`}></i>
                    {revenueChange.percentage}% from last month
                  </small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-currency-dollar fs-1"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link href="/dashboard/adsense" className="text-white text-decoration-none small">
                <i className="bi bi-arrow-right me-1"></i>
                View AdSense
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className={`card bg-${getPerformanceColor(stats.performance.lighthouseScore)} text-white h-100`}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Performance</h6>
                  <h3 className="mb-0">{stats.performance.lighthouseScore}/100</h3>
                  <small className="opacity-75">Lighthouse score</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-speedometer fs-1"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link href="/dashboard/performance" className="text-white text-decoration-none small">
                <i className="bi bi-arrow-right me-1"></i>
                View Performance
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Content</h6>
                  <h3 className="mb-0">{stats.posts.total}</h3>
                  <small className="opacity-75">{stats.posts.thisMonth} this month</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-file-text fs-1"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link href="/dashboard/content" className="text-white text-decoration-none small">
                <i className="bi bi-arrow-right me-1"></i>
                Manage Content
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Posts */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-file-text me-2"></i>
                Recent Posts
              </h5>
              <Link href="/dashboard/content" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-plus me-1"></i>
                New Post
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2">Loading recent posts...</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPosts.map(post => (
                        <tr key={post.id}>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              <strong>{post.title.rendered}</strong>
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(post.date)}
                            </small>
                          </td>
                          <td>
                            <span className={`badge bg-${post.status === 'publish' ? 'success' : 'secondary'}`}>
                              {post.status === 'publish' ? 'Published' : post.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link 
                                href={`/post/${post.slug}`}
                                className="btn btn-outline-primary"
                                title="View Post"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <a 
                                href={`https://davidrobertlewis5.wordpress.com/wp-admin/post.php?post=${post.id}&action=edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-secondary"
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Quick Stats
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <h4 className="text-primary">{stats.analytics.pageviews.toLocaleString()}</h4>
                  <small className="text-muted">Page Views</small>
                </div>
                <div className="col-6 mb-3">
                  <h4 className="text-success">{stats.analytics.bounceRate}%</h4>
                  <small className="text-muted">Bounce Rate</small>
                </div>
                <div className="col-6 mb-3">
                  <h4 className="text-info">{stats.performance.loadTime}s</h4>
                  <small className="text-muted">Load Time</small>
                </div>
                <div className="col-6 mb-3">
                  <h4 className="text-warning">{stats.performance.uptime}%</h4>
                  <small className="text-muted">Uptime</small>
                </div>
              </div>
              
              <hr />
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Social Shares</small>
                  <small>{stats.social.totalShares}</small>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-primary" style={{ width: '50%' }}></div>
                  <div className="progress-bar bg-info" style={{ width: '36%' }}></div>
                  <div className="progress-bar bg-secondary" style={{ width: '14%' }}></div>
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-primary">Facebook: {stats.social.facebookShares}</small>
                  <small className="text-info">Twitter: {stats.social.twitterShares}</small>
                  <small className="text-secondary">LinkedIn: {stats.social.linkedinShares}</small>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-shield-check me-2"></i>
                System Status
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Website</span>
                <span className="badge bg-success">Online</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Analytics</span>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>AdSense</span>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>SSL Certificate</span>
                <span className="badge bg-success">Valid</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Backup</span>
                <span className="badge bg-warning">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Content & SEO Summary */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Top Performing Content
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <strong>Piers Morgan calls out Sophie Mokoena</strong>
                    <br />
                    <small className="text-muted">Published 2 days ago</small>
                  </div>
                  <span className="badge bg-primary rounded-pill">{stats.analytics.topPageViews}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <strong>Media Cartel Exposed</strong>
                    <br />
                    <small className="text-muted">Published 1 week ago</small>
                  </div>
                  <span className="badge bg-primary rounded-pill">1,890</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <strong>Apartheid's Media Legacy</strong>
                    <br />
                    <small className="text-muted">Published 2 weeks ago</small>
                  </div>
                  <span className="badge bg-primary rounded-pill">1,560</span>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <Link href="/dashboard/analytics" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-graph-up me-1"></i>
                  View Full Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-search me-2"></i>
                SEO Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6 mb-3">
                  <div className="text-center">
                    <div className="badge bg-success fs-6 mb-2">98</div>
                    <h6>SEO Score</h6>
                    <small className="text-muted">Lighthouse SEO</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="text-center">
                    <div className="badge bg-info fs-6 mb-2">247</div>
                    <h6>Indexed Pages</h6>
                    <small className="text-muted">Google Search</small>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>SEO Health</small>
                  <small>Excellent</small>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-success" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/dashboard/seo" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-search me-1"></i>
                  Manage SEO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Action Items & Recommendations
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Completed
                  </h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      SSL certificate installed
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      Google Analytics configured
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      AdSense ads optimized
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      Mobile optimization complete
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Pending
                  </h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-circle text-warning me-2"></i>
                      Set up automated backups
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-circle text-warning me-2"></i>
                      Implement schema markup
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-circle text-warning me-2"></i>
                      Optimize Core Web Vitals
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-circle text-warning me-2"></i>
                      Update social media links
                    </li>
                  </ul>
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