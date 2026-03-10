import React, { useState, useEffect } from 'react';
import { useFlightStore } from '../store/flightStore';
import { getCountries } from '../services/flightService';

interface FilterControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ isOpen, onClose }) => {
  const { 
    flights, 
    filters, 
    updateFilters, 
    updateSettings, 
    filteredFlights 
  } = useFlightStore();
  
  const [countries, setCountries] = useState<string[]>([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (isOpen) {
      getCountries().then(setCountries).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleNestedFilterChange = (parent: string, key: string, value: any) => {
    const newFilters = {
      ...localFilters,
      [parent]: {
        ...localFilters[parent as keyof typeof localFilters],
        [key]: value
      }
    };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      country: '',
      altitude: { min: 0, max: 50000 },
      velocity: { min: 0, max: 1000 },
      search: '',
    };
    setLocalFilters(defaultFilters);
    updateFilters(defaultFilters);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed left-4 top-4 w-80 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 text-white z-50 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-blue-400">Filters & Controls</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Flight Statistics */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2">
            Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Flights:</span>
              <p className="text-white font-semibold">{flights.size}</p>
            </div>
            <div>
              <span className="text-gray-400">Filtered:</span>
              <p className="text-white font-semibold">{filteredFlights.length}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-yellow-400 border-b border-gray-700 pb-2">
            Search
          </h3>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Callsign or Country
            </label>
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="e.g., DAL, United States"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Country Filter */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-400 border-b border-gray-700 pb-2">
            Country
          </h3>
          <div>
            <select
              value={localFilters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Altitude Range */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-400 border-b border-gray-700 pb-2">
            Altitude (meters)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min</label>
              <input
                type="number"
                value={localFilters.altitude.min}
                onChange={(e) => handleNestedFilterChange('altitude', 'min', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max</label>
              <input
                type="number"
                value={localFilters.altitude.max}
                onChange={(e) => handleNestedFilterChange('altitude', 'max', parseInt(e.target.value) || 50000)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="50000"
            step="1000"
            value={localFilters.altitude.max}
            onChange={(e) => handleNestedFilterChange('altitude', 'max', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Velocity Range */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-700 pb-2">
            Velocity (km/h)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min</label>
              <input
                type="number"
                value={localFilters.velocity.min}
                onChange={(e) => handleNestedFilterChange('velocity', 'min', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max</label>
              <input
                type="number"
                value={localFilters.velocity.max}
                onChange={(e) => handleNestedFilterChange('velocity', 'max', parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={localFilters.velocity.max}
            onChange={(e) => handleNestedFilterChange('velocity', 'max', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={resetFilters}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;