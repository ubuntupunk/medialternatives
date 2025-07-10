# pCloud PDF Migration Guide

## Overview

This guide documents the complete PDF migration system for Medialternatives, designed to move 32 critical legal documents from broken WordPress URLs to secure pCloud storage. The system provides reliable hosting for court transcripts and legal documents with 10GB of free storage.

## Problem Statement

The `/case` page contained 32 important legal documents with broken or at-risk URLs:
- **13 files** on `newsite.medialternatives.com` (completely broken)
- **18 files** on `medialternatives.com` (may break in future)
- **1 file** with malformed URL (double slash)

These documents include critical court transcripts from the Lewis v Media24 case and supporting legal evidence.

## Solution: pCloud Migration System

### Why pCloud?
- **10GB free storage** - generous for our needs
- **Excellent SDK** - robust JavaScript/Node.js integration
- **Global CDN** - fast downloads worldwide
- **Secure hosting** - HTTPS with reliable uptime
- **No bandwidth limits** - unlimited downloads

## Architecture

### Components

#### 1. Migration Script (`scripts/migrate-pdfs-pcloud.js`)
- Downloads PDFs from fixed medialternatives.com URLs
- Uploads to organized pCloud folder structure
- Generates URL mappings for content updates
- Provides detailed migration reporting

#### 2. Runner Script (`scripts/run-pcloud-migration.sh`)
- Automated setup and credential validation
- Dependency installation via bun
- Interactive migration process
- Post-migration reporting

#### 3. React Components
- **PCloudFileHandler**: Individual file download component
- **PCloudDownloadGrid**: Organized file display with search/filter
- **TypeScript types**: Complete type definitions

### Folder Structure

```
/medialternatives-legal-docs/
├── court-transcripts/          # 13 files from 2020/07
│   ├── Transcripts-Index-1.pdf
│   ├── C88-07-Vol_1-4-November-2009-FP-1.pdf
│   ├── C88-07-Vol_1-4-November-2009-1.pdf
│   └── ... (10 more transcript files)
└── legal-documents/            # 19 files from 2022-2024
    ├── Founding-Affidavit.pdf
    ├── Annexures-PAJA-3.pdf
    ├── Third-Supplementary-Affidavit-Perjury-A-Dean.pdf
    └── ... (16 more legal documents)
```

## Setup Instructions

### 1. pCloud Account Setup

