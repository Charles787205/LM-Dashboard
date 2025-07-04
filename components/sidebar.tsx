'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHubs } from '@/hooks/useHubs';
import {
  Home,
  BarChart3,
  Users,
  Settings,
  FileText,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  HelpCircle,
  LogOut,
  Building2,
  MapPin,
  X
} from 'lucide-react';

interface Hub {
  _id: string;
  name: string;
  client: 'LEX' | '2GO' | 'SPX';
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [hubsExpanded, setHubsExpanded] = useState(true);
  const [showAddHubModal, setShowAddHubModal] = useState(false);
  const { hubs, loading, refreshHubs } = useHubs();
  const [hubForm, setHubForm] = useState({
    name: '',
    client: '',
    hub_cost_per_parcel: {
      '2W': '',
      '3W': '',
      '4W': ''
    },
    hub_profit_per_parcel: {
      '2W': '',
      '3W': '',
      '4W': ''
    }
  });

  // Function to get color based on client
  const getClientColor = (client: string) => {
    switch (client) {
      case 'LEX': return 'bg-blue-500';
      case '2GO': return 'bg-green-500';
      case 'SPX': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/',
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      badge: null
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      href: '/users',
      badge: '2.3k'
    },
    {
      id: 'reports',
      label: 'All Reports',
      icon: FileText,
      href: '/reports',
      badge: null
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      href: '/calendar',
      badge: null
    }
  ];

  const bottomItems = [
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      href: '/help',
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      badge: null
    }
  ];

  const handleItemClick = (itemId: string) => {
    // Navigation is handled by Link components
  };

  const handleAddHub = () => {
    setShowAddHubModal(true);
  };

  const handleCloseModal = () => {
    setShowAddHubModal(false);
    setHubForm({
      name: '',
      client: '',
      hub_cost_per_parcel: {
        '2W': '',
        '3W': '',
        '4W': ''
      },
      hub_profit_per_parcel: {
        '2W': '',
        '3W': '',
        '4W': ''
      }
    });
  };

  const handleFormChange = (field: string, value: string) => {
    if (field.startsWith('hub_cost_per_parcel.') || field.startsWith('hub_profit_per_parcel.')) {
      const [section, vehicleType] = field.split('.');
      setHubForm(prev => ({
        ...prev,
        [section]: {
          ...((prev as any)[section]),
          [vehicleType]: value
        }
      }));
    } else {
      setHubForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/hubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hubForm),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the hubs list
        await refreshHubs();
        
        alert('Hub added successfully!');
        handleCloseModal();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating hub:', error);
      alert('Failed to create hub. Please try again.');
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">IntTracker</h1>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Main Menu
            </h3>
          )}
          
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </div>
              {!isCollapsed && item.badge && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  item.badge === 'NEW' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Hubs Section */}
        {!isCollapsed && (
          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Hubs
              </h3>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleAddHub}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                  title="Add Hub"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setHubsExpanded(!hubsExpanded)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {hubsExpanded ? (
                    <ChevronUp className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            {hubsExpanded && (
              <div className="space-y-1">
                {loading ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading hubs...</div>
                ) : hubs.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No hubs found</div>
                ) : (
                  hubs.map((hub) => (
                    <Link
                      key={hub._id}
                      href={`/hubs/${hub._id}`}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                        pathname.startsWith(`/hubs/${hub._id}`)
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getClientColor(hub.client)}`}></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{hub.name}</span>
                          <span className="text-xs text-gray-500">{hub.client}</span>
                        </div>
                      </div>
                      <MapPin className={`w-4 h-4 ${pathname.startsWith(`/hubs/${hub._id}`) ? 'text-blue-600' : 'text-gray-400'}`} />
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4">
            <button 
              onClick={handleAddHub}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-medium">New Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`} />
            {!isCollapsed && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
          </Link>
        ))}
        
        {/* User Profile */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 mt-4 bg-gray-50 rounded-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JD
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">john@example.com</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="p-1 rounded-md hover:bg-gray-200 transition-colors">
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Add Hub Modal */}
      {showAddHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add New Hub</h2>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <form onSubmit={handleSubmitHub} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hub Name
                  </label>
                  <input
                    type="text"
                    value={hubForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <select
                    value={hubForm.client}
                    onChange={(e) => handleFormChange('client', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    required
                  >
                    <option value="">Select Client</option>
                    <option value="LEX">LEX</option>
                    <option value="2GO">2GO</option>
                    <option value="SPX">SPX</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      2W Cost
                    </label>
                    <input
                      type="number"
                      value={hubForm.hub_cost_per_parcel['2W']}
                      onChange={(e) => handleFormChange('hub_cost_per_parcel.2W', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      3W Cost
                    </label>
                    <input
                      type="number"
                      value={hubForm.hub_cost_per_parcel['3W']}
                      onChange={(e) => handleFormChange('hub_cost_per_parcel.3W', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      4W Cost
                    </label>
                    <input
                      type="number"
                      value={hubForm.hub_cost_per_parcel['4W']}
                      onChange={(e) => handleFormChange('hub_cost_per_parcel.4W', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      2W Profit
                    </label>
                    <input
                      type="number"
                      value={hubForm.hub_profit_per_parcel['2W']}
                      onChange={(e) => handleFormChange('hub_profit_per_parcel.2W', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      3W Profit
                    </label>
                    <input
                      type="number"
                      value={hubForm.hub_profit_per_parcel['3W']}
                      onChange={(e) => handleFormChange('hub_profit_per_parcel.3W', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      4W Profit
                    </label>
                    <input
                      type="number"
                      value={hubForm.hub_profit_per_parcel['4W']}
                      onChange={(e) => handleFormChange('hub_profit_per_parcel.4W', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Add Hub
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
