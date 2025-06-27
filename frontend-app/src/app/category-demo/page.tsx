import React from 'react';
import CategoryCloud from '@/components/Widgets/CategoryCloud';
import CategoryCloudEnhanced from '@/components/Widgets/CategoryCloudEnhanced';
import CategoryList from '@/components/Widgets/CategoryList';
import CategoryPills from '@/components/Widgets/CategoryPills';
import CategoryCards from '@/components/Widgets/CategoryCards';
import { wordpressApi } from '@/services/wordpress-api';
import { WordPressCategory } from '@/types/wordpress';

/**
 * Demo page to showcase different category widget styles
 * Accessible via /category-demo
 */
export default async function CategoryDemoPage() {
  let categories: WordPressCategory[] = [];
  let error: string | null = null;

  try {
    // Fetch categories for demo
    categories = await wordpressApi.getCategories({
      per_page: 20,
      orderby: 'count',
      order: 'desc'
    });
  } catch (err) {
    console.error('Error fetching categories for demo:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching categories';
    
    // Fallback mock categories for demo
    categories = [
      { id: 1, name: 'Politics', slug: 'politics', count: 25, description: 'Political news and analysis', link: '', taxonomy: 'category', parent: 0, meta: [] },
      { id: 2, name: 'Environment', slug: 'environment', count: 18, description: 'Environmental issues and climate change', link: '', taxonomy: 'category', parent: 0, meta: [] },
      { id: 3, name: 'Technology', slug: 'technology', count: 15, description: 'Tech news and digital rights', link: '', taxonomy: 'category', parent: 0, meta: [] },
      { id: 4, name: 'Media', slug: 'media', count: 12, description: 'Media analysis and journalism', link: '', taxonomy: 'category', parent: 0, meta: [] },
      { id: 5, name: 'Human Rights', slug: 'human-rights', count: 10, description: 'Human rights advocacy', link: '', taxonomy: 'category', parent: 0, meta: [] },
      { id: 6, name: 'Education', slug: 'education', count: 8, description: 'Educational resources and policy', link: '', taxonomy: 'category', parent: 0, meta: [] },
      { id: 7, name: 'Health', slug: 'health', count: 6, description: 'Health and wellness topics', link: '', taxonomy: 'category', parent: 0, meta: [] },
      { id: 8, name: 'Economics', slug: 'economics', count: 5, description: 'Economic analysis and policy', link: '', taxonomy: 'category', parent: 0, meta: [] },
    ];
  }

  return (
    <>
      <div className="category-demo-page">
        <h1 className="mb-4">Category Widget Demo</h1>
        <p className="lead mb-5">
          Explore different category widget styles and choose the ones that work best for your site.
        </p>

        {error && (
          <div className="alert alert-warning mb-4">
            <strong>API Error:</strong> {error}
            <p>Displaying mock categories for demo purposes.</p>
          </div>
        )}

        {/* Current CategoryCloud Widget */}
        <section className="mb-5">
          <h2 className="h3 mb-3">1. Current CategoryCloud Widget</h2>
          <p className="text-muted mb-3">
            Your existing beautiful tag cloud with dynamic font sizing and 9-color cycling system.
          </p>
          <div className="border p-4 bg-light rounded">
            <CategoryCloud categories={categories} />
          </div>
        </section>

        {/* Enhanced CategoryCloud Widget */}
        <section className="mb-5">
          <h2 className="h3 mb-3">2. Enhanced CategoryCloud Widget</h2>
          <p className="text-muted mb-3">
            Enhanced version with active states, hover effects, and optional post counts.
          </p>
          <div className="border p-4 bg-light rounded">
            <CategoryCloudEnhanced 
              categories={categories} 
              activeCategory="politics"
              showCounts={true}
            />
          </div>
        </section>

        {/* Bootstrap List Style */}
        <section className="mb-5">
          <h2 className="h3 mb-3">3. Bootstrap List Style</h2>
          <p className="text-muted mb-3">
            Clean, accessible list format with Bootstrap styling and post count badges.
          </p>
          <div className="border p-4 bg-light rounded">
            <CategoryList 
              categories={categories} 
              activeCategory="environment"
              showCounts={true}
            />
          </div>
        </section>

        {/* Filter Pills Style */}
        <section className="mb-5">
          <h2 className="h3 mb-3">4. Filter Pills Style</h2>
          <p className="text-muted mb-3">
            Horizontal filter bar using Bootstrap nav pills - great for main content areas.
          </p>
          <div className="border p-4 bg-light rounded">
            <CategoryPills 
              categories={categories.slice(0, 6)} 
              activeCategory="technology"
              layout="horizontal"
            />
          </div>
          <div className="border p-4 bg-light rounded mt-3">
            <h6>Vertical Layout:</h6>
            <CategoryPills 
              categories={categories.slice(0, 5)} 
              activeCategory="media"
              layout="vertical"
            />
          </div>
        </section>

        {/* Card Grid Style */}
        <section className="mb-5">
          <h2 className="h3 mb-3">5. Card Grid Style</h2>
          <p className="text-muted mb-3">
            Modern card-based layout - perfect for dedicated category pages.
          </p>
          <div className="border p-4 bg-light rounded">
            <CategoryCards 
              categories={categories.slice(0, 6)} 
              columns={3}
              showDescriptions={true}
            />
          </div>
          <div className="border p-4 bg-light rounded mt-3">
            <h6>2-Column Layout (without descriptions):</h6>
            <CategoryCards 
              categories={categories.slice(0, 4)} 
              columns={2}
              showDescriptions={false}
            />
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-5">
          <h2 className="h3 mb-3">Widget Comparison</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Widget</th>
                  <th>Visual Style</th>
                  <th>Space Usage</th>
                  <th>Mobile Friendly</th>
                  <th>Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CategoryCloud</strong></td>
                  <td>Tag cloud with colors</td>
                  <td>Compact</td>
                  <td>Fair</td>
                  <td>Sidebar widget</td>
                </tr>
                <tr>
                  <td><strong>CategoryCloudEnhanced</strong></td>
                  <td>Tag cloud + active states</td>
                  <td>Compact</td>
                  <td>Good</td>
                  <td>Sidebar widget</td>
                </tr>
                <tr>
                  <td><strong>CategoryList</strong></td>
                  <td>Clean list with badges</td>
                  <td>Vertical</td>
                  <td>Excellent</td>
                  <td>Sidebar widget</td>
                </tr>
                <tr>
                  <td><strong>CategoryPills</strong></td>
                  <td>Horizontal pills</td>
                  <td>Horizontal</td>
                  <td>Good</td>
                  <td>Header/Filter bar</td>
                </tr>
                <tr>
                  <td><strong>CategoryCards</strong></td>
                  <td>Card grid layout</td>
                  <td>Grid layout</td>
                  <td>Good</td>
                  <td>Main content area</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Implementation Notes */}
        <section className="mb-5">
          <h2 className="h3 mb-3">Implementation Notes</h2>
          <div className="row">
            <div className="col-md-6">
              <h4 className="h5">Recommended Usage</h4>
              <ul>
                <li><strong>Sidebar:</strong> CategoryCloud (current) or CategoryList</li>
                <li><strong>Header Navigation:</strong> CategoryPills (horizontal)</li>
                <li><strong>Main Content:</strong> CategoryCards or CategoryPills</li>
                <li><strong>Category Pages:</strong> Any style works</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h4 className="h5">Style Preservation</h4>
              <ul>
                <li>Your 9-color system is preserved in enhanced version</li>
                <li>Bootstrap styles can be customized to match your theme</li>
                <li>All widgets support active state highlighting</li>
                <li>Responsive design built-in</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="text-center mt-5">
          <a href="/blog" className="btn btn-primary me-3">
            View Blog
          </a>
          <a href="/components" className="btn btn-outline-secondary">
            Back to Components Demo
          </a>
        </div>
      </div>
    </>
  );
}