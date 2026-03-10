import React, { useState, useEffect } from 'react';
import { useFlightStore } from '../store/flightStore';
import { getCountries } from '../services/flightService';

interface FlightInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({ isOpen, onClose }) => {
  const { selectedFlight, flights } = useFlightStore();
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      getCountries().then(setCountries).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !selectedFlight) {
    return null;
  }

  const { flightData, position } = selectedFlight;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAltitude = (altitude: number | null) => {
    if (altitude === null) return 'N/A';
    return `${Math.round(altitude)} m (${Math.round(altitude / 1000)} km)`;
  };

  const formatVelocity = (velocity: number | null) => {
    if (velocity === null) return 'N/A';
    return `${Math.round(velocity)} km/h (${Math.round(velocity / 1.852)} knots)`;
  };

  return (
    <div className="fixed right-4 top-4 w-80 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 text-white z-50 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-blue-400">Flight Information</h2>
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
        {/* Flight Identification */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2">
            Flight Identification
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Callsign:</span>
              <p className="font-mono text-white">{flightData.callsign || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400">ICAO24:</span>
              <p className="font-mono text-white">{flightData.icao24}</p>
            </div>
            <div>
              <span className="text-gray-400">Country:</span>
              <p className="text-white">{flightData.origin_country}</p>
            </div>
            <div>
              <span className="text-gray-400">Squawk:</span>
              <p className="font-mono text-white">{flightData.squawk || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Position & Movement */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-yellow-400 border-b border-gray-700 pb-2">
            Position & Movement
          </h3>
          
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Latitude:</span>
              <p className="font-mono text-white">
                {position.latitude?.toFixed(6) || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Longitude:</span>
              <p className="font-mono text-white">
                {position.longitude?.toFixed(6) || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Altitude:</span>
              <p className="text-white">{formatAltitude(position.altitude)}</p>
            </div>
            <div>
              <span className="text-gray-400">Velocity:</span>
              <p className="text-white">{formatVelocity(position.velocity)}</p>
            </div>
            <div>
              <span className="text-gray-400">Heading:</span>
              <p className="text-white">
                {position.heading ? `${Math.round(position.heading)}°` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Flight Status */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-400 border-b border-gray-700 pb-2">
            Flight Status
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">On Ground:</span>
              <p className={`font-semibold ${flightData.on_ground ? 'text-red-400' : 'text-green-400'}`}>
                {flightData.on_ground ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">SPI:</span>
              <p className={`font-semibold ${flightData.spi ? 'text-yellow-400' : 'text-gray-400'}`}>
                {flightData.spi ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Vertical Rate:</span>
              <p className="text-white">
                {flightData.vertical_rate ? `${Math.round(flightData.vertical_rate)} m/s` : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Position Source:</span>
              <p className="text-white">
                {flightData.position_source === 0 ? 'ADS-B' : 
                 flightData.position_source === 1 ? 'ASTERIX' : 
                 flightData.position_source === 2 ? 'FLARM' : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-400 border-b border-gray-700 pb-2">
            Timing Information
          </h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Last Contact:</span>
              <p className="text-white">{formatTime(flightData.last_contact)}</p>
            </div>
            {flightData.time_position && (
              <div>
                <span className="text-gray-400">Position Time:</span>
                <p className="text-white">{formatTime(flightData.time_position)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Follow Flight
            </button>
            <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              View Trail
            </button>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightInfoPanel;