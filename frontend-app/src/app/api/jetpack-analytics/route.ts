import { NextRequest, NextResponse } from 'next/server';

// Jetpack Analytics API integration
interface JetpackAnalyticsData {
  visits: number;
  views: number;
  visitors: number;
  topPosts: Array<{
    title: string;
    url: string;
    views: number;
    percentage: number;
  }>;
  referrers: Array<{
    name: string;
    views: number;
    percentage: number;
  }>;
  searchTerms: Array<{
    term: string;
    views: number;
    percentage: number;
  }>;
  summary: {
    period: string;
    views: number;
    visitors: number;
    likes: number;
    comments: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    
    // For GET requests, return mock data (demo mode)
    return getMockDataResponse(period);
  } catch (error) {
    console.error('Jetpack Analytics GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Jetpack analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action, period } = body;
    
    if (action === 'fetch_stats' && token) {
      return await fetchAuthenticatedStats(token, period || '30');
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Jetpack Analytics POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchAuthenticatedStats(token: any, period: string) {
  try {
    console.log('🔐 Backend: Fetching authenticated stats for site:', token.siteId);
    
    const headers = {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Make requests from backend (no CORS issues)
    const [summaryResponse, topPostsResponse, referrersResponse] = await Promise.all([
      fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${token.siteId}/stats/summary?period=${period}`, { headers }),
      fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${token.siteId}/stats/top-posts?period=${period}`, { headers }),
      fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${token.siteId}/stats/referrers?period=${period}`, { headers })
    ]);

    console.log('📊 WordPress.com API responses:', {
      summary: { ok: summaryResponse.ok, status: summaryResponse.status },
      topPosts: { ok: topPostsResponse.ok, status: topPostsResponse.status },
      referrers: { ok: referrersResponse.ok, status: referrersResponse.status }
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('❌ WordPress.com API error:', errorText);
      throw new Error(`WordPress.com API error: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    const topPostsData = topPostsResponse.ok ? await topPostsResponse.json() : null;
    const referrersData = referrersResponse.ok ? await referrersResponse.json() : null;

    console.log('📈 WordPress.com data received:', { summaryData, topPostsData, referrersData });

    // Transform real WordPress.com data
    const realJetpackData = {
      views: summaryData.views || 0,
      visitors: summaryData.visitors || 0,
      visits: summaryData.visits || 0,
      topPosts: topPostsData?.days?.[0]?.postviews?.map((post: any) => ({
        title: post.title,
        url: post.href,
        views: post.views,
        percentage: parseFloat(((post.views / summaryData.views) * 100).toFixed(1))
      })) || [],
      referrers: referrersData?.days?.[0]?.groups?.map((ref: any) => ({
        name: ref.name,
        views: ref.views,
        percentage: parseFloat(((ref.views / summaryData.views) * 100).toFixed(1))
      })) || [],
      searchTerms: [], // Would need additional API call
      summary: {
        period: `${period} days`,
        views: summaryData.views || 0,
        visitors: summaryData.visitors || 0,
        likes: summaryData.likes || 0,
        comments: summaryData.comments || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: realJetpackData,
      source: 'WordPress.com API (authenticated)',
      period: `${period} days`,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Backend authentication error:', error);
    
    // Fall back to mock data
    return getMockDataResponse(period);
  }
}

function getMockDataResponse(period: string) {
    const periodNum = parseInt(period);
    const mockData = getJetpackMockData(period);
    
    return NextResponse.json({
      success: true,
      data: mockData,
      source: 'Mock data (demo mode)',
      period: `${period} days`,
      lastUpdated: new Date().toISOString(),
      note: 'Connect WordPress.com for live data'
    });
}
    
    if (wpcomAccessToken || wpApiNonce) {
      try {
        console.log('Attempting authenticated Jetpack API calls...');
        
        // Try WordPress.com REST API with authentication
        const headers: Record<string, string> = {
          'User-Agent': 'Medialternatives-Dashboard/1.0',
          'Accept': 'application/json'
        };
        
        if (wpcomAccessToken) {
          headers['Authorization'] = `Bearer ${wpcomAccessToken}`;
        }
        
        if (wpApiNonce) {
          headers['X-WP-Nonce'] = wpApiNonce;
        }
        
        if (wpAuthCookie) {
          headers['Cookie'] = wpAuthCookie;
        }
        
        // Use WordPress.com public API for hosted sites
        const apiBase = 'https://public-api.wordpress.com/rest/v1.1/sites';
        const statsResponse = await fetch(`${apiBase}/${siteId}/stats/summary?period=${period}`, {
          headers
        });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // Fetch additional data
        const [topPostsResponse, referrersResponse] = await Promise.all([
          fetch(`${apiBase}/${siteId}/stats/top-posts?period=${period}`),
          fetch(`${apiBase}/${siteId}/stats/referrers?period=${period}`)
        ]);
        
        const topPostsData = topPostsResponse.ok ? await topPostsResponse.json() : null;
        const referrersData = referrersResponse.ok ? await referrersResponse.json() : null;
        
        // Transform data to match our interface
        const jetpackData: JetpackAnalyticsData = {
          visits: statsData.visits || 0,
          views: statsData.views || 0,
          visitors: statsData.visitors || 0,
          topPosts: topPostsData?.days?.[0]?.postviews?.map((post: any, index: number) => ({
            title: post.title,
            url: post.href,
            views: post.views,
            percentage: parseFloat(((post.views / statsData.views) * 100).toFixed(1))
          })) || [],
          referrers: referrersData?.days?.[0]?.groups?.map((ref: any, index: number) => ({
            name: ref.name,
            views: ref.views,
            percentage: parseFloat(((ref.views / statsData.views) * 100).toFixed(1))
          })) || [],
          searchTerms: [], // Would need search-terms endpoint
          summary: {
            period: `${period} days`,
            views: statsData.views || 0,
            visitors: statsData.visitors || 0,
            likes: statsData.likes || 0,
            comments: statsData.comments || 0
          }
        };
        
        return NextResponse.json({
          success: true,
          data: jetpackData,
          source: 'Jetpack Analytics API',
          period: `${period} days`,
          lastUpdated: new Date().toISOString()
        });
        
      } else {
        // API call failed, return mock data with realistic structure
        throw new Error('Jetpack API authentication required');
      }
      
    } catch (error) {
      console.error('Jetpack Analytics API error:', error);
      
      // Return realistic mock data for development
      const mockData = getJetpackMockData(period);
      
      return NextResponse.json({
        success: true,
        data: mockData,
        source: 'Mock data (Jetpack authentication needed)',
        period: `${period} days`,
        lastUpdated: new Date().toISOString(),
        note: 'Connect WordPress.com account for live Jetpack analytics data',
        authenticationRequired: true,
        error: error instanceof Error ? error.message : 'Authentication required'
      });
    }
    
  } catch (error) {
    console.error('Jetpack Analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Jetpack analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get mock Jetpack analytics data for development
 */
function getJetpackMockData(period: string): JetpackAnalyticsData {
  const periodNum = parseInt(period);
  const baseViews = periodNum === 7 ? 850 : periodNum === 30 ? 3200 : 9800;
  const baseVisitors = Math.floor(baseViews * 0.7);
  
  return {
    visits: baseVisitors,
    views: baseViews,
    visitors: baseVisitors,
    topPosts: [
      {
        title: "Fact Check: Rupert's Alleged Opposition to Apartheid Debunked",
        url: "/2019/07/25/fact-check-ruperts-alleged-opposition-to-apartheid-debunked/",
        views: Math.floor(baseViews * 0.18),
        percentage: 18.0
      },
      {
        title: "Media Inc: The Story of Naspers, Media24 and Channel Life",
        url: "/2011/11/15/media-inc-the-story-of-naspers-media24-and-channel-life/",
        views: Math.floor(baseViews * 0.12),
        percentage: 12.0
      },
      {
        title: "South Africa's Crumbling Corrupt Electricity Monopoly",
        url: "/2025/07/14/south-africas-crumbling-corrupt-electricity-monopoly/",
        views: Math.floor(baseViews * 0.09),
        percentage: 9.0
      },
      {
        title: "Palestine Solidarity and Media Bias",
        url: "/2025/07/08/palestine-solidarity-media-bias/",
        views: Math.floor(baseViews * 0.07),
        percentage: 7.0
      },
      {
        title: "Apartheid, the Nazis and Mcebo Dlamini",
        url: "/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/",
        views: Math.floor(baseViews * 0.06),
        percentage: 6.0
      }
    ],
    referrers: [
      {
        name: "Google Search",
        views: Math.floor(baseViews * 0.35),
        percentage: 35.0
      },
      {
        name: "Direct Traffic",
        views: Math.floor(baseViews * 0.25),
        percentage: 25.0
      },
      {
        name: "Facebook",
        views: Math.floor(baseViews * 0.15),
        percentage: 15.0
      },
      {
        name: "Twitter",
        views: Math.floor(baseViews * 0.10),
        percentage: 10.0
      },
      {
        name: "LinkedIn",
        views: Math.floor(baseViews * 0.08),
        percentage: 8.0
      }
    ],
    searchTerms: [
      {
        term: "media alternatives south africa",
        views: Math.floor(baseViews * 0.08),
        percentage: 8.0
      },
      {
        term: "naspers media24 investigation",
        views: Math.floor(baseViews * 0.06),
        percentage: 6.0
      },
      {
        term: "apartheid media bias",
        views: Math.floor(baseViews * 0.05),
        percentage: 5.0
      },
      {
        term: "south african journalism",
        views: Math.floor(baseViews * 0.04),
        percentage: 4.0
      },
      {
        term: "alternative media africa",
        views: Math.floor(baseViews * 0.03),
        percentage: 3.0
      }
    ],
    summary: {
      period: `${period} days`,
      views: baseViews,
      visitors: baseVisitors,
      likes: Math.floor(baseViews * 0.02),
      comments: Math.floor(baseViews * 0.01)
    }
  };
}