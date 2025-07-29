import { useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  position?: string;
  hubId?: string;
  hubName?: string;
  status: string;
  employeeId?: string;
  joinDate: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  rating: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface Hub {
  _id: string;
  name: string;
  location: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  drivers: number;
  managers: number;
  dispatchers: number;
  avgRating: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersData {
  users: User[];
  pagination: Pagination;
  stats: UserStats;
  hubs: Hub[];
}

interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  hubId?: string;
}

export const useUsers = (initialFilters: UsersFilters = {}) => {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UsersFilters>(initialFilters);

  const fetchUsers = async (newFilters?: UsersFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const searchParams = new URLSearchParams();
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/v1/users?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const usersData = await response.json();
      setData(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<UsersFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchUsers(updatedFilters);
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();
      // Refresh the users list
      await fetchUsers();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const result = await response.json();
      // Refresh the users list
      await fetchUsers();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      const result = await response.json();
      // Refresh the users list
      await fetchUsers();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const getUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/users/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }
      
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refetch = () => {
    fetchUsers();
  };

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    refetch
  };
};
