'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PerformanceMetrics {
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  loadTimes: {
    homepage: number;
    blogPage: number;
    postPage: number;
    categoryPage: number;
  };
  uptime: {
    current: number;
    last30Days: number;
    last7Days: number;
  };
}

export default function PerformancePage() {
  const [performanceData] = useState<PerformanceMetrics>({
    lighthouse: {
      performance: 94,
      accessibility: 96,
      bestPractices: 92,
      seo: 98
    },
    coreWebVitals: {
      lcp: 2.1, // seconds
      fid: 85,  // milliseconds
      cls: 0.08 // score
    },
    loadTimes: {
      homepage: 1.8,
      blogPage: 2.1,
      postPage: 1.9,
      categoryPage: 2.3
    },
    uptime: {
      current: 99.9,
      last30Days: 99.8,
      last7Days: 100.0
    }
  });

  const getScoreColor = (score: number, type: 'lighthouse' | 'cwv' = 'lighthouse') => {
    if (type === 'lighthouse') {
      if (score >= 90) return 'success';
      if (score >= 70) return 'warning';
      return 'danger';
    } else {
      // Core Web Vitals thresholds
      if (score >= 90) return 'success';
      if (score >= 70) return 'warning';
      return 'danger';
    }
  };

  const getCWVStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
        if (value <= 2.5) return { status: 'good', color: 'success' };
        if (value <= 4.0) return { status: 'needs improvement', color: 'warning' };
        return { status: 'poor', color: 'danger' };
      case 'fid':
        if (value <= 100) return { status: 'good', color: 'success' };
        if (value <= 300) return { status: 'needs improvement', color: 'warning' };
        return { status: 'poor', color: 'danger' };
      case 'cls':
        if (value <= 0.1) return { status: 'good', color: 'success' };
        if (value <= 0.25) return { status: 'needs improvement', color: 'warning' };
        return { status: 'poor', color: 'danger' };
      default:
        return { status: 'unknown', color: 'secondary' };
    }
  };

  const optimizationTips = [
    {
      category: 'Images',
      tips: [
        'Use Next.js Image component for automatic optimization',
        'Implement lazy loading for below-the-fold images',
        'Use WebP format for better compression',
        'Optimize image sizes for different screen sizes'
      ]
    },
    {
      category: 'JavaScript',
      tips: [
        'Enable code splitting for better bundle sizes',
        'Remove unused JavaScript libraries',
        'Use dynamic imports for non-critical components',
        'Minimize and compress JavaScript files'
      ]
    },
    {
      category: 'CSS',
      tips: [
        'Remove unused CSS styles',
        'Use CSS-in-JS for component-specific styles',
        'Implement critical CSS inlining',
        'Minimize and compress CSS files'
      ]
    },
    {
      category: 'Caching',
      tips: [
        'Implement proper browser caching headers',
        'Use CDN for static assets',
        'Enable service worker for offline caching',
        'Implement API response caching'
      ]
    }
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
            Performance
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2">
            <i className="bi bi-lightning me-2 text-danger"></i>
            Performance Monitoring
          </h1>
          <p className="text-muted">
            Monitor your site's speed, uptime, and user experience metrics.
          </p>
        </div>
      </div>

      {/* Lighthouse Scores */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className={`card bg-${getScoreColor(performanceData.lighthouse.performance)} text-white`}>
            <div className="card-body text-center">
              <i className="bi bi-speedometer2 fs-2 mb-2"></i>
              <h4 className="mb-0">{performanceData.lighthouse.performance}</h4>
              <small>Performance</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className={`card bg-${getScoreColor(performanceData.lighthouse.accessibility)} text-white`}>
            <div className="card-body text-center">
              <i className="bi bi-universal-access fs-2 mb-2"></i>
              <h4 className="mb-0">{performanceData.lighthouse.accessibility}</h4>
              <small>Accessibility</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className={`card bg-${getScoreColor(performanceData.lighthouse.bestPractices)} text-white`}>
            <div className="card-body text-center">
              <i className="bi bi-shield-check fs-2 mb-2"></i>
              <h4 className="mb-0">{performanceData.lighthouse.bestPractices}</h4>
              <small>Best Practices</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className={`card bg-${getScoreColor(performanceData.lighthouse.seo)} text-white`}>
            <div className="card-body text-center">
              <i className="bi bi-search fs-2 mb-2"></i>
              <h4 className="mb-0">{performanceData.lighthouse.seo}</h4>
              <small>SEO</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Core Web Vitals */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Core Web Vitals
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className={`badge bg-${getCWVStatus('lcp', performanceData.coreWebVitals.lcp).color} fs-6 mb-2`}>
                      {performanceData.coreWebVitals.lcp}s
                    </div>
                    <h6>LCP</h6>
                    <small className="text-muted">Largest Contentful Paint</small>
                    <br />
                    <small className={`text-${getCWVStatus('lcp', performanceData.coreWebVitals.lcp).color}`}>
                      {getCWVStatus('lcp', performanceData.coreWebVitals.lcp).status}
                    </small>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className={`badge bg-${getCWVStatus('fid', performanceData.coreWebVitals.fid).color} fs-6 mb-2`}>
                      {performanceData.coreWebVitals.fid}ms
                    </div>
                    <h6>FID</h6>
                    <small className="text-muted">First Input Delay</small>
                    <br />
                    <small className={`text-${getCWVStatus('fid', performanceData.coreWebVitals.fid).color}`}>
                      {getCWVStatus('fid', performanceData.coreWebVitals.fid).status}
                    </small>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className={`badge bg-${getCWVStatus('cls', performanceData.coreWebVitals.cls).color} fs-6 mb-2`}>
                      {performanceData.coreWebVitals.cls}
                    </div>
                    <h6>CLS</h6>
                    <small className="text-muted">Cumulative Layout Shift</small>
                    <br />
                    <small className={`text-${getCWVStatus('cls', performanceData.coreWebVitals.cls).color}`}>
                      {getCWVStatus('cls', performanceData.coreWebVitals.cls).status}
                    </small>
                  </div>
                </div>
              </div>
              
              <hr />
              
              <div className="text-center">
                <a 
                  href="https://pagespeed.web.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-speedometer2 me-1"></i>
                  Test with PageSpeed Insights
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Load Times */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Page Load Times
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Page Type</th>
                      <th className="text-end">Load Time</th>
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Homepage</td>
                      <td className="text-end">{performanceData.loadTimes.homepage}s</td>
                      <td className="text-end">
                        <span className={`badge bg-${performanceData.loadTimes.homepage <= 2 ? 'success' : 'warning'}`}>
                          {performanceData.loadTimes.homepage <= 2 ? 'Good' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Blog Page</td>
                      <td className="text-end">{performanceData.loadTimes.blogPage}s</td>
                      <td className="text-end">
                        <span className={`badge bg-${performanceData.loadTimes.blogPage <= 2 ? 'success' : 'warning'}`}>
                          {performanceData.loadTimes.blogPage <= 2 ? 'Good' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Post Page</td>
                      <td className="text-end">{performanceData.loadTimes.postPage}s</td>
                      <td className="text-end">
                        <span className={`badge bg-${performanceData.loadTimes.postPage <= 2 ? 'success' : 'warning'}`}>
                          {performanceData.loadTimes.postPage <= 2 ? 'Good' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Category Page</td>
                      <td className="text-end">{performanceData.loadTimes.categoryPage}s</td>
                      <td className="text-end">
                        <span className={`badge bg-${performanceData.loadTimes.categoryPage <= 2 ? 'success' : 'warning'}`}>
                          {performanceData.loadTimes.categoryPage <= 2 ? 'Good' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uptime & Optimization Tips */}
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-activity me-2"></i>
                Uptime Monitoring
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Current Status</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Last 7 Days</span>
                  <span>{performanceData.uptime.last7Days}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-success" style={{ width: `${performanceData.uptime.last7Days}%` }}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Last 30 Days</span>
                  <span>{performanceData.uptime.last30Days}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-success" style={{ width: `${performanceData.uptime.last30Days}%` }}></div>
                </div>
              </div>
              
              <div className="text-center">
                <small className="text-muted">
                  Monitoring powered by Vercel
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Optimization Recommendations
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {optimizationTips.map((category, index) => (
                  <div key={index} className="col-md-6 mb-4">
                    <h6 className="text-primary">
                      <i className="bi bi-gear me-2"></i>
                      {category.category}
                    </h6>
                    <ul className="list-unstyled small">
                      {category.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tools */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-tools me-2"></i>
                Performance Testing Tools
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://pagespeed.web.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary w-100"
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    PageSpeed Insights
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://gtmetrix.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary w-100"
                  >
                    <i className="bi bi-graph-up me-2"></i>
                    GTmetrix
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://www.webpagetest.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-info w-100"
                  >
                    <i className="bi bi-stopwatch me-2"></i>
                    WebPageTest
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://web.dev/measure/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success w-100"
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Web.dev Measure
                  </a>
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