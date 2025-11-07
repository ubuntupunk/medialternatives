# MCP Chart Integration Documentation

## Overview

The MCP (Model Context Protocol) Chart Integration provides real-time chart generation capabilities for the Medialternatives dashboard. This system combines external MCP chart services with local fallback generation to ensure reliable chart visualization.

## Architecture

### Components

1. **MCP Chart Service**: External service at `https://chart.mcp.cloudcertainty.com/mcp`
2. **API Routes**: Next.js API endpoints for chart generation
3. **ChartRenderer**: React component for chart display
4. **SVG Fallback**: Local chart generation when MCP unavailable
5. **Dashboard Integration**: Charts section in admin dashboard

### Data Flow

```
Dashboard UI → ChartRenderer → API Route → MCP Service
                                    ↓ (if unavailable)
                              SVG Fallback Generator
```

## API Endpoints

### `/api/charts` (Main Endpoint)

**Method**: POST

**Request Body**:
```json
{
  "type": "bar|line|pie|doughnut|radar",
  "data": {
    "labels": ["Label1", "Label2", "Label3"],
    "datasets": [{
      "label": "Dataset Name",
      "data": [10, 20, 30],
      "backgroundColor": "#36A2EB"
    }]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": {
        "display": true,
        "text": "Chart Title"
      }
    }
  }
}
```

**Response** (Success):
```json
{
  "success": true,
  "chart": "data:image/svg+xml;base64,PHN2Zy...",
  "timestamp": "2025-07-25T12:00:00.000Z"
}
```

**Response** (Fallback):
```json
{
  "success": true,
  "chart": "data:image/svg+xml;base64,PHN2Zy...",
  "fallback": true,
  "message": "Generated bar chart using SVG fallback",
  "timestamp": "2025-07-25T12:00:00.000Z"
}
```

### `/api/charts/generate` (Fallback Endpoint)

**Method**: POST

Generates SVG charts locally when MCP service is unavailable.

**Supported Chart Types**:
- `bar`: Simple bar charts with labels
- `pie`: Pie charts with colored segments
- Generic fallback for other types

### `/api/charts/test` (Testing Endpoint)

**Methods**: GET, POST

Used for testing MCP service connectivity and chart generation.

## Environment Configuration

### Required Environment Variables

```bash
# MCP Chart Service
MCP_CHART_URL=https://chart.mcp.cloudcertainty.com/mcp
```

### Environment Files

- `.env` - Development configuration
- `.env.local` - Local development overrides
- `.env.production` - Production configuration

## MCP Service Integration

### JSON-RPC Protocol

The MCP service expects JSON-RPC 2.0 formatted requests:

```json
{
  "jsonrpc": "2.0",
  "method": "bar",
  "params": {
    "data": {
      "labels": ["A", "B", "C"],
      "datasets": [{"data": [1, 2, 3]}]
    }
  },
  "id": 1732567890123
}
```

### Required Headers

```http
Content-Type: application/json
Accept: application/json, text/event-stream
User-Agent: Medialternatives-Dashboard/1.0
Mcp-Session-Id: dashboard-1732567890123-abc123def
```

### Session Management

Session IDs are generated using the format:
```javascript
`dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

## Dashboard Integration

### Navigation

Charts are accessible via:
**Dashboard → Charts & Visualizations** (`/dashboard/charts`)

### Chart Types Available

1. **Analytics**: Website visitors and page views (Bar Chart)
2. **Performance**: API response time and error rates (Line Chart)
3. **Devices**: Device usage breakdown (Pie Chart)
4. **Content**: Site content distribution (Doughnut Chart)
5. **SEO**: Performance metrics comparison (Radar Chart)

### User Interface

#### Chart Selection Sidebar
- List of available chart types
- Chart type indicators (BAR, LINE, PIE, etc.)
- Active chart highlighting

#### Chart Display Area
- Real-time chart rendering
- Loading states during generation
- Error handling with retry options
- Status indicators (Ready, Generating, Rendered, Error)

#### Chart Information Panel
- Chart configuration details
- MCP service status
- Generation timestamps

#### Data Preview
- Collapsible chart data section
- JSON formatted data display
- Toggle button for show/hide

## React Components

### ChartRenderer Component

**Location**: `src/app/dashboard/charts/ChartRenderer.tsx`

**Props**:
```typescript
interface ChartRendererProps {
  type: string;           // Chart type (bar, line, pie, etc.)
  data: any;             // Chart data object
  title: string;         // Chart title
  onChartGenerated?: (chartUrl: string) => void; // Callback
}
```

**Features**:
- Automatic chart generation on mount
- Loading and error states
- Image display with proper sizing
- Retry functionality

### Charts Page Component

**Location**: `src/app/dashboard/charts/page.tsx`

**Features**:
- Chart type selection
- Chart configuration management
- Status tracking
- Data preview toggle

## Chart Data Formats

### Bar Chart
```json
{
  "labels": ["Jan", "Feb", "Mar"],
  "datasets": [{
    "label": "Sales",
    "data": [100, 200, 150],
    "backgroundColor": "#36A2EB"
  }]
}
```

### Line Chart
```json
{
  "labels": ["Week 1", "Week 2", "Week 3"],
  "datasets": [{
    "label": "Response Time",
    "data": [120, 150, 140],
    "borderColor": "#FF6384",
    "fill": false
  }]
}
```

### Pie Chart
```json
{
  "labels": ["Desktop", "Mobile", "Tablet"],
  "datasets": [{
    "data": [65, 30, 5],
    "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
  }]
}
```

### Doughnut Chart
```json
{
  "labels": ["Posts", "Pages", "Media"],
  "datasets": [{
    "data": [45, 25, 30],
    "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
  }]
}
```

### Radar Chart
```json
{
  "labels": ["Performance", "SEO", "Accessibility"],
  "datasets": [{
    "label": "Current",
    "data": [85, 92, 88],
    "borderColor": "#FF6384",
    "backgroundColor": "rgba(255, 99, 132, 0.2)"
  }]
}
```

## Error Handling

### MCP Service Errors

1. **Connection Timeout**: 10-second timeout with fallback
2. **Authentication Errors**: Session ID validation
3. **Invalid Requests**: JSON-RPC format validation
4. **Service Unavailable**: Automatic fallback to SVG generation

### Fallback Mechanisms

1. **SVG Generation**: Local chart creation when MCP unavailable
2. **Error Display**: User-friendly error messages
3. **Retry Options**: Manual retry buttons
4. **Status Indicators**: Clear status communication

### Common Error Codes

- `400`: Bad Request - Invalid JSON-RPC format
- `401`: Unauthorized - Missing or invalid session
- `404`: Not Found - Session not found
- `406`: Not Acceptable - Missing required headers
- `500`: Internal Server Error - MCP service issues

## Testing

### Manual Testing

1. **Chart Generation**:
   ```bash
   curl -X POST http://localhost:3000/api/charts \
     -H "Content-Type: application/json" \
     -d '{"type":"bar","data":{"labels":["A","B"],"datasets":[{"data":[1,2]}]}}'
   ```

2. **Fallback Testing**:
   ```bash
   curl -X POST http://localhost:3000/api/charts/generate \
     -H "Content-Type: application/json" \
     -d '{"type":"bar","data":{"labels":["A","B"],"datasets":[{"data":[1,2]}]}}'
   ```

3. **Connectivity Testing**:
   ```bash
   curl http://localhost:3000/api/charts/test
   ```

### Dashboard Testing

1. Navigate to `/dashboard/charts`
2. Select different chart types
3. Verify chart rendering
4. Test error scenarios
5. Check data preview toggle

## Performance Considerations

### Caching

- Chart images cached with 1-hour TTL
- Object URLs created for blob responses
- Memory cleanup for generated URLs

### Optimization

- 10-second timeout for MCP requests
- Automatic fallback to prevent blocking
- Minimal SVG generation for fallbacks
- Responsive image sizing

### Resource Management

- Proper cleanup of object URLs
- Error boundary protection
- Memory-efficient chart generation

## Security

### Input Validation

- Chart type validation
- Data structure validation
- Size limits on chart data
- XSS prevention in chart content

### API Security

- No authentication required (public charts)
- Rate limiting considerations
- CORS configuration
- Content Security Policy compliance

## Deployment

### Production Configuration

1. Set environment variables:
   ```bash
   MCP_CHART_URL=https://chart.mcp.cloudcertainty.com/mcp
   ```

2. Verify MCP service connectivity
3. Test fallback mechanisms
4. Monitor error rates

### Monitoring

- Chart generation success rates
- MCP service availability
- Fallback usage statistics
- Error tracking and alerting

## Troubleshooting

### Common Issues

1. **Charts not displaying**:
   - Check browser console for errors
   - Verify MCP service connectivity
   - Test fallback generation

2. **MCP service errors**:
   - Verify session ID generation
   - Check required headers
   - Validate JSON-RPC format

3. **Fallback not working**:
   - Check SVG generation logic
   - Verify data format compatibility
   - Test API endpoint directly

### Debug Tools

1. **Browser DevTools**: Network tab for API calls
2. **Console Logging**: Detailed request/response logging
3. **API Testing**: Direct endpoint testing with curl
4. **Error Boundaries**: React error catching

### Support Resources

- MCP Service Documentation
- Chart.js Documentation (for data formats)
- SVG Specification
- JSON-RPC 2.0 Specification

## Future Enhancements

### Planned Features

1. **Additional Chart Types**: Scatter, bubble, area charts
2. **Chart Customization**: Color themes, styling options
3. **Data Export**: Download charts as PNG/SVG
4. **Real-time Updates**: Live data integration
5. **Chart Templates**: Predefined chart configurations

### Integration Opportunities

1. **Analytics Integration**: Real Google Analytics data
2. **WordPress API**: Dynamic content statistics
3. **Performance Monitoring**: Live site metrics
4. **User Engagement**: Interactive chart features

## Changelog

### Version 1.0.0 (2025-07-25)

- Initial MCP chart integration
- Dashboard charts section
- SVG fallback system
- Error handling and retry mechanisms
- Five chart types supported (bar, line, pie, doughnut, radar)
- Complete API documentation
- Testing endpoints and tools