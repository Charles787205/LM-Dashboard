import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Driver from '@/models/transport/Driver';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const gender = searchParams.get('gender');
    const status = searchParams.get('status');

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender && gender !== '') {
      query.gender = gender;
    }

    if (status && status !== '') {
      query.isActive = status === 'active';
    }

    const drivers = await Driver.find(query).sort({ firstName: 1, lastName: 1 });

    return NextResponse.json({
      success: true,
      drivers: drivers
    });

  } catch (error) {
    console.error('Drivers GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { firstName, lastName, licenseNumber, phoneNumber, gender } = body;

    // Validate required fields
    if (!firstName || !lastName || !licenseNumber || !phoneNumber || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, licenseNumber, phoneNumber, gender' },
        { status: 400 }
      );
    }

    // Check if license number already exists
    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      return NextResponse.json(
        { error: 'Driver with this license number already exists' },
        { status: 409 }
      );
    }

    // Create new driver
    const driver = new Driver({
      firstName,
      lastName,
      licenseNumber,
      phoneNumber,
      gender,
      isActive: true
    });

    await driver.save();

    return NextResponse.json({
      success: true,
      driver: driver,
      message: 'Driver created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Drivers POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { _id, firstName, lastName, licenseNumber, phoneNumber, gender, isActive } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Driver ID is required for updates' },
        { status: 400 }
      );
    }

    // Check if license number already exists (excluding current driver)
    if (licenseNumber) {
      const existingDriver = await Driver.findOne({ 
        licenseNumber, 
        _id: { $ne: _id } 
      });
      if (existingDriver) {
        return NextResponse.json(
          { error: 'Another driver with this license number already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (gender !== undefined) updateData.gender = gender;
    if (isActive !== undefined) updateData.isActive = isActive;

    const driver = await Driver.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      driver: driver,
      message: 'Driver updated successfully'
    });

  } catch (error) {
    console.error('Drivers PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    const driver = await Driver.findByIdAndDelete(id);

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully'
    });

  } catch (error) {
    console.error('Drivers DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}