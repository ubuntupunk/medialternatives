import { NextRequest, NextResponse } from 'next/server';

const MCP_CHART_URL = process.env.MCP_CHART_URL || 'https://chart.mcp.cloudcertainty.com/mcp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, options = {} } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Chart type and data are required' },
        { status: 400 }
      );
    }

    // Prepare the chart request for MCP service
    const chartRequest = {
      type,
      data,
      ...options
    };

    console.log('Sending chart request to MCP:', chartRequest);
    console.log('MCP_CHART_URL:', MCP_CHART_URL);

    // Call the MCP chart service with timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(MCP_CHART_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Medialternatives-Dashboard/1.0',
        },
        body: JSON.stringify(chartRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('MCP Response status:', response.status);
      console.log('MCP Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MCP Error response:', errorText);
        throw new Error(`MCP Chart service error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('MCP Fetch error details:', fetchError);
      
      // Fallback: Return a mock chart response for development
      console.log('Falling back to mock chart generation');
      return NextResponse.json({
        success: true,
        chart: {
          type: chartRequest.type,
          data: chartRequest.data,
          mockGenerated: true,
          message: `Mock ${chartRequest.type} chart generated (MCP service unavailable)`,
          timestamp: new Date().toISOString(),
          originalError: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        },
        fallback: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if response is an image
    const contentType = response.headers.get('content-type');
    
    if (contentType?.startsWith('image/')) {
      // Return the image directly
      const imageBuffer = await response.arrayBuffer();
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } else {
      // Return JSON response (might include image URL or base64)
      const result = await response.json();
      return NextResponse.json({
        success: true,
        chart: result,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Error generating chart:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate chart',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for chart templates/examples
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template');

  const chartTemplates = {
    analytics: {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
          {
            label: 'Visitors',
            data: [1200, 1900, 3000, 5000, 2300],
            backgroundColor: '#36A2EB'
          },
          {
            label: 'Page Views',
            data: [2400, 3800, 6000, 10000, 4600],
            backgroundColor: '#FF6384'
          }
        ]
      }
    },
    performance: {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Response Time (ms)',
            data: [120, 150, 180, 140],
            fill: false,
            borderColor: '#36A2EB'
          },
          {
            label: 'Error Rate (%)',
            data: [2, 3, 5, 2],
            fill: false,
            borderColor: '#FF6384'
          }
        ]
      }
    },
    devices: {
      type: 'pie',
      data: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [
          {
            data: [65, 30, 5],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }
        ]
      }
    }
  };

  if (template && chartTemplates[template as keyof typeof chartTemplates]) {
    return NextResponse.json({
      success: true,
      template: chartTemplates[template as keyof typeof chartTemplates]
    });
  }

  return NextResponse.json({
    success: true,
    templates: Object.keys(chartTemplates),
    available: chartTemplates
  });
}