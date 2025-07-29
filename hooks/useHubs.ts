'use client';

import { useState, useEffect } from 'react';

interface Hub {
  _id: string;
  name: string;
  client: string;
  hub_cost_per_parcel: {
    "2W": number;
    "3W": number;
    "4W": number;
  };
  hub_profit_per_parcel: {
    "2W": number;
    "3W": number;
    "4W": number;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubsData {
  success: boolean;
  data: Hub[];
}

const CACHE_KEY = 'hubs_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useHubs() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = (): { data: Hub[]; timestamp: number } | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Error reading from cache:', e);
    }
    return null;
  };

  const setCachedData = (data: Hub[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.error('Error writing to cache:', e);
    }
  };

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchHubs = async (force: boolean = false) => {
    try {
      // Check cache first unless force refresh
      if (!force) {
        const cached = getCachedData();
        if (cached && isCacheValid(cached.timestamp)) {
          setHubs(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      setLoading(true);
      const response = await fetch('/api/hubs', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hubs');
      }

      const data: HubsData = await response.json();
      
      if (data.success) {
        setHubs(data.data);
        setCachedData(data.data);
        setError(null);
        return data.data;
      } else {
        throw new Error('Failed to fetch hubs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Try to use cached data even if it's stale
      const cached = getCachedData();
      if (cached) {
        setHubs(cached.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshHubs = () => {
    return fetchHubs(true);
  };

  const invalidateCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  return {
    hubs,
    loading,
    error,
    refreshHubs,
    invalidateCache,
    refetch: fetchHubs
  };
}
