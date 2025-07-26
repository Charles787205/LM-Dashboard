import { useState, useEffect } from 'react';

interface DashboardStats {
  totalInbound: number;
  totalOutbound: number;
  totalDelivered: number;
  totalFailed: number;
  successRate: number;
  failedRate: number;
  totalHubs: number;
  totalReports: number;
}

interface DailyTrend {
  name: string;
  date: string;
  inbound: number;
  outbound: number;
  delivered: number;
  failed: number;
  revenue: number;
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
}

interface DashboardData {
  stats: DashboardStats;
  recentStats: {
    recentInbound: number;
    recentOutbound: number;
    recentDelivered: number;
    recentFailed: number;
    recentReports: number;
  };
  dailyTrends: DailyTrend[];
  hubPerformance: HubPerformance[];
  keyMetrics: KeyMetrics;
}

interface DashboardFilters {
  period?: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
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
  }, [filters.period, filters.startDate, filters.endDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}
