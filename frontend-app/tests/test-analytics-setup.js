#!/usr/bin/env node

/**
 * Google Analytics Setup Test Script
 * Tests the current analytics API and shows what will change with service account
 */

const https = require('https');
const http = require('http');

console.log('🔍 Testing Google Analytics API Setup...\n');

// Test current API endpoint
function testAnalyticsAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/analytics?period=7d',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function runTest() {
  try {
    console.log('📡 Testing Analytics API...');
    const result = await testAnalyticsAPI();
    
    console.log('✅ API Response:');
    console.log(`   Source: ${result.source}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Visitors: ${result.data.visitors}`);
    console.log(`   Pageviews: ${result.data.pageviews}`);
    console.log(`   Top Pages: ${result.data.topPages?.length || 0} pages`);
    console.log(`   Note: ${result.note}\n`);

    // Check environment variables
    console.log('🔧 Environment Check:');
    console.log(`   GOOGLE_ANALYTICS_PROPERTY_ID: ${process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '❌ Not set'}`);
    console.log(`   GOOGLE_SERVICE_ACCOUNT_KEY: ${process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? '✅ Set' : '❌ Not set'}\n`);

    // Show what will change
    console.log('🚀 After Service Account Setup:');
    if (result.source.includes('Static data')) {
      console.log('   ✅ Source will change to: "Google Analytics Data API"');
      console.log('   ✅ Data will be live from Google Analytics');
      console.log('   ✅ Real-time users will be included');
      console.log('   ✅ Accurate bounce rates and session duration');
    } else {
      console.log('   🎉 Already using live Google Analytics data!');
    }

    console.log('\n📋 Next Steps:');
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log('   1. Follow GOOGLE_ANALYTICS_QUICK_SETUP.md');
      console.log('   2. Create Google Cloud service account');
      console.log('   3. Add GOOGLE_SERVICE_ACCOUNT_KEY environment variable');
      console.log('   4. Restart development server');
    } else {
      console.log('   ✅ Setup complete! Analytics API is using live data.');
    }

  } catch (error) {
    console.log('❌ Error testing API:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   Development server not running');
      console.log('   Run: npm run dev');
    } else {
      console.log(`   ${error.message}`);
    }
  }
}

runTest();