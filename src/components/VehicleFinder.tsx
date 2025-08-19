import React, { useState, useEffect } from 'react';
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

  // Initialize phone input with +91 when switching to phone search type
  useEffect(() => {
    if (searchType === 'phone') {
      setSearchValue('+91');
    } else {
      setSearchValue('');
    }
  }, [searchType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (searchType === 'phone') {
      // For phone input, we need to handle the prefix specially
      if (value === '') {
        // If user clears the field, reset to just the prefix
        setSearchValue('+91');
        return;
      }
      
      // If user is typing directly, ensure the prefix is maintained
      if (!value.startsWith('+91')) {
        // If they're typing a number without the prefix, add it
        const digitsOnly = value.replace(/\D/g, '');
        setSearchValue('+91' + digitsOnly);
        return;
      }
      
      // Limit to +91 + 10 digits (total 13 characters)
      if (value.length > 13) {
        setSearchValue(value.slice(0, 13));
        return;
      }
      
      // Only allow numbers after +91
      const phoneDigits = value.slice(3);
      if (phoneDigits && !/^\d*$/.test(phoneDigits)) {
        return; // Don't update if non-numeric characters after +91
      }
    }
    
    setSearchValue(value);
  };

  const handleSearch = async () => {
    if (!searchValue.trim() || (searchType === 'phone' && searchValue === '+91')) {
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
        // For phone search, ensure the +91 prefix is present
        let phoneNumber = searchValue.trim();
        if (!phoneNumber.startsWith('+91')) {
          phoneNumber = '+91' + phoneNumber;
        }
        result = await apiService.searchUserByPhone(phoneNumber);
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

  // Prevent backspace from deleting the +91 prefix
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchType === 'phone' && e.key === 'Backspace' && searchValue.length <= 3) {
      e.preventDefault();
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
      <div className="mb-4 relative">
        {searchType === 'phone' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 font-bold text-gray-700">
            +91
          </div>
        )}
        <input
          type="text"
          value={searchType === 'phone' ? searchValue.substring(3) : searchValue}
          onChange={(e) => {
            if (searchType === 'phone') {
              // When in phone mode, prepend +91 to whatever the user types
              setSearchValue('+91' + e.target.value.replace(/\D/g, ''));
            } else {
              setSearchValue(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={searchType === 'vehicle' ? 'Enter vehicle number (e.g., ABC123)' : 'Enter 10-digit number'}
          className={`w-full border rounded px-3 py-2 ${searchType === 'phone' ? 'pl-10' : ''}`}
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