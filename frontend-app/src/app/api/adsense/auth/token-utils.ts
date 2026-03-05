import { readToken as readStoredToken, writeToken as writeStoredToken } from './token-storage';

/**
 * Get stored AdSense OAuth token
 * @returns {Promise<any>} Stored OAuth token or null
 */
export async function getToken() {
  return await readStoredToken();
}

/**
 * Store AdSense OAuth token
 * @param {object} newToken - OAuth token to store
 * @returns {Promise<void>}
 */
export async function setToken(newToken: object) {
  await writeStoredToken(newToken);
}