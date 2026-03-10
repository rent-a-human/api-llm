import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  fetchFlights, 
  fetchFlightsInArea, 
  getCountries, 
  latLngToVector3, 
  vector3ToLatLng,
  FlightAPIError 
} from '../src/services/flightService';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn(),
  }
}));

describe('Flight Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchFlights', () => {
    it('should fetch flights successfully', async () => {
      const mockResponse = {
        data: {
          time: 1234567890,
          states: [
            [
              'abc123',      // icao24
              'UAL123',      // callsign
              'United States', // origin_country
              1234567890,    // time_position
              1234567890,    // last_contact
              -74.0,         // longitude
              40.7,          // latitude
              10000,         // baro_altitude
              false,         // on_ground
              800,           // velocity
              90,            // true_track
              0,             // vertical_rate
              null,          // sensors
              10000,         // geo_altitude
              '1200',        // squawk
              false,         // spi
              0              // position_source
            ]
          ]
        }
      };

      const { default: axios } = await import('axios');
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const flights = await fetchFlights();

      expect(flights).toHaveLength(1);
      expect(flights[0]).toEqual({
        icao24: 'abc123',
        callsign: 'UAL123',
        origin_country: 'United States',
        time_position: 1234567890,
        last_contact: 1234567890,
        longitude: -74.0,
        latitude: 40.7,
        baro_altitude: 10000,
        on_ground: false,
        velocity: 800,
        true_track: 90,
        vertical_rate: 0,
        sensors: null,
        geo_altitude: 10000,
        squawk: '1200',
        spi: false,
        position_source: 0,
      });

      expect(axios.get).toHaveBeenCalledWith(
        'https://opensky-network.org/api/states/all',
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      const { default: axios } = await import('axios');
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(fetchFlights()).rejects.toThrow(FlightAPIError);
    });

    it('should handle rate limiting', async () => {
      const { default: axios } = await import('axios');
      const rateLimitError = {
        response: { status: 429 },
        code: 'ECONNABORTED'
      };
      axios.get.mockRejectedValue(rateLimitError);

      await expect(fetchFlights()).rejects.toThrow(FlightAPIError);
    });

    it('should return cached data when available', async () => {
      const { default: axios } = await import('axios');
      
      // First call
      const mockResponse = {
        data: {
          time: 1234567890,
          states: []
        }
      };
      axios.get.mockResolvedValue(mockResponse);
      
      await fetchFlights(); // This should cache the data
      
      // Second call should use cache
      const flights = await fetchFlights();
      
      expect(axios.get).toHaveBeenCalledTimes(1); // Only called once due to cache
      expect(flights).toEqual([]);
    });
  });

  describe('fetchFlightsInArea', () => {
    it('should fetch flights in specified area', async () => {
      const { default: axios } = await import('axios');
      const mockResponse = {
        data: {
          time: 1234567890,
          states: []
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      await fetchFlightsInArea(40.0, -75.0, 41.0, -73.0);

      expect(axios.get).toHaveBeenCalledWith(
        'https://opensky-network.org/api/states/all?lamin=40&lomin=-75&lamax=41&lomax=-73',
        expect.any(Object)
      );
    });

    it('should reject invalid geographical bounds', async () => {
      await expect(fetchFlightsInArea(41.0, -75.0, 40.0, -73.0))
        .rejects.toThrow(FlightAPIError);
    });

    it('should reject areas that are too large', async () => {
      await expect(fetchFlightsInArea(0, -180, 50, 180))
        .rejects.toThrow(FlightAPIError);
    });
  });

  describe('getCountries', () => {
    it('should return sorted list of unique countries', async () => {
      const mockFlights = [
        { origin_country: 'United States' },
        { origin_country: 'Germany' },
        { origin_country: 'United States' },
        { origin_country: 'United Kingdom' },
      ];

      const { fetchFlights } = await import('../src/services/flightService');
      vi.mocked(fetchFlights).mockResolvedValue(mockFlights);

      const countries = await getCountries();

      expect(countries).toEqual(['Germany', 'United Kingdom', 'United States']);
    });

    it('should return fallback countries on API error', async () => {
      const { fetchFlights } = await import('../src/services/flightService');
      vi.mocked(fetchFlights).mockRejectedValue(new Error('API Error'));

      const countries = await getCountries();

      expect(countries).toEqual([
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
      ]);
    });
  });

  describe('Coordinate Conversion', () => {
    describe('latLngToVector3', () => {
      it('should convert lat/lng to 3D coordinates', () => {
        const result = latLngToVector3(0, 0, 100);

        expect(result).toHaveProperty('x');
        expect(result).toHaveProperty('y');
        expect(result).toHaveProperty('z');
        expect(typeof result.x).toBe('number');
        expect(typeof result.y).toBe('number');
        expect(typeof result.z).toBe('number');
      });

      it('should handle equator/prime meridian', () => {
        const result = latLngToVector3(0, 0, 100);

        // Should be on positive X axis for equator at prime meridian
        expect(result.x).toBeLessThan(0); // Negative due to Three.js coordinate system
        expect(Math.abs(result.y)).toBeLessThan(0.01); // Close to 0 for equator
        expect(Math.abs(result.z)).toBeLessThan(0.01); // Close to 0 for prime meridian
      });

      it('should handle north pole', () => {
        const result = latLngToVector3(90, 0, 100);

        expect(result.y).toBe(100); // Should be at positive Y for north pole
      });

      it('should handle south pole', () => {
        const result = latLngToVector3(-90, 0, 100);

        expect(result.y).toBe(-100); // Should be at negative Y for south pole
      });
    });

    describe('vector3ToLatLng', () => {
      it('should convert 3D coordinates back to lat/lng', () => {
        const input = { x: 0, y: 100, z: 0 }; // North pole
        const result = vector3ToLatLng(input.x, input.y, input.z);

        expect(result).toHaveProperty('lat');
        expect(result).toHaveProperty('lng');
        expect(typeof result.lat).toBe('number');
        expect(typeof result.lng).toBe('number');
      });

      it('should handle round-trip conversion', () => {
        const originalLat = 40.7128;
        const originalLng = -74.0060;
        const radius = 100;

        // Convert to 3D and back
        const vector3 = latLngToVector3(originalLat, originalLng, radius);
        const converted = vector3ToLatLng(vector3.x, vector3.y, vector3.z);

        // Should be approximately the same (allowing for floating point precision)
        expect(Math.abs(converted.lat - originalLat)).toBeLessThan(0.1);
        expect(Math.abs(converted.lng - originalLng)).toBeLessThan(0.1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should create FlightAPIError correctly', () => {
      const error = new FlightAPIError('Test error', 500, 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('FlightAPIError');
    });
  });
});