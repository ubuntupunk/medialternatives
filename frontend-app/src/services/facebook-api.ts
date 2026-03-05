import * as FB from 'fb';
import { SITE_CONFIG } from '@/lib/constants';
// @ts-ignore
const FB = require('fb');

export interface FacebookPostContent {
  message?: string;
  link?: string;
  picture?: string;
  name?: string;
  description?: string;
}

export interface FacebookPost {
  id: string;
  message?: string;
  link?: string;
  picture?: string;
  created_time: string;
  updated_time: string;
}

export interface WordPressPostForFacebook {
  id: number;
  title: string;
  excerpt: string;
  link: string;
  featuredImage?: string;
}

/**
 * Facebook API Service
 *
 * Handles all Facebook Page API interactions including posting,
 * getting posts, and managing page content.
 */
class FacebookApiService {
  private pageId: string;
  private accessToken: string;
  private fb: typeof FB;

  constructor() {
    this.pageId = process.env.FACEBOOK_PAGE_ID || '';
    this.accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';

    if (!this.pageId || !this.accessToken) {
      console.warn('Facebook API not configured. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN environment variables.');
    }

    // Initialize Facebook SDK
    FB.options({
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      accessToken: this.accessToken,
      version: 'v18.0'
    });

    this.fb = FB;
  }

  /**
   * Check if Facebook API is properly configured
   */
  isConfigured(): boolean {
    return !!(this.pageId && this.accessToken);
  }

  /**
   * Get post data formatted for Facebook from WordPress post ID
   */
  async getPostForFacebook(postId: number): Promise<WordPressPostForFacebook | null> {
    try {
      // Import wordpressApi here to avoid circular dependencies
      const { wordpressApi } = await import('@/services/wordpress-api');

      const post = await wordpressApi.getPostById(postId);

      if (!post) return null;

      // Get featured image
      const { getFeaturedImageUrl } = await import('@/utils/helpers');
      const featuredImage = getFeaturedImageUrl(post) || undefined;

      return {
        id: post.id,
        title: post.title.rendered,
        excerpt: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 200) || post.title.rendered,
        link: post.link,
        featuredImage
      };
    } catch (error) {
      console.error('Error getting post for Facebook:', error);
      return null;
    }
  }

  /**
   * Post content to Facebook page
   */
  async postToPage(
    content: FacebookPostContent,
    scheduledTime?: string
  ): Promise<{ id: string }> {
    if (!this.isConfigured()) {
      throw new Error('Facebook API not configured');
    }

    const postData: any = {
      access_token: this.accessToken
    };

    // Add content fields
    if (content.message) postData.message = content.message;
    if (content.link) postData.link = content.link;
    if (content.picture) postData.picture = content.picture;
    if (content.name) postData.name = content.name;
    if (content.description) postData.description = content.description;

    // Handle scheduling
    if (scheduledTime) {
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate > new Date()) {
        postData.scheduled_publish_time = Math.floor(scheduledDate.getTime() / 1000);
        postData.published = false;
      }
    }

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.fb.api(`/${this.pageId}/feed`, 'post', postData, (res: any) => {
          if (!res || res.error) {
            reject(res?.error || new Error('Facebook API error'));
          } else {
            resolve(res);
          }
        });
      });

      return { id: response.id };
    } catch (error) {
      console.error('Facebook posting error:', error);
      throw error;
    }
  }

  /**
   * Get recent posts from Facebook page
   */
  async getRecentPosts(limit: number = 10): Promise<FacebookPost[]> {
    if (!this.isConfigured()) {
      throw new Error('Facebook API not configured');
    }

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.fb.api(
          `/${this.pageId}/posts`,
          'get',
          {
            access_token: this.accessToken,
            limit,
            fields: 'id,message,link,picture,created_time,updated_time'
          },
          (res: any) => {
            if (!res || res.error) {
              reject(res?.error || new Error('Facebook API error'));
            } else {
              resolve(res);
            }
          }
        );
      });

      return response.data || [];
    } catch (error) {
      console.error('Error getting Facebook posts:', error);
      throw error;
    }
  }

  /**
   * Get Facebook page information
   */
  async getPageInfo(): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Facebook API not configured');
    }

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.fb.api(
          `/${this.pageId}`,
          'get',
          {
            access_token: this.accessToken,
            fields: 'id,name,about,category,website,link'
          },
          (res: any) => {
            if (!res || res.error) {
              reject(res?.error || new Error('Facebook API error'));
            } else {
              resolve(res);
            }
          }
        );
      });

      return response;
    } catch (error) {
      console.error('Error getting Facebook page info:', error);
      throw error;
    }
  }

  /**
   * Delete a post from Facebook page
   */
  async deletePost(postId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Facebook API not configured');
    }

    try {
      await new Promise<any>((resolve, reject) => {
        this.fb.api(`/${postId}`, 'delete', { access_token: this.accessToken }, (res: any) => {
          if (!res || res.error) {
            reject(res?.error || new Error('Facebook API error'));
          } else {
            resolve(res);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('Error deleting Facebook post:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const facebookApi = new FacebookApiService();