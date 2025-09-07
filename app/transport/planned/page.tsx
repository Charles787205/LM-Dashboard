'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Truck, MapPin, Package, Users, Plus, Edit, Trash2 } from 'lucide-react';

interface PlannedRoute {
  id: string;
  vehicleId: string;
  driver: string;
  route: string;
  scheduledDate: string;
  startTime: string;
  estimatedEndTime: string;
  plannedDeliveries: number;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'confirmed' | 'pending';
  stops: string[];
  distance: number;
  estimatedDuration: string;
}

const TransportPlannedPage = () => {
  const [plannedRoutes, setPlannedRoutes] = useState<PlannedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'confirmed' | 'pending'>('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: PlannedRoute[] = [
      {
        id: '1',
        vehicleId: 'TRK-001',
        driver: 'John Smith',
        route: 'Route A1',
        scheduledDate: '2025-09-08',
        startTime: '08:00',
        estimatedEndTime: '14:30',
        plannedDeliveries: 15,
        priority: 'high',
        status: 'confirmed',
        stops: ['Stop 1', 'Stop 2', 'Stop 3', 'Stop 4'],
        distance: 120,
        estimatedDuration: '6h 30m'
      },
      {
        id: '2',
        vehicleId: 'TRK-002',
        driver: 'Sarah Johnson',
        route: 'Route B2',
        scheduledDate: '2025-09-08',
        startTime: '09:00',
        estimatedEndTime: '16:00',
        plannedDeliveries: 12,
        priority: 'medium',
        status: 'scheduled',
        stops: ['Stop A', 'Stop B', 'Stop C'],
        distance: 95,
        estimatedDuration: '7h 00m'
      },
      {
        id: '3',
        vehicleId: 'TRK-003',
        driver: 'Mike Davis',
        route: 'Route C1',
        scheduledDate: '2025-09-09',
        startTime: '08:30',
        estimatedEndTime: '15:30',
        plannedDeliveries: 18,
        priority: 'high',
        status: 'pending',
        stops: ['Stop X', 'Stop Y', 'Stop Z', 'Stop W', 'Stop V'],
        distance: 140,
        estimatedDuration: '7h 00m'
      },
      {
        id: '4',
        vehicleId: 'TRK-004',
        driver: 'Lisa Brown',
        route: 'Route D1',
        scheduledDate: '2025-09-09',
        startTime: '07:45',
        estimatedEndTime: '14:45',
        plannedDeliveries: 10,
        priority: 'low',
        status: 'confirmed',
        stops: ['Stop M', 'Stop N'],
        distance: 80,
        estimatedDuration: '7h 00m'
      }
    ];

    setTimeout(() => {
      setPlannedRoutes(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedDate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRoutes = plannedRoutes.filter(route => {
    const dateMatch = route.scheduledDate >= selectedDate;
    const statusMatch = filter === 'all' ? true : route.status === filter;
    return dateMatch && statusMatch;
  });

  const stats = {
    total: filteredRoutes.length,
    confirmed: filteredRoutes.filter(r => r.status === 'confirmed').length,
    scheduled: filteredRoutes.filter(r => r.status === 'scheduled').length,
    pending: filteredRoutes.filter(r => r.status === 'pending').length,
    totalDeliveries: filteredRoutes.reduce((sum, r) => sum + r.plannedDeliveries, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading planned routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planned Routes</h1>
          <p className="text-gray-600 mt-1">Schedule and manage upcoming delivery routes</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Route
        </button>
      </div>

      {/* Date Filter & Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Date (from)
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-xl font-bold text-purple-600">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex space-x-1">
          {['all', 'confirmed', 'scheduled', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle & Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route & Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deliveries & Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {route.vehicleId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {route.driver}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{route.route}</div>
                    <div className="text-sm text-gray-500">
                      {route.scheduledDate} | {route.startTime} - {route.estimatedEndTime}
                    </div>
                    <div className="text-xs text-gray-400">
                      Duration: {route.estimatedDuration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center mb-1">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {route.plannedDeliveries} deliveries
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {route.distance} km
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {route.stops.length} stops
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(route.priority)}`}>
                      {route.priority.charAt(0).toUpperCase() + route.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(route.status)}`}>
                      {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No planned routes found</h3>
            <p className="text-gray-500">Try adjusting your date filter or create a new route.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportPlannedPage;
