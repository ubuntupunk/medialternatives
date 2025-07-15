import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    
    console.log('=== HF TOKEN DEBUG ===');
    console.log('Token exists:', !!HF_TOKEN);
    console.log('Token length:', HF_TOKEN?.length || 0);
    console.log('Token prefix:', HF_TOKEN?.substring(0, 10) || 'NOT_FOUND');
    console.log('Full token (first 20 chars):', HF_TOKEN?.substring(0, 20) || 'NOT_FOUND');
    
    if (!HF_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'HUGGINGFACE_API_TOKEN not found in environment',
        debug: {
          nodeEnv: process.env.NODE_ENV,
          allEnvKeys: Object.keys(process.env).filter(key => 
            key.toLowerCase().includes('hf') || 
            key.toLowerCase().includes('hugging') ||
            key.toLowerCase().includes('token')
          )
        }
      });
    }

    // Test the token with a simpler, publicly available model first
    console.log('Testing HF API with token using a public model...');
    
    // Try with a more accessible model first
    const testResponse = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'a simple test image of a cat',
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 20,
            width: 512,
            height: 512,
          }
        }),
      }
    );

    console.log('HF API Response Status:', testResponse.status);
    console.log('HF API Response Headers:', Object.fromEntries(testResponse.headers.entries()));

    if (testResponse.ok) {
      const contentType = testResponse.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (contentType?.includes('image')) {
        const imageBlob = await testResponse.blob();
        console.log('Image blob size:', imageBlob.size);
        
        return NextResponse.json({
          success: true,
          message: 'HF API is working!',
          debug: {
            tokenExists: true,
            tokenLength: HF_TOKEN.length,
            tokenPrefix: HF_TOKEN.substring(0, 10),
            apiStatus: testResponse.status,
            imageSize: imageBlob.size,
            contentType
          }
        });
      } else {
        const responseText = await testResponse.text();
        console.log('Non-image response:', responseText);
        
        return NextResponse.json({
          success: false,
          message: 'HF API returned non-image response',
          debug: {
            tokenExists: true,
            apiStatus: testResponse.status,
            responseText: responseText.substring(0, 500),
            contentType
          }
        });
      }
    } else {
      const errorText = await testResponse.text();
      console.log('HF API Error:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'HF API request failed',
        debug: {
          tokenExists: true,
          tokenLength: HF_TOKEN.length,
          apiStatus: testResponse.status,
          errorText: errorText.substring(0, 500)
        }
      });
    }

  } catch (error) {
    console.error('Test HF Token Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test HF token',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    });
  }
}