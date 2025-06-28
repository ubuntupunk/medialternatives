import { NextRequest, NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Construct the expected blob URL
    const filename = `avatars/${userId}.png`;
    const baseUrl = process.env.BLOB_READ_WRITE_TOKEN ? 
      `https://${process.env.VERCEL_URL || 'localhost:3000'}` : 
      'https://your-app.vercel.app';
    
    const url = `${baseUrl}/_vercel/blob/${filename}`;

    try {
      // Check if the blob exists
      await head(url);
      
      return NextResponse.json({
        success: true,
        url: url,
        userId: userId,
      });
    } catch (error) {
      // Blob doesn't exist
      return NextResponse.json(
        { error: 'Avatar not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Avatar fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Construct the blob URL to delete
    const filename = `avatars/${userId}.png`;
    const baseUrl = process.env.BLOB_READ_WRITE_TOKEN ? 
      `https://${process.env.VERCEL_URL || 'localhost:3000'}` : 
      'https://your-app.vercel.app';
    
    const url = `${baseUrl}/_vercel/blob/${filename}`;

    try {
      // Delete the blob
      await del(url);
      
      // Remove metadata from database if stored
      // await removeAvatarMetadata(userId);

      return NextResponse.json({
        success: true,
        message: 'Avatar deleted successfully',
        userId: userId,
      });
    } catch (error) {
      console.error('Failed to delete blob:', error);
      return NextResponse.json(
        { error: 'Avatar not found or already deleted' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Avatar deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}