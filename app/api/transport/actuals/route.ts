import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Actual from '@/models/transport/Actual';
import Plan from '@/models/transport/Plan';
import Location from '@/models/transport/Location';  // Import to register schema
import Vehicle from '@/models/transport/Vehicles';

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
    
    const url = new URL(request.url);
    const planId = url.searchParams.get('planId');
    
    let actuals;
    
    if (planId) {
      // Get actuals for a specific plan
      actuals = await Actual.find({ plan: planId })
        .populate('plan', 'date origin numberOfTrips fulfillment remarks')
        .populate('vehicle', 'plateNumber')
        .populate('tripDetail.destination', 'name type')
        .sort({ tripSequence: 1 });
    } else {
      // Get all actuals
      actuals = await Actual.find()
        .populate('plan', 'date origin numberOfTrips fulfillment remarks')
        .populate('vehicle', 'plateNumber')
        .populate('tripDetail.destination', 'name type')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ actuals });
  } catch (error) {
    console.error('Actuals GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actuals' },
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
      plan, 
      vehicle, 
      status = 'completed',
      linhaulTripNumber,
      callTime,
      tripSequence,
      odometer,
      loadingDetail,
      tripDetail,
      sealNumbers,
      unloadingDetail 
    } = body;

    // Validate required fields
    if (!plan || !vehicle || !tripSequence) {
      return NextResponse.json(
        { error: 'Missing required fields: plan, vehicle, tripSequence' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    try {
      // Check if plan exists
      const planExists = await Plan.findById(plan);
      if (!planExists) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        );
      }

      // Create new actual trip
      const newActual = new Actual({
        plan,
        vehicle,
        status,
        linhaulTripNumber,
        callTime,
        tripSequence,
        odometer,
        loadingDetail,
        tripDetail,
        sealNumbers,
        unloadingDetail
      });

      const savedActual = await newActual.save();

      // Add this actual to the plan's actuals array
      try {
        await Plan.findByIdAndUpdate(
          plan,
          { $push: { actuals: savedActual._id } },
          { new: false } // Don't return the updated document to avoid serialization issues
        );
      } catch (planUpdateError) {
        console.error('Error updating plan actuals:', planUpdateError);
        // Continue with response even if plan update fails
      }

      // Populate the saved actual for response
      const populatedActual = await Actual.findById(savedActual._id)
        .populate('plan', 'date origin numberOfTrips fulfillment remarks')
        .populate('vehicle', 'plateNumber')
        .populate('tripDetail.destination', 'name type');
      
      return NextResponse.json({ 
        message: 'Actual trip created successfully',
        actual: populatedActual 
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
      throw mongoError;
    }
  } catch (error) {
    console.error('Actuals POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create actual trip' },
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
    const actualId = url.searchParams.get('id');

    if (!actualId) {
      return NextResponse.json(
        { error: 'Actual ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the actual trip to get the plan ID
    const actualTrip = await Actual.findById(actualId);
    if (!actualTrip) {
      return NextResponse.json(
        { error: 'Actual trip not found' },
        { status: 404 }
      );
    }

    // Remove from plan's actuals array
    await Plan.findByIdAndUpdate(
      actualTrip.plan,
      { $pull: { actuals: actualId } },
      { new: true }
    );

    // Delete the actual trip
    await Actual.findByIdAndDelete(actualId);

    return NextResponse.json({ 
      message: 'Actual trip deleted successfully'
    });
  } catch (error) {
    console.error('Actuals DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete actual trip' },
      { status: 500 }
    );
  }
}
