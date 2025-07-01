import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';

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

  const actions = (
    <Link
      href="/hubs/create"
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
    >
      Create New Hub
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">

        {hubs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-4">No hubs found</p>
            <p className="text-gray-400 text-sm mb-6">Create your first hub to get started</p>
            <Link
              href="/hubs/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
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
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
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
  );
}
