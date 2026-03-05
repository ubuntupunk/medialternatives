import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// JWT configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = '7d'; // 7 days

// Account lockout configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Password complexity requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REQUIRE_UPPERCASE = true;
const PASSWORD_REQUIRE_LOWERCASE = true;
const PASSWORD_REQUIRE_NUMBERS = true;
const PASSWORD_REQUIRE_SPECIAL_CHARS = true;

// In-memory store for failed login attempts (use Redis in production)
const failedAttempts = new Map<string, { count: number; lockoutUntil: number }>();

/**
 * User interface for authentication
 */
export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  isAdmin: boolean;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Account lockout status
 */
export interface LockoutStatus {
  isLocked: boolean;
  remainingTime: number;
  attemptsRemaining: number;
}

/**
 * Validate password complexity
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }

  if (PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: AuthUser): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.userId,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    type: 'access'
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(user: AuthUser): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.userId,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, type: 'access' | 'refresh' = 'access'): JWTPayload | null {
  try {
    const secret = type === 'access' ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET;
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Check account lockout status
 */
export function getLockoutStatus(identifier: string): LockoutStatus {
  const attempts = failedAttempts.get(identifier);

  if (!attempts) {
    return {
      isLocked: false,
      remainingTime: 0,
      attemptsRemaining: MAX_FAILED_ATTEMPTS
    };
  }

  const now = Date.now();

  if (now > attempts.lockoutUntil) {
    // Lockout period has expired
    failedAttempts.delete(identifier);
    return {
      isLocked: false,
      remainingTime: 0,
      attemptsRemaining: MAX_FAILED_ATTEMPTS
    };
  }

  return {
    isLocked: true,
    remainingTime: attempts.lockoutUntil - now,
    attemptsRemaining: 0
  };
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(identifier: string): void {
  const attempts = failedAttempts.get(identifier) || { count: 0, lockoutUntil: 0 };
  attempts.count += 1;

  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    attempts.lockoutUntil = Date.now() + LOCKOUT_DURATION;
  }

  failedAttempts.set(identifier, attempts);
}

/**
 * Clear failed attempts (on successful login)
 */
export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

/**
 * Get client identifier for rate limiting and lockout
 */
export function getClientIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const ip = request.headers.get('x-vercel-ip') ||
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  return ip;
}

/**
 * Create secure authentication response with tokens
 */
export function createAuthResponse(user: AuthUser): NextResponse {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const response = NextResponse.json({
    success: true,
    data: {
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      message: 'Login successful'
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: '2.0.0'
    }
  });

  // Set secure HTTP-only cookies
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  });

  return response;
}

/**
 * Validate authentication from request
 */
export function validateAuth(request: NextRequest): JWTPayload | null {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  return verifyToken(accessToken, 'access');
}

/**
 * Refresh access token using refresh token
 */
export function refreshAccessToken(request: NextRequest): { accessToken: string; user: AuthUser } | null {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return null;
  }

  const payload = verifyToken(refreshToken, 'refresh');

  if (!payload) {
    return null;
  }

  // Create user object from payload
  const user: AuthUser = {
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    isAdmin: payload.isAdmin,
    createdAt: new Date(), // This should come from database
    lastLoginAt: new Date()
  };

  const newAccessToken = generateAccessToken(user);

  return { accessToken: newAccessToken, user };
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
}