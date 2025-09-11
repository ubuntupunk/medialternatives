'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

interface SEOMetrics {
  searchConsoleClicks: number;
  searchConsoleImpressions: number;
  averagePosition: number;
  indexedPages: number;
  socialShares: {
    facebook: number;
    twitter: number;
    linkedin: number;
  };
}

/**
 * Get static SEO metrics for development and demo purposes
 * @returns {SEOMetrics} Static SEO metrics data
 */
function getStaticSEOMetrics(): SEOMetrics {
  return {
    searchConsoleClicks: 1247,
    searchConsoleImpressions: 15420,
    averagePosition: 12.3,
    indexedPages: 234,
    socialShares: {
      facebook: 89,
      twitter: 156,
      linkedin: 43
    }
  };
}

export default function SEOSocialPage() {
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics | null>(null);

  const [seoSettings, setSeoSettings] = useState({
    siteTitle: SITE_CONFIG.SITE_TITLE,
    siteDescription: SITE_CONFIG.SITE_DESCRIPTION,
    keywords: 'media activism, South Africa, alternative media, journalism',
    ogImage: '/images/og-image.jpg',
    twitterHandle: '@medialternatives',
    facebookPage: 'medialternatives',
    linkedinPage: 'medialternatives'
  });

  // Fetch SEO data from API
  const fetchSEOData = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/metrics');
      const result = await response.json();

      if (result.success) {
        setSeoMetrics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch SEO data');
      }
    } catch (err) {
      console.error('Error fetching SEO data:', err);

      // Set static fallback data
      setSeoMetrics(getStaticSEOMetrics());
    }
  }, []);

  useEffect(() => {
    fetchSEOData();
  }, [fetchSEOData]);

  React.useEffect(() => {
    fetchSEOData();
  }, [fetchSEOData]);

  const seoChecklist = [
    { item: 'Site Title Optimized', status: true, description: 'Title includes main keywords' },
    { item: 'Meta Descriptions', status: true, description: 'All pages have unique descriptions' },
    { item: 'Open Graph Tags', status: true, description: 'Social media preview configured' },
    { item: 'XML Sitemap', status: true, description: 'Sitemap submitted to search engines' },
    { item: 'Robots.txt', status: true, description: 'Properly configured crawling rules' },
    { item: 'SSL Certificate', status: true, description: 'HTTPS enabled site-wide' },
    { item: 'Mobile Friendly', status: true, description: 'Responsive design implemented' },
    { item: 'Page Speed', status: false, description: 'Core Web Vitals need improvement' },
    { item: 'Schema Markup', status: false, description: 'Structured data not implemented' },
    { item: 'Internal Linking', status: true, description: 'Good internal link structure' }
  ];

  const handleSettingChange = (key: string, value: string) => {
    setSeoSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            SEO & Social
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2">
            <i className="bi bi-search me-2 text-dark"></i>
            SEO & Social Media
          </h1>
          <p className="text-muted">
            Optimize your site for search engines and social media platforms.
          </p>
        </div>
      </div>

      {/* SEO Metrics */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-cursor-fill fs-2 mb-2"></i>
              <h4 className="mb-0">{seoMetrics?.searchConsoleClicks?.toLocaleString() || '0'}</h4>
              <small>Search Clicks</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-eye fs-2 mb-2"></i>
              <h4 className="mb-0">{seoMetrics?.searchConsoleImpressions?.toLocaleString() || '0'}</h4>
              <small>Impressions</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-trophy fs-2 mb-2"></i>
              <h4 className="mb-0">{seoMetrics?.averagePosition?.toFixed(1) || '0.0'}</h4>
              <small>Avg. Position</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-files fs-2 mb-2"></i>
              <h4 className="mb-0">{seoMetrics?.indexedPages || '0'}</h4>
              <small>Indexed Pages</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* SEO Settings */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                SEO Configuration
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Site Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={seoSettings.siteTitle}
                    onChange={(e) => handleSettingChange('siteTitle', e.target.value)}
                  />
                  <small className="text-muted">Appears in search results and browser tabs</small>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Twitter Handle</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={seoSettings.twitterHandle}
                    onChange={(e) => handleSettingChange('twitterHandle', e.target.value)}
                  />
                  <small className="text-muted">Your Twitter/X username</small>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Site Description</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={seoSettings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                />
                <small className="text-muted">Meta description for your homepage</small>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Keywords</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={seoSettings.keywords}
                  onChange={(e) => handleSettingChange('keywords', e.target.value)}
                />
                <small className="text-muted">Comma-separated keywords for your site</small>
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Facebook Page</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={seoSettings.facebookPage}
                    onChange={(e) => handleSettingChange('facebookPage', e.target.value)}
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">LinkedIn Page</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={seoSettings.linkedinPage}
                    onChange={(e) => handleSettingChange('linkedinPage', e.target.value)}
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Open Graph Image</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={seoSettings.ogImage}
                    onChange={(e) => handleSettingChange('ogImage', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="text-end">
                <button className="btn btn-primary">
                  <i className="bi bi-check me-1"></i>
                  Save SEO Settings
                </button>
              </div>
            </div>
          </div>

          {/* SEO Checklist */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-check2-square me-2"></i>
                SEO Checklist
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {seoChecklist.map((item, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <i className={`bi bi-${item.status ? 'check-circle-fill text-success' : 'x-circle-fill text-danger'} fs-5`}></i>
                      </div>
                      <div>
                        <strong className={item.status ? 'text-success' : 'text-danger'}>
                          {item.item}
                        </strong>
                        <br />
                        <small className="text-muted">{item.description}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Tools */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-share me-2"></i>
                Social Media Stats
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <i className="bi bi-facebook text-primary me-2"></i>
                    Facebook
                  </span>
                  <span className="badge bg-primary">{seoMetrics?.socialShares?.facebook || '0'}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-primary" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <i className="bi bi-twitter text-info me-2"></i>
                    Twitter/X
                  </span>
                  <span className="badge bg-info">{seoMetrics?.socialShares?.twitter || '0'}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-info" style={{ width: '43%' }}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <i className="bi bi-linkedin text-primary me-2"></i>
                    LinkedIn
                  </span>
                  <span className="badge bg-secondary">{seoMetrics?.socialShares?.linkedin || '0'}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-secondary" style={{ width: '16%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Tools */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-tools me-2"></i>
                SEO Tools
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <a 
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-google me-1"></i>
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
                
                <a 
                  href="https://developers.facebook.com/tools/debug/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-facebook me-1"></i>
                  Facebook Debugger
                </a>
                
                <a 
                  href="https://cards-dev.x.com/validator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-info btn-sm"
                >
                  <i className="bi bi-twitter me-1"></i>
                  Twitter Card Validator
                </a>
                
                <a 
                  href="https://www.linkedin.com/post-inspector/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-linkedin me-1"></i>
                  LinkedIn Inspector
                </a>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                SEO Tips
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Use descriptive, keyword-rich titles
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Write unique meta descriptions
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Optimize images with alt text
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Build quality backlinks
                </li>
                <li className="mb-0">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Focus on user experience
                </li>
              </ul>
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