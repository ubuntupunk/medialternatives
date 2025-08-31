import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/test-hf-simple - Simple Hugging Face token validation
 *
 * Tests Hugging Face API token by checking account information.
 * Uses a simpler endpoint to validate token without generating images.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Token validation results or error response
 */
export async function GET(request: NextRequest) {
  try {
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    
    if (!HF_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'No HF token found'
      });
    }

    console.log('Testing HF token with account info endpoint...');
    
    // Test with the account info endpoint first (simpler)
    const accountResponse = await fetch(
      'https://huggingface.co/api/whoami-v2',
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
        },
      }
    );

    console.log('Account API Status:', accountResponse.status);

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log('Account data:', accountData);
      
      return NextResponse.json({
        success: true,
        message: 'HF token is valid!',
        accountInfo: {
          name: accountData.name,
          type: accountData.type,
          // Don't expose full account data
        }
      });
    } else {
      const errorText = await accountResponse.text();
      console.log('Account API Error:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'HF token validation failed',
        debug: {
          status: accountResponse.status,
          error: errorText
        }
      });
    }

  } catch (error) {
    console.error('HF Token Test Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test HF token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}