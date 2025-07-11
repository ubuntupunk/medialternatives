// Debug patch for getPostAuthor helper function
// Replace lines 117-119 in helpers.ts with:

export function getPostAuthor(post: WordPressPost) {
  console.log('[DEBUG] getPostAuthor called with post:', {
    id: post.id,
    title: post.title.rendered,
    author: post.author,
    hasEmbedded: !!post._embedded,
    embeddedKeys: post._embedded ? Object.keys(post._embedded) : [],
    embeddedAuthor: post._embedded?.author
  });
  
  const author = post._embedded?.author?.[0] || null;
  console.log('[DEBUG] Extracted author:', author);
  
  return author;
}