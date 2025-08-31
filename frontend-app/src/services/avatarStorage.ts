/**
 * Avatar storage service with multiple backend options
 * Provides a unified interface for different storage solutions
 */

/**
 * Interface for avatar storage adapters
 * @interface AvatarStorageAdapter
 */
export interface AvatarStorageAdapter {
  /**
   * Save avatar data for a user
   * @param {string} userId - Unique user identifier
   * @param {string} avatarData - Avatar data (data URL or blob)
   * @param {AvatarMetadata} [metadata] - Optional metadata about the avatar
   * @returns {Promise<string>} URL or identifier of the saved avatar
   */
  save(userId: string, avatarData: string, metadata?: AvatarMetadata): Promise<string>;

  /**
   * Load avatar data for a user
   * @param {string} userId - Unique user identifier
   * @returns {Promise<string | null>} Avatar data URL or null if not found
   */
  load(userId: string): Promise<string | null>;

  /**
   * Remove avatar data for a user
   * @param {string} userId - Unique user identifier
   * @returns {Promise<void>}
   */
  remove(userId: string): Promise<void>;

  /**
   * Get avatar URL for a user
   * @param {string} userId - Unique user identifier
   * @returns {Promise<string | null>} Avatar URL or null if not found
   */
  getUrl(userId: string): Promise<string | null>;
}

/**
 * Metadata for avatar files
 * @interface AvatarMetadata
 * @property {string} [filename] - Generated filename
 * @property {string} [mimeType] - MIME type of the avatar
 * @property {number} [size] - File size in bytes
 * @property {Date} [uploadedAt] - Upload timestamp
 * @property {string} [originalName] - Original filename
 */
export interface AvatarMetadata {
  filename?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: Date;
  originalName?: string;
}

/**
 * 1. LOCAL STORAGE ADAPTER (Demo/Development)
 */
/**
 * Local storage adapter for avatar storage (development/demo)
 * @class LocalStorageAdapter
 * @implements {AvatarStorageAdapter}
 */
