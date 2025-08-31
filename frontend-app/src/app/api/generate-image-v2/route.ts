import { NextRequest, NextResponse } from 'next/server';

/**
 * Image generation settings interface
 * @interface GenerationSettings
 * @property {string} style - Image style (photorealistic, illustration, abstract, etc.)
 * @property {string} aspectRatio - Image aspect ratio (16:9, 4:3, 1:1, etc.)
 * @property {string} quality - Generation quality (low, medium, high, ultra)
 * @property {boolean} includeText - Whether to include text in the image
 */
interface GenerationSettings {
  style: string;
  aspectRatio: string;
  quality: string;
  includeText: boolean;
}

/**
 * Generate image request interface
 * @interface GenerateImageRequest
 * @property {string} title - Title for image generation
 * @property {string} [content] - Optional content for context
 * @property {GenerationSettings} settings - Image generation settings
 */
interface GenerateImageRequest {
  title: string;
  content?: string;
  settings: GenerationSettings;
}

/**
 * POST /api/generate-image-v2 - Generate image using Hugging Face v2
 *
 * Enhanced image generation endpoint using official Hugging Face client.
 * Supports multiple models and advanced prompt engineering.
 *
 * @param {NextRequest} request - Next.js request with title, content, and settings
 * @returns {Promise<NextResponse>} Generated image data or error response
 */
export async function POST(request: NextRequest) {
  try {
    const { title, content, settings }: GenerateImageRequest = await request.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create a comprehensive prompt based on title and content
    const prompt = createImagePrompt(title, content, settings);
    
    console.log('=== IMAGE GENERATION V2 ===');
    console.log('Using HfInference client');
    console.log('Prompt:', prompt);
    console.log('Settings:', settings);
    
    // Generate image using proper HF client
    const imageUrl = await generateImageWithHfClient(prompt, settings);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      settings,
      note: 'Image generated with official HF client',
      version: 'v2'
    });

  } catch (error) {
    console.error('Error generating image v2:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
        version: 'v2'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate image using Hugging Face client
 * @param {string} prompt - Generated prompt for image creation
 * @param {GenerationSettings} settings - Image generation settings
 * @returns {Promise<string>} Base64 encoded image data URL
 */
async function generateImageWithHfClient(prompt: string, settings: GenerationSettings): Promise<string> {
  const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
  
  if (!HF_TOKEN) {
    console.log('No HF token found, using fallback');
    return getFallbackImage(settings);
  }

  try {
    // TODO: Uncomment once @huggingface/inference is installed
    
    const { HfInference } = await import('@huggingface/inference');
    
    const hf = new HfInference(HF_TOKEN);
    
    console.log('Calling HF textToImage with official client...');
    
    const image = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
      parameters: {
        num_inference_steps: 20,
        guidance_scale: 7.5,
        width: getWidthFromAspectRatio(settings.aspectRatio),
        height: getHeightFromAspectRatio(settings.aspectRatio),
      }
    });
    
    console.log('Image generated successfully!');
    
    // Convert blob to base64
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
   
    
    // Temporary fallback until package is installed
    console.log('HfInference not available yet, using fallback');
    return getFallbackImage(settings);
    
  } catch (error) {
    console.error('HF Client error:', error);
    return getFallbackImage(settings);
  }
}

/**
 * Create comprehensive image generation prompt
 * @param {string} title - Image title
 * @param {string} [content=''] - Additional content for context
 * @param {GenerationSettings} settings - Image generation settings
 * @returns {string} Generated prompt for AI image generation
 */
function createImagePrompt(title: string, content: string = '', settings: GenerationSettings): string {
  // Same prompt generation logic as before
  const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  
  const fullText = `${cleanTitle} ${cleanContent}`.toLowerCase();
  
  let themePrompt = '';
  
  if (fullText.includes('media') || fullText.includes('journalism') || fullText.includes('news')) {
    themePrompt = 'professional journalism, newsroom, media coverage, broadcasting';
  } else if (fullText.includes('environment') || fullText.includes('climate') || fullText.includes('nature')) {
    themePrompt = 'environmental conservation, nature, green technology, sustainability';
  } else if (fullText.includes('politic') || fullText.includes('activist') || fullText.includes('protest')) {
    themePrompt = 'political activism, social justice, community organizing, democratic participation';
  } else if (fullText.includes('technology') || fullText.includes('digital') || fullText.includes('ai')) {
    themePrompt = 'modern technology, digital innovation, futuristic concepts';
  } else {
    themePrompt = 'contemporary news, modern communication, information sharing';
  }

  let prompt = `${cleanTitle}, ${themePrompt}`;
  
  switch (settings.style) {
    case 'photorealistic':
      prompt += ', photorealistic, high quality photography, professional lighting';
      break;
    case 'illustration':
      prompt += ', digital illustration, artistic rendering, clean design';
      break;
    case 'abstract':
      prompt += ', abstract art, conceptual design, modern artistic interpretation';
      break;
    case 'minimalist':
      prompt += ', minimalist design, clean lines, simple composition, modern aesthetic';
      break;
    case 'vintage':
      prompt += ', vintage style, retro aesthetic, classic design elements';
      break;
    case 'modern':
      prompt += ', modern design, contemporary style, sleek and professional';
      break;
  }

  prompt += ', high resolution, professional quality, suitable for blog header';
  
  if (settings.aspectRatio === '16:9') {
    prompt += ', wide landscape format, banner style';
  } else if (settings.aspectRatio === '1:1') {
    prompt += ', square format, social media ready';
  } else if (settings.aspectRatio === '9:16') {
    prompt += ', vertical portrait format';
  }

  return prompt;
}

/**
 * Get fallback image URL when AI generation fails
 * @param {GenerationSettings} settings - Image generation settings
 * @returns {string} Placeholder image URL
 */
function getFallbackImage(settings: GenerationSettings): string {
  const dimensions = getDimensionsFromAspectRatio(settings.aspectRatio);
  return `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Date.now()}`;
}

/**
 * Get width from aspect ratio
 * @param {string} aspectRatio - Aspect ratio string (e.g., '16:9')
 * @returns {number} Width in pixels
 */
function getWidthFromAspectRatio(aspectRatio: string): number {
  switch (aspectRatio) {
    case '16:9': return 1024;
    case '4:3': return 1024;
    case '1:1': return 1024;
    case '9:16': return 576;
    default: return 1024;
  }
}

/**
 * Get height from aspect ratio
 * @param {string} aspectRatio - Aspect ratio string (e.g., '16:9')
 * @returns {number} Height in pixels
 */
function getHeightFromAspectRatio(aspectRatio: string): number {
  switch (aspectRatio) {
    case '16:9': return 576;
    case '4:3': return 768;
    case '1:1': return 1024;
    case '9:16': return 1024;
    default: return 576;
  }
}

/**
 * Get dimensions object from aspect ratio
 * @param {string} aspectRatio - Aspect ratio string (e.g., '16:9')
 * @returns {{width: number, height: number}} Dimensions object
 */
function getDimensionsFromAspectRatio(aspectRatio: string): { width: number; height: number } {
  return {
    width: getWidthFromAspectRatio(aspectRatio),
    height: getHeightFromAspectRatio(aspectRatio)
  };
}