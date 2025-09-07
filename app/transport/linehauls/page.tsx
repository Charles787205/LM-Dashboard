'use client';

import React, { useState, useEffect } from 'react';
import { Route, Truck, Clock, MapPin, Package, AlertTriangle, CheckCircle, Plus, Filter } from 'lucide-react';

interface Linehaul {
  id: string;
  linehaulCode: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: string;
  departureTime: string;
  arrivalTime?: string;
  estimatedArrival: string;
  vehicleId: string;
  driver: string;
  cargo: {
    type: string;
    weight: number;
    volume: number;
    packages: number;
  };
  status: 'scheduled' | 'in-transit' | 'arrived' | 'delayed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  cost: number;
  route: string[];
}

const TransportLinehaulPage = () => {
  const [linehauls, setLinehauls] = useState<Linehaul[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in-transit' | 'arrived' | 'delayed'>('all');
  const [sortBy, setSortBy] = useState<'departure' | 'priority' | 'status'>('departure');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: Linehaul[] = [
      {
        id: '1',
        linehaulCode: 'LH-001',
        origin: 'Distribution Center A',
        destination: 'Hub B',
        distance: 450,
        estimatedDuration: '8h 30m',
        departureTime: '2025-09-07 22:00',
        estimatedArrival: '2025-09-08 06:30',
        vehicleId: 'TRK-LH-001',
        driver: 'Robert Johnson',
        cargo: {
          type: 'Mixed Parcels',
          weight: 12500,
          volume: 45.5,
          packages: 850
        },
        status: 'in-transit',
        priority: 'high',
        cost: 2800,
        route: ['Distribution Center A', 'Highway Junction', 'Rest Stop', 'Hub B']
      },
      {
        id: '2',
        linehaulCode: 'LH-002',
        origin: 'Hub B',
        destination: 'Distribution Center C',
        distance: 320,
        estimatedDuration: '6h 15m',
        departureTime: '2025-09-08 08:00',
        estimatedArrival: '2025-09-08 14:15',
        vehicleId: 'TRK-LH-002',
        driver: 'Maria Garcia',
        cargo: {
          type: 'Documents',
          weight: 2100,
          volume: 12.3,
          packages: 450
        },
        status: 'scheduled',
        priority: 'medium',
        cost: 1850,
        route: ['Hub B', 'City Center', 'Industrial Zone', 'Distribution Center C']
      },
      {
        id: '3',
        linehaulCode: 'LH-003',
        origin: 'Distribution Center C',
        destination: 'Hub D',
        distance: 280,
        estimatedDuration: '5h 45m',
        departureTime: '2025-09-07 16:30',
        arrivalTime: '2025-09-07 22:15',
        estimatedArrival: '2025-09-07 22:15',
        vehicleId: 'TRK-LH-003',
        driver: 'David Chen',
        cargo: {
          type: 'Electronics',
          weight: 8900,
          volume: 28.7,
          packages: 320
        },
        status: 'arrived',
        priority: 'high',
        cost: 2200,
        route: ['Distribution Center C', 'Mountain Pass', 'Valley Junction', 'Hub D']
      },
      {
        id: '4',
        linehaulCode: 'LH-004',
        origin: 'Hub D',
        destination: 'Distribution Center A',
        distance: 380,
        estimatedDuration: '7h 20m',
        departureTime: '2025-09-08 10:00',
        estimatedArrival: '2025-09-08 17:20',
        vehicleId: 'TRK-LH-004',
        driver: 'Jennifer Smith',
        cargo: {
          type: 'Returns',
          weight: 6700,
          volume: 22.1,
          packages: 180
        },
        status: 'delayed',
        priority: 'low',
        cost: 2100,
        route: ['Hub D', 'Border Checkpoint', 'Interstate 90', 'Distribution Center A']
      }
    ];

    setTimeout(() => {
      setLinehauls(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'arrived':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in-transit':
        return <Truck className="h-4 w-4 text-yellow-600" />;
      case 'arrived':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

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

  const filteredLinehauls = linehauls.filter(linehaul => 
    filter === 'all' ? true : linehaul.status === filter
  );

  const stats = {
    total: linehauls.length,
    scheduled: linehauls.filter(l => l.status === 'scheduled').length,
    inTransit: linehauls.filter(l => l.status === 'in-transit').length,
    arrived: linehauls.filter(l => l.status === 'arrived').length,
    delayed: linehauls.filter(l => l.status === 'delayed').length,
    totalCost: linehauls.reduce((sum, l) => sum + l.cost, 0),
    totalPackages: linehauls.reduce((sum, l) => sum + l.cargo.packages, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading linehaul data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Linehaul Operations</h1>
          <p className="text-gray-600 mt-1">Manage long-distance transport between hubs and distribution centers</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Linehaul
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Route className="h-6 w-6 text-gray-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Routes</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Truck className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">In Transit</p>
              <p className="text-xl font-bold text-yellow-600">{stats.inTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Arrived</p>
              <p className="text-xl font-bold text-green-600">{stats.arrived}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Delayed</p>
              <p className="text-xl font-bold text-red-600">{stats.delayed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Packages</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalPackages.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">$</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Cost</p>
              <p className="text-xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex space-x-1">
          {['all', 'scheduled', 'in-transit', 'arrived', 'delayed'].map((status) => (
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
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="departure">Sort by Departure</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Linehauls List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linehaul & Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLinehauls.map((linehaul) => (
                <tr key={linehaul.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Route className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {linehaul.linehaulCode}
                        </div>
                        <div className="text-sm text-gray-500">
                          {linehaul.vehicleId} - {linehaul.driver}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {linehaul.origin}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <div className="h-4 w-4 mr-1"></div>
                      ↓ {linehaul.destination}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {linehaul.distance} km • {linehaul.estimatedDuration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{linehaul.cargo.type}</div>
                    <div className="text-xs text-gray-500">
                      {linehaul.cargo.packages} packages
                    </div>
                    <div className="text-xs text-gray-500">
                      {linehaul.cargo.weight} kg • {linehaul.cargo.volume} m³
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Dep: {new Date(linehaul.departureTime).toLocaleDateString()} {new Date(linehaul.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {linehaul.arrivalTime ? (
                        `Arr: ${new Date(linehaul.arrivalTime).toLocaleDateString()} ${new Date(linehaul.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                      ) : (
                        `ETA: ${new Date(linehaul.estimatedArrival).toLocaleDateString()} ${new Date(linehaul.estimatedArrival).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(linehaul.priority)}`}>
                      {linehaul.priority.charAt(0).toUpperCase() + linehaul.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(linehaul.status)}`}>
                      {getStatusIcon(linehaul.status)}
                      <span className="ml-1 capitalize">{linehaul.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${linehaul.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLinehauls.length === 0 && (
          <div className="text-center py-12">
            <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No linehauls found</h3>
            <p className="text-gray-500">Try adjusting your filters or schedule a new linehaul.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportLinehaulPage;
