import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AircraftModel, FlightData, FlightFilters, AppSettings, FlightPosition } from '../types/flight';
import { fetchFlights } from '../services/flightService';

interface FlightStore {
  // Flight data
  flights: Map<string, AircraftModel>;
  selectedFlight: AircraftModel | null;
  filteredFlights: AircraftModel[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showFlightInfo: boolean;
  
  // Filters and settings
  filters: FlightFilters;
  settings: AppSettings;
  
  // Camera controls
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  
  // Actions
  updateFlights: () => Promise<void>;
  selectFlight: (flight: AircraftModel | null) => void;
  updateFilters: (filters: Partial<FlightFilters>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  updateFlightPosition: (icao24: string, position: FlightPosition) => void;
}

const initialFilters: FlightFilters = {
  country: '',
  altitude: { min: 0, max: 50000 },
  velocity: { min: 0, max: 1000 },
  search: '',
};

const initialSettings: AppSettings = {
  showTrails: true,
  showLabels: true,
  followMode: false,
  cameraSpeed: 1,
  trailLength: 100,
  earthRotation: true,
  // Enhanced mouse control settings
  mouseSensitivity: 1.0,
  enableSmoothControls: true,
  enableAutoRotate: false,
  autoRotateSpeed: 0.5,
  enableKeyboardControls: true,
  minZoomDistance: 30,
  maxZoomDistance: 1000,
  enablePerformanceMode: false,
  showFPS: false,
  enableControlHints: true,
};

export const useFlightStore = create<FlightStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    flights: new Map(),
    selectedFlight: null,
    filteredFlights: [],
    isLoading: false,
    error: null,
    showFlightInfo: false,
    filters: initialFilters,
    settings: initialSettings,
    cameraPosition: [0, 0, 500],
    cameraTarget: [0, 0, 0],

    // Actions
    updateFlights: async () => {
      set({ isLoading: true, error: null });
      try {
        const flightData = await fetchFlights();
        const newFlights = new Map<string, AircraftModel>();
        
        flightData.forEach((flight) => {
          if (flight.latitude && flight.longitude && flight.last_contact) {
            const position: FlightPosition = {
              latitude: flight.latitude,
              longitude: flight.longitude,
              altitude: flight.baro_altitude || 0,
              velocity: flight.velocity || 0,
              heading: flight.true_track || 0,
              timestamp: flight.last_contact,
            };

            const existingFlight = get().flights.get(flight.icao24);
            const trail = existingFlight?.trail || [];
            
            // Add new position to trail and maintain trail length
            const newTrail = [...trail, position].slice(-get().settings.trailLength);

            newFlights.set(flight.icao24, {
              icao24: flight.icao24,
              position,
              flightData: flight,
              trail: newTrail,
            });
          }
        });

        set((state) => {
          const updatedFlights = new Map(state.flights);
          
          // Update existing flights or add new ones
          newFlights.forEach((aircraft, icao24) => {
            const existing = updatedFlights.get(icao24);
            if (existing) {
              // Smooth interpolation for position updates
              if (existing.position.timestamp !== aircraft.position.timestamp) {
                updatedFlights.set(icao24, {
                  ...aircraft,
                  trail: existing.trail.length > 0 ? 
                    [...existing.trail, aircraft.position].slice(-state.settings.trailLength) : 
                    [aircraft.position],
                });
              }
            } else {
              updatedFlights.set(icao24, aircraft);
            }
          });

          // Remove flights that haven't been seen for a while
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          updatedFlights.forEach((aircraft, icao24) => {
            if (now - aircraft.position.timestamp > fiveMinutes) {
              updatedFlights.delete(icao24);
            }
          });

          // Filter flights based on current filters
          const filtered = Array.from(updatedFlights.values()).filter((aircraft) => {
            const { filters } = get();
            
            if (filters.country && aircraft.flightData.origin_country !== filters.country) {
              return false;
            }
            
            const altitude = aircraft.position.altitude || 0;
            if (altitude < filters.altitude.min || altitude > filters.altitude.max) {
              return false;
            }
            
            const velocity = aircraft.position.velocity || 0;
            if (velocity < filters.velocity.min || velocity > filters.velocity.max) {
              return false;
            }
            
            if (filters.search) {
              const search = filters.search.toLowerCase();
              const callsign = aircraft.flightData.callsign?.toLowerCase() || '';
              const country = aircraft.flightData.origin_country.toLowerCase();
              if (!callsign.includes(search) && !country.includes(search)) {
                return false;
              }
            }
            
            return true;
          });

          return {
            flights: updatedFlights,
            filteredFlights: filtered,
            isLoading: false,
          };
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch flight data',
          isLoading: false 
        });
      }
    },

    selectFlight: (flight) => {
      set({ 
        selectedFlight: flight,
        showFlightInfo: !!flight 
      });
      
      if (flight && get().settings.followMode) {
        // Auto-follow selected flight
        const position = flight.position;
        const altitude = position.altitude || 10000;
        const followDistance = 50;
        
        const cameraPos: [number, number, number] = [
          position.longitude + followDistance,
          altitude + followDistance,
          position.latitude + followDistance,
        ];
        
        const cameraTarget: [number, number, number] = [
          position.longitude,
          altitude,
          position.latitude,
        ];
        
        set({
          cameraPosition: cameraPos,
          cameraTarget: cameraTarget,
        });
      }
    },

    updateFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters }
      }));
    },

    updateSettings: (newSettings) => {
      set((state) => ({
        settings: { ...state.settings, ...newSettings }
      }));
    },

    setCameraPosition: (position) => {
      set({ cameraPosition: position });
    },

    setCameraTarget: (target) => {
      set({ cameraTarget: target });
    },

    updateFlightPosition: (icao24, position) => {
      set((state) => {
        const flights = new Map(state.flights);
        const existing = flights.get(icao24);
        
        if (existing) {
          const updated = {
            ...existing,
            position,
            trail: [...existing.trail, position].slice(-state.settings.trailLength),
          };
          flights.set(icao24, updated);
        }
        
        return { flights };
      });
    },
  }))
);