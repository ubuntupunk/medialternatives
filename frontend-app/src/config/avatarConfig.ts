/**
 * Avatar storage configuration
 * Configure different storage options for different environments
 */

/**
 * Configuration interface for avatar storage
 * @interface AvatarConfig
 * @property {'localStorage' | 'vercel' | 'cloudinary' | 'supabase' | 'filesystem'} storage - Storage backend to use
 * @property {number} maxFileSize - Maximum file size in bytes
 * @property {string[]} allowedTypes - Array of allowed MIME types
 * @property {number[]} sizes - Array of avatar sizes to generate
 * @property {number} quality - Image quality (0-1 for compression)
 */
export interface AvatarConfig {
  storage: 'localStorage' | 'vercel' | 'cloudinary' | 'supabase' | 'filesystem';
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  sizes: number[];
  quality: number; // 0-1 for compression
}

/**
 * Default avatar configuration for development/demo environments
 * @constant {AvatarConfig} defaultAvatarConfig
 */
export const defaultAvatarConfig: AvatarConfig = {
  storage: 'localStorage', // Default to localStorage for demo
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  sizes: [24, 32, 48, 64, 96, 120, 150], // Standard avatar sizes
  quality: 0.9, // High quality
};

/**
 * Environment-specific avatar configurations
 * @constant {Record<string, AvatarConfig>} avatarConfigs
 */
export const avatarConfigs: Record<string, AvatarConfig> = {
  development: {
    ...defaultAvatarConfig,
    storage: 'localStorage',
  },
  
  production: {
    ...defaultAvatarConfig,
    storage: 'vercel', // Use Vercel Blob for production
    maxFileSize: 2 * 1024 * 1024, // 2MB for production
  },
  
  staging: {
    ...defaultAvatarConfig,
    storage: 'vercel',
  },
};

/**
 * Get avatar configuration based on current environment
 * @returns {AvatarConfig} Avatar configuration for current environment
 */
export function getAvatarConfig(): AvatarConfig {
  const env = process.env.NODE_ENV || 'development';
  const storageOverride = process.env.NEXT_PUBLIC_AVATAR_STORAGE;
  
  const config = avatarConfigs[env] || defaultAvatarConfig;
  
  // Allow environment variable override
  if (storageOverride && ['localStorage', 'vercel', 'cloudinary', 'supabase', 'filesystem'].includes(storageOverride)) {
    config.storage = storageOverride as AvatarConfig['storage'];
  }
  
  return config;
}

/**
 * Validate that required environment variables are set for the chosen storage
 * @param {string} storage - Storage type to validate
 * @returns {{valid: boolean, missing: string[]}} Validation result with missing variables
 */
export function validateStorageConfig(storage: string): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  switch (storage) {
    case 'vercel':
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        missing.push('BLOB_READ_WRITE_TOKEN');
      }
      break;
      
    case 'cloudinary':
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
      }
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
        missing.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
      }
      break;
      
    case 'supabase':
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        missing.push('NEXT_PUBLIC_SUPABASE_URL');
      }
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      }
      break;
      
    case 'localStorage':
    case 'filesystem':
    default:
      // No additional environment variables required
      break;
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}