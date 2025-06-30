'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Save, X, Users, Package, Truck, AlertCircle, Building2, ArrowLeft } from 'lucide-react';

export default function AddHubReportPage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.hubId as string;

  // Hub data - this would come from your API
  const hubsData = {
    downtown: { id: 'downtown', name: 'Downtown Hub', client: 'LEX', color: 'bg-blue-500' },
    north: { id: 'north', name: 'North Hub', client: '2GO', color: 'bg-green-500' },
    south: { id: 'south', name: 'South Hub', client: 'SPX', color: 'bg-purple-500' },
    east: { id: 'east', name: 'East Hub', client: 'LEX', color: 'bg-orange-500' },
    west: { id: 'west', name: 'West Hub', client: '2GO', color: 'bg-red-500' }
  };

  const currentHub = hubsData[hubId as keyof typeof hubsData];

  const [reportData, setReportData] = useState({
    hub: hubId,
    date: new Date().toISOString().split('T')[0],
    inbound: '',
    outbound: '',
    backlogs: '',
    delivered: '',
    failed: '',
    misroutes: '',
    trips: {
      '2w': '',
      '3w': '',
      '4w': ''
    },
    attendance: {
      hub_lead: '',
      backroom: '',
      drivers_2w: '',
      drivers_3w: '',
      drivers_4w: ''
    },
    failed_deliveries: {
      canceled_bef_delivery: '',
      no_cash_available: '',
      postpone: '',
      not_at_home: '',
      refuse: '',
      unreachable: '',
      invalid_address: ''
    }
  });

  const handleInputChange = (section: keyof typeof reportData, field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleDirectInputChange = (field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the data to your API
    console.log('Submitting report:', reportData);
    
    // For now, just show success message and redirect
    alert('Report submitted successfully!');
    router.push(`/hubs/${hubId}/reports`);
  };

  const handleCancel = () => {
    router.push(`/hubs/${hubId}/reports`);
  };

  if (!currentHub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hub Not Found</h2>
          <p className="text-gray-600 mb-4">Please select a valid hub to create a report.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className={`w-10 h-10 rounded-lg ${currentHub.color} flex items-center justify-center`}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Report</h1>
                <p className="text-gray-600">Hub: {currentHub.name} ({currentHub.client})</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Report
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Report Date</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={reportData.date}
                  onChange={(e) => handleDirectInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Package Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Package Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inbound
                </label>
                <input
                  type="number"
                  value={reportData.inbound}
                  onChange={(e) => handleDirectInputChange('inbound', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outbound
                </label>
                <input
                  type="number"
                  value={reportData.outbound}
                  onChange={(e) => handleDirectInputChange('outbound', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backlogs
                </label>
                <input
                  type="number"
                  value={reportData.backlogs}
                  onChange={(e) => handleDirectInputChange('backlogs', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivered
                </label>
                <input
                  type="number"
                  value={reportData.delivered}
                  onChange={(e) => handleDirectInputChange('delivered', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Failed
                </label>
                <input
                  type="number"
                  value={reportData.failed}
                  onChange={(e) => handleDirectInputChange('failed', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Misroutes
                </label>
                <input
                  type="number"
                  value={reportData.misroutes}
                  onChange={(e) => handleDirectInputChange('misroutes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Trips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Truck className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Trips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2W Trips
                </label>
                <input
                  type="number"
                  value={reportData.trips['2w']}
                  onChange={(e) => handleInputChange('trips', '2w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3W Trips
                </label>
                <input
                  type="number"
                  value={reportData.trips['3w']}
                  onChange={(e) => handleInputChange('trips', '3w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4W Trips
                </label>
                <input
                  type="number"
                  value={reportData.trips['4w']}
                  onChange={(e) => handleInputChange('trips', '4w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hub Lead
                </label>
                <input
                  type="number"
                  value={reportData.attendance.hub_lead}
                  onChange={(e) => handleInputChange('attendance', 'hub_lead', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backroom Staff
                </label>
                <input
                  type="number"
                  value={reportData.attendance.backroom}
                  onChange={(e) => handleInputChange('attendance', 'backroom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2W Drivers
                </label>
                <input
                  type="number"
                  value={reportData.attendance.drivers_2w}
                  onChange={(e) => handleInputChange('attendance', 'drivers_2w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3W Drivers
                </label>
                <input
                  type="number"
                  value={reportData.attendance.drivers_3w}
                  onChange={(e) => handleInputChange('attendance', 'drivers_3w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4W Drivers
                </label>
                <input
                  type="number"
                  value={reportData.attendance.drivers_4w}
                  onChange={(e) => handleInputChange('attendance', 'drivers_4w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Failed Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Failed Deliveries Breakdown</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canceled Before Delivery
                </label>
                <input
                  type="number"
                  value={reportData.failed_deliveries.canceled_bef_delivery}
                  onChange={(e) => handleInputChange('failed_deliveries', 'canceled_bef_delivery', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No Cash Available
                </label>
                <input
                  type="number"
                  value={reportData.failed_deliveries.no_cash_available}
                  onChange={(e) => handleInputChange('failed_deliveries', 'no_cash_available', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postpone
                </label>
                <input
                  type="number"
                  value={reportData.failed_deliveries.postpone}
                  onChange={(e) => handleInputChange('failed_deliveries', 'postpone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not at Home
                </label>
                <input
                  type="number"
                  value={reportData.failed_deliveries.not_at_home}
                  onChange={(e) => handleInputChange('failed_deliveries', 'not_at_home', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refuse
                </label>
                <input
                  type="number"
                  value={reportData.failed_deliveries.refuse}
                  onChange={(e) => handleInputChange('failed_deliveries', 'refuse', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unreachable
                </label>
                <input
                  type="number"
                  value={reportData.failed_deliveries.unreachable}
                  onChange={(e) => handleInputChange('failed_deliveries', 'unreachable', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invalid Address
                </label>
                <input
                  type="number"
                  value={reportData.failed_deliveries.invalid_address}
                  onChange={(e) => handleInputChange('failed_deliveries', 'invalid_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
