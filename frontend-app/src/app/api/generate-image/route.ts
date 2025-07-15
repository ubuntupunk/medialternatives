import { NextRequest, NextResponse } from 'next/server';

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
    
    // For now, we'll use a mock response with a placeholder
    // In production, this would call an AI image generation service
    const imageUrl = await generateImageWithAI(prompt, settings);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      settings,
      note: 'Image generated successfully'
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

async function generateImageWithAI(prompt: string, settings: GenerationSettings): Promise<string> {
  // TODO: Integrate with actual AI image generation service
  // Options include:
  // 1. OpenAI DALL-E API
  // 2. Stability AI (Stable Diffusion)
  // 3. Midjourney API
  // 4. Hugging Face Inference API
  // 5. Replicate API
  
  const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
  
  if (HF_TOKEN) {
    try {
      // Use Hugging Face Inference API
      const response = await fetch(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
        {
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 50,
              width: getWidthFromAspectRatio(settings.aspectRatio),
              height: getHeightFromAspectRatio(settings.aspectRatio),
            }
          }),
        }
      );

      if (response.ok) {
        const imageBlob = await response.blob();
        // In a real implementation, you'd upload this to your storage service
        // For now, we'll return a data URL
        const buffer = await imageBlob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64}`;
      }
    } catch (error) {
      console.error('Hugging Face API error:', error);
    }
  }

  // Fallback to a themed placeholder image
  const dimensions = getDimensionsFromAspectRatio(settings.aspectRatio);
  const themeColor = getThemeColor(prompt);
  
  return `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Date.now()}&blur=1&grayscale=1`;
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

function getDimensionsFromAspectRatio(aspectRatio: string): { width: number; height: number } {
  return {
    width: getWidthFromAspectRatio(aspectRatio),
    height: getHeightFromAspectRatio(aspectRatio)
  };
}

function getThemeColor(prompt: string): string {
  if (prompt.includes('environment') || prompt.includes('nature')) return '4ade80'; // green
  if (prompt.includes('technology') || prompt.includes('digital')) return '3b82f6'; // blue
  if (prompt.includes('politics') || prompt.includes('activism')) return 'ef4444'; // red
  if (prompt.includes('media') || prompt.includes('journalism')) return '8b5cf6'; // purple
  return '6b7280'; // gray default
}