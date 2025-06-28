'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ADSENSE_CLIENT_ID, ADSENSE_SLOTS } from '@/lib/constants';

interface AdSenseAccount {
  name: string;
  displayName: string;
  timeZone: { id: string };
}

interface AdSenseData {
  accounts: AdSenseAccount[];
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
                  <h3 className="mb-0">$0.00</h3>
                  <small className="opacity-75">This month (API pending)</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h6 className="card-title">Impressions</h6>
                  <h3 className="mb-0">0</h3>
                   <small className="opacity-75">Total views (API pending)</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h6 className="card-title">Average CTR</h6>
                  <h3 className="mb-0">0.0%</h3>
                  <small className="opacity-75">Click-through rate (API pending)</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h6 className="card-title">Active Ads</h6>
                  <h3 className="mb-0">0</h3>
                  <small className="opacity-75">Currently running (API pending)</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* AdSense Account Info */}
            <div className="col-lg-12 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-person-check-fill me-2"></i>
                    AdSense Account Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Account Name</th>
                          <th>Publisher ID</th>
                          <th>Time Zone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adSenseData.accounts.map((account) => (
                          <tr key={account.name}>
                            <td>{account.displayName}</td>
                            <td>{account.name}</td>
                            <td>{account.timeZone.id}</td>
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
