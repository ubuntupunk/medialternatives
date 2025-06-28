import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple password check - in production, use proper hashing
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'medialternatives2024';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check password
    if (password !== ADMIN_PASSWORD) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session data
    const sessionData = {
      userId: 'david-robert-lewis',
      username: 'David Robert Lewis',
      isAdmin: true,
      loginTime: Date.now(),
      expires: Date.now() + SESSION_DURATION,
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: sessionData.userId,
        username: sessionData.username,
        isAdmin: sessionData.isAdmin,
      }
    });

    // Set secure cookie
    const cookieStore = cookies();
    cookieStore.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: false, // Allow client-side access for now
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}