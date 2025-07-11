#!/usr/bin/env node

/**
 * PDF Migration Script using pCloud Console Client
 * 
 * Simple approach using official pCloud console client (C binary)
 * No OAuth2 required - just username/password
 * 
 * Run with: node scripts/migrate-pdfs-console.js
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { 
  checkPCloudClient, 
  startPCloudDaemon, 
  stopPCloudDaemon, 
  uploadFile, 
  getPublicLink,
  execPCloudCommand 
} = require('./pcloud-console-wrapper');

// Load environment variables
require('dotenv').config();

// List of all PDF URLs (with fixed URLs)
const PDF_URLS = [
  // Court Transcripts
  'https://medialternatives.com/app/uploads/2020/07/Transcripts-Index-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_1-4-November-2009-FP-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_1-4-November-2009-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_2-5-November-2009-Letter-to-the-Chief-Registrar-Head-o...-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_2-5-November-2009-FP-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_2-5-November-2009-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_3-6-November-2009-Letter-to-the-Chief-Registrar-Head-o...-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_3-6-November-2009-FP-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_3-6-November-2009-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_4-_-5-20-_-21-January-2010-Letter-to-the-Chief-Registrar...-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_4-20-January-2010-FP-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_4-20-January-2010-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_5-21-January-2010-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/Cheadle-Report-to-Cape-Law-Society-6-September-2011-1.pdf',
  
  // Legal Documents
  'https://medialternatives.com/app/uploads/2022/07/Founding-Affidavit.pdf',
  'https://medialternatives.com/app/uploads/2022/07/Annexures-PAJA-3.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Affidavit-20-November-2017-Addendum-4.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Third-Supplementary-Affidavit-Perjury-A-Dean.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Founding-Affidavit-Perjury-A-Dean.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Associate-Professor-Lesley-Cowling-Rejects-Plagiarism-Accusation.pdf',
  'https://medialternatives.com/app/uploads/2024/05/Trace-Report-A-Dean.pdf',
  'https://medialternatives.com/app/uploads/2022/07/Supplement-Affidavit-CBC-Kahanovitz-9-MAY-2017-TUE-.doc-0BycjkxOoSHFeRV8zOTl6NjZYbGM.pdf',
  'https://medialternatives.com/app/uploads/2022/06/LIT10153ZA00-Letter-to-Naspers-26.07.2016.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Gmail-FW-Lewis-_-Naspers-Copyright-protection.pdf',
  'https://medialternatives.com/app/uploads/2022/06/NASPERS-LTD-AND-MEDIA24-DIE-BURGER-COPYRIGHT-PROTECTION-IN-THE-NAME-OF....pdf',
  'https://medialternatives.com/app/uploads/2022/06/RWR-Letter-to-Maserumule-12.10.2016.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Gagging-Letter-JS-De-Villiers-26-June-2006.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Fxi-Letter-to-Hein-Brand-per-Jeenah-and-Delaney-29-Aug-2006.pdf',
  'https://medialternatives.com/app/uploads/2022/06/TRC-Unit-28-Sept-2006.pdf',
  'https://medialternatives.com/app/uploads/2022/06/TRC-Unit-26-Oct-2006.pdf',
  'https://medialternatives.com/app/uploads/2022/06/TRC-Unit-26-Sept-2007.pdf',
  'https://medialternatives.com/app/uploads/2022/08/DOC065-1.pdf'
];

// pCloud folder structure
const PCLOUD_FOLDERS = {
  root: '/medialternatives-legal-docs',
  transcripts: '/medialternatives-legal-docs/court-transcripts',
  legal: '/medialternatives-legal-docs/legal-documents'
};

/**
 * Download a file from URL to local path
 */
