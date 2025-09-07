'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTransport } from '@/hooks/useTransport';
import { 
  Truck, 
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
  RefreshCw,
  CalendarIcon,
  MessageCircle,
  MapPin,
  Clock,
  Fuel,
  Package
} from 'lucide-react';

export default function TransportDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'yesterday' | 'daily' | 'weekly' | '15days' | 'monthly' | 'custom'>('weekly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Prepare filters for useTransport hook
  const transportFilters = {
    period: selectedPeriod,
    ...(selectedPeriod === 'custom' && customStartDate && customEndDate && {
      startDate: customStartDate,
      endDate: customEndDate
    })
  };
  
  const { data: transportData, loading: transportLoading, error: transportError, refetch } = useTransport(transportFilters);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const handleRefresh = () => {
    refetch();
  };

  // Transport stats
  const transportStats = [
    {
      id: 'active-vehicles',
      label: 'Active Vehicles',
      value: transportData?.stats?.activeVehicles || 45,
      change: '+2.5%',
      isPositive: true,
      icon: Truck,
      color: 'blue'
    },
    {
      id: 'total-distance',
      label: 'Total Distance',
      value: `${(transportData?.stats?.totalDistance || 28450)}km`,
      change: '+5.1%',
      isPositive: true,
      icon: MapPin,
      color: 'green'
    },
    {
      id: 'total-deliveries',
      label: 'Total Deliveries',
      value: transportData?.stats?.totalDeliveries || 1247,
      change: '+12.3%',
      isPositive: true,
      icon: Package,
      color: 'purple'
    },
    {
      id: 'avg-efficiency',
      label: 'Avg Efficiency',
      value: `${transportData?.stats?.averageEfficiency || 94.2}%`,
      change: '-1.2%',
      isPositive: false,
      icon: Clock,
      color: 'orange'
    },
    {
      id: 'total-cost',
      label: 'Total Cost',
      value: `₱${(transportData?.stats?.totalCost || 487500).toLocaleString()}`,
      change: '-3.8%',
      isPositive: true,
      icon: DollarSign,
      color: 'red'
    }
  ];

  // Loading state
  if (transportLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transport dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (transportError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load transport data</h2>
          <p className="text-gray-600 mb-4">{transportError}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Transport Dashboard</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vehicles, routes..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-600" />
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as 'yesterday' | 'daily' | 'weekly' | '15days' | 'monthly' | 'custom')}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            <option value="daily">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="weekly">Last 7 Days</option>
            <option value="15days">Last 15 Days</option>
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
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {transportStats.map((stat, index) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Key Transport Metrics</h3>
          <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {transportData?.stats?.averageEfficiency || 8.4}L/100km
            </div>
            <div className="text-sm text-gray-600">Average Fuel Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2.3h</div>
            <div className="text-sm text-gray-600">Average Delivery Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {(transportData?.stats?.totalDistance || 12584).toLocaleString()}km
            </div>
            <div className="text-sm text-gray-600">Total Distance Covered</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Daily Transport Trends</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2" />
                <p>Chart will be displayed here</p>
                <p className="text-sm">Integration with real data needed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Fleet Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Vehicles</span>
                <span className="text-sm font-medium text-green-600">
                  {transportData?.stats?.activeVehicles || 28}/{(transportData?.stats?.activeVehicles || 28) + (transportData?.stats?.maintenanceVehicles || 5) + (transportData?.stats?.idleVehicles || 12)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((transportData?.stats?.activeVehicles || 28) / 45) * 100}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Maintenance</span>
                <span className="text-sm font-medium text-yellow-600">
                  {transportData?.stats?.maintenanceVehicles || 5}/{(transportData?.stats?.activeVehicles || 28) + (transportData?.stats?.maintenanceVehicles || 5) + (transportData?.stats?.idleVehicles || 12)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${((transportData?.stats?.maintenanceVehicles || 5) / 45) * 100}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Idle/Available</span>
                <span className="text-sm font-medium text-blue-600">
                  {transportData?.stats?.idleVehicles || 12}/{(transportData?.stats?.activeVehicles || 28) + (transportData?.stats?.maintenanceVehicles || 5) + (transportData?.stats?.idleVehicles || 12)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((transportData?.stats?.idleVehicles || 12) / 45) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Route A1 completed</p>
                <p className="text-xs text-gray-500">15 deliveries • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Vehicle TRK-003 delayed</p>
                <p className="text-xs text-gray-500">Route C1 • 30 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New linehaul scheduled</p>
                <p className="text-xs text-gray-500">LH-005 • 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Vehicle maintenance due</p>
                  <p className="text-xs text-red-600">TRK-007 needs service in 2 days</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">Route optimization suggested</p>
                  <p className="text-xs text-yellow-600">Route B2 can be improved by 12%</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">New driver training available</p>
                  <p className="text-xs text-blue-600">Advanced safety course starts Monday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
