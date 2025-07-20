import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Report from '@/models/Reports';
import Hub from '@/models/Hubs';
import FailedDelivery from '@/models/Failed_Deliveries';

export async function GET() {
  try {
    await connectToDatabase();

    // Get the date range for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get total stats
    const totalStats = await Report.aggregate([
      {
        $group: {
          _id: null,
          totalInbound: { $sum: '$inbound' },
          totalOutbound: { $sum: '$outbound' },
          totalDelivered: { $sum: '$delivered' },
          totalFailed: { $sum: '$failed' },
          totalReports: { $sum: 1 }
        }
      }
    ]);

    // Get stats for the last 7 days
    const recentStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          recentInbound: { $sum: '$inbound' },
          recentOutbound: { $sum: '$outbound' },
          recentDelivered: { $sum: '$delivered' },
          recentFailed: { $sum: '$failed' },
          recentReports: { $sum: 1 }
        }
      }
    ]);

    // Get daily trend data for the last 7 days
    const dailyTrends = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          inbound: { $sum: '$inbound' },
          outbound: { $sum: '$outbound' },
          delivered: { $sum: '$delivered' },
          failed: { $sum: '$failed' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get hub performance data
    const hubPerformance = await Report.aggregate([
      {
        $lookup: {
          from: 'hubs',
          localField: 'hub',
          foreignField: '_id',
          as: 'hubInfo'
        }
      },
      {
        $unwind: '$hubInfo'
      },
      {
        $group: {
          _id: '$hubInfo.name',
          totalDelivered: { $sum: '$delivered' },
          totalFailed: { $sum: '$failed' },
          totalProcessed: { $sum: { $add: ['$delivered', '$failed'] } }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: {
              if: { $eq: ['$totalProcessed', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$totalDelivered', '$totalProcessed'] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $sort: { successRate: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get total number of active hubs
    const totalHubs = await Hub.countDocuments();

    // Get failed delivery breakdown data
    const failedDeliveryBreakdown = await FailedDelivery.aggregate([
      {
        $group: {
          _id: null,
          canceled_bef_delivery: { $sum: '$canceled_bef_delivery' },
          no_cash_available: { $sum: '$no_cash_available' },
          postpone: { $sum: '$postpone' },
          not_at_home: { $sum: '$not_at_home' },
          refuse: { $sum: '$refuse' },
          unreachable: { $sum: '$unreachable' },
          invalid_address: { $sum: '$invalid_address' }
        }
      }
    ]);

    const failedBreakdown = failedDeliveryBreakdown[0] || {
      canceled_bef_delivery: 0,
      no_cash_available: 0,
      postpone: 0,
      not_at_home: 0,
      refuse: 0,
      unreachable: 0,
      invalid_address: 0
    };

    const totalFailedReasons = Object.values(failedBreakdown).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) as number;

    // Calculate performance metrics
    const currentStats = totalStats[0] || {
      totalInbound: 0,
      totalOutbound: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalReports: 0
    };

    const recentStatsData = recentStats[0] || {
      recentInbound: 0,
      recentOutbound: 0,
      recentDelivered: 0,
      recentFailed: 0,
      recentReports: 0
    };

    // Calculate success rate
    const totalProcessed = currentStats.totalDelivered + currentStats.totalFailed;
    const successRate = totalProcessed > 0 ? (currentStats.totalDelivered / totalProcessed) * 100 : 0;
    
    // Calculate failed rate
    const failedRate = totalProcessed > 0 ? (currentStats.totalFailed / totalProcessed) * 100 : 0;

    // Format daily trends for chart
    const formattedDailyTrends = dailyTrends.map(day => ({
      name: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
      date: day._id,
      inbound: day.inbound,
      outbound: day.outbound,
      delivered: day.delivered,
      failed: day.failed,
      revenue: day.delivered * 15 // Assuming ₱15 per delivered parcel
    }));

    // If no data for the last 7 days, create dummy entries
    if (formattedDailyTrends.length === 0) {
      const dummyTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dummyTrends.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          inbound: 0,
          outbound: 0,
          delivered: 0,
          failed: 0,
          revenue: 0
        });
      }
      formattedDailyTrends.push(...dummyTrends);
    }

    const dashboardData = {
      stats: {
        totalInbound: currentStats.totalInbound,
        totalOutbound: currentStats.totalOutbound,
        totalDelivered: currentStats.totalDelivered,
        totalFailed: currentStats.totalFailed,
        successRate: Math.round(successRate * 10) / 10,
        failedRate: Math.round(failedRate * 10) / 10,
        totalHubs,
        totalReports: currentStats.totalReports
      },
      recentStats: recentStatsData,
      dailyTrends: formattedDailyTrends,
      hubPerformance,
      keyMetrics: {
        averageSuccessRate: Math.round(successRate * 10) / 10,
        averageVolume: Math.round(currentStats.totalInbound / Math.max(currentStats.totalReports, 1)),
        firstAttemptSuccess: Math.round(successRate * 0.9 * 10) / 10, // Estimated
        activeFleet: totalHubs * 8 // Estimated vehicles per hub
      },
      failedDeliveryBreakdown: totalFailedReasons > 0 ? [
        { reason: 'Not at Home', count: failedBreakdown.not_at_home, percentage: Math.round((failedBreakdown.not_at_home / totalFailedReasons) * 100 * 10) / 10, color: 'bg-red-500' },
        { reason: 'No Cash Available', count: failedBreakdown.no_cash_available, percentage: Math.round((failedBreakdown.no_cash_available / totalFailedReasons) * 100 * 10) / 10, color: 'bg-orange-500' },
        { reason: 'Postpone', count: failedBreakdown.postpone, percentage: Math.round((failedBreakdown.postpone / totalFailedReasons) * 100 * 10) / 10, color: 'bg-yellow-500' },
        { reason: 'Refuse', count: failedBreakdown.refuse, percentage: Math.round((failedBreakdown.refuse / totalFailedReasons) * 100 * 10) / 10, color: 'bg-purple-500' },
        { reason: 'Unreachable', count: failedBreakdown.unreachable, percentage: Math.round((failedBreakdown.unreachable / totalFailedReasons) * 100 * 10) / 10, color: 'bg-blue-500' },
        { reason: 'Invalid Address', count: failedBreakdown.invalid_address, percentage: Math.round((failedBreakdown.invalid_address / totalFailedReasons) * 100 * 10) / 10, color: 'bg-gray-500' },
        { reason: 'Canceled Before Delivery', count: failedBreakdown.canceled_bef_delivery, percentage: Math.round((failedBreakdown.canceled_bef_delivery / totalFailedReasons) * 100 * 10) / 10, color: 'bg-pink-500' }
      ].sort((a, b) => b.count - a.count) : []
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
