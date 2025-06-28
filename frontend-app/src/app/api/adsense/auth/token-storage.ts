// frontend-app/src/app/api/adsense/auth/token-storage.ts
import fs from 'fs/promises';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'adsense-token.json');

export async function readToken() {
  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf-8');
    return JSON.parse(token);
  } catch (error) {
    return null;
  }
}

export async function writeToken(token: any) {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
}
