'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, RefreshCw, Play } from 'lucide-react';

interface MigrationStatus {
  needsMigration: boolean;
  totalNeedingMigration: number;
  details: {
    hubsNeedingMigration: number;
    reportsNeedingMigration: number;
    attendanceNeedingMigration: number;
    failedDeliveriesNeedingMigration: number;
    financialsNeedingMigration: number;
    hubCostsNeedingMigration: number;
  };
}

interface MigrationResults {
  hubs: number;
  reports: number;
  reportsWithDate: number;
  attendance: number;
  failedDeliveries: number;
  financials: number;
  hubCosts: number;
  hubCostsWithDate: number;
}

export default function MigrationPage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<MigrationResults | null>(null);
  const [error, setError] = useState('');

  const checkMigrationStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/admin/migrate-timestamps');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
      } else {
        setError(data.error || 'Failed to check migration status');
      }
    } catch (err) {
      setError('Network error while checking migration status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setMigrating(true);
    setError('');
    setResults(null);
    
    try {
      const response = await fetch('/api/v1/admin/migrate-timestamps', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        // Refresh status after migration
        setTimeout(checkMigrationStatus, 1000);
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch (err) {
      setError('Network error during migration');
      console.error(err);
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Database Migration</h1>
                <p className="text-gray-600">Add timestamps to existing records</p>
              </div>
            </div>
            <button
              onClick={checkMigrationStatus}
              disabled={loading}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Migration Status */}
        {status && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Migration Status</h2>
            
            {status.needsMigration ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    Migration needed: {status.totalNeedingMigration} records require timestamps
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    All records have timestamps - no migration needed
                  </span>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hubs</div>
                <div className="text-lg font-semibold text-gray-900">
                  {status.details.hubsNeedingMigration}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Reports</div>
                <div className="text-lg font-semibold text-gray-900">
                  {status.details.reportsNeedingMigration}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Attendance</div>
                <div className="text-lg font-semibold text-gray-900">
                  {status.details.attendanceNeedingMigration}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Failed Deliveries</div>
                <div className="text-lg font-semibold text-gray-900">
                  {status.details.failedDeliveriesNeedingMigration}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Financials</div>
                <div className="text-lg font-semibold text-gray-900">
                  {status.details.financialsNeedingMigration}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hub Costs</div>
                <div className="text-lg font-semibold text-gray-900">
                  {status.details.hubCostsNeedingMigration}
                </div>
              </div>
            </div>

            {/* Migration Button */}
            {status.needsMigration && (
              <div className="mt-6">
                <button
                  onClick={runMigration}
                  disabled={migrating}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {migrating ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {migrating ? 'Running Migration...' : 'Run Migration'}
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  This will add createdAt and updatedAt timestamps to existing records.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Migration Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Migration Results</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Migration completed successfully!</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hubs Updated</div>
                <div className="text-lg font-semibold text-gray-900">{results.hubs}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Reports Updated</div>
                <div className="text-lg font-semibold text-gray-900">{results.reports}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Reports (Date-based)</div>
                <div className="text-lg font-semibold text-gray-900">{results.reportsWithDate}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Attendance Updated</div>
                <div className="text-lg font-semibold text-gray-900">{results.attendance}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Failed Deliveries</div>
                <div className="text-lg font-semibold text-gray-900">{results.failedDeliveries}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Financials Updated</div>
                <div className="text-lg font-semibold text-gray-900">{results.financials}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hub Costs Updated</div>
                <div className="text-lg font-semibold text-gray-900">{results.hubCosts}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hub Costs (Date-based)</div>
                <div className="text-lg font-semibold text-gray-900">{results.hubCostsWithDate}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About This Migration</h3>
          <div className="text-blue-800 space-y-2">
            <p>
              This migration adds <code className="bg-blue-100 px-1 rounded">createdAt</code> and{' '}
              <code className="bg-blue-100 px-1 rounded">updatedAt</code> timestamps to existing database records.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>For most records, both timestamps will be set to the current time</li>
              <li>For reports, <code className="bg-blue-100 px-1 rounded">createdAt</code> will use the existing report date</li>
              <li>For hub costs, <code className="bg-blue-100 px-1 rounded">createdAt</code> will use the existing date field if available</li>
              <li>This migration is safe to run multiple times - it only affects records without timestamps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
