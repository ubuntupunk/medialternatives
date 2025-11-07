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

// Load environment variables from project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

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
  const { username, password, mountpoint } = PCLOUD_CONFIG;

  if (!username || !password) {
    throw new Error('PCLOUD_USERNAME and PCLOUD_PASSWORD must be set in .env.local');
  }

  console.log(`🚀 Starting pCloud daemon for user: ${username}...`);

  try {
    await fs.mkdir(mountpoint, { recursive: true });
  } catch (error) {
    // Directory might already exist, which is fine.
  }

  const daemon = spawn('pcloudcc', [
    '-u', username,
    '-p',
    '-m', mountpoint,
    '-d'
  ], {
    detached: true, // Allow the parent to exit independently.
    stdio: ['pipe', 'ignore', 'ignore'] // Only need stdin for the password.
  });

  // Allow the Node.js event loop to exit even if the child is still running.
  daemon.unref();

  daemon.on('error', (err) => {
    console.error('❌ Failed to spawn the pcloudcc process.', err);
  });

  // Provide the password to the process\'s stdin.
  console.log('🔑 Providing password to pCloud client via stdin...');
  daemon.stdin.write(password + '\n');
  daemon.stdin.end();

  console.log('✅ Daemon process has been launched in the background.');
  return Promise.resolve();
}

/**
 * Wait for pCloud daemon to be ready by polling its status.
 */
async function waitForDaemonReady(timeout = 30000) {
  console.log('⏳ Waiting for pCloud daemon to become responsive...');
  const startTime = Date.now();
  let lastError = 'No response yet';

  // Give the daemon a moment to start before the first check.
  console.log('(Waiting 3s for initial daemon startup...)');
  await new Promise(resolve => setTimeout(resolve, 3000));

  while (Date.now() - startTime < timeout) {
    try {
      // Use 'ls /' as a lightweight command to check if the daemon is responsive.
      await execPCloudCommand('ls /');
      console.log('\n✅ pCloud daemon is online and ready.');
      return;
    } catch (error) {
      lastError = error.message.trim();
      // Log the specific error to diagnose the issue.
      console.log(`[${new Date().toLocaleTimeString()}] Daemon not ready, trying again. Error: ${lastError}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n'); // Newline after the progress dots
  throw new Error(`Timeout: pCloud daemon did not become ready in ${timeout / 1000}s. Final error: ${lastError}`);
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
  console.log('🛑 Stopping pCloud daemon...');
  try {
    // 'finalize' is the correct command to stop the daemon process.
    // 'quit' only exits the interactive client.
    await execPCloudCommand('finalize');
    console.log('✅ pCloud daemon stopped successfully.');
  } catch (error) {
    // It's possible the daemon already stopped or was killed, so a warning is appropriate.
    console.warn(`Warning: Failed to stop daemon gracefully. This might be okay if it was already stopped. Error: ${error.message}`);
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
    await waitForDaemonReady();
    
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
  execPCloudCommand,
  waitForDaemonReady
};

// Run setup if called directly
if (require.main === module) {
  setupPCloudConsole().catch(console.error);
}