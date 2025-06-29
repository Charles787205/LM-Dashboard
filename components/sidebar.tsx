'use client';

import { useState } from 'react';
import {
  Home,
  BarChart3,
  Users,
  Settings,
  FileText,
  Calendar,
  Mail,
  Bell,
  Folder,
  PieChart,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');

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
      label: 'Reports',
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
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: Mail,
      href: '/messages',
      badge: '12'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      badge: '5'
    }
  ];

  const secondaryItems = [
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      href: '/projects',
      badge: null
    },
    {
      id: 'charts',
      label: 'Charts',
      icon: PieChart,
      href: '/charts',
      badge: null
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: TrendingUp,
      href: '/trends',
      badge: 'NEW'
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: DollarSign,
      href: '/revenue',
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
    setActiveItem(itemId);
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
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                activeItem === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${activeItem === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
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
            </button>
          ))}
        </div>

        {/* Secondary Navigation */}
        <div className="p-4 space-y-1">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Analytics
            </h3>
          )}
          
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                activeItem === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${activeItem === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
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
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4">
            <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-medium">New Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4 space-y-1">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
              activeItem === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeItem === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
            {!isCollapsed && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
          </button>
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
    </div>
  );
}
