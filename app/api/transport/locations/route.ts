import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Location from '@/models/transport/Location';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Get all locations from MongoDB
    const locations = await Location.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Locations GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 }
      );
    }

    // Validate type enum
    if (!['origin', 'destination', 'both'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be one of: origin, destination, both' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create new location in MongoDB
    try {
      const newLocation = new Location({
        name: name.trim(),
        type
      });

      const savedLocation = await newLocation.save();

      return NextResponse.json({ 
        message: 'Location created successfully',
        location: savedLocation 
      }, { status: 201 });
    } catch (mongoError: any) {
      // Handle duplicate name error
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { error: 'A location with this name already exists' },
          { status: 400 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error('Locations POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id, name, type } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Location ID is required for update' },
        { status: 400 }
      );
    }

    // Validate type if provided
    if (type && !['origin', 'destination', 'both'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be one of: origin, destination, both' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and update location in MongoDB
    try {
      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (type) updateData.type = type;

      const updatedLocation = await Location.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedLocation) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        message: 'Location updated successfully',
        location: updatedLocation 
      });
    } catch (mongoError: any) {
      // Handle duplicate name error
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { error: 'A location with this name already exists' },
          { status: 400 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error('Locations PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const locationId = url.searchParams.get('id');

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if location is being used by any plans before deletion
    // TODO: Uncomment when Plan model is properly integrated
    // const plansUsingLocation = await Plan.find({ origin: locationId });
    // if (plansUsingLocation.length > 0) {
    //   return NextResponse.json(
    //     { error: 'Cannot delete location. It is being used by existing plans.' },
    //     { status: 400 }
    //   );
    // }

    // Delete location from MongoDB
    const deletedLocation = await Location.findByIdAndDelete(locationId);

    if (!deletedLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Locations DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
