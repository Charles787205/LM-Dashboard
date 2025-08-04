import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Report from '@/models/Reports';
import Hub from '@/models/Hubs';
import FailedDelivery from '@/models/Failed_Deliveries';
import Attendance from '@/models/Attendance';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last-7-days';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'last-7-days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last-30-days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last-90-days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get detailed hub performance with client information
    const hubPerformanceDetailed = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
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
          _id: {
            hubId: '$hubInfo._id',
            hubName: '$hubInfo.name',
            client: '$hubInfo.client'
          },
          totalInbound: { $sum: '$inbound' },
          totalOutbound: { $sum: '$outbound' },
          totalDelivered: { $sum: '$delivered' },
          totalFailed: { $sum: '$failed' },
          totalBacklogs: { $sum: '$backlogs' },
          totalMisroutes: { $sum: '$misroutes' },
          avgAttendanceHubLead: { $avg: '$attendance.hub_lead' },
          avgAttendanceBackroom: { $avg: '$attendance.backroom' },
          totalReports: { $sum: 1 }
        }
      },
      {
        $addFields: {
          totalProcessed: { $add: ['$totalDelivered', '$totalFailed'] },
          successRate: {
            $cond: {
              if: { $eq: [{ $add: ['$totalDelivered', '$totalFailed'] }, 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$totalDelivered', { $add: ['$totalDelivered', '$totalFailed'] }] },
                  100
                ]
              }
            }
          },
          deliveryEfficiency: {
            $cond: {
              if: { $eq: ['$totalInbound', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$totalDelivered', '$totalInbound'] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $sort: { successRate: -1 }
      }
    ]);

    // Get client comparison data
    const clientComparison = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
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
          _id: '$hubInfo.client',
          totalHubs: { $addToSet: '$hubInfo._id' },
          totalInbound: { $sum: '$inbound' },
          totalDelivered: { $sum: '$delivered' },
          totalFailed: { $sum: '$failed' },
          totalReports: { $sum: 1 }
        }
      },
      {
        $addFields: {
          hubCount: { $size: '$totalHubs' },
          successRate: {
            $cond: {
              if: { $eq: [{ $add: ['$totalDelivered', '$totalFailed'] }, 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$totalDelivered', { $add: ['$totalDelivered', '$totalFailed'] }] },
                  100
                ]
              }
            }
          },
          revenue: { $multiply: ['$totalDelivered', 15] }
        }
      },
      {
        $sort: { successRate: -1 }
      }
    ]);

    // Get vehicle type analytics based on trips data with successful deliveries
    const vehicleAnalytics = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total2W: { $sum: '$trips.2w' },
          total3W: { $sum: '$trips.3w' },
          total4W: { $sum: '$trips.4w' },
          successful2W: { $sum: '$successful_deliveries.2w' },
          successful3W: { $sum: '$successful_deliveries.3w' },
          successful4W: { $sum: '$successful_deliveries.4w' },
          totalDelivered: { $sum: '$delivered' },
          totalOutbound: { $sum: '$outbound' }
        }
      }
    ]);

    const vehicleData = vehicleAnalytics[0] || { 
      total2W: 0, total3W: 0, total4W: 0, 
      successful2W: 0, successful3W: 0, successful4W: 0,
      totalDelivered: 0, totalOutbound: 0 
    };
    const totalTrips = vehicleData.total2W + vehicleData.total3W + vehicleData.total4W;

    // Get time-based performance trends
    const dailyPerformance = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
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
          delivered: { $sum: '$delivered' },
          failed: { $sum: '$failed' },
          inbound: { $sum: '$inbound' },
          outbound: { $sum: '$outbound' },
          backlogs: { $sum: '$backlogs' }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: {
              if: { $eq: [{ $add: ['$delivered', '$failed'] }, 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$delivered', { $add: ['$delivered', '$failed'] }] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get attendance analytics
    const attendanceStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgHubLead: { $avg: '$attendance.hub_lead' },
          avgBackroom: { $avg: '$attendance.backroom' },
          totalHubLead: { $sum: '$attendance.hub_lead' },
          totalBackroom: { $sum: '$attendance.backroom' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        hubPerformanceDetailed,
        clientComparison: clientComparison.map(client => ({
          client: client._id,
          hubs: client.hubCount,
          totalDeliveries: client.totalDelivered,
          successRate: Math.round(client.successRate * 10) / 10,
          revenue: client.revenue,
          growth: '+0%' // You can calculate this from historical data
        })),
        vehicleTypeData: [
          {
            type: '2-Wheeler',
            trips: vehicleData.total2W,
            successfulDeliveries: vehicleData.successful2W,
            efficiency: vehicleData.total2W > 0 ? Math.round((vehicleData.successful2W / vehicleData.total2W) * 100 * 10) / 10 : 0,
            avgDeliveries: vehicleData.total2W > 0 ? Math.round(vehicleData.successful2W / vehicleData.total2W * 10) / 10 : 0,
            productivity: vehicleData.total2W > 0 ? Math.round((vehicleData.totalOutbound * 0.6) / vehicleData.total2W * 10) / 10 : 0,
            color: '#3B82F6'
          },
          {
            type: '3-Wheeler',
            trips: vehicleData.total3W,
            successfulDeliveries: vehicleData.successful3W,
            efficiency: vehicleData.total3W > 0 ? Math.round((vehicleData.successful3W / vehicleData.total3W) * 100 * 10) / 10 : 0,
            avgDeliveries: vehicleData.total3W > 0 ? Math.round(vehicleData.successful3W / vehicleData.total3W * 10) / 10 : 0,
            productivity: vehicleData.total3W > 0 ? Math.round((vehicleData.totalOutbound * 0.3) / vehicleData.total3W * 10) / 10 : 0,
            color: '#10B981'
          },
          {
            type: '4-Wheeler',
            trips: vehicleData.total4W,
            successfulDeliveries: vehicleData.successful4W,
            efficiency: vehicleData.total4W > 0 ? Math.round((vehicleData.successful4W / vehicleData.total4W) * 100 * 10) / 10 : 0,
            avgDeliveries: vehicleData.total4W > 0 ? Math.round(vehicleData.successful4W / vehicleData.total4W * 10) / 10 : 0,
            productivity: vehicleData.total4W > 0 ? Math.round((vehicleData.totalOutbound * 0.1) / vehicleData.total4W * 10) / 10 : 0,
            color: '#F59E0B'
          }
        ],
        dailyPerformance: dailyPerformance.map(day => ({
          date: day._id,
          name: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
          delivered: day.delivered,
          failed: day.failed,
          successRate: Math.round(day.successRate * 10) / 10,
          inbound: day.inbound,
          outbound: day.outbound,
          backlogs: day.backlogs
        })),
        attendanceStats: attendanceStats[0] || {
          avgHubLead: 0,
          avgBackroom: 0,
          totalHubLead: 0,
          totalBackroom: 0
        },
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Enhanced analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enhanced analytics data' },
      { status: 500 }
    );
  }
}
