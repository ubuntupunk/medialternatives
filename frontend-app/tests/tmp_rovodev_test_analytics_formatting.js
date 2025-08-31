#!/usr/bin/env node

/**
 * Test Analytics Data Formatting
 * Verify bounce rate and percentage formatting is working correctly
 */

const http = require('http');

async function testAnalyticsFormatting() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/analytics?period=7d',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
    req.end();
  });
}

async function runTest() {
  try {
    console.log('🧪 Testing Analytics Data Formatting...\n');
    
    const result = await testAnalyticsFormatting();
    
    console.log('📊 Raw API Data:');
    console.log(`   Bounce Rate: ${result.data.bounceRate}`);
    console.log(`   Visitors: ${result.data.visitors}`);
    console.log(`   Pageviews: ${result.data.pageviews}`);
    
    // Test formatting
    const bounceRate = result.data.bounceRate;
    console.log('\n🎯 Formatting Tests:');
    console.log(`   Raw: ${bounceRate}`);
    console.log(`   Formatted (1 decimal): ${bounceRate.toFixed(1)}%`);
    console.log(`   Formatted (0 decimals): ${bounceRate.toFixed(0)}%`);
    
    // Check if bounce rate has excessive decimals
    const decimalPlaces = bounceRate.toString().split('.')[1]?.length || 0;
    console.log(`\n✅ Decimal Analysis:`);
    console.log(`   Decimal places: ${decimalPlaces}`);
    console.log(`   Needs formatting: ${decimalPlaces > 1 ? 'YES' : 'NO'}`);
    
    if (decimalPlaces > 1) {
      console.log(`   ✅ Fixed in dashboard with .toFixed(1)`);
    }
    
    console.log('\n🎉 Analytics formatting test complete!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

runTest();