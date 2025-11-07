# Image Generation System Troubleshooting

## Current Issues Identified

### 1. 🤖 AI Model Information Not Visible
**Problem**: Users can't see which AI model is being used for image generation.

**Solution**: 
- Added debug console at `/dashboard/image-generator/debug`
- Shows model info: `black-forest-labs/FLUX.1-dev` (Hugging Face)
- Displays API status and environment information

### 2. 📸 Generated Images Not Updating Front Page
**Problem**: Generated images aren't being saved back to WordPress posts.

**Current Status**: 
- Images are generated but only stored temporarily
- WordPress.com API integration not implemented
- Posts still show original placeholder images

**Required Implementation**:
```typescript
// 1. Upload image to WordPress.com media library
const mediaResponse = await uploadToWordPressMedia(imageData);

// 2. Update post with new featured media ID  
const updateResponse = await updateWordPressPost(postId, mediaResponse.id);
```

### 3. 🎨 Generic Images vs Content-Relevant Images
**Problem**: Images appear generic and not related to content.

**Investigation**:
- ✅ Prompt generation IS working correctly
- ✅ Content analysis creates themed prompts
- ⚠️ May be using fallback placeholder images instead of AI-generated ones

**Debug Steps**:
1. Check if Hugging Face API token is configured
2. Verify API calls are reaching the AI service
3. Test prompt generation with debug console

## Debug Console Features

### Access
Navigate to: `/dashboard/image-generator/debug`

### Features
- **Test Image Generation**: Test with custom prompts
- **Environment Check**: Verify API token configuration
- **Debug Output**: See full API responses and errors
- **System Information**: Current model and API details

### Example Debug Output
```json
{
  "response": {
    "success": true,
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
    "prompt": "Climate change activism, environmental conservation, nature, green technology, sustainability, photorealistic, high quality photography, professional lighting, wide landscape format, banner style, high resolution, suitable for blog header",
    "settings": {
      "style": "photorealistic",
      "aspectRatio": "16:9",
      "quality": "high",
      "includeText": false
    }
  },
  "status": 200,
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

## Prompt Generation Analysis

### Content Theme Detection
The system analyzes post content and generates appropriate themes:

**Environmental Content**:
```
Input: "Climate change and agriculture"
Output: "Climate change agriculture, environmental conservation, nature, green technology, sustainability, photorealistic, high quality photography, professional lighting, wide landscape format, banner style"
```

**Media/Journalism Content**:
```
Input: "Journalism in digital age"  
Output: "Journalism digital age, professional journalism, newsroom, media coverage, broadcasting, photorealistic, high quality photography, professional lighting"
```

**Political/Activism Content**:
```
Input: "Community organizing protest"
Output: "Community organizing protest, political activism, social justice, community organizing, democratic participation, photorealistic, high quality photography"
```

## Configuration Requirements

### Environment Variables Needed
```bash
# Required for AI image generation
HUGGINGFACE_API_TOKEN=hf_your_token_here

# Optional for WordPress.com integration
WORDPRESS_COM_API_TOKEN=your_wordpress_token
WORDPRESS_COM_SITE_ID=your_site_id
```

### Hugging Face Setup
1. Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Add to `.env` file as `HUGGINGFACE_API_TOKEN=hf_your_token_here`
4. Restart development server

## Current System Flow

### Working Components ✅
1. **Prompt Generation**: Creates content-aware prompts
2. **Settings Configuration**: Style, aspect ratio, quality options
3. **UI Progress Tracking**: Real-time status updates
4. **Error Handling**: Graceful fallbacks and user feedback

### Missing Components ⚠️
1. **WordPress.com Integration**: Images not saved to posts
2. **Media Library Upload**: No persistent image storage
3. **Post Update API**: Featured image not updated in WordPress

### Fallback Behavior 🔄
When AI generation fails or token is missing:
- Uses themed placeholder images from Picsum
- Maintains aspect ratio and dimensions
- Shows in UI but doesn't persist to WordPress

## Testing Checklist

### Basic Functionality
- [ ] Can access debug console
- [ ] Environment check shows correct status
- [ ] Test generation produces output
- [ ] Prompt generation includes content themes
- [ ] Settings are applied to generation

### AI Integration
- [ ] Hugging Face token configured
- [ ] API calls successful (status 200)
- [ ] Generated images are actual AI output (not placeholders)
- [ ] Images match content themes

### WordPress Integration
- [ ] Generated images saved to WordPress.com
- [ ] Post featured images updated
- [ ] Images visible on front page
- [ ] Bulk processing updates all posts

## Next Steps

### Immediate Fixes
1. **Add HF Token**: Configure Hugging Face API token
2. **Test AI Generation**: Use debug console to verify
3. **Implement WordPress Integration**: Save images to posts

### WordPress.com API Integration
```typescript
// Required endpoints:
// POST /wp/v2/media - Upload image
// POST /wp/v2/posts/{id} - Update post featured_media

const uploadImage = async (imageData: string) => {
  const formData = new FormData();
  formData.append('file', base64ToBlob(imageData));
  
  const response = await fetch(`${WORDPRESS_API}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WORDPRESS_TOKEN}`
    },
    body: formData
  });
  
  return response.json();
};
```

### Long-term Improvements
1. **Image Storage**: Implement proper image hosting
2. **Batch Processing**: Optimize bulk operations
3. **Quality Control**: Add image approval workflow
4. **Analytics**: Track generation success rates

## Support

### Debug Console
Use `/dashboard/image-generator/debug` for:
- Testing individual generations
- Checking environment configuration
- Viewing detailed error messages
- Verifying prompt generation

### Log Analysis
Check browser console for:
- API request/response details
- Error messages and stack traces
- Prompt generation debug info
- Environment variable status

### Common Solutions

**"No images generated"**:
1. Check Hugging Face token configuration
2. Verify API connectivity
3. Test with debug console

**"Generic placeholder images"**:
1. Confirm AI API is being called
2. Check prompt generation in debug output
3. Verify token permissions

**"Images not on front page"**:
1. WordPress.com integration not implemented
2. Images only stored temporarily
3. Need to implement post update API

---

*Use the debug console to diagnose and resolve image generation issues.*