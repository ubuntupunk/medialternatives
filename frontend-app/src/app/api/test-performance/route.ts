import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify PageSpeed Insights API integration
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'PageSpeed API key not configured',
        hasApiKey: false
      });
    }

    // Test with a simple URL
    const testUrl = 'https://medialternatives.com';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&key=${apiKey}&strategy=mobile&category=performance`;
    
    console.log('Testing PageSpeed API with URL:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({
        success: false,
        error: 'PageSpeed API error',
        details: data.error,
        hasApiKey: true,
        apiKeyValid: false
      });
    }
    
    if (data.lighthouseResult) {
      return NextResponse.json({
        success: true,
        message: 'PageSpeed Insights API is working!',
        hasApiKey: true,
        apiKeyValid: true,
        performanceScore: Math.round((data.lighthouseResult.categories.performance?.score || 0) * 100),
        testUrl,
        note: 'Live PageSpeed Insights integration is ready'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unexpected API response format',
      hasApiKey: true,
      apiKeyValid: true,
      rawResponse: data
    });

  } catch (error) {
    console.error('PageSpeed test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test PageSpeed API',
      details: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.PAGESPEED_API_KEY
    });
  }
}