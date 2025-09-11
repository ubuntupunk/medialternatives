'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import D3Chart from '../../../components/Charts/D3Chart';
import AdSenseSettings from '../../../components/AdSense/AdSenseSettings';

interface AdSenseAccount {
  name: string;
  displayName: string;
  timeZone: { id: string };
}

interface AdUnit {
  name: string;
  displayName: string;
  state: string;
  adUnitCode: string;
}

interface ReportData {
  headers: { name: string }[];
  rows: { cells: { value: string }[] }[];
  totals: { cells: { value: string }[] }[];
}

interface AdSenseData {
  accounts: AdSenseAccount[];
  adUnits: AdUnit[];
  report: ReportData;
}

export default function AdSenseManagementPage() {
  const [adSenseData, setAdSenseData] = useState<AdSenseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/adsense/data');
      const data = await response.json();
      
      // Handle both successful responses and fallback mock data
      if (!response.ok && !data.accounts) {
        throw new Error(data.error || 'Failed to fetch AdSense data');
      }
      setAdSenseData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setAdSenseData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnect = () => {
    window.location.href = '/api/adsense/auth';
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/adsense/auth/logout', { method: 'POST' });
      setAdSenseData(null);
      setError('Not authenticated');
    } catch (err) {
      console.error('Failed to sign out', err);
    }
  };

  const getReportValue = (metricName: string) => {
    if (!adSenseData || !adSenseData.report || !adSenseData.report.totals || adSenseData.report.totals.length === 0) {
      return '0';
    }
    
    const headerIndex = adSenseData.report.headers?.findIndex(h => h.name === metricName);
    if (headerIndex === -1 || headerIndex === undefined) {
      return '0';
    }
    
    const totalRow = adSenseData.report.totals[0];
    if (!totalRow || !totalRow.cells || !totalRow.cells[headerIndex]) {
      return '0';
    }
    
    return totalRow.cells[headerIndex].value || '0';
  };

  const calculateCTR = () => {
    const clicksStr = getReportValue('CLICKS');
    const impressionsStr = getReportValue('IMPRESSIONS');
    
    const clicks = parseFloat(clicksStr.replace(/[^0-9.-]/g, '')) || 0;
    const impressions = parseFloat(impressionsStr.replace(/[^0-9.-]/g, '')) || 0;
    
    if (impressions === 0) return '0.00%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
  };

  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading AdSense Data...</p>
      </div>
    );
  }

  const renderError = () => {
    if (error === 'Not authenticated') {
      return (
        <div className="text-center card p-5">
          <h3>Connect to Google AdSense</h3>
          <p>Please connect your AdSense account to view live data.</p>
          <button onClick={handleConnect} className="btn btn-primary btn-lg mx-auto" style={{maxWidth: '300px'}}>
            <i className="bi bi-google me-2"></i>
            Connect to AdSense
          </button>
        </div>
      );
    }
    if (error === 'Account disapproved') {
      return (
        <div className="alert alert-danger">
          <strong>Account Disapproved</strong>
          <p>Your AdSense account has been disapproved by Google. Please visit the <a href="https://www.google.com/adsense" target="_blank" rel="noopener noreferrer">AdSense console</a> to resolve any issues.</p>
          <hr />
          <button onClick={handleSignOut} className="btn btn-danger">Sign Out of AdSense</button>
        </div>
      );
    }
    return (
      <div className="alert alert-danger">
        <strong>Error:</strong> {error}
      </div>
    );
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
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2">
              <i className="bi bi-currency-dollar me-2 text-warning"></i>
              AdSense Management
            </h1>
            <p className="text-muted">
              Live data from your Google AdSense account.
            </p>
          </div>
          {adSenseData && (
            <button onClick={handleSignOut} className="btn btn-outline-danger">
              <i className="bi bi-box-arrow-right me-2"></i>
              Sign Out of AdSense
            </button>
          )}
        </div>
      </div>

      {error ? renderError() : adSenseData && adSenseData.accounts && adSenseData.accounts.length > 0 ? (
        <div>
          {/* Revenue Overview */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h6 className="card-title">Total Revenue</h6>
                  <h3 className="mb-0">${parseFloat(getReportValue('ESTIMATED_EARNINGS')).toFixed(2)}</h3>
                  <small className="opacity-75">This month</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h6 className="card-title">Impressions</h6>
                  <h3 className="mb-0">{getReportValue('IMPRESSIONS')}</h3>
                   <small className="opacity-75">Total views this month</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h6 className="card-title">Average CTR</h6>
                  <h3 className="mb-0">{calculateCTR()}</h3>
                  <small className="opacity-75">Click-through rate this month</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h6 className="card-title">Active Ads</h6>
                  <h3 className="mb-0">{adSenseData.adUnits?.filter(u => u.state === 'ACTIVE').length || 0}</h3>
                  <small className="opacity-75">Currently running</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Revenue Chart */}
            <div className="col-lg-8 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Revenue Trends
                  </h5>
                  <button className="btn btn-outline-primary btn-sm" onClick={fetchData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                </div>
                <div className="card-body">
                  <D3Chart
                    type="line"
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                      datasets: [
                        {
                          label: 'Revenue ($)',
                          data: [1250, 2100, 1850, 3200, 2800, 3500],
                          borderColor: '#34A853',
                          backgroundColor: 'rgba(52, 168, 83, 0.1)',
                          fill: true
                        }
                      ]
                    }}
                    width={600}
                    height={300}
                  />
                </div>
              </div>
            </div>

            {/* AdSense Settings */}
            <div className="col-lg-4 mb-4">
              <AdSenseSettings />

              {/* Quick Actions */}
              <div className="card mt-3">
                <div className="card-header">
                  <h6 className="card-title mb-0">Quick Actions</h6>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-primary btn-sm" disabled>
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Ad Unit
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" disabled>
                      <i className="bi bi-gear me-2"></i>
                      Manage Ad Units
                    </button>
                    <button className="btn btn-outline-info btn-sm" disabled>
                      <i className="bi bi-file-earmark-text me-2"></i>
                      View Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Ad Slots Management */}
            <div className="col-lg-12 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-badge-ad me-2"></i>
                    Ad Slots
                  </h5>
                  <button className="btn btn-primary btn-sm" disabled>
                    <i className="bi bi-plus me-1"></i>
                    Add New Slot
                  </button>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Ad Slot Name</th>
                          <th>State</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adSenseData.adUnits?.map((unit) => (
                          <tr key={unit.name}>
                            <td>
                              <div>
                                <strong>{unit.displayName}</strong>
                                <br />
                                <small className="text-muted">{unit.name}</small>
                              </div>
                            </td>
                            <td>
                              <span className={`badge bg-${
                                unit.state === 'ACTIVE' ? 'success' : 'secondary'
                              }`}>
                                {unit.state}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary" disabled>
                                  <i className="bi bi-pencil"></i>
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
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p>No AdSense data found.</p>
        </div>
      )}

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
