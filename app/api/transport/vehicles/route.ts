import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Vehicle from '@/models/transport/Vehicles';
import Driver from '@/models/transport/Driver';
import Vendor from '@/models/transport/Vendors';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Ensure models are registered
    const DriverModel = Driver;
    const VendorModel = Vendor;
    
    const url = new URL(request.url);
    const vendorId = url.searchParams.get('vendorId');
    
    let query = {};
    if (vendorId) {
      query = { vendor: vendorId };
    }
    
    // Get all vehicles and populate driver and vendor information
    const vehicles = await Vehicle.find(query)
      .populate('driver', 'firstName lastName')
      .populate('vendor', 'name service_type status')
      .sort({ vehicle_plate_number: 1 });

    return NextResponse.json({ 
      success: true,
      vehicles 
    });
  } catch (error) {
    console.error('Vehicles GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure models are registered
    const DriverModel = Driver;
    const VendorModel = Vendor;

    const body = await request.json();
    const { vehicleType, vehicle_plate_number, driver, gender, vendor } = body;

    // Validate required fields
    if (!vehicleType || !vehicle_plate_number || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicleType, vehicle_plate_number, gender' },
        { status: 400 }
      );
    }

    // Check if vehicle plate number already exists
    const existingVehicle = await Vehicle.findOne({ vehicle_plate_number });
    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this plate number already exists' },
        { status: 409 }
      );
    }

    // Create new vehicle
    const vehicleData: any = {
      vehicleType,
      vehicle_plate_number,
      gender
    };

    // Add optional fields if provided
    if (driver && driver !== '') {
      vehicleData.driver = driver;
    }
    if (vendor && vendor !== '') {
      vehicleData.vendor = vendor;
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Populate the vehicle with driver and vendor info for response
    await vehicle.populate('driver', 'firstName lastName');
    await vehicle.populate('vendor', 'name service_type status');

    return NextResponse.json({
      success: true,
      vehicle: vehicle,
      message: 'Vehicle created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Vehicles POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure models are registered
    const DriverModel = Driver;
    const VendorModel = Vendor;

    const body = await request.json();
    const { _id, vehicleType, vehicle_plate_number, driver, gender, vendor } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required for updates' },
        { status: 400 }
      );
    }

    // Check if vehicle plate number already exists (excluding current vehicle)
    if (vehicle_plate_number) {
      const existingVehicle = await Vehicle.findOne({ 
        vehicle_plate_number, 
        _id: { $ne: _id } 
      });
      if (existingVehicle) {
        return NextResponse.json(
          { error: 'Another vehicle with this plate number already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (vehicle_plate_number !== undefined) updateData.vehicle_plate_number = vehicle_plate_number;
    if (gender !== undefined) updateData.gender = gender;
    if (driver !== undefined) updateData.driver = driver || null;
    if (vendor !== undefined) updateData.vendor = vendor || null;

    const vehicle = await Vehicle.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Populate the vehicle with driver and vendor info for response
    await vehicle.populate('driver', 'firstName lastName');
    await vehicle.populate('vendor', 'name service_type status');

    return NextResponse.json({
      success: true,
      vehicle: vehicle,
      message: 'Vehicle updated successfully'
    });

  } catch (error) {
    console.error('Vehicles PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure models are registered
    const DriverModel = Driver;
    const VendorModel = Vendor;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Vehicles DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}