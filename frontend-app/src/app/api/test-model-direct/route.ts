import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

interface TestModelRequest {
  model: string;
  prompt: string;
  type: 'image' | 'text';
}

export async function POST(request: NextRequest) {
  try {
    const { model, prompt, type }: TestModelRequest = await request.json();
    
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    
    if (!HF_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'HUGGINGFACE_API_TOKEN not found in environment'
      });
    }

    if (!model || !prompt) {
      return NextResponse.json({
        success: false,
        error: 'Model and prompt are required'
      });
    }

    console.log(`🧪 Testing model: ${model}`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🎯 Type: ${type}`);
    console.log(`🔑 Token length: ${HF_TOKEN.length}`);

    const hf = new HfInference(HF_TOKEN);

    if (type === 'text') {
      console.log('📝 Testing text generation...');
      
      try {
        const result = await hf.textGeneration({
          model: model,
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            return_full_text: false
          }
        });

        console.log('✅ Text generation successful');
        
        return NextResponse.json({
          success: true,
          type: 'text',
          model: model,
          result: result.generated_text,
          debug: {
            tokenLength: HF_TOKEN.length,
            tokenPrefix: HF_TOKEN.substring(0, 8),
            prompt: prompt
          }
        });

      } catch (textError) {
        console.error('❌ Text generation failed:', textError);
        
        return NextResponse.json({
          success: false,
          error: 'Text generation failed',
          debug: {
            model: model,
            errorMessage: textError instanceof Error ? textError.message : 'Unknown error',
            tokenExists: true,
            tokenLength: HF_TOKEN.length
          }
        });
      }

    } else {
      console.log('🎨 Testing image generation...');
      
      try {
        const result = await hf.textToImage({
          model: model,
          inputs: prompt,
          parameters: {
            num_inference_steps: 10, // Fast generation for testing
            guidance_scale: 7.5,
          }
        });

        console.log('✅ Image generation successful');
        console.log('📏 Image size:', result.size, 'bytes');

        // Convert to base64 for display
        const buffer = await result.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        return NextResponse.json({
          success: true,
          type: 'image',
          model: model,
          imageUrl: dataUrl,
          debug: {
            tokenLength: HF_TOKEN.length,
            tokenPrefix: HF_TOKEN.substring(0, 8),
            imageSize: result.size,
            prompt: prompt
          }
        });

      } catch (imageError) {
        console.error('❌ Image generation failed:', imageError);
        
        return NextResponse.json({
          success: false,
          error: 'Image generation failed',
          debug: {
            model: model,
            errorMessage: imageError instanceof Error ? imageError.message : 'Unknown error',
            tokenExists: true,
            tokenLength: HF_TOKEN.length,
            suggestion: 'Try a different model or check if this model requires special access'
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ Model test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test model',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    });
  }
}