'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Truck, Clock, MapPin, Package, AlertCircle } from 'lucide-react';

interface ActualDelivery {
  id: string;
  vehicleId: string;
  driver: string;
  route: string;
  startTime: string;
  endTime?: string;
  status: 'completed' | 'in-progress' | 'delayed' | 'failed';
  deliveries: number;
  completedDeliveries: number;
  location: string;
  estimatedCompletion?: string;
}

const TransportActualPage = () => {
  const [actualDeliveries, setActualDeliveries] = useState<ActualDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'delayed' | 'failed'>('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: ActualDelivery[] = [
      {
        id: '1',
        vehicleId: 'TRK-001',
        driver: 'John Smith',
        route: 'Route A1',
        startTime: '08:00',
        endTime: '14:30',
        status: 'completed',
        deliveries: 15,
        completedDeliveries: 15,
        location: 'Depot'
      },
      {
        id: '2',
        vehicleId: 'TRK-002',
        driver: 'Sarah Johnson',
        route: 'Route B2',
        startTime: '09:00',
        status: 'in-progress',
        deliveries: 12,
        completedDeliveries: 8,
        location: 'Downtown Area',
        estimatedCompletion: '16:00'
      },
      {
        id: '3',
        vehicleId: 'TRK-003',
        driver: 'Mike Davis',
        route: 'Route C1',
        startTime: '08:30',
        status: 'delayed',
        deliveries: 10,
        completedDeliveries: 5,
        location: 'Highway Junction',
        estimatedCompletion: '17:30'
      },
      {
        id: '4',
        vehicleId: 'TRK-004',
        driver: 'Lisa Brown',
        route: 'Route D1',
        startTime: '07:45',
        status: 'failed',
        deliveries: 8,
        completedDeliveries: 3,
        location: 'Industrial Zone'
      }
    ];

    setTimeout(() => {
      setActualDeliveries(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Truck className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredDeliveries = actualDeliveries.filter(delivery => 
    filter === 'all' ? true : delivery.status === filter
  );

  const stats = {
    total: actualDeliveries.length,
    completed: actualDeliveries.filter(d => d.status === 'completed').length,
    inProgress: actualDeliveries.filter(d => d.status === 'in-progress').length,
    delayed: actualDeliveries.filter(d => d.status === 'delayed').length,
    failed: actualDeliveries.filter(d => d.status === 'failed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading actual transport data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actual Deliveries</h1>
          <p className="text-gray-600 mt-1">Real-time tracking of ongoing and completed deliveries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delayed</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.delayed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex space-x-1">
          {['all', 'completed', 'in-progress', 'delayed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle & Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.vehicleId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.driver}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{delivery.route}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {delivery.completedDeliveries}/{delivery.deliveries}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(delivery.completedDeliveries / delivery.deliveries) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      <span className="ml-1 capitalize">{delivery.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{delivery.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Start: {delivery.startTime}</div>
                    {delivery.endTime ? (
                      <div>End: {delivery.endTime}</div>
                    ) : delivery.estimatedCompletion ? (
                      <div className="text-gray-500">ETA: {delivery.estimatedCompletion}</div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransportActualPage;
