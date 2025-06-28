'use client';

import React, { useState } from 'react';
import AvatarUpload from '@/components/UI/AvatarUpload';

export default function AvatarDemoPage() {
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [userName, setUserName] = useState<string>('David Robert Lewis');

  const handleAvatarChange = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl);
    console.log('Avatar changed:', avatarUrl);
  };

  const handleSaveAvatar = () => {
    if (currentAvatar) {
      // Here you would typically save to your backend/database
      console.log('Saving avatar:', currentAvatar);
      alert('Avatar saved successfully!');
    } else {
      alert('No avatar to save');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">Avatar Upload Demo</h1>
          
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-person-circle me-2"></i>
                User Avatar Management
              </h5>
            </div>
            <div className="card-body">
              {/* User Name Input */}
              <div className="mb-4">
                <label htmlFor="userName" className="form-label">
                  User Name (for generated avatars)
                </label>
                <input
                  type="text"
                  id="userName"
                  className="form-control"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter user name"
                />
              </div>

              {/* Avatar Upload Widget */}
              <div className="mb-4">
                <AvatarUpload
                  currentAvatar={currentAvatar}
                  userName={userName}
                  onAvatarChange={handleAvatarChange}
                  size={120}
                />
              </div>

              {/* Save Button */}
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveAvatar}
                  disabled={!currentAvatar}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Save Avatar
                </button>
              </div>

              {/* Current Avatar Display */}
              {currentAvatar && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h6>Current Avatar Data:</h6>
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={currentAvatar}
                      alt="Current avatar"
                      width="60"
                      height="60"
                      className="rounded-circle border"
                    />
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">
                        Type: {currentAvatar.startsWith('data:') ? 'Generated/Uploaded' : 'URL'}
                      </small>
                      <small className="text-muted d-block">
                        Size: ~{Math.round(currentAvatar.length / 1024)}KB
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Different Sizes Demo */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Different Sizes</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <h6>Small (48px)</h6>
                  <AvatarUpload
                    currentAvatar={currentAvatar}
                    userName={userName}
                    onAvatarChange={handleAvatarChange}
                    size={48}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <h6>Medium (96px)</h6>
                  <AvatarUpload
                    currentAvatar={currentAvatar}
                    userName={userName}
                    onAvatarChange={handleAvatarChange}
                    size={96}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <h6>Large (120px)</h6>
                  <AvatarUpload
                    currentAvatar={currentAvatar}
                    userName={userName}
                    onAvatarChange={handleAvatarChange}
                    size={120}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <h6>Extra Large (150px)</h6>
                  <AvatarUpload
                    currentAvatar={currentAvatar}
                    userName={userName}
                    onAvatarChange={handleAvatarChange}
                    size={150}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Features</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Upload Features</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Drag & drop support</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>File picker</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Auto-cropping to square</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Auto-resizing</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>5MB file size limit</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Image format validation</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Generation Features</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Initials-based avatars</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Color generation from name</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Multiple sizes support</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Base64 data URLs</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Fallback support</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Remove avatar option</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}