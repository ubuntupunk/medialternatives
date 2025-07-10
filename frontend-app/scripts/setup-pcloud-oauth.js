#!/usr/bin/env node

/**
 * pCloud OAuth2 Setup Helper
 * 
 * This script helps set up OAuth2 authentication for pCloud API access
 * Run with: node scripts/setup-pcloud-oauth.js
 */

const https = require('https');
const querystring = require('querystring');

// Load environment variables
require('dotenv').config();

const PCLOUD_OAUTH_URL = 'https://api.pcloud.com/oauth2_token';

/**
 * Get OAuth2 token using client credentials
 */
async function getClientCredentialsToken(clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
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
 * Generate authorization URL for user consent
 */
function generateAuthUrl(clientId, redirectUri = 'http://localhost:3000/auth/pcloud/callback') {
  const params = querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'files.read,files.write'
  });
  
  return `https://my.pcloud.com/oauth2/authorize?${params}`;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(clientId, clientSecret, code, redirectUri) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri
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
 * Main setup function
 */
async function setupPCloudOAuth() {
  console.log('🔐 pCloud OAuth2 Setup Helper');
  console.log('================================');
  
  const clientId = process.env.PCLOUD_CLIENT_ID;
  const clientSecret = process.env.PCLOUD_CLIENT_SECRET;
  const authCode = process.env.PCLOUD_AUTH_CODE;
  
  if (!clientId || !clientSecret) {
    console.log('❌ Missing pCloud OAuth2 credentials!');
    console.log('');
    console.log('Please add to your .env.local file:');
    console.log('PCLOUD_CLIENT_ID=your_client_id');
    console.log('PCLOUD_CLIENT_SECRET=your_client_secret');
    console.log('');
    console.log('To get these credentials:');
    console.log('1. Go to https://docs.pcloud.com/');
    console.log('2. Create a new app in the pCloud App Console');
    console.log('3. Copy the Client ID and Client Secret');
    return;
  }
  
  console.log('✅ Found OAuth2 credentials');
  console.log(`Client ID: ${clientId.substring(0, 8)}...`);
  
  // Try client credentials flow first (for app-only access)
  try {
    console.log('');
    console.log('🔄 Attempting client credentials flow...');
    const tokenResponse = await getClientCredentialsToken(clientId, clientSecret);
    
    console.log('✅ Successfully obtained access token!');
    console.log('');
    console.log('Add this to your .env.local file:');
    console.log(`PCLOUD_ACCESS_TOKEN=${tokenResponse.access_token}`);
    
    if (tokenResponse.refresh_token) {
      console.log(`PCLOUD_REFRESH_TOKEN=${tokenResponse.refresh_token}`);
    }
    
    console.log('');
    console.log(`Token expires in: ${tokenResponse.expires_in} seconds`);
    console.log(`Token type: ${tokenResponse.token_type}`);
    
    return;
  } catch (error) {
    console.log('⚠️  Client credentials flow failed:', error.message);
    console.log('This might be expected if your app requires user authorization.');
  }
  
  // If client credentials failed, try authorization code flow
  if (authCode) {
    try {
      console.log('');
      console.log('🔄 Using authorization code flow...');
      const tokenResponse = await exchangeCodeForToken(
        clientId, 
        clientSecret, 
        authCode, 
        'http://localhost:3000/auth/pcloud/callback'
      );
      
      console.log('✅ Successfully obtained access token!');
      console.log('');
      console.log('Add this to your .env.local file:');
      console.log(`PCLOUD_ACCESS_TOKEN=${tokenResponse.access_token}`);
      
      if (tokenResponse.refresh_token) {
        console.log(`PCLOUD_REFRESH_TOKEN=${tokenResponse.refresh_token}`);
      }
      
    } catch (error) {
      console.log('❌ Authorization code exchange failed:', error.message);
    }
  } else {
    console.log('');
    console.log('🔗 Manual authorization required:');
    console.log('');
    console.log('1. Visit this URL to authorize the app:');
    console.log(generateAuthUrl(clientId));
    console.log('');
    console.log('2. After authorization, copy the "code" parameter from the redirect URL');
    console.log('3. Add it to your .env.local file as: PCLOUD_AUTH_CODE=your_code');
    console.log('4. Run this script again');
  }
}

// Run setup
if (require.main === module) {
  setupPCloudOAuth().catch(console.error);
}

module.exports = { setupPCloudOAuth, generateAuthUrl, exchangeCodeForToken };