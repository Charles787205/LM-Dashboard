import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      session,
      message: session ? 'User is authenticated' : 'User is not authenticated'
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      error: 'Failed to check authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
