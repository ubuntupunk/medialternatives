'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  onAvatarChange?: (avatarUrl: string) => void;
  size?: number;
  className?: string;
}

/**
 * Avatar upload widget with multiple generation options
 * Supports file upload, cropping, and generated avatars
 */
const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName = 'User',
  onAvatarChange,
  size = 120,
  className = ''
}) => {
  const [avatar, setAvatar] = useState<string>(currentAvatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Generate a color based on name
  const getAvatarColor = (name: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Generate avatar from initials
  const generateInitialsAvatar = useCallback((name: string, size: number = 120): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = size;
    canvas.height = size;
    
    // Background
    ctx.fillStyle = getAvatarColor(name);
    ctx.fillRect(0, 0, size, size);
    
    // Text
    const initials = getInitials(name);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);
    
    return canvas.toDataURL('image/png');
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Create a cropped/resized version
          resizeImage(result, size).then((resizedImage) => {
            setAvatar(resizedImage);
            onAvatarChange?.(resizedImage);
            setIsUploading(false);
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
      setIsUploading(false);
    }
  }, [size, onAvatarChange]);

  // Resize image to square
  const resizeImage = (src: string, size: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(src);
          return;
        }
        
        canvas.width = size;
        canvas.height = size;
        
        // Calculate crop dimensions to make it square
        const minDimension = Math.min(img.width, img.height);
        const sx = (img.width - minDimension) / 2;
        const sy = (img.height - minDimension) / 2;
        
        // Draw cropped and resized image
        ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = src;
    });
  };

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
  const handleGenerateInitials = useCallback(() => {
    const generatedAvatar = generateInitialsAvatar(userName, size);
    setAvatar(generatedAvatar);
    onAvatarChange?.(generatedAvatar);
    setShowGenerator(false);
  }, [userName, size, generateInitialsAvatar, onAvatarChange]);

  // Remove avatar
  const handleRemoveAvatar = useCallback(() => {
    setAvatar('');
    onAvatarChange?.('');
  }, [onAvatarChange]);

  const currentAvatarUrl = avatar || currentAvatar || '/images/default-avatar.svg';

  return (
    <div className={`avatar-upload ${className}`}>
      <div className="text-center">
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
                <span className="visually-hidden">Uploading...</span>
              </div>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={`upload-area border-2 border-dashed rounded p-4 mb-3 ${
            dragOver ? 'border-primary bg-light' : 'border-secondary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <i className="bi bi-cloud-upload fs-2 text-muted mb-2"></i>
            <p className="mb-1">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <small className="text-muted">
              PNG, JPG, GIF up to 5MB
            </small>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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

        {/* Avatar Generator Modal */}
        {showGenerator && (
          <div className="mt-3 p-3 border rounded bg-light">
            <h6>Generate Avatar</h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Image
                src={generateInitialsAvatar(userName, 60)}
                alt="Generated avatar preview"
                width={60}
                height={60}
                className="rounded-circle border"
              />
              <div>
                <p className="mb-1">
                  <strong>{getInitials(userName)}</strong>
                </p>
                <small className="text-muted">
                  Generated from: {userName}
                </small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleGenerateInitials}
              >
                Use This Avatar
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowGenerator(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            For best results, use a square image. Images will be automatically cropped and resized.
          </small>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
};

export default AvatarUpload;