/**
 * Upload image to WordPress.com media library
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<{id: number, url: string}>} Media upload result
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function uploadToWordPressMedia(imageData: string): Promise<{ id: number; url: string }> {
  // TODO: Implement WordPress.com media upload
  // This would require:
  // 1. WordPress.com API authentication (OAuth or API key)
  // 2. Convert base64 to file upload
  // 3. POST to /wp/v2/media endpoint

  throw new Error('WordPress.com media upload not implemented yet');
}

/**
 * Update WordPress post with new featured media
 * @param {number} postId - WordPress post ID
 * @param {number} mediaId - WordPress media ID
 * @returns {Promise<boolean>} Update success status
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateWordPressPost(postId: number, mediaId: number): Promise<boolean> {
  // TODO: Implement WordPress.com post update
  // This would require:
  // 1. WordPress.com API authentication
  // 2. PATCH to /wp/v2/posts/{id} with featured_media field

  throw new Error('WordPress.com post update not implemented yet');
}