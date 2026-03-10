export interface FlightData {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface FlightPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  timestamp: number;
}

export interface AircraftModel {
  icao24: string;
  position: FlightPosition;
  flightData: FlightData;
  trail: FlightPosition[];
}

export interface FlightFilters {
  country: string;
  altitude: {
    min: number;
    max: number;
  };
  velocity: {
    min: number;
    max: number;
  };
  search: string;
}

export interface AppSettings {
  showTrails: boolean;
  showLabels: boolean;
  followMode: boolean;
  cameraSpeed: number;
  trailLength: number;
  earthRotation: boolean;
  // Enhanced mouse control settings
  mouseSensitivity: number;
  enableSmoothControls: boolean;
  enableAutoRotate: boolean;
  autoRotateSpeed: number;
  enableKeyboardControls: boolean;
  minZoomDistance: number;
  maxZoomDistance: number;
  enablePerformanceMode: boolean;
  showFPS: boolean;
  enableControlHints: boolean;
}