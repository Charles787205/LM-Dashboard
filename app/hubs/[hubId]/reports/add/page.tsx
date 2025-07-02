'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import HubSidebar from '@/components/HubSidebar';
import { 
  AlertCircle, 
  ArrowLeft, 
  Building2, 
  X, 
  Save, 
  Calendar, 
  Package, 
  Truck, 
  Users 
} from 'lucide-react';

interface Hub {
  _id: string;
  name: string;
  client: string;
}

export default function AddReportPage({ params }: { params: Promise<{ hubId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const hubId = resolvedParams.hubId;

  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch hub data
  useEffect(() => {
    const fetchHub = async () => {
      try {
        const response = await fetch(`/api/hubs/${hubId}`);
        const result = await response.json();
        
        if (result.success) {
          setHub(result.data);
        } else {
          setError(result.error || 'Failed to fetch hub');
        }
      } catch (err) {
        setError('An error occurred while fetching hub data');
        console.error('Error fetching hub:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHub();
  }, [hubId]);

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
      backroom: ''
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

  const handleSimpleInputChange = (field: keyof typeof reportData, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Convert string values to numbers for numeric fields
      const processedData = {
        ...reportData,
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
        attendance: {
          hub_lead: parseInt(reportData.attendance.hub_lead) || 0,
          backroom: parseInt(reportData.attendance.backroom) || 0
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

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Report created successfully!');
        setTimeout(() => {
          router.push(`/hubs/${hubId}/reports`);
        }, 1500);
      } else {
        setError(result.error || 'Failed to create report');
      }
    } catch (err) {
      setError('An error occurred while creating the report');
      console.error('Error creating report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hub...</p>
        </div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hub Not Found</h2>
          <p className="text-gray-600 mb-4">The requested hub could not be found.</p>
          <button
            onClick={() => router.push('/hubs')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Hubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <HubSidebar hubId={hubId} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Add Report</h1>
                <p className="text-gray-600">Hub: {hub.name} ({hub.client})</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/hubs/${hubId}/reports`)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                form="report-form"
                disabled={submitting}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving...' : 'Save Report'}
              </button>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form id="report-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={reportData.date}
                    onChange={(e) => handleSimpleInputChange('date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Package Operations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Package Operations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inbound
                  </label>
                  <input
                    type="number"
                    value={reportData.inbound}
                    onChange={(e) => handleSimpleInputChange('inbound', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outbound
                  </label>
                  <input
                    type="number"
                    value={reportData.outbound}
                    onChange={(e) => handleSimpleInputChange('outbound', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backlogs
                  </label>
                  <input
                    type="number"
                    value={reportData.backlogs}
                    onChange={(e) => handleSimpleInputChange('backlogs', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivered
                  </label>
                  <input
                    type="number"
                    value={reportData.delivered}
                    onChange={(e) => handleSimpleInputChange('delivered', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Failed
                  </label>
                  <input
                    type="number"
                    value={reportData.failed}
                    onChange={(e) => handleSimpleInputChange('failed', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Misroutes
                  </label>
                  <input
                    type="number"
                    value={reportData.misroutes}
                    onChange={(e) => handleSimpleInputChange('misroutes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Trip Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Truck className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Trip Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2-Wheeler Trips
                  </label>
                  <input
                    type="number"
                    value={reportData.trips['2w']}
                    onChange={(e) => handleInputChange('trips', '2w', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3-Wheeler Trips
                  </label>
                  <input
                    type="number"
                    value={reportData.trips['3w']}
                    onChange={(e) => handleInputChange('trips', '3w', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4-Wheeler Trips
                  </label>
                  <input
                    type="number"
                    value={reportData.trips['4w']}
                    onChange={(e) => handleInputChange('trips', '4w', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Users className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hub Lead
                  </label>
                  <input
                    type="number"
                    value={reportData.attendance.hub_lead}
                    onChange={(e) => handleInputChange('attendance', 'hub_lead', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Failed Deliveries */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Failed Deliveries</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canceled Before Delivery
                  </label>
                  <input
                    type="number"
                    value={reportData.failed_deliveries.canceled_bef_delivery}
                    onChange={(e) => handleInputChange('failed_deliveries', 'canceled_bef_delivery', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postponed
                  </label>
                  <input
                    type="number"
                    value={reportData.failed_deliveries.postpone}
                    onChange={(e) => handleInputChange('failed_deliveries', 'postpone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refused
                  </label>
                  <input
                    type="number"
                    value={reportData.failed_deliveries.refuse}
                    onChange={(e) => handleInputChange('failed_deliveries', 'refuse', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
