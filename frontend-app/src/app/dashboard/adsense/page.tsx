'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ADSENSE_CLIENT_ID, ADSENSE_SLOTS } from '@/lib/constants';

interface AdSlotConfig {
  id: string;
  name: string;
  slot: string;
  format: string;
  location: string;
  status: 'active' | 'paused' | 'testing';
  revenue: number;
  impressions: number;
  ctr: number;
}

export default function AdSenseManagementPage() {
  const [adSlots] = useState<AdSlotConfig[]>([
    {
      id: '1',
      name: 'Main Content Ad',
      slot: ADSENSE_SLOTS.MAIN,
      format: 'auto',
      location: 'Post content',
      status: 'active',
      revenue: 45.30,
      impressions: 12450,
      ctr: 2.3
    },
    {
      id: '2',
      name: 'Feed Ad',
      slot: ADSENSE_SLOTS.FEED,
      format: 'fluid',
      location: 'Post feed',
      status: 'active',
      revenue: 34.20,
      impressions: 8920,
      ctr: 1.8
    }
  ]);

  const [settings, setSettings] = useState({
    clientId: ADSENSE_CLIENT_ID,
    autoAds: true,
    adBlocking: false,
    personalizedAds: true,
    analyticsIntegration: true
  });

  const totalRevenue = adSlots.reduce((sum, slot) => sum + slot.revenue, 0);
  const totalImpressions = adSlots.reduce((sum, slot) => sum + slot.impressions, 0);
  const averageCTR = adSlots.reduce((sum, slot) => sum + slot.ctr, 0) / adSlots.length;

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
            AdSense
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2">
            <i className="bi bi-currency-dollar me-2 text-warning"></i>
            AdSense Management
          </h1>
          <p className="text-muted">
            Monitor ad performance and manage your Google AdSense configuration.
          </p>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Total Revenue</h6>
                  <h3 className="mb-0">${totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-currency-dollar fs-2"></i>
                </div>
              </div>
              <small className="opacity-75">This month</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Impressions</h6>
                  <h3 className="mb-0">{totalImpressions.toLocaleString()}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-eye fs-2"></i>
                </div>
              </div>
              <small className="opacity-75">Total views</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Average CTR</h6>
                  <h3 className="mb-0">{averageCTR.toFixed(1)}%</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-cursor fs-2"></i>
                </div>
              </div>
              <small className="opacity-75">Click-through rate</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Active Ads</h6>
                  <h3 className="mb-0">{adSlots.filter(slot => slot.status === 'active').length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-badge-ad fs-2"></i>
                </div>
              </div>
              <small className="opacity-75">Currently running</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Ad Slots Management */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-badge-ad me-2"></i>
                Ad Slots
              </h5>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-plus me-1"></i>
                Add New Slot
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Ad Slot</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Revenue</th>
                      <th>CTR</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adSlots.map((slot) => (
                      <tr key={slot.id}>
                        <td>
                          <div>
                            <strong>{slot.name}</strong>
                            <br />
                            <small className="text-muted">{slot.slot}</small>
                          </div>
                        </td>
                        <td>{slot.location}</td>
                        <td>
                          <span className={`badge bg-${
                            slot.status === 'active' ? 'success' : 
                            slot.status === 'paused' ? 'warning' : 'info'
                          }`}>
                            {slot.status}
                          </span>
                        </td>
                        <td>${slot.revenue.toFixed(2)}</td>
                        <td>{slot.ctr}%</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-outline-secondary">
                              <i className="bi bi-pause"></i>
                            </button>
                            <button className="btn btn-outline-info">
                              <i className="bi bi-graph-up"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Revenue Trends
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="text-muted mt-3">
                  Revenue chart would be displayed here
                  <br />
                  <small>Integration with Google AdSense API required</small>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings & Configuration */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                AdSense Settings
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Client ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={settings.clientId}
                  readOnly
                />
                <small className="text-muted">Your AdSense publisher ID</small>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="autoAds"
                    checked={settings.autoAds}
                    onChange={(e) => handleSettingChange('autoAds', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="autoAds">
                    Auto Ads
                  </label>
                </div>
                <small className="text-muted">Let Google automatically place ads</small>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="personalizedAds"
                    checked={settings.personalizedAds}
                    onChange={(e) => handleSettingChange('personalizedAds', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="personalizedAds">
                    Personalized Ads
                  </label>
                </div>
                <small className="text-muted">Show targeted ads to users</small>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="analyticsIntegration"
                    checked={settings.analyticsIntegration}
                    onChange={(e) => handleSettingChange('analyticsIntegration', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="analyticsIntegration">
                    Analytics Integration
                  </label>
                </div>
                <small className="text-muted">Link with Google Analytics</small>
              </div>

              <hr />

              <div className="d-grid gap-2">
                <button className="btn btn-primary">
                  <i className="bi bi-check me-1"></i>
                  Save Settings
                </button>
                <a 
                  href="https://www.google.com/adsense" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  AdSense Dashboard
                </a>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Optimization Tips
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Place ads above the fold for better visibility
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Use responsive ad units for mobile
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Test different ad placements
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Monitor Core Web Vitals impact
                </li>
                <li className="mb-0">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Balance user experience with revenue
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