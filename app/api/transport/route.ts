import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock transport data - replace with actual database queries when needed
const generateTransportData = (period: string) => {
  const today = new Date();
  const daysToGenerate = period === 'daily' ? 1 : 
                        period === 'weekly' ? 7 : 
                        period === '15days' ? 15 : 
                        period === 'monthly' ? 30 : 7;

  const dailyData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const baseDistance = 1800 + Math.random() * 500;
    const baseDeliveries = 180 + Math.random() * 50;
    const baseFuel = baseDistance * 0.18; // Roughly 5.5 km/L
    const baseCost = baseDistance * 8.5; // Cost per km
    
    dailyData.push({
      name: period === 'daily' ? 'Today' : dayNames[date.getDay()],
      date: date.toISOString().split('T')[0],
      distance: Math.round(baseDistance),
      deliveries: Math.round(baseDeliveries),
      fuel: Math.round(baseFuel),
      cost: Math.round(baseCost),
      efficiency: Math.round((baseDistance / baseFuel) * 10) / 10 // km/L
    });
  }

  return dailyData;
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'weekly';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Generate mock transport data
    const dailyTrends = generateTransportData(period);
    
    // Calculate totals
    const stats = {
      totalDistance: dailyTrends.reduce((sum, day) => sum + day.distance, 0),
      totalDeliveries: dailyTrends.reduce((sum, day) => sum + day.deliveries, 0),
      totalFuel: dailyTrends.reduce((sum, day) => sum + day.fuel, 0),
      totalCost: dailyTrends.reduce((sum, day) => sum + day.cost, 0),
      activeVehicles: 45,
      maintenanceVehicles: 8,
      idleVehicles: 12,
      outOfServiceVehicles: 3,
      averageEfficiency: dailyTrends.reduce((sum, day) => sum + day.efficiency, 0) / dailyTrends.length
    };

    // Fleet status breakdown
    const fleetStatus = [
      { name: 'Active', value: stats.activeVehicles, color: '#10B981' },
      { name: 'In Maintenance', value: stats.maintenanceVehicles, color: '#F59E0B' },
      { name: 'Idle', value: stats.idleVehicles, color: '#6B7280' },
      { name: 'Out of Service', value: stats.outOfServiceVehicles, color: '#EF4444' }
    ];

    // Route performance (mock data)
    const routePerformance = [
      { 
        route: 'Route A', 
        efficiency: 92 + Math.random() * 6,
        onTime: 95 + Math.random() * 4,
        cost: 12000 + Math.random() * 3000,
        distance: 850 + Math.random() * 200,
        deliveries: 85 + Math.random() * 20
      },
      { 
        route: 'Route B', 
        efficiency: 88 + Math.random() * 8,
        onTime: 91 + Math.random() * 6,
        cost: 15000 + Math.random() * 4000,
        distance: 950 + Math.random() * 250,
        deliveries: 95 + Math.random() * 25
      },
      { 
        route: 'Route C', 
        efficiency: 94 + Math.random() * 4,
        onTime: 97 + Math.random() * 2,
        cost: 11000 + Math.random() * 2000,
        distance: 750 + Math.random() * 150,
        deliveries: 75 + Math.random() * 15
      },
      { 
        route: 'Route D', 
        efficiency: 85 + Math.random() * 10,
        onTime: 89 + Math.random() * 8,
        cost: 16000 + Math.random() * 5000,
        distance: 1000 + Math.random() * 300,
        deliveries: 100 + Math.random() * 30
      }
    ].map(route => ({
      ...route,
      efficiency: Math.round(route.efficiency * 10) / 10,
      onTime: Math.round(route.onTime * 10) / 10,
      cost: Math.round(route.cost),
      distance: Math.round(route.distance),
      deliveries: Math.round(route.deliveries)
    }));

    // Key metrics
    const keyMetrics = {
      fleetUtilization: Math.round((stats.activeVehicles / (stats.activeVehicles + stats.maintenanceVehicles + stats.idleVehicles + stats.outOfServiceVehicles)) * 1000) / 10,
      onTimeDelivery: Math.round((routePerformance.reduce((sum, route) => sum + route.onTime, 0) / routePerformance.length) * 10) / 10,
      averageFuelEfficiency: Math.round(stats.averageEfficiency * 10) / 10,
      costPerDelivery: Math.round((stats.totalCost / stats.totalDeliveries) * 100) / 100,
      routeOptimization: Math.round((routePerformance.reduce((sum, route) => sum + route.efficiency, 0) / routePerformance.length) * 10) / 10,
      totalTrips: dailyTrends.reduce((sum, day) => sum + Math.round(day.deliveries / 15), 0) // Assuming ~15 deliveries per trip
    };

    const transportData = {
      period,
      dateRange: {
        start: startDate || dailyTrends[0]?.date,
        end: endDate || dailyTrends[dailyTrends.length - 1]?.date
      },
      stats,
      dailyTrends,
      fleetStatus,
      routePerformance,
      keyMetrics,
      recentActivity: [
        {
          id: 1,
          type: 'delivery',
          message: 'Route A completed 95 deliveries',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          type: 'maintenance',
          message: 'Vehicle TRK-001 scheduled for maintenance',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'pending'
        },
        {
          id: 3,
          type: 'alert',
          message: 'Route B experiencing delays',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'warning'
        }
      ]
    };

    return NextResponse.json(transportData);
  } catch (error) {
    console.error('Transport API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transport data' },
      { status: 500 }
    );
  }
}
