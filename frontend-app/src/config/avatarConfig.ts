/**
 * Avatar storage configuration
 * Configure different storage options for different environments
 */

export interface AvatarConfig {
  storage: 'localStorage' | 'vercel' | 'cloudinary' | 'supabase' | 'filesystem';
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  sizes: number[];
  quality: number; // 0-1 for compression
}

// Default configuration
export const defaultAvatarConfig: AvatarConfig = {
  storage: 'localStorage', // Default to localStorage for demo
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  sizes: [24, 32, 48, 64, 96, 120, 150], // Standard avatar sizes
  quality: 0.9, // High quality
};

// Environment-specific configurations
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

// Get configuration based on environment
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

// Storage-specific environment variables validation
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