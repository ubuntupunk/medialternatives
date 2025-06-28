'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/adsense/data');
        if (response.status === 401) {
          setError('Not authenticated');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch AdSense data');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setAdSenseData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConnect = () => {
    window.location.href = '/api/adsense/auth';
  };

  const getReportValue = (metricName: string) => {
    if (!adSenseData || !adSenseData.report) return '0';
    const headerIndex = adSenseData.report.headers.findIndex(h => h.name === metricName);
    if (headerIndex === -1) return '0';
    return adSenseData.report.totals.cells[headerIndex].value;
  };

  const calculateCTR = () => {
    const clicks = parseFloat(getReportValue('CLICKS'));
    const impressions = parseFloat(getReportValue('IMPRESSIONS'));
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
            Live data from your Google AdSense account.
          </p>
        </div>
      </div>

      {error === 'Not authenticated' ? (
        <div className="text-center card p-5">
          <h3>Connect to Google AdSense</h3>
          <p>Please connect your AdSense account to view live data.</p>
          <button onClick={handleConnect} className="btn btn-primary btn-lg mx-auto" style={{maxWidth: '300px'}}>
            <i className="bi bi-google me-2"></i>
            Connect to AdSense
          </button>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      ) : adSenseData && adSenseData.accounts && adSenseData.accounts.length > 0 ? (
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
