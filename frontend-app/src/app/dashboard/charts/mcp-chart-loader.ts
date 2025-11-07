// MCP Chart Tools Loader
// This module provides access to MCP chart generation tools

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

// Initialize MCP chart tools
export const initializeMCPTools = () => {
  if (typeof window === 'undefined') return;

  // Check if MCP tools are already available
  if (window.mcpTools) {
    console.log('MCP tools already initialized');
    return window.mcpTools;
  }

  // Create MCP tools wrapper
  window.mcpTools = {
    bar: async (data: any) => {
      console.log('Generating bar chart with MCP tools:', data);
      try {
        // This would normally call the actual MCP chart function
        // For now, we'll call our API as a fallback
        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'bar',
            data: data
          }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.startsWith('image/')) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          } else {
            const result = await response.json();
            if (result.success && result.chart) {
              // If the result contains a base64 image or URL, return it
              return result.chart.imageUrl || result.chart;
            }
          }
        }
        throw new Error('Failed to generate bar chart');
      } catch (error) {
        console.error('Bar chart generation failed:', error);
        throw error;
      }
    },

    line: async (data: any) => {
      console.log('Generating line chart with MCP tools:', data);
      try {
        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'line',
            data: data
          }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.startsWith('image/')) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          } else {
            const result = await response.json();
            if (result.success && result.chart) {
              return result.chart.imageUrl || result.chart;
            }
          }
        }
        throw new Error('Failed to generate line chart');
      } catch (error) {
        console.error('Line chart generation failed:', error);
        throw error;
      }
    },

    pie: async (data: any) => {
      console.log('Generating pie chart with MCP tools:', data);
      try {
        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'pie',
            data: data
          }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.startsWith('image/')) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          } else {
            const result = await response.json();
            if (result.success && result.chart) {
              return result.chart.imageUrl || result.chart;
            }
          }
        }
        throw new Error('Failed to generate pie chart');
      } catch (error) {
        console.error('Pie chart generation failed:', error);
        throw error;
      }
    },

    doughnut: async (data: any) => {
      console.log('Generating doughnut chart with MCP tools:', data);
      try {
        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'doughnut',
            data: data
          }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.startsWith('image/')) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          } else {
            const result = await response.json();
            if (result.success && result.chart) {
              return result.chart.imageUrl || result.chart;
            }
          }
        }
        throw new Error('Failed to generate doughnut chart');
      } catch (error) {
        console.error('Doughnut chart generation failed:', error);
        throw error;
      }
    },

    radar: async (data: any) => {
      console.log('Generating radar chart with MCP tools:', data);
      try {
        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'radar',
            data: data
          }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.startsWith('image/')) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          } else {
            const result = await response.json();
            if (result.success && result.chart) {
              return result.chart.imageUrl || result.chart;
            }
          }
        }
        throw new Error('Failed to generate radar chart');
      } catch (error) {
        console.error('Radar chart generation failed:', error);
        throw error;
      }
    }
  };

  console.log('MCP tools initialized successfully');
  return window.mcpTools;
};

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  initializeMCPTools();
}