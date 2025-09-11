import { NextResponse } from 'next/server';

// Test endpoint to verify MCP connectivity
export async function GET() {
  const MCP_CHART_URL = process.env.MCP_CHART_URL || 'https://chart.mcp.cloudcertainty.com/mcp';
  
  try {
    console.log('Testing MCP Chart service connectivity...');
    console.log('MCP_CHART_URL:', MCP_CHART_URL);
    
    // Simple connectivity test
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(MCP_CHART_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream',
        'User-Agent': 'Medialternatives-Dashboard/1.0',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    
    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500), // First 500 chars
      url: MCP_CHART_URL,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('MCP connectivity test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: MCP_CHART_URL,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Test chart generation with minimal data
export async function POST() {
  const MCP_CHART_URL = process.env.MCP_CHART_URL || 'https://chart.mcp.cloudcertainty.com/mcp';
  
  try {
    const testChart = {
      type: 'bar',
      data: {
        labels: ['Test'],
        datasets: [{
          label: 'Test Data',
          data: [1],
          backgroundColor: '#36A2EB'
        }]
      }
    };
    
    console.log('Testing MCP Chart generation with minimal data...');
    
    const response = await fetch(MCP_CHART_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'User-Agent': 'Medialternatives-Dashboard/1.0',
      },
      body: JSON.stringify(testChart),
    });
    
    const contentType = response.headers.get('content-type');
    
    if (contentType?.startsWith('image/')) {
      return NextResponse.json({
        success: true,
        message: 'MCP Chart service returned an image',
        contentType,
        status: response.status,
        timestamp: new Date().toISOString(),
      });
    } else {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: 'MCP Chart service returned JSON',
        result,
        status: response.status,
        timestamp: new Date().toISOString(),
      });
    }
    
  } catch (error) {
    console.error('MCP chart test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: MCP_CHART_URL,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}