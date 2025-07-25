import { NextRequest, NextResponse } from 'next/server';

// Simple chart generation using Canvas API (fallback when MCP is unavailable)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Chart type and data are required' },
        { status: 400 }
      );
    }

    // Generate a simple SVG chart as fallback
    const svg = generateSVGChart(type, data);
    
    // Convert SVG to data URL
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    return NextResponse.json({
      success: true,
      chart: dataUrl,
      type: 'svg',
      fallback: true,
      message: `Generated ${type} chart using SVG fallback`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating fallback chart:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate fallback chart',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSVGChart(type: string, data: any): string {
  const { labels = [], datasets = [] } = data;
  const width = 600;
  const height = 400;

  // Simple chart generation
  if (type === 'bar' && datasets.length > 0 && datasets[0].data) {
    return generateSimpleBarChart(labels, datasets[0].data, width, height);
  } else if (type === 'pie' && datasets.length > 0 && datasets[0].data) {
    return generateSimplePieChart(labels, datasets[0].data, width, height);
  } else {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="#ddd"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#666" font-family="Arial" font-size="16">
          ${type.toUpperCase()} Chart Generated
        </text>
        <text x="${width/2}" y="${height/2 + 30}" text-anchor="middle" fill="#999" font-family="Arial" font-size="12">
          Fallback SVG Chart (MCP Service Unavailable)
        </text>
      </svg>
    `;
  }
}

function generateSimpleBarChart(labels: string[], data: number[], width: number, height: number): string {
  const margin = 60;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;
  const maxValue = Math.max(...data);
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  let bars = '';
  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = margin + index * (barWidth + barSpacing);
    const y = height - margin - barHeight;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#36A2EB" opacity="0.8"/>`;
    
    // Label
    if (labels[index]) {
      bars += `<text x="${x + barWidth/2}" y="${height - margin + 20}" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">${labels[index]}</text>`;
    }
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" stroke="#ddd"/>
      <text x="${width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Bar Chart</text>
      ${bars}
    </svg>
  `;
}

function generateSimplePieChart(labels: string[], data: number[], width: number, height: number): string {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  const total = data.reduce((sum, value) => sum + value, 0);
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  let currentAngle = -Math.PI / 2;
  let slices = '';

  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;
    const color = colors[index % colors.length];

    const x1 = centerX + Math.cos(currentAngle) * radius;
    const y1 = centerY + Math.sin(currentAngle) * radius;
    const x2 = centerX + Math.cos(endAngle) * radius;
    const y2 = centerY + Math.sin(endAngle) * radius;

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    slices += `<path d="${pathData}" fill="${color}" opacity="0.8"/>`;
    currentAngle = endAngle;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" stroke="#ddd"/>
      <text x="${width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Pie Chart</text>
      ${slices}
    </svg>
  `;
}

