import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ hubId: string }>;
}

async function getHub(hubId: string) {
  try {
    await connectToDatabase();
    const hub = await Hub.findById(hubId).lean();
    return hub ? JSON.parse(JSON.stringify(hub)) : null;
  } catch (error) {
    console.error('Error fetching hub:', error);
    return null;
  }
}

export default async function HubDetailPage({ params }: Props) {
  const { hubId } = await params;
  const hub = await getHub(hubId);

  if (!hub) {
    notFound();
  }

  const actions = (
    <div className="flex space-x-3">
      <Link
        href={`/hubs/${hub._id}/edit`}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Edit Hub
      </Link>
      <Link
        href={`/hubs/${hub._id}/reports`}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
      >
        View Reports
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link 
            href="/hubs" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Hubs
          </Link>
        </div>

        {/* Hub Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{hub.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              hub.client === 'LEX' ? 'bg-blue-100 text-blue-800' :
              hub.client === '2GO' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {hub.client}
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cost per Parcel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cost per Parcel</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">2-Wheeler</span>
                  <span className="text-lg font-semibold text-gray-900">₱{hub.hub_cost_per_parcel['2W']}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">3-Wheeler</span>
                  <span className="text-lg font-semibold text-gray-900">₱{hub.hub_cost_per_parcel['3W']}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">4-Wheeler</span>
                  <span className="text-lg font-semibold text-gray-900">₱{hub.hub_cost_per_parcel['4W']}</span>
                </div>
              </div>
            </div>

            {/* Profit per Parcel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Profit per Parcel</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium text-gray-700">2-Wheeler</span>
                  <span className="text-lg font-semibold text-green-600">₱{hub.hub_profit_per_parcel['2W']}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium text-gray-700">3-Wheeler</span>
                  <span className="text-lg font-semibold text-green-600">₱{hub.hub_profit_per_parcel['3W']}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium text-gray-700">4-Wheeler</span>
                  <span className="text-lg font-semibold text-green-600">₱{hub.hub_profit_per_parcel['4W']}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Cost Range</h3>
            <div className="text-2xl font-bold text-gray-900">
              ₱{Math.min(hub.hub_cost_per_parcel['2W'], hub.hub_cost_per_parcel['3W'], hub.hub_cost_per_parcel['4W'])} - 
              ₱{Math.max(hub.hub_cost_per_parcel['2W'], hub.hub_cost_per_parcel['3W'], hub.hub_cost_per_parcel['4W'])}
            </div>
            <p className="text-gray-600 text-sm">Per parcel cost range</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Profit Range</h3>
            <div className="text-2xl font-bold text-green-600">
              ₱{Math.min(hub.hub_profit_per_parcel['2W'], hub.hub_profit_per_parcel['3W'], hub.hub_profit_per_parcel['4W'])} - 
              ₱{Math.max(hub.hub_profit_per_parcel['2W'], hub.hub_profit_per_parcel['3W'], hub.hub_profit_per_parcel['4W'])}
            </div>
            <p className="text-gray-600 text-sm">Per parcel profit range</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hub ID</h3>
            <div className="text-lg font-mono text-gray-600 break-all">
              {hub._id}
            </div>
            <p className="text-gray-600 text-sm">Database identifier</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={`/hubs/${hub._id}/reports`}
              className="bg-blue-100 text-blue-700 px-4 py-3 rounded-md hover:bg-blue-200 transition-colors text-center"
            >
              View Reports
            </Link>
            <Link
              href={`/hubs/${hub._id}/reports/add`}
              className="bg-green-100 text-green-700 px-4 py-3 rounded-md hover:bg-green-200 transition-colors text-center"
            >
              Add Report
            </Link>
            <Link
              href={`/hubs/${hub._id}/edit`}
              className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-md hover:bg-yellow-200 transition-colors text-center"
            >
              Edit Hub
            </Link>
            <Link
              href={`/analytics`}
              className="bg-purple-100 text-purple-700 px-4 py-3 rounded-md hover:bg-purple-200 transition-colors text-center"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
