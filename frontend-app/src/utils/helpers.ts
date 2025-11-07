import { WordPressPost, WordPressCategory, WordPressTerm } from '@/types/wordpress';

/**
 * Format date for display
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format relative date (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

/**
 * Strip HTML tags from content
 */
export function stripHtml(html: string): string {
  if (typeof window !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  // Server-side fallback
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Create excerpt from post content
 */
export function createExcerpt(post: WordPressPost, maxLength: number = 300): string {
  // Use WordPress excerpt if available
  if (post.excerpt?.rendered) {
    let excerpt = post.excerpt.rendered;
    excerpt = stripHtml(excerpt); // Strip HTML first
    excerpt = decodeHtmlEntities(excerpt); // Decode entities
    return truncateText(excerpt, maxLength);
  }
  
  // Fallback to content
  if (post.content?.rendered) {
    let content = post.content.rendered;
    content = stripHtml(content); // Strip HTML first
    content = decodeHtmlEntities(content); // Decode entities
    return truncateText(content, maxLength);
  }
  
  return '';
}

/**
 * Get featured image URL from post
 */
export function getFeaturedImageUrl(
  post: WordPressPost, 
  size: string = 'medium_large'
): string | null {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  
  if (!featuredMedia) {
    console.log('No featured media found for post:', post.slug, 'Using unique placeholder image.');
    // Generate unique placeholder image using post ID as seed
    return `https://picsum.photos/seed/${post.id}/600/400`; // Unique fallback placeholder image
  }
  
  console.log('Featured media for post:', post.slug, featuredMedia);
  
  // Try to get specific size
  if (featuredMedia.media_details?.sizes?.[size]) {
    return featuredMedia.media_details.sizes[size].source_url;
  }
  
  // Fallback to source URL
  return featuredMedia.source_url || null;
}

/**
 * Get author information from post embedded data
 * @param {WordPressPost} post - WordPress post object
 * @returns {WordPressUser | undefined} Author data if available in embedded data, undefined otherwise
 */
export function getPostAuthor(post: WordPressPost) {
  // First try to get from embedded data
  const embeddedAuthor = post._embedded?.author?.[0];

  // Check if embedded author is valid
  if (embeddedAuthor && embeddedAuthor.name) {
    return embeddedAuthor;
  }

  // If embedded data is not available or is an error, return undefined
  // The component will need to fetch author data separately using the author ID
  return undefined;
}

/**
 * Get author ID from post
 * @param {WordPressPost} post - WordPress post object
 * @returns {number | undefined} Author ID if available, undefined otherwise
 */
export function getPostAuthorId(post: WordPressPost): number | undefined {
  return post.author || undefined;
}

/**
 * Get categories from post embedded data
 * @param {WordPressPost} post - WordPress post object
 * @returns {WordPressTerm[]} Array of category terms associated with the post
 */
export function getPostCategories(post: WordPressPost): WordPressTerm[] {
  const terms = post._embedded?.['wp:term'];
  if (!terms || !terms[0]) return [];

  // Categories are in the first term array
  return terms[0].filter(term => term.taxonomy === 'category');
}

/**
 * Get tags from post embedded data
 * @param {WordPressPost} post - WordPress post object
 * @returns {WordPressTerm[]} Array of tag terms associated with the post
 */
export function getPostTags(post: WordPressPost): WordPressTerm[] {
  const terms = post._embedded?.['wp:term'];
  if (!terms || !terms[1]) return [];

  // Tags are in the second term array
  return terms[1].filter(term => term.taxonomy === 'post_tag');
}

/**
 * Calculate font size for category cloud based on post count
 * @param {WordPressCategory} category - Category to calculate font size for
 * @param {WordPressCategory[]} allCategories - All categories for relative sizing
 * @param {number} [minSize=12] - Minimum font size in pixels
 * @param {number} [maxSize=24] - Maximum font size in pixels
 * @returns {number} Calculated font size for the category
 */
export function calculateCategoryFontSize(
  category: WordPressCategory,
  allCategories: WordPressCategory[],
  minSize: number = 12,
  maxSize: number = 24
): number {
  if (allCategories.length === 0) return minSize;

  const counts = allCategories.map(cat => cat.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  if (minCount === maxCount) return minSize;

  const ratio = (category.count - minCount) / (maxCount - minCount);
  return Math.round(minSize + (maxSize - minSize) * ratio);
}

/**
 * Generate URL slug from title
 * @param {string} title - Title to convert to slug
 * @returns {string} URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function calls to limit execution frequency
 * @template T - Function type
 * @param {T} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {(...args: Parameters<T>) => void} Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculate estimated reading time for content
 * @param {string} content - Text content to analyze
 * @param {number} [wordsPerMinute=200] - Average reading speed
 * @returns {number} Estimated reading time in minutes
 */
export function getReadingTime(content: string, wordsPerMinute: number = 200): number {
  const text = stripHtml(content);
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format reading time for display
 * @param {number} minutes - Reading time in minutes
 * @returns {string} Formatted reading time string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than 1 min read';
  } else if (minutes === 1) {
    return '1 min read';
  } else {
    return `${minutes} min read`;
  }
}

/**
 * Check if code is running in browser environment
 * @returns {boolean} True if running in browser, false if server-side
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safely get value from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} [defaultValue=null] - Default value if key not found
 * @returns {any} Parsed value from localStorage or default value
 */
export function getLocalStorage(key: string, defaultValue: any = null): any {
  if (!isBrowser()) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Safely set value in localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} True if successful, false if error occurred
 */
export function setLocalStorage(key: string, value: any): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Error writing to localStorage:', error);
    return false;
  }
}

/**
 * Create URL-safe parameters object from key-value pairs
 * @param {Record<string, any>} params - Parameters object
 * @returns {URLSearchParams} URLSearchParams instance
 */
export function createUrlParams(params: Record<string, any>): URLSearchParams {
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => urlParams.append(key, String(item)));
      } else {
        urlParams.append(key, String(value));
      }
    }
  });

  return urlParams;
}

/**
 * Decode HTML entities to plain text - works on both server and client
 * @param {string} text - Text containing HTML entities
 * @returns {string} Text with HTML entities decoded
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  if (typeof window !== 'undefined') {
    // Client-side: use DOM for comprehensive decoding
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  } else {
    // Server-side: comprehensive manual replacement for common entities
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#8217;/g, "'") // Right single quotation mark
      .replace(/&#8216;/g, "'") // Left single quotation mark
      .replace(/&#8220;/g, '"') // Left double quotation mark
      .replace(/&#8221;/g, '"') // Right double quotation mark
      .replace(/&#8211;/g, '–') // En dash
      .replace(/&#8212;/g, '—') // Em dash
      .replace(/&#8230;/g, '…') // Horizontal ellipsis
      .replace(/&nbsp;/g, ' ')  // Non-breaking space
      .replace(/&hellip;/g, '…') // Ellipsis
      .replace(/&mdash;/g, '—')  // Em dash
      .replace(/&ndash;/g, '–')  // En dash
      .replace(/&rsquo;/g, "'")  // Right single quote
      .replace(/&lsquo;/g, "'")  // Left single quote
      .replace(/&rdquo;/g, '"')  // Right double quote
      .replace(/&ldquo;/g, '"')  // Left double quote
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)) // Numeric entities
      .replace(/&#x([a-fA-F0-9]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16))); // Hex entities
  }
}