async function downloadFileToLocal(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
      
      file.on('error', (err) => {
        fs.unlink(outputPath);
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Get file category based on URL
 */
function getFileCategory(url) {
  if (url.includes('/2020/07/')) {
    return 'transcripts';
  }
  return 'legal';
}

/**
 * Extract filename from URL
 */
function getFilename(url) {
  return path.basename(url.split('?')[0]);
}

/**
 * Create folder structure in pCloud
 */
async function createFolderStructure() {
  try {
    console.log('📁 Creating folder structure in pCloud...');
    
    await execPCloudCommand(`mkdir -p "${PCLOUD_FOLDERS.root}"`);
    console.log(`✅ Created: ${PCLOUD_FOLDERS.root}`);
    
    await execPCloudCommand(`mkdir -p "${PCLOUD_FOLDERS.transcripts}"`);
    console.log(`✅ Created: ${PCLOUD_FOLDERS.transcripts}`);
    
    await execPCloudCommand(`mkdir -p "${PCLOUD_FOLDERS.legal}"`);
    console.log(`✅ Created: ${PCLOUD_FOLDERS.legal}`);
    
  } catch (error) {
    console.warn('📁 Folders might already exist, continuing...');
  }
}

/**
 * Main migration function using console client
 */
async function migratePDFsWithConsole() {
  console.log('🚀 Starting PDF migration with pCloud Console Client...');
  console.log(`📄 Found ${PDF_URLS.length} PDFs to migrate`);
  
  // Check if console client is available
  const clientPath = await checkPCloudClient();
  if (!clientPath) {
    console.error('❌ pCloud console client not found!');
    console.log('');
    console.log('Please install it first:');
    console.log('1. Run: node scripts/pcloud-console-wrapper.js');
    console.log('2. Follow installation instructions');
    console.log('3. Run this script again');
    return;
  }
  
  console.log(`✅ pCloud console client found: ${clientPath}`);
  
  // Create temp directory
  const tempDir = path.join(__dirname, '../temp-pdfs');
  await fs.mkdir(tempDir, { recursive: true });
  
  const results = {
    downloaded: [],
    uploaded: [],
    failed: [],
    totalSize: 0
  };
  
  try {
    // Start pCloud daemon
    await startPCloudDaemon();
    
    // Create folder structure
    await createFolderStructure();
    
    for (const url of PDF_URLS) {
      const filename = getFilename(url);
      const category = getFileCategory(url);
      const tempPath = path.join(tempDir, filename);
      
      try {
        console.log(`⬇️  Downloading: ${filename}`);
        await downloadFileToLocal(url, tempPath);
        
        const stats = await fs.stat(tempPath);
        results.downloaded.push({ url, filename, size: stats.size });
        console.log(`✅ Downloaded: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Upload to pCloud
        const remoteFolder = category === 'transcripts' ? PCLOUD_FOLDERS.transcripts : PCLOUD_FOLDERS.legal;
        const remotePath = `${remoteFolder}/${filename}`;
        
        console.log(`⬆️  Uploading to pCloud: ${filename}`);
        await uploadFile(tempPath, remotePath);
        
        // Get public link
        const publicLink = await getPublicLink(remotePath);
        
        results.uploaded.push({
          filename,
          category,
          oldUrl: url,
          newUrl: publicLink,
          pcloudPath: remotePath,
          size: stats.size
        });
        
        results.totalSize += stats.size;
        console.log(`✅ Uploaded: ${filename} -> ${publicLink || 'Link generation failed'}`);
        
        // Clean up temp file
        await fs.unlink(tempPath);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed: ${filename} - ${error.message}`);
        results.failed.push({ url, filename, error: error.message });
      }
    }
    
    // Generate comprehensive report
    console.log('\n📊 Migration Report:');
    console.log(`✅ Successfully migrated: ${results.uploaded.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`💾 Total size uploaded: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed files:');
      results.failed.forEach(item => {
        console.log(`  - ${item.filename}: ${item.error}`);
      });
    }
    
    // Save mappings
    const urlMapping = {};
    const pcloudMapping = {};
    
    results.uploaded.forEach(item => {
      if (item.newUrl) {
        urlMapping[item.oldUrl] = item.newUrl;
      }
      pcloudMapping[item.filename] = {
        publicUrl: item.newUrl,
        pcloudPath: item.pcloudPath,
        category: item.category,
        size: item.size
      };
    });
    
    await fs.writeFile(
      path.join(__dirname, '../pdf-url-mapping-console.json'),
      JSON.stringify(urlMapping, null, 2)
    );
    
    await fs.writeFile(
      path.join(__dirname, '../pcloud-console-mapping.json'),
      JSON.stringify(pcloudMapping, null, 2)
    );
    
    await fs.writeFile(
      path.join(__dirname, '../migration-report-console.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 Files saved:');
    console.log('  - pdf-url-mapping-console.json (for updating case.md)');
    console.log('  - pcloud-console-mapping.json (detailed pCloud info)');
    console.log('  - migration-report-console.json (full migration report)');
    
    console.log('\n🔄 Next steps:');
    console.log('  1. Update case.md with new pCloud URLs');
    console.log('  2. Test all download links');
    console.log('  3. Deploy updated content');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    // Stop pCloud daemon
    await stopPCloudDaemon();
    
    // Cleanup temp directory
    try {
      await fs.rmdir(tempDir, { recursive: true });
      console.log('🧹 Cleaned up temporary files');
    } catch (error) {
      console.warn('Warning: Failed to clean up temp directory');
    }
  }
}

// Run migration
if (require.main === module) {
  migratePDFsWithConsole().catch(console.error);
}

module.exports = { migratePDFsWithConsole, PDF_URLS, PCLOUD_FOLDERS };