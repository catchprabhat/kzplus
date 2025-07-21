import React, { useState } from 'react';
import { apiService } from '../services/api';

interface VehicleFinderProps {
  onVehicleFound: (data: any) => void;
  onNewCustomer: () => void;
}

export const VehicleFinder: React.FC<VehicleFinderProps> = ({
  onVehicleFound,
  onNewCustomer
}) => {
  const [searchType, setSearchType] = useState<'vehicle' | 'phone'>('vehicle');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (searchType === 'vehicle') {
        result = await apiService.searchVehicleByNumber(searchValue.trim().toUpperCase());
      } else {
        result = await apiService.searchUserByPhone(searchValue.trim());
      }

      if (result) {
        onVehicleFound(result);
      } else {
        setError('No records found. Please register as a new customer.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">🔍 Find Your Vehicle</h2>
      
      {/* Search Type Toggle */}
      <div className="flex mb-4">
        <button
          onClick={() => setSearchType('vehicle')}
          className={`flex-1 py-2 px-4 rounded-l-lg ${
            searchType === 'vehicle'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          🚗 Vehicle Number
        </button>
        <button
          onClick={() => setSearchType('phone')}
          className={`flex-1 py-2 px-4 rounded-r-lg ${
            searchType === 'phone'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📞 Phone Number
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={
            searchType === 'vehicle'
              ? 'Enter vehicle number (e.g., ABC123)'
              : 'Enter phone number'
          }
          className="w-full border rounded px-3 py-2"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Searching...' : '🔍 Search'}
      </button>

      {/* New Customer Button */}
      <button
        onClick={onNewCustomer}
        className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        👤 New Customer? Register Here
      </button>
    </div>
  );
};