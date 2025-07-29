'use client';

import { useState, useEffect } from 'react';

interface Report {
  _id: string;
  hub: {
    _id: string;
    name: string;
    client: string;
  };
  inbound: number;
  outbound: number;
  backlogs: number;
  delivered: number;
  failed: number;
  misroutes: number;
  attendance: {
    hub_lead: number;
    backroom: number;
  };
  trips: {
    "2w": number;
    "3w": number;
    "4w": number;
  };
  successful_deliveries: {
    "2w": number;
    "3w": number;
    "4w": number;
  };
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportsData {
  success: boolean;
  data: Report[];
}

const CACHE_KEY = 'reports_cache';
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (shorter than hubs since reports change more frequently)

export function useReports(hubId?: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCacheKey = () => hubId ? `${CACHE_KEY}_${hubId}` : CACHE_KEY;

  const getCachedData = (): { data: Report[]; timestamp: number } | null => {
    try {
      const cached = localStorage.getItem(getCacheKey());
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Error reading from cache:', e);
    }
    return null;
  };

  const setCachedData = (data: Report[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(getCacheKey(), JSON.stringify(cacheData));
    } catch (e) {
      console.error('Error writing to cache:', e);
    }
  };

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchReports = async (force: boolean = false) => {
    try {
      // Check cache first unless force refresh
      if (!force) {
        const cached = getCachedData();
        if (cached && isCacheValid(cached.timestamp)) {
          setReports(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      setLoading(true);
      const url = hubId ? `/api/reports?hubId=${hubId}` : '/api/reports';
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data: ReportsData = await response.json();
      
      if (data.success) {
        setReports(data.data);
        setCachedData(data.data);
        setError(null);
        return data.data;
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Try to use cached data even if it's stale
      const cached = getCachedData();
      if (cached) {
        setReports(cached.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = () => {
    return fetchReports(true);
  };

  const invalidateCache = () => {
    localStorage.removeItem(getCacheKey());
  };

  const createReport = async (reportData: any) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const result = await response.json();
      
      if (result.success) {
        // Invalidate cache and refresh
        invalidateCache();
        await refreshReports();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create report');
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchReports();
  }, [hubId]);

  return {
    reports,
    loading,
    error,
    refreshReports,
    invalidateCache,
    createReport,
    refetch: fetchReports
  };
}
