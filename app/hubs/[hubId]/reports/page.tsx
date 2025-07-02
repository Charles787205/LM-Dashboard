'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import HubSidebar from '@/components/HubSidebar';
import { 
  Calendar, 
  Download, 
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  CheckCircle,
  Plus,
  Eye,
  MoreHorizontal,
  FileText
} from 'lucide-react';

interface Hub {
  _id: string;
  name: string;
  client: string;
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

export default function HubReportsPage({ params }: { params: Promise<{ hubId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const hubId = resolvedParams.hubId;
  
  const [hub, setHub] = useState<Hub | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('last-7-days');

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
          setReports(result.data || []);
        } else {
          setError(result.error || 'Failed to fetch reports');
        }
      } catch (err) {
        setError('An error occurred while fetching reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    if (hub) {
      fetchReports();
    }
  }, [hubId, hub]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate efficiency
  const calculateEfficiency = (delivered: number, failed: number) => {
    const total = delivered + failed;
    return total > 0 ? ((delivered / total) * 100).toFixed(1) + '%' : '0%';
  };

  const handleAddReport = () => {
    router.push(`/hubs/${hubId}/reports/add`);
  };

  // Calculate statistics from reports
  const reportStats = reports.length > 0 ? [
    {
      title: 'Total Reports',
      value: reports.length.toString(),
      change: `${reports.length} total`,
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Avg. Deliveries',
      value: Math.round(reports.reduce((acc, report) => acc + report.delivered, 0) / reports.length).toString(),
      change: 'Average per day',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg. Success Rate',
      value: reports.length > 0 
        ? (reports.reduce((acc, report) => {
            const total = report.delivered + report.failed;
            return acc + (total > 0 ? (report.delivered / total) * 100 : 0);
          }, 0) / reports.length).toFixed(1) + '%'
        : '0%',
      change: 'Performance metric',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Failed',
      value: reports.reduce((acc, report) => acc + report.failed, 0).toString(),
      change: 'Requires attention',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested hub could not be found.'}</p>
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{hub.name} - Reports</h1>
                <p className="text-sm text-gray-600">Client: {hub.client}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Report
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Stats Cards */}
          {reportStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        {stat.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last-7-days">Last 7 Days</option>
                    <option value="last-30-days">Last 30 Days</option>
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Reports History</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {reports.length} total reports
                  </span>
                </div>
              </div>
            </div>
            
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first report.</p>
                <button
                  onClick={handleAddReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Inbound</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Outbound</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Backlogs</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Delivered</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Failed</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Misroutes</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Trips</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Efficiency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(report.date)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{report.inbound.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{report.outbound.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{report.backlogs}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{report.delivered.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{report.failed}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{report.misroutes}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <div className="flex space-x-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              2W: {report.trips['2w']}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              3W: {report.trips['3w']}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              4W: {report.trips['4w']}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {(() => {
                            const efficiency = calculateEfficiency(report.delivered, report.failed);
                            const efficiencyNum = parseFloat(efficiency);
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                efficiencyNum >= 95 
                                  ? 'bg-green-100 text-green-800'
                                  : efficiencyNum >= 90
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {efficiency}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
}
