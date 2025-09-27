'use client';

import React, { useState, useEffect } from 'react';
import { X, Truck, MapPin, Clock, Package, FileText, Hash } from 'lucide-react';

interface Vehicle {
  _id: string;
  vehicle_plate_number: string;
  vehicleType: string;
  driver?: {
    firstName: string;
    lastName: string;
  };
}

interface Location {
  _id: string;
  name: string;
  type: string;
}

interface Plan {
  _id?: string;
  date: Date | string;
  origin: {
    _id?: string;
    name: string;
    type: string;
  } | string;
  numberOfTrips: number;
  fulfillment?: number;
  remarks?: string;
  actuals?: any[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface AddActualTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (actualData: any) => void;
  plan: Plan;
}

export default function AddActualTripModal({
  isOpen,
  onClose,
  onSubmit,
  plan
}: AddActualTripModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    vehicle: '',
    status: 'completed' as 'completed' | 'canceled',
    linhaulTripNumber: '',
    callTime: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    totalParcels: '',
    destination: '',
    odometerStart: '',
    odometerEnd: '',
    loadingTimeIn: '',
    loadingTimeOut: '',
    unloadingTimeIn: '',
    unloadingTimeOut: '',
    sealNumbers: ''
  });

  // Load vehicles and destinations when modal opens
  useEffect(() => {
    if (isOpen) {
      loadVehicles();
      loadDestinations();
      // Generate default linhaul trip number
      setFormData(prev => ({
        ...prev,
        linhaulTripNumber: `LH-${Date.now()}`,
        callTime: new Date().toISOString().slice(0, 16),
      }));
    }
  }, [isOpen]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transport/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await fetch('/api/transport/locations');
      if (response.ok) {
        const data = await response.json();
        // Filter for destinations
        const destinationList = data.locations?.filter((loc: Location) => 
          loc.type === 'destination' || loc.type === 'both'
        ) || [];
        setDestinations(destinationList);
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicle || !formData.departureTime || !formData.arrivalTime || !formData.totalParcels || !formData.destination) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const actualData = {
        plan: plan._id || '', // Handle undefined case
        vehicle: formData.vehicle,
        status: formData.status,
        linhaulTripNumber: formData.linhaulTripNumber,
        callTime: {
          callTime: new Date(formData.callTime),
          arrival: formData.arrival ? new Date(formData.arrival) : undefined
        },
        tripSequence: 1, // This will be calculated on the server
        odometer: {
          start: formData.odometerStart ? parseInt(formData.odometerStart) : undefined,
          end: formData.odometerEnd ? parseInt(formData.odometerEnd) : undefined
        },
        loadingDetail: {
          timeIn: formData.loadingTimeIn ? new Date(formData.loadingTimeIn) : undefined,
          timeOut: formData.loadingTimeOut ? new Date(formData.loadingTimeOut) : undefined
        },
        tripDetail: {
          departureTime: new Date(formData.departureTime),
          arrivalTime: new Date(formData.arrivalTime),
          totalParcels: parseInt(formData.totalParcels),
          destination: formData.destination,
          odometer: {
            start: formData.odometerStart ? parseInt(formData.odometerStart) : undefined,
            end: formData.odometerEnd ? parseInt(formData.odometerEnd) : undefined
          }
        },
        sealNumbers: formData.sealNumbers ? formData.sealNumbers.split(',').map(s => s.trim()) : [],
        unloadingDetail: {
          timeIn: formData.unloadingTimeIn ? new Date(formData.unloadingTimeIn) : undefined,
          timeOut: formData.unloadingTimeOut ? new Date(formData.unloadingTimeOut) : undefined
        }
      };

      await onSubmit(actualData);
      onClose();
      
      // Reset form
      setFormData({
        vehicle: '',
        status: 'completed',
        linhaulTripNumber: '',
        callTime: '',
        arrival: '',
        departureTime: '',
        arrivalTime: '',
        totalParcels: '',
        destination: '',
        odometerStart: '',
        odometerEnd: '',
        loadingTimeIn: '',
        loadingTimeOut: '',
        unloadingTimeIn: '',
        unloadingTimeOut: '',
        sealNumbers: ''
      });
    } catch (error) {
      console.error('Error submitting actual trip:', error);
      alert('Error submitting actual trip');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Actual Trip</h2>
            <p className="text-gray-600 mt-1">
              Plan: {typeof plan.origin === 'string' ? plan.origin : plan.origin.name} - {new Date(plan.date).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="h-4 w-4 inline mr-1" />
                Vehicle *
              </label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.vehicle_plate_number} ({vehicle.vehicleType})
                    {vehicle.driver && ` - ${vehicle.driver.firstName} ${vehicle.driver.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            {/* Linhaul Trip Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Linhaul Trip Number
              </label>
              <input
                type="text"
                name="linhaulTripNumber"
                value={formData.linhaulTripNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Destination *
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Destination</option>
                {destinations.map(dest => (
                  <option key={dest._id} value={dest._id}>
                    {dest.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Call Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Call Time
              </label>
              <input
                type="datetime-local"
                name="callTime"
                value={formData.callTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Arrival Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Time
              </label>
              <input
                type="datetime-local"
                name="arrival"
                value={formData.arrival}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Departure Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Departure Time *
              </label>
              <input
                type="datetime-local"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Arrival Time at Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Time at Destination *
              </label>
              <input
                type="datetime-local"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Total Parcels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 inline mr-1" />
                Total Parcels *
              </label>
              <input
                type="number"
                name="totalParcels"
                value={formData.totalParcels}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Odometer Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Odometer Start
              </label>
              <input
                type="number"
                name="odometerStart"
                value={formData.odometerStart}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Odometer End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Odometer End
              </label>
              <input
                type="number"
                name="odometerEnd"
                value={formData.odometerEnd}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Loading Time In */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loading Time In
              </label>
              <input
                type="datetime-local"
                name="loadingTimeIn"
                value={formData.loadingTimeIn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Loading Time Out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loading Time Out
              </label>
              <input
                type="datetime-local"
                name="loadingTimeOut"
                value={formData.loadingTimeOut}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Unloading Time In */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unloading Time In
              </label>
              <input
                type="datetime-local"
                name="unloadingTimeIn"
                value={formData.unloadingTimeIn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Unloading Time Out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unloading Time Out
              </label>
              <input
                type="datetime-local"
                name="unloadingTimeOut"
                value={formData.unloadingTimeOut}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Seal Numbers */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Seal Numbers (comma-separated)
              </label>
              <input
                type="text"
                name="sealNumbers"
                value={formData.sealNumbers}
                onChange={handleInputChange}
                placeholder="e.g., SEAL001, SEAL002"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Actual Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}