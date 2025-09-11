import crypto from 'crypto';

/**
 * OAuth security utilities for secure authentication flows
 */

/**
 * Generate a secure state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate PKCE (Proof Key for Code Exchange) values
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string; codeChallengeMethod: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const codeChallengeMethod = 'S256';

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod
  };
}

/**
 * Validate state parameter to prevent CSRF attacks
 */
export function validateState(receivedState: string, expectedState: string): boolean {
  if (!receivedState || !expectedState) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(receivedState, 'hex'),
    Buffer.from(expectedState, 'hex')
  );
}

/**
 * Get the correct redirect URI based on environment
 */
export function getRedirectURI(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                  (process.env.NODE_ENV === 'production'
                    ? 'https://medialternatives.com'
                    : 'http://localhost:3000');

  return `${baseUrl}/api/adsense/callback`;
}

/**
 * Validate OAuth scopes to ensure only necessary permissions
 */
export function validateScopes(requestedScopes: string[]): boolean {
  const allowedScopes = [
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly'
  ];

  return requestedScopes.every(scope => allowedScopes.includes(scope));
}

/**
 * Store OAuth state in session (temporary storage)
 * In production, this should be stored in Redis or similar
 */
const stateStore = new Map<string, { state: string; expires: number; pkce?: { codeVerifier: string } }>();

/**
 * Store OAuth state with expiration
 */
export function storeOAuthState(sessionId: string, state: string, pkce?: { codeVerifier: string }): void {
  const expires = Date.now() + (10 * 60 * 1000); // 10 minutes
  stateStore.set(sessionId, { state, expires, pkce });
}

/**
 * Retrieve and validate OAuth state
 */
export function getOAuthState(sessionId: string): { state: string; pkce?: { codeVerifier: string } } | null {
  const stored = stateStore.get(sessionId);

  if (!stored) {
    return null;
  }

  // Check if expired
  if (Date.now() > stored.expires) {
    stateStore.delete(sessionId);
    return null;
  }

  return { state: stored.state, pkce: stored.pkce };
}

/**
 * Clear OAuth state after use
 */
export function clearOAuthState(sessionId: string): void {
  stateStore.clear();
}

/**
 * Generate session ID for OAuth flow
 */
export function generateSessionId(): string {
  return `oauth_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Clean up expired states (should be called periodically)
 */
export function cleanupExpiredStates(): void {
  const now = Date.now();
  for (const [sessionId, data] of stateStore.entries()) {
    if (now > data.expires) {
      stateStore.delete(sessionId);
    }
  }
}

// Clean up expired states every 5 minutes
setInterval(cleanupExpiredStates, 5 * 60 * 1000);

/**
 * Validate OAuth callback parameters
 */
export function validateOAuthCallback(
  code: string,
  state: string,
  sessionId: string
): { isValid: boolean; error?: string; codeVerifier?: string } {
  if (!code) {
    return { isValid: false, error: 'Authorization code is required' };
  }

  if (!state) {
    return { isValid: false, error: 'State parameter is required' };
  }

  const storedState = getOAuthState(sessionId);
  if (!storedState) {
    return { isValid: false, error: 'Invalid or expired session' };
  }

  if (storedState.state !== state) {
    return { isValid: false, error: 'State parameter mismatch - possible CSRF attack' };
  }

  return {
    isValid: true,
    codeVerifier: storedState.pkce?.codeVerifier
  };
}