import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';
import HubSidebar from '@/components/HubSidebar';

async function getHubs() {
  try {
    await connectToDatabase();
    const hubs = await Hub.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(hubs));
  } catch (error) {
    console.error('Error fetching hubs:', error);
    return [];
  }
}

export default async function HubsPage() {
  const hubs = await getHubs();

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
            <Link
              href="/hubs/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Create New Hub
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {hubs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hubs found</h3>
              <p className="text-gray-500 mb-6">Create your first hub to get started</p>
              <Link
                href="/hubs/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Hub
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hubs.map((hub: any) => (
                <div key={hub._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{hub.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      hub.client === 'LEX' ? 'bg-blue-100 text-blue-800' :
                      hub.client === '2GO' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {hub.client}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Cost per Parcel</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-600">2W</div>
                          <div className="text-gray-900">₱{hub.hub_cost_per_parcel['2W']}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">3W</div>
                          <div className="text-gray-900">₱{hub.hub_cost_per_parcel['3W']}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">4W</div>
                          <div className="text-gray-900">₱{hub.hub_cost_per_parcel['4W']}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Profit per Parcel</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-600">2W</div>
                          <div className="text-green-600">₱{hub.hub_profit_per_parcel['2W']}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">3W</div>
                          <div className="text-green-600">₱{hub.hub_profit_per_parcel['3W']}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">4W</div>
                          <div className="text-green-600">₱{hub.hub_profit_per_parcel['4W']}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Link
                        href={`/hubs/${hub._id}`}
                        className="flex-1 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/hubs/${hub._id}/edit`}
                        className="flex-1 text-center bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
