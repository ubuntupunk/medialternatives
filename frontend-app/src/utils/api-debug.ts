/**
 * API Debugging utilities for WordPress.com integration
 */

export interface APITestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
  status?: number;
}

/**
 * Test a single API endpoint
 */
export async function testEndpoint(url: string): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Testing endpoint: ${url}`);
    
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        endpoint: url,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        status: response.status
      };
    }
    
    const data = await response.json();
    
    console.log(`✅ Success: ${url} (${responseTime}ms)`);
    
    return {
      endpoint: url,
      success: true,
      data,
      responseTime,
      status: response.status
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`❌ Failed: ${url} - ${errorMessage}`);
    
    return {
      endpoint: url,
      success: false,
      error: errorMessage,
      responseTime
    };
  }
}

/**
 * Test multiple WordPress.com API endpoints
 */
export async function testWordPressEndpoints(siteUrl: string = 'davidrobertlewis5.wordpress.com'): Promise<APITestResult[]> {
  const baseUrl = `https://public-api.wordpress.com/wp/v2/sites/${siteUrl}`;
  const siteInfoUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${siteUrl}`;
  
  const endpoints = [
    siteInfoUrl,
    `${baseUrl}/posts?per_page=1`,
    `${baseUrl}/categories?per_page=1`,
    `${baseUrl}/tags?per_page=1`,
    `${baseUrl}/users`,
    `${baseUrl}/pages?per_page=1`
  ];
  
  console.log('🚀 Starting WordPress.com API tests...');
  
  const results: APITestResult[] = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('📊 API Test Summary:');
  console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  
  return results;
}

/**
 * Validate WordPress.com site setup
 */
export async function validateSiteSetup(siteUrl: string = 'davidrobertlewis5.wordpress.com'): Promise<{
  isSetup: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // Test site info endpoint
    const siteInfoResult = await testEndpoint(`https://public-api.wordpress.com/rest/v1.1/sites/${siteUrl}`);
    
    if (!siteInfoResult.success) {
      issues.push('Site is not accessible via WordPress.com API');
      recommendations.push('Verify the site exists at ' + siteUrl);
      recommendations.push('Check if the site is public (not private)');
      return { isSetup: false, issues, recommendations };
    }
    
    // Test posts endpoint
    const postsResult = await testEndpoint(`https://public-api.wordpress.com/wp/v2/sites/${siteUrl}/posts?per_page=1`);
    
    if (!postsResult.success) {
      issues.push('Posts endpoint is not accessible');
      recommendations.push('Ensure the site has at least one published post');
    }
    
    // Check if site has content
    if (postsResult.success && postsResult.data && Array.isArray(postsResult.data) && postsResult.data.length === 0) {
      issues.push('Site has no published posts');
      recommendations.push('Import content from the current WordPress site');
      recommendations.push('Create at least one test post to verify API functionality');
    }
    
    // Test categories endpoint
    const categoriesResult = await testEndpoint(`https://public-api.wordpress.com/wp/v2/sites/${siteUrl}/categories?per_page=1`);
    
    if (!categoriesResult.success) {
      issues.push('Categories endpoint is not accessible');
    }
    
    const isSetup = issues.length === 0;
    
    if (isSetup) {
      recommendations.push('Site setup looks good! You can proceed with component development.');
    }
    
    return { isSetup, issues, recommendations };
    
  } catch (error) {
    issues.push('Failed to validate site setup: ' + (error instanceof Error ? error.message : 'Unknown error'));
    recommendations.push('Check your internet connection');
    recommendations.push('Verify the WordPress.com site URL is correct');
    
    return { isSetup: false, issues, recommendations };
  }
}

/**
 * Generate API test report
 */
export function generateTestReport(results: APITestResult[]): string {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
  
  let report = '# WordPress.com API Test Report\n\n';
  
  report += `## Summary\n`;
  report += `- Total endpoints tested: ${results.length}\n`;
  report += `- Successful: ${successful.length}\n`;
  report += `- Failed: ${failed.length}\n`;
  report += `- Average response time: ${avgResponseTime.toFixed(0)}ms\n\n`;
  
  if (successful.length > 0) {
    report += `## ✅ Successful Endpoints\n`;
    successful.forEach(result => {
      report += `- ${result.endpoint} (${result.responseTime}ms)\n`;
    });
    report += '\n';
  }
  
  if (failed.length > 0) {
    report += `## ❌ Failed Endpoints\n`;
    failed.forEach(result => {
      report += `- ${result.endpoint}: ${result.error}\n`;
    });
    report += '\n';
  }
  
  return report;
}

/**
 * Log detailed API response for debugging
 */
export function logAPIResponse(endpoint: string, data: any): void {
  console.group(`📡 API Response: ${endpoint}`);
  
  if (Array.isArray(data)) {
    console.log(`📊 Array with ${data.length} items`);
    if (data.length > 0) {
      console.log('📝 First item:', data[0]);
    }
  } else if (typeof data === 'object' && data !== null) {
    console.log('📝 Object keys:', Object.keys(data));
    console.log('📝 Full object:', data);
  } else {
    console.log('📝 Data:', data);
  }
  
  console.groupEnd();
}