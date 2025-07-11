// Debug patch for getPost method
// Replace lines 269-280 in wordpress-api.ts with:

async getPost(slug: string): Promise<WordPressPost | null> {
  try {
    console.log('[DEBUG] Fetching post with slug:', slug);
    console.log('[DEBUG] API URL:', `${this.baseUrl}/posts`);
    console.log('[DEBUG] Parameters:', { slug, _embed: true });
    
    const posts = await this.fetchWithCache<WordPressPost[]>(
      `${this.baseUrl}/posts`,
      { slug, _embed: true }
    );
    
    if (posts.length > 0) {
      const post = posts[0];
      console.log('[DEBUG] Post data received:', {
        id: post.id,
        title: post.title.rendered,
        author: post.author,
        hasEmbedded: !!post._embedded,
        embeddedKeys: post._embedded ? Object.keys(post._embedded) : [],
        embeddedAuthor: post._embedded?.author
      });
      console.log('[DEBUG] Full post object:', post);
      return post;
    }
    
    console.log('[DEBUG] No posts found for slug:', slug);
    return null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}