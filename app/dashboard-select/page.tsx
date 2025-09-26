'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  BarChart3,
  ChevronRight,
  Warehouse
} from 'lucide-react';

export default function DashboardSelect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('Dashboard-select useEffect - Status:', status, 'Session:', !!session);
    
    if (status === 'loading') return; // Still loading
    
    
    
    console.log('User authenticated successfully:', session?.user?.email);
  }, [session, status, router]);

  const handleDashboardSelect = async (dashboardType: 'lastmile' | 'transport') => {
    setLoading(true);
    
    try {
      // You can store the user's preference in localStorage or send to API
      localStorage.setItem('selectedDashboard', dashboardType);
      
      // Redirect to the selected dashboard
      if (dashboardType === 'lastmile') {
        router.push('/'); // Current lastmile dashboard
      } else {
        router.push('/transport'); // New transport dashboard
      }
    } catch (error) {
      console.error('Error selecting dashboard:', error);
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {session.user?.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Choose your dashboard to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Last Mile Dashboard */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Last Mile Dashboard
              </h3>
              
              <p className="text-gray-600 mb-6">
                Track and manage last-mile delivery operations, including parcel processing, 
                delivery status, hub performance, and delivery analytics.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 text-green-500 mr-3" />
                  <span>Parcel tracking and delivery status</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Warehouse className="w-5 h-5 text-green-500 mr-3" />
                  <span>Hub performance monitoring</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <BarChart3 className="w-5 h-5 text-green-500 mr-3" />
                  <span>Delivery analytics and metrics</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleDashboardSelect('lastmile')}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Access Last Mile Dashboard
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transport Dashboard */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Transport Dashboard
              </h3>
              
              <p className="text-gray-600 mb-6">
                Monitor and analyze transport operations, fleet management, 
                route optimization, and transportation logistics across your network.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <Truck className="w-5 h-5 text-blue-500 mr-3" />
                  <span>Fleet management and tracking</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-500 mr-3" />
                  <span>Route optimization analytics</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <BarChart3 className="w-5 h-5 text-blue-500 mr-3" />
                  <span>Transport performance metrics</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleDashboardSelect('transport')}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Access Transport Dashboard
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            You can switch between dashboards at any time from the navigation menu
          </p>
        </div>
      </div>
    </div>
  );
}
