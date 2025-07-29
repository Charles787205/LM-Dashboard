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

interface RecentStats {
  recentInbound: number;
  recentOutbound: number;
  recentDelivered: number;
  recentFailed: number;
  recentReports: number;
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

interface FailedDeliveryReason {
  reason: string;
  count: number;
  percentage: number;
  color: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentStats: RecentStats;
  dailyTrends: DailyTrend[];
  hubPerformance: HubPerformance[];
  keyMetrics: KeyMetrics;
  failedDeliveryBreakdown: FailedDeliveryReason[];
}

export const useDashboardAnalytics = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
