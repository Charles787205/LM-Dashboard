'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components';
import { useReports } from '@/hooks/useReports';
import { useHubs } from '@/hooks/useHubs';
import { 
  Calendar, 
  Download, 
  Filter, 
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Menu,
  Bell,
  Settings,
  ChevronDown,
  FileText,
  Eye,
  MoreHorizontal,
  Plus,
  X,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last-7-days');
  const [selectedHub, setSelectedHub] = useState('all');
  const [showHubSelectionModal, setShowHubSelectionModal] = useState(false);
  const [selectedHubForReport, setSelectedHubForReport] = useState('');

  // Get reports and hubs from database
  const { reports, loading: reportsLoading, error: reportsError, refreshReports } = useReports();
  const { hubs, loading: hubsLoading } = useHubs();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleAddReport = () => {
    setShowHubSelectionModal(true);
  };

  const handleCloseModal = () => {
    setShowHubSelectionModal(false);
    setSelectedHubForReport('');
  };

  const handleHubSelection = (hubId: string, hubName: string) => {
    window.location.href = `/reports/add?hub=${hubId}&hubName=${hubName}`;
  };

  // Filter reports based on selected hub and period
  const filteredReports = reports.filter(report => {
    if (selectedHub !== 'all' && report.hub._id !== selectedHub) {
      return false;
    }
    
    const reportDate = new Date(report.date);
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        return reportDate.toDateString() === now.toDateString();
      case 'last-7-days':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return reportDate >= weekAgo;
      case 'last-30-days':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return reportDate >= monthAgo;
      default:
        return true;
    }
  });

  // Calculate summary statistics
  const calculateSummary = () => {
    if (filteredReports.length === 0) {
      return {
        totalInbound: 0,
        totalOutbound: 0,
        totalDelivered: 0,
        totalSuccessful: 0,
        totalFailed: 0,
        totalBacklogs: 0,
        averagePOF: 0,
        averageSuccessRate: 0,
        averageFailedRate: 0,
        averageSDOD: 0,
        averageEfficiency: 0
      };
    }

    const totals = filteredReports.reduce((acc, report) => {
      acc.totalInbound += report.inbound;
      acc.totalOutbound += report.outbound;
      acc.totalDelivered += report.delivered;
      acc.totalFailed += report.failed;
      acc.totalBacklogs += report.backlogs;
      
      // Calculate total successful deliveries
      const successfulTotal = (report.successful_deliveries?.['2w'] || 0) + 
                            (report.successful_deliveries?.['3w'] || 0) + 
                            (report.successful_deliveries?.['4w'] || 0);
      acc.totalSuccessful += successfulTotal;
      
      return acc;
    }, {
      totalInbound: 0,
      totalOutbound: 0,
      totalDelivered: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      totalBacklogs: 0
    });

    // Calculate averages
    const averagePOF = totals.totalInbound + totals.totalBacklogs - totals.totalOutbound;
    
    const averageSuccessRate = totals.totalOutbound > 0
      ? ((totals.totalDelivered / totals.totalOutbound) * 100)
      : 0;
    
    const averageFailedRate = totals.totalOutbound > 0
      ? ((totals.totalFailed / totals.totalOutbound) * 100)
      : 0;
    
    const averageSDOD = (totals.totalInbound + totals.totalBacklogs) > 0
      ? ((totals.totalOutbound / (totals.totalInbound + totals.totalBacklogs)) * 100)
      : 0;

    const averageEfficiency = filteredReports.length > 0 
      ? ((totals.totalDelivered / (totals.totalDelivered + totals.totalFailed)) * 100)
      : 0;

    return {
      ...totals,
      averagePOF: isNaN(averagePOF) ? 0 : averagePOF,
      averageSuccessRate: isNaN(averageSuccessRate) ? 0 : averageSuccessRate,
      averageFailedRate: isNaN(averageFailedRate) ? 0 : averageFailedRate,
      averageSDOD: isNaN(averageSDOD) ? 0 : averageSDOD,
      averageEfficiency: isNaN(averageEfficiency) ? 0 : averageEfficiency
    };
  };

  const summary = calculateSummary();

  // Dynamic stats based on actual data
  const reportStats = [
    {
      title: 'POF (Parcel on Floor)',
      value: summary.averagePOF.toLocaleString(),
      change: reportsLoading ? '...' : 'Inbound + Backlogs - Outbound',
      trend: summary.averagePOF <= 0 ? 'up' : 'down',
      icon: Package,
      color: summary.averagePOF <= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.averagePOF <= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      title: 'Success Rate',
      value: `${summary.averageSuccessRate.toFixed(1)}%`,
      change: reportsLoading ? '...' : 'Delivered / Outbound',
      trend: summary.averageSuccessRate >= 95 ? 'up' : 'down',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Failed Rate',
      value: `${summary.averageFailedRate.toFixed(1)}%`,
      change: reportsLoading ? '...' : 'Failed / Outbound',
      trend: summary.averageFailedRate <= 5 ? 'up' : 'down',
      icon: AlertCircle,
      color: summary.averageFailedRate <= 5 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.averageFailedRate <= 5 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      title: 'SDOD Rate',
      value: `${summary.averageSDOD.toFixed(1)}%`,
      change: reportsLoading ? '...' : 'Outbound / (Inbound + Backlogs)',
      trend: summary.averageSDOD >= 90 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Report
              </button>
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  AD
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="last-7-days">Last 7 days</option>
                    <option value="last-30-days">Last 30 days</option>
                    <option value="last-3-months">Last 3 months</option>
                    <option value="last-year">Last year</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedHub}
                    onChange={(e) => setSelectedHub(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Hubs</option>
                    {hubs.map((hub) => (
                      <option key={hub._id} value={hub._id}>
                        {hub.name} ({hub.client})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => refreshReports()}
                  disabled={reportsLoading}
                  className="flex items-center space-x-2 bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${reportsLoading ? 'animate-spin' : ''}`} />
                  <span>{reportsLoading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium flex items-center ${
                    stat.title === 'Failed Deliveries' 
                      ? (stat.trend === 'up' ? 'text-green-600' : 'text-red-600')
                      : (stat.trend === 'up' ? 'text-green-600' : 'text-red-600')
                  }`}>
                    {stat.title === 'Failed Deliveries' && stat.change.startsWith('-') ? (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Reports</h3>
                  <p className="text-sm text-gray-500">Hub performance and delivery metrics</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Hub</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Inbound</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Outbound</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Backlogs</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900" title="Parcel on Floor: Inbound + Backlogs - Outbound">
                      POF
                      <span className="text-xs text-gray-500 block font-normal">Parcel on Floor</span>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Delivered</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Failed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900" title="Success Rate: Delivered / Outbound * 100%">
                      Success Rate
                      <span className="text-xs text-gray-500 block font-normal">Delivered/Outbound</span>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900" title="Failed Rate: Failed / Outbound * 100%">
                      Failed Rate
                      <span className="text-xs text-gray-500 block font-normal">Failed/Outbound</span>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900" title="Same Day Out Delivery: Outbound / (Inbound + Backlogs) * 100%">
                      SDOD
                      <span className="text-xs text-gray-500 block font-normal">Same Day Out</span>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsLoading ? (
                    <tr>
                      <td colSpan={13} className="py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          Loading reports...
                        </div>
                      </td>
                    </tr>
                  ) : reportsError ? (
                    <tr>
                      <td colSpan={13} className="py-8 text-center text-red-500">
                        Error loading reports: {reportsError}
                        <button 
                          onClick={() => refreshReports()}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          Try again
                        </button>
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-8 text-center text-gray-500">
                        No reports found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => {
                      // Calculate metrics
                      const pof = report.inbound + report.backlogs - report.outbound;
                      const successRate = report.outbound > 0 ? ((report.delivered / report.outbound) * 100) : 0;
                      const failedRate = report.outbound > 0 ? ((report.failed / report.outbound) * 100) : 0;
                      const sdod = (report.inbound + report.backlogs) > 0 ? ((report.outbound / (report.inbound + report.backlogs)) * 100) : 0;
                      
                      return (
                        <tr key={report._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-900">
                            {new Date(report.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{report.hub.name}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              report.hub.client === 'LEX' ? 'bg-blue-100 text-blue-800' :
                              report.hub.client === '2GO' ? 'bg-green-100 text-green-800' :
                              report.hub.client === 'SPX' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.hub.client}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-900">{report.inbound.toLocaleString()}</td>
                          <td className="py-4 px-4 text-gray-900">{report.outbound.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span className="text-orange-600 font-medium">{report.backlogs}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${
                              pof > 0 ? 'text-red-600' : pof < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {pof.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-green-600 font-medium">{report.delivered.toLocaleString()}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-red-600 font-medium">{report.failed}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              successRate >= 95 ? 'bg-green-100 text-green-800' :
                              successRate >= 85 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {successRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              failedRate <= 5 ? 'bg-green-100 text-green-800' :
                              failedRate <= 15 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {failedRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sdod >= 90 ? 'bg-green-100 text-green-800' :
                              sdod >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {sdod.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button 
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                onClick={() => router.push(`/reports/${report._id}`)}
                                title="View Report Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hub Selection Modal */}
        {showHubSelectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Select Hub for Report</h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">Choose which hub you want to create a report for:</p>
                <div className="space-y-2">
                  {hubsLoading ? (
                    <div className="text-center py-4 text-gray-500">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                      Loading hubs...
                    </div>
                  ) : hubs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No hubs available. Please create a hub first.
                    </div>
                  ) : (
                    hubs.map((hub) => (
                      <button
                        key={hub._id}
                        onClick={() => handleHubSelection(hub._id, hub.name)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-blue-700">{hub.name}</p>
                            <p className="text-sm text-gray-500">Client: {hub.client}</p>
                          </div>
                          <div className="text-gray-400 group-hover:text-blue-500">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
