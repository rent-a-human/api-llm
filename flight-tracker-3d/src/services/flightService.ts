import axios, { AxiosError } from 'axios';
import { FlightData } from '../types/flight';

// OpenSky Network API configuration
const OPENSKY_API_BASE = 'https://opensky-network.org/api';
const OPENSKY_STATES_API = `${OPENSKY_API_BASE}/states/all`;

// Cache configuration
interface CacheEntry {
  data: FlightData[];
  timestamp: number;
  expiry: number;
}

class FlightServiceCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 30000; // 30 seconds

  set(key: string, data: FlightData[]): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + this.DEFAULT_TTL,
    });
  }

  get(key: string): FlightData[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new FlightServiceCache();

// Rate limiting
class RateLimiter {
  private requests: number[] = [];
  private readonly MAX_REQUESTS = 90; // OpenSky allows ~90 requests per minute
  private readonly WINDOW_MS = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.WINDOW_MS);
    
    return this.requests.length < this.MAX_REQUESTS;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

// API Error class
export class FlightAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'FlightAPIError';
  }
}

interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | null)[][];
}

// Transform OpenSky API response to our FlightData interface
const transformOpenSkyData = (response: OpenSkyResponse): FlightData[] => {
  return response.states.map((state) => ({
    icao24: state[0] as string,
    callsign: (state[1] as string)?.trim() || null,
    origin_country: state[2] as string,
    time_position: state[3] as number | null,
    last_contact: state[4] as number,
    longitude: state[5] as number | null,
    latitude: state[6] as number | null,
    baro_altitude: state[7] as number | null,
    on_ground: state[8] as boolean,
    velocity: state[9] as number | null,
    true_track: state[10] as number | null,
    vertical_rate: state[11] as number | null,
    sensors: state[12] as number[] | null,
    geo_altitude: state[13] as number | null,
    squawk: state[14] as string | null,
    spi: state[15] as boolean,
    position_source: state[16] as number,
  }));
};

// Main API function to fetch flight data
export const fetchFlights = async (): Promise<FlightData[]> => {
  const cacheKey = 'all-flights';
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Check rate limiting
  if (!rateLimiter.canMakeRequest()) {
    throw new FlightAPIError(
      'Rate limit exceeded. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  try {
    rateLimiter.recordRequest();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await axios.get<OpenSkyResponse>(OPENSKY_STATES_API, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FlightTracker3D/1.0',
      },
      timeout: 10000,
    });

    clearTimeout(timeoutId);

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.states)) {
      throw new FlightAPIError('Invalid response format from API', 500);
    }

    const flightData = transformOpenSkyData(response.data);
    
    // Cache the result
    cache.set(cacheKey, flightData);
    
    return flightData;

  } catch (error) {
    if (error instanceof FlightAPIError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new FlightAPIError('Request timeout', 408, 'TIMEOUT');
      }
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'API request failed';
        throw new FlightAPIError(message, status);
      }
      
      if (error.request) {
        throw new FlightAPIError('Network error - please check your connection', 0);
      }
    }

    throw new FlightAPIError('Unknown error occurred', 500);
  }
};

// Fetch flights in a specific geographical area
export const fetchFlightsInArea = async (
  lamin: number,
  lomin: number,
  lamax: number,
  lomax: number
): Promise<FlightData[]> => {
  if (lamin >= lamax || lomin >= lomax) {
    throw new FlightAPIError('Invalid geographical bounds', 400);
  }

  if (lamax - lamin > 20 || lomax - lomin > 20) {
    throw new FlightAPIError('Area too large', 400);
  }

  const cacheKey = `area-${lamin}-${lomin}-${lamax}-${lomax}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  if (!rateLimiter.canMakeRequest()) {
    throw new FlightAPIError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
  }

  try {
    rateLimiter.recordRequest();

    const url = `${OPENSKY_API_BASE}/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    
    const response = await axios.get<OpenSkyResponse>(url, {
      timeout: 10000,
    });

    const flightData = transformOpenSkyData(response.data);
    cache.set(cacheKey, flightData);
    
    return flightData;

  } catch (error) {
    if (error instanceof FlightAPIError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      throw new FlightAPIError(
        error.response?.data?.message || 'Failed to fetch flights in area',
        error.response?.status || 500
      );
    }

    throw new FlightAPIError('Failed to fetch flights in area', 500);
  }
};

// Get unique countries from flight data
export const getCountries = async (): Promise<string[]> => {
  try {
    const flights = await fetchFlights();
    const countries = new Set(flights.map(flight => flight.origin_country));
    return Array.from(countries).sort();
  } catch (error) {
    // Return common countries as fallback
    return [
      'United States',
      'Germany',
      'United Kingdom',
      'France',
      'Spain',
      'Italy',
      'Canada',
      'Australia',
      'Japan',
      'China',
    ];
  }
};

// Utility function to convert lat/lng to 3D coordinates
export const latLngToVector3 = (lat: number, lng: number, radius: number = 100) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return { x, y, z };
};

// Utility function to convert 3D coordinates back to lat/lng
export const vector3ToLatLng = (x: number, y: number, z: number) => {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const lat = 90 - (Math.acos(y / radius) * 180 / Math.PI);
  const lng = -((Math.atan2(x, z) * 180 / Math.PI) + 180);

  return { lat, lng };
};

// Cleanup function to clear cache and reset rate limiter
export const cleanup = () => {
  cache.clear();
  rateLimiter.recordRequest(); // Reset rate limiter
};

// Periodic cache cleanup
setInterval(() => {
  cache.cleanup();
}, 60000); // Every minute