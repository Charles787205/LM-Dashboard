import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';

// GET - Fetch a specific hub by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hubId: string }> }
) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Hub API: Starting request...');
    
    // Connect to database with timeout
    console.log('⏳ Hub API: Connecting to database...');
    await connectToDatabase();
    console.log('✅ Hub API: Database connected');
    
    const { hubId } = await params;
    console.log('📋 Hub API: Fetching hub with ID:', hubId);
    
    // Validate hubId format
    if (!hubId || hubId.length !== 24) {
      console.log('❌ Hub API: Invalid hub ID format');
      return NextResponse.json(
        { success: false, error: 'Invalid hub ID format' },
        { status: 400 }
      );
    }
    
    // Find hub with timeout
    const hub = await Promise.race([
      Hub.findById(hubId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      )
    ]);
    
    const queryTime = Date.now() - startTime;
    console.log('⏱️  Hub API: Query completed in', queryTime, 'ms');
    
    if (!hub) {
      console.log('❌ Hub API: Hub not found');
      return NextResponse.json(
        { success: false, error: 'Hub not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Hub API: Hub found:', hub.name);
    return NextResponse.json({ 
      success: true, 
      data: hub,
      meta: {
        queryTime: queryTime,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('💥 Hub API Error:', error);
    console.error('⏱️  Total time before error:', totalTime, 'ms');
    
    if (error.message === 'Database query timeout') {
      return NextResponse.json(
        { success: false, error: 'Database query timeout - please try again' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch hub',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update a specific hub
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ hubId: string }> }
) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { hubId } = await params;
    
    const updatedHub = await Hub.findByIdAndUpdate(
      hubId,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedHub) {
      return NextResponse.json(
        { success: false, error: 'Hub not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedHub });
  } catch (error) {
    console.error('Error updating hub:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update hub' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific hub
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deletedHub = await Hub.findByIdAndDelete(id);
    
    if (!deletedHub) {
      return NextResponse.json(
        { success: false, error: 'Hub not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hub deleted successfully',
      data: deletedHub 
    });
  } catch (error) {
    console.error('Error deleting hub:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hub' },
      { status: 500 }
    );
  }
}
