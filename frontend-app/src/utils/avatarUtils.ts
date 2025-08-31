/**
 * Avatar utility functions for generating, processing, and managing user avatars
 */

/**
 * Options for avatar generation
 * @interface AvatarOptions
 * @property {number} [size] - Avatar size in pixels
 * @property {string} [backgroundColor] - Background color (auto-generated if not provided)
 * @property {string} [textColor] - Text color for initials
 * @property {string} [fontFamily] - Font family for initials
 * @property {number} [borderRadius] - Border radius for rounded avatars
 */
export interface AvatarOptions {
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  borderRadius?: number;
}

/**
 * Generate initials from a full name
 * @param {string} name - Full name to generate initials from
 * @returns {string} Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return 'U';
  
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Generate a consistent color based on a string (usually name)
 * @param {string} str - String to generate color from
 * @returns {string} Hex color code
 */
export function generateColorFromString(str: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#F39C12', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C',
    '#2ECC71', '#F1C40F', '#E67E22', '#E91E63', '#9C27B0'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generate an avatar image from initials
 * @param {string} name - Name to generate initials from
 * @param {AvatarOptions} [options={}] - Avatar generation options
 * @returns {string} Data URL of the generated avatar image
 */
export function generateInitialsAvatar(
  name: string,
  options: AvatarOptions = {}
): string {
  const {
    size = 120,
    backgroundColor,
    textColor = '#FFFFFF',
    fontFamily = 'Arial, sans-serif',
    borderRadius = 0
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  const initials = getInitials(name);
  const bgColor = backgroundColor || generateColorFromString(name);
  
  // Background
  ctx.fillStyle = bgColor;
  if (borderRadius > 0) {
    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, borderRadius);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${size * 0.4}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
}

/**
 * Resize and crop an image to a square
 * @param {File} imageFile - Image file to resize
 * @param {number} [size=120] - Target size in pixels
 * @returns {Promise<string>} Data URL of the resized square image
 */
export function resizeImageToSquare(
  imageFile: File,
  size: number = 120
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = size;
        canvas.height = size;
        
        // Calculate crop dimensions to make it square
        const minDimension = Math.min(img.width, img.height);
        const sx = (img.width - minDimension) / 2;
        const sy = (img.height - minDimension) / 2;
        
        // Draw cropped and resized image
        ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Validate if a file is a valid image
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, GIF, WebP' };
  }
  
  return { valid: true };
}

/**
 * Convert data URL to blob for uploading
 * @param {string} dataURL - Data URL to convert
 * @returns {Blob} Converted blob
 */
export function dataURLToBlob(dataURL: string): Blob {
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

/**
 * Save avatar to localStorage (for demo purposes)
 * @param {string} userId - User identifier
 * @param {string} avatarData - Avatar data URL
 * @returns {void}
 */
export function saveAvatarToStorage(userId: string, avatarData: string): void {
  try {
    localStorage.setItem(`avatar_${userId}`, avatarData);
  } catch (error) {
    console.error('Failed to save avatar to storage:', error);
  }
}

/**
 * Load avatar from localStorage
 * @param {string} userId - User identifier
 * @returns {string | null} Avatar data URL or null if not found
 */
export function loadAvatarFromStorage(userId: string): string | null {
  try {
    return localStorage.getItem(`avatar_${userId}`);
  } catch (error) {
    console.error('Failed to load avatar from storage:', error);
    return null;
  }
}

/**
 * Remove avatar from localStorage
 * @param {string} userId - User identifier
 * @returns {void}
 */
export function removeAvatarFromStorage(userId: string): void {
  try {
    localStorage.removeItem(`avatar_${userId}`);
  } catch (error) {
    console.error('Failed to remove avatar from storage:', error);
  }
}

/**
 * Generate multiple avatar sizes from a source image
 * @param {string} sourceImage - Source image data URL
 * @param {number[]} [sizes=[24, 48, 96, 120, 150]] - Array of sizes to generate
 * @returns {Promise<Record<string, string>>} Object with size keys and data URL values
 */
export function generateAvatarSizes(
  sourceImage: string,
  sizes: number[] = [24, 48, 96, 120, 150]
): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const results: Record<string, string> = {};
      
      sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);
          results[size.toString()] = canvas.toDataURL('image/png');
        }
      });
      
      resolve(results);
    };
    
    img.onerror = () => reject(new Error('Failed to load source image'));
    img.src = sourceImage;
  });
}

/**
 * Create a gravatar-style fallback URL
 * @param {string} email - Email address for gravatar
 * @param {number} [size=120] - Avatar size in pixels
 * @returns {string} Gravatar URL
 */
export function createGravatarUrl(email: string, size: number = 120): string {
  // This is a simplified version - in a real app you'd use crypto.subtle or a library
  // For demo purposes, we'll just create a placeholder
  const hash = btoa(email.toLowerCase().trim()).slice(0, 32);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

/**
 * Avatar management class for handling user avatars
 * @class AvatarManager
 */
export class AvatarManager {
  private userId: string;

  /**
   * Create avatar manager for a user
   * @param {string} userId - User identifier
   */
  constructor(userId: string) {
    this.userId = userId;
  }
  
   /**
    * Get current avatar or generate fallback
    * @param {string} userName - User's full name
    * @param {number} [size=120] - Avatar size in pixels
    * @returns {string} Avatar data URL
    */
   getAvatar(userName: string, size: number = 120): string {
    const stored = loadAvatarFromStorage(this.userId);
    if (stored) return stored;
    
    return generateInitialsAvatar(userName, { size });
  }
  
   /**
    * Save new avatar
    * @param {string} avatarData - Avatar data URL
    * @returns {void}
    */
   saveAvatar(avatarData: string): void {
    saveAvatarToStorage(this.userId, avatarData);
  }
  
   /**
    * Remove avatar
    * @returns {void}
    */
   removeAvatar(): void {
    removeAvatarFromStorage(this.userId);
  }
  
   /**
    * Update avatar from file
    * @param {File} file - Image file to use
    * @param {number} [size=120] - Target size in pixels
    * @returns {Promise<string>} Processed avatar data URL
    */
   async updateFromFile(file: File, size: number = 120): Promise<string> {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const resizedImage = await resizeImageToSquare(file, size);
    this.saveAvatar(resizedImage);
    return resizedImage;
  }
  
   /**
    * Generate initials avatar
    * @param {string} userName - User's full name
    * @param {number} [size=120] - Avatar size in pixels
    * @returns {string} Generated avatar data URL
    */
   generateInitials(userName: string, size: number = 120): string {
    const avatar = generateInitialsAvatar(userName, { size });
    this.saveAvatar(avatar);
    return avatar;
  }
}