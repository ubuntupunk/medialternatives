import { promises as fs } from 'fs';
import path from 'path';

/**
 * API Review and Deprecation Management System
 * Handles API change management, deprecation workflows, and migration guidance
 */

export interface APIChange {
  id: string;
  type: 'breaking' | 'enhancement' | 'deprecation' | 'removal';
  title: string;
  description: string;
  affectedEndpoints: string[];
  breaking: boolean;
  migrationGuide?: string;
  alternatives?: string[];
  createdAt: string;
  effectiveDate: string;
  reviewedBy: string;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface DeprecationNotice {
  endpoint: string;
  deprecatedIn: string;
  sunsetDate: string;
  alternative?: string;
  migrationGuide?: string;
  noticePosted: string;
}

export interface APIReview {
  id: string;
  title: string;
  description: string;
  changes: APIChange[];
  reviewers: string[];
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'implemented';
  createdAt: string;
  reviewedAt?: string;
  implementedAt?: string;
}

/**
 * API Review Manager
 */
export class APIReviewManager {
  private reviews: Map<string, APIReview> = new Map();
  private changes: APIChange[] = [];
  private deprecations: DeprecationNotice[] = [];

  /**
   * Create a new API review
   */
  createReview(review: Omit<APIReview, 'id' | 'createdAt' | 'status'>): string {
    const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReview: APIReview = {
      ...review,
      id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    this.reviews.set(id, newReview);
    return id;
  }

  /**
   * Submit review for approval
   */
  submitForReview(reviewId: string): boolean {
    const review = this.reviews.get(reviewId);
    if (!review || review.status !== 'draft') {
      return false;
    }

    review.status = 'in_review';
    return true;
  }

  /**
   * Approve API review
   */
  approveReview(reviewId: string, reviewer: string): boolean {
    const review = this.reviews.get(reviewId);
    if (!review || review.status !== 'in_review') {
      return false;
    }

    review.status = 'approved';
    review.reviewedAt = new Date().toISOString();
    review.reviewers.push(reviewer);

    // Process approved changes
    this.processApprovedChanges(review.changes);

    return true;
  }

  /**
   * Implement approved changes
   */
  implementChanges(reviewId: string): boolean {
    const review = this.reviews.get(reviewId);
    if (!review || review.status !== 'approved') {
      return false;
    }

    review.status = 'implemented';
    review.implementedAt = new Date().toISOString();

    return true;
  }

  /**
   * Process approved changes
   */
  private processApprovedChanges(changes: APIChange[]): void {
    changes.forEach(change => {
      this.changes.push(change);

      // Handle deprecations
      if (change.type === 'deprecation') {
        change.affectedEndpoints.forEach(endpoint => {
          const deprecation: DeprecationNotice = {
            endpoint,
            deprecatedIn: change.effectiveDate,
            sunsetDate: new Date(new Date(change.effectiveDate).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days
            alternative: change.alternatives?.[0],
            migrationGuide: change.migrationGuide,
            noticePosted: new Date().toISOString()
          };
          this.deprecations.push(deprecation);
        });
      }
    });
  }

  /**
   * Get deprecation notices for endpoint
   */
  getDeprecationNotice(endpoint: string): DeprecationNotice | null {
    return this.deprecations.find(d => d.endpoint === endpoint) || null;
  }

  /**
   * Check if endpoint is deprecated
   */
  isEndpointDeprecated(endpoint: string): boolean {
    const deprecation = this.getDeprecationNotice(endpoint);
    return deprecation !== null;
  }

  /**
   * Get all active deprecation notices
   */
  getActiveDeprecations(): DeprecationNotice[] {
    const now = new Date();
    return this.deprecations.filter(d => new Date(d.sunsetDate) > now);
  }

  /**
   * Generate deprecation warning response
   */
  generateDeprecationWarning(endpoint: string): any {
    const deprecation = this.getDeprecationNotice(endpoint);
    if (!deprecation) return null;

    const daysUntilSunset = Math.ceil(
      (new Date(deprecation.sunsetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      type: 'deprecation_warning',
      endpoint,
      deprecatedIn: deprecation.deprecatedIn,
      sunsetDate: deprecation.sunsetDate,
      daysUntilSunset,
      alternative: deprecation.alternative,
      migrationGuide: deprecation.migrationGuide,
      message: `Endpoint ${endpoint} is deprecated and will be removed on ${deprecation.sunsetDate}. ${deprecation.alternative ? `Use ${deprecation.alternative} instead.` : ''}`
    };
  }

  /**
   * Get API change history
   */
  getChangeHistory(endpoint?: string): APIChange[] {
    if (endpoint) {
      return this.changes.filter(change =>
        change.affectedEndpoints.includes(endpoint)
      );
    }
    return [...this.changes];
  }

  /**
   * Generate migration guide
   */
  generateMigrationGuide(): string {
    const activeDeprecations = this.getActiveDeprecations();

    if (activeDeprecations.length === 0) {
      return '# API Migration Guide\n\nNo active deprecations at this time.';
    }

    let guide = '# API Migration Guide\n\n';
    guide += `Generated on ${new Date().toISOString()}\n\n`;

    activeDeprecations.forEach((deprecation, index) => {
      guide += `## ${index + 1}. ${deprecation.endpoint}\n\n`;
      guide += `- **Deprecated In**: ${deprecation.deprecatedIn}\n`;
      guide += `- **Sunset Date**: ${deprecation.sunsetDate}\n`;

      if (deprecation.alternative) {
        guide += `- **Alternative**: ${deprecation.alternative}\n`;
      }

      if (deprecation.migrationGuide) {
        guide += `- **Migration Guide**: ${deprecation.migrationGuide}\n`;
      }

      guide += '\n';
    });

    guide += '## Migration Timeline\n\n';
    guide += '1. **Immediate**: Update client applications to use new endpoints\n';
    guide += '2. **Before Sunset Date**: Complete migration and testing\n';
    guide += '3. **After Sunset Date**: Deprecated endpoints will return 410 Gone\n\n';

    guide += '## Support\n\n';
    guide += 'For migration assistance, contact: support@medialternatives.com\n';

    return guide;
  }

  /**
   * Export review data
   */
  exportReviewData(): any {
    return {
      reviews: Array.from(this.reviews.values()),
      changes: this.changes,
      deprecations: this.deprecations,
      activeDeprecations: this.getActiveDeprecations(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Save review data to file
   */
  async saveToFile(filePath: string): Promise<void> {
    const data = this.exportReviewData();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Load review data from file
   */
  async loadFromFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);

      // Restore reviews
      this.reviews.clear();
      parsed.reviews?.forEach((review: APIReview) => {
        this.reviews.set(review.id, review);
      });

      // Restore changes and deprecations
      this.changes = parsed.changes || [];
      this.deprecations = parsed.deprecations || [];

    } catch (error) {
      console.error('Error loading review data:', error);
    }
  }
}

// Global instance
export const apiReviewManager = new APIReviewManager();

/**
 * Middleware to check for deprecated endpoints
 */
export function withDeprecationCheck(
  handler: (request: any) => Promise<any>
) {
  return async (request: any) => {
    const url = new URL(request.url);
    const endpoint = url.pathname;

    if (apiReviewManager.isEndpointDeprecated(endpoint)) {
      const warning = apiReviewManager.generateDeprecationWarning(endpoint);

      // Add deprecation headers
      const response = await handler(request);

      if (warning) {
        response.headers.set('X-API-Deprecated', 'true');
        response.headers.set('X-API-Deprecation-Message', warning.message);
        response.headers.set('X-API-Sunset-Date', warning.sunsetDate);

        if (warning.alternative) {
          response.headers.set('X-API-Alternative', warning.alternative);
        }
      }

      return response;
    }

    return handler(request);
  };
}