import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Debug environment variables (be careful not to expose sensitive data in production)
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    HF_TOKEN_EXISTS: !!process.env.HUGGINGFACE_API_TOKEN,
    HF_TOKEN_LENGTH: process.env.HUGGINGFACE_API_TOKEN?.length || 0,
    HF_TOKEN_PREFIX: process.env.HUGGINGFACE_API_TOKEN?.substring(0, 8) || 'NOT_FOUND',
    ALL_ENV_KEYS: Object.keys(process.env).filter(key => 
      key.includes('HF') || 
      key.includes('HUGGING') || 
      key.includes('TOKEN')
    ),
    CURRENT_WORKING_DIR: process.cwd(),
    ENV_FILES_CHECKED: ['.env', '.env.local', '.env.development', '.env.production']
  };

  return NextResponse.json({
    success: true,
    debug: envDebug,
    note: 'Environment debug information - do not expose in production'
  });
}