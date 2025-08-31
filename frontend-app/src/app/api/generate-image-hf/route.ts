import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

interface GenerationSettings {
  style: string;
  aspectRatio: string;
  quality: string;
  includeText: boolean;
}

interface GenerateImageRequest {
  title: string;
  content?: string;
  settings: GenerationSettings;
}

export async function POST(request: NextRequest) {
  // TEMPORARILY DISABLED: High CPU usage on Vercel Free Tier
  // This route uses FLUX.1-dev AI model which consumes excessive CPU
  return NextResponse.json(
    {
      error: 'Image generation temporarily disabled due to high CPU usage',
      message: 'This feature has been disabled to prevent exceeding Vercel Free Tier limits',
      suggestion: 'Consider upgrading to Vercel Pro or using a dedicated image generation service'
    },
    { status: 503 }
  );

  /* ORIGINAL CODE - COMMENTED OUT FOR CPU OPTIMIZATION
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

    console.log('=== HUGGING FACE CLIENT IMAGE GENERATION ===');
    console.log('Generated Prompt:', prompt);
    console.log('Settings:', settings);

    // Generate image using official HF client
    const imageUrl = await generateImageWithHfClient(prompt, settings);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      settings,
      note: 'Image generated using official Hugging Face client'
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
  */
}

async function generateImageWithHfClient(prompt: string, settings: GenerationSettings): Promise<string> {
  const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
  
  if (!HF_TOKEN) {
    console.log('⚠️ No Hugging Face token found, using fallback');
    return getFallbackImage(settings);
  }

  try {
    console.log('🤖 Initializing Hugging Face client...');
    const hf = new HfInference(HF_TOKEN);
    
    console.log('📡 Calling textToImage with FLUX.1-dev...');
    
    // Use the official client method
    const image = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
      parameters: {
        num_inference_steps: settings.quality === 'ultra' ? 50 : settings.quality === 'high' ? 30 : 20,
        guidance_scale: 7.5,
        width: getWidthFromAspectRatio(settings.aspectRatio),
        height: getHeightFromAspectRatio(settings.aspectRatio),
      }
    });

    console.log('✅ Image generated successfully!');
    console.log('Image type:', image.constructor.name);
    console.log('Image size:', image.size, 'bytes');

    // Convert blob to base64 data URL
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    return dataUrl;

  } catch (error) {
    console.error('❌ Hugging Face client error:', error);
    
    // Try with a more accessible model as fallback
    try {
      console.log('🔄 Trying with Stable Diffusion 2.1...');
      const hf = new HfInference(HF_TOKEN);
      
      const image = await hf.textToImage({
        model: "stabilityai/stable-diffusion-2-1",
        inputs: prompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5,
        }
      });

      console.log('✅ Fallback model worked!');
      const buffer = await image.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:image/jpeg;base64,${base64}`;

    } catch (fallbackError) {
      console.error('❌ Fallback model also failed:', fallbackError);
      return getFallbackImage(settings);
    }
  }
}

function createImagePrompt(title: string, content: string = '', settings: GenerationSettings): string {
  // Extract key themes and concepts from title and content
  const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  
  // Combine title and content for context
  const fullText = `${cleanTitle} ${cleanContent}`.toLowerCase();
  
  // Determine image style based on content themes
  let themePrompt = '';
  
  // Media/journalism themes
  if (fullText.includes('media') || fullText.includes('journalism') || fullText.includes('news')) {
    themePrompt = 'professional journalism, newsroom, media coverage, broadcasting';
  }
  // Environment themes
  else if (fullText.includes('environment') || fullText.includes('climate') || fullText.includes('nature')) {
    themePrompt = 'environmental conservation, nature, green technology, sustainability';
  }
  // Politics/activism themes
  else if (fullText.includes('politic') || fullText.includes('activist') || fullText.includes('protest')) {
    themePrompt = 'political activism, social justice, community organizing, democratic participation';
  }
  // Technology themes
  else if (fullText.includes('technology') || fullText.includes('digital') || fullText.includes('ai')) {
    themePrompt = 'modern technology, digital innovation, futuristic concepts';
  }
  // Default to general news/media theme
  else {
    themePrompt = 'contemporary news, modern communication, information sharing';
  }

  // Build the complete prompt
  let prompt = `${cleanTitle}, ${themePrompt}`;
  
  // Add style modifiers
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

  // Add quality and technical specifications
  prompt += ', high resolution, professional quality, suitable for blog header';
  
  // Add aspect ratio context
  if (settings.aspectRatio === '16:9') {
    prompt += ', wide landscape format, banner style';
  } else if (settings.aspectRatio === '1:1') {
    prompt += ', square format, social media ready';
  } else if (settings.aspectRatio === '9:16') {
    prompt += ', vertical portrait format';
  }

  return prompt;
}

function getWidthFromAspectRatio(aspectRatio: string): number {
  switch (aspectRatio) {
    case '16:9': return 1024;
    case '4:3': return 1024;
    case '1:1': return 1024;
    case '9:16': return 576;
    default: return 1024;
  }
}

function getHeightFromAspectRatio(aspectRatio: string): number {
  switch (aspectRatio) {
    case '16:9': return 576;
    case '4:3': return 768;
    case '1:1': return 1024;
    case '9:16': return 1024;
    default: return 576;
  }
}

function getFallbackImage(settings: GenerationSettings): string {
  const dimensions = {
    width: getWidthFromAspectRatio(settings.aspectRatio),
    height: getHeightFromAspectRatio(settings.aspectRatio)
  };
  
  console.log('🔄 Using fallback placeholder image');
  return `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Date.now()}`;
}