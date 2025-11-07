# MCP Chart API Reference

## Quick Start

Generate a simple bar chart:

```bash
curl -X POST http://localhost:3000/api/charts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bar",
    "data": {
      "labels": ["Jan", "Feb", "Mar"],
      "datasets": [{
        "label": "Sales",
        "data": [100, 200, 150]
      }]
    }
  }'
```

## API Endpoints

### POST /api/charts

Main chart generation endpoint with MCP service integration and fallback.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "type": "string",     // Required: Chart type
  "data": "object",     // Required: Chart data
  "options": "object"   // Optional: Chart options
}
```

#### Chart Types

| Type | Description | Status |
|------|-------------|--------|
| `bar` | Vertical bar chart | ✅ Supported |
| `line` | Line chart with points | ✅ Supported |
| `pie` | Circular pie chart | ✅ Supported |
| `doughnut` | Pie chart with center hole | ✅ Supported |
| `radar` | Radar/spider chart | ✅ Supported |
| `scatter` | Scatter plot | 🔄 Planned |
| `bubble` | Bubble chart | 🔄 Planned |

#### Response Formats

**Success (Image)**:
```
Content-Type: image/svg+xml
Body: <SVG content>
```

**Success (JSON)**:
```json
{
  "success": true,
  "chart": "data:image/svg+xml;base64,PHN2Zy...",
  "timestamp": "2025-07-25T12:00:00.000Z",
  "fallback": false
}
```

**Fallback Response**:
```json
{
  "success": true,
  "chart": "data:image/svg+xml;base64,PHN2Zy...",
  "fallback": true,
  "message": "Generated bar chart using SVG fallback",
  "timestamp": "2025-07-25T12:00:00.000Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "mcpError": "MCP service specific error",
    "fallbackError": "Fallback generation error"
  }
}
```

### POST /api/charts/generate

Local SVG chart generation (fallback endpoint).

#### Request

Same format as main endpoint.

#### Response

```json
{
  "success": true,
  "chart": "data:image/svg+xml;base64,PHN2Zy...",
  "type": "svg",
  "fallback": true,
  "message": "Generated bar chart using SVG fallback",
  "timestamp": "2025-07-25T12:00:00.000Z"
}
```

### GET /api/charts/test

Test MCP service connectivity.

#### Response

```json
{
  "success": true,
  "status": 200,
  "statusText": "OK",
  "headers": {...},
  "url": "https://chart.mcp.cloudcertainty.com/mcp",
  "timestamp": "2025-07-25T12:00:00.000Z"
}
```

### POST /api/charts/test

Test chart generation with minimal data.

#### Response

```json
{
  "success": true,
  "message": "MCP Chart service returned JSON",
  "result": {...},
  "status": 200,
  "timestamp": "2025-07-25T12:00:00.000Z"
}
```

## Data Formats

### Bar Chart Data

```json
{
  "labels": ["Category 1", "Category 2", "Category 3"],
  "datasets": [{
    "label": "Dataset Name",
    "data": [10, 20, 30],
    "backgroundColor": "#36A2EB",
    "borderColor": "#1E88E5",
    "borderWidth": 1
  }]
}
```

**Properties**:
- `labels`: Array of category labels
- `datasets[].label`: Dataset name for legend
- `datasets[].data`: Array of numeric values
- `datasets[].backgroundColor`: Bar fill color
- `datasets[].borderColor`: Bar border color
- `datasets[].borderWidth`: Border thickness

### Line Chart Data

```json
{
  "labels": ["Point 1", "Point 2", "Point 3"],
  "datasets": [{
    "label": "Line Name",
    "data": [10, 20, 15],
    "borderColor": "#FF6384",
    "backgroundColor": "rgba(255, 99, 132, 0.2)",
    "fill": false,
    "tension": 0.1
  }]
}
```

**Properties**:
- `datasets[].borderColor`: Line color
- `datasets[].backgroundColor`: Fill color (if fill: true)
- `datasets[].fill`: Whether to fill area under line
- `datasets[].tension`: Line curve smoothness (0-1)

### Pie Chart Data

```json
{
  "labels": ["Slice 1", "Slice 2", "Slice 3"],
  "datasets": [{
    "data": [30, 50, 20],
    "backgroundColor": [
      "#FF6384",
      "#36A2EB", 
      "#FFCE56"
    ],
    "borderWidth": 2
  }]
}
```

**Properties**:
- `datasets[].data`: Array of slice values
- `datasets[].backgroundColor`: Array of slice colors
- `datasets[].borderWidth`: Slice border thickness

### Doughnut Chart Data

Same format as pie chart. The center hole is automatically created.

### Radar Chart Data

```json
{
  "labels": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "datasets": [{
    "label": "Player 1",
    "data": [80, 90, 70, 85],
    "borderColor": "#FF6384",
    "backgroundColor": "rgba(255, 99, 132, 0.2)",
    "pointBackgroundColor": "#FF6384",
    "pointBorderColor": "#fff",
    "pointRadius": 3
  }]
}
```

**Properties**:
- `datasets[].pointBackgroundColor`: Point fill color
- `datasets[].pointBorderColor`: Point border color
- `datasets[].pointRadius`: Point size

## Chart Options

### Global Options

```json
{
  "responsive": true,
  "maintainAspectRatio": false,
  "plugins": {
    "title": {
      "display": true,
      "text": "Chart Title",
      "font": {
        "size": 16,
        "weight": "bold"
      }
    },
    "legend": {
      "display": true,
      "position": "top"
    }
  }
}
```

### Scale Options

```json
{
  "scales": {
    "x": {
      "display": true,
      "title": {
        "display": true,
        "text": "X Axis Label"
      }
    },
    "y": {
      "display": true,
      "beginAtZero": true,
      "title": {
        "display": true,
        "text": "Y Axis Label"
      }
    }
  }
}
```

### Animation Options

```json
{
  "animation": {
    "duration": 1000,
    "easing": "easeInOutQuart"
  }
}
```

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid data format |
| 500 | Internal Server Error |

### MCP Service Errors

| Code | Message | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON-RPC message |
| -32000 | Bad Request | Missing required headers |
| -32001 | Session not found | Invalid session ID |

## Rate Limiting

- No rate limiting currently implemented
- Consider implementing for production use
- MCP service may have its own limits

## Examples

### Complete Bar Chart Example

```javascript
const chartRequest = {
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 15000, 18000, 22000],
      backgroundColor: '#36A2EB',
      borderColor: '#1E88E5',
      borderWidth: 1
    }, {
      label: 'Expenses',
      data: [8000, 9000, 11000, 13000],
      backgroundColor: '#FF6384',
      borderColor: '#E91E63',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Quarterly Financial Report'
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  }
};

fetch('/api/charts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(chartRequest)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Display chart image
    const img = document.createElement('img');
    img.src = data.chart;
    document.body.appendChild(img);
  }
});
```

### Multi-Line Chart Example

```javascript
const lineChartRequest = {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Website Traffic',
      data: [1200, 1900, 3000, 5000, 2300],
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      fill: true,
      tension: 0.4
    }, {
      label: 'Social Media Traffic',
      data: [800, 1200, 1800, 2200, 1900],
      borderColor: '#FF6384',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Traffic Sources Comparison'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Visitors'
        }
      }
    }
  }
};
```

### Pie Chart with Custom Colors

```javascript
const pieChartRequest = {
  type: 'pie',
  data: {
    labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
    datasets: [{
      data: [45, 35, 15, 5],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Device Usage Statistics'
      },
      legend: {
        display: true,
        position: 'right'
      }
    }
  }
};
```

## Best Practices

### Data Validation

Always validate chart data before sending:

```javascript
function validateChartData(type, data) {
  if (!data.labels || !Array.isArray(data.labels)) {
    throw new Error('Labels must be an array');
  }
  
  if (!data.datasets || !Array.isArray(data.datasets)) {
    throw new Error('Datasets must be an array');
  }
  
  data.datasets.forEach((dataset, index) => {
    if (!dataset.data || !Array.isArray(dataset.data)) {
      throw new Error(`Dataset ${index} must have data array`);
    }
    
    if (dataset.data.length !== data.labels.length) {
      throw new Error(`Dataset ${index} data length must match labels length`);
    }
  });
}
```

### Error Handling

Implement proper error handling:

```javascript
async function generateChart(chartConfig) {
  try {
    const response = await fetch('/api/charts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chartConfig)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Chart generation failed');
    }
    
    return result;
    
  } catch (error) {
    console.error('Chart generation error:', error);
    // Handle error appropriately
    throw error;
  }
}
```

### Performance Optimization

- Cache chart images when possible
- Use appropriate chart types for data size
- Limit dataset size for better performance
- Implement loading states for better UX

### Accessibility

- Provide alt text for chart images
- Include data tables for screen readers
- Use sufficient color contrast
- Provide keyboard navigation where applicable