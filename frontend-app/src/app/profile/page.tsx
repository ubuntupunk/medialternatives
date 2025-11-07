'use client';

import React, { useState, useEffect } from 'react';
import AvatarUpload from '@/components/UI/AvatarUpload';
import Avatar from '@/components/UI/Avatar';
import { AvatarManager } from '@/utils/avatarUtils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  website: string;
  avatar: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'david-robert-lewis',
    name: 'David Robert Lewis',
    email: 'david@medialternatives.com',
    bio: 'Publisher and cognitive dissident, organic intellectual, and activist-at-large. Founder of Medialternatives.',
    website: 'https://medialternatives.com',
    avatar: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarManager] = useState(() => new AvatarManager(profile.id));

  useEffect(() => {
    // Load saved avatar on component mount
    const savedAvatar = avatarManager.getAvatar(profile.name);
    setProfile(prev => ({ ...prev, avatar: savedAvatar }));
  }, [avatarManager, profile.name]);

  const handleAvatarChange = (avatarUrl: string) => {
    setProfile(prev => ({ ...prev, avatar: avatarUrl }));
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save avatar
      if (profile.avatar) {
        avatarManager.saveAvatar(profile.avatar);
      }
      
      // Here you would typically save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setIsEditing(false);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values (in a real app, you'd reload from server)
    setIsEditing(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                User Profile
              </h4>
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit Profile
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check me-1"></i>
                        Save
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="card-body">
              {/* Avatar Section */}
              <div className="row mb-4">
                <div className="col-md-4 text-center">
                  {isEditing ? (
                    <AvatarUpload
                      currentAvatar={profile.avatar}
                      userName={profile.name}
                      onAvatarChange={handleAvatarChange}
                      size={150}
                    />
                  ) : (
                    <div>
                      <Avatar
                        src={profile.avatar}
                        name={profile.name}
                        size={150}
                        className="border shadow-sm mb-2"
                      />
                      <p className="text-muted small">Profile Picture</p>
                    </div>
                  )}
                </div>
                
                <div className="col-md-8">
                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <p className="form-control-plaintext">{profile.name}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="form-control-plaintext">{profile.email}</p>
                    )}
                  </div>
                  
                  {/* Website */}
                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        className="form-control"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    ) : (
                      <p className="form-control-plaintext">
                        {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer">
                            {profile.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div className="mb-3">
                <label className="form-label">Bio</label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="form-control-plaintext">{profile.bio || 'No bio provided'}</p>
                )}
              </div>
              
              {/* Profile Preview */}
              {!isEditing && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h6>Profile Preview</h6>
                  <div className="d-flex align-items-center">
                    <Avatar
                      src={profile.avatar}
                      name={profile.name}
                      size={60}
                      className="me-3 border"
                    />
                    <div>
                      <h6 className="mb-1">{profile.name}</h6>
                      <p className="text-muted small mb-0">
                        {profile.bio.length > 100 
                          ? `${profile.bio.substring(0, 100)}...` 
                          : profile.bio
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Avatar Sizes Demo */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">Avatar Preview (Different Sizes)</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="text-center">
                  <Avatar src={profile.avatar} name={profile.name} size={24} />
                  <small className="d-block text-muted">24px</small>
                </div>
                <div className="text-center">
                  <Avatar src={profile.avatar} name={profile.name} size={32} />
                  <small className="d-block text-muted">32px</small>
                </div>
                <div className="text-center">
                  <Avatar src={profile.avatar} name={profile.name} size={48} />
                  <small className="d-block text-muted">48px</small>
                </div>
                <div className="text-center">
                  <Avatar src={profile.avatar} name={profile.name} size={64} />
                  <small className="d-block text-muted">64px</small>
                </div>
                <div className="text-center">
                  <Avatar src={profile.avatar} name={profile.name} size={96} />
                  <small className="d-block text-muted">96px</small>
                </div>
                <div className="text-center">
                  <Avatar src={profile.avatar} name={profile.name} size={120} />
                  <small className="d-block text-muted">120px</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}