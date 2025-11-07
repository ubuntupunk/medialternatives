// frontend-app/src/app/api/adsense/auth/token-storage.ts
import fs from 'fs/promises';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'adsense-token.json');

/**
 * Read AdSense OAuth token from file storage
 * @returns {Promise<any>} Stored token object or null if not found
 */
export async function readToken() {
  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf-8');
    return JSON.parse(token);
  } catch {
    return null;
  }
}

/**
 * Write AdSense OAuth token to file storage
 * @param {object} token - Token object to store
 * @returns {Promise<void>}
 */
export async function writeToken(token: object) {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
}
