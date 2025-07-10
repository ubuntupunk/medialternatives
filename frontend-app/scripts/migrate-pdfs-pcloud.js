#!/usr/bin/env node

/**
 * PDF Migration Script for Medialternatives - pCloud Storage
 * 
 * This script downloads PDFs from fixed URLs and uploads them to pCloud
 * Run with: node scripts/migrate-pdfs-pcloud.js
 * 
 * Requirements:
 * - pcloud-sdk-js package
 * - pCloud account credentials in .env
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const pcloudSdk = require('pcloud-sdk-js');

// Load environment variables
require('dotenv').config();

// pCloud OAuth2 configuration
const PCLOUD_CONFIG = {
  client_id: process.env.PCLOUD_CLIENT_ID,
  client_secret: process.env.PCLOUD_CLIENT_SECRET,
  access_token: process.env.PCLOUD_ACCESS_TOKEN,
  refresh_token: process.env.PCLOUD_REFRESH_TOKEN,
  oauth_url: 'https://api.pcloud.com/oauth2_token'
};

// List of all PDF URLs (now with fixed URLs)
const PDF_URLS = [
  // Court Transcripts (now fixed to medialternatives.com)
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
 * Get OAuth2 access token from pCloud
 */
async function getOAuth2Token() {
  if (PCLOUD_CONFIG.access_token) {
    console.log('✅ Using existing access token');
    return PCLOUD_CONFIG.access_token;
  }

  if (!PCLOUD_CONFIG.client_id || !PCLOUD_CONFIG.client_secret) {
    throw new Error('pCloud OAuth2 credentials not found. Set PCLOUD_CLIENT_ID and PCLOUD_CLIENT_SECRET in .env');
  }

  try {
    console.log('🔐 Requesting OAuth2 token from pCloud...');
    
    const response = await fetch(PCLOUD_CONFIG.oauth_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PCLOUD_CONFIG.client_id,
        client_secret: PCLOUD_CONFIG.client_secret
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth2 request failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    if (tokenData.error) {
      throw new Error(`OAuth2 error: ${tokenData.error_description || tokenData.error}`);
    }

    console.log('✅ OAuth2 token obtained successfully');
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Failed to get OAuth2 token:', error);
    throw error;
  }
}

/**
 * Initialize pCloud client with OAuth2
 */
async function initPCloudClient() {
  try {
    const accessToken = await getOAuth2Token();
    
    // Initialize pCloud SDK with OAuth2 token
    const client = pcloudSdk.createClient({
      access_token: accessToken
    });
    
    // Test the connection
    await client.userinfo();
    
    console.log('✅ pCloud client initialized successfully with OAuth2');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize pCloud client:', error);
    throw error;
  }
}

/**
 * Create folder structure in pCloud
 */
async function createFolderStructure(client) {
  try {
    console.log('📁 Creating folder structure in pCloud...');
    
    // Create root folder
    await client.createfolder(PCLOUD_FOLDERS.root);
    console.log(`✅ Created: ${PCLOUD_FOLDERS.root}`);
    
    // Create subfolders
    await client.createfolder(PCLOUD_FOLDERS.transcripts);
    console.log(`✅ Created: ${PCLOUD_FOLDERS.transcripts}`);
    
    await client.createfolder(PCLOUD_FOLDERS.legal);
    console.log(`✅ Created: ${PCLOUD_FOLDERS.legal}`);
    
  } catch (error) {
    // Folders might already exist, that's okay
    if (error.result && error.result === 2004) {
      console.log('📁 Folders already exist, continuing...');
    } else {
      console.error('❌ Error creating folders:', error);
      throw error;
    }
  }
}

/**
 * Download a file from URL to buffer
 */
async function downloadFileToBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
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
 * Upload file to pCloud
 */
async function uploadToPCloud(client, fileBuffer, filename, category) {
  try {
    const folder = category === 'transcripts' ? PCLOUD_FOLDERS.transcripts : PCLOUD_FOLDERS.legal;
    
    // Upload file
    const result = await client.uploadfile(
      fileBuffer,
      filename,
      folder
    );
    
    // Get public link
    const linkResult = await client.getfilelink(result.metadata[0].fileid);
    
    return {
      fileid: result.metadata[0].fileid,
      path: `${folder}/${filename}`,
      publicLink: linkResult.link,
      size: result.metadata[0].size
    };
  } catch (error) {
    console.error(`Failed to upload ${filename} to pCloud:`, error);
    throw error;
  }
}

/**
 * Get pCloud account info
 */
async function getPCloudAccountInfo(client) {
  try {
    const userInfo = await client.userinfo();
    const quota = userInfo.quota;
    const used = userInfo.usedquota;
    const available = quota - used;
    
    return {
      quota: (quota / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      used: (used / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      available: (available / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      usedPercent: ((used / quota) * 100).toFixed(1) + '%'
    };
  } catch (error) {
    console.error('Failed to get account info:', error);
    return null;
  }
}

/**
 * Main migration function
 */
async function migratePDFsToPCloud() {
  console.log('🚀 Starting PDF migration to pCloud...');
  console.log(`📄 Found ${PDF_URLS.length} PDFs to migrate`);
  
  let client;
  
  try {
    // Initialize pCloud client
    client = await initPCloudClient();
    
    // Get account info
    const accountInfo = await getPCloudAccountInfo(client);
    if (accountInfo) {
      console.log('💾 pCloud Account Info:');
      console.log(`   Total: ${accountInfo.quota}`);
      console.log(`   Used: ${accountInfo.used} (${accountInfo.usedPercent})`);
      console.log(`   Available: ${accountInfo.available}`);
    }
    
    // Create folder structure
    await createFolderStructure(client);
    
    const results = {
      downloaded: [],
      uploaded: [],
      failed: [],
      totalSize: 0
    };
    
    for (const url of PDF_URLS) {
      const filename = getFilename(url);
      const category = getFileCategory(url);
      
      try {
        console.log(`⬇️  Downloading: ${filename}`);
        const fileBuffer = await downloadFileToBuffer(url);
        results.downloaded.push({ url, filename, size: fileBuffer.length });
        console.log(`✅ Downloaded: ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        
        // Upload to pCloud
        console.log(`⬆️  Uploading to pCloud: ${filename}`);
        const uploadResult = await uploadToPCloud(client, fileBuffer, filename, category);
        
        results.uploaded.push({
          filename,
          category,
          oldUrl: url,
          newUrl: uploadResult.publicLink,
          pcloudPath: uploadResult.path,
          fileid: uploadResult.fileid,
          size: uploadResult.size
        });
        
        results.totalSize += uploadResult.size;
        console.log(`✅ Uploaded: ${filename} -> ${uploadResult.publicLink}`);
        
        // Small delay to avoid rate limiting
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
    
    // Save detailed mapping for updating content
    const urlMapping = {};
    const pcloudMapping = {};
    
    results.uploaded.forEach(item => {
      urlMapping[item.oldUrl] = item.newUrl;
      pcloudMapping[item.filename] = {
        publicUrl: item.newUrl,
        pcloudPath: item.pcloudPath,
        fileid: item.fileid,
        category: item.category,
        size: item.size
      };
    });
    
    // Save mappings
    await fs.writeFile(
      path.join(__dirname, '../pdf-url-mapping-pcloud.json'),
      JSON.stringify(urlMapping, null, 2)
    );
    
    await fs.writeFile(
      path.join(__dirname, '../pcloud-file-mapping.json'),
      JSON.stringify(pcloudMapping, null, 2)
    );
    
    await fs.writeFile(
      path.join(__dirname, '../migration-report-pcloud.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 Files saved:');
    console.log('  - pdf-url-mapping-pcloud.json (for updating case.md)');
    console.log('  - pcloud-file-mapping.json (detailed pCloud info)');
    console.log('  - migration-report-pcloud.json (full migration report)');
    
    console.log('\n🔄 Next steps:');
    console.log('  1. Update case.md with new pCloud URLs');
    console.log('  2. Test all download links');
    console.log('  3. Update download component to handle pCloud URLs');
    console.log('  4. Consider implementing download analytics');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    if (client && client.logout) {
      await client.logout();
      console.log('👋 Logged out of pCloud');
    }
  }
}

// Run migration
if (require.main === module) {
  migratePDFsToPCloud().catch(console.error);
}

module.exports = { migratePDFsToPCloud, PDF_URLS, PCLOUD_FOLDERS };