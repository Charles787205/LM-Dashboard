import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';

// GET - Fetch all hubs
export async function GET() {
  try {
    await connectToDatabase();
    const hubs = await Hub.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: hubs });
  } catch (error) {
    console.error('Error fetching hubs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hubs' },
      { status: 500 }
    );
  }
}

// POST - Create a new hub
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const {
      name,
      client,
      hub_cost_per_parcel,
      hub_profit_per_parcel
    } = body;

    // Validate required fields
    if (!name || !client) {
      return NextResponse.json(
        { success: false, error: 'Name and client are required' },
        { status: 400 }
      );
    }

    // Check if hub with this name already exists
    const existingHub = await Hub.findOne({ name: name.trim() });
    if (existingHub) {
      return NextResponse.json(
        { success: false, error: 'Hub with this name already exists' },
        { status: 400 }
      );
    }

    // Create new hub
    const newHub = new Hub({
      name: name.trim(),
      client,
      hub_cost_per_parcel: hub_cost_per_parcel || {
        "2W": 0,
        "3W": 0,
        "4W": 0
      },
      hub_profit_per_parcel: hub_profit_per_parcel || {
        "2W": 0,
        "3W": 0,
        "4W": 0
      }
    });

    const savedHub = await newHub.save();
    
    return NextResponse.json(
      { success: true, data: savedHub },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hub:', error);
    
    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create hub' },
      { status: 500 }
    );
  }
}
