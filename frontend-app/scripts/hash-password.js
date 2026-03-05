#!/usr/bin/env node

/**
 * Password hashing utility for admin authentication
 * Usage: npm run hash-password <password>
 */

const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = process.argv[2];

  if (!password) {
    console.error('❌ Error: Password is required');
    console.log('Usage: npm run hash-password <password>');
    console.log('Example: npm run hash-password mySecurePassword123!');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  try {
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);

    console.log('✅ Password hashed successfully!');
    console.log('');
    console.log('📋 Copy this hash to your .env file:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Keep this hash secure and never commit it to version control!');
    console.log('🔒 Make sure your .env file is in .gitignore');

  } catch (error) {
    console.error('❌ Error hashing password:', error.message);
    process.exit(1);
  }
}

hashPassword();