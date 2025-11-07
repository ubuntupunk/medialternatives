#!/usr/bin/env node

/**
 * Legal PDFs Manifest Generator
 * 
 * Creates a comprehensive manifest of downloaded legal documents
 * Includes file validation, integrity checks, and metadata
 * Run with: node scripts/create-legal-pdfs-manifest.js
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const LEGAL_PDFS_DIR = path.join(__dirname, '../downloads/legal-pdfs');
const MANIFEST_FILE = path.join(__dirname, '../legal-pdfs-manifest.json');

// File type detection
const FILE_TYPES = {
  '.pdf': 'Portable Document Format',
  '.doc': 'Microsoft Word Document',
  '.docx': 'Microsoft Word Document (XML)',
  '.txt': 'Plain Text Document'
};

/**
 * Calculate file hash for integrity checking
 */
async function calculateFileHash(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Get file statistics and metadata
 */
async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      size: stats.size,
      sizeKB: Math.round(stats.size / 1024),
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
      fileType: FILE_TYPES[ext] || 'Unknown',
      extension: ext,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Validate PDF file (basic check)
 */
async function validatePDF(filePath) {
  try {
    const buffer = await fs.readFile(filePath, { encoding: null });
    
    // Check PDF header
    const pdfHeader = buffer.slice(0, 4).toString('ascii');
    const hasPDFHeader = pdfHeader === '%PDF';
    
    // Check for PDF trailer - look in last 1024 bytes for %%EOF
    const trailerSection = buffer.slice(-1024);
    const hasTrailer = trailerSection.includes(Buffer.from('%%EOF', 'ascii'));
    
    // Basic size validation (PDFs should be at least 1KB)
    const minSize = buffer.length > 1024;
    
    // Additional check: look for PDF version in header
    const headerSection = buffer.slice(0, 20).toString('ascii');
    const versionMatch = headerSection.match(/%PDF-(\d+\.\d+)/);
    const hasVersion = versionMatch !== null;
    
    return {
      isValid: hasPDFHeader && hasTrailer && minSize && hasVersion,
      hasPDFHeader,
      hasTrailer,
      minSize,
      hasVersion,
      version: versionMatch ? versionMatch[1] : null,
      actualSize: buffer.length
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Scan directory recursively
 */
async function scanDirectory(dirPath, relativePath = '') {
  const items = [];
  
  try {
    const entries = await fs.readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const relPath = path.join(relativePath, entry);
      const stats = await getFileStats(fullPath);
      
      if (!stats) continue;
      
      if (stats.isDirectory) {
        // Recursively scan subdirectory
        const subItems = await scanDirectory(fullPath, relPath);
        items.push({
          name: entry,
          type: 'directory',
          path: relPath,
          fullPath,
          stats,
          children: subItems,
          fileCount: subItems.length
        });
      } else if (stats.isFile) {
        // Process file
        const hash = await calculateFileHash(fullPath);
        let validation = null;
        
        // Validate PDF files
        if (stats.extension === '.pdf') {
          validation = await validatePDF(fullPath);
        }
        
        items.push({
          name: entry,
          type: 'file',
          path: relPath,
          fullPath,
          stats,
          hash,
          validation
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return items;
}

/**
 * Generate file mapping for renamed files
 */
function generateFileMapping() {
  return {
    // Known file renames
    'Supplement-Affidavit-CBC-Kahanovitz-9-MAY-2017-TUE.pdf': {
      originalName: 'Supplement-Affidavit-CBC-Kahanovitz-9-MAY-2017-TUE-.doc-0BycjkxOoSHFeRV8zOTl6NjZYbGM.pdf',
      reason: 'Removed problematic characters and Google Drive ID suffix',
      renamedBy: 'manual',
      date: new Date().toISOString()
    }
  };
}

/**
 * Generate summary statistics
 */
function generateSummary(manifest) {
  const files = [];
  const directories = [];
  
  function collectItems(items) {
    for (const item of items) {
      if (item.type === 'file') {
        files.push(item);
      } else if (item.type === 'directory') {
        directories.push(item);
        if (item.children) {
          collectItems(item.children);
        }
      }
    }
  }
  
  collectItems(manifest.contents);
  
  const totalSize = files.reduce((sum, file) => sum + file.stats.size, 0);
  const pdfFiles = files.filter(f => f.stats.extension === '.pdf');
  const validPDFs = pdfFiles.filter(f => f.validation && f.validation.isValid);
  const invalidPDFs = pdfFiles.filter(f => f.validation && !f.validation.isValid);
  
  // File size distribution
  const sizeRanges = {
    'under_100KB': files.filter(f => f.stats.size < 100 * 1024).length,
    '100KB_1MB': files.filter(f => f.stats.size >= 100 * 1024 && f.stats.size < 1024 * 1024).length,
    '1MB_10MB': files.filter(f => f.stats.size >= 1024 * 1024 && f.stats.size < 10 * 1024 * 1024).length,
    'over_10MB': files.filter(f => f.stats.size >= 10 * 1024 * 1024).length
  };
  
  return {
    totalFiles: files.length,
    totalDirectories: directories.length,
    totalSize,
    totalSizeKB: Math.round(totalSize / 1024),
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    fileTypes: {
      pdf: pdfFiles.length,
      other: files.length - pdfFiles.length
    },
    validation: {
      validPDFs: validPDFs.length,
      invalidPDFs: invalidPDFs.length,
      validationRate: pdfFiles.length > 0 ? ((validPDFs.length / pdfFiles.length) * 100).toFixed(1) + '%' : 'N/A'
    },
    sizeDistribution: sizeRanges,
    largestFile: files.length > 0 ? {
      name: files.reduce((max, file) => file.stats.size > max.stats.size ? file : max).name,
      size: Math.max(...files.map(f => f.stats.size)),
      sizeMB: (Math.max(...files.map(f => f.stats.size)) / (1024 * 1024)).toFixed(2)
    } : null,
    smallestFile: files.length > 0 ? {
      name: files.reduce((min, file) => file.stats.size < min.stats.size ? file : min).name,
      size: Math.min(...files.map(f => f.stats.size)),
      sizeKB: Math.round(Math.min(...files.map(f => f.stats.size)) / 1024)
    } : null
  };
}

/**
 * Main manifest generation function
 */
async function createManifest() {
  console.log('📋 Creating Legal PDFs Manifest...');
  console.log('==================================');
  console.log(`📁 Scanning directory: ${LEGAL_PDFS_DIR}`);
  console.log('');
  
  try {
    // Check if directory exists
    try {
      await fs.access(LEGAL_PDFS_DIR);
    } catch (error) {
      console.error(`❌ Directory not found: ${LEGAL_PDFS_DIR}`);
      console.log('Run the download script first: node scripts/migrate-pdfs-pcloud.js');
      return;
    }
    
    // Scan directory structure
    console.log('🔍 Scanning files and calculating hashes...');
    const contents = await scanDirectory(LEGAL_PDFS_DIR);
    
    // Generate file mappings
    const fileMappings = generateFileMapping();
    
    // Create manifest
    const manifest = {
      metadata: {
        title: 'Medialternatives Legal Documents Manifest',
        description: 'Comprehensive catalog of downloaded legal PDFs for pCloud migration',
        created: new Date().toISOString(),
        version: '1.0.0',
        generator: 'create-legal-pdfs-manifest.js',
        baseDirectory: LEGAL_PDFS_DIR
      },
      summary: null, // Will be filled below
      fileMappings,
      contents
    };
    
    // Generate summary
    manifest.summary = generateSummary(manifest);
    
    // Save manifest
    await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    
    // Display results
    console.log('✅ Manifest created successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   📄 Total files: ${manifest.summary.totalFiles}`);
    console.log(`   📁 Total directories: ${manifest.summary.totalDirectories}`);
    console.log(`   💾 Total size: ${manifest.summary.totalSizeMB} MB`);
    console.log(`   📋 PDF files: ${manifest.summary.fileTypes.pdf}`);
    console.log(`   ✅ Valid PDFs: ${manifest.summary.validation.validPDFs}`);
    console.log(`   ❌ Invalid PDFs: ${manifest.summary.validation.invalidPDFs}`);
    console.log(`   📈 Validation rate: ${manifest.summary.validation.validationRate}`);
    console.log('');
    
    if (manifest.summary.largestFile) {
      console.log(`📏 Largest file: ${manifest.summary.largestFile.name} (${manifest.summary.largestFile.sizeMB} MB)`);
    }
    
    if (manifest.summary.smallestFile) {
      console.log(`📏 Smallest file: ${manifest.summary.smallestFile.name} (${manifest.summary.smallestFile.sizeKB} KB)`);
    }
    
    console.log('');
    console.log('📁 Size distribution:');
    console.log(`   Under 100KB: ${manifest.summary.sizeDistribution.under_100KB} files`);
    console.log(`   100KB - 1MB: ${manifest.summary.sizeDistribution['100KB_1MB']} files`);
    console.log(`   1MB - 10MB: ${manifest.summary.sizeDistribution['1MB_10MB']} files`);
    console.log(`   Over 10MB: ${manifest.summary.sizeDistribution.over_10MB} files`);
    console.log('');
    
    // Show any validation issues
    const invalidFiles = [];
    function findInvalidFiles(items) {
      for (const item of items) {
        if (item.type === 'file' && item.validation && !item.validation.isValid) {
          invalidFiles.push(item);
        } else if (item.type === 'directory' && item.children) {
          findInvalidFiles(item.children);
        }
      }
    }
    findInvalidFiles(manifest.contents);
    
    if (invalidFiles.length > 0) {
      console.log('⚠️  Validation Issues:');
      invalidFiles.forEach(file => {
        console.log(`   ❌ ${file.name}: ${file.validation.error || 'Invalid PDF structure'}`);
      });
      console.log('');
    }
    
    // Show file mappings
    if (Object.keys(fileMappings).length > 0) {
      console.log('🔄 File Mappings (Renamed Files):');
      Object.entries(fileMappings).forEach(([newName, info]) => {
        console.log(`   📝 ${newName}`);
        console.log(`      Original: ${info.originalName}`);
        console.log(`      Reason: ${info.reason}`);
      });
      console.log('');
    }
    
    console.log(`💾 Manifest saved: ${MANIFEST_FILE}`);
    console.log('');
    console.log('🔄 Next steps:');
    console.log('  1. Review manifest for any validation issues');
    console.log('  2. Upload files to pCloud using the organized structure');
    console.log('  3. Generate public links for each file');
    console.log('  4. Update case.md with new URLs');
    
  } catch (error) {
    console.error('💥 Manifest creation failed:', error);
    process.exit(1);
  }
}

// Run manifest creation
if (require.main === module) {
  createManifest().catch(console.error);
}

module.exports = { createManifest, calculateFileHash, validatePDF };