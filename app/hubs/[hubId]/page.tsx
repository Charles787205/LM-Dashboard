'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import HubSidebar from '@/components/HubSidebar';
import { Edit3, Save, X } from 'lucide-react';

interface Hub {
  _id: string;
  name: string;
  client: string;
  hub_cost_per_parcel: {
    '2W': number;
    '3W': number;
    '4W': number;
  };
  hub_profit_per_parcel: {
    '2W': number;
    '3W': number;
    '4W': number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Report {
  _id: string;
  hub: string;
  inbound: number;
  outbound: number;
  delivered: number;
  failed: number;
  backlogs: number;
  misroutes: number;
  date: string;
  attendance: {
    hub_lead: number;
    backroom: number;
  };
  trips: {
    '2w': number;
    '3w': number;
    '4w': number;
  };
  successful_deliveries?: {
    '2w': number;
    '3w': number;
    '4w': number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function HubDetailPage({ params }: { params: Promise<{ hubId: string }> }) {
  const resolvedParams = use(params);
  const hubId = resolvedParams.hubId;
  
  const [hub, setHub] = useState<Hub | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Hub | null>(null);

  // Fetch hub data
  useEffect(() => {
    const fetchHub = async () => {
      try {
        const response = await fetch(`/api/hubs/${hubId}`);
        const result = await response.json();
        
        if (result.success) {
          setHub(result.data);
          setEditData(result.data);
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

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/reports?hubId=${hubId}`);
        const result = await response.json();
        
        if (result.success) {
          setReports(result.data);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    if (hub) {
      fetchReports();
    }
  }, [hubId, hub]);

  // Handle input changes for editing
  const handleInputChange = (field: keyof Hub, value: string | number) => {
    if (!editData) return;
    
    setEditData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleCostInputChange = (vehicle: '2W' | '3W' | '4W', value: string) => {
    if (!editData) return;
    
    setEditData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        hub_cost_per_parcel: {
          ...prev.hub_cost_per_parcel,
          [vehicle]: parseFloat(value) || 0
        }
      };
    });
  };

  const handleProfitInputChange = (vehicle: '2W' | '3W' | '4W', value: string) => {
    if (!editData) return;
    
    setEditData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        hub_profit_per_parcel: {
          ...prev.hub_profit_per_parcel,
          [vehicle]: parseFloat(value) || 0
        }
      };
    });
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      const response = await fetch(`/api/hubs/${hubId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (result.success) {
        setHub(result.data);
        setIsEditing(false);
        alert('Hub updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update hub');
      }
    } catch (err) {
      console.error('Error updating hub:', err);
      alert('Failed to update hub. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditData(hub);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper functions for calculated metrics
  const calculatePOF = (report: Report) => {
    return report.inbound + report.backlogs - report.outbound;
  };

  const calculateSuccessRate = (report: Report) => {
    return report.outbound > 0 ? ((report.delivered / report.outbound) * 100) : 0;
  };

  const calculateFailedRate = (report: Report) => {
    return report.outbound > 0 ? ((report.failed / report.outbound) * 100) : 0;
  };

  const calculateSDOD = (report: Report) => {
    const totalAvailable = report.inbound + report.backlogs;
    return totalAvailable > 0 ? ((report.outbound / totalAvailable) * 100) : 0;
  };

  const getTotalSuccessfulDeliveries = (report: Report) => {
    if (!report.successful_deliveries) return 0;
    return (report.successful_deliveries['2w'] || 0) + 
           (report.successful_deliveries['3w'] || 0) + 
           (report.successful_deliveries['4w'] || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hub details...</p>
        </div>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Hub not found'}</p>
          <Link href="/hubs" className="text-blue-600 hover:text-blue-800">
            ← Back to Hubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <HubSidebar currentPath={`/hubs/${hubId}`} hubId={hubId} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editData?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{hub.name}</h1>
              )}
              {isEditing ? (
                <select
                  value={editData?.client || ''}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LEX">LEX</option>
                  <option value="2GO">2GO</option>
                  <option value="SPX">SPX</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hub.client === 'LEX' ? 'bg-blue-100 text-blue-800' :
                  hub.client === '2GO' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {hub.client}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/hubs/${hub._id}/reports/add`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Report
              </Link>
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Hub
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hub Metadata */}
        {hub.createdAt && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="text-xs text-gray-500">
              Created: {new Date(hub.createdAt).toLocaleString()}
              {hub.updatedAt && hub.updatedAt !== hub.createdAt && (
                <span className="ml-4">
                  Last updated: {new Date(hub.updatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Average Success Rate */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Success Rate</h3>
              <div className="text-3xl font-bold text-green-600">
                {reports.length > 0 
                  ? (reports.reduce((acc, report) => acc + calculateSuccessRate(report), 0) / reports.length).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-sm text-gray-600 mt-1">Delivered/Outbound</p>
            </div>
            
            {/* Average SDOD */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg SDOD</h3>
              <div className="text-3xl font-bold text-blue-600">
                {reports.length > 0 
                  ? (reports.reduce((acc, report) => acc + calculateSDOD(report), 0) / reports.length).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-sm text-gray-600 mt-1">Same Day Out Delivery</p>
            </div>
            
            {/* Average POF */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg POF</h3>
              <div className="text-3xl font-bold text-orange-600">
                {reports.length > 0 
                  ? Math.round(reports.reduce((acc, report) => acc + calculatePOF(report), 0) / reports.length)
                  : 0
                }
              </div>
              <p className="text-sm text-gray-600 mt-1">Parcel on Floor</p>
            </div>
            
            {/* Total Reports */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Reports</h3>
              <div className="text-3xl font-bold text-purple-600">{reports.length}</div>
              <p className="text-sm text-gray-600 mt-1">Reports filed</p>
            </div>
          </div>

          {/* Cost and Profit Overview - Smaller Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cost per Parcel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost per Parcel</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900">₱</span>
                        <input
                          type="number"
                          value={editData?.hub_cost_per_parcel['2W'] || 0}
                          onChange={(e) => handleCostInputChange('2W', e.target.value)}
                          className="w-16 ml-1 text-lg font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">2W</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-gray-900">₱{hub.hub_cost_per_parcel['2W']}</div>
                      <p className="text-sm text-gray-600">2W</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900">₱</span>
                        <input
                          type="number"
                          value={editData?.hub_cost_per_parcel['3W'] || 0}
                          onChange={(e) => handleCostInputChange('3W', e.target.value)}
                          className="w-16 ml-1 text-lg font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">3W</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-gray-900">₱{hub.hub_cost_per_parcel['3W']}</div>
                      <p className="text-sm text-gray-600">3W</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900">₱</span>
                        <input
                          type="number"
                          value={editData?.hub_cost_per_parcel['4W'] || 0}
                          onChange={(e) => handleCostInputChange('4W', e.target.value)}
                          className="w-16 ml-1 text-lg font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">4W</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-gray-900">₱{hub.hub_cost_per_parcel['4W']}</div>
                      <p className="text-sm text-gray-600">4W</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profit per Parcel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit per Parcel</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-green-600">₱</span>
                        <input
                          type="number"
                          value={editData?.hub_profit_per_parcel['2W'] || 0}
                          onChange={(e) => handleProfitInputChange('2W', e.target.value)}
                          className="w-16 ml-1 text-lg font-bold text-green-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">2W</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-green-600">₱{hub.hub_profit_per_parcel['2W']}</div>
                      <p className="text-sm text-gray-600">2W</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-green-600">₱</span>
                        <input
                          type="number"
                          value={editData?.hub_profit_per_parcel['3W'] || 0}
                          onChange={(e) => handleProfitInputChange('3W', e.target.value)}
                          className="w-16 ml-1 text-lg font-bold text-green-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">3W</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-green-600">₱{hub.hub_profit_per_parcel['3W']}</div>
                      <p className="text-sm text-gray-600">3W</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-green-600">₱</span>
                        <input
                          type="number"
                          value={editData?.hub_profit_per_parcel['4W'] || 0}
                          onChange={(e) => handleProfitInputChange('4W', e.target.value)}
                          className="w-16 ml-1 text-lg font-bold text-green-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">4W</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-green-600">₱{hub.hub_profit_per_parcel['4W']}</div>
                      <p className="text-sm text-gray-600">4W</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Recent Reports</h3>
                <Link
                  href={`/hubs/${hub._id}/reports`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Reports →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h4>
                  <p className="text-gray-500 mb-6">Create your first report to get started tracking this hub's performance</p>
                  <Link
                    href={`/hubs/${hub._id}/reports/add`}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create First Report
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inbound
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outbound
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          POF
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Successful
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SDOD
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.slice(0, 5).map((report: Report) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatDate(report.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {report.inbound}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {report.outbound}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              calculatePOF(report) > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {calculatePOF(report)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {report.delivered}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="text-xs">
                              <div>2W: {report.successful_deliveries?.['2w'] || 0}</div>
                              <div>3W: {report.successful_deliveries?.['3w'] || 0}</div>
                              <div>4W: {report.successful_deliveries?.['4w'] || 0}</div>
                              <div className="font-semibold text-green-600">
                                Total: {getTotalSuccessfulDeliveries(report)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {report.failed}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              calculateSuccessRate(report) >= 80 ? 'bg-green-100 text-green-800' : 
                              calculateSuccessRate(report) >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {calculateSuccessRate(report).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              calculateSDOD(report) >= 90 ? 'bg-green-100 text-green-800' : 
                              calculateSDOD(report) >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {calculateSDOD(report).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/reports/${report._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
