// WordPress.com API Response Types

/**
 * WordPress post object from WordPress.com REST API
 * @interface WordPressPost
 * @property {number} id - Unique post identifier
 * @property {string} date - Post creation date (local timezone)
 * @property {string} date_gmt - Post creation date (GMT)
 * @property {{rendered: string}} guid - Globally unique identifier
 * @property {string} modified - Post modification date (local timezone)
 * @property {string} modified_gmt - Post modification date (GMT)
 * @property {string} slug - Post URL slug
 * @property {'publish' | 'future' | 'draft' | 'pending' | 'private'} status - Post status
 * @property {string} type - Post type (usually 'post')
 * @property {string} link - Post permalink URL
 * @property {{rendered: string}} title - Post title with rendered HTML
 * @property {{rendered: string, protected: boolean}} content - Post content with rendered HTML
 * @property {{rendered: string, protected: boolean}} excerpt - Post excerpt with rendered HTML
 * @property {number} author - Author user ID
 * @property {number} featured_media - Featured image media ID
 * @property {'open' | 'closed'} comment_status - Comment status
 * @property {'open' | 'closed'} ping_status - Ping status
 * @property {boolean} sticky - Whether post is sticky
 * @property {string} template - Page template
 * @property {string} format - Post format
 * @property {Record<string, any>} meta - Post meta data
 * @property {number[]} categories - Array of category IDs
 * @property {number[]} tags - Array of tag IDs
 * @property {{author?: WordPressUser[], 'wp:featuredmedia'?: WordPressMedia[], 'wp:term'?: WordPressTerm[][]}} [_embedded] - Embedded related data
 */
export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: WordPressUser[];
    'wp:featuredmedia'?: WordPressMedia[];
    'wp:term'?: WordPressTerm[][];
  };
}

/**
 * WordPress user object from WordPress.com REST API
 * @interface WordPressUser
 * @property {number} id - Unique user identifier
 * @property {string} name - User's display name
 * @property {string} url - User's website URL
 * @property {string} description - User's bio/description
 * @property {string} link - User's profile page URL
 * @property {string} slug - User's URL slug
 * @property {{'24': string, '48': string, '96': string}} avatar_urls - Avatar URLs in different sizes
 * @property {string} [avatar_url] - Primary avatar URL
 * @property {Record<string, any>} meta - User meta data
 */
export interface WordPressUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    '24': string;
    '48': string;
    '96': string;
  };
  avatar_url?: string;
  meta: Record<string, any>;
}

/**
 * WordPress category object from WordPress.com REST API
 * @interface WordPressCategory
 * @property {number} id - Unique category identifier
 * @property {number} count - Number of posts in this category
 * @property {string} description - Category description
 * @property {string} link - Category archive page URL
 * @property {string} name - Category display name
 * @property {string} slug - Category URL slug
 * @property {'category'} taxonomy - Taxonomy type (always 'category')
 * @property {number} parent - Parent category ID (0 for top-level)
 * @property {Record<string, any>} meta - Category meta data
 */
export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'category';
  parent: number;
  meta: Record<string, any>;
}

/**
 * WordPress tag object from WordPress.com REST API
 * @interface WordPressTag
 * @property {number} id - Unique tag identifier
 * @property {number} count - Number of posts with this tag
 * @property {string} description - Tag description
 * @property {string} link - Tag archive page URL
 * @property {string} name - Tag display name
 * @property {string} slug - Tag URL slug
 * @property {'post_tag'} taxonomy - Taxonomy type (always 'post_tag')
 * @property {Record<string, any>} meta - Tag meta data
 */
export interface WordPressTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'post_tag';
  meta: Record<string, any>;
}

/**
 * WordPress media object from WordPress.com REST API
 * @interface WordPressMedia
 * @property {number} id - Unique media identifier
 * @property {string} date - Media upload date
 * @property {string} slug - Media URL slug
 * @property {'attachment'} type - Media type (always 'attachment')
 * @property {string} link - Media attachment page URL
 * @property {{rendered: string}} title - Media title with rendered HTML
 * @property {number} author - Author user ID
 * @property {'open' | 'closed'} comment_status - Comment status
 * @property {'open' | 'closed'} ping_status - Ping status
 * @property {string} template - Page template
 * @property {Record<string, any>} meta - Media meta data
 * @property {{rendered: string}} description - Media description with rendered HTML
 * @property {{rendered: string}} caption - Media caption with rendered HTML
 * @property {string} alt_text - Alt text for accessibility
 * @property {'image' | 'file'} media_type - Type of media file
 * @property {string} mime_type - MIME type of the file
 * @property {{width: number, height: number, file: string, sizes: Record<string, {file: string, width: number, height: number, mime_type: string, source_url: string}>, image_meta: Record<string, any>}} media_details - Detailed media information
 * @property {string} source_url - Direct URL to the media file
 */
export interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: 'attachment';
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: Record<string, any>;
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: 'image' | 'file';
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: Record<string, {
      file: string;
      width: number;
      height: number;
      mime_type: string;
      source_url: string;
    }>;
    image_meta: Record<string, any>;
  };
  source_url: string;
}

/**
 * WordPress taxonomy term object from WordPress.com REST API
 * @interface WordPressTerm
 * @property {number} id - Unique term identifier
 * @property {string} link - Term archive page URL
 * @property {string} name - Term display name
 * @property {string} slug - Term URL slug
 * @property {string} taxonomy - Taxonomy this term belongs to
 */
export interface WordPressTerm {
  id: number;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

/**
 * WordPress site information from WordPress.com REST API
 * @interface WordPressSiteInfo
 * @property {number} ID - Site identifier
 * @property {string} name - Site name
 * @property {string} description - Site description
 * @property {string} URL - Site URL
 * @property {boolean} jetpack - Whether Jetpack is active
 * @property {number} post_count - Total number of posts
 * @property {number} subscribers_count - Number of subscribers
 * @property {string} lang - Site language
 * @property {string} locale - Site locale
 * @property {{img: string, ico: string}} [icon] - Site icon information
 * @property {{id: number, sizes: Array<{name: string, width: number, height: number}>, url: string}} [logo] - Site logo information
 * @property {string} [header_image] - Header image URL
 * @property {boolean} is_private - Whether site is private
 * @property {boolean} is_following - Whether current user is following
 * @property {{timezone: string, gmt_offset: number, blog_public: number, admin_url: string, login_url: string, frame_nonce: string, unmapped_url: string, featured_images_enabled: boolean, theme_slug: string, header_image: string, background_color: string, image_default_link_type: string, image_thumbnail_width: number, image_thumbnail_height: number, image_thumbnail_crop: number, show_on_front: string, default_post_format: string, default_category: number, allowed_file_types: string[], show_avatars: boolean, default_avatar: string, avatar_rating: string, avatar_default: string, avatar_resize: boolean, markdown_supported: boolean, software_version: string, created_at: string, wordads_enabled: boolean, upgraded_filetypes_enabled: boolean, videopress_enabled: boolean}} options - Site options and settings
 * @property {{product_id: number, product_name: string, product_name_short: string, expired: boolean, user_is_owner: boolean}} plan - Site plan information
 * @property {{space_allowed: number, space_used: number, percent_used: number, space_available: number}} quota - Site storage quota information
 */
export interface WordPressSiteInfo {
  ID: number;
  name: string;
  description: string;
  URL: string;
  jetpack: boolean;
  post_count: number;
  subscribers_count: number;
  lang: string;
  locale: string;
  icon?: {
    img: string;
    ico: string;
  };
  logo?: {
    id: number;
    sizes: Array<{
      name: string;
      width: number;
      height: number;
    }>;
    url: string;
  };
  header_image?: string;
  is_private: boolean;
  is_following: boolean;
  options: {
    timezone: string;
    gmt_offset: number;
    blog_public: number;
    admin_url: string;
    login_url: string;
    frame_nonce: string;
    unmapped_url: string;
    featured_images_enabled: boolean;
    theme_slug: string;
    header_image: string;
    background_color: string;
    image_default_link_type: string;
    image_thumbnail_width: number;
    image_thumbnail_height: number;
    image_thumbnail_crop: number;
    show_on_front: string;
    default_post_format: string;
    default_category: number;
    allowed_file_types: string[];
    show_avatars: boolean;
    default_avatar: string;
    avatar_rating: string;
    avatar_default: string;
    avatar_resize: boolean;
    markdown_supported: boolean;
    software_version: string;
    created_at: string;
    wordads_enabled: boolean;
    upgraded_filetypes_enabled: boolean;
    videopress_enabled: boolean;
  };
  plan: {
    product_id: number;
    product_name: string;
    product_name_short: string;
    expired: boolean;
    user_is_owner: boolean;
  };
  quota: {
    space_allowed: number;
    space_used: number;
    percent_used: number;
    space_available: number;
  };
}

/**
 * Generic WordPress API response wrapper
 * @interface WordPressAPIResponse
 * @template T - The type of data returned
 * @property {T} data - Response data
 * @property {Record<string, string>} [headers] - Response headers
 * @property {number} status - HTTP status code
 */
export interface WordPressAPIResponse<T> {
  data: T;
  headers?: Record<string, string>;
  status: number;
}

/**
 * WordPress API error response
 * @interface WordPressAPIError
 * @property {string} code - Error code identifier
 * @property {string} message - Human-readable error message
 * @property {{status: number}} [data] - Additional error data including HTTP status
 */
export interface WordPressAPIError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

/**
 * Props for PostCard component
 * @interface PostCardProps
 * @property {WordPressPost} post - WordPress post data to display
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showExcerpt] - Whether to show post excerpt
 * @property {boolean} [showAuthor] - Whether to show author information
 * @property {boolean} [showDate] - Whether to show publication date
 */
export interface PostCardProps {
  post: WordPressPost;
  className?: string;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
}

/**
 * Props for CategoryCloud component
 * @interface CategoryCloudProps
 * @property {WordPressCategory[]} [categories] - Array of categories to display
 * @property {number} [maxFontSize] - Maximum font size for largest category
 * @property {number} [minFontSize] - Minimum font size for smallest category
 * @property {string} [className] - Additional CSS classes
 */
export interface CategoryCloudProps {
  categories?: WordPressCategory[];
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}

/**
 * Props for AuthorWidget component
 * @interface AuthorWidgetProps
 * @property {number} [authorId] - Author user ID to fetch data for
 * @property {WordPressUser} [author] - Pre-loaded author data
 * @property {string} [title] - Widget title
 * @property {boolean} [showSocialMenu] - Whether to show social media links
 */
export interface AuthorWidgetProps {
  authorId?: number;
  author?: WordPressUser;
  title?: string;
  showSocialMenu?: boolean;
}

/**
 * Props for Pagination component
 * @interface PaginationProps
 * @property {number} currentPage - Current active page number
 * @property {number} totalPages - Total number of pages available
 * @property {string} baseUrl - Base URL for pagination links
 * @property {string} [className] - Additional CSS classes
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

/**
 * Parameters for fetching posts from WordPress API
 * @interface GetPostsParams
 * @property {number} [page] - Page number for pagination
 * @property {number} [per_page] - Number of posts per page (max 100)
 * @property {number[]} [categories] - Filter by category IDs
 * @property {number[]} [tags] - Filter by tag IDs
 * @property {number} [author] - Filter by author ID
 * @property {string} [search] - Search query string
 * @property {'date' | 'relevance' | 'id' | 'include' | 'title' | 'slug'} [orderby] - Sort field
 * @property {'asc' | 'desc'} [order] - Sort direction
 * @property {boolean} [_embed] - Include embedded data (author, media, terms)
 */
export interface GetPostsParams {
  page?: number;
  per_page?: number;
  categories?: number[];
  tags?: number[];
  author?: number;
  search?: string;
  orderby?: 'date' | 'relevance' | 'id' | 'include' | 'title' | 'slug';
  order?: 'asc' | 'desc';
  _embed?: boolean;
}

/**
 * Parameters for fetching categories from WordPress API
 * @interface GetCategoriesParams
 * @property {number} [page] - Page number for pagination
 * @property {number} [per_page] - Number of categories per page (max 100)
 * @property {string} [search] - Search query string
 * @property {number[]} [exclude] - Category IDs to exclude
 * @property {number[]} [include] - Category IDs to include
 * @property {'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count'} [orderby] - Sort field
 * @property {'asc' | 'desc'} [order] - Sort direction
 * @property {boolean} [hide_empty] - Hide categories with no posts
 * @property {number} [parent] - Filter by parent category ID
 */
export interface GetCategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
  parent?: number;
}

/**
 * Pagination information for API responses
 * @interface PaginationInfo
 * @property {number} total - Total number of items
 * @property {number} totalPages - Total number of pages
 * @property {number} currentPage - Current page number
 * @property {number} perPage - Items per page
 * @property {boolean} hasNext - Whether there is a next page
 * @property {boolean} hasPrev - Whether there is a previous page
 * @property {number} [nextPage] - Next page number
 * @property {number} [prevPage] - Previous page number
 */
export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

/**
 * API response with pagination information
 * @interface PaginationResponse
 * @template T - The type of data returned
 * @property {T} data - Response data
 * @property {PaginationInfo} pagination - Pagination metadata
 */
export interface PaginationResponse<T> {
  data: T;
  pagination: PaginationInfo;
}

/**
 * API response with full headers for pagination extraction
 * @interface APIResponseWithHeaders
 * @template T - The type of data returned
 * @property {T} data - Response data
 * @property {Headers} headers - Response headers for pagination info
 */
export interface APIResponseWithHeaders<T> {
  data: T;
  headers: Headers;
}