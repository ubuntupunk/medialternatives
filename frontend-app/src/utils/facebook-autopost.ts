/**
 * Utility function to auto-post a new article to Facebook
 * Can be called from post publishing workflows
 *
 * @param postSlug - The slug of the post to auto-post
 * @param customMessage - Optional custom message for the Facebook post
 * @returns Promise with the result
 */
export async function autoPostToFacebook(
  postSlug: string,
  customMessage?: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  try {
    const response = await fetch('/api/social/facebook/autopost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postSlug,
        customMessage,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        postUrl: data.postUrl,
      };
    } else {
      return {
        success: false,
        error: data.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if Facebook auto-posting is configured and enabled
 */
export async function isFacebookAutoPostEnabled(): Promise<boolean> {
  try {
    const response = await fetch('/api/social/facebook/autopost');
    const data = await response.json();
    return data.autoPostEnabled && data.facebookConfigured;
  } catch {
    return false;
  }
}