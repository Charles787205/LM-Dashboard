import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Report from '@/models/Reports';
import Hub from '@/models/Hubs';
import FailedDelivery from '@/models/Failed_Deliveries';
import { Types } from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const customStartDate = searchParams.get('startDate');
    const customEndDate = searchParams.get('endDate');
    const hubId = searchParams.get('hubId'); // Add hub filter parameter
    const excludeSundays = searchParams.get('excludeSundays') === 'true'; // Add exclude sundays filter

    // Calculate date range based on period
    let startDate: Date;
    let endDate: Date = new Date();

    if (period === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'yesterday':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'daily':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '15days':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 15);
          break;
        case 'monthly':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
      }
    }

    // Build base match criteria
    const baseMatchCriteria: any = {
      date: { $gte: startDate, $lte: endDate }
    };

    // Add hub filter if specified
    if (hubId && hubId !== 'all') {
      // Convert string to ObjectId if needed
      const hubObjectId = Types.ObjectId.isValid(hubId) 
        ? new Types.ObjectId(hubId) 
        : hubId;
      baseMatchCriteria.hub = hubObjectId;
    }

    // Add Sunday exclusion if specified
    if (excludeSundays) {
      baseMatchCriteria.$expr = {
        $ne: [{ $dayOfWeek: '$date' }, 1] // In MongoDB, Sunday is 1, Monday is 2, etc.
      };
    }

    // Get total stats for the selected period
    const totalStats = await Report.aggregate([
      {
        $match: baseMatchCriteria
      },
      {
        $group: {
          _id: null,
          totalInbound: { $sum: '$inbound' },
          totalOutbound: { $sum: '$outbound' },
          totalBacklogs: { $sum: '$backlogs' },
          totalDelivered: { $sum: '$delivered' },
          totalFailed: { $sum: '$failed' },
          totalReports: { $sum: 1 }
        }
      }
    ]);

    // Get trips data for productivity calculations
    const tripsStats = await Report.aggregate([
      {
        $match: baseMatchCriteria
      },
      {
        $group: {
          _id: null,
          total2WTrips: { $sum: '$trips.2w' },
          total3WTrips: { $sum: '$trips.3w' },
          total4WTrips: { $sum: '$trips.4w' },
          totalTrips: { $sum: { $add: ['$trips.2w', '$trips.3w', '$trips.4w'] } }
        }
      }
    ]);

    // Calculate comparison period for trends
    const periodDuration = endDate.getTime() - startDate.getTime();
    const comparisonStartDate = new Date(startDate.getTime() - periodDuration);
    
    // Build comparison match criteria
    const comparisonMatchCriteria: any = {
      date: { $gte: comparisonStartDate, $lt: startDate }
    };

    // Add hub filter if specified
    if (hubId && hubId !== 'all') {
      // Convert string to ObjectId if needed
      const hubObjectId = Types.ObjectId.isValid(hubId) 
        ? new Types.ObjectId(hubId) 
        : hubId;
      comparisonMatchCriteria.hub = hubObjectId;
    }

    // Add Sunday exclusion if specified
    if (excludeSundays) {
      comparisonMatchCriteria.$expr = {
        $ne: [{ $dayOfWeek: '$date' }, 1] // In MongoDB, Sunday is 1, Monday is 2, etc.
      };
    }
    
    // Get stats for comparison period (for trend calculations)
    const comparisonStats = await Report.aggregate([
      {
        $match: comparisonMatchCriteria
      },
      {
        $group: {
          _id: null,
          recentInbound: { $sum: '$inbound' },
          recentOutbound: { $sum: '$outbound' },
          recentBacklogs: { $sum: '$backlogs' },
          recentDelivered: { $sum: '$delivered' },
          recentFailed: { $sum: '$failed' },
          recentReports: { $sum: 1 }
        }
      }
    ]);

    // Get daily trend data for the selected period
    const dailyTrends = await Report.aggregate([
      {
        $match: baseMatchCriteria
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          },
          inbound: { $sum: '$inbound' },
          outbound: { $sum: '$outbound' },
          backlogs: { $sum: '$backlogs' },
          delivered: { $sum: '$delivered' },
          failed: { $sum: '$failed' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get hub performance data for the selected period
    const hubPerformance = await Report.aggregate([
      {
        $match: baseMatchCriteria
      },
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
      totalBacklogs: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalReports: 0
    };

    const recentStatsData = comparisonStats[0] || {
      recentInbound: 0,
      recentOutbound: 0,
      recentBacklogs: 0,
      recentDelivered: 0,
      recentFailed: 0,
      recentReports: 0
    };

    // Calculate success rate
    const totalProcessed = currentStats.totalDelivered + currentStats.totalFailed;
    const successRate = totalProcessed > 0 ? (currentStats.totalDelivered / totalProcessed) * 100 : 0;
    
    // Calculate failed rate
    const failedRate = totalProcessed > 0 ? (currentStats.totalFailed / totalProcessed) * 100 : 0;

    // Calculate SDOD (Same Day on Delivery) = outbound / (inbound + backlogs)
    const totalIncoming = currentStats.totalInbound + currentStats.totalBacklogs;
    const sdod = totalIncoming > 0 
      ? (currentStats.totalOutbound / totalIncoming) * 100 
      : 0;

    // Format daily trends for chart
    const formattedDailyTrends = dailyTrends.map(day => ({
      name: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
      date: day._id,
      inbound: day.inbound,
      outbound: day.outbound,
      backlogs: day.backlogs,
      delivered: day.delivered,
      failed: day.failed,
      inboundWithBacklogs: day.inbound + day.backlogs, // Combined inbound + backlogs for chart
      revenue: day.delivered * 15, // Assuming ₱15 per delivered parcel
      sdod: (() => {
        const totalIncoming = day.inbound + day.backlogs;
        return totalIncoming > 0 ? (day.outbound / totalIncoming) * 100 : 0; // SDOD calculation per day
      })()
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
          backlogs: 0,
          delivered: 0,
          failed: 0,
          inboundWithBacklogs: 0, // Combined inbound + backlogs for chart
          revenue: 0,
          sdod: 0
        });
      }
      formattedDailyTrends.push(...dummyTrends);
    }

    // Calculate number of days in the selected period for average calculations
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    // Calculate productivity metrics
    const tripsData = tripsStats[0] || {
      total2WTrips: 0,
      total3WTrips: 0,
      total4WTrips: 0,
      totalTrips: 0
    };

    // Productivity = total outbound parcels / total trips for each vehicle type
    // Use proportional distribution based on actual trips data if available
    const totalTrips = tripsData.totalTrips;
    let productivity2W = 0, productivity3W = 0, productivity4W = 0;
    
    if (totalTrips > 0) {
      // Calculate proportional outbound distribution based on trips ratio
      const outbound2W = tripsData.total2WTrips > 0 ? (currentStats.totalOutbound * (tripsData.total2WTrips / totalTrips)) : 0;
      const outbound3W = tripsData.total3WTrips > 0 ? (currentStats.totalOutbound * (tripsData.total3WTrips / totalTrips)) : 0;
      const outbound4W = tripsData.total4WTrips > 0 ? (currentStats.totalOutbound * (tripsData.total4WTrips / totalTrips)) : 0;
      
      productivity2W = tripsData.total2WTrips > 0 ? Math.round((outbound2W / tripsData.total2WTrips) * 100) / 100 : 0;
      productivity3W = tripsData.total3WTrips > 0 ? Math.round((outbound3W / tripsData.total3WTrips) * 100) / 100 : 0;
      productivity4W = tripsData.total4WTrips > 0 ? Math.round((outbound4W / tripsData.total4WTrips) * 100) / 100 : 0;
    }
    
    const overallProductivity = totalTrips > 0 ? Math.round(currentStats.totalOutbound / totalTrips * 100) / 100 : 0;

    const dashboardData = {
      stats: {
        totalInbound: currentStats.totalInbound,
        totalOutbound: currentStats.totalOutbound,
        totalBacklogs: currentStats.totalBacklogs,
        totalDelivered: currentStats.totalDelivered,
        totalFailed: currentStats.totalFailed,
        successRate: Math.round(successRate * 10) / 10,
        failedRate: Math.round(failedRate * 10) / 10,
        sdod: Math.round(sdod * 10) / 10, // SDOD percentage
        totalHubs,
        totalReports: currentStats.totalReports
      },
      recentStats: recentStatsData,
      dailyTrends: formattedDailyTrends,
      hubPerformance,
      keyMetrics: {
        averageSuccessRate: Math.round(successRate * 10) / 10,
        averageVolume: Math.round((currentStats.totalInbound + currentStats.totalBacklogs) / periodDays),
        firstAttemptSuccess: Math.round(successRate * 0.9 * 10) / 10, // Estimated
        activeFleet: totalHubs * 8, // Estimated vehicles per hub
        sdodRate: Math.round(sdod * 10) / 10, // SDOD percentage
        productivity: {
          overall: overallProductivity,
          '2W': productivity2W,
          '3W': productivity3W,
          '4W': productivity4W
        },
        tripsData: {
          total2WTrips: tripsData.total2WTrips,
          total3WTrips: tripsData.total3WTrips,
          total4WTrips: tripsData.total4WTrips,
          totalTrips: tripsData.totalTrips
        }
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
