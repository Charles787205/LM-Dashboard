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

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard', {
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
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}
