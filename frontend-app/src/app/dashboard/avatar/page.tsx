'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AvatarUploadV2 from '@/components/UI/AvatarUploadV2';
import Avatar from '@/components/UI/Avatar';
import { useAuth } from '@/hooks/useAuth';

export default function AvatarManagementPage() {
  const { user } = useAuth();
  const [currentAvatar, setCurrentAvatar] = useState<string>('');

  const handleAvatarChange = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl);
    console.log('Avatar changed:', avatarUrl);
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
            Avatar Manager
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2">
            <i className="bi bi-person-circle me-2 text-info"></i>
            Avatar Manager
          </h1>
          <p className="text-muted">
            Upload and manage your profile avatar. This will be displayed across the site.
          </p>
        </div>
      </div>

      <div className="row">
        {/* Main Avatar Upload */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-upload me-2"></i>
                Upload New Avatar
              </h5>
            </div>
            <div className="card-body">
              <AvatarUploadV2
                userId={user?.userId || 'david-robert-lewis'}
                userName={user?.username || 'David Robert Lewis'}
                onAvatarChange={handleAvatarChange}
                size={150}
                showStorageInfo={true}
              />
            </div>
          </div>
        </div>

        {/* Avatar Preview & Info */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-eye me-2"></i>
                Preview
              </h5>
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                <Avatar
                  src={currentAvatar}
                  name={user?.username || 'David Robert Lewis'}
                  size={120}
                  className="border shadow-sm"
                />
              </div>
              <h6>{user?.username || 'David Robert Lewis'}</h6>
              <p className="text-muted small">Site Author</p>
              
              {currentAvatar && (
                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                    <i className="bi bi-check-circle text-success me-1"></i>
                    Avatar updated successfully
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Usage Information */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Usage Information
              </h6>
            </div>
            <div className="card-body">
              <small className="text-muted">
                <p><strong>Where it appears:</strong></p>
                <ul className="list-unstyled">
                  <li>• Author bio sections</li>
                  <li>• Post bylines</li>
                  <li>• About page</li>
                  <li>• Dashboard header</li>
                  <li>• Social media previews</li>
                </ul>
                
                <p className="mt-3"><strong>Recommendations:</strong></p>
                <ul className="list-unstyled">
                  <li>• Use a clear, professional photo</li>
                  <li>• Square images work best</li>
                  <li>• Minimum 120x120 pixels</li>
                  <li>• Keep file size under 2MB</li>
                </ul>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Sizes Demo */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-grid me-2"></i>
                Avatar Sizes Preview
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Your avatar will be automatically resized for different contexts:
              </p>
              
              <div className="row text-center">
                <div className="col-md-2 col-4 mb-3">
                  <Avatar src={currentAvatar} name={user?.username || 'David Robert Lewis'} size={24} />
                  <div className="mt-2">
                    <small className="text-muted">24px<br />Navigation</small>
                  </div>
                </div>
                <div className="col-md-2 col-4 mb-3">
                  <Avatar src={currentAvatar} name={user?.username || 'David Robert Lewis'} size={32} />
                  <div className="mt-2">
                    <small className="text-muted">32px<br />Comments</small>
                  </div>
                </div>
                <div className="col-md-2 col-4 mb-3">
                  <Avatar src={currentAvatar} name={user?.username || 'David Robert Lewis'} size={48} />
                  <div className="mt-2">
                    <small className="text-muted">48px<br />Post Cards</small>
                  </div>
                </div>
                <div className="col-md-2 col-4 mb-3">
                  <Avatar src={currentAvatar} name={user?.username || 'David Robert Lewis'} size={64} />
                  <div className="mt-2">
                    <small className="text-muted">64px<br />Sidebar</small>
                  </div>
                </div>
                <div className="col-md-2 col-4 mb-3">
                  <Avatar src={currentAvatar} name={user?.username || 'David Robert Lewis'} size={96} />
                  <div className="mt-2">
                    <small className="text-muted">96px<br />Author Bio</small>
                  </div>
                </div>
                <div className="col-md-2 col-4 mb-3">
                  <Avatar src={currentAvatar} name={user?.username || 'David Robert Lewis'} size={120} />
                  <div className="mt-2">
                    <small className="text-muted">120px<br />Profile Page</small>
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