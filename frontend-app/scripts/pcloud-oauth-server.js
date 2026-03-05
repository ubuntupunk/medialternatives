#!/usr/bin/env node

/**
 * pCloud OAuth2 Authorization Server
 * 
 * This creates a temporary local server to handle the OAuth2 callback
 * Run with: node scripts/pcloud-oauth-server.js
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Load environment variables
require('dotenv').config();

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/auth/pcloud/callback`;

/**
 * Generate authorization URL with local callback
 */
function generateAuthUrl(clientId) {
  const params = querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: 'files.read,files.write'
  });
  
  return `https://my.pcloud.com/oauth2/authorize?${params}`;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(clientId, clientSecret, code) {
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: REDIRECT_URI
    });

    const options = {
      hostname: 'api.pcloud.com',
      port: 443,
      path: '/oauth2_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`OAuth2 error: ${response.error_description || response.error}`));
          } else {
            resolve(response);
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Start OAuth2 authorization server
 */
async function startOAuthServer() {
  const clientId = process.env.PCLOUD_CLIENT_ID;
  const clientSecret = process.env.PCLOUD_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.log('❌ Missing pCloud OAuth2 credentials!');
    console.log('Please add to your .env.local file:');
    console.log('PCLOUD_CLIENT_ID=your_client_id');
    console.log('PCLOUD_CLIENT_SECRET=your_client_secret');
    return;
  }
  
  console.log('🚀 Starting pCloud OAuth2 Authorization Server');
  console.log('===============================================');
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
  console.log('');
  
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/') {
      // Home page with authorization link
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>pCloud OAuth2 Authorization</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
            .code { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>🔐 pCloud OAuth2 Authorization</h1>
          <p>Click the button below to authorize the Medialternatives app to access your pCloud storage:</p>
          <p><a href="${generateAuthUrl(clientId)}" class="button">Authorize pCloud Access</a></p>
          <p><strong>What this does:</strong></p>
          <ul>
            <li>Grants read/write access to your pCloud files</li>
            <li>Allows the migration script to upload PDF documents</li>
            <li>Creates organized folders for legal documents</li>
          </ul>
          <p><strong>Security:</strong> You can revoke access anytime in your pCloud settings.</p>
        </body>
        </html>
      `);
    } else if (parsedUrl.pathname === '/auth/pcloud/callback') {
      // Handle OAuth2 callback
      const { code, error } = parsedUrl.query;
      
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Authorization Failed</title></head>
          <body>
            <h1>❌ Authorization Failed</h1>
            <p>Error: ${error}</p>
            <p><a href="/">Try Again</a></p>
          </body>
          </html>
        `);
        return;
      }
      
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>No Authorization Code</title></head>
          <body>
            <h1>❌ No Authorization Code Received</h1>
            <p><a href="/">Try Again</a></p>
          </body>
          </html>
        `);
        return;
      }
      
      try {
        console.log('🔄 Exchanging authorization code for access token...');
        const tokenResponse = await exchangeCodeForToken(clientId, clientSecret, code);
        
        console.log('✅ Successfully obtained access token!');
        console.log('');
        console.log('Add these to your .env.local file:');
        console.log(`PCLOUD_ACCESS_TOKEN=${tokenResponse.access_token}`);
        if (tokenResponse.refresh_token) {
          console.log(`PCLOUD_REFRESH_TOKEN=${tokenResponse.refresh_token}`);
        }
        console.log('');
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Authorization Successful</title></head>
          <body>
            <h1>✅ Authorization Successful!</h1>
            <p>Your pCloud access token has been generated.</p>
            <h3>Add these to your .env.local file:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace;">
              PCLOUD_ACCESS_TOKEN=${tokenResponse.access_token}<br>
              ${tokenResponse.refresh_token ? `PCLOUD_REFRESH_TOKEN=${tokenResponse.refresh_token}<br>` : ''}
            </div>
            <p><strong>Next steps:</strong></p>
            <ol>
              <li>Copy the tokens to your .env.local file</li>
              <li>Run the migration script: <code>./scripts/run-pcloud-migration.sh</code></li>
            </ol>
            <p>You can close this window and stop the server (Ctrl+C).</p>
          </body>
          </html>
        `);
        
        // Auto-shutdown server after successful auth
        setTimeout(() => {
          console.log('🛑 Shutting down OAuth2 server...');
          server.close();
        }, 2000);
        
      } catch (error) {
        console.error('❌ Token exchange failed:', error.message);
        
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Token Exchange Failed</title></head>
          <body>
            <h1>❌ Token Exchange Failed</h1>
            <p>Error: ${error.message}</p>
            <p><a href="/">Try Again</a></p>
          </body>
          </html>
        `);
      }
    } else {
      // 404 for other paths
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
  server.listen(PORT, () => {
    console.log('🌐 Open your browser and go to:');
    console.log(`   http://localhost:${PORT}`);
    console.log('');
    console.log('💡 This will guide you through the OAuth2 authorization process.');
    console.log('');
  });
  
  // Handle server shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down OAuth2 server...');
    server.close(() => {
      console.log('✅ Server stopped.');
      process.exit(0);
    });
  });
}

// Run server
if (require.main === module) {
  startOAuthServer().catch(console.error);
}

module.exports = { startOAuthServer };