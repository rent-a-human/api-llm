import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <div className="relative">
            {/* Animated globe */}
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
              <div className="absolute inset-2 rounded-full border-4 border-blue-400/50"></div>
              <div className="absolute inset-4 rounded-full border-4 border-blue-300/70"></div>
              <div className="absolute inset-6 rounded-full border-4 border-blue-200"></div>
              
              {/* Spinning animation */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
              
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Orbit rings */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-blue-500/20 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/10 rounded-full animate-pulse delay-150"></div>
          </div>
          
          <h1 className="text-4xl font-bold text-white">
            Flight Tracker 3D
          </h1>
          <p className="text-xl text-blue-300">
            Real-time Global Flight Monitoring
          </p>
        </div>

        {/* Loading spinner */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-300">Initializing 3D Environment...</p>
            <p className="text-sm text-gray-400">Loading Earth textures and flight data</p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="space-y-3">
          <div className="w-64 mx-auto">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Loading steps */}
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Connecting to OpenSky Network</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Loading 3D Earth Model</span>
            </div>
            <div className="flex items-center justify-center space-x-2 opacity-50">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <span>Preparing Flight Visualizations</span>
            </div>
          </div>
        </div>

        {/* System requirements note */}
        <div className="text-xs text-gray-500 max-w-md mx-auto">
          <p>
            This application requires WebGL support and a modern browser for optimal performance.
            For the best experience, use Chrome, Firefox, or Safari with hardware acceleration enabled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;