'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Truck, MapPin, Package, Users, Plus, Edit, Trash2, ClipboardList } from 'lucide-react';
import { AddPlanModal, PlanList, AddActualTripModal } from '@/components/transport';

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

interface Plan {
  _id?: string;
  date: Date;
  origin: {
    _id: string;
    name: string;
    type: string;
  } | string | null; // Can be populated object, string, or null
  numberOfTrips: number;
  fulfillment: number;
  remarks?: string;
  actuals?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

const TransportPlannedPage = () => {
  const [plannedRoutes, setPlannedRoutes] = useState<PlannedRoute[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'confirmed' | 'pending'>('all');
  const [activeTab, setActiveTab] = useState<'routes' | 'plans'>('plans');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showAddActualModal, setShowAddActualModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    // Load both routes and plans
   
    loadPlans();
  }, [selectedDate]);


  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await fetch('/api/transport/plans');
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setPlans(data.plans || []);
      } else {
        console.error('Failed to load plans:', data.error);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleCreatePlan = async (planData: any) => {
    try {
      const response = await fetch('/api/transport/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(data)
        await loadPlans(); // Reload plans
      } else {
        console.error('Failed to create plan:', data.error);
        throw new Error(data.error || 'Failed to create plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transport/plans?id=${planId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        await loadPlans(); // Reload plans
      } else {
        console.error('Failed to delete plan:', data.error);
        alert('Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error deleting plan');
    }
  };

  const handleAddActual = async (planId: string) => {
    // Find the plan and open the modal
    const planToUpdate = plans.find(p => p._id === planId);
    if (!planToUpdate) return;
    
    setSelectedPlan(planToUpdate);
    setShowAddActualModal(true);
  };

  const handleSubmitActual = async (actualData: any) => {
    try {
      const response = await fetch('/api/transport/actuals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actualData),
      });

      if (response.ok) {
        await loadPlans(); // Reload plans to show updated data
        console.log('Actual trip added successfully');
      } else {
        const data = await response.json();
        console.error('Failed to add actual trip:', data.error);
        alert('Failed to add actual trip: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding actual trip:', error);
      alert('Error adding actual trip');
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

  if (loading && plansLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading planned data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport Planning</h1>
          <p className="text-gray-600 mt-1">Manage transportation plans and routes</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'plans' && (
            <button 
              onClick={() => setShowAddPlanModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Plan
            </button>
          )}
          {activeTab === 'routes' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Route
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Transportation Plans
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'routes'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Truck className="h-4 w-4" />
            Planned Routes
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'plans' ? (
        <>
          {/* Plans Content */}
          <PlanList 
            plans={plans}
            onDelete={handleDeletePlan}
            onAddActual={handleAddActual}
            loading={plansLoading}
          />
        </>
      ) : (
        <>
          {/* Routes Content */}
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
        </>
      )}

      {/* Add Plan Modal */}
      <AddPlanModal
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        onSubmit={handleCreatePlan}
      />

      {/* Add Actual Trip Modal */}
      {selectedPlan && (
        <AddActualTripModal
          isOpen={showAddActualModal}
          onClose={() => {
            setShowAddActualModal(false);
            setSelectedPlan(null);
          }}
          onSubmit={handleSubmitActual}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default TransportPlannedPage;
