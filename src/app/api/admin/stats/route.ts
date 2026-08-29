import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStatsSummary } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (token !== 'authenticated_session_secret_token_998') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to Admin API' },
        { status: 401 }
      );
    }

    const stats = getStatsSummary();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Admin Stats API Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
