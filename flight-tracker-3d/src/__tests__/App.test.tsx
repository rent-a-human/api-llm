import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'zustand';
import { useFlightStore } from '../src/store/flightStore';
import App from '../src/App';

// Mock the flight service
vi.mock('../src/services/flightService', () => ({
  fetchFlights: vi.fn(),
  fetchFlightsInArea: vi.fn(),
  getCountries: vi.fn(() => Promise.resolve(['United States', 'Germany', 'United Kingdom'])),
  latLngToVector3: vi.fn(() => ({ x: 100, y: 0, z: 0 })),
}));

// Mock react-three-fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
  Stars: () => <div data-testid="mock-stars" />,
  Text: () => <div data-testid="mock-text" />,
  Billboard: () => <div data-testid="mock-billboard" />,
  Environment: () => <div data-testid="mock-environment" />,
  Html: ({ children }: any) => <div data-testid="mock-html">{children}</div>,
  Line: () => <div data-testid="mock-line" />,
  useTexture: vi.fn(() => [null, null, null, null]),
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: any) => <div data-testid="mock-effect-composer">{children}</div>,
  Bloom: () => <div data-testid="mock-bloom" />,
  SMAA: () => <div data-testid="mock-smaa" />,
}));

// Mock three.js
vi.mock('three', () => ({
  Vector3: vi.fn(() => ({
    x: 0, y: 0, z: 0,
    normalize: vi.fn().mockReturnThis(),
    lerp: vi.fn().mockReturnThis(),
    copy: vi.fn().mockReturnThis(),
  })),
  MathUtils: {
    lerp: vi.fn((start, end, factor) => start + (end - start) * factor),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={useFlightStore}>{children}</Provider>
);

describe('Flight Tracker 3D App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Flight Tracker 3D/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time Global Flight Monitoring/i)).toBeInTheDocument();
  });

  it('shows main app after initialization', async () => {
    const { fetchFlights } = await import('../src/services/flightService');
    vi.mocked(fetchFlights).mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Flight Tracker 3D/i)).not.toBeInTheDocument();
    });
  });

  it('handles flight data fetching', async () => {
    const { fetchFlights } = await import('../src/services/flightService');
    const mockFlights = [
      {
        icao24: 'test123',
        callsign: 'TEST123',
        origin_country: 'United States',
        time_position: Date.now() / 1000,
        last_contact: Date.now() / 1000,
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
      }
    ];

    vi.mocked(fetchFlights).mockResolvedValueOnce(mockFlights);

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(fetchFlights).toHaveBeenCalled();
    });
  });

  it('displays error message when API fails', async () => {
    const { fetchFlights } = await import('../src/services/flightService');
    vi.mocked(fetchFlights).mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Connection Error/i)).toBeInTheDocument();
    });
  });

  it('toggles filter panel when F key is pressed', async () => {
    const { fetchFlights } = await import('../src/services/flightService');
    vi.mocked(fetchFlights).mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Wait for app to initialize
    await waitFor(() => {
      expect(screen.queryByText(/Flight Tracker 3D/i)).not.toBeInTheDocument();
    });

    // Press F key
    fireEvent.keyDown(window, { key: 'f' });

    await waitFor(() => {
      expect(screen.getByText(/Filters & Controls/i)).toBeInTheDocument();
    });
  });
});

describe('Flight Store', () => {
  beforeEach(() => {
    useFlightStore.setState({
      flights: new Map(),
      selectedFlight: null,
      filteredFlights: [],
      isLoading: false,
      error: null,
    });
  });

  it('updates flights correctly', async () => {
    const mockFlights = [
      {
        icao24: 'test123',
        callsign: 'TEST123',
        origin_country: 'United States',
        time_position: Date.now() / 1000,
        last_contact: Date.now() / 1000,
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
      }
    ];

    const { fetchFlights } = await import('../src/services/flightService');
    vi.mocked(fetchFlights).mockResolvedValueOnce(mockFlights);

    await useFlightStore.getState().updateFlights();

    expect(useFlightStore.getState().flights.size).toBe(1);
    expect(useFlightStore.getState().filteredFlights.length).toBe(1);
  });

  it('filters flights by country', () => {
    const mockFlights = new Map([
      ['test123', {
        icao24: 'test123',
        position: {
          latitude: 40.7,
          longitude: -74.0,
          altitude: 10000,
          velocity: 800,
          heading: 90,
          timestamp: Date.now(),
        },
        flightData: {
          icao24: 'test123',
          callsign: 'TEST123',
          origin_country: 'United States',
          time_position: Date.now() / 1000,
          last_contact: Date.now() / 1000,
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
        },
        trail: [],
      }]
    ]);

    useFlightStore.setState({ flights: mockFlights });

    useFlightStore.getState().updateFilters({ country: 'Germany' });

    expect(useFlightStore.getState().filteredFlights.length).toBe(0);
  });

  it('selects flights correctly', () => {
    const mockFlight = {
      icao24: 'test123',
      position: {
        latitude: 40.7,
        longitude: -74.0,
        altitude: 10000,
        velocity: 800,
        heading: 90,
        timestamp: Date.now(),
      },
      flightData: {
        icao24: 'test123',
        callsign: 'TEST123',
        origin_country: 'United States',
        time_position: Date.now() / 1000,
        last_contact: Date.now() / 1000,
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
      },
      trail: [],
    };

    useFlightStore.getState().selectFlight(mockFlight);

    expect(useFlightStore.getState().selectedFlight).toBe(mockFlight);
    expect(useFlightStore.getState().showFlightInfo).toBe(true);
  });
});

describe('Flight Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches flights successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        time: Date.now() / 1000,
        states: [['test123', 'TEST123', 'United States', Date.now() / 1000, Date.now() / 1000, -74.0, 40.7, 10000, false, 800, 90, 0, null, 10000, '1200', false, 0]]
      })
    });

    const { fetchFlights } = await import('../src/services/flightService');
    const flights = await fetchFlights();

    expect(flights).toHaveLength(1);
    expect(flights[0].icao24).toBe('test123');
    expect(flights[0].callsign).toBe('TEST123');
  });

  it('handles API errors correctly', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { fetchFlights } = await import('../src/services/flightService');
    
    await expect(fetchFlights()).rejects.toThrow('Network error');
  });

  it('converts lat/lng to 3D coordinates correctly', async () => {
    const { latLngToVector3 } = await import('../src/services/flightService');
    const result = latLngToVector3(40.7, -74.0, 100);

    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('z');
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(typeof result.z).toBe('number');
  });
});