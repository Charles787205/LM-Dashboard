'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Save, X, Users, Package, Truck, AlertCircle, Clock } from 'lucide-react';

export default function AddReportPage() {
  const router = useRouter();
  
  // Get URL params using URLSearchParams
  const [selectedHub, setSelectedHub] = useState('');
  const [hubName, setHubName] = useState('');

  // Get params from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hubParam = params.get('hub') || '';
    const hubNameParam = params.get('hubName') || '';
    
    setSelectedHub(hubParam);
    setHubName(hubNameParam);
    
    // Update reportData with the hub ID
    if (hubParam) {
      setReportData(prev => ({
        ...prev,
        hub: hubParam
      }));
    }
  }, []);

  const [reportData, setReportData] = useState({
    hub: selectedHub || '',
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
    successful_deliveries: {
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
    
    try {
      // Prepare the data for submission
      const submitData = {
        ...reportData,
        hub: selectedHub, // Ensure hub is set
        // Convert string values to numbers where needed
        inbound: parseInt(reportData.inbound) || 0,
        outbound: parseInt(reportData.outbound) || 0,
        backlogs: parseInt(reportData.backlogs) || 0,
        delivered: parseInt(reportData.delivered) || 0,
        failed: parseInt(reportData.failed) || 0,
        misroutes: parseInt(reportData.misroutes) || 0,
        trips: {
          '2w': parseInt(reportData.trips['2w']) || 0,
          '3w': parseInt(reportData.trips['3w']) || 0,
          '4w': parseInt(reportData.trips['4w']) || 0
        },
        successful_deliveries: {
          '2w': parseInt(reportData.successful_deliveries['2w']) || 0,
          '3w': parseInt(reportData.successful_deliveries['3w']) || 0,
          '4w': parseInt(reportData.successful_deliveries['4w']) || 0
        },
        attendance: {
          hub_lead: parseInt(reportData.attendance.hub_lead) || 0,
          backroom: parseInt(reportData.attendance.backroom) || 0,
          drivers_2w: parseInt(reportData.attendance.drivers_2w) || 0,
          drivers_3w: parseInt(reportData.attendance.drivers_3w) || 0,
          drivers_4w: parseInt(reportData.attendance.drivers_4w) || 0
        },
        failed_deliveries: {
          canceled_bef_delivery: parseInt(reportData.failed_deliveries.canceled_bef_delivery) || 0,
          no_cash_available: parseInt(reportData.failed_deliveries.no_cash_available) || 0,
          postpone: parseInt(reportData.failed_deliveries.postpone) || 0,
          not_at_home: parseInt(reportData.failed_deliveries.not_at_home) || 0,
          refuse: parseInt(reportData.failed_deliveries.refuse) || 0,
          unreachable: parseInt(reportData.failed_deliveries.unreachable) || 0,
          invalid_address: parseInt(reportData.failed_deliveries.invalid_address) || 0
        }
      };

      console.log('Submitting report:', submitData);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Report submitted successfully!');
        router.push('/reports');
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/reports');
  };

  if (!selectedHub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Hub Selected</h2>
          <p className="text-gray-600 mb-4">Please select a hub to create a report.</p>
          <button
            onClick={() => router.push('/reports')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Reports
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Report</h1>
              <p className="text-gray-600 mt-1">Hub: {hubName}</p>
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

          {/* Successful Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Successful Deliveries by Vehicle</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2W Successful
                </label>
                <input
                  type="number"
                  value={reportData.successful_deliveries['2w']}
                  onChange={(e) => handleInputChange('successful_deliveries', '2w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3W Successful
                </label>
                <input
                  type="number"
                  value={reportData.successful_deliveries['3w']}
                  onChange={(e) => handleInputChange('successful_deliveries', '3w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4W Successful
                </label>
                <input
                  type="number"
                  value={reportData.successful_deliveries['4w']}
                  onChange={(e) => handleInputChange('successful_deliveries', '4w', e.target.value)}
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
