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

    const plansWithStats = plans.map(plan => {
      const actualsCount = actuals.filter(actual => 
        actual.plan && actual.plan._id.toString() === plan._id.toString()
      ).length;

      const fulfillmentRate = plan.numberOfTrips > 0 ?
        Math.round((actualsCount / plan.numberOfTrips) * 100 * 10) / 10 : 0;

      return {
        id: plan._id,
        date: plan.date,
        numberOfTrips: plan.numberOfTrips,
        origin: plan.origin?.name || 'Unknown',
        actualsCount,
        fulfillmentRate
      };
    });

    const overallFulfillment = plansWithStats.length > 0 ?
      plansWithStats.reduce((sum, p) => sum + p.fulfillmentRate, 0) / plansWithStats.length : 0;

    const debugInfo = {
      totalPlans: plans.length,
      totalActuals: actuals.length,
      plans: plansWithStats,
      actuals: actuals.map(actual => ({
        id: actual._id,
        planId: actual.plan?._id || null,
        status: actual.status,
        tripSequence: actual.tripSequence,
        createdAt: actual.createdAt
      })),
      overallFulfillmentRate: Math.round(overallFulfillment * 10) / 10
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 });
  }
}