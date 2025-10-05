import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Actual from '@/models/transport/Actual';
import Plan from '@/models/transport/Plan';
import Location from '@/models/transport/Location';
import Vehicle from '@/models/transport/Vehicles';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Ensure models are registered
    Plan;
    Location;
    Vehicle;
    
    const body = await request.json();
    const { id } = params;

    // Update the actual trip
    const updatedActual = await Actual.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
    .populate('plan', 'date origin numberOfTrips fulfillment remarks')
    .populate({
      path: 'plan',
      populate: {
        path: 'origin',
        select: 'name type'
      }
    })
    .populate('vehicle', 'vehicle_plate_number vehicleType')
    .populate('tripDetail.destination', 'name type');

    if (!updatedActual) {
      return NextResponse.json(
        { error: 'Actual trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      actual: updatedActual,
      message: 'Actual trip updated successfully'
    });
  } catch (error) {
    console.error('Actual PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update actual trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { id } = params;

    const deletedActual = await Actual.findByIdAndDelete(id);

    if (!deletedActual) {
      return NextResponse.json(
        { error: 'Actual trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Actual trip deleted successfully'
    });
  } catch (error) {
    console.error('Actual DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete actual trip' },
      { status: 500 }
    );
  }
}