1. **Create pCloud Account**
   - Sign up at [pcloud.com](https://pcloud.com)
   - Verify email and complete setup
   - Note: Free account provides 10GB storage

2. **Get Authentication Credentials**

   **Option A: OAuth Token (Recommended)**
   - Go to pCloud App Console
   - Create new app or use existing
   - Generate OAuth access token
   - Copy token for environment variables

   **Option B: Username/Password**
   - Use your pCloud login credentials
   - Less secure but simpler setup

### 2. Environment Configuration

Create or update `frontend-app/.env.local`:

```bash
# pCloud Storage Configuration

# Option A: OAuth Token (Recommended)
PCLOUD_ACCESS_TOKEN=your_pcloud_oauth_token_here

# Option B: Username/Password (Alternative)
PCLOUD_USERNAME=your_pcloud_username
PCLOUD_PASSWORD=your_pcloud_password
```

### 3. Dependencies

Install required packages:

```bash
cd frontend-app
bun add pcloud-sdk-js dotenv
```

## Migration Process

### Step 1: Run Migration

```bash
# Make script executable (if not already)
chmod +x frontend-app/scripts/run-pcloud-migration.sh

# Run migration
cd frontend-app
./scripts/run-pcloud-migration.sh
```

### Step 2: Migration Process

The script will:
1. **Validate credentials** and check pCloud connection
2. **Show account info** (storage usage, available space)
3. **Create folder structure** in pCloud
4. **Download each PDF** from medialternatives.com
5. **Upload to pCloud** with organized folder structure
6. **Generate public links** for each file
7. **Create URL mappings** for content updates

### Step 3: Generated Files

After successful migration:

```
frontend-app/
├── pdf-url-mapping-pcloud.json     # URL mappings for case.md updates
├── pcloud-file-mapping.json        # Detailed pCloud file information
└── migration-report-pcloud.json    # Complete migration report
```

## Content Updates

### Update case.md

Use the generated `pdf-url-mapping-pcloud.json` to update download links:

```bash
# Example mapping
{
  "https://medialternatives.com/app/uploads/2020/07/Transcripts-Index-1.pdf": "https://e1.pcloud.link/publink/show?code=XYZ123...",
  "https://medialternatives.com/app/uploads/2022/07/Founding-Affidavit.pdf": "https://e1.pcloud.link/publink/show?code=ABC456..."
}
```

### Integration with React Components

```tsx
import { PCloudFileHandler, PCloudDownloadGrid } from '@/components/Downloads';

// Individual file
<PCloudFileHandler
  file={{
    filename: "Founding-Affidavit.pdf",
    publicUrl: "https://e1.pcloud.link/publink/show?code=...",
    pcloudPath: "/medialternatives-legal-docs/legal-documents/Founding-Affidavit.pdf",
    fileid: "12345",
    category: "legal",
    size: 2048576
  }}
  title="Founding Affidavit"
/>

// Grid of files
<PCloudDownloadGrid
  files={pcloudFiles}
  title="Legal Documents"
  showCategories={true}
  showSearch={true}
/>
```

## Features

### Download Tracking

The system includes download analytics:

```typescript
// Automatic tracking on download
{
  file_name: "Founding-Affidavit.pdf",
  file_category: "legal",
  file_size: 2048576,
  timestamp: "2024-01-01T12:00:00Z"
}
```

### Search and Filtering

- **Text search** across filenames and titles
- **Category filtering** (Court Transcripts, Legal Documents)
- **File size display** and total storage usage
- **Responsive design** for mobile and desktop

### Error Handling

- **Connection failures**: Retry logic with exponential backoff
- **Authentication errors**: Clear credential validation messages
- **Storage limits**: Account usage monitoring and warnings
- **Download failures**: Graceful error handling with user feedback

## Monitoring and Maintenance

### Storage Usage

Monitor pCloud storage usage:

```bash
# Check account info during migration
# Script automatically displays:
# - Total storage: 10.00 GB
# - Used storage: 0.25 GB (2.5%)
# - Available: 9.75 GB
```

### File Management

- **Backup strategy**: Keep original URLs as fallback
- **Version control**: Track file updates and changes
- **Access logs**: Monitor download patterns and usage
- **Security**: Regular credential rotation

### Performance Optimization

- **CDN delivery**: pCloud provides global CDN
- **Caching**: Browser caching for repeated downloads
- **Compression**: PDFs are already optimized
- **Lazy loading**: Load file metadata on demand

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

```bash
# Error: pCloud credentials not found
# Solution: Check .env.local file
PCLOUD_ACCESS_TOKEN=your_token_here
```

#### 2. Storage Limit Exceeded

```bash
# Error: Insufficient storage space
# Solution: Clean up old files or upgrade account
# Current usage: 9.8GB / 10GB (98%)
```

#### 3. Download Failures

```bash
# Error: Failed to download PDF from source
# Solution: Check if original URL is accessible
curl -I "https://medialternatives.com/app/uploads/file.pdf"
```

#### 4. Upload Failures

```bash
# Error: Failed to upload to pCloud
# Solutions:
# - Check internet connection
# - Verify pCloud service status
# - Ensure sufficient storage space
```

### Debug Mode

Enable detailed logging:

```bash
# Add to .env.local
PCLOUD_DEBUG=true
NODE_ENV=development
```

### Manual Recovery

If migration fails partially:

1. **Check migration report** for failed files
2. **Re-run migration** (script handles duplicates)
3. **Manual upload** via pCloud web interface
4. **Update mappings** manually if needed

## Security Considerations

### Access Control

- **Public links**: Files are publicly accessible via pCloud links
- **No authentication**: Downloads don't require pCloud account
- **HTTPS only**: All downloads over secure connections
- **Link obfuscation**: pCloud URLs are not easily guessable

### Data Protection

- **Backup retention**: Keep original files until migration verified
- **Version control**: Track all URL changes in git
- **Access logging**: Monitor download patterns for abuse
- **Regular audits**: Verify file accessibility and integrity

### Credential Management

- **Environment variables**: Never commit credentials to git
- **Token rotation**: Regularly update OAuth tokens
- **Principle of least privilege**: Use read-only tokens when possible
- **Secure storage**: Use secure environment variable management

## Cost Analysis

### pCloud Free Tier

- **Storage**: 10GB (sufficient for current needs)
- **Bandwidth**: Unlimited downloads
- **Files**: Unlimited number of files
- **API calls**: Generous limits for our usage

### Current Usage Estimate

```
Court Transcripts: ~150MB (13 files)
Legal Documents:   ~100MB (19 files)
Total Estimated:   ~250MB (2.5% of 10GB)
Growth Buffer:     ~9.75GB available
```

### Upgrade Path

If storage needs exceed 10GB:
- **pCloud Premium**: 500GB for $4.99/month
- **Alternative**: Implement multi-provider strategy
- **Optimization**: Compress older documents

## Future Enhancements

### Planned Features

1. **Automatic sync**: Regular checks for new documents
2. **Version management**: Handle document updates
3. **Download analytics**: Detailed usage reporting
4. **Search optimization**: Full-text search within PDFs
5. **Mobile optimization**: Progressive Web App features

### Integration Opportunities

1. **WordPress.com sync**: Automatic detection of new uploads
2. **Legal case management**: Integration with case tracking
3. **Document versioning**: Track changes and updates
4. **Access control**: User-based download permissions

## Conclusion

The pCloud PDF migration system provides a robust, scalable solution for hosting critical legal documents. With 10GB of free storage, comprehensive error handling, and modern React components, it ensures reliable access to important case materials while maintaining security and performance standards.

The system is designed for long-term sustainability with clear upgrade paths and monitoring capabilities to ensure continued service availability.