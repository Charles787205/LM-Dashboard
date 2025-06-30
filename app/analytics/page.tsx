'use client';

import { useState } from 'react';
import { Sidebar } from '@/components';
import { 
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Menu,
  Calendar,
  Users,
  DollarSign,
  Truck,
  Building2,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Filter,
  Download
} from 'lucide-react';

export default function AnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last-7-days');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Sample data for analytics
  const kpiData = [
    {
      title: 'Overall Success Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Deliveries',
      value: '12,456',
      change: '+15.3%',
      trend: 'up',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Avg Delivery Time',
      value: '2.4 hrs',
      change: '-12 min',
      trend: 'up',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Revenue',
      value: '₱1,234,567',
      change: '+8.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ];

  const hubPerformanceData = [
    { hub: 'Downtown Hub', client: 'LEX', successRate: 94.2, deliveries: 2456, revenue: 234567, efficiency: 'Excellent' },
    { hub: 'North Hub', client: '2GO', successRate: 91.8, deliveries: 1987, revenue: 187432, efficiency: 'Good' },
    { hub: 'South Hub', client: 'SPX', successRate: 96.1, deliveries: 3124, revenue: 298765, efficiency: 'Excellent' },
    { hub: 'East Hub', client: 'LEX', successRate: 89.4, deliveries: 1654, revenue: 156789, efficiency: 'Average' },
    { hub: 'West Hub', client: '2GO', successRate: 93.7, deliveries: 2287, revenue: 212345, efficiency: 'Good' }
  ];

  const failedDeliveryReasons = [
    { reason: 'Not at Home', count: 156, percentage: 32.5, color: 'bg-red-500' },
    { reason: 'No Cash Available', count: 98, percentage: 20.4, color: 'bg-orange-500' },
    { reason: 'Postpone', count: 87, percentage: 18.1, color: 'bg-yellow-500' },
    { reason: 'Refuse', count: 65, percentage: 13.5, color: 'bg-purple-500' },
    { reason: 'Unreachable', count: 43, percentage: 9.0, color: 'bg-blue-500' },
    { reason: 'Invalid Address', count: 31, percentage: 6.5, color: 'bg-gray-500' }
  ];

  const vehicleTypeData = [
    { type: '2-Wheeler', trips: 1456, efficiency: 95.2, avgDeliveries: 12.4 },
    { type: '3-Wheeler', trips: 987, efficiency: 91.8, avgDeliveries: 18.7 },
    { type: '4-Wheeler', trips: 234, efficiency: 88.9, avgDeliveries: 45.2 }
  ];

  const weeklyTrend = [
    { day: 'Mon', deliveries: 1876, success: 94.2 },
    { day: 'Tue', deliveries: 2134, success: 93.8 },
    { day: 'Wed', deliveries: 1987, success: 95.1 },
    { day: 'Thu', deliveries: 2287, success: 92.4 },
    { day: 'Fri', deliveries: 2456, success: 94.7 },
    { day: 'Sat', deliveries: 1654, success: 96.2 },
    { day: 'Sun', deliveries: 1234, success: 97.1 }
  ];

  const clientComparison = [
    { client: 'LEX', hubs: 2, totalDeliveries: 4110, successRate: 91.8, revenue: 391356, growth: '+12.3%' },
    { client: '2GO', hubs: 2, totalDeliveries: 4274, successRate: 92.8, revenue: 399777, growth: '+8.7%' },
    { client: 'SPX', hubs: 1, totalDeliveries: 3124, successRate: 96.1, revenue: 298765, growth: '+15.2%' }
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
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="this-year">This Year</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Delivery Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Weekly Delivery Trend</h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {weeklyTrend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 w-8">{day.day}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(day.deliveries / 2500) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{day.deliveries.toLocaleString()}</p>
                      <p className="text-xs text-green-600">{day.success}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Delivery Reasons */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Failed Delivery Analysis</h2>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {failedDeliveryReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${reason.color}`}></div>
                      <span className="text-sm text-gray-700">{reason.reason}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{reason.count}</span>
                      <span className="text-xs text-gray-500 ml-2">({reason.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hub Performance Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Hub Performance Comparison</h2>
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Hub</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Success Rate</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Deliveries</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Revenue</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hubPerformanceData.map((hub, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{hub.hub}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {hub.client}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{hub.successRate}%</span>
                          <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${hub.successRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{hub.deliveries.toLocaleString()}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">₱{hub.revenue.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          hub.efficiency === 'Excellent' ? 'bg-green-100 text-green-800' :
                          hub.efficiency === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {hub.efficiency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Type Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Type Performance</h2>
                <Truck className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {vehicleTypeData.map((vehicle, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{vehicle.type}</h3>
                      <span className="text-sm text-gray-500">{vehicle.trips} trips</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <p className="font-semibold text-green-600">{vehicle.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Deliveries</p>
                        <p className="font-semibold text-blue-600">{vehicle.avgDeliveries}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Client Performance</h2>
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {clientComparison.map((client, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{client.client}</h3>
                      <span className="text-sm font-medium text-green-600">{client.growth}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Hubs: {client.hubs}</p>
                        <p className="text-gray-600">Deliveries: {client.totalDeliveries.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success: {client.successRate}%</p>
                        <p className="text-gray-600">Revenue: ₱{client.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
