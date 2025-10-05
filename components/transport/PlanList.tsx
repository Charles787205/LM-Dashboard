'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Hash, FileText, Edit, Trash2, Plus, ChevronDown, ChevronRight, Truck, Clock, Package } from 'lucide-react';

interface Actual {
  _id?: string;
  vehicle: {
    _id: string;
    vehicle_plate_number: string;
    vehicleType: string;
    driver?: {
      firstName: string;
      lastName: string;
    };
  } | string;
  tripDetail: {
    destination: {
      _id: string;
      name: string;
      type: string;
    } | string;
    departureTime: string;
    arrivalTime: string;
  };
  departureTime?: string;
  arrivalTime?: string;
  driverName?: string;
  packages?: number;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  actuals?: Actual[]; // Array of actual trips
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlanListProps {
  plans: Plan[];
  onEdit?: (plan: Plan) => void;
  onDelete?: (planId: string) => void;
  onAddActual?: (planId: string) => void;
  loading?: boolean;
}

const PlanList: React.FC<PlanListProps> = ({ plans, onEdit, onDelete, onAddActual, loading }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (planId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(planId)) {
      newExpandedRows.delete(planId);
    } else {
      newExpandedRows.add(planId);
    }
    setExpandedRows(newExpandedRows);
  };
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'Not set';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFulfillmentPercentage = (plan: Plan) => {
    if (plan.numberOfTrips === 0) return 0;
    const actualTripsCount = plan.actuals?.length || 0;
    return Math.round((actualTripsCount / plan.numberOfTrips) * 100);
  };

  const getFulfillmentColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading plans...</span>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
        <p className="text-gray-500">Create your first transportation plan to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planned Trips
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actual Trips
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fulfillment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map((plan, index) => {
              const fulfillmentPercentage = getFulfillmentPercentage(plan);
              const actualTripsCount = plan.actuals?.length || 0;
              const isExpanded = plan._id ? expandedRows.has(plan._id) : false;
              
              return (
                <React.Fragment key={plan._id || index}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(plan.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {plan.origin && typeof plan.origin === 'object' ? plan.origin.name : (plan.origin || 'No origin set')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {plan.numberOfTrips}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {actualTripsCount > 0 && plan._id && (
                            <button
                              onClick={() => toggleRowExpansion(plan._id!)}
                              className="mr-2 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                              title={isExpanded ? "Hide actuals" : "Show actuals"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <span className="text-sm text-gray-900">
                            {actualTripsCount}
                          </span>
                        </div>
                        {onAddActual && plan._id && (
                          <button
                            onClick={() => onAddActual(plan._id!)}
                            className="ml-2 p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Add actual trip"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {actualTripsCount} / {plan.numberOfTrips}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(fulfillmentPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${getFulfillmentColor(fulfillmentPercentage)}`}>
                          {fulfillmentPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        {plan.remarks ? (
                          <>
                            <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate max-w-32">
                              {plan.remarks}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No remarks</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(plan)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit plan"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && plan._id && (
                          <button
                            onClick={() => onDelete(plan._id!)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded row showing actuals */}
                  {isExpanded && plan.actuals && plan.actuals.length > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                            <Truck className="h-4 w-4 mr-2" />
                            Actual Trips ({plan.actuals.length})
                          </h4>
                          <div className="space-y-3">
                            {plan.actuals.map((actual, actualIndex) => (
                              <div key={actual._id || actualIndex} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Vehicle:</span>
                                    <div className="flex items-center mt-1">
                                      <Truck className="h-3 w-3 text-gray-400 mr-1" />
                                      <span className="text-gray-900">
                                        {typeof actual.vehicle === 'object' && actual.vehicle
                                          ? actual.vehicle.vehicle_plate_number || actual.vehicle.vehicleType
                                          : actual.vehicle || 'Unknown'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-gray-700">Destination:</span>
                                    <div className="flex items-center mt-1">
                                      <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                      <span className="text-gray-900">
                                        {typeof actual.tripDetail?.destination === 'object' && actual.tripDetail.destination
                                          ? actual.tripDetail.destination.name
                                          : actual.tripDetail?.destination || 'Unknown'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-gray-700">Departure:</span>
                                    <div className="flex items-center mt-1">
                                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                      <span className="text-gray-900">
                                        {actual.tripDetail?.departureTime 
                                          ? new Date(actual.tripDetail.departureTime).toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true
                                            })
                                          : 'Not set'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-gray-700">Arrival:</span>
                                    <div className="flex items-center mt-1">
                                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                      <span className="text-gray-900">
                                        {actual.tripDetail?.arrivalTime 
                                          ? new Date(actual.tripDetail.arrivalTime).toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true
                                            })
                                          : 'Not set'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {actual.packages && (
                                    <div>
                                      <span className="font-medium text-gray-700">Packages:</span>
                                      <div className="flex items-center mt-1">
                                        <Package className="h-3 w-3 text-gray-400 mr-1" />
                                        <span className="text-gray-900">{actual.packages}</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {actual.driverName && (
                                    <div>
                                      <span className="font-medium text-gray-700">Driver:</span>
                                      <div className="flex items-center mt-1">
                                        <span className="text-gray-900">{actual.driverName}</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {typeof actual.vehicle === 'object' && actual.vehicle.driver && (
                                    <div>
                                      <span className="font-medium text-gray-700">Assigned Driver:</span>
                                      <div className="flex items-center mt-1">
                                        <span className="text-gray-900">
                                          {actual.vehicle.driver.firstName} {actual.vehicle.driver.lastName}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {actual.remarks && (
                                    <div className="col-span-2 md:col-span-4">
                                      <span className="font-medium text-gray-700">Remarks:</span>
                                      <div className="flex items-start mt-1">
                                        <FileText className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-900">{actual.remarks}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanList;
