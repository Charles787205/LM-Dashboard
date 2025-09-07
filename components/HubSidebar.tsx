'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HubSidebarProps {
  currentPath?: string;
  hubId?: string;
}

export default function HubSidebar({ currentPath = '', hubId }: HubSidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm transition-all duration-300 flex-shrink-0`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800">Hub Navigation</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <nav className="space-y-2">
          <Link
            href="/(lastmile)/hubs"
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              isActive('/(lastmile)/hubs') 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {!sidebarCollapsed && <span>All Hubs</span>}
          </Link>
          
          <Link
            href="/hubs/create"
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              isActive('/hubs/create') 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!sidebarCollapsed && <span>Create Hub</span>}
          </Link>

          {/* Hub-specific navigation (only show when hubId is provided) */}
          {hubId && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                {!sidebarCollapsed && (
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Current Hub
                  </p>
                )}
              </div>
              
              <Link
                href={`/hubs/${hubId}`}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive(`/hubs/${hubId}`) 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {!sidebarCollapsed && <span>Hub Details</span>}
              </Link>
              
              <Link
                href={`/hubs/${hubId}/reports`}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive(`/hubs/${hubId}/reports`) 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {!sidebarCollapsed && <span>Reports</span>}
              </Link>
              
              <Link
                href={`/hubs/${hubId}/reports/add`}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive(`/hubs/${hubId}/reports/add`) 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {!sidebarCollapsed && <span>Add Report</span>}
              </Link>
            </>
          )}
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <Link
              href="/(lastmile)/analytics"
              className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!sidebarCollapsed && <span>Analytics</span>}
            </Link>

            <Link
              href="/(lastmile)/reports"
              className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!sidebarCollapsed && <span>All Reports</span>}
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
