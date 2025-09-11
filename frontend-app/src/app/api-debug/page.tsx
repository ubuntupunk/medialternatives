'use client';

import { useEffect, useState } from 'react';
import { wordpressApi } from '@/services/wordpress-api';

export default function ApiDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('[API DEBUG] Starting API test...');
        
        // Test direct API call
        const apiUrl = 'https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/posts?per_page=1&_embed=true';
        console.log('[API DEBUG] Direct API URL:', apiUrl);
        
        const directResponse = await fetch(apiUrl);
        const directData = await directResponse.json();
        console.log('[API DEBUG] Direct API response:', directData);
        
        // Test through our service
        const posts = await wordpressApi.getPosts({ per_page: 1, _embed: true });
        console.log('[API DEBUG] Service response:', posts);
        
        // Test getPost method
        if (posts && posts.length > 0) {
          const firstPostSlug = posts[0].slug;
          console.log('[API DEBUG] Testing getPost with slug:', firstPostSlug);
          const singlePost = await wordpressApi.getPost(firstPostSlug);
          console.log('[API DEBUG] getPost response:', singlePost);
        }
        
        setDebugInfo({
          directData: directData[0] || directData,
          serviceData: posts[0] || posts,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('[API DEBUG] Error:', error);
        setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  if (loading) {
    return <div>Loading API debug info...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>API Debug Information</h1>
      <div className="mt-4">
        <h2>Debug Results</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      <div className="mt-4">
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
}