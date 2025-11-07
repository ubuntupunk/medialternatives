import { wordpressApi } from '@/services/wordpress-api';
import { WordPressPost } from '@/types/wordpress';

/**
 * Result of matching a legacy URL to a WordPress post
 * @interface LegacyUrlMatch
 * @property {WordPressPost} post - The matched WordPress post
 * @property {number} confidence - Confidence score (0-100)
 * @property {'exact_slug' | 'title_search' | 'date_match' | 'fuzzy_match'} strategy - Matching strategy used
 */
export interface LegacyUrlMatch {
  post: WordPressPost;
  confidence: number;
  strategy: 'exact_slug' | 'title_search' | 'date_match' | 'fuzzy_match';
}

/**
 * Find WordPress posts that match legacy date-based URLs
 * @param {string} year - Year from legacy URL
 * @param {string} month - Month from legacy URL
 * @param {string} day - Day from legacy URL
 * @param {string} slug - Post slug from legacy URL
 * @returns {Promise<LegacyUrlMatch | null>} Matched post with confidence score or null
 */
export async function findPostByLegacyUrl(
  year: string,
  month: string,
  day: string,
  slug: string
): Promise<LegacyUrlMatch | null> {
  
  const strategies: Array<() => Promise<LegacyUrlMatch | null>> = [
    // Strategy 1: Exact slug match
    async () => {
      try {
        const post = await wordpressApi.getPost(slug);
        if (post) {
          return {
            post,
            confidence: 100,
            strategy: 'exact_slug'
          };
        }
      } catch (error) {
        // Post not found, continue
      }
      return null;
    },

    // Strategy 2: Search by title keywords
    async () => {
      try {
        const searchTerms = slug.replace(/-/g, ' ');
        const posts = await wordpressApi.searchPosts(searchTerms, { per_page: 5 });
        
        if (posts.length > 0) {
          // Find best match by calculating similarity
          let bestMatch = posts[0];
          let bestScore = calculateSimilarity(slug, bestMatch.slug, bestMatch.title.rendered);
          
          for (const post of posts.slice(1)) {
            const score = calculateSimilarity(slug, post.slug, post.title.rendered);
            if (score > bestScore) {
              bestMatch = post;
              bestScore = score;
            }
          }
          
          if (bestScore > 50) { // Only return if confidence is reasonable
            return {
              post: bestMatch,
              confidence: bestScore,
              strategy: 'title_search'
            };
          }
        }
      } catch (error) {
        console.error('Title search failed:', error);
      }
      return null;
    },

    // Strategy 3: Find posts from specific date
    async () => {
      try {
        const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const posts = await wordpressApi.getPosts({
          after: `${dateString}T00:00:00`,
          before: `${dateString}T23:59:59`,
          per_page: 10
        });
        
        if (posts.length > 0) {
          // Find best match by slug similarity
          let bestMatch = posts[0];
          let bestScore = calculateSimilarity(slug, bestMatch.slug, bestMatch.title.rendered);
          
          for (const post of posts.slice(1)) {
            const score = calculateSimilarity(slug, post.slug, post.title.rendered);
            if (score > bestScore) {
              bestMatch = post;
              bestScore = score;
            }
          }
          
          return {
            post: bestMatch,
            confidence: Math.max(bestScore, 30), // Boost confidence for date match
            strategy: 'date_match'
          };
        }
      } catch (error) {
        console.error('Date search failed:', error);
      }
      return null;
    },

    // Strategy 4: Fuzzy matching with common variations
    async () => {
      try {
        // Try common slug variations
        const variations = generateSlugVariations(slug);
        
        for (const variation of variations) {
          try {
            const post = await wordpressApi.getPost(variation);
            if (post) {
              return {
                post,
                confidence: 80,
                strategy: 'fuzzy_match'
              };
            }
          } catch (error) {
            // Continue to next variation
          }
        }
      } catch (error) {
        console.error('Fuzzy search failed:', error);
      }
      return null;
    }
  ];

  // Try each strategy in order
  for (const strategy of strategies) {
    const result = await strategy();
    if (result && result.confidence > 30) {
      return result;
    }
  }

  return null;
}

/**
 * Calculate similarity between legacy slug and post data
 * @param {string} legacySlug - Slug from legacy URL
 * @param {string} postSlug - Current post slug
 * @param {string} postTitle - Post title
 * @returns {number} Similarity score (0-100)
 */
function calculateSimilarity(legacySlug: string, postSlug: string, postTitle: string): number {
  let score = 0;
  
  // Exact slug match gets highest score
  if (legacySlug === postSlug) {
    return 100;
  }
  
  // Split into words for comparison
  const legacyWords = legacySlug.toLowerCase().split('-').filter(w => w.length > 2);
  const postWords = postSlug.toLowerCase().split('-').filter(w => w.length > 2);
  const titleWords = postTitle.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  // Count matching words in slug
  const slugMatches = legacyWords.filter(word => 
    postWords.some(postWord => postWord.includes(word) || word.includes(postWord))
  ).length;
  score += (slugMatches / legacyWords.length) * 60;
  
  // Count matching words in title
  const titleMatches = legacyWords.filter(word => 
    titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
  ).length;
  score += (titleMatches / legacyWords.length) * 40;
  
  return Math.round(score);
}

/**
 * Generate common slug variations
 * @param {string} slug - Original slug
 * @returns {string[]} Array of slug variations
 */
function generateSlugVariations(slug: string): string[] {
  const variations = [slug];
  
  // Remove common words
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = slug.split('-');
  const filteredWords = words.filter(word => !commonWords.includes(word.toLowerCase()));
  
  if (filteredWords.length !== words.length) {
    variations.push(filteredWords.join('-'));
  }
  
  // Try without numbers
  const withoutNumbers = slug.replace(/-?\d+/g, '').replace(/--+/g, '-').replace(/^-|-$/g, '');
  if (withoutNumbers !== slug) {
    variations.push(withoutNumbers);
  }
  
  // Try shortened version (first 5 words)
  if (words.length > 5) {
    variations.push(words.slice(0, 5).join('-'));
  }
  
  // Try with common replacements
  variations.push(
    slug.replace(/and/g, ''),
    slug.replace(/-and-/g, '-'),
    slug.replace(/the-/g, ''),
    slug.replace(/-the-/g, '-')
  );
  
  return [...new Set(variations)].filter(v => v.length > 0);
}

/**
 * Known mappings from legacy URLs to current slugs
 * @constant {Record<string, string>} KNOWN_LEGACY_MAPPINGS
 */
export const KNOWN_LEGACY_MAPPINGS: Record<string, string> = {
  // Add known mappings here as we discover them
  'apartheid-the-nazis-and-mcebo-dlamini': 'apartheid-the-nazis-and-mcebo-dlamini',
  // Add more mappings as needed
};

/**
 * Check if we have a known mapping for this legacy URL
 * @param {string} legacySlug - Legacy slug to check
 * @returns {string | null} Mapped current slug or null if not found
 */
export function getKnownMapping(legacySlug: string): string | null {
  return KNOWN_LEGACY_MAPPINGS[legacySlug] || null;
}