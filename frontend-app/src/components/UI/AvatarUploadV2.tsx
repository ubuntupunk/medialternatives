'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { createAvatarStorage } from '@/services/avatarStorage';
import { getAvatarConfig } from '@/config/avatarConfig';
import { generateInitialsAvatar, validateImageFile, resizeImageToSquare } from '@/utils/avatarUtils';

interface AvatarUploadV2Props {
  userId: string;
  userName?: string;
  onAvatarChange?: (avatarUrl: string) => void;
  size?: number;
  className?: string;
  showStorageInfo?: boolean;
}

/**
 * Enhanced Avatar upload widget with configurable storage backends
 * Supports localStorage, Vercel Blob, Cloudinary, Supabase, and file system
 */
const AvatarUploadV2: React.FC<AvatarUploadV2Props> = ({
  userId,
  userName = 'User',
  onAvatarChange,
  size = 120,
  className = '',
  showStorageInfo = false
}) => {
  const [avatar, setAvatar] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageService = useRef(createAvatarStorage());
  const config = getAvatarConfig();

  // Load existing avatar on mount
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        setIsLoading(true);
        const existingAvatar = await storageService.current.loadAvatar(userId);
        if (existingAvatar) {
          setAvatar(existingAvatar);
          onAvatarChange?.(existingAvatar);
        }
      } catch (error) {
        console.error('Failed to load existing avatar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatar();
  }, [userId, onAvatarChange]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setStorageInfo(`Uploading to ${config.storage}...`);

    try {
      // Resize image
      const resizedImage = await resizeImageToSquare(file, size);
      
      // Save to configured storage
      const savedUrl = await storageService.current.saveAvatar(userId, resizedImage, {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date(),
        originalName: file.name,
      });

      setAvatar(savedUrl);
      onAvatarChange?.(savedUrl);
      setStorageInfo(`Saved to ${config.storage} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setStorageInfo(''), 3000);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setStorageInfo('');
    } finally {
      setIsUploading(false);
    }
  }, [userId, size, onAvatarChange, config.storage]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Generate initials avatar
  const handleGenerateInitials = useCallback(async () => {
    setError(null);
    setIsUploading(true);
    setStorageInfo(`Generating avatar and saving to ${config.storage}...`);

    try {
      const generatedAvatar = generateInitialsAvatar(userName, { size });
      
      const savedUrl = await storageService.current.saveAvatar(userId, generatedAvatar, {
        filename: `${userId}-initials.png`,
        mimeType: 'image/png',
        uploadedAt: new Date(),
        originalName: 'Generated Initials Avatar',
      });

      setAvatar(savedUrl);
      onAvatarChange?.(savedUrl);
      setStorageInfo(`Generated avatar saved to ${config.storage}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setStorageInfo(''), 3000);
      
    } catch (error) {
      console.error('Error generating avatar:', error);
      setError(error instanceof Error ? error.message : 'Generation failed');
      setStorageInfo('');
    } finally {
      setIsUploading(false);
    }
  }, [userId, userName, size, onAvatarChange, config.storage]);

  // Remove avatar
  const handleRemoveAvatar = useCallback(async () => {
    setError(null);
    setIsUploading(true);
    setStorageInfo(`Removing avatar from ${config.storage}...`);

    try {
      await storageService.current.removeAvatar(userId);
      setAvatar('');
      onAvatarChange?.('');
      setStorageInfo(`Avatar removed from ${config.storage}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setStorageInfo(''), 3000);
      
    } catch (error) {
      console.error('Error removing avatar:', error);
      setError(error instanceof Error ? error.message : 'Removal failed');
      setStorageInfo('');
    } finally {
      setIsUploading(false);
    }
  }, [userId, onAvatarChange, config.storage]);

  // Get current avatar URL or generate fallback
  const currentAvatarUrl = avatar || generateInitialsAvatar(userName, { size });

  if (isLoading) {
    return (
      <div className={`avatar-upload ${className}`}>
        <div className="text-center">
          <div className="placeholder-glow">
            <div 
              className="placeholder rounded-circle mx-auto mb-3" 
              style={{ width: size, height: size }}
            ></div>
          </div>
          <p className="text-muted">Loading avatar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`avatar-upload ${className}`}>
      <div className="text-center">
        {/* Storage Info */}
        {showStorageInfo && (
          <div className="mb-2">
            <small className="text-muted">
              <i className="bi bi-cloud me-1"></i>
              Storage: {config.storage}
            </small>
          </div>
        )}

        {/* Avatar Display */}
        <div className="avatar-container mb-3 position-relative d-inline-block">
          <Image
            src={currentAvatarUrl}
            alt="Avatar"
            width={size}
            height={size}
            className="rounded-circle border shadow-sm"
            style={{ objectFit: 'cover' }}
          />
          {isUploading && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle"
            >
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="alert alert-danger alert-sm mb-3" role="alert">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {error}
          </div>
        )}

        {storageInfo && (
          <div className="alert alert-info alert-sm mb-3" role="alert">
            <i className="bi bi-info-circle me-1"></i>
            {storageInfo}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`upload-area border-2 border-dashed rounded p-3 mb-3 ${
            dragOver ? 'border-primary bg-light' : 'border-secondary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <i className="bi bi-cloud-upload fs-4 text-muted mb-2"></i>
            <p className="mb-1">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <small className="text-muted">
              {config.allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {Math.round(config.maxFileSize / 1024 / 1024)}MB
            </small>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={config.allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="d-none"
        />

        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <i className="bi bi-upload me-1"></i>
            Upload Photo
          </button>
          
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleGenerateInitials}
            disabled={isUploading}
          >
            <i className="bi bi-person-circle me-1"></i>
            Generate Avatar
          </button>
          
          {avatar && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
            >
              <i className="bi bi-trash me-1"></i>
              Remove
            </button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Images are automatically cropped to square and resized to {size}px. 
            Stored using {config.storage}.
          </small>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadV2;