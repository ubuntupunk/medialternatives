import { WordPressPost, WordPressCategory } from '@/types/wordpress';

export const mockPosts: WordPressPost[] = [
  {
    id: 1,
    date: '2023-06-15T12:00:00',
    date_gmt: '2023-06-15T12:00:00',
    guid: { rendered: 'https://example.com/?p=1' },
    modified: '2023-06-15T12:00:00',
    modified_gmt: '2023-06-15T12:00:00',
    slug: 'hello-world',
    status: 'publish',
    type: 'post',
    link: 'https://example.com/hello-world',
    title: { rendered: 'Hello World' },
    content: { rendered: '<p>This is the full content of the post.</p>', protected: false },
    excerpt: { rendered: '<p>This is a sample post excerpt.</p>', protected: false },
    author: 1,
    featured_media: 1,
    comment_status: 'open',
    ping_status: 'open',
    sticky: false,
    template: '',
    format: 'standard',
    meta: {},
    categories: [1],
    tags: [],
    _embedded: {
      author: [{
        id: 1,
        name: 'Admin',
        url: '',
        description: 'Site administrator',
        link: 'https://example.com/author/admin',
        slug: 'admin',
        avatar_urls: { '24': '', '48': '', '96': '' },
        meta: {}
      }],
      'wp:featuredmedia': [{
        id: 1,
        date: '2023-06-15T12:00:00',
        slug: 'featured-image',
        type: 'attachment',
        link: 'https://placeholder.co/800x400',
        title: { rendered: 'Featured Image' },
        author: 1,
        comment_status: 'open',
        ping_status: 'closed',
        template: '',
        meta: {},
        description: { rendered: '' },
        caption: { rendered: '' },
        alt_text: '',
        media_type: 'image',
        mime_type: 'image/jpeg',
        media_details: {
          width: 800,
          height: 400,
          file: 'featured-image.jpg',
          sizes: {},
          image_meta: {}
        },
        source_url: 'https://placeholder.co/800x400'
      }]
    }
  },
  {
    id: 2,
    date: '2023-06-10T10:00:00',
    date_gmt: '2023-06-10T10:00:00',
    guid: { rendered: 'https://example.com/?p=2' },
    modified: '2023-06-10T10:00:00',
    modified_gmt: '2023-06-10T10:00:00',
    slug: 'getting-started',
    status: 'publish',
    type: 'post',
    link: 'https://example.com/getting-started',
    title: { rendered: 'Getting Started with Next.js' },
    content: { rendered: '<p>This is the full content about getting started with Next.js.</p>', protected: false },
    excerpt: { rendered: '<p>Learn how to get started with Next.js.</p>', protected: false },
    author: 1,
    featured_media: 2,
    comment_status: 'open',
    ping_status: 'open',
    sticky: false,
    template: '',
    format: 'standard',
    meta: {},
    categories: [1, 2],
    tags: [1],
    _embedded: {
      author: [{
        id: 1,
        name: 'Admin',
        url: '',
        description: 'Site administrator',
        link: 'https://example.com/author/admin',
        slug: 'admin',
        avatar_urls: { '24': '', '48': '', '96': '' },
        meta: {}
      }],
      'wp:featuredmedia': [{
        id: 2,
        date: '2023-06-10T10:00:00',
        slug: 'featured-image-2',
        type: 'attachment',
        link: 'https://placeholder.co/800x400',
        title: { rendered: 'Featured Image 2' },
        author: 1,
        comment_status: 'open',
        ping_status: 'closed',
        template: '',
        meta: {},
        description: { rendered: '' },
        caption: { rendered: '' },
        alt_text: '',
        media_type: 'image',
        mime_type: 'image/jpeg',
        media_details: {
          width: 800,
          height: 400,
          file: 'featured-image-2.jpg',
          sizes: {},
          image_meta: {}
        },
        source_url: 'https://placeholder.co/800x400'
      }]
    }
  }
];

export const mockCategories: WordPressCategory[] = [
  {
    id: 1,
    count: 15,
    description: 'Technology related posts',
    link: 'https://example.com/category/technology',
    name: 'Technology',
    slug: 'technology',
    taxonomy: 'category',
    parent: 0,
    meta: {}
  },
  {
    id: 2,
    count: 8,
    description: 'Design related posts',
    link: 'https://example.com/category/design',
    name: 'Design',
    slug: 'design',
    taxonomy: 'category',
    parent: 0,
    meta: {}
  },
  {
    id: 3,
    count: 12,
    description: 'Development related posts',
    link: 'https://example.com/category/development',
    name: 'Development',
    slug: 'development',
    taxonomy: 'category',
    parent: 0,
    meta: {}
  }
];