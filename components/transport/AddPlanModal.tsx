'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Hash } from 'lucide-react';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: any) => void;
}

interface Location {
  _id: string;
  name: string;
  type: 'origin' | 'destination' | 'both';
}

const AddPlanModal: React.FC<AddPlanModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    origin: '',
    numberOfTrips: ''
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);

  // Load locations when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const loadLocations = async () => {
    try {
      setLocationsLoading(true);
      const response = await fetch('/api/transport/locations');
      const data = await response.json();
      
      if (response.ok) {
        // Filter to only show origins and both types for planning
        const originLocations = data.locations.filter((loc: Location) => 
          loc.type === 'origin' || loc.type === 'both'
        );
        setLocations(originLocations);
      } else {
        console.error('Failed to load locations:', data.error);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        ...formData,
        numberOfTrips: parseInt(formData.numberOfTrips),
        date: new Date(formData.date)
      };

      await onSubmit(planData);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        origin: '',
        numberOfTrips: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Origin Location
            </label>
            {locationsLoading ? (
              <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-500">
                Loading locations...
              </div>
            ) : (
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select origin location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name} ({location.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Number of Trips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 inline mr-2" />
              Number of Trips
            </label>
            <input
              type="number"
              name="numberOfTrips"
              value={formData.numberOfTrips}
              onChange={handleChange}
              placeholder="Enter number of trips"
              min="1"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlanModal;
