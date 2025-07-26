'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Mail } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email address is not authorized to access this system.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Mail className="h-5 w-5" />
            <span className="text-sm">Contact your administrator</span>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>To gain access to Int Tracker, please contact your system administrator to have your email address added to the authorized users list.</p>
          </div>
          
          <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
            <p><strong>Administrator:</strong> Please add this user's email to the database through the Users Management section.</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
          
          <p className="text-xs text-gray-500">
            Having trouble? Contact support at{' '}
            <a href="mailto:support@inttracker.com" className="text-blue-600 hover:text-blue-500">
              support@inttracker.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
