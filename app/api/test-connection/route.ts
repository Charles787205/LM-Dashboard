import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';

export async function GET() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('MongoDB URI preview:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    const connection = await connectToDatabase();
    
    // Test the connection by checking database stats
    const db = connection.connection.db;
    const admin = db?.admin();
    const result = await admin?.ping();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      connectionState: connection.connection.readyState,
      databaseName: db?.databaseName,
      ping: result
    });
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        name: error instanceof Error ? error.name : 'Unknown',
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        syscall: (error as any)?.syscall,
        hostname: (error as any)?.hostname
      }
    }, { status: 500 });
  }
}
