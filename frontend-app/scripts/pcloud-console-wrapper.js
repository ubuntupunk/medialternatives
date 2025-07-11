#!/usr/bin/env node

/**
 * pCloud Console Client Wrapper
 * 
 * Uses the official pCloud console client (C binary) for simple authentication
 * No OAuth2 required - just username/password
 * 
 * Prerequisites:
 * 1. Install pCloud console client: https://github.com/pcloudcom/console-client
 * 2. Set PCLOUD_USERNAME and PCLOUD_PASSWORD in .env.local
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

const PCLOUD_CONFIG = {
  username: process.env.PCLOUD_USERNAME,
  password: process.env.PCLOUD_PASSWORD,
  mountpoint: process.env.PCLOUD_MOUNTPOINT || '/tmp/pcloud-mount'
};

/**
 * Check if pCloud console client is installed
 */
async function checkPCloudClient() {
  return new Promise((resolve) => {
    exec('which pcloudcc', (error, stdout) => {
      if (error) {
        resolve(false);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Install pCloud console client
 */
async function installPCloudClient() {
  console.log('📦 Installing pCloud console client...');
  console.log('This requires sudo access and may take a few minutes.');
  
  const installScript = `
#!/bin/bash
set -e

echo "Installing dependencies..."
sudo apt-get update
sudo apt-get install -y cmake zlib1g-dev libboost-system-dev libboost-program-options-dev libpthread-stubs0-dev libfuse-dev libudev-dev fuse build-essential git

echo "Creating build directory..."
mkdir -p /tmp/pcloud-build
cd /tmp/pcloud-build

echo "Cloning pCloud console client..."
git clone https://github.com/pcloudcom/console-client.git ./console-client/
cd ./console-client/pCloudCC/

echo "Building pclsync..."
cd lib/pclsync/
make clean
make fs

echo "Building mbedtls..."
cd ../mbedtls/
cmake .
make clean
make

echo "Building pCloud console client..."
cd ../..
cmake .
make

echo "Installing..."
sudo make install
sudo ldconfig

echo "✅ pCloud console client installed successfully!"
echo "You can now use: pcloudcc -u username -p"
`;

  await fs.writeFile('/tmp/install-pcloud.sh', installScript);
  await fs.chmod('/tmp/install-pcloud.sh', 0o755);
  
  return new Promise((resolve, reject) => {
    const install = spawn('bash', ['/tmp/install-pcloud.sh'], {
      stdio: 'inherit'
    });
    
    install.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Installation failed with code ${code}`));
      }
    });
  });
}

/**
 * Start pCloud daemon
 */
async function startPCloudDaemon() {
  if (!PCLOUD_CONFIG.username || !PCLOUD_CONFIG.password) {
    throw new Error('PCLOUD_USERNAME and PCLOUD_PASSWORD must be set in .env.local');
  }
  
  console.log('🚀 Starting pCloud daemon...');
  
  // Create mount point
  try {
    await fs.mkdir(PCLOUD_CONFIG.mountpoint, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  return new Promise((resolve, reject) => {
    const daemon = spawn('pcloudcc', [
      '-u', PCLOUD_CONFIG.username,
      '-p', PCLOUD_CONFIG.password,
      '-m', PCLOUD_CONFIG.mountpoint,
      '-d'  // daemonize
    ], {
      stdio: 'pipe'
    });
    
    let output = '';
    daemon.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    daemon.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    daemon.on('close', (code) => {
      if (code === 0) {
        console.log('✅ pCloud daemon started successfully');
        console.log(`📁 Mount point: ${PCLOUD_CONFIG.mountpoint}`);
        resolve(true);
      } else {
        console.error('❌ Failed to start pCloud daemon');
        console.error('Output:', output);
        reject(new Error(`Daemon failed with code ${code}`));
      }
    });
    
    // Give daemon time to start
    setTimeout(() => {
      if (daemon.exitCode === null) {
        resolve(true);
      }
    }, 3000);
  });
}

/**
 * Execute pCloud command
 */
async function execPCloudCommand(command) {
  return new Promise((resolve, reject) => {
    const cmd = spawn('pcloudcc', ['-k', command], {
      stdio: 'pipe'
    });
    
    let output = '';
    let error = '';
    
    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cmd.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    cmd.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Command failed: ${error || output}`));
      }
    });
  });
}

/**
 * Upload file to pCloud
 */
async function uploadFile(localPath, remotePath) {
  try {
    console.log(`⬆️  Uploading: ${path.basename(localPath)} -> ${remotePath}`);
    
    // Create directory if needed
    const remoteDir = path.dirname(remotePath);
    if (remoteDir !== '.') {
      await execPCloudCommand(`mkdir -p "${remoteDir}"`);
    }
    
    // Copy file to mount point
    const mountPath = path.join(PCLOUD_CONFIG.mountpoint, remotePath);
    const mountDir = path.dirname(mountPath);
    
    await fs.mkdir(mountDir, { recursive: true });
    await fs.copyFile(localPath, mountPath);
    
    console.log(`✅ Uploaded: ${path.basename(localPath)}`);
    return mountPath;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get public link for file
 */
async function getPublicLink(remotePath) {
  try {
    const output = await execPCloudCommand(`getpublink "${remotePath}"`);
    // Parse output to extract public link
    const linkMatch = output.match(/https?:\/\/[^\s]+/);
    return linkMatch ? linkMatch[0] : null;
  } catch (error) {
    console.error(`❌ Failed to get public link: ${error.message}`);
    return null;
  }
}

/**
 * Stop pCloud daemon
 */
async function stopPCloudDaemon() {
  try {
    await execPCloudCommand('quit');
    console.log('🛑 pCloud daemon stopped');
  } catch (error) {
    console.warn('Warning: Failed to stop daemon gracefully');
  }
}

/**
 * Main setup and test function
 */
async function setupPCloudConsole() {
  console.log('🔧 pCloud Console Client Setup');
  console.log('==============================');
  
  // Check if client is installed
  const clientPath = await checkPCloudClient();
  if (!clientPath) {
    console.log('❌ pCloud console client not found');
    console.log('');
    console.log('Would you like to install it? This requires:');
    console.log('- sudo access');
    console.log('- Ubuntu/Debian system');
    console.log('- Internet connection');
    console.log('- About 5-10 minutes');
    console.log('');
    
    // In a real scenario, you'd prompt for user input
    console.log('To install manually:');
    console.log('1. Visit: https://github.com/pcloudcom/console-client');
    console.log('2. Follow build instructions');
    console.log('3. Run this script again');
    return;
  }
  
  console.log(`✅ pCloud console client found: ${clientPath}`);
  
  // Check credentials
  if (!PCLOUD_CONFIG.username || !PCLOUD_CONFIG.password) {
    console.log('❌ pCloud credentials not found');
    console.log('');
    console.log('Add to your .env.local file:');
    console.log('PCLOUD_USERNAME=your_pcloud_username');
    console.log('PCLOUD_PASSWORD=your_pcloud_password');
    console.log('PCLOUD_MOUNTPOINT=/tmp/pcloud-mount  # optional');
    return;
  }
  
  console.log(`✅ Credentials found for user: ${PCLOUD_CONFIG.username}`);
  
  try {
    // Start daemon
    await startPCloudDaemon();
    
    // Test basic operations
    console.log('🧪 Testing basic operations...');
    
    // List root directory
    const listing = await execPCloudCommand('ls /');
    console.log('📁 Root directory listing:', listing);
    
    // Create test directory
    await execPCloudCommand('mkdir -p "/medialternatives-test"');
    console.log('✅ Test directory created');
    
    // Test file operations (create a small test file)
    const testFile = '/tmp/pcloud-test.txt';
    await fs.writeFile(testFile, 'pCloud console client test file');
    
    await uploadFile(testFile, '/medialternatives-test/test.txt');
    console.log('✅ Test file uploaded');
    
    // Get public link
    const publicLink = await getPublicLink('/medialternatives-test/test.txt');
    if (publicLink) {
      console.log('✅ Public link generated:', publicLink);
    }
    
    // Cleanup
    await execPCloudCommand('rm -rf "/medialternatives-test"');
    await fs.unlink(testFile);
    console.log('✅ Test cleanup completed');
    
    console.log('');
    console.log('🎉 pCloud console client setup successful!');
    console.log('You can now use this for PDF migration.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await stopPCloudDaemon();
  }
}

// Export functions for use in migration script
module.exports = {
  checkPCloudClient,
  startPCloudDaemon,
  stopPCloudDaemon,
  uploadFile,
  getPublicLink,
  execPCloudCommand
};

// Run setup if called directly
if (require.main === module) {
  setupPCloudConsole().catch(console.error);
}