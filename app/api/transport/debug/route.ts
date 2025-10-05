import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Plan from '@/models/transport/Plan';
import Actual from '@/models/transport/Actual';

export async function GET() {
  try {
    await connectToDatabase();

    // Get all plans and actuals for debugging
    const plans = await Plan.find({}).populate('origin', 'name type');
    const actuals = await Actual.find({}).populate('plan', 'date');

    const debugInfo = {
      totalPlans: plans.length,
      totalActuals: actuals.length,
      plans: plans.map(plan => ({
        id: plan._id,
        date: plan.date,
        numberOfTrips: plan.numberOfTrips,
        origin: plan.origin?.name || 'Unknown',
        actualsCount: actuals.filter(actual => 
          actual.plan && actual.plan._id.toString() === plan._id.toString()
        ).length
      })),
      actuals: actuals.map(actual => ({
        id: actual._id,
        planId: actual.plan?._id || null,
        status: actual.status,
        tripSequence: actual.tripSequence,
        createdAt: actual.createdAt
      }))
    };

    // Calculate fulfillment for each plan
    debugInfo.plans.forEach(plan => {
      if (plan.numberOfTrips > 0) {
        plan.fulfillmentRate = Math.round((plan.actualsCount / plan.numberOfTrips) * 100 * 10) / 10;
      } else {
        plan.fulfillmentRate = 0;
      }
    });

    const overallFulfillment = debugInfo.plans.length > 0 ? 
      debugInfo.plans.reduce((sum, plan) => sum + plan.fulfillmentRate, 0) / debugInfo.plans.length : 0;

    debugInfo.overallFulfillmentRate = Math.round(overallFulfillment * 10) / 10;

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 });
  }
}