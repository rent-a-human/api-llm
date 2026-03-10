import React from 'react';
import { useFlightStore } from '../store/flightStore';

interface ControlPanelProps {
  onToggleFilters: () => void;
  onToggleInfo: () => void;
  showFilters: boolean;
  showInfo: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onToggleFilters,
  onToggleInfo,
  showFilters,
  showInfo
}) => {
  const { 
    selectedFlight, 
    filteredFlights, 
    flights, 
    isLoading, 
    settings, 
    updateSettings,
    updateFlights,
    updateFilters
  } = useFlightStore();

  const handleRefresh = () => {
    updateFlights().catch(console.error);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const updateCameraSpeed = (speed: number) => {
    updateSettings({ cameraSpeed: speed });
  };

  const updateMouseSensitivity = (sensitivity: number) => {
    updateSettings({ mouseSensitivity: sensitivity });
  };

  const updateAutoRotateSpeed = (speed: number) => {
    updateSettings({ autoRotateSpeed: speed });
  };

  const resetCamera = () => {
    updateSettings({ 
      cameraPosition: [0, 0, 500],
      cameraTarget: [0, 0, 0]
    });
  };

  return (
    <div className="absolute bottom-4 left-4 z-40 max-w-sm">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-4">
        <div className="flex flex-col space-y-4">
          {/* Primary Controls */}
          <div className="flex space-x-2">
            <button
              onClick={onToggleFilters}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex-1 ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span>Filters</span>
              </div>
            </button>

            <button
              onClick={onToggleInfo}
              disabled={!selectedFlight}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex-1 ${
                showInfo && selectedFlight
                  ? 'bg-green-600 text-white' 
                  : selectedFlight
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Info</span>
              </div>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
            >
              <div className="flex items-center space-x-2">
                <svg 
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </div>
            </button>
          </div>

          {/* Visualization Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Visualization
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.showTrails}
                  onChange={() => toggleSetting('showTrails')}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Trails</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.showLabels}
                  onChange={() => toggleSetting('showLabels')}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Labels</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.followMode}
                  onChange={() => toggleSetting('followMode')}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Follow</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.earthRotation}
                  onChange={() => toggleSetting('earthRotation')}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Rotate</span>
              </label>
            </div>
          </div>

          {/* Mouse Control Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Mouse Controls
              </h3>
              <button
                onClick={resetCamera}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-all"
              >
                Reset View
              </button>
            </div>

            {/* Camera Speed */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Camera Speed</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={settings.cameraSpeed}
                onChange={(e) => updateCameraSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-500 text-center">{settings.cameraSpeed.toFixed(1)}x</div>
            </div>

            {/* Mouse Sensitivity */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Mouse Sensitivity</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={settings.mouseSensitivity}
                onChange={(e) => updateMouseSensitivity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-500 text-center">{settings.mouseSensitivity.toFixed(1)}x</div>
            </div>

            {/* Auto Rotate */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.enableAutoRotate}
                  onChange={() => toggleSetting('enableAutoRotate')}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Auto Rotate</span>
              </label>
              
              {settings.enableAutoRotate && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Auto Rotate Speed</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={settings.autoRotateSpeed}
                    onChange={(e) => updateAutoRotateSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-xs text-gray-500 text-center">{settings.autoRotateSpeed.toFixed(1)}x</div>
                </div>
              )}
            </div>

            {/* Additional Controls */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.enableSmoothControls}
                  onChange={() => toggleSetting('enableSmoothControls')}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Smooth</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.showFPS}
                  onChange={() => toggleSetting('showFPS')}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">FPS</span>
              </label>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Visible:</span>
                <p className="text-white font-semibold">{filteredFlights.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Total:</span>
                <p className="text-white font-semibold">{flights.size}</p>
              </div>
            </div>
          </div>

          {/* Selected Flight Info */}
          {selectedFlight && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Selected Flight
              </h3>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-gray-400">Callsign:</span>
                  <p className="text-white font-mono">
                    {selectedFlight.flightData.callsign || selectedFlight.icao24}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Altitude:</span>
                  <p className="text-white">
                    {Math.round(selectedFlight.position.altitude || 0)}m
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Speed:</span>
                  <p className="text-white">
                    {Math.round(selectedFlight.position.velocity || 0)} km/h
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-gray-400">
                {isLoading ? 'Updating...' : 'Live Data'}
              </span>
            </div>
            <div className="text-gray-400">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;