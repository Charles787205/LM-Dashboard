'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Truck, 
  Calendar, 
  CheckCircle, 
  Route,
  ChevronDown,
  ChevronRight,
  Home,
  BarChart3,
  Users,
  Settings,
  MapPin,
  Building2
} from 'lucide-react';

interface TransportSidebarProps {
  className?: string;
}

const TransportSidebar: React.FC<TransportSidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const [isTransportExpanded, setIsTransportExpanded] = useState(true);

  const isActive = (path: string) => pathname === path;

  const transportMenuItems = [
    {
      label: 'Actual',
      href: '/transport/actual',
      icon: CheckCircle,
      description: 'View actual transport data'
    },
    {
      label: 'Planned',
      href: '/transport/planned', 
      icon: Calendar,
      description: 'View planned transport schedules'
    },
    {
      label: 'Linehauls',
      href: '/transport/linehauls',
      icon: Route,
      description: 'Manage linehaul operations'
    },
    {
      label: 'Locations',
      href: '/transport/location',
      icon: MapPin,
      description: 'Manage transport locations'
    },
    {
      label: 'Vendors',
      href: '/transport/vendors',
      icon: Building2,
      description: 'Manage transport service vendors'
    }
  ];

  const generalMenuItems = [
    {
      label: 'Dashboard Overview',
      href: '/transport',
      icon: Home,
      description: 'Transport dashboard overview'
    },
    {
      label: 'Analytics',
      href: '/transport/analytics',
      icon: BarChart3,
      description: 'Transport analytics and reports'
    },
    {
      label: 'Users',
      href: '/lastmile/users',
      icon: Users,
      description: 'User management'
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 ${className}`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Transport Dashboard</h2>
        </div>

        {/* Dashboard Selection Link */}
        <div className="mb-6">
          <Link 
            href="/dashboard-select"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Settings className="h-4 w-4" />
            Switch Dashboard
          </Link>
        </div>

        <nav className="space-y-1">
          {/* General Menu Items */}
          <div className="mb-4">
            {generalMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Transport Operations Section */}
          <div className="border-t pt-4">
            <button
              onClick={() => setIsTransportExpanded(!isTransportExpanded)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Transport Operations</span>
              </div>
              {isTransportExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {isTransportExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {transportMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={item.description}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Transport Management System
        </p>
      </div>
    </div>
  );
};

export default TransportSidebar;
