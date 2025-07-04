'use client';

import Link from 'next/link';
import HubSidebar from '@/components/HubSidebar';
import { useHubs } from '@/hooks/useHubs';

export default function HubsPageClient() {
  const { hubs, loading, error, refreshHubs } = useHubs();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <HubSidebar currentPath="/hubs" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hubs</h1>
                <p className="text-gray-600 mt-1">Manage your delivery hubs</p>
              </div>
              <Link
                href="/hubs/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Create New Hub
              </Link>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Hubs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => refreshHubs()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <HubSidebar currentPath="/hubs" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hubs</h1>
              <p className="text-gray-600 mt-1">Manage your delivery hubs</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refreshHubs()}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link
                href="/hubs/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Create New Hub
              </Link>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {loading && hubs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Hubs</h3>
              <p className="text-gray-600">Please wait while we fetch your hubs...</p>
            </div>
          ) : hubs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Hubs Found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first hub.</p>
              <Link
                href="/hubs/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Hub
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hubs.map((hub: any) => (
                <Link
                  key={hub._id}
                  href={`/hubs/${hub._id}`}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          hub.client === 'LEX' ? 'bg-blue-500' :
                          hub.client === '2GO' ? 'bg-green-500' :
                          hub.client === 'SPX' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-600">{hub.client}</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {hub.name}
                    </h3>
                    
                    <div className="text-sm text-gray-600">
                      <p>Hub ID: {hub._id.slice(-6)}</p>
                      <p className="mt-1">Created: {new Date(hub.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">View Details</span>
                      <span className="text-blue-600 font-medium">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {loading && hubs.length > 0 && (
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">Refreshing hubs...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
