import { redirect } from 'next/navigation';

/**
 * Specific redirect for the problematic URL
 * This ensures the exact URL works while we debug the dynamic route
 */
export default function SpecificLegacyPost() {
  // Direct redirect to the clean URL
  redirect('/apartheid-the-nazis-and-mcebo-dlamini');
}

export function generateMetadata() {
  return {
    title: 'Redirecting...',
    robots: {
      index: false,
      follow: false,
    },
  };
}