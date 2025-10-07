import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Plan from '@/models/transport/Plan';
import Actual from '@/models/transport/Actual';

export async function GET() {
  try {
    await connectToDatabase();

    // Get all plans and actuals
    const plans = await Plan.find({}).lean();
    const actuals = await Actual.find({}).lean();

    console.log('Raw Plans:', plans);
    console.log('Raw Actuals:', actuals);

    // Calculate fulfillment step by step
    let fulfillmentDetails = [];
    let totalFulfillment = 0;

    for (const plan of plans) {
      const planIdStr = plan._id ? String(plan._id) : '';
      const planActuals = actuals.filter(actual => 
        actual.plan && String(actual.plan) === planIdStr
      );
      
      const planFulfillment = plan.numberOfTrips > 0 ? 
        (planActuals.length / plan.numberOfTrips) * 100 : 0;
      
      fulfillmentDetails.push({
  planId: String(plan._id),
        plannedTrips: plan.numberOfTrips,
        actualTrips: planActuals.length,
        fulfillmentPercent: planFulfillment,
        date: plan.date
      });
      
      totalFulfillment += planFulfillment;
    }

    const averageFulfillment = plans.length > 0 ? totalFulfillment / plans.length : 0;

    return NextResponse.json({
      totalPlans: plans.length,
      totalActuals: actuals.length,
      fulfillmentDetails,
      totalFulfillment,
      averageFulfillment,
      rawPlans: plans.map(p => ({
        id: String(p._id),
        numberOfTrips: p.numberOfTrips,
        date: p.date
      })),
      rawActuals: actuals.map(a => ({
        id: String(a._id),
        planId: a.plan ? String(a.plan) : null,
        status: a.status,
        createdAt: a.createdAt
      }))
    });

  } catch (error) {
    console.error('Debug error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Debug failed', details: message }, { status: 500 });
  }
}