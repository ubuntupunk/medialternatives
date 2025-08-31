import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

/**
 * POST /api/avatars/upload - Upload user avatar to Vercel Blob storage
 *
 * Handles avatar image uploads with validation and storage to Vercel Blob.
 * Supports PNG, JPEG, GIF, and WebP formats with size limits.
 *
 * @param {NextRequest} request - Next.js request containing FormData with avatar file
 * @returns {Promise<NextResponse>} Upload result with URL or error response
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;
    const metadata = formData.get('metadata') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: avatar and userId' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate filename
    const filename = `avatars/${userId}.png`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false, // Keep consistent filename for user
    });

    // Parse metadata if provided
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        console.warn('Failed to parse metadata:', error);
      }
    }

    // Store metadata in database if needed
    // await saveAvatarMetadata(userId, {
    //   url: blob.url,
    //   filename: blob.pathname,
    //   size: file.size,
    //   mimeType: file.type,
    //   uploadedAt: new Date(),
    //   ...parsedMetadata
    // });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      mimeType: file.type,
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}