import { NextRequest, NextResponse } from 'next/server';

// PageSpeed Insights API integration
interface PerformanceData {
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay  
    cls: number; // Cumulative Layout Shift
    status: 'good' | 'needs-improvement' | 'poor';
  };
  loadTime: number;
  pageSize: number;
  requests: number;
  lastChecked: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') || 'https://medialternatives.com';
    const strategy = searchParams.get('strategy') || 'mobile'; // mobile or desktop
    
    // PageSpeed Insights API integration - API key available in environment
    const apiKey = process.env.PAGESPEED_API_KEY;
    
    if (apiKey && url) {
      try {
        // Make real PageSpeed Insights API call
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.lighthouseResult) {
          const realData: PerformanceData = {
            lighthouse: {
              performance: Math.round((data.lighthouseResult.categories.performance?.score || 0) * 100),
              accessibility: Math.round((data.lighthouseResult.categories.accessibility?.score || 0) * 100),
              bestPractices: Math.round((data.lighthouseResult.categories['best-practices']?.score || 0) * 100),
              seo: Math.round((data.lighthouseResult.categories.seo?.score || 0) * 100),
              pwa: Math.round((data.lighthouseResult.categories.pwa?.score || 0) * 100),
            },
            coreWebVitals: {
              lcp: data.lighthouseResult.audits['largest-contentful-paint']?.numericValue / 1000 || 2.5,
              fid: data.lighthouseResult.audits['max-potential-fid']?.numericValue || 100,
              cls: data.lighthouseResult.audits['cumulative-layout-shift']?.numericValue || 0.1,
              status: 'good' as const,
            },
            loadTime: data.lighthouseResult.audits['speed-index']?.numericValue / 1000 || 2.0,
            pageSize: Math.round(data.lighthouseResult.audits['total-byte-weight']?.numericValue / 1024) || 1000,
            requests: data.lighthouseResult.audits['network-requests']?.details?.items?.length || 50,
            lastChecked: new Date().toISOString(),
          };
          
          // Determine Core Web Vitals status
          if (realData.coreWebVitals.lcp > 2.5 || realData.coreWebVitals.fid > 100 || realData.coreWebVitals.cls > 0.1) {
            realData.coreWebVitals.status = 'needs-improvement';
          }
          if (realData.coreWebVitals.lcp > 4.0 || realData.coreWebVitals.fid > 300 || realData.coreWebVitals.cls > 0.25) {
            realData.coreWebVitals.status = 'poor';
          }
          
          return NextResponse.json({
            success: true,
            data: realData,
            url,
            strategy,
            source: 'PageSpeed Insights API',
            note: 'Live data from Google PageSpeed Insights'
          });
        }
      } catch (apiError) {
        console.error('PageSpeed Insights API error:', apiError);
        // Fall through to mock data
      }
    }
    
    // Fallback to realistic mock data
    
    const mockData: PerformanceData = {
      lighthouse: {
        performance: Math.floor(Math.random() * 20) + 75, // 75-95
        accessibility: Math.floor(Math.random() * 15) + 85, // 85-100
        bestPractices: Math.floor(Math.random() * 10) + 90, // 90-100
        seo: Math.floor(Math.random() * 10) + 90, // 90-100
        pwa: Math.floor(Math.random() * 30) + 60, // 60-90
      },
      coreWebVitals: {
        lcp: Math.random() * 1.5 + 1.5, // 1.5-3.0 seconds
        fid: Math.random() * 80 + 20, // 20-100 milliseconds
        cls: Math.random() * 0.15 + 0.05, // 0.05-0.2
        status: 'good' as const,
      },
      loadTime: Math.random() * 2 + 1.5, // 1.5-3.5 seconds
      pageSize: Math.floor(Math.random() * 500) + 800, // 800-1300 KB
      requests: Math.floor(Math.random() * 30) + 40, // 40-70 requests
      lastChecked: new Date().toISOString(),
    };

    // Determine Core Web Vitals status
    if (mockData.coreWebVitals.lcp > 2.5 || mockData.coreWebVitals.fid > 100 || mockData.coreWebVitals.cls > 0.1) {
      mockData.coreWebVitals.status = 'needs-improvement';
    }
    if (mockData.coreWebVitals.lcp > 4.0 || mockData.coreWebVitals.fid > 300 || mockData.coreWebVitals.cls > 0.25) {
      mockData.coreWebVitals.status = 'poor';
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      url,
      strategy,
      note: 'Mock data - PageSpeed Insights API integration required for live data'
    });

  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Future implementation guide for PageSpeed Insights API:
/*
To implement real PageSpeed Insights integration:

1. Get a Google PageSpeed Insights API key:
   - Go to Google Cloud Console
   - Enable PageSpeed Insights API
   - Create an API key

2. Environment variables needed:
   PAGESPEED_API_KEY=your-api-key

3. Example API call:
   const apiKey = process.env.PAGESPEED_API_KEY;
   const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa`;
   
   const response = await fetch(apiUrl);
   const data = await response.json();
   
   // Extract scores from data.lighthouseResult.categories
   const performance = Math.round(data.lighthouseResult.categories.performance.score * 100);

4. Rate limiting considerations:
   - PageSpeed Insights API has quotas
   - Cache results for at least 1 hour
   - Consider using a background job for regular checks
*/