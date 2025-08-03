import { redirect } from 'next/navigation';
import { wordpressApi } from '@/services/wordpress-api';
import { findPostByLegacyUrl, getKnownMapping } from '@/utils/legacyUrlMatcher';

interface DateBasedPostPageProps {
  params: {
    year: string;
    month: string;
    day: string;
    slug: string;
  };
}

/**
 * Handle legacy date-based URLs from WordPress.com
 * Format: /2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/
 * Redirects to clean URL: /apartheid-the-nazis-and-mcebo-dlamini
 */
export default async function DateBasedPostPage({ params }: DateBasedPostPageProps) {
  const { year, month, day, slug } = params;
  
  console.log(`Processing legacy URL: /${year}/${month}/${day}/${slug}/`);
  
  try {
    // First, check if we have a known mapping
    const knownMapping = getKnownMapping(slug);
    if (knownMapping) {
      console.log(`Found known mapping: ${slug} -> ${knownMapping}`);
      redirect(`/${knownMapping}`);
    }
    
    // Use comprehensive matching strategy
    const match = await findPostByLegacyUrl(year, month, day, slug);
    
    if (match) {
      console.log(`Found match with ${match.confidence}% confidence using ${match.strategy}: ${match.post.slug}`);
      
      // Redirect to the clean URL
      redirect(`/${match.post.slug}`);
    }
    
    // If no match found, try a final search with the original slug
    console.log(`No match found, trying final search for: ${slug}`);
    const searchTerms = slug.replace(/-/g, ' ');
    redirect(`/search?q=${encodeURIComponent(searchTerms)}&legacy=true`);
    
  } catch (error) {
    console.error('Error handling date-based URL:', error);
    
    // Fallback: redirect to blog page with search
    const searchTerms = slug.replace(/-/g, ' ');
    redirect(`/search?q=${encodeURIComponent(searchTerms)}&error=legacy_lookup_failed`);
  }
}

/**
 * Generate metadata for the redirect page
 */
export async function generateMetadata({ params }: { params: { year: string; month: string; day: string; slug: string } }) {
  return {
    title: 'Redirecting...',
    robots: {
      index: false,
      follow: false,
    },
  };
}