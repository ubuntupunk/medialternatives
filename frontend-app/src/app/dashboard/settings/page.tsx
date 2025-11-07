'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { SITE_CONFIG, GOOGLE_ANALYTICS_ID, ADSENSE_CLIENT_ID } from '@/lib/constants';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: SITE_CONFIG.SITE_TITLE,
    siteDescription: SITE_CONFIG.SITE_DESCRIPTION,
    siteUrl: SITE_CONFIG.SITE_URL,
    postsPerPage: SITE_CONFIG.POSTS_PER_PAGE,
    timezone: 'Africa/Johannesburg',
    language: 'en',
    dateFormat: 'MMMM d, yyyy',
    timeFormat: '24h'
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalyticsId: GOOGLE_ANALYTICS_ID,
    adsenseClientId: ADSENSE_CLIENT_ID,
    enableAnalytics: true,
    enableAdsense: true,
    enableComments: false,
    enableSocialSharing: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '24h',
    enableTwoFactor: false,
    enableLoginNotifications: true,
    enableSecurityLogs: true,
    allowedIPs: '',
    enableBruteForceProtection: true
  });

  const [performanceSettings, setPerformanceSettings] = useState({
    enableCaching: true,
    cacheTimeout: '1h',
    enableImageOptimization: true,
    enableLazyLoading: true,
    enableMinification: true,
    enableGzip: true
  });

  const handleSiteSettingChange = (key: string, value: string | number) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleIntegrationSettingChange = (key: string, value: string | boolean) => {
    setIntegrationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecuritySettingChange = (key: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePerformanceSettingChange = (key: string, value: string | boolean) => {
    setPerformanceSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In a real application, this would save to your backend
    console.log('Saving settings:', {
      siteSettings,
      integrationSettings,
      securitySettings,
      performanceSettings
    });
    alert('Settings saved successfully!');
  };

  const handleExportSettings = () => {
    const allSettings = {
      siteSettings,
      integrationSettings,
      securitySettings,
      performanceSettings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'medialternatives-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
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
            Settings
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2">
            <i className="bi bi-gear me-2 text-secondary"></i>
            Site Settings
          </h1>
          <p className="text-muted">
            Configure your site preferences and integrations.
          </p>
        </div>
        <div className="col-md-4 text-end">
          <div className="btn-group">
            <button 
              className="btn btn-outline-secondary"
              onClick={handleExportSettings}
            >
              <i className="bi bi-download me-1"></i>
              Export
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveSettings}
            >
              <i className="bi bi-check me-1"></i>
              Save All
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Site Settings */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-globe me-2"></i>
                Site Configuration
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Site Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={siteSettings.siteName}
                  onChange={(e) => handleSiteSettingChange('siteName', e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Site Description</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={siteSettings.siteDescription}
                  onChange={(e) => handleSiteSettingChange('siteDescription', e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Site URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  value={siteSettings.siteUrl}
                  onChange={(e) => handleSiteSettingChange('siteUrl', e.target.value)}
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Posts Per Page</label>
                  <select 
                    className="form-select"
                    value={siteSettings.postsPerPage}
                    onChange={(e) => handleSiteSettingChange('postsPerPage', parseInt(e.target.value))}
                  >
                    <option value={5}>5 posts</option>
                    <option value={10}>10 posts</option>
                    <option value={15}>15 posts</option>
                    <option value={20}>20 posts</option>
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Timezone</label>
                  <select 
                    className="form-select"
                    value={siteSettings.timezone}
                    onChange={(e) => handleSiteSettingChange('timezone', e.target.value)}
                  >
                    <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-plug me-2"></i>
                Integrations
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Google Analytics ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={integrationSettings.googleAnalyticsId}
                  onChange={(e) => handleIntegrationSettingChange('googleAnalyticsId', e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">AdSense Client ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={integrationSettings.adsenseClientId}
                  onChange={(e) => handleIntegrationSettingChange('adsenseClientId', e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableAnalytics"
                    checked={integrationSettings.enableAnalytics}
                    onChange={(e) => handleIntegrationSettingChange('enableAnalytics', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableAnalytics">
                    Enable Google Analytics
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableAdsense"
                    checked={integrationSettings.enableAdsense}
                    onChange={(e) => handleIntegrationSettingChange('enableAdsense', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableAdsense">
                    Enable Google AdSense
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableSocialSharing"
                    checked={integrationSettings.enableSocialSharing}
                    onChange={(e) => handleIntegrationSettingChange('enableSocialSharing', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableSocialSharing">
                    Enable Social Sharing
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Security Settings */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-shield-check me-2"></i>
                Security
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Session Timeout</label>
                <select 
                  className="form-select"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSecuritySettingChange('sessionTimeout', e.target.value)}
                >
                  <option value="1h">1 hour</option>
                  <option value="8h">8 hours</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                </select>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableLoginNotifications"
                    checked={securitySettings.enableLoginNotifications}
                    onChange={(e) => handleSecuritySettingChange('enableLoginNotifications', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableLoginNotifications">
                    Login Notifications
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableBruteForceProtection"
                    checked={securitySettings.enableBruteForceProtection}
                    onChange={(e) => handleSecuritySettingChange('enableBruteForceProtection', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableBruteForceProtection">
                    Brute Force Protection
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableSecurityLogs"
                    checked={securitySettings.enableSecurityLogs}
                    onChange={(e) => handleSecuritySettingChange('enableSecurityLogs', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableSecurityLogs">
                    Security Logging
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Performance
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableCaching"
                    checked={performanceSettings.enableCaching}
                    onChange={(e) => handlePerformanceSettingChange('enableCaching', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableCaching">
                    Enable Caching
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableImageOptimization"
                    checked={performanceSettings.enableImageOptimization}
                    onChange={(e) => handlePerformanceSettingChange('enableImageOptimization', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableImageOptimization">
                    Image Optimization
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableLazyLoading"
                    checked={performanceSettings.enableLazyLoading}
                    onChange={(e) => handlePerformanceSettingChange('enableLazyLoading', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableLazyLoading">
                    Lazy Loading
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="enableMinification"
                    checked={performanceSettings.enableMinification}
                    onChange={(e) => handlePerformanceSettingChange('enableMinification', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableMinification">
                    Code Minification
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Account */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>
                Account Management
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Current User</h6>
                  <p className="text-muted">
                    <strong>{user?.username}</strong><br />
                    Administrator Access<br />
                    <small>Last login: {new Date().toLocaleDateString()}</small>
                  </p>
                </div>
                <div className="col-md-6 text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <Link href="/profile" className="btn btn-outline-primary">
                      <i className="bi bi-person me-1"></i>
                      Edit Profile
                    </Link>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={logout}
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Sign Out
                    </button>
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