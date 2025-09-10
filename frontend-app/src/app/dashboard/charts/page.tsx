'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ChartRenderer from './ChartRenderer';
import { initializeMCPTools } from './mcp-chart-loader';

interface ChartData {
  type: string;
  title: string;
  description: string;
  data: any;
  config?: any;
}

export default function ChartsPage() {
  const [selectedChart, setSelectedChart] = useState<string>('analytics');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sample chart configurations
  const chartConfigs: Record<string, ChartData> = useMemo(() => ({
    analytics: {
      type: 'bar',
      title: 'Website Analytics',
      description: 'Monthly visitors and page views',
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
      title: 'Site Performance',
      description: 'Response time and error rate trends',
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
      title: 'Device Usage',
      description: 'Visitor device breakdown',
      data: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [
          {
            data: [65, 30, 5],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }
        ]
      }
    },
    content: {
      type: 'doughnut',
      title: 'Content Distribution',
      description: 'Site content breakdown',
      data: {
        labels: ['Blog Posts', 'Static Pages', 'Media Files', 'Categories'],
        datasets: [
          {
            data: [45, 15, 25, 15],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          }
        ]
      }
    },
    seo: {
      type: 'radar',
      title: 'SEO Performance',
      description: 'Current vs target SEO metrics',
      data: {
        labels: ['Performance', 'SEO', 'Accessibility', 'Best Practices', 'PWA'],
        datasets: [
          {
            label: 'Current Site',
            data: [85, 92, 88, 90, 75],
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
          },
          {
            label: 'Target Goals',
            data: [95, 95, 95, 95, 90],
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
          }
        ]
      }
    }
  }, []);

  // Generate chart using direct MCP tools
  const generateChart = useCallback(async (chartKey: string) => {
    setLoading(true);
    const config = chartConfigs[chartKey];
    
    try {
      console.log(`Generating ${config.type} chart directly via MCP tools:`, config.data);
      
      // Use the direct MCP chart tools that we know work
      let chartResult;
      
      switch (config.type) {
        case 'bar':
          chartResult = await window.mcpTools?.bar?.(config.data);
          break;
        case 'line':
          chartResult = await window.mcpTools?.line?.(config.data);
          break;
        case 'pie':
          chartResult = await window.mcpTools?.pie?.(config.data);
          break;
        case 'doughnut':
          chartResult = await window.mcpTools?.doughnut?.(config.data);
          break;
        case 'radar':
          chartResult = await window.mcpTools?.radar?.(config.data);
          break;
        default:
          throw new Error(`Chart type ${config.type} not supported`);
      }
      
      if (chartResult) {
        setChartData({
          type: config.type,
          title: config.title,
          description: config.description,
          chartResult: chartResult,
          data: config.data,
          isRendered: true,
          timestamp: new Date().toISOString()
        });
      } else {
        // Fallback to API call if direct tools not available
        console.log('Direct MCP tools not available, falling back to API...');
        await generateChartViaAPI(config);
      }
    } catch (error) {
      console.error('Error with direct MCP tools, trying API fallback:', error);
      await generateChartViaAPI(config);
    } finally {
      setLoading(false);
    }
  }, [chartConfigs]);

  // Fallback API method
  const generateChartViaAPI = async (config: ChartData) => {
    try {
      const response = await fetch('/api/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: config.type,
          data: config.data,
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: config.title
              },
              legend: {
                display: true,
                position: 'top'
              }
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.startsWith('image/')) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        setChartData({
          type: config.type,
          title: config.title,
          description: config.description,
          imageUrl: imageUrl,
          data: config.data,
          isImage: true
        });
      } else {
        const result = await response.json();
        
        if (result.success) {
          setChartData({
            type: config.type,
            title: config.title,
            description: config.description,
            chartResult: result.chart,
            data: config.data,
            timestamp: result.timestamp,
            fallback: result.fallback
          });
        } else {
          throw new Error(result.error || 'Failed to generate chart');
        }
      }
    } catch (error) {
      console.error('Error generating chart via API:', error);
      setChartData({
        type: config.type,
        title: config.title,
        description: config.description,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: config.data
      });
    }
  };

  useEffect(() => {
    // Initialize MCP tools
    initializeMCPTools();
    generateChart(selectedChart);
  }, [selectedChart, generateChart]);

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Charts & Visualizations</h1>
              <p className="text-muted mb-0">
                Interactive data visualization using MCP Chart Tools
              </p>
            </div>
            <Link href="/dashboard" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Chart Selection Sidebar */}
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Available Charts
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {Object.entries(chartConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    className={`list-group-item list-group-item-action d-flex align-items-center ${
                      selectedChart === key ? 'active' : ''
                    }`}
                    onClick={() => setSelectedChart(key)}
                  >
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{config.title}</div>
                      <small className="text-muted">{config.type.toUpperCase()}</small>
                    </div>
                    <i className={`bi bi-${
                      config.type === 'bar' ? 'bar-chart' :
                      config.type === 'line' ? 'graph-up' :
                      config.type === 'pie' ? 'pie-chart' :
                      config.type === 'doughnut' ? 'circle' :
                      config.type === 'radar' ? 'diagram-3' : 'graph-up'
                    }`}></i>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Info */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="card-title mb-0">Chart Information</h6>
            </div>
            <div className="card-body">
              <p className="small text-muted mb-2">
                <strong>Type:</strong> {chartConfigs[selectedChart]?.type.toUpperCase()}
              </p>
              <p className="small text-muted mb-0">
                {chartConfigs[selectedChart]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="col-lg-9 col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                {chartConfigs[selectedChart]?.title}
              </h5>
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => generateChart(selectedChart)}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-download me-1"></i>
                  Export
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Generating chart...</span>
                  </div>
                  <p className="text-muted">Generating chart with MCP tools...</p>
                </div>
              ) : (
                <div className="chart-container">
                  {/* Chart Display Area */}
                  <div className="bg-white rounded border p-4" style={{ minHeight: '400px' }}>
                    {chartData?.error ? (
                      // Error State
                      <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
                        <i className="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
                        <h4 className="text-danger mb-2">Chart Generation Failed</h4>
                        <p className="text-muted mb-3">{chartData.error}</p>
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => generateChart(selectedChart)}
                        >
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          Try Again
                        </button>
                      </div>
                    ) : (
                      // Render Chart using ChartRenderer
                      <ChartRenderer
                        type={chartConfigs[selectedChart]?.type}
                        data={chartConfigs[selectedChart]?.data}
                        title={chartConfigs[selectedChart]?.title}
                        onChartGenerated={(chartUrl) => {
                          setChartData({
                            type: chartConfigs[selectedChart]?.type,
                            title: chartConfigs[selectedChart]?.title,
                            description: chartConfigs[selectedChart]?.description,
                            chartUrl: chartUrl,
                            data: chartConfigs[selectedChart]?.data,
                            isRendered: true,
                            timestamp: new Date().toISOString()
                          });
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Chart Data & Status */}
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <h6>Chart Configuration:</h6>
                      <div className="bg-light p-3 rounded">
                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted d-block">Type:</small>
                            <span className="badge bg-primary">{chartConfigs[selectedChart]?.type.toUpperCase()}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Status:</small>
                            <span className={`badge ${
                              chartData?.error ? 'bg-danger' : 
                              chartData?.isRendered || chartData?.chartUrl ? 'bg-success' : 
                              loading ? 'bg-warning' :
                              'bg-secondary'
                            }`}>
                              {chartData?.error ? 'Error' : 
                               chartData?.isRendered || chartData?.chartUrl ? 'Rendered' : 
                               loading ? 'Generating' :
                               'Ready'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6>MCP Service:</h6>
                      <div className="bg-light p-3 rounded">
                        <small className="text-muted d-block">Endpoint:</small>
                        <code className="small">https://chart.mcp.cloudcertainty.com/mcp</code>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Data Preview (Collapsible) */}
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6>Chart Data Preview:</h6>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#chartDataCollapse"
                      >
                        <i className="bi bi-code-slash me-1"></i>
                        Toggle Data
                      </button>
                    </div>
                    <div className="collapse" id="chartDataCollapse">
                      <pre className="bg-light p-3 rounded small mt-2">
                        {JSON.stringify(chartConfigs[selectedChart]?.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}