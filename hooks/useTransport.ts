import { useState, useEffect } from 'react';

interface TransportStats {
  totalDistance: number;
  totalDeliveries: number;
  totalFuel: number;
  totalCost: number;
  totalPlans: number;
  totalActuals: number;
  fulfillmentRate: number;
  averageTripsPerDay: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  idleVehicles: number;
  outOfServiceVehicles: number;
  averageEfficiency: number;
}

interface FleetStatusData {
  name: string;
  value: number;
  color: string;
}

interface RoutePerformanceData {
  route: string;
  efficiency: number;
  onTime: number;
  cost: number;
  distance: number;
  deliveries: number;
}

interface DailyTrendData {
  name: string;
  date: string;
  distance: number;
  deliveries: number;
  fuel: number;
  cost: number;
  efficiency: number;
}

interface KeyMetrics {
  fleetUtilization: number;
  onTimeDelivery: number;
  averageFuelEfficiency: number;
  costPerDelivery: number;
  routeOptimization: number;
  totalTrips: number;
}

interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  status: string;
}

interface TransportData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  stats: TransportStats;
  dailyTrends: DailyTrendData[];
  fleetStatus: FleetStatusData[];
  routePerformance: RoutePerformanceData[];
  keyMetrics: KeyMetrics;
  recentActivity: RecentActivity[];
}

interface TransportFilters {
  period: 'yesterday' | 'daily' | 'weekly' | '15days' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
}

interface UseTransportReturn {
  data: TransportData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransport(filters: TransportFilters): UseTransportReturn {
  const [data, setData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        period: filters.period
      });

      if (filters.period === 'custom' && filters.startDate && filters.endDate) {
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
      }

      const response = await fetch(`/api/transport?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setData(result);
    } catch (err) {
      console.error('Error fetching transport data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, [filters.period, filters.startDate, filters.endDate]);

  const refetch = () => {
    fetchTransportData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
}

export type {
  TransportData,
  TransportStats,
  FleetStatusData,
  RoutePerformanceData,
  DailyTrendData,
  KeyMetrics,
  RecentActivity,
  TransportFilters
};
