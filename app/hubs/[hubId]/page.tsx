'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import HubSidebar from '@/components/HubSidebar';

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
}

export default function HubDetailPage({ params }: { params: Promise<{ hubId: string }> }) {
  const resolvedParams = use(params);
  const hubId = resolvedParams.hubId;
  
  const [hub, setHub] = useState<Hub | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <h1 className="text-2xl font-bold text-gray-900">{hub.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                hub.client === 'LEX' ? 'bg-blue-100 text-blue-800' :
                hub.client === '2GO' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {hub.client}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/hubs/${hub._id}/reports/add`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Report
              </Link>
              <Link
                href={`/hubs/${hub._id}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Edit Hub
              </Link>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Average Same Day Deliveries */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Same Day Deliveries</h3>
              <div className="text-3xl font-bold text-blue-600">
                {reports.length > 0 
                  ? Math.round(reports.reduce((acc, report) => acc + report.delivered, 0) / reports.length)
                  : 0
                }
              </div>
              <p className="text-sm text-gray-600 mt-1">Per day</p>
            </div>
            
            {/* Average Inbound */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Inbound</h3>
              <div className="text-3xl font-bold text-green-600">
                {reports.length > 0 
                  ? Math.round(reports.reduce((acc, report) => acc + report.inbound, 0) / reports.length)
                  : 0
                }
              </div>
              <p className="text-sm text-gray-600 mt-1">Per day</p>
            </div>
            
            {/* Total Reports */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Reports</h3>
              <div className="text-3xl font-bold text-purple-600">{reports.length}</div>
              <p className="text-sm text-gray-600 mt-1">Reports filed</p>
            </div>
            
            {/* Efficiency Rate */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Efficiency</h3>
              <div className="text-3xl font-bold text-orange-600">
                {reports.length > 0 
                  ? (reports.reduce((acc, report) => {
                      const total = report.delivered + report.failed;
                      return acc + (total > 0 ? (report.delivered / total) * 100 : 0);
                    }, 0) / reports.length).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-sm text-gray-600 mt-1">Success rate</p>
            </div>
          </div>

          {/* Cost and Profit Overview - Smaller Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cost per Parcel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost per Parcel</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">₱{hub.hub_cost_per_parcel['2W']}</div>
                  <p className="text-sm text-gray-600">2W</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">₱{hub.hub_cost_per_parcel['3W']}</div>
                  <p className="text-sm text-gray-600">3W</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">₱{hub.hub_cost_per_parcel['4W']}</div>
                  <p className="text-sm text-gray-600">4W</p>
                </div>
              </div>
            </div>
            
            {/* Profit per Parcel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit per Parcel</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">₱{hub.hub_profit_per_parcel['2W']}</div>
                  <p className="text-sm text-gray-600">2W</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">₱{hub.hub_profit_per_parcel['3W']}</div>
                  <p className="text-sm text-gray-600">3W</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">₱{hub.hub_profit_per_parcel['4W']}</div>
                  <p className="text-sm text-gray-600">4W</p>
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
                          Delivered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Backlogs
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {report.delivered}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {report.failed}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {report.backlogs}
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
