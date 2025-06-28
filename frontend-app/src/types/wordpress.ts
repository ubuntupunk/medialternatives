// WordPress.com API Response Types

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

export interface WordPressTerm {
  id: number;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

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

// API Response wrapper types
export interface WordPressAPIResponse<T> {
  data: T;
  headers?: Record<string, string>;
  status: number;
}

export interface WordPressAPIError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

// Component prop types
export interface PostCardProps {
  post: WordPressPost;
  className?: string;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
}

export interface CategoryCloudProps {
  categories?: WordPressCategory[];
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}

export interface AuthorWidgetProps {
  authorId?: number;
  author?: WordPressUser;
  title?: string;
  showSocialMenu?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

// API service types
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

// Pagination interfaces
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

export interface PaginationResponse<T> {
  data: T;
  pagination: PaginationInfo;
}

// Enhanced API response with pagination headers
export interface APIResponseWithHeaders<T> {
  data: T;
  headers: Headers;
}