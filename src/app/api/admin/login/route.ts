import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'easyfile2026';

    if (password === expectedPassword) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin authenticated successfully',
      });

      // Set secure HTTP-only admin session cookie
      response.cookies.set('admin_token', 'authenticated_session_secret_token_998', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid Admin Password' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
