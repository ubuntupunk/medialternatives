import { WordPressPost } from '@/types/wordpress';

export interface DeadLink {
  url: string;
  status: number | null;
  error: string | null;
  context: string; // Surrounding text for context
  postId: number;
  postTitle: string;
  postSlug: string;
  archiveUrl?: string;
  suggestions?: string[];
  retryable?: boolean;
  checkedAt?: string;
}

export interface LinkCheckResult {
  totalLinks: number;
  checkedLinks: number;
  deadLinks: DeadLink[];
  workingLinks: number;
  skippedLinks: number;
  processingTime: number;
  retryableErrors: number;
  forbiddenErrors: number;
  timeoutErrors: number;
}

/**
 * Extract all URLs from post content
 */
export function extractUrlsFromContent(content: string): Array<{ url: string; context: string }> {
  const urls: Array<{ url: string; context: string }> = [];
  
  // Regex to find URLs in href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[1];
    
    // Skip internal links, anchors, and common non-HTTP protocols
    if (
      url.startsWith('#') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.startsWith('javascript:') ||
      url.startsWith('/') ||
      url.includes('medialternatives.com') ||
      url.includes('medialternatives.wordpress.com')
    ) {
      continue;
    }
    
    // Get context (50 chars before and after the link)
    const linkIndex = content.indexOf(match[0]);
    const contextStart = Math.max(0, linkIndex - 50);
    const contextEnd = Math.min(content.length, linkIndex + match[0].length + 50);
    const context = content.substring(contextStart, contextEnd)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
    
    urls.push({ url, context });
  }
  
  // Also check for plain URLs in text (not in href)
  const plainUrlRegex = /https?:\/\/[^\s<>"']+/gi;
  const hrefUrls = new Set(urls.map(u => u.url));
  
  while ((match = plainUrlRegex.exec(content)) !== null) {
    const url = match[0];
    
    // Skip if already found in href or is internal
    if (
      hrefUrls.has(url) ||
      url.includes('medialternatives.com') ||
      url.includes('medialternatives.wordpress.com')
    ) {
      continue;
    }
    
    const linkIndex = match.index;
    const contextStart = Math.max(0, linkIndex - 50);
    const contextEnd = Math.min(content.length, linkIndex + url.length + 50);
    const context = content.substring(contextStart, contextEnd)
      .replace(/<[^>]*>/g, '')
      .trim();
    
    urls.push({ url, context });
  }
  
  // Remove duplicates
  const uniqueUrls = Array.from(
    new Map(urls.map(item => [item.url, item])).values()
  );
  
  return uniqueUrls;
}

/**
 * Check if a URL is accessible with enhanced error handling
 */
export async function checkUrl(url: string, timeout: number = 10000): Promise<{ status: number | null; error: string | null; retryable: boolean }> {
  try {
    // Use a CORS proxy for client-side requests or direct fetch for server-side
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Enhanced headers to avoid being blocked
    const response = await fetch(url, {
      method: 'HEAD', // Use HEAD to avoid downloading content
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    clearTimeout(timeoutId);
    
    // Handle specific status codes
    if (response.status === 403) {
      // Try GET request if HEAD is forbidden
      try {
        const getResponse = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(timeout),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        
        return {
          status: getResponse.status,
          error: getResponse.ok ? null : `HTTP ${getResponse.status} ${getResponse.statusText}`,
          retryable: getResponse.status >= 500 || getResponse.status === 429
        };
      } catch (getError) {
        return {
          status: 403,
          error: 'Forbidden - Server blocks automated requests',
          retryable: false
        };
      }
    }
    
    return {
      status: response.status,
      error: response.ok ? null : `HTTP ${response.status} ${response.statusText}`,
      retryable: response.status >= 500 || response.status === 429
    };
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { status: null, error: 'Request timeout', retryable: true };
      }
      if (error.message.includes('CORS')) {
        return { status: null, error: 'CORS blocked - Cannot verify from browser', retryable: false };
      }
      if (error.message.includes('network')) {
        return { status: null, error: 'Network error', retryable: true };
      }
      return { status: null, error: error.message, retryable: true };
    }
    return { status: null, error: 'Unknown error', retryable: true };
  }
}

/**
 * Generate Internet Archive Wayback Machine URL
 */
export function generateArchiveUrl(url: string): string {
  return `https://web.archive.org/web/*/${url}`;
}

/**
 * Search Internet Archive for snapshots
 */
export async function searchArchiveSnapshots(url: string): Promise<string[]> {
  try {
    const apiUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=5`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length < 2) {
      return [];
    }
    
    // Skip header row and extract timestamps
    const snapshots = data.slice(1).map((row: string[]) => {
      const timestamp = row[1];
      return `https://web.archive.org/web/${timestamp}/${url}`;
    });
    
    return snapshots;
    
  } catch (error) {
    console.error('Error searching archive snapshots:', error);
    return [];
  }
}

/**
 * Generate alternative suggestions for broken links
 */
