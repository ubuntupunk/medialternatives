#!/usr/bin/env node

/**
 * PDF Download Script for Medialternatives - Manual pCloud Upload
 * 
 * This script downloads PDFs from medialternatives.com to a local folder
 * for manual upload to pCloud storage
 * Run with: node scripts/migrate-pdfs-pcloud.js
 * 
 * Requirements:
 * - Internet connection to download PDFs
 * - Local storage space (~250MB estimated)
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Download configuration
const DOWNLOAD_CONFIG = {
  outputDir: path.join(__dirname, '../downloads/legal-pdfs'),
  transcriptsDir: 'court-transcripts',
  legalDir: 'legal-documents'
};

// List of all PDF URLs (all using working medialternatives.com structure)
const PDF_URLS = [
  // Court Transcripts (2020/07 - these will go in court-transcripts folder)
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
  
  // Legal Documents (2022-2024 - these will go in legal-documents folder)
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

// Local folder structure (mirrors intended pCloud structure)
const LOCAL_FOLDERS = {
  transcripts: path.join(DOWNLOAD_CONFIG.outputDir, DOWNLOAD_CONFIG.transcriptsDir),
  legal: path.join(DOWNLOAD_CONFIG.outputDir, DOWNLOAD_CONFIG.legalDir)
};

/**
 * Create local folder structure
 */
async function createLocalFolderStructure() {
  try {
    console.log('📁 Creating local folder structure...');
    
    // Create main output directory
    await fs.mkdir(DOWNLOAD_CONFIG.outputDir, { recursive: true });
    console.log(`✅ Created: ${DOWNLOAD_CONFIG.outputDir}`);
    
    // Create subfolders
    await fs.mkdir(LOCAL_FOLDERS.transcripts, { recursive: true });
    console.log(`✅ Created: ${LOCAL_FOLDERS.transcripts}`);
    
    await fs.mkdir(LOCAL_FOLDERS.legal, { recursive: true });
    console.log(`✅ Created: ${LOCAL_FOLDERS.legal}`);
    
  } catch (error) {
    console.error('❌ Error creating local folders:', error);
    throw error;
  }
}

/**
 * Download a file from URL to local file
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
 * Get file category and local folder based on URL
 */
function getFileCategory(url) {
  if (url.includes('/2020/07/')) {
    return {
      category: 'transcripts',
      folder: LOCAL_FOLDERS.transcripts
    };
  }
  return {
    category: 'legal',
    folder: LOCAL_FOLDERS.legal
  };
}

/**
 * Extract filename from URL
 */
function getFilename(url) {
  return path.basename(url.split('?')[0]);
}

/**
 * Get file size from local file
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Main download function
 */
async function downloadPDFsLocally() {
  console.log('🚀 Starting PDF download for manual pCloud upload...');
  console.log(`📄 Found ${PDF_URLS.length} PDFs to download`);
  console.log(`📁 Download location: ${DOWNLOAD_CONFIG.outputDir}`);
  console.log('');
  
  try {
    // Create local folder structure
    await createLocalFolderStructure();
    
    const results = {
      downloaded: [],
      failed: [],
      totalSize: 0
    };
    
    for (const url of PDF_URLS) {
      const filename = getFilename(url);
      const fileInfo = getFileCategory(url);
      const outputPath = path.join(fileInfo.folder, filename);
      
      try {
        console.log(`⬇️  Downloading: ${filename}`);
        console.log(`    From: ${url}`);
        console.log(`    To: ${outputPath}`);
        
        await downloadFile(url, outputPath);
        const fileSize = await getFileSize(outputPath);
        
        results.downloaded.push({ 
          url, 
          filename, 
          localPath: outputPath,
          category: fileInfo.category,
          size: fileSize 
        });
        
        results.totalSize += fileSize;
        console.log(`✅ Downloaded: ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
        console.log('');
        
        // Small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed: ${filename} - ${error.message}`);
        results.failed.push({ url, filename, error: error.message });
        console.log('');
      }
    }
    
    // Generate comprehensive report
    console.log('📊 Download Report:');
    console.log('==================');
    console.log(`✅ Successfully downloaded: ${results.downloaded.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`💾 Total size downloaded: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
    
    // Show breakdown by category
    const transcripts = results.downloaded.filter(item => item.category === 'transcripts');
    const legal = results.downloaded.filter(item => item.category === 'legal');
    
    console.log('📋 Files by category:');
    console.log(`  📋 Court Transcripts: ${transcripts.length} files`);
    console.log(`  ⚖️  Legal Documents: ${legal.length} files`);
    console.log('');
    
    if (results.failed.length > 0) {
      console.log('❌ Failed downloads:');
      results.failed.forEach(item => {
        console.log(`  - ${item.filename}: ${item.error}`);
      });
      console.log('');
    }
    
    // Save download report
    const downloadReport = {
      timestamp: new Date().toISOString(),
      totalFiles: PDF_URLS.length,
      downloaded: results.downloaded.length,
      failed: results.failed.length,
      totalSize: results.totalSize,
      downloadLocation: DOWNLOAD_CONFIG.outputDir,
      files: results.downloaded,
      failures: results.failed
    };
    
    await fs.writeFile(
      path.join(__dirname, '../download-report.json'),
      JSON.stringify(downloadReport, null, 2)
    );
    
    console.log('💾 Download report saved: download-report.json');
    console.log('');
    
    console.log('🔄 Next steps for pCloud upload:');
    console.log('================================');
    console.log('1. Open pCloud web interface or desktop app');
    console.log('2. Create folder structure:');
    console.log('   /medialternatives-legal-docs/');
    console.log('   ├── court-transcripts/');
    console.log('   └── legal-documents/');
    console.log('');
    console.log('3. Upload files:');
    console.log(`   📋 Court Transcripts (${transcripts.length} files):`);
    console.log(`      From: ${LOCAL_FOLDERS.transcripts}`);
    console.log('      To: /medialternatives-legal-docs/court-transcripts/');
    console.log('');
    console.log(`   ⚖️  Legal Documents (${legal.length} files):`);
    console.log(`      From: ${LOCAL_FOLDERS.legal}`);
    console.log('      To: /medialternatives-legal-docs/legal-documents/');
    console.log('');
    console.log('4. Generate public links for each file');
    console.log('5. Update case.md with new pCloud URLs');
    console.log('');
    console.log(`📁 All files are ready in: ${DOWNLOAD_CONFIG.outputDir}`);
    
  } catch (error) {
    console.error('💥 Download failed:', error);
    process.exit(1);
  }
}

// Run download
if (require.main === module) {
  downloadPDFsLocally().catch(console.error);
}

module.exports = { downloadPDFsLocally, PDF_URLS, LOCAL_FOLDERS };