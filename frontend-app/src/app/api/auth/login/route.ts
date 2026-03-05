import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import {
  validatePasswordComplexity,
  verifyPassword,
  createAuthResponse,
  getClientIdentifier,
  getLockoutStatus,
  recordFailedAttempt,
  clearFailedAttempts
} from '@/lib/auth';
import { userStore } from '@/lib/user-store';

/**
 * POST /api/auth/login - Secure JWT-based authentication endpoint
 *
 * Authenticates admin user with comprehensive security measures including:
 * - Password complexity validation
 * - Account lockout protection
 * - JWT token-based authentication
 * - Secure password hashing
 *
 * @param {NextRequest} request - Next.js request object containing email and password
 * @returns {Promise<NextResponse>} Authentication response with JWT tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Get client identifier for lockout tracking
    const clientId = getClientIdentifier(request);

    // Check account lockout status
    const lockoutStatus = getLockoutStatus(clientId);
    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account temporarily locked due to too many failed attempts',
            details: `Try again in ${Math.ceil(lockoutStatus.remainingTime / 1000 / 60)} minutes`
          }
        },
        { status: 429 }
      );
    }

    // Apply rate limiting for authentication
    const rateLimit = createRateLimit(rateLimitConfigs.auth);
    const rateLimitResponse = await rateLimit(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { email, password } = await request.json();

    // Debug logging
    console.log('🔍 Login attempt:', { email: email ? 'provided' : 'missing', hasPassword: !!password });

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Validation failed: Missing email or password');
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' }
        },
        { status: 400 }
      );
    }

    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_COMPLEXITY',
            message: 'Password does not meet complexity requirements',
            details: passwordValidation.errors
          }
        },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('🔍 Looking up user by email:', email);
    const user = await userStore.findByEmail(email);
    if (!user) {
      console.log('❌ User not found for email:', email);
      // Record failed attempt for unknown email
      recordFailedAttempt(clientId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent timing attacks

      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        },
        { status: 401 }
      );
    }

    console.log('✅ User found:', { userId: user.userId, email: user.email });

    // Get password hash from user store
    console.log('🔍 Getting password hash for user');
    const passwordHash = await userStore.getPasswordHash(email);
    if (!passwordHash) {
      console.error('❌ Password hash not found for user:', email);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Authentication system error' }
        },
        { status: 500 }
      );
    }

    console.log('✅ Password hash found, verifying password...');
    // Verify password
    const isValidPassword = await verifyPassword(password, passwordHash);
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      // Record failed attempt
      recordFailedAttempt(clientId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent timing attacks

      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

    // Clear failed attempts on successful login
    clearFailedAttempts(clientId);

    // Update last login time
    await userStore.updateLastLogin(user.userId);

    // Create authentication response with JWT tokens
    return createAuthResponse(user);

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
      },
      { status: 500 }
    );
  }
}