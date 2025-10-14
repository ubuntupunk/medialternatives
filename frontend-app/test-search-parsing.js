// Test script to verify search API response parsing
const mockAPIResponse = {
  success: true,
  data: [
    {
      ID: 123,
      title: "Test Post",
      excerpt: "Test excerpt",
      slug: "test-post",
      type: "post",
      date: "2023-01-01"
    }
  ]
};

// Simulate the parsing logic from SearchWidget.tsx
const data = mockAPIResponse.success ? mockAPIResponse.data : mockAPIResponse;

const searchResults = data.map((item) => {
  const post = item;
  return {
    id: post.ID,
    title: post.title,
    excerpt: post.excerpt || '',
    link: `/${post.slug}`,
    type: post.type === 'page' ? 'page' : 'post',
    date: post.date
  };
});

console.log('Parsed search results:', searchResults);

// Test with direct array response (fallback case)
const mockDirectResponse = [
  {
    ID: 456,
    title: "Direct Test Post",
    excerpt: "Direct excerpt",
    slug: "direct-test-post",
    type: "post",
    date: "2023-01-02"
  }
];

const data2 = mockDirectResponse.success ? mockDirectResponse.data : mockDirectResponse;
const searchResults2 = data2.map((item) => {
  const post = item;
  return {
    id: post.ID,
    title: post.title,
    excerpt: post.excerpt || '',
    link: `/${post.slug}`,
    type: post.type === 'page' ? 'page' : 'post',
    date: post.date
  };
});

console.log('Parsed direct results:', searchResults2);