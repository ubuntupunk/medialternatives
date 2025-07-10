#!/usr/bin/env node

/**
 * pCloud Simple Authorization Flow
 * 
 * Based on pCloud documentation that suggests direct authorization without Client ID/Secret
 * Run with: node scripts/pcloud-simple-auth.js
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { exec } = require('child_process');

// Load environment variables
require('dotenv').config();

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/auth/pcloud/callback`;

/**
 * Generate pCloud authorization URL (simple flow)
 */
function generateSimpleAuthUrl() {
  const params = querystring.stringify({
    response_type: 'token',  // Token flow for direct access
    redirect_uri: REDIRECT_URI,
    scope: 'files.read,files.write'
  });
  
  return `https://my.pcloud.com/oauth2/authorize?${params}`;
}

/**
 * Alternative: Generate authorization URL with code flow (no client_id required?)
 */
function generateCodeAuthUrl() {
  const params = querystring.stringify({
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'files.read,files.write'
  });
  
  return `https://my.pcloud.com/oauth2/authorize?${params}`;
}

/**
 * Open URL in default browser
 */
function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} "${url}"`);
}

/**
 * Start simple authorization server
 */
async function startSimpleAuthServer() {
  console.log('🚀 Starting pCloud Simple Authorization');
  console.log('=====================================');
  console.log('');
  console.log('📋 Testing pCloud OAuth2 without Client ID/Secret');
  console.log('This follows pCloud documentation for direct authorization.');
  console.log('');
  
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/') {
      // Home page with authorization options
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>pCloud Simple Authorization</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px; }
            .token-button { background: #28a745; }
            .code-button { background: #17a2b8; }
            .info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>🔐 pCloud Simple Authorization</h1>
          
          <div class="info">
            <h3>Testing pCloud OAuth2 Flows</h3>
            <p>According to pCloud documentation, you might not need Client ID/Secret for authorization.</p>
            <p>Let's test both flows:</p>
          </div>
          
          <h3>Option 1: Token Flow (Implicit)</h3>
          <p>Returns access token directly in URL fragment (for client-side apps)</p>
          <a href="${generateSimpleAuthUrl()}" class="button token-button">Try Token Flow</a>
          
          <h3>Option 2: Code Flow</h3>
          <p>Returns authorization code that needs to be exchanged for token</p>
          <a href="${generateCodeAuthUrl()}" class="button code-button">Try Code Flow</a>
          
          <div class="info">
            <h4>What to expect:</h4>
            <ul>
              <li><strong>Success:</strong> You'll be redirected back here with tokens/code</li>
              <li><strong>Error:</strong> pCloud will show an error if Client ID is required</li>
            </ul>
          </div>
        </body>
        </html>
      `);
    } else if (parsedUrl.pathname === '/auth/pcloud/callback') {
      // Handle OAuth2 callback
      const { code, error, access_token, token_type } = parsedUrl.query;
      
      // Check URL fragment for token (JavaScript needed for implicit flow)
      const fragment = parsedUrl.hash;
      
      if (error) {
        console.log('❌ Authorization error:', error);
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Authorization Failed</title></head>
          <body>
            <h1>❌ Authorization Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            <p>This might indicate that Client ID/Secret are required for this app.</p>
            <p><a href="/">Try Again</a></p>
          </body>
          </html>
        `);
        return;
      }
      
      if (access_token) {
        // Token flow success
        console.log('✅ Token flow successful!');
        console.log('Access Token:', access_token);
        console.log('Token Type:', token_type);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Token Flow Success</title></head>
          <body>
            <h1>✅ Token Flow Successful!</h1>
            <p>pCloud returned an access token directly.</p>
            <h3>Add this to your .env.local file:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace;">
              PCLOUD_ACCESS_TOKEN=${access_token}
            </div>
            <p><strong>Token Type:</strong> ${token_type}</p>
            <p>You can now run the migration script!</p>
          </body>
          </html>
        `);
        
        setTimeout(() => {
          console.log('🛑 Shutting down server...');
          server.close();
        }, 2000);
        
      } else if (code) {
        // Code flow success (but we need to exchange it)
        console.log('✅ Code flow successful!');
        console.log('Authorization Code:', code);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Code Flow Success</title></head>
          <body>
            <h1>✅ Code Flow Successful!</h1>
            <p>pCloud returned an authorization code.</p>
            <p><strong>Code:</strong> ${code}</p>
            <p><strong>Note:</strong> This code needs to be exchanged for an access token.</p>
            <p>However, the token exchange typically requires Client ID/Secret.</p>
            <p>Try the Token Flow instead for simpler setup.</p>
          </body>
          </html>
        `);
        
      } else {
        // Check for token in URL fragment (requires JavaScript)
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Checking for Token</title></head>
          <body>
            <h1>🔍 Checking for Access Token</h1>
            <p>Looking for token in URL fragment...</p>
            
            <div id="result"></div>
            
            <script>
              // Check URL fragment for access token (implicit flow)
              const fragment = window.location.hash.substring(1);
              const params = new URLSearchParams(fragment);
              const accessToken = params.get('access_token');
              const tokenType = params.get('token_type');
              const error = params.get('error');
              
              const resultDiv = document.getElementById('result');
              
              if (error) {
                resultDiv.innerHTML = \`
                  <h2>❌ Error in URL Fragment</h2>
                  <p><strong>Error:</strong> \${error}</p>
                  <p><a href="/">Try Again</a></p>
                \`;
              } else if (accessToken) {
                resultDiv.innerHTML = \`
                  <h2>✅ Access Token Found!</h2>
                  <p>Token found in URL fragment (implicit flow).</p>
                  <h3>Add this to your .env.local file:</h3>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace;">
                    PCLOUD_ACCESS_TOKEN=\${accessToken}
                  </div>
                  <p><strong>Token Type:</strong> \${tokenType}</p>
                  <p>You can now run the migration script!</p>
                \`;
                
                // Log to server console
                fetch('/log-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ access_token: accessToken, token_type: tokenType })
                });
              } else {
                resultDiv.innerHTML = \`
                  <h2>❓ No Token Found</h2>
                  <p>No access token found in URL parameters or fragment.</p>
                  <p>This might indicate that Client ID/Secret are required.</p>
                  <p><a href="/">Try Again</a></p>
                \`;
              }
            </script>
          </body>
          </html>
        `);
      }
    } else if (parsedUrl.pathname === '/log-token' && req.method === 'POST') {
      // Log token from JavaScript
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { access_token, token_type } = JSON.parse(body);
          console.log('✅ Access token received via JavaScript!');
          console.log('Access Token:', access_token);
          console.log('Token Type:', token_type);
          console.log('');
          console.log('Add this to your .env.local file:');
          console.log(`PCLOUD_ACCESS_TOKEN=${access_token}`);
        } catch (error) {
          console.error('Failed to parse token data:', error);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"status":"ok"}');
        
        setTimeout(() => {
          console.log('🛑 Shutting down server...');
          server.close();
        }, 2000);
      });
    } else {
      // 404 for other paths
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
  server.listen(PORT, () => {
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log('');
    console.log('🔍 This will test pCloud OAuth2 flows to determine requirements.');
    console.log('');
    
    // Auto-open browser
    setTimeout(() => {
      console.log('🌐 Opening browser...');
      openBrowser(`http://localhost:${PORT}`);
    }, 1000);
  });
  
  // Handle server shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server stopped.');
      process.exit(0);
    });
  });
}

// Run server
if (require.main === module) {
  startSimpleAuthServer().catch(console.error);
}

module.exports = { startSimpleAuthServer };