import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

/**
 * GET /api/test-simple-image - Test simple image generation
 *
 * Tests Hugging Face image generation with multiple fallback models.
 * Attempts different Stable Diffusion models in order of reliability.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Image generation test results or error response
 */
export async function GET(request: NextRequest) {
  try {
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    
    if (!HF_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'HUGGINGFACE_API_TOKEN not found'
      });
    }

    console.log('🧪 Testing simple image generation...');
    const hf = new HfInference(HF_TOKEN);

    // Try multiple models in order of reliability
    const modelsToTry = [
      "runwayml/stable-diffusion-v1-5",
      "stabilityai/stable-diffusion-2-1",
      "CompVis/stable-diffusion-v1-4"
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`🎨 Trying model: ${model}`);
        
        const imageResult = await hf.textToImage({
          model: model,
          inputs: "a red apple",
          parameters: {
            num_inference_steps: 10,
            guidance_scale: 7.5,
          }
        });

        console.log(`✅ Success with ${model}!`);
        console.log('Image size:', imageResult.size, 'bytes');

        // Convert to base64 for response
        const buffer = await imageResult.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        return NextResponse.json({
          success: true,
          message: `Image generation working with ${model}!`,
          debug: {
            tokenValid: true,
            workingModel: model,
            imageGenerated: true,
            imageSize: imageResult.size,
            fullImage: `data:image/jpeg;base64,${base64}` // Full image for testing
          }
        });

      } catch (modelError) {
        console.log(`❌ ${model} failed:`, modelError instanceof Error ? modelError.message : 'Unknown error');
        continue; // Try next model
      }
    }

    // If all models failed
    return NextResponse.json({
      success: false,
      error: 'All image models failed',
      debug: {
        tokenExists: true,
        tokenLength: HF_TOKEN.length,
        modelsAttempted: modelsToTry,
        suggestion: 'Token may not have inference permissions or models are unavailable'
      }
    });

  } catch (error) {
    console.error('❌ Simple image test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test image generation',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}