export class LocalStorageAdapter implements AvatarStorageAdapter {
  /**
   * Save avatar to localStorage
   * @param {string} userId - Unique user identifier
   * @param {string} avatarData - Avatar data URL
   * @param {AvatarMetadata} [metadata] - Optional metadata
   * @returns {Promise<string>} Avatar data URL
   */
  async save(userId: string, avatarData: string, metadata?: AvatarMetadata): Promise<string> {
    try {
      const key = `avatar_${userId}`;
      const data = {
        avatar: avatarData,
        metadata: metadata || {},
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      return avatarData; // Return the data URL for immediate use
    } catch (error) {
      throw new Error(`Failed to save avatar to localStorage: ${error}`);
    }
  }

  /**
   * Load avatar from localStorage
   * @param {string} userId - Unique user identifier
   * @returns {Promise<string | null>} Avatar data URL or null
   */
  async load(userId: string): Promise<string | null> {
    try {
      const key = `avatar_${userId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const data = JSON.parse(stored);
      return data.avatar;
    } catch (error) {
      console.error('Failed to load avatar from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove avatar from localStorage
   * @param {string} userId - Unique user identifier
   * @returns {Promise<void>}
   */
  async remove(userId: string): Promise<void> {
    try {
      localStorage.removeItem(`avatar_${userId}`);
    } catch (error) {
      throw new Error(`Failed to remove avatar from localStorage: ${error}`);
    }
  }

  /**
   * Get avatar URL from localStorage
   * @param {string} userId - Unique user identifier
   * @returns {Promise<string | null>} Avatar data URL or null
   */
  async getUrl(userId: string): Promise<string | null> {
    return this.load(userId); // Same as load for localStorage
  }
}

/**
 * Vercel Blob storage adapter for avatar storage
 * @class VercelBlobAdapter
 * @implements {AvatarStorageAdapter}
 */
export class VercelBlobAdapter implements AvatarStorageAdapter {
  private apiUrl: string;

  /**
   * Create Vercel Blob adapter
   * @param {string} [apiUrl='/api/avatars'] - API endpoint URL
   */
  constructor(apiUrl: string = '/api/avatars') {
    this.apiUrl = apiUrl;
  }

  /**
   * Save avatar to Vercel Blob storage
   * @param {string} userId - Unique user identifier
   * @param {string} avatarData - Avatar data URL
   * @param {AvatarMetadata} [metadata] - Optional metadata
   * @returns {Promise<string>} Vercel Blob URL
   */
  async save(userId: string, avatarData: string, metadata?: AvatarMetadata): Promise<string> {
    try {
      // Convert data URL to blob
      const blob = this.dataURLToBlob(avatarData);
      
      const formData = new FormData();
      formData.append('avatar', blob, `avatar-${userId}.png`);
      formData.append('userId', userId);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url; // Return the Vercel Blob URL
    } catch (error) {
      throw new Error(`Failed to save avatar to Vercel Blob: ${error}`);
    }
  }

  /**
   * Load avatar from Vercel Blob storage
   * @param {string} userId - Unique user identifier
   * @returns {Promise<string | null>} Avatar URL or null
   */
  async load(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to load avatar: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Failed to load avatar from Vercel Blob:', error);
      return null;
    }
  }

  /**
   * Remove avatar from Vercel Blob storage
   * @param {string} userId - Unique user identifier
   * @returns {Promise<void>}
   */
  async remove(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove avatar: ${response.statusText}`);
      }
     } catch (error) {
       throw new Error(`Failed to remove avatar from Vercel Blob: ${error}`);
     }
   }

   /**
    * Get avatar URL from Vercel Blob storage
    * @param {string} userId - Unique user identifier
    * @returns {Promise<string | null>} Avatar URL or null
    */
   async getUrl(userId: string): Promise<string | null> {
     return this.load(userId);
   }

   /**
    * Convert data URL to Blob
    * @private
    * @param {string} dataURL - Data URL to convert
    * @returns {Blob} Converted blob
    */
   private dataURLToBlob(dataURL: string): Blob {
     const arr = dataURL.split(',');
     const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
     const bstr = atob(arr[1]);
     let n = bstr.length;
     const u8arr = new Uint8Array(n);

     while (n--) {
       u8arr[n] = bstr.charCodeAt(n);
     }

     return new Blob([u8arr], { type: mime });
   }
}

/**
 * Cloudinary storage adapter for avatar storage
 * @class CloudinaryAdapter
 * @implements {AvatarStorageAdapter}
 */
export class CloudinaryAdapter implements AvatarStorageAdapter {
  private cloudName: string;
  private uploadPreset: string;

  /**
   * Create Cloudinary adapter
   * @param {string} cloudName - Cloudinary cloud name
   * @param {string} uploadPreset - Cloudinary upload preset
   */
  constructor(cloudName: string, uploadPreset: string) {
    this.cloudName = cloudName;
    this.uploadPreset = uploadPreset;
  }

  async save(userId: string, avatarData: string, metadata?: AvatarMetadata): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', avatarData);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('public_id', `avatars/${userId}`);
      formData.append('folder', 'avatars');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to save avatar to Cloudinary: ${error}`);
    }
  }

  async load(userId: string): Promise<string | null> {
    // Cloudinary URLs are predictable, so we can construct them
    const url = `https://res.cloudinary.com/${this.cloudName}/image/upload/avatars/${userId}`;
    
    try {
      // Check if image exists
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok ? url : null;
    } catch (error) {
      return null;
    }
  }

  async remove(userId: string): Promise<void> {
    // Note: Removing from Cloudinary requires admin API with authentication
    // This would typically be done server-side
    throw new Error('Cloudinary removal requires server-side implementation');
  }

  async getUrl(userId: string): Promise<string | null> {
    return this.load(userId);
  }
}

/**
 * 4. SUPABASE STORAGE ADAPTER (Open source Firebase alternative)
 */
export class SupabaseStorageAdapter implements AvatarStorageAdapter {
  private supabaseUrl: string;
  private supabaseKey: string;
  private bucket: string;

  constructor(supabaseUrl: string, supabaseKey: string, bucket: string = 'avatars') {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.bucket = bucket;
  }

