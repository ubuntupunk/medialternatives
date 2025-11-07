import React, { useState } from 'react';

/**
 * PCloud file interface
 * @typedef {Object} PCloudFile
 * @property {string} filename - Original filename
 * @property {string} publicUrl - Public download URL
 * @property {string} pcloudPath - Path in PCloud storage
 * @property {string} fileid - PCloud file ID
 * @property {'transcripts'|'legal'} category - File category
 * @property {number} size - File size in bytes
 */

/**
 * PCloud file handler props interface
 * @typedef {Object} PCloudFileHandlerProps
 * @property {PCloudFile} file - File information
 * @property {string} [title] - Optional display title
 * @property {string} [className=''] - Additional CSS classes
 * @property {boolean} [showFileInfo=false] - Whether to show file size and info
 * @property {boolean} [trackDownloads=true] - Whether to track download events
 */

/**
 * PCloud File Handler Component
 *
 * Individual file download component for PCloud-hosted files.
 * Handles download tracking, file information display, and download state management.
 * Supports both legal documents and court transcripts with proper categorization.
 *
 * @component
 * @param {PCloudFileHandlerProps} props - Component props
 * @returns {JSX.Element} The rendered file download component
 *
 * @example
 * ```tsx
 * const file = {
 *   filename: 'document.pdf',
 *   publicUrl: 'https://pcloud.com/download/...',
 *   pcloudPath: '/legal/document.pdf',
 *   fileid: '12345',
 *   category: 'legal',
 *   size: 1024000
 * };
 *
 * <PCloudFileHandler
 *   file={file}
 *   title="Legal Document"
 *   showFileInfo={true}
 *   trackDownloads={true}
 * />
 * ```
 */
const PCloudFileHandler: React.FC<PCloudFileHandlerProps> = ({
  file,
  title,
  className = '',
  showFileInfo = false,
  trackDownloads = true
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Track download if enabled
      if (trackDownloads) {
        try {
          await fetch('/api/downloads/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.filename,
              fileid: file.fileid,
              category: file.category,
              timestamp: new Date().toISOString()
            })
          });
          setDownloadCount(prev => prev + 1);
        } catch (trackError) {
          console.warn('Failed to track download:', trackError);
        }
      }
      
      // Open download in new tab/window
      window.open(file.publicUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const displayTitle = title || file.filename.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');

  return (
    <div className={`pcloud-file-handler my-3 ${className}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="file-info flex-grow-1">
          <h6 className="mb-1">{displayTitle}</h6>
          {showFileInfo && (
            <small className="text-muted">
              {formatFileSize(file.size)} • {file.category === 'transcripts' ? 'Court Transcript' : 'Legal Document'}
            </small>
          )}
        </div>
        
        <div className="download-actions">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-primary btn-sm me-2"
            title={`Download ${file.filename}`}
          >
            {isDownloading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Downloading...
              </>
            ) : (
              <>
                <i className="bi bi-download me-1"></i>
                Download
              </>
            )}
          </button>
          
          {/* View/Preview button for PDFs */}
          <a
            href={file.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary btn-sm"
            title={`View ${file.filename} in browser`}
          >
            <i className="bi bi-eye me-1"></i>
            View
          </a>
        </div>
      </div>
      
      {/* Additional file metadata */}
      {showFileInfo && (
        <div className="file-metadata mt-2">
          <small className="text-muted d-block">
            <strong>File:</strong> {file.filename}
          </small>
          <small className="text-muted d-block">
            <strong>Storage:</strong> pCloud ({file.pcloudPath})
          </small>
          {trackDownloads && downloadCount > 0 && (
            <small className="text-muted d-block">
              <strong>Downloads:</strong> {downloadCount} this session
            </small>
          )}
        </div>
      )}
    </div>
  );
};

export default PCloudFileHandler;