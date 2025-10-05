'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Truck, Clock, MapPin, Package, AlertCircle, XCircle, Edit } from 'lucide-react';

interface Vehicle {
  _id: string;
  vehicle_plate_number: string;
  vehicleType: string;
}

interface Location {
  _id: string;
  name: string;
  type: string;
}

interface Plan {
  _id: string;
  date: string;
  origin: Location;
  numberOfTrips: number;
  fulfillment?: number;
  remarks?: string;
}

interface Actual {
  _id: string;
  plan: Plan;
  vehicle: Vehicle;
  status: 'completed' | 'canceled' | 'pending';
  linhaulTripNumber?: string;
  tripSequence: number;
  callTime?: {
    callTime: string;
    arrival?: string;
  };
  tripDetail?: {
    departureTime: string;
    arrivalTime: string;
    totalParcels: number;
    destination: Location;
    odometer?: {
      start: number;
      end: number;
    };
  };
  loadingDetail?: {
    timeIn?: string;
    timeOut?: string;
  };
  unloadingDetail?: {
    timeIn?: string;
    timeOut?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const TransportActualPage = () => {
  const [actuals, setActuals] = useState<Actual[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'canceled' | 'pending'>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedActual, setSelectedActual] = useState<Actual | null>(null);

  useEffect(() => {
    fetchActuals();
  }, []);

  const fetchActuals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transport/actuals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch actuals');
      }
      
      const data = await response.json();
      setActuals(data.actuals || []);
    } catch (error) {
      console.error('Error fetching actuals:', error);
      setActuals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditActual = (actual: Actual) => {
    setSelectedActual(actual);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedActual(null);
  };

  const handleUpdateActual = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/transport/actuals/${selectedActual?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        // Refresh the actuals list
        fetchActuals();
        handleCloseEditModal();
      } else {
        console.error('Failed to update actual');
      }
    } catch (error) {
      console.error('Error updating actual:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Truck className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredActuals = actuals.filter(actual => 
    filter === 'all' ? true : actual.status === filter
  );

  const stats = {
    total: actuals.length,
    completed: actuals.filter(d => d.status === 'completed').length,
    pending: actuals.filter(d => d.status === 'pending').length,
    canceled: actuals.filter(d => d.status === 'canceled').length
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actuals</p>
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
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Canceled</p>
              <p className="text-2xl font-bold text-red-600">{stats.canceled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex space-x-1">
          {['all', 'completed', 'pending', 'canceled'].map((status) => (
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

      {/* Actuals List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle & Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActuals.map((actual) => (
                <tr key={actual._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {actual.vehicle?.vehicle_plate_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {actual.vehicle?.vehicleType || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Trip #{actual.tripSequence}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {actual.plan?.origin?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {actual.linhaulTripNumber || 'No linhaul #'}
                    </div>
                    {actual.tripDetail?.totalParcels && (
                      <div className="flex items-center mt-1">
                        <Package className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {actual.tripDetail.totalParcels} parcels
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(actual.status)}`}>
                      {getStatusIcon(actual.status)}
                      <span className="ml-1 capitalize">{actual.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {actual.tripDetail?.destination?.name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {actual.tripDetail?.departureTime && (
                      <div>Departure: {new Date(actual.tripDetail.departureTime).toLocaleTimeString()}</div>
                    )}
                    {actual.tripDetail?.arrivalTime && (
                      <div>Arrival: {new Date(actual.tripDetail.arrivalTime).toLocaleTimeString()}</div>
                    )}
                    {actual.callTime?.callTime && (
                      <div className="text-gray-500">
                        Called: {new Date(actual.callTime.callTime).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEditActual(actual)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredActuals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No actual trips found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedActual && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Actual Trip</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={selectedActual.status}
                    onChange={(e) => setSelectedActual({
                      ...selectedActual,
                      status: e.target.value as 'completed' | 'canceled' | 'pending'
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                  <input
                    type="datetime-local"
                    value={selectedActual.tripDetail?.departureTime ? 
                      new Date(selectedActual.tripDetail.departureTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setSelectedActual({
                      ...selectedActual,
                      tripDetail: {
                        ...selectedActual.tripDetail!,
                        departureTime: e.target.value,
                        arrivalTime: selectedActual.tripDetail?.arrivalTime || '',
                        totalParcels: selectedActual.tripDetail?.totalParcels || 0,
                        destination: selectedActual.tripDetail?.destination!
                      }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                  <input
                    type="datetime-local"
                    value={selectedActual.tripDetail?.arrivalTime ? 
                      new Date(selectedActual.tripDetail.arrivalTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setSelectedActual({
                      ...selectedActual,
                      tripDetail: {
                        ...selectedActual.tripDetail!,
                        departureTime: selectedActual.tripDetail?.departureTime || '',
                        arrivalTime: e.target.value,
                        totalParcels: selectedActual.tripDetail?.totalParcels || 0,
                        destination: selectedActual.tripDetail?.destination!
                      }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Linhaul Trip Number</label>
                  <input
                    type="text"
                    value={selectedActual.linhaulTripNumber || ''}
                    onChange={(e) => setSelectedActual({
                      ...selectedActual,
                      linhaulTripNumber: e.target.value
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {selectedActual.tripDetail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Parcels</label>
                    <input
                      type="number"
                      value={selectedActual.tripDetail.totalParcels || ''}
                      onChange={(e) => setSelectedActual({
                        ...selectedActual,
                        tripDetail: {
                          ...selectedActual.tripDetail!,
                          totalParcels: parseInt(e.target.value) || 0
                        }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateActual(selectedActual)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportActualPage;
