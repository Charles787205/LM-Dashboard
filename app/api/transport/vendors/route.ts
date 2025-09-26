import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Vehicle from '@/models/transport/Vehicles';
import Vendor from '@/models/transport/Vendors';
import Driver from '@/models/transport/Driver';

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
    
    // Ensure models are registered by importing them
    Vehicle;
    Driver;
    
    // Get all vendors and populate their vehicles
    const vendors = await Vendor.find({})
      .populate({
        path: 'vehicles',
        populate: {
          path: 'driver',
          select: 'firstName lastName'
        }
      })
      .sort({ name: 1 });

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Vendors GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
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
    const { 
      name, 
      bu_assignment, 
      email_address, 
      contact_number, 
      emergency_contact_person,
      emergency_contact_number,
      service_type,
      address,
      status = 'active'
    } = body;

    // Validate required fields
    if (!name || !email_address || !contact_number || !emergency_contact_person || !service_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email_address, contact_number, emergency_contact_person, service_type' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    try {
      // Create new vendor
      const newVendor = new Vendor({
        name,
        bu_assignment,
        email_address,
        contact_number,
        emergency_contact_person,
        emergency_contact_number,
        service_type,
        address,
        status,
        vehicles: []
      });

      const savedVendor = await newVendor.save();
      
      return NextResponse.json({ 
        message: 'Vendor created successfully',
        vendor: savedVendor 
      }, { status: 201 });
    } catch (mongoError: any) {
      // Handle validation errors
      if (mongoError.name === 'ValidationError') {
        const errorMessages = Object.values(mongoError.errors).map((err: any) => err.message);
        return NextResponse.json(
          { error: `Validation error: ${errorMessages.join(', ')}` },
          { status: 400 }
        );
      }
      // Handle duplicate key error
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { error: 'Vendor with this name already exists' },
          { status: 400 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error('Vendors POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
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
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required for update' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    try {
      const updatedVendor = await Vendor.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      ).populate('vehicles');

      if (!updatedVendor) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Vendor updated successfully',
        vendor: updatedVendor
      });
    } catch (mongoError: any) {
      // Handle validation errors
      if (mongoError.name === 'ValidationError') {
        const errorMessages = Object.values(mongoError.errors).map((err: any) => err.message);
        return NextResponse.json(
          { error: `Validation error: ${errorMessages.join(', ')}` },
          { status: 400 }
        );
      }
      // Handle duplicate key error
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { error: 'Vendor with this name already exists' },
          { status: 400 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error('Vendors PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
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
    const vendorId = url.searchParams.get('id');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if vendor has vehicles
    const vendor = await Vendor.findById(vendorId).populate('vehicles');
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Optional: Prevent deletion if vendor has vehicles
    if (vendor.vehicles && vendor.vehicles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vendor with associated vehicles. Please reassign or delete vehicles first.' },
        { status: 400 }
      );
    }

    await Vendor.findByIdAndDelete(vendorId);

    return NextResponse.json({
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Vendors DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}