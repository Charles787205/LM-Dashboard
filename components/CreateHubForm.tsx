'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateHubForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    hub_cost_per_parcel: {
      '2W': 0,
      '3W': 0,
      '4W': 0
    },
    hub_profit_per_parcel: {
      '2W': 0,
      '3W': 0,
      '4W': 0
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCostChange = (type: '2W' | '3W' | '4W', field: 'cost' | 'profit', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field === 'cost' ? 'hub_cost_per_parcel' : 'hub_profit_per_parcel']: {
        ...prev[field === 'cost' ? 'hub_cost_per_parcel' : 'hub_profit_per_parcel'],
        [type]: numValue
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/hubs');
        router.refresh();
      } else {
        setError(result.error || 'Failed to create hub');
      }
    } catch (err) {
      setError('An error occurred while creating the hub');
      console.error('Error creating hub:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/hubs')}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Hubs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Hub</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Hub Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hub name"
                />
              </div>

              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a client</option>
                  <option value="LEX">LEX</option>
                  <option value="2GO">2GO</option>
                  <option value="SPX">SPX</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Per Parcel</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['2W', '3W', '4W'].map((type) => (
                    <div key={type}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {type} Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.hub_cost_per_parcel[type as '2W' | '3W' | '4W']}
                        onChange={(e) => handleCostChange(type as '2W' | '3W' | '4W', 'cost', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profit Per Parcel</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['2W', '3W', '4W'].map((type) => (
                    <div key={type}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {type} Profit
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.hub_profit_per_parcel[type as '2W' | '3W' | '4W']}
                        onChange={(e) => handleCostChange(type as '2W' | '3W' | '4W', 'profit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    
  );
}
