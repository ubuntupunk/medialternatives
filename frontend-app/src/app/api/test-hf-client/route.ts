import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

/**
 * GET /api/test-hf-client - Test Hugging Face API client
 *
 * Tests Hugging Face API connection and image generation capabilities.
 * Validates API token and model access permissions.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} API test results or error response
 */
export async function GET(request: NextRequest) {
  try {
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    
    if (!HF_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'HUGGINGFACE_API_TOKEN not found in environment'
      });
    }

    console.log('🧪 Testing Hugging Face client...');
    console.log('Token length:', HF_TOKEN.length);
    console.log('Token prefix:', HF_TOKEN.substring(0, 10));

    const hf = new HfInference(HF_TOKEN);

    // Test with a simple, fast model first
    console.log('📡 Testing with simple text generation...');
    
    try {
      // Skip text generation and go straight to image generation
      console.log('🎨 Testing image generation directly...');
      
      // Try with the most reliable Stable Diffusion model
      const imageResult = await hf.textToImage({
        model: "runwayml/stable-diffusion-v1-5",
        inputs: "a simple red apple on white background",
        parameters: {
          num_inference_steps: 10, // Fast generation
          guidance_scale: 7.5,
        }
      });

      console.log('✅ Image generation successful!');
      console.log('Image size:', imageResult.size, 'bytes');

      // Convert to base64 for response
      const buffer = await imageResult.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return NextResponse.json({
        success: true,
        message: 'Hugging Face client is working!',
        debug: {
          tokenValid: true,
          imageGenerated: true,
          imageSize: imageResult.size,
          imagePreview: `data:image/jpeg;base64,${base64.substring(0, 100)}...`, // Just preview
          model: "runwayml/stable-diffusion-v1-5",
          note: "Skipped text generation, focused on image generation"
        }
      });

    } catch (modelError) {
      console.error('❌ Model test failed:', modelError);
      
      return NextResponse.json({
        success: false,
        error: 'Model access failed',
        debug: {
          tokenExists: true,
          tokenLength: HF_TOKEN.length,
          errorMessage: modelError instanceof Error ? modelError.message : 'Unknown model error',
          suggestion: 'Try checking model access permissions or use a different model'
        }
      });
    }

  } catch (error) {
    console.error('❌ HF Client test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test HF client',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    });
  }
}