import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { createAPIResponse } from '@/lib/validation';

/**
 * POST /api/images/generate - Consolidated Image Generation Endpoint
 *
 * Unified endpoint for all image generation functionality.
 * Supports multiple models and use cases through query parameters.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Generated image or error response
 *
 * @swagger
 * /api/images/generate:
 *   post:
 *     summary: Generate images using various AI models
 *     description: Unified endpoint for image generation with support for multiple models and use cases
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *           enum: [hf, v2, post]
 *           default: hf
 *         description: AI model to use for generation
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [general, post, avatar]
 *           default: general
 *         description: Type of image to generate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Text prompt for image generation
 *               width:
 *                 type: integer
 *                 minimum: 256
 *                 maximum: 1024
 *                 default: 512
 *               height:
 *                 type: integer
 *                 minimum: 256
 *                 maximum: 1024
 *                 default: 512
 *               style:
 *                 type: string
 *                 description: Image style preference
 *     responses:
 *       200:
 *         description: Image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         imageUrl:
 *                           type: string
 *                           format: uri
 *                         model:
 *                           type: string
 *                         generationTime:
 *                           type: number
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Generation failed
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for image generation (resource intensive)
    const rateLimit = createRateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50, // 50 images per hour
      message: 'Image generation rate limit exceeded. Please try again later.',
      statusCode: 429
    });

    const rateLimitResponse = await rateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model') || 'hf';
    const type = searchParams.get('type') || 'general';

    const body = await request.json();
    const { prompt, width = 512, height = 512, style } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(createAPIResponse(false, undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Prompt is required and must be at least 3 characters',
        details: 'Please provide a descriptive prompt for image generation'
      }), { status: 400 });
    }

    // Route to appropriate generation method based on model
    let result;
    switch (model) {
      case 'hf':
        result = await generateWithHuggingFace(prompt, width, height, style);
        break;
      case 'v2':
        result = await generateWithV2(prompt, width, height, style);
        break;
      case 'post':
        result = await generatePostImage(prompt, width, height, style);
        break;
      default:
        return NextResponse.json(createAPIResponse(false, undefined, {
          code: 'INVALID_MODEL',
          message: `Unsupported model: ${model}`,
          details: 'Supported models: hf, v2, post'
        }), { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json(createAPIResponse(false, undefined, {
        code: 'GENERATION_FAILED',
        message: 'Image generation failed',
        details: result.error
      }), { status: 500 });
    }

    const successResponse = createAPIResponse(true, {
      imageUrl: result.imageUrl,
      model,
      type,
      generationTime: result.generationTime,
      dimensions: { width, height }
    });

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(createAPIResponse(false, undefined, {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error during image generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}

/**
 * Generate image using HuggingFace model
 */
async function generateWithHuggingFace(
  prompt: string,
  width: number,
  height: number,
  style?: string
): Promise<{ success: boolean; imageUrl?: string; generationTime?: number; error?: string }> {
  try {
    const startTime = Date.now();

    // This would integrate with HuggingFace Inference API
    // For now, return a mock response
    const generationTime = Date.now() - startTime;

    return {
      success: true,
      imageUrl: `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(prompt)}`,
      generationTime
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'HuggingFace generation failed'
    };
  }
}

/**
 * Generate image using V2 model
 */
async function generateWithV2(
  prompt: string,
  width: number,
  height: number,
  style?: string
): Promise<{ success: boolean; imageUrl?: string; generationTime?: number; error?: string }> {
  try {
    const startTime = Date.now();

    // This would integrate with V2 image generation API
    // For now, return a mock response
    const generationTime = Date.now() - startTime;

    return {
      success: true,
      imageUrl: `https://via.placeholder.com/${width}x${height}?text=V2+${encodeURIComponent(prompt)}`,
      generationTime
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'V2 generation failed'
    };
  }
}

/**
 * Generate post image
 */
async function generatePostImage(
  prompt: string,
  width: number,
  height: number,
  style?: string
): Promise<{ success: boolean; imageUrl?: string; generationTime?: number; error?: string }> {
  try {
    const startTime = Date.now();

    // This would integrate with post-specific image generation
    // For now, return a mock response
    const generationTime = Date.now() - startTime;

    return {
      success: true,
      imageUrl: `https://via.placeholder.com/${width}x${height}?text=Post+${encodeURIComponent(prompt)}`,
      generationTime
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Post image generation failed'
    };
  }
}