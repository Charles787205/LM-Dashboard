'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Truck, 
  Building2, 
  Mail, 
  Phone, 
  UserCheck, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  User,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Vendor {
  _id: string;
  name: string;
  bu_assignment?: string;
  email_address: string;
  contact_number: string;
  emergency_contact_person: string;
  emergency_contact_number?: string;
  service_type: 'Oncall' | 'Dedicated' | 'WetLease';
  address?: string;
  vehicles?: Vehicle[];
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

interface Vehicle {
  _id?: string;
  vendor?: string;
  vehicleType: string;
  vehicle_plate_number: string;
  driver?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  gender: 'male' | 'female';
  createdAt?: string;
  updatedAt?: string;
}

interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  status?: string;
}

interface VehicleFormData {
  vehicleType: string;
  vehicle_plate_number: string;
  driver: string;
  gender: 'male' | 'female';
}

const VendorDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const [vehicleFormData, setVehicleFormData] = useState<VehicleFormData>({
    vehicleType: '10WV',
    vehicle_plate_number: '',
    driver: '',
    gender: 'male'
  });

  const [driverFormData, setDriverFormData] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    phoneNumber: '',
    gender: 'male' as 'male' | 'female'
  });

  useEffect(() => {
    if (vendorId) {
      loadVendorData();
      loadDrivers();
    }
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      
      // Load vendor info
      const vendorResponse = await fetch('/api/transport/vendors');
      if (vendorResponse.ok) {
        const vendorData = await vendorResponse.json();
        const currentVendor = vendorData.vendors.find((v: Vendor) => v._id === vendorId);
        setVendor(currentVendor || null);
      }

      // Load vehicles for this vendor
      const vehiclesResponse = await fetch(`/api/transport/vehicles?vendorId=${vendorId}`);
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setVehicles(vehiclesData.vehicles || []);
      }
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await fetch('/api/transport/drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingVehicle ? 'PUT' : 'POST';
      const body = {
        ...vehicleFormData,
        vendor: vendorId,
        ...(editingVehicle && { _id: editingVehicle._id })
      };

      const response = await fetch('/api/transport/vehicles', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadVendorData();
        resetVehicleForm();
        setShowVehicleModal(false);
      } else {
        const data = await response.json();
        alert(`Failed to ${editingVehicle ? 'update' : 'add'} vehicle: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      alert('Error submitting vehicle');
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleFormData({
      vehicleType: vehicle.vehicleType,
      vehicle_plate_number: vehicle.vehicle_plate_number,
      driver: vehicle.driver?._id || '',
      gender: vehicle.gender
    });
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const response = await fetch(`/api/transport/vehicles?id=${vehicleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadVendorData();
      } else {
        const data = await response.json();
        alert(`Failed to delete vehicle: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle');
    }
  };

  const resetVehicleForm = () => {
    setVehicleFormData({
      vehicleType: '10WV',
      vehicle_plate_number: '',
      driver: '',
      gender: 'male'
    });
    setEditingVehicle(null);
  };

  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDriverFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/transport/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverFormData),
      });

      if (response.ok) {
        const data = await response.json();
        await loadDrivers(); // Reload drivers list
        
        // Auto-select the newly created driver
        setVehicleFormData(prev => ({
          ...prev,
          driver: data.driver._id
        }));
        
        // Reset driver form and close modal
        setDriverFormData({
          firstName: '',
          lastName: '',
          licenseNumber: '',
          phoneNumber: '',
          gender: 'male'
        });
        setShowDriverModal(false);
      } else {
        const data = await response.json();
        alert(`Failed to create driver: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating driver:', error);
      alert('Error creating driver');
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'Dedicated': return 'bg-green-100 text-green-800';
      case 'WetLease': return 'bg-blue-100 text-blue-800';
      case 'Oncall': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Vendor not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-600 mt-1">Vendor Details & Vehicle Management</p>
          </div>
        </div>
        <button
          onClick={() => setShowVehicleModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vendor Information Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{vendor.name}</span>
              </div>
              {vendor.bu_assignment && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">BU Assignment:</span>
                  <span className="text-sm text-gray-900 ml-2">{vendor.bu_assignment}</span>
                </div>
              )}
              <div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getServiceTypeColor(vendor.service_type)}`}>
                  {vendor.service_type}
                </span>
                <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <a 
                  href={`mailto:${vendor.email_address}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {vendor.email_address}
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <a 
                  href={`tel:${vendor.contact_number}`}
                  className="text-sm text-gray-900"
                >
                  {vendor.contact_number}
                </a>
              </div>
              {vendor.address && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-900">{vendor.address}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Emergency Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{vendor.emergency_contact_person}</span>
              </div>
              {vendor.emergency_contact_number && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <a 
                    href={`tel:${vendor.emergency_contact_number}`}
                    className="text-sm text-gray-900"
                  >
                    {vendor.emergency_contact_number}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Vehicles</h2>
              <p className="text-sm text-gray-500 mt-1">
                {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
              </p>
            </div>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No vehicles registered</p>
            <p className="text-gray-400">Add the first vehicle for this vendor</p>
            <button
              onClick={() => setShowVehicleModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-2 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.vehicle_plate_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.driver ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {vehicle.driver.firstName} {vehicle.driver.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No driver assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {vehicle.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {vehicle.gender === 'male' ? (
                          <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-pink-500 mr-1" />
                        )}
                        <span className="text-sm text-gray-900 capitalize">{vehicle.gender}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">
                          {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle._id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={() => {
                  setShowVehicleModal(false);
                  resetVehicleForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    name="vehicleType"
                    value={vehicleFormData.vehicleType}
                    onChange={handleVehicleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="10WV">10WV</option>
                    <option value="4W">4W</option>
                    <option value="6W">6W</option>
                    <option value="6WF">6WF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    name="vehicle_plate_number"
                    value={vehicleFormData.vehicle_plate_number}
                    onChange={handleVehicleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ABC-1234"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Driver
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDriverModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add New</span>
                    </button>
                  </div>
                  <select
                    name="driver"
                    value={vehicleFormData.driver}
                    onChange={handleVehicleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No driver assigned</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.firstName} {driver.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={vehicleFormData.gender}
                    onChange={handleVehicleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowVehicleModal(false);
                    resetVehicleForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {editingVehicle ? 'Update' : 'Add'} Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Driver</h2>
              <button
                onClick={() => {
                  setShowDriverModal(false);
                  setDriverFormData({
                    firstName: '',
                    lastName: '',
                    licenseNumber: '',
                    phoneNumber: '',
                    gender: 'male'
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={driverFormData.firstName}
                    onChange={handleDriverInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={driverFormData.lastName}
                    onChange={handleDriverInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={driverFormData.licenseNumber}
                    onChange={handleDriverInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={driverFormData.phoneNumber}
                    onChange={handleDriverInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={driverFormData.gender}
                    onChange={handleDriverInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowDriverModal(false);
                    setDriverFormData({
                      firstName: '',
                      lastName: '',
                      licenseNumber: '',
                      phoneNumber: '',
                      gender: 'male'
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Create Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetailPage;