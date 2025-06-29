'use client';

import { useState } from 'react';
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
  X
} from 'lucide-react';

export default function ReportsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last-7-days');
  const [selectedHub, setSelectedHub] = useState('all');
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    hub: '',
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
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleAddReport = () => {
    setShowAddReportModal(true);
  };

  const handleCloseModal = () => {
    setShowAddReportModal(false);
    setReportForm({
      hub: '',
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
      }
    });
  };

  const handleFormChange = (field: string, value: string) => {
    if (field.startsWith('trips.')) {
      const tripType = field.split('.')[1];
      setReportForm(prev => ({
        ...prev,
        trips: {
          ...prev.trips,
          [tripType]: value
        }
      }));
    } else {
      setReportForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting report:', reportForm);
    alert('Report added successfully!');
    handleCloseModal();
  };

  // Sample reports data based on the Reports model
  const reportsData = [
    {
      id: 1,
      hub: 'Downtown Hub',
      client: 'LEX',
      inbound: 324,
      outbound: 298,
      backlogs: 26,
      delivered: 275,
      failed: 12,
      misroutes: 8,
      trips: { '2w': 189, '3w': 86, '4w': 12 },
      date: '2025-01-07',
      efficiency: '92.3%'
    },
    {
      id: 2,
      hub: 'North Hub',
      client: '2GO',
      inbound: 256,
      outbound: 241,
      backlogs: 15,
      delivered: 228,
      failed: 8,
      misroutes: 5,
      trips: { '2w': 156, '3w': 72, '4w': 13 },
      date: '2025-01-07',
      efficiency: '94.6%'
    },
    {
      id: 3,
      hub: 'South Hub',
      client: 'SPX',
      inbound: 398,
      outbound: 372,
      backlogs: 26,
      delivered: 349,
      failed: 15,
      misroutes: 8,
      trips: { '2w': 245, '3w': 104, '4w': 23 },
      date: '2025-01-07',
      efficiency: '93.8%'
    },
    {
      id: 4,
      hub: 'East Hub',
      client: 'LEX',
      inbound: 189,
      outbound: 176,
      backlogs: 13,
      delivered: 164,
      failed: 9,
      misroutes: 3,
      trips: { '2w': 112, '3w': 52, '4w': 12 },
      date: '2025-01-07',
      efficiency: '93.2%'
    },
    {
      id: 5,
      hub: 'West Hub',
      client: '2GO',
      inbound: 287,
      outbound: 269,
      backlogs: 18,
      delivered: 251,
      failed: 11,
      misroutes: 7,
      trips: { '2w': 178, '3w': 73, '4w': 18 },
      date: '2025-01-07',
      efficiency: '93.3%'
    },
    {
      id: 6,
      hub: 'Downtown Hub',
      client: 'LEX',
      inbound: 312,
      outbound: 289,
      backlogs: 23,
      delivered: 267,
      failed: 14,
      misroutes: 8,
      trips: { '2w': 184, '3w': 83, '4w': 14 },
      date: '2025-01-06',
      efficiency: '92.4%'
    },
    {
      id: 7,
      hub: 'North Hub',
      client: '2GO',
      inbound: 234,
      outbound: 218,
      backlogs: 16,
      delivered: 203,
      failed: 9,
      misroutes: 6,
      trips: { '2w': 142, '3w': 61, '4w': 15 },
      date: '2025-01-06',
      efficiency: '93.1%'
    },
    {
      id: 8,
      hub: 'South Hub',
      client: 'SPX',
      inbound: 421,
      outbound: 398,
      backlogs: 23,
      delivered: 376,
      failed: 13,
      misroutes: 9,
      trips: { '2w': 268, '3w': 108, '4w': 22 },
      date: '2025-01-06',
      efficiency: '94.5%'
    }
  ];

  const reportStats = [
    {
      title: 'Total Deliveries',
      value: '2,456',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg. Delivery Time',
      value: '2.4 hrs',
      change: '-15 min',
      trend: 'up',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Failed Deliveries',
      value: '142',
      change: '-8.3%',
      trend: 'up',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  // Available hubs data
  const availableHubs = [
    { id: 'downtown', name: 'Downtown Hub', client: 'LEX' },
    { id: 'north', name: 'North Hub', client: '2GO' },
    { id: 'south', name: 'South Hub', client: 'SPX' },
    { id: 'east', name: 'East Hub', client: 'LEX' },
    { id: 'west', name: 'West Hub', client: '2GO' }
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
                    <option value="downtown">Downtown</option>
                    <option value="north">North Hub</option>
                    <option value="south">South Hub</option>
                    <option value="east">East Hub</option>
                    <option value="west">West Hub</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button 
                  onClick={handleAddReport}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Report</span>
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
                <button
                  onClick={handleAddReport}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Report</span>
                </button>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Delivered</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Failed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Misroutes</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Vehicles</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Efficiency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900">{report.date}</td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{report.hub}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {report.client}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{report.inbound.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-900">{report.outbound.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className="text-orange-600 font-medium">{report.backlogs}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-green-600 font-medium">{report.delivered.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-red-600 font-medium">{report.failed}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-yellow-600 font-medium">{report.misroutes}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          <div>2W: {report.trips['2w']}</div>
                          <div>3W: {report.trips['3w']}</div>
                          <div>4W: {report.trips['4w']}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          parseFloat(report.efficiency) >= 94 
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(report.efficiency) >= 90
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.efficiency}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="More Options">
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

        {/* Add Report Modal */}
        {showAddReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmitReport}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Add New Report</h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Hub Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hub <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reportForm.hub}
                      onChange={(e) => handleFormChange('hub', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select a Hub</option>
                      {availableHubs.map((hub) => (
                        <option key={hub.id} value={hub.id}>
                          {hub.name} ({hub.client})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Main Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inbound <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.inbound}
                        onChange={(e) => handleFormChange('inbound', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outbound <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.outbound}
                        onChange={(e) => handleFormChange('outbound', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backlogs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.backlogs}
                        onChange={(e) => handleFormChange('backlogs', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivered <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.delivered}
                        onChange={(e) => handleFormChange('delivered', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Failed <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.failed}
                        onChange={(e) => handleFormChange('failed', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Misroutes
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.misroutes}
                        onChange={(e) => handleFormChange('misroutes', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Vehicle Trips */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Trips
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">2-Wheeler</label>
                        <input
                          type="number"
                          min="0"
                          value={reportForm.trips['2w']}
                          onChange={(e) => handleFormChange('trips.2w', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">3-Wheeler</label>
                        <input
                          type="number"
                          min="0"
                          value={reportForm.trips['3w']}
                          onChange={(e) => handleFormChange('trips.3w', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">4-Wheeler</label>
                        <input
                          type="number"
                          min="0"
                          value={reportForm.trips['4w']}
                          onChange={(e) => handleFormChange('trips.4w', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
