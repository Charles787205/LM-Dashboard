'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {Sidebar} from '@/components';
import { useDashboard } from '@/hooks/useDashboard';
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
  Menu,
  RefreshCw,
  CalendarIcon
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Prepare filters for useDashboard hook
  const dashboardFilters = {
    period: selectedPeriod,
    ...(selectedPeriod === 'custom' && customStartDate && customEndDate && {
      startDate: customStartDate,
      endDate: customEndDate
    })
  };
  
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch } = useDashboard(dashboardFilters);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Sample data for charts (fallback if no real data)
  const fallbackRevenueData = [
    { name: 'Mon', revenue: 0, delivered: 0, inbound: 0, outbound: 0, failed: 0 },
    { name: 'Tue', revenue: 0, delivered: 0, inbound: 0, outbound: 0, failed: 0 },
    { name: 'Wed', revenue: 0, delivered: 0, inbound: 0, outbound: 0, failed: 0 },
    { name: 'Thu', revenue: 0, delivered: 0, inbound: 0, outbound: 0, failed: 0 },
    { name: 'Fri', revenue: 0, delivered: 0, inbound: 0, outbound: 0, failed: 0 },
    { name: 'Sat', revenue: 0, delivered: 0, inbound: 0, outbound: 0, failed: 0 },
    { name: 'Sun', revenue: 0, delivered: 0, inbound: 0, outbound: 0, failed: 0 },
  ];

  // Use real data or fallback
  const revenueData = dashboardData?.dailyTrends || fallbackRevenueData;

  const trafficData = [
    { name: '2W Delivery', value: dashboardData?.stats.totalDelivered || 0, color: '#8B5CF6' },
    { name: '3W Delivery', value: Math.round((dashboardData?.stats.totalDelivered || 0) * 0.3), color: '#3B82F6' },
    { name: '4W Delivery', value: Math.round((dashboardData?.stats.totalDelivered || 0) * 0.1), color: '#10B981' },
    { name: 'Failed', value: dashboardData?.stats.totalFailed || 0, color: '#F59E0B' },
  ];

  const conversionData = dashboardData?.hubPerformance.slice(0, 4).map((hub, index) => ({
    name: hub._id.substring(0, 8),
    conversions: hub.totalDelivered,
    visits: hub.totalProcessed,
    successRate: hub.successRate
  })) || [
    { name: 'No Data', conversions: 0, visits: 0, successRate: 0 }
  ];

  // Calculate stats with real data
  const stats = [
    {
      title: 'Inbound Parcels',
      value: (dashboardData?.stats.totalInbound || 0).toLocaleString(),
      change: (dashboardData?.recentStats?.recentInbound && dashboardData?.stats?.totalInbound) 
        ? '+' + ((dashboardData.recentStats.recentInbound / Math.max(dashboardData.stats.totalInbound - dashboardData.recentStats.recentInbound, 1)) * 100).toFixed(1) + '%' 
        : '0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Outbound Parcels',
      value: (dashboardData?.stats.totalOutbound || 0).toLocaleString(),
      change: (dashboardData?.recentStats?.recentOutbound && dashboardData?.stats?.totalOutbound) 
        ? '+' + ((dashboardData.recentStats.recentOutbound / Math.max(dashboardData.stats.totalOutbound - dashboardData.recentStats.recentOutbound, 1)) * 100).toFixed(1) + '%' 
        : '0%',
      trend: 'up',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Delivered Parcels',
      value: (dashboardData?.stats.totalDelivered || 0).toLocaleString(),
      change: (dashboardData?.recentStats?.recentDelivered && dashboardData?.stats?.totalDelivered) 
        ? '+' + ((dashboardData.recentStats.recentDelivered / Math.max(dashboardData.stats.totalDelivered - dashboardData.recentStats.recentDelivered, 1)) * 100).toFixed(1) + '%' 
        : '0%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Failed Deliveries',
      value: (dashboardData?.stats.totalFailed || 0).toLocaleString(),
      change: dashboardData?.stats.failedRate ? dashboardData.stats.failedRate.toFixed(1) + '%' : '0%',
      trend: 'down',
      icon: Activity,
      color: 'text-red-600'
    }
  ];

  // Additional chart data
  const performanceData = dashboardData?.dailyTrends.map((day, index) => ({
    name: day.name,
    performance: day.delivered > 0 ? Math.round((day.delivered / (day.delivered + day.failed)) * 100) : 0,
    target: 90
  })) || [
    { name: 'Mon', performance: 0, target: 90 },
    { name: 'Tue', performance: 0, target: 90 },
    { name: 'Wed', performance: 0, target: 90 },
    { name: 'Thu', performance: 0, target: 90 },
    { name: 'Fri', performance: 0, target: 90 },
    { name: 'Sat', performance: 0, target: 90 },
    { name: 'Sun', performance: 0, target: 90 },
  ];

  const distributionData = dashboardData?.dailyTrends.slice(0, 4).map((day, index) => ({
    name: `Day ${index + 1}`,
    inbound: day.inbound,
    outbound: day.outbound,
    delivered: day.delivered
  })) || [
    { name: 'Day 1', inbound: 0, outbound: 0, delivered: 0 },
    { name: 'Day 2', inbound: 0, outbound: 0, delivered: 0 },
    { name: 'Day 3', inbound: 0, outbound: 0, delivered: 0 },
    { name: 'Day 4', inbound: 0, outbound: 0, delivered: 0 },
  ];

  const topProducts = [
    { 
      name: 'Same Day Delivery', 
      subtitle: 'Current success rate', 
      value: dashboardData?.stats.successRate ? `${dashboardData.stats.successRate.toFixed(1)}%` : '0%', 
      trend: dashboardData?.stats.successRate ? `+${(dashboardData.stats.successRate * 0.05).toFixed(1)}%` : '0%',
      trendUp: true,
      icon: '🚀'
    },
    { 
      name: 'Average Volume', 
      subtitle: 'Daily parcels', 
      value: dashboardData?.keyMetrics.averageVolume ? `${dashboardData.keyMetrics.averageVolume} parcels` : '0 parcels', 
      trend: dashboardData?.recentStats?.recentInbound ? `+${dashboardData.recentStats.recentInbound}` : '0',
      trendUp: true,
      icon: '📊'
    },
    { 
      name: 'First Attempt Success', 
      subtitle: 'Delivery completion', 
      value: dashboardData?.keyMetrics.firstAttemptSuccess ? `${dashboardData.keyMetrics.firstAttemptSuccess.toFixed(1)}%` : '0%', 
      trend: '+3.1%',
      trendUp: true,
      icon: '🥇'
    },
    { 
      name: 'Hub Performance', 
      subtitle: 'Average across hubs', 
      value: dashboardData?.keyMetrics.averageSuccessRate ? `${dashboardData.keyMetrics.averageSuccessRate.toFixed(1)}%` : '0%', 
      trend: '+2.5%',
      trendUp: true,
      icon: '🥈'
    },
    { 
      name: 'Active Hubs', 
      subtitle: 'Total operational', 
      value: dashboardData?.stats.totalHubs ? `${dashboardData.stats.totalHubs} hubs` : '0 hubs', 
      trend: dashboardData?.stats.totalHubs ? `${dashboardData.stats.totalHubs} active` : '0 active',
      trendUp: true,
      icon: '🚛'
    }
  ];

  // Show loading spinner while checking authentication or loading dashboard data
  if (status === 'loading' || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === 'loading' ? 'Loading...' : 'Loading dashboard data...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if dashboard data failed to load
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard data</h2>
          <p className="text-gray-600 mb-4">{dashboardError}</p>
          <button 
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

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
              
              {/* Time Period Selector */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-gray-600" />
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom')}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="daily">Today</option>
                  <option value="weekly">Last 7 Days</option>
                  <option value="monthly">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                {selectedPeriod === 'custom' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      placeholder="From"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      placeholder="To"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refetch}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Refresh dashboard data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Time Period Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900 font-medium">
              Showing data for: 
              {selectedPeriod === 'daily' && ' Today'}
              {selectedPeriod === 'weekly' && ' Last 7 Days'}
              {selectedPeriod === 'monthly' && ' Last 30 Days'}
              {selectedPeriod === 'custom' && customStartDate && customEndDate && 
                ` ${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`}
              {selectedPeriod === 'custom' && (!customStartDate || !customEndDate) && ' Custom Range (Please select dates)'}
            </span>
          </div>
        </div>
        
        {/* Welcome Section */}
        

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.title === 'Failed Deliveries' 
                    ? (stat.trend === 'down' ? 'text-green-600' : 'text-red-600')
                    : (stat.trend === 'up' ? 'text-green-600' : 'text-red-600')
                }`}>
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
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Key Logistics Metrics</h3>
                <div className="text-xs text-gray-500">Real-time data</div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topProducts.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{metric.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900">{metric.name}</p>
                        <p className="text-sm text-gray-500">{metric.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{metric.value}</p>
                      <p className={`text-sm font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend}
                      </p>
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
                    dataKey="delivered" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                    name="Delivered Parcels"
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
                    name="Revenue (₱)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="delivered" 
                    stackId="2" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                    name="Delivered Parcels"
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
              <h3 className="text-lg font-semibold text-gray-900">Hub Performance Analytics</h3>
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
                <Bar dataKey="visits" fill="#e5e7eb" name="Total Processed" />
                <Bar dataKey="conversions" fill="#10b981" name="Successful Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
