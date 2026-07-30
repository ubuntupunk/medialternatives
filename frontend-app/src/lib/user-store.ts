import { AuthUser } from './auth';

import { DEFAULT_ADMIN_EMAIL } from '@/lib/constants';

/**
 * User store interface for managing users
 */
export interface UserStore {
  findByEmail(email: string): Promise<AuthUser | null>;
  findByUserId(userId: string): Promise<AuthUser | null>;
  updateLastLogin(userId: string): Promise<void>;
  createUser(user: Omit<AuthUser, 'createdAt' | 'lastLoginAt'> & { passwordHash: string }): Promise<AuthUser>;
  getPasswordHash(email: string): Promise<string | null>;
}

/**
 * In-memory user store (replace with database in production)
 */
class InMemoryUserStore implements UserStore {
  private users: Map<string, AuthUser & { passwordHash: string }> = new Map();

  constructor() {
    // Initialize with default admin user
    this.initializeDefaultUser();
  }

  private async initializeDefaultUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    // Decode base64 encoded hash to avoid $ character parsing issues in .env
    const encodedHash = process.env.ADMIN_PASSWORD_HASH_B64;
    const adminPasswordHash = encodedHash ? Buffer.from(encodedHash, 'base64').toString('utf8').replace(/\n$/, '') : undefined;

    console.log('🔧 Initializing admin user...');
    console.log('📧 Admin email:', adminEmail);
    console.log('🔒 Password hash configured');

    if (!adminPasswordHash) {
      console.error('SECURITY WARNING: ADMIN_PASSWORD_HASH environment variable is not set!');
      console.error('Please run: npm run hash-password <your-password>');
      console.error('Then set ADMIN_PASSWORD_HASH in your .env file');
      return;
    }

    const adminUser: AuthUser & { passwordHash: string } = {
      userId: 'david-robert-lewis',
      username: 'David Robert Lewis',
      email: adminEmail,
      isAdmin: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      lastLoginAt: undefined,
      passwordHash: adminPasswordHash
    };

    this.users.set(adminEmail, adminUser);
    this.users.set(adminUser.userId, adminUser);

    console.log('✅ Admin user initialized successfully');
    console.log('👤 User details:', {
      userId: adminUser.userId,
      username: adminUser.username,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin
    });
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = this.users.get(email);
    if (!user) return null;

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    return userWithoutPassword;
  }

  async findByUserId(userId: string): Promise<AuthUser | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    return userWithoutPassword;
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(userId, user);
    }
  }

  async createUser(userData: Omit<AuthUser, 'createdAt' | 'lastLoginAt'> & { passwordHash: string }): Promise<AuthUser> {
    const user: AuthUser & { passwordHash: string } = {
      ...userData,
      createdAt: new Date(),
      lastLoginAt: undefined
    };

    this.users.set(user.email, user);
    this.users.set(user.userId, user);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    return userWithoutPassword;
  }

  /**
   * Get password hash for a user (internal use only)
   */
  async getPasswordHash(email: string): Promise<string | null> {
    const user = this.users.get(email);
    return user?.passwordHash || null;
  }
}

// Global user store instance
export const userStore = new InMemoryUserStore();