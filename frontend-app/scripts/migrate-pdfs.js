#!/usr/bin/env node

/**
 * PDF Migration Script for Medialternatives
 * 
 * This script downloads PDFs from broken URLs and uploads them to Vercel Blob Storage
 * Run with: node scripts/migrate-pdfs.js
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { put } = require('@vercel/blob');

// List of all PDF URLs that need migration
const PDF_URLS = [
  // Transcripts (medialternatives.com - broken)
  'https://newsite.medialternatives.com/app/uploads/2020/07/Transcripts-Index-1.pdf',
  'https://medialternatives.com/app/uploads/2020/07/C88-07-Vol_1-4-November-2009-FP-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_1-4-November-2009-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_2-5-November-2009-Letter-to-the-Chief-Registrar-Head-o...-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_2-5-November-2009-FP-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_2-5-November-2009-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_3-6-November-2009-Letter-to-the-Chief-Registrar-Head-o...-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_3-6-November-2009-FP-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_3-6-November-2009-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_4-_-5-20-_-21-January-2010-Letter-to-the-Chief-Registrar...-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_4-20-January-2010-FP-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_4-20-January-2010-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/C88-07-Vol_5-21-January-2010-1.pdf',
  'https://newsite.medialternatives.com/app/uploads/2020/07/Cheadle-Report-to-Cape-Law-Society-6-September-2011-1.pdf',
  
  // Legal documents (medialternatives.com - may break)
  'https://medialternatives.com/app/uploads/2022/07/Founding-Affidavit.pdf',
  'https://medialternatives.com/app/uploads/2022/07/Annexures-PAJA-3.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Affidavit-20-November-2017-Addendum-4.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Third-Supplementary-Affidavit-Perjury-A-Dean.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Founding-Affidavit-Perjury-A-Dean.pdf',
  'https://medialternatives.com/app/uploads/2022/06/Associate-Professor-Lesley-Cowling-Rejects-Plagiarism-Accusation.pdf',
  'https://medialternatives.com//app/uploads/2024/05/Trace-Report-A-Dean.pdf', // Note: double slash
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

/**
 * Download a file from URL
 */
async function downloadFile(url, outputPath) {
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
 * Extract filename from URL
 */
function getFilename(url) {
  return path.basename(url.split('?')[0]);
}

/**
 * Upload file to Vercel Blob Storage
 */
async function uploadToVercelBlob(filePath, filename) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const blob = await put(`legal-docs/${filename}`, fileBuffer, {
      access: 'public',
    });
    return blob.url;
  } catch (error) {
    console.error(`Failed to upload ${filename} to Vercel Blob:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migratePDFs() {
  console.log('🚀 Starting PDF migration...');
  console.log(`📄 Found ${PDF_URLS.length} PDFs to migrate`);
  
  // Create temp directory
  const tempDir = path.join(__dirname, '../temp-pdfs');
  await fs.mkdir(tempDir, { recursive: true });
  
  const results = {
    downloaded: [],
    failed: [],
    uploaded: []
  };
  
  for (const url of PDF_URLS) {
    const filename = getFilename(url);
    const tempPath = path.join(tempDir, filename);
    
    try {
      console.log(`⬇️  Downloading: ${filename}`);
      await downloadFile(url, tempPath);
      results.downloaded.push({ url, filename, path: tempPath });
      console.log(`✅ Downloaded: ${filename}`);
      
      // Upload to Vercel Blob
      console.log(`⬆️  Uploading to Vercel Blob: ${filename}`);
      const blobUrl = await uploadToVercelBlob(tempPath, filename);
      results.uploaded.push({ filename, oldUrl: url, newUrl: blobUrl });
      console.log(`✅ Uploaded: ${filename} -> ${blobUrl}`);
      
    } catch (error) {
      console.error(`❌ Failed: ${filename} - ${error.message}`);
      results.failed.push({ url, filename, error: error.message });
    }
  }
  
  // Generate report
  console.log('\n📊 Migration Report:');
  console.log(`✅ Successfully migrated: ${results.uploaded.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed files:');
    results.failed.forEach(item => {
      console.log(`  - ${item.filename}: ${item.error}`);
    });
  }
  
  // Save URL mapping for updating content
  const urlMapping = {};
  results.uploaded.forEach(item => {
    urlMapping[item.oldUrl] = item.newUrl;
  });
  
  await fs.writeFile(
    path.join(__dirname, '../pdf-url-mapping.json'),
    JSON.stringify(urlMapping, null, 2)
  );
  
  console.log('\n💾 URL mapping saved to pdf-url-mapping.json');
  console.log('🔄 Next step: Update case.md with new URLs');
  
  // Cleanup temp directory
  await fs.rmdir(tempDir, { recursive: true });
  console.log('🧹 Cleaned up temporary files');
}

// Run migration
if (require.main === module) {
  migratePDFs().catch(console.error);
}

module.exports = { migratePDFs, PDF_URLS };
