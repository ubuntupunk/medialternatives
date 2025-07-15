import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

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
      // Test with text generation first (faster and more reliable)
      const textResult = await hf.textGeneration({
        model: 'gpt2',
        inputs: 'The quick brown fox',
        parameters: {
          max_new_tokens: 10,
          temperature: 0.7,
        }
      });

      console.log('✅ Text generation successful:', textResult);

      // Now test image generation with a simple model
      console.log('🎨 Testing image generation...');
      
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
          textGeneration: textResult.generated_text,
          imageGenerated: true,
          imageSize: imageResult.size,
          imagePreview: `data:image/jpeg;base64,${base64.substring(0, 100)}...` // Just preview
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