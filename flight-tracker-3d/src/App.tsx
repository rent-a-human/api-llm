import React, { useState, useEffect, useRef } from 'react';
import Scene3D from './components/Scene3D';
import FlightInfoPanel from './components/FlightInfoPanel';
import FilterControls from './components/FilterControls';
import ControlPanel from './components/ControlPanel';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { useFlightStore } from './store/flightStore';

function App() {
  const [showFilters, setShowFilters] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    updateFlights, 
    selectedFlight, 
    isLoading, 
    error, 
    showFlightInfo 
  } = useFlightStore();
  
  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize the application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing Flight Tracker 3D...');
        await updateFlights();
        setIsInitialized(true);
        console.log('Flight Tracker 3D initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Flight Tracker 3D:', err);
      }
    };

    initializeApp();
  }, [updateFlights]);

  // Set up periodic flight data updates
  useEffect(() => {
    if (isInitialized) {
      // Update flights every 30 seconds
      intervalRef.current = setInterval(() => {
        updateFlights().catch(console.error);
      }, 30000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isInitialized, updateFlights]);

  // Show flight info panel when a flight is selected
  useEffect(() => {
    if (selectedFlight && showFlightInfo) {
      setShowInfo(true);
    }
  }, [selectedFlight, showFlightInfo]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'f':
          setShowFilters(!showFilters);
          break;
        case 'i':
          if (selectedFlight) {
            setShowInfo(!showInfo);
          }
          break;
        case 'escape':
          setShowFilters(false);
          setShowInfo(false);
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            updateFlights().catch(console.error);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFilters, showInfo, selectedFlight, updateFlights]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-screen bg-black text-white overflow-hidden">
        {/* Main 3D Scene */}
        <div className="w-full h-full relative">
          <Scene3D className="w-full h-full" />
          
          {/* Loading indicator for background updates */}
          {isLoading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-sm text-white">Updating flight data...</span>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="absolute top-4 left-4 right-4 z-40">
              <div className="bg-red-900/90 backdrop-blur-sm rounded-lg p-4 border border-red-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-100 font-medium">Connection Error</span>
                  </div>
                  <button
                    onClick={() => updateFlights().catch(console.error)}
                    className="text-red-200 hover:text-white transition-colors text-sm underline"
                  >
                    Retry
                  </button>
                </div>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <ControlPanel
          onToggleFilters={() => setShowFilters(!showFilters)}
          onToggleInfo={() => setShowInfo(!showInfo)}
          showFilters={showFilters}
          showInfo={showInfo}
        />

        {/* Filter Controls Panel */}
        <FilterControls
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {/* Flight Information Panel */}
        <FlightInfoPanel
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
        />

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-4 right-4 z-30">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
            <div className="space-y-1">
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">F</kbd> Filters</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">I</kbd> Info Panel</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl+R</kbd> Refresh Data</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Esc</kbd> Close Panels</div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;