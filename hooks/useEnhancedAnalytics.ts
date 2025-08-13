import { useState, useEffect } from 'react';

interface HubPerformanceDetailed {
  _id: {
    hubId: string;
    hubName: string;
    client: string;
  };
  totalInbound: number;
  totalOutbound: number;
  totalDelivered: number;
  totalFailed: number;
  totalBacklogs: number;
  totalMisroutes: number;
  avgAttendanceHubLead: number;
  avgAttendanceBackroom: number;
  totalReports: number;
  totalProcessed: number;
  successRate: number;
  deliveryEfficiency: number;
}

interface ClientComparison {
  client: string;
  hubs: number;
  totalDeliveries: number;
  successRate: number;
  revenue: number;
  growth: string;
}

interface VehicleTypeData {
  type: string;
  trips: number;
  successfulDeliveries: number;
  efficiency: number;
  avgDeliveries: number;
  productivity: number;
  color: string;
}

interface DailyPerformance {
  date: string;
  name: string;
  delivered: number;
  failed: number;
  successRate: number;
  inbound: number;
  outbound: number;
  backlogs: number;
}

interface AttendanceStats {
  avgHubLead: number;
  avgBackroom: number;
  totalHubLead: number;
  totalBackroom: number;
}

interface SuccessfulDeliveriesChart {
  name: string;
  value: number;
  color: string;
}

interface EnhancedAnalyticsData {
  hubPerformanceDetailed: HubPerformanceDetailed[];
  clientComparison: ClientComparison[];
  vehicleTypeData: VehicleTypeData[];
  successfulDeliveriesChart: SuccessfulDeliveriesChart[];
  dailyPerformance: DailyPerformance[];
  attendanceStats: AttendanceStats;
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export const useEnhancedAnalytics = (period: string = 'last-7-days') => {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
      
      setData(result.data);
    } catch (err) {
      console.error('Error fetching enhanced analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const refetch = () => {
    fetchAnalyticsData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
