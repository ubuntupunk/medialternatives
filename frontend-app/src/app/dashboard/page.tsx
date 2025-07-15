'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AuthStatus from '@/components/UI/AuthStatus';

// Dashboard sections
const dashboardSections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: 'bi-speedometer2',
    description: 'Site statistics and quick insights',
    color: 'primary',
    href: '/dashboard/overview'
  },
  {
    id: 'avatar',
    title: 'Avatar Manager',
    icon: 'bi-person-circle',
    description: 'Upload and manage your profile avatar',
    color: 'info',
    href: '/dashboard/avatar'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: 'bi-graph-up',
    description: 'View site traffic and user engagement',
    color: 'success',
    href: '/dashboard/analytics'
  },
  {
    id: 'image-generator',
    title: 'Image Generator',
    icon: 'bi-image',
    description: 'AI-powered image generation for blog posts',
    color: 'warning',
    href: '/dashboard/image-generator'
  },
  {
    id: 'adsense',
    title: 'AdSense',
    icon: 'bi-currency-dollar',
    description: 'Manage ads and revenue optimization',
    color: 'warning',
    href: '/dashboard/adsense'
  },
  {
    id: 'content',
    title: 'Content',
    icon: 'bi-file-text',
    description: 'Manage posts, pages, and media',
    color: 'secondary',
    href: '/dashboard/content'
  },
  {
    id: 'seo',
    title: 'SEO & Social',
    icon: 'bi-search',
    description: 'Search optimization and social media',
    color: 'dark',
    href: '/dashboard/seo'
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: 'bi-lightning',
    description: 'Site speed and optimization',
    color: 'danger',
    href: '/dashboard/performance'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'bi-gear',
    description: 'Site configuration and preferences',
    color: 'secondary',
    href: '/dashboard/settings'
  }
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return null; // Layout will handle redirect
  }

  return (
    <div className="container-fluid mt-4">
      {/* Dashboard Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">
                <i className="bi bi-speedometer2 me-2 text-primary"></i>
                Medialternatives Dashboard
              </h1>
              <p className="text-muted mb-0">
                Welcome back, {user?.username} • {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <AuthStatus showAvatar={true} />
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Total Posts</h6>
                  <h3 className="mb-0">247</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-file-text fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Monthly Views</h6>
                  <h3 className="mb-0">12.4K</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-eye fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">AdSense Revenue</h6>
                  <h3 className="mb-0">$89.50</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-currency-dollar fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Site Score</h6>
                  <h3 className="mb-0">94/100</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-speedometer fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sections Grid */}
      <div className="row">
        <div className="col-12 mb-3">
          <h4>
            <i className="bi bi-grid me-2"></i>
            Management Sections
          </h4>
        </div>
        
        {dashboardSections.map((section) => (
          <div key={section.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
            <Link href={section.href} className="text-decoration-none">
              <div className={`card h-100 border-${section.color} hover-shadow`} style={{ transition: 'all 0.3s ease' }}>
                <div className="card-body text-center">
                  <div className={`mb-3 text-${section.color}`}>
                    <i className={`${section.icon} fs-1`}></i>
                  </div>
                  <h5 className={`card-title text-${section.color}`}>
                    {section.title}
                  </h5>
                  <p className="card-text text-muted small">
                    {section.description}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-0">
                  <small className={`text-${section.color}`}>
                    <i className="bi bi-arrow-right me-1"></i>
                    Manage
                  </small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="row mt-4">
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Activity
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-file-plus text-success me-2"></i>
                    New post published: "Piers Morgan calls out Sophie Mokoena"
                  </div>
                  <small className="text-muted">2 hours ago</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-graph-up text-primary me-2"></i>
                    Traffic spike detected: +45% increase
                  </div>
                  <small className="text-muted">5 hours ago</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-currency-dollar text-warning me-2"></i>
                    AdSense payment received: $127.30
                  </div>
                  <small className="text-muted">1 day ago</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-shield-check text-success me-2"></i>
                    Security scan completed: No issues found
                  </div>
                  <small className="text-muted">2 days ago</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link href="/dashboard/content" className="btn btn-outline-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  New Post
                </Link>
                <Link href="/dashboard/avatar" className="btn btn-outline-info">
                  <i className="bi bi-person-circle me-2"></i>
                  Update Avatar
                </Link>
                <Link href="/dashboard/analytics" className="btn btn-outline-success">
                  <i className="bi bi-graph-up me-2"></i>
                  View Analytics
                </Link>
                <Link href="/dashboard/adsense" className="btn btn-outline-warning">
                  <i className="bi bi-currency-dollar me-2"></i>
                  Check Revenue
                </Link>
                <hr />
                <Link href="/" className="btn btn-outline-secondary">
                  <i className="bi bi-house me-2"></i>
                  View Site
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for hover effects */}
      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}