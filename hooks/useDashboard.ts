import { useState, useEffect } from 'react';

interface DashboardStats {
  totalInbound: number;
  totalOutbound: number;
  totalBacklogs: number;
  totalDelivered: number;
  totalFailed: number;
  successRate: number;
  failedRate: number;
  sdod: number;
  totalHubs: number;
  totalReports: number;
}

interface DailyTrend {
  name: string;
  date: string;
  inbound: number;
  outbound: number;
  backlogs: number;
  delivered: number;
  failed: number;
  revenue: number;
  sdod: number;
}

interface HubPerformance {
  _id: string;
  totalDelivered: number;
  totalFailed: number;
  totalProcessed: number;
  successRate: number;
}

interface KeyMetrics {
  averageSuccessRate: number;
  averageVolume: number;
  firstAttemptSuccess: number;
  activeFleet: number;
  sdodRate: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentStats: {
    recentInbound: number;
    recentOutbound: number;
    recentBacklogs: number;
    recentDelivered: number;
    recentFailed: number;
    recentReports: number;
  };
  dailyTrends: DailyTrend[];
  hubPerformance: HubPerformance[];
  keyMetrics: KeyMetrics;
  failedDeliveryBreakdown?: Array<{
    reason: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

interface DashboardFilters {
  period?: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
  hubId?: string;
  excludeSundays?: boolean;
}

export function useDashboard(filters: DashboardFilters = {}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.hubId) params.append('hubId', filters.hubId);
      if (filters.excludeSundays) params.append('excludeSundays', 'true');
      
      const response = await fetch(`/api/dashboard?${params.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters.period, filters.startDate, filters.endDate, filters.hubId, filters.excludeSundays]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}