  async save(userId: string, avatarData: string, metadata?: AvatarMetadata): Promise<string> {
    try {
      const blob = this.dataURLToBlob(avatarData);
      const fileName = `${userId}.png`;

      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': blob.type,
          },
          body: blob,
        }
      );

      if (!response.ok) {
        throw new Error(`Supabase upload failed: ${response.statusText}`);
      }

      return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to save avatar to Supabase: ${error}`);
    }
  }

  async load(userId: string): Promise<string | null> {
    const url = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${userId}.png`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok ? url : null;
    } catch (error) {
      return null;
    }
  }

  async remove(userId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${userId}.png`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove avatar: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to remove avatar from Supabase: ${error}`);
    }
  }

  async getUrl(userId: string): Promise<string | null> {
    return this.load(userId);
  }

  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }
}

/**
 * 5. SIMPLE FILE SYSTEM ADAPTER (For self-hosted solutions)
 */
export class FileSystemAdapter implements AvatarStorageAdapter {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/avatars') {
    this.apiUrl = apiUrl;
  }

  async save(userId: string, avatarData: string, metadata?: AvatarMetadata): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          avatarData,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      throw new Error(`Failed to save avatar to file system: ${error}`);
    }
  }

  async load(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to load avatar: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Failed to load avatar from file system:', error);
      return null;
    }
  }

  async remove(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove avatar: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to remove avatar from file system: ${error}`);
    }
  }

  async getUrl(userId: string): Promise<string | null> {
    return this.load(userId);
  }
}

/**
 * Unified avatar storage service
 * @class AvatarStorageService
 */
export class AvatarStorageService {
  private adapter: AvatarStorageAdapter;

  /**
   * Create avatar storage service
   * @param {AvatarStorageAdapter} adapter - Storage adapter to use
   */
  /**
   * Create avatar storage service
   * @param {AvatarStorageAdapter} adapter - Storage adapter to use
   */
  constructor(adapter: AvatarStorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Save avatar for a user
   * @param {string} userId - Unique user identifier
   * @param {string} avatarData - Avatar data
   * @param {AvatarMetadata} [metadata] - Optional metadata
   * @returns {Promise<string>} Avatar URL or identifier
   */
  async saveAvatar(userId: string, avatarData: string, metadata?: AvatarMetadata): Promise<string> {
    return this.adapter.save(userId, avatarData, metadata);
  }

  /**
   * Load avatar for a user
   * @param {string} userId - Unique user identifier
   * @returns {Promise<string | null>} Avatar data or null
   */
  async loadAvatar(userId: string): Promise<string | null> {
    return this.adapter.load(userId);
  }

  /**
   * Remove avatar for a user
   * @param {string} userId - Unique user identifier
   * @returns {Promise<void>}
   */
  async removeAvatar(userId: string): Promise<void> {
    return this.adapter.remove(userId);
  }

  /**
   * Get avatar URL for a user
   * @param {string} userId - Unique user identifier
   * @returns {Promise<string | null>} Avatar URL or null
   */
  async getAvatarUrl(userId: string): Promise<string | null> {
    return this.adapter.getUrl(userId);
  }

  /**
   * Switch storage adapter at runtime
   * @param {AvatarStorageAdapter} adapter - New storage adapter
   * @returns {void}
   */
  setAdapter(adapter: AvatarStorageAdapter): void {
    this.adapter = adapter;
  }
}

/**
 * Factory function to create avatar storage service based on environment
 * @returns {AvatarStorageService} Configured avatar storage service
 */
export function createAvatarStorage(): AvatarStorageService {
  const storageType = process.env.NEXT_PUBLIC_AVATAR_STORAGE || 'localStorage';
  
  let adapter: AvatarStorageAdapter;
  
  switch (storageType) {
    case 'vercel':
      adapter = new VercelBlobAdapter();
      break;
    case 'cloudinary':
      adapter = new CloudinaryAdapter(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );
      break;
    case 'supabase':
      adapter = new SupabaseStorageAdapter(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      break;
    case 'filesystem':
      adapter = new FileSystemAdapter();
      break;
    default:
      adapter = new LocalStorageAdapter();
  }
  
  return new AvatarStorageService(adapter);
}