#!/usr/bin/env node

/**
 * Debug authentication system
 * Usage: npm run debug-auth
 */

const bcrypt = require('bcrypt');

async function debugAuth() {
  console.log('🔍 Debugging Authentication System\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'admin@medialternatives.com (default)');
  console.log('  ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH ? 'SET ✅' : 'NOT SET ❌');
  console.log('');

  // Test password hashing if provided
  const testPassword = process.argv[2];
  if (testPassword) {
    console.log('🧪 Testing password hashing with:', testPassword);
    try {
      const saltRounds = 12;
      const hash = await bcrypt.hash(testPassword, saltRounds);
      console.log('✅ Hash generated:', hash);

      // Test verification
      const isValid = await bcrypt.compare(testPassword, hash);
      console.log('✅ Verification test:', isValid ? 'PASSED' : 'FAILED');
    } catch (error) {
      console.error('❌ Password test failed:', error.message);
    }
    console.log('');
  }

  // Instructions
  console.log('📝 Setup Instructions:');
  console.log('1. Set ADMIN_EMAIL in your .env file (optional, defaults to admin@medialternatives.com)');
  console.log('2. Generate password hash: npm run hash-password <your-password>');
  console.log('3. Set ADMIN_PASSWORD_HASH in your .env file');
  console.log('4. Restart your development server');
  console.log('5. Try logging in at /auth/login');
  console.log('');

  console.log('🔗 Useful endpoints:');
  console.log('  GET /api/auth/debug - Check auth system status (dev only)');
  console.log('  POST /api/auth/login - Login endpoint');
  console.log('  GET /api/auth/session - Check current session');
}

debugAuth().catch(console.error);