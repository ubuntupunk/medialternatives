'use client';

import React, { useState, useMemo } from 'react';
import PCloudFileHandler from './PCloudFileHandler';

/**
 * PCloud file interface
 */
export interface PCloudFile {
  filename: string;
  publicUrl: string;
  pcloudPath: string;
  fileid: string;
  category: 'transcripts' | 'legal';
  size: number;
  title?: string;
}

/**
 * PCloud download grid props interface
 */
export interface PCloudDownloadGridProps {
  files: PCloudFile[];
  title?: string;
  showCategories?: boolean;
  showSearch?: boolean;
  className?: string;
}

/**
 * PCloud Download Grid Component
 *
 * Interactive grid component for displaying and downloading files from PCloud.
 * Features search, category filtering, and direct download links.
 * Supports legal documents and court transcripts with organized display.
 *
 * @component
 * @param {PCloudDownloadGridProps} props - Component props
 * @returns {JSX.Element} The rendered download grid
 *
 * @example
 * ```tsx
 * const files = [
 *   {
 *     filename: 'document.pdf',
 *     publicUrl: 'https://...',
 *     pcloudPath: '/legal/document.pdf',
 *     fileid: '12345',
 *     category: 'legal',
 *     size: 1024000,
 *     title: 'Legal Document'
 *   }
 * ];
 *
 * <PCloudDownloadGrid
 *   files={files}
 *   title="Legal Archive"
 *   showCategories={true}
 *   showSearch={true}
 * />
 * ```
 */
export const PCloudDownloadGrid: React.FC<PCloudDownloadGridProps> = ({
  files,
  title = 'Legal Documents',
  showCategories = true,
  showSearch = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter and search files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = searchTerm === '' || 
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.title && file.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [files, searchTerm, selectedCategory]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: files.length,
      transcripts: counts.transcripts || 0,
      legal: counts.legal || 0
    };
  }, [files]);

  const totalSize = useMemo(() => {
    return filteredFiles.reduce((total, file) => total + file.size, 0);
  }, [filteredFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`pcloud-download-grid ${className}`}>
      {/* Header */}
      <div className="download-grid-header mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">{title}</h2>
          <div className="text-muted small">
            {filteredFiles.length} files • {formatFileSize(totalSize)}
          </div>
        </div>

        {/* Search and Filters */}
        {(showSearch || showCategories) && (
          <div className="row g-3 mb-4">
            {showSearch && (
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>
            )}

            {showCategories && (
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories ({categoryCounts.all})</option>
                  <option value="transcripts">
                    📋 Court Transcripts ({categoryCounts.transcripts})
                  </option>
                  <option value="legal">
                    ⚖️ Legal Documents ({categoryCounts.legal})
                  </option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No documents found</h5>
          <p className="text-muted">
            {searchTerm ? 'Try adjusting your search terms' : 'No documents available'}
          </p>
        </div>
      ) : (
        <div className="download-grid">
          {filteredFiles.map((file, index) => (
            <PCloudFileHandler
              key={`${file.fileid}-${index}`}
              file={file}
              title={file.title}
              className="mb-3"
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="download-grid-footer mt-4 pt-3 border-top">
        <div className="row g-3 text-center text-md-start">
          <div className="col-md-4">
            <small className="text-muted">
              <i className="bi bi-cloud-check me-1"></i>
              Securely hosted on pCloud
            </small>
          </div>
          <div className="col-md-4">
            <small className="text-muted">
              <i className="bi bi-shield-lock me-1"></i>
              All downloads are secure
            </small>
          </div>
          <div className="col-md-4">
            <small className="text-muted">
              <i className="bi bi-download me-1"></i>
              {filteredFiles.length} documents available
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCloudDownloadGrid;