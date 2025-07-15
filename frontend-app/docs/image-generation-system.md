# AI Image Generation System Documentation

## Overview

The AI Image Generation System is a comprehensive solution for creating custom images for blog posts using artificial intelligence. It replaces placeholder images (like picsum.photos) with content-relevant, professionally generated images.

## System Architecture

### Components Structure
```
src/
├── app/
│   ├── dashboard/image-generator/
│   │   └── page.tsx                    # Main dashboard page
│   └── api/
│       ├── generate-image/
│       │   └── route.ts                # Single image generation API
│       ├── generate-post-image/
│       │   └── route.ts                # Post-specific image generation
│       └── posts-with-placeholders/
│           └── route.ts                # Find posts needing images
├── components/
│   └── ImageGenerator/
│       ├── ImageGenerator.tsx          # Main component
│       └── index.ts                    # Exports
└── hooks/
    └── useImageGenerator.ts            # Custom hooks
```

## Features

### 1. Single Image Generation
- **Input**: Post title and content
- **Output**: AI-generated image matching content theme
- **Customization**: Style, aspect ratio, quality settings
- **Preview**: Real-time image preview with download options

### 2. Bulk Image Processing
- **Detection**: Automatically finds posts with placeholder images
- **Processing**: Generates images for multiple posts in sequence
- **Progress**: Real-time progress tracking with statistics
- **Error Handling**: Graceful handling of failed generations

### 3. Smart Content Analysis
- **Theme Detection**: Analyzes content for media, environment, politics, tech themes
- **Prompt Engineering**: Creates detailed AI prompts based on content
- **Style Matching**: Selects appropriate visual styles for content type

## API Endpoints

### POST /api/generate-image
Generates a single image based on title and content.

**Request Body:**
```json
{
  "title": "Climate Change Impact on Agriculture",
  "content": "Article content about environmental issues...",
  "settings": {
    "style": "photorealistic",
    "aspectRatio": "16:9",
    "quality": "high",
    "includeText": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "prompt": "Climate change agriculture, environmental conservation...",
  "settings": { ... },
  "note": "Image generated successfully"
}
```

### POST /api/generate-post-image
Generates an image for a specific WordPress post.

**Request Body:**
```json
{
  "postId": 123,
  "title": "Post Title",
  "content": "Post content...",
  "excerpt": "Post excerpt..."
}
```

**Response:**
```json
{
  "success": true,
  "postId": 123,
  "imageUrl": "generated_image_url",
  "prompt": "Generated prompt",
  "status": "generated"
}
```

### GET /api/posts-with-placeholders
Finds posts that have placeholder or missing featured images.

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 123,
      "title": { "rendered": "Post Title" },
      "featured_image_url": "https://picsum.photos/600/400",
      "needs_image": true,
      "placeholder_type": "picsum"
    }
  ],
  "total": 5
}
```

## Configuration

### Environment Variables
```bash
# Required for AI image generation
HUGGINGFACE_API_TOKEN=your_huggingface_token

# Optional for other AI services
OPENAI_API_KEY=your_openai_key
STABILITY_AI_KEY=your_stability_key
```

### Generation Settings
```typescript
interface GenerationSettings {
  style: 'photorealistic' | 'illustration' | 'abstract' | 'minimalist' | 'vintage' | 'modern';
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  quality: 'standard' | 'high' | 'ultra';
  includeText: boolean;
}
```

## Usage Guide

### Dashboard Access
1. **Login**: Use admin credentials to access dashboard
2. **Navigate**: Go to Dashboard → Image Generator
3. **View Statistics**: See posts needing images and generation progress

### Single Image Generation
1. **Enter Content**: Provide post title and optional content
2. **Configure Settings**: Choose style, aspect ratio, and quality
3. **Generate**: Click "Generate Image" button
4. **Download**: Save generated image or copy URL

### Bulk Processing
1. **Review Posts**: Check list of posts needing images
2. **Start Bulk**: Click "Bulk Generate" button
3. **Monitor Progress**: Watch real-time processing statistics
4. **Handle Errors**: Retry failed generations individually

## Prompt Engineering

### Theme Detection
The system analyzes content to determine appropriate themes:

- **Media/Journalism**: Professional newsroom, broadcasting themes
- **Environment**: Nature, conservation, sustainability themes
- **Politics/Activism**: Social justice, community organizing themes
- **Technology**: Digital innovation, futuristic concepts
- **Default**: Contemporary news and communication themes

### Prompt Structure
```
[Title] + [Theme Keywords] + [Style Modifiers] + [Technical Specs]
```

**Example:**
```
"Climate change agriculture, environmental conservation, nature, 
green technology, sustainability, photorealistic, high quality 
photography, professional lighting, wide landscape format, 
banner style, high resolution, suitable for blog header"
```

## AI Service Integration

### Hugging Face (Default)
- **Model**: black-forest-labs/FLUX.1-dev
- **API**: Inference API
- **Setup**: Add `HUGGINGFACE_API_TOKEN` to environment

### OpenAI DALL-E (Future)
- **Model**: dall-e-3
- **API**: OpenAI API
- **Setup**: Add `OPENAI_API_KEY` to environment

### Stability AI (Future)
- **Model**: stable-diffusion-xl
- **API**: Stability AI API
- **Setup**: Add `STABILITY_AI_KEY` to environment

## Error Handling

### Common Issues
1. **Missing API Token**: Falls back to themed placeholder images
2. **API Rate Limits**: Implements retry logic with delays
3. **Invalid Content**: Provides helpful error messages
4. **Network Errors**: Graceful degradation to fallback images

### Fallback System
When AI generation fails:
1. **Themed Placeholders**: Uses color-coded placeholder images
2. **Error Logging**: Logs errors for debugging
3. **User Feedback**: Clear error messages to users
4. **Retry Options**: Allows manual retry of failed generations

## Testing

### Component Tests
```bash
# Run image generator component tests
npm test ImageGenerator

