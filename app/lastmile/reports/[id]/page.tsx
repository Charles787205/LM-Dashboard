'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Save, X, Users, Package, Truck, AlertCircle, CheckCircle, Edit3, ArrowLeft, Trash2 } from 'lucide-react';

interface Report {
  _id: string;
  hub: {
    _id: string;
    name: string;
    client: string;
  };
  date: string;
  inbound: number;
  outbound: number;
  backlogs: number;
  delivered: number;
  failed: number;
  misroutes: number;
  trips: {
    '2w': number;
    '3w': number;
    '4w': number;
  };
  successful_deliveries: {
    '2w': number;
    '3w': number;
    '4w': number;
  };
  attendance: {
    hub_lead: number;
    backroom: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Report | null>(null);

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          setReport(result.data);
          setEditData(result.data);
        } else {
          setError(result.error || 'Failed to fetch report');
        }
      } catch (err) {
        setError('Failed to fetch report');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [resolvedParams.id]);

  // Calculate metrics
  const calculateMetrics = (reportData: Report) => {
    const pof = reportData.inbound + reportData.backlogs - reportData.outbound;
    const successRate = reportData.outbound > 0 ? (reportData.delivered / reportData.outbound) * 100 : 0;
    const failedRate = reportData.outbound > 0 ? (reportData.failed / reportData.outbound) * 100 : 0;
    const sdod = (reportData.inbound + reportData.backlogs) > 0 ? (reportData.outbound / (reportData.inbound + reportData.backlogs)) * 100 : 0;
    const totalSuccessful = (reportData.successful_deliveries?.['2w'] || 0) + 
                           (reportData.successful_deliveries?.['3w'] || 0) + 
                           (reportData.successful_deliveries?.['4w'] || 0);

    return { pof, successRate, failedRate, sdod, totalSuccessful };
  };

  const handleInputChange = (section: keyof Report, field: string, value: string) => {
    if (!editData) return;

    setEditData(prev => {
      if (!prev) return prev;
      
      if (typeof prev[section] === 'object' && prev[section] !== null) {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [field]: field.includes('_') ? value : parseInt(value) || 0
          }
        };
      } else {
        return {
          ...prev,
          [section]: field === 'date' ? value : parseInt(value) || 0
        } as Report;
      }
    });
  };

  const handleDirectInputChange = (field: keyof Report, value: string) => {
    if (!editData) return;

    setEditData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: field === 'date' ? value : parseInt(value) || 0
      } as Report;
    });
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      const response = await fetch(`/api/reports/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (result.success) {
        setReport(result.data);
        setIsEditing(false);
        alert('Report updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update report');
      }
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`api/reports/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Report deleted successfully!');
        router.push('/reports');
      } else {
        throw new Error(result.error || 'Failed to delete report');
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditData(report);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  const currentData = isEditing ? editData! : report;
  const metrics = calculateMetrics(currentData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/reports')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Reports
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
                <p className="text-gray-600 mt-1">
                  {report.hub.name} - {new Date(report.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Report Metadata */}
        {report.createdAt && (
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Created: {new Date(report.createdAt).toLocaleString()}</span>
                {report.updatedAt && report.updatedAt !== report.createdAt && (
                  <span>Last updated: {new Date(report.updatedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">POF (Parcel on Floor)</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.pof}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600 bg-red-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.failedRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SDOD</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.sdod.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          {/* Date and Hub Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Report Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={currentData.date.split('T')[0]}
                  onChange={(e) => handleDirectInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hub
                </label>
                <input
                  type="text"
                  value={currentData.hub.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <input
                  type="text"
                  value={currentData.hub.client}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
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
                  value={currentData.inbound}
                  onChange={(e) => handleDirectInputChange('inbound', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outbound
                </label>
                <input
                  type="number"
                  value={currentData.outbound}
                  onChange={(e) => handleDirectInputChange('outbound', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backlogs
                </label>
                <input
                  type="number"
                  value={currentData.backlogs}
                  onChange={(e) => handleDirectInputChange('backlogs', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivered
                </label>
                <input
                  type="number"
                  value={currentData.delivered}
                  onChange={(e) => handleDirectInputChange('delivered', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Failed
                </label>
                <input
                  type="number"
                  value={currentData.failed}
                  onChange={(e) => handleDirectInputChange('failed', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Misroutes
                </label>
                <input
                  type="number"
                  value={currentData.misroutes}
                  onChange={(e) => handleDirectInputChange('misroutes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
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
                  value={currentData.trips['2w']}
                  onChange={(e) => handleInputChange('trips', '2w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3W Trips
                </label>
                <input
                  type="number"
                  value={currentData.trips['3w']}
                  onChange={(e) => handleInputChange('trips', '3w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4W Trips
                </label>
                <input
                  type="number"
                  value={currentData.trips['4w']}
                  onChange={(e) => handleInputChange('trips', '4w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Successful Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Successful Deliveries by Vehicle</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2W Successful
                </label>
                <input
                  type="number"
                  value={currentData.successful_deliveries?.['2w'] || 0}
                  onChange={(e) => handleInputChange('successful_deliveries', '2w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3W Successful
                </label>
                <input
                  type="number"
                  value={currentData.successful_deliveries?.['3w'] || 0}
                  onChange={(e) => handleInputChange('successful_deliveries', '3w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4W Successful
                </label>
                <input
                  type="number"
                  value={currentData.successful_deliveries?.['4w'] || 0}
                  onChange={(e) => handleInputChange('successful_deliveries', '4w', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Total Successful Deliveries:</strong> {metrics.totalSuccessful}
              </p>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hub Lead
                </label>
                <input
                  type="number"
                  value={currentData.attendance.hub_lead}
                  onChange={(e) => handleInputChange('attendance', 'hub_lead', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backroom Staff
                </label>
                <input
                  type="number"
                  value={currentData.attendance.backroom}
                  onChange={(e) => handleInputChange('attendance', 'backroom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
