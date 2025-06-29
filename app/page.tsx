'use client';

import { useState } from 'react';
import Sidebar from '../components/sidebar';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Calendar, 
  Bell, 
  Search, 
  Settings,
  ChevronDown,
  Plus,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Menu
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7 days');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000, users: 2400 },
    { name: 'Feb', revenue: 3000, users: 1398 },
    { name: 'Mar', revenue: 2000, users: 9800 },
    { name: 'Apr', revenue: 2780, users: 3908 },
    { name: 'May', revenue: 1890, users: 4800 },
    { name: 'Jun', revenue: 2390, users: 3800 },
    { name: 'Jul', revenue: 3490, users: 4300 },
  ];

  const trafficData = [
    { name: 'Direct', value: 4567, color: '#8B5CF6' },
    { name: 'Social', value: 3456, color: '#3B82F6' },
    { name: 'Search', value: 2345, color: '#10B981' },
    { name: 'Email', value: 1234, color: '#F59E0B' },
  ];

  const conversionData = [
    { name: 'Week 1', conversions: 24, visits: 400 },
    { name: 'Week 2', conversions: 45, visits: 600 },
    { name: 'Week 3', conversions: 67, visits: 800 },
    { name: 'Week 4', conversions: 89, visits: 1000 },
  ];

  const stats = [
    {
      title: 'Inbound',
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Outbound',
      value: '2,350',
      change: '+180.1%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Delivered',
      value: '12.5%',
      change: '+19%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Failed Deliveries',
      value: '573',
      change: '+201',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  // Additional chart data
  const performanceData = [
    { name: 'Mon', performance: 85, target: 90 },
    { name: 'Tue', performance: 92, target: 90 },
    { name: 'Wed', performance: 78, target: 90 },
    { name: 'Thu', performance: 88, target: 90 },
    { name: 'Fri', performance: 95, target: 90 },
    { name: 'Sat', performance: 87, target: 90 },
    { name: 'Sun', performance: 91, target: 90 },
  ];

  const distributionData = [
    { name: 'Q1', inbound: 120, outbound: 80, delivered: 200 },
    { name: 'Q2', inbound: 150, outbound: 100, delivered: 240 },
    { name: 'Q3', inbound: 180, outbound: 120, delivered: 280 },
    { name: 'Q4', inbound: 200, outbound: 140, delivered: 320 },
  ];

  const topProducts = [
    { name: 'SDOD', sales: 101, revenue: '101', trend: '+12%' },
    { name: 'Average Volume', sales: 'for the past week', revenue: '21456', trend: '+8%' },
    { name: '1st Attempt', sales: 234, revenue: '18790', trend: '+25%' },
    { name: '2nd Attempt', sales: 445, revenue: '8920', trend: '5%' }
  ];

  return (
    <div className="min-h-screen bg-white flex">
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
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
                  JD
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
              <p className="text-blue-100 mb-4">Here's what's happening with your business today.</p>
              <div className="flex items-center space-x-4">
                <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add New</span>
                </button>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance vs Target Chart */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    name="Actual Performance (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    name="Target (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quarterly Distribution */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quarterly Distribution</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="inbound" fill="#3b82f6" name="Inbound" />
                  <Bar dataKey="outbound" fill="#8b5cf6" name="Outbound" />
                  <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{product.revenue}</p>
                      <p className="text-sm text-green-600">{product.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Daily Trends</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                    name="Revenue Trend"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Users</h3>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option>7 days</option>
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="Revenue ($)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stackId="2" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                    name="Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Conversion Analytics */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Analytics</h3>
              <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="visits" fill="#e5e7eb" name="Total Visits" />
                <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
