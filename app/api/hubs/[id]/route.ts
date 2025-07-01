import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';

// GET - Fetch a specific hub by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const hub = await Hub.findById(id);
    
    if (!hub) {
      return NextResponse.json(
        { success: false, error: 'Hub not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: hub });
  } catch (error) {
    console.error('Error fetching hub:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hub' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific hub
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id } = await params;
    
    const updatedHub = await Hub.findByIdAndUpdate(
      id,
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
