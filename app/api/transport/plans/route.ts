import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';

import Location from '@/models/transport/Location';
import Actual from '@/models/transport/Actual';
import Plan from '@/models/transport/Plan';
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Ensure models are registered
    const LocationModel = Location;
    const ActualModel = Actual;
    const PlanModel = Plan;

    // Test basic Plan model first without populate
    console.log('Testing Plan model registration...');
    const planCount = await Plan.countDocuments();
    console.log('Plan count:', planCount);

    // Get all plans from MongoDB and populate origin location and actuals
    const plans = await Plan.find({})
      .populate('origin', 'name type')
      .sort({ createdAt: -1 });
    console.log('Plans fetched:', plans.length);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Plans GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, origin, numberOfTrips } = body;

    // Validate required fields
    if (!date || !origin || !numberOfTrips) {
      return NextResponse.json(
        { error: 'Missing required fields: date, origin, numberOfTrips' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Ensure models are registered
    const LocationModel = Location;
    const ActualModel = Actual;
    const PlanModel = Plan;

    // Create new plan in MongoDB
    try {
      const newPlan = new Plan({
        date: new Date(date),
        origin, // This should be a valid Location ObjectId
        numberOfTrips: parseInt(numberOfTrips),
        fulfillment: 0,
        remarks: '',
      });

      const savedPlan = await newPlan.save();

      // Populate the origin for the response
      const populatedPlan = await Plan.findById(savedPlan._id).populate(
        'origin',
        'name type'
      );
      console.log(populatedPlan);
      return NextResponse.json(
        {
          message: 'Plan created successfully',
          plan: populatedPlan,
        },
        { status: 201 }
      );
    } catch (mongoError: any) {
      // Handle validation errors
      if (mongoError.name === 'ValidationError') {
        const errorMessages = Object.values(mongoError.errors).map(
          (err: any) => err.message
        );
        return NextResponse.json(
          { error: `Validation error: ${errorMessages.join(', ')}` },
          { status: 400 }
        );
      }
      // Handle invalid ObjectId for origin
      if (mongoError.name === 'CastError' && mongoError.path === 'origin') {
        return NextResponse.json(
          { error: 'Invalid origin location selected' },
          { status: 400 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error('Plans POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { _id, date, origin, numberOfTrips, fulfillment, remarks } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Plan ID is required for update' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Ensure models are registered
    const LocationModel = Location;
    const ActualModel = Actual;
    const PlanModel = Plan;

    // Find and update plan in MongoDB
    try {
      const updateData: any = {};
      if (date) updateData.date = new Date(date);
      if (origin) updateData.origin = origin;
      if (numberOfTrips !== undefined)
        updateData.numberOfTrips = parseInt(numberOfTrips);
      if (fulfillment !== undefined)
        updateData.fulfillment = parseInt(fulfillment);
      if (remarks !== undefined) updateData.remarks = remarks;

      const updatedPlan = await Plan.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('origin', 'name type')
        .populate('actuals');

      if (!updatedPlan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Plan updated successfully',
        plan: updatedPlan,
      });
    } catch (mongoError: any) {
      // Handle validation errors
      if (mongoError.name === 'ValidationError') {
        const errorMessages = Object.values(mongoError.errors).map(
          (err: any) => err.message
        );
        return NextResponse.json(
          { error: `Validation error: ${errorMessages.join(', ')}` },
          { status: 400 }
        );
      }
      // Handle invalid ObjectId
      if (mongoError.name === 'CastError') {
        return NextResponse.json(
          { error: 'Invalid ID or reference provided' },
          { status: 400 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error('Plans PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const planId = url.searchParams.get('id');

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Ensure models are registered
    const LocationModel = Location;
    const ActualModel = Actual;
    const PlanModel = Plan;

    // Delete plan from MongoDB
    const deletedPlan = await Plan.findByIdAndDelete(planId);

    if (!deletedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Plans DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