# Run hook tests
npm test useImageGenerator
```

### API Tests
```bash
# Test image generation endpoints
npm run test:api

# Test with mock data
npm run test:api:mock
```

### Integration Tests
```bash
# Test full workflow
npm run test:integration
```

## Performance Considerations

### Image Generation
- **Processing Time**: 5-30 seconds per image depending on AI service
- **Rate Limiting**: Respects API limits with delays between requests
- **Caching**: Generated images cached to prevent regeneration
- **Optimization**: Images optimized for web delivery

### Bulk Processing
- **Sequential Processing**: Processes one image at a time to avoid overwhelming APIs
- **Progress Tracking**: Real-time updates on processing status
- **Error Recovery**: Continues processing even if individual images fail
- **Resource Management**: Monitors memory usage during bulk operations

## Security

### API Security
- **Authentication**: Requires admin login for dashboard access
- **Input Validation**: Sanitizes all user inputs
- **Rate Limiting**: Prevents abuse of image generation APIs
- **Error Handling**: Doesn't expose sensitive error details

### Content Safety
- **Content Filtering**: Analyzes content for inappropriate themes
- **Prompt Sanitization**: Removes potentially harmful prompt elements
- **Image Validation**: Validates generated images before storage
- **Audit Logging**: Logs all generation requests for review

## Monitoring

### Metrics
- **Generation Success Rate**: Percentage of successful image generations
- **Processing Time**: Average time per image generation
- **API Usage**: Tracking of AI service API calls and costs
- **Error Rates**: Monitoring of failed generations and reasons

### Alerts
- **API Failures**: Notifications when AI services are unavailable
- **High Error Rates**: Alerts when generation failure rate exceeds threshold
- **Resource Usage**: Monitoring of memory and processing usage
- **Cost Tracking**: Alerts for high AI service usage costs

## Troubleshooting

### Common Problems

#### "Failed to generate image"
- **Check**: API token configuration
- **Verify**: Network connectivity to AI service
- **Review**: Content for inappropriate themes
- **Try**: Regenerating with different settings

#### "Posts not loading"
- **Check**: WordPress.com API connectivity
- **Verify**: Authentication credentials
- **Review**: API rate limits
- **Try**: Refreshing the posts list

#### "Bulk processing stuck"
- **Check**: Individual post generation errors
- **Verify**: API rate limits not exceeded
- **Review**: Network connectivity
- **Try**: Restarting bulk process

### Debug Mode
Enable debug logging by setting:
```bash
NEXT_PUBLIC_DEBUG_MODE=true
```

This provides detailed logging of:
- API requests and responses
- Prompt generation process
- Error details and stack traces
- Performance metrics

## Future Enhancements

### Planned Features
1. **WordPress Integration**: Direct upload to WordPress.com media library
2. **Style Learning**: AI learns from existing site images
3. **Batch Scheduling**: Schedule bulk processing during off-peak hours
4. **A/B Testing**: Test different image styles for engagement
5. **Image Optimization**: Automatic compression and format optimization

### API Improvements
1. **Webhook Support**: Real-time notifications of generation completion
2. **Batch API**: Process multiple images in single API call
3. **Custom Models**: Train custom AI models on site-specific content
4. **Image Variants**: Generate multiple versions for A/B testing

### UI Enhancements
1. **Drag & Drop**: Upload reference images for style matching
2. **Preview Gallery**: Browse previously generated images
3. **Style Templates**: Save and reuse generation settings
4. **Advanced Editor**: Fine-tune generated images before use

## Support

### Documentation
- **API Reference**: Detailed API documentation with examples
- **Component Guide**: React component usage examples
- **Hook Documentation**: Custom hook usage and examples
- **Troubleshooting**: Common issues and solutions

### Community
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community support and best practices
- **Examples**: Sample implementations and use cases
- **Tutorials**: Step-by-step guides for common tasks

---

*Last Updated: December 2024*
*Version: 1.0.0*