export function generateSuggestions(url: string): string[] {
  const suggestions: string[] = [];
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Suggest checking the domain root
    suggestions.push(`Check domain root: ${urlObj.protocol}//${domain}`);
    
    // Suggest searching for the domain
    suggestions.push(`Search for "${domain}" on Google`);
    
    // If it's a specific page, suggest searching for the page title
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      const searchTerm = lastPart.replace(/[-_]/g, ' ').replace(/\.[^.]*$/, '');
      suggestions.push(`Search for "${searchTerm}" on the site`);
    }
    
    // Suggest checking if the site moved
    suggestions.push(`Check if ${domain} has moved or rebranded`);
    
  } catch (error) {
    suggestions.push('Manually verify the URL');
  }
  
  return suggestions;
}

/**
 * Check all links in a single post
 */
export async function checkPostLinks(post: WordPressPost): Promise<DeadLink[]> {
  const urls = extractUrlsFromContent(post.content.rendered);
  const deadLinks: DeadLink[] = [];
  
  console.log(`Checking ${urls.length} links in post: ${post.title.rendered}`);
  
  for (const { url, context } of urls) {
    try {
      const result = await checkUrl(url);
      
      // Consider 4xx and 5xx as dead links
      if (result.status === null || result.status >= 400) {
        const archiveUrl = generateArchiveUrl(url);
        const suggestions = generateSuggestions(url);
        
        // Try to find archive snapshots
        const snapshots = await searchArchiveSnapshots(url);
        
        deadLinks.push({
          url,
          status: result.status,
          error: result.error,
          context,
          postId: post.id,
          postTitle: post.title.rendered,
          postSlug: post.slug,
          archiveUrl,
          suggestions: snapshots.length > 0 ? [`Archive snapshots found: ${snapshots[0]}`] : suggestions
        });
      }
      
      // Add delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error checking URL ${url}:`, error);
    }
  }
  
  return deadLinks;
}

/**
 * Check links in multiple posts with progress tracking
 */
export async function checkMultiplePostsLinks(
  posts: WordPressPost[], 
  progressCallback?: (update: { current: number; total: number; percentage: number; currentItem?: string }) => void
): Promise<LinkCheckResult> {
  const startTime = Date.now();
  let totalLinks = 0;
  let checkedLinks = 0;
  let workingLinks = 0;
  let skippedLinks = 0;
  let retryableErrors = 0;
  let forbiddenErrors = 0;
  let timeoutErrors = 0;
  const allDeadLinks: DeadLink[] = [];
  
  // First pass: count total links
  for (const post of posts) {
    const urls = extractUrlsFromContent(post.content.rendered);
    totalLinks += urls.length;
  }
  
  let processedLinks = 0;

  // Limit concurrency to prevent excessive CPU usage
  const MAX_CONCURRENT_CHECKS = 3;
  const DELAY_BETWEEN_REQUESTS = 2000; // Increased from 500ms to reduce CPU load

  // Process posts with concurrency control
  for (let i = 0; i < posts.length; i += MAX_CONCURRENT_CHECKS) {
    const batch = posts.slice(i, i + MAX_CONCURRENT_CHECKS);
    const batchPromises = batch.map(async (post) => {
      try {
        const urls = extractUrlsFromContent(post.content.rendered);

        console.log(`Processing post: ${post.title.rendered} (${urls.length} links)`);

        for (const { url, context } of urls) {
          try {
            // Update progress
            if (progressCallback) {
              progressCallback({
                current: processedLinks,
                total: totalLinks,
                percentage: Math.round((processedLinks / totalLinks) * 100),
                currentItem: url.length > 50 ? `${url.substring(0, 50)}...` : url
              });
            }

            const result = await checkUrl(url, 8000); // Reduced timeout from 10s to 8s
            checkedLinks++;
            processedLinks++;

            if (result.status === null || result.status >= 400) {
              const archiveUrl = generateArchiveUrl(url);
              const suggestions = generateSuggestions(url);
              // Skip archive snapshots to reduce API calls and CPU usage
              // const snapshots = await searchArchiveSnapshots(url);

              // Count error types
              if (result.retryable) retryableErrors++;
              if (result.status === 403) forbiddenErrors++;
              if (result.error?.includes('timeout')) timeoutErrors++;

              allDeadLinks.push({
                url,
                status: result.status,
                error: result.error,
                context,
                postId: post.id,
                postTitle: post.title.rendered,
                postSlug: post.slug,
                archiveUrl,
                suggestions: suggestions, // Removed snapshots to reduce CPU
                retryable: result.retryable,
                checkedAt: new Date().toISOString()
              });
            } else {
              workingLinks++;
            }

            // Rate limiting - increased delay to reduce CPU load
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));

          } catch (error) {
            console.error(`Error checking URL ${url}:`, error);
            skippedLinks++;
            processedLinks++;
          }
        }

      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
      }
    });

    // Wait for current batch to complete before starting next batch
    await Promise.all(batchPromises);
  }
  
  // Final progress update
  if (progressCallback) {
    progressCallback({
      current: totalLinks,
      total: totalLinks,
      percentage: 100,
      currentItem: 'Completed'
    });
  }
  
  const processingTime = Date.now() - startTime;
  
  return {
    totalLinks,
    checkedLinks,
    deadLinks: allDeadLinks,
    workingLinks,
    skippedLinks,
    processingTime,
    retryableErrors,
    forbiddenErrors,
    timeoutErrors
  };
}