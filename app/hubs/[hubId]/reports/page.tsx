'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components';
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
  Users,
  Truck,
  Building2,
  MapPin,
  Activity,
  ArrowLeft
} from 'lucide-react';

export default function HubReportsPage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.hubId as string;
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last-7-days');

  // Hub data - this would come from your API
  const hubsData = {
    downtown: { id: 'downtown', name: 'Downtown Hub', client: 'LEX', color: 'bg-blue-500' },
    north: { id: 'north', name: 'North Hub', client: '2GO', color: 'bg-green-500' },
    south: { id: 'south', name: 'South Hub', client: 'SPX', color: 'bg-purple-500' },
    east: { id: 'east', name: 'East Hub', client: 'LEX', color: 'bg-orange-500' },
    west: { id: 'west', name: 'West Hub', client: '2GO', color: 'bg-red-500' }
  };

  const currentHub = hubsData[hubId as keyof typeof hubsData];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleAddReport = () => {
    router.push(`/hubs/${hubId}/reports/add`);
  };

  const handleBackToHub = () => {
    router.push(`/hubs/${hubId}`);
  };

  if (!currentHub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hub Not Found</h2>
          <p className="text-gray-600 mb-4">The requested hub could not be found.</p>
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

  // Sample reports data for this hub
  const reportsData = [
    {
      id: 1,
      date: '2025-01-07',
      inbound: 324,
      outbound: 298,
      backlogs: 26,
      delivered: 275,
      failed: 12,
      misroutes: 8,
      trips: { '2w': 189, '3w': 86, '4w': 12 },
      efficiency: '92.3%'
    },
    {
      id: 2,
      date: '2025-01-06',
      inbound: 312,
      outbound: 289,
      backlogs: 23,
      delivered: 267,
      failed: 14,
      misroutes: 8,
      trips: { '2w': 184, '3w': 83, '4w': 14 },
      efficiency: '92.4%'
    },
    {
      id: 3,
      date: '2025-01-05',
      inbound: 298,
      outbound: 276,
      backlogs: 22,
      delivered: 254,
      failed: 11,
      misroutes: 11,
      trips: { '2w': 172, '3w': 82, '4w': 11 },
      efficiency: '93.1%'
    },
    {
      id: 4,
      date: '2025-01-04',
      inbound: 287,
      outbound: 269,
      backlogs: 18,
      delivered: 251,
      failed: 11,
      misroutes: 7,
      trips: { '2w': 178, '3w': 73, '4w': 18 },
      efficiency: '93.3%'
    }
  ];

  const reportStats = [
    {
      title: 'Total Reports',
      value: reportsData.length.toString(),
      change: '+4 this week',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Avg. Deliveries',
      value: Math.round(reportsData.reduce((acc, report) => acc + report.delivered, 0) / reportsData.length).toString(),
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg. Success Rate',
      value: (reportsData.reduce((acc, report) => acc + parseFloat(report.efficiency), 0) / reportsData.length).toFixed(1) + '%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Failed',
      value: reportsData.reduce((acc, report) => acc + report.failed, 0).toString(),
      change: '-8.3%',
      trend: 'up',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
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
              <button
                onClick={handleBackToHub}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg ${currentHub.color} flex items-center justify-center`}>
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentHub.name} - Reports</h1>
                  <p className="text-sm text-gray-600">Client: {currentHub.client}</p>
                </div>
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
          {/* Stats Cards */}
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
                    {reportsData.length} total reports
                  </span>
                </div>
              </div>
            </div>
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
                  {reportsData.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{report.date}</td>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          parseFloat(report.efficiency) >= 95 
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(report.efficiency) >= 90
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.efficiency}
                        </span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
