'use client';

import React, { useEffect, useRef } from 'react';

interface ChartRendererProps {
  type: string;
  data: any;
  title: string;
  onChartGenerated?: (chartUrl: string) => void;
}

declare global {
  interface Window {
    mcpTools?: {
      bar?: (data: any) => Promise<string>;
      line?: (data: any) => Promise<string>;
      pie?: (data: any) => Promise<string>;
      doughnut?: (data: any) => Promise<string>;
      radar?: (data: any) => Promise<string>;
      scatter?: (data: any) => Promise<string>;
      bubble?: (data: any) => Promise<string>;
    };
  }
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ 
  type, 
  data, 
  title, 
  onChartGenerated 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartUrl, setChartUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const generateChart = async () => {
    if (!chartRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Generating ${type} chart with data:`, data);
      
      // Try to use MCP tools directly if available
      if (window.mcpTools && window.mcpTools[type as keyof typeof window.mcpTools]) {
        console.log(`Using direct MCP tools for ${type} chart`);
        const chartFunction = window.mcpTools[type as keyof typeof window.mcpTools];
        if (chartFunction) {
          const result = await chartFunction(data);
          console.log('MCP tools result:', result);
          
          if (typeof result === 'string') {
            if (result.startsWith('data:image/') || result.startsWith('blob:') || result.startsWith('http')) {
              setChartUrl(result);
              onChartGenerated?.(result);
              return;
            } else {
              // Try to parse as JSON in case it's a stringified response
              try {
                const parsed = JSON.parse(result);
                if (parsed.imageUrl || parsed.chart) {
                  const url = parsed.imageUrl || parsed.chart;
                  setChartUrl(url);
                  onChartGenerated?.(url);
                  return;
                }
              } catch {
                // Not JSON, treat as error
                console.warn('Unexpected result format:', result);
              }
            }
          }
          
          // If we get here, the result format is unexpected
          console.warn('Unexpected MCP result format:', typeof result, result);
          setError(`Chart generated but result format unexpected: ${typeof result}`);
        }
      } else {
        // Fallback to API call
        console.log('MCP tools not available, using API fallback');
        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            data,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: title
                }
              }
            }
          }),
        });

        console.log('API response status:', response.status);
        console.log('API response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log('Response content type:', contentType);
          
          if (contentType?.startsWith('image/')) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            console.log('Created blob URL:', url);
            setChartUrl(url);
            onChartGenerated?.(url);
          } else {
            const result = await response.json();
            console.log('JSON response result:', result);
            
            if (result.success) {
              if (result.fallback && result.chart?.mockGenerated) {
                // Handle mock/fallback response - create a placeholder chart
                console.log('Received mock chart response, creating placeholder');
                setError(`Chart service unavailable. Mock response: ${result.chart.message}`);
              } else if (result.chart && typeof result.chart === 'string') {
                // Direct image URL or base64
                setChartUrl(result.chart);
                onChartGenerated?.(result.chart);
              } else if (result.chart && result.chart.imageUrl) {
                // Nested image URL
                setChartUrl(result.chart.imageUrl);
                onChartGenerated?.(result.chart.imageUrl);
              } else {
                // Show the JSON result for debugging
                console.log('Chart generated but no image URL found:', result);
                setError(`Chart generated successfully but no displayable image found. Check console for details.`);
              }
            } else {
              setError(result.error || 'Failed to generate chart');
            }
          }
        } else {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          setError(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }
    } catch (err) {
      console.error('Chart generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateChart();
  }, [type, data, title]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Generating chart...</span>
          </div>
          <p className="text-muted">Generating {type} chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        <strong>Chart Generation Failed:</strong> {error}
        <button 
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={generateChart}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Retry
        </button>
      </div>
    );
  }

  if (chartUrl) {
    return (
      <div className="text-center">
        <img 
          src={chartUrl} 
          alt={`${title} - ${type} chart`}
          className="img-fluid rounded shadow-sm"
          style={{ maxHeight: '400px', maxWidth: '100%' }}
        />
        <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-check-circle text-success me-1"></i>
            {type.toUpperCase()} chart generated successfully
          </small>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
      <div className="text-center text-muted">
        <i className="bi bi-bar-chart display-1 mb-3"></i>
        <p>Chart will appear here</p>
      </div>
    </div>
  );
};

export default ChartRenderer;