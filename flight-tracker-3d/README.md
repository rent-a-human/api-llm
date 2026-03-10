# Flight Tracker 3D

A production-quality 3D flight tracking web application with real-time aircraft visualization, built with React, TypeScript, and Three.js.

![Flight Tracker 3D](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.158.0-orange.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 🌍 3D Earth Visualization
- **Realistic 3D Earth**: Detailed planet with atmospheric glow, clouds, and lighting effects
- **Smooth Camera Controls**: Intuitive zoom, pan, and rotation with orbital controls
- **Dynamic Textures**: High-resolution Earth textures with proper lighting and shadows
- **Post-processing Effects**: Bloom, anti-aliasing, and visual polish

### ✈️ Real-time Flight Data
- **OpenSky Network Integration**: Live aircraft data from the world's largest open aviation database
- **Efficient Data Management**: Smart caching, rate limiting, and error handling
- **Performance Optimized**: Real-time updates with smooth interpolation between positions
- **Offline Resilience**: Graceful handling of network issues and API rate limits

### 🎯 Advanced Flight Visualization
- **3D Aircraft Models**: Detailed airplane representations with proper orientation
- **Flight Trails**: Real-time tracking paths with customizable length and opacity
- **Interactive Selection**: Click to select flights with detailed information panels
- **Altitude Positioning**: Accurate altitude representation with scaling
- **Motion Prediction**: Simple flight path forecasting based on current trajectory

### 🔧 Technical Excellence
- **TypeScript**: Full type safety and IDE support throughout the codebase
- **State Management**: Zustand for efficient global state management
- **Performance Optimized**: React optimization patterns and Three.js best practices
- **Error Boundaries**: Comprehensive error handling and fallback UI
- **Unit Tests**: Thorough test coverage with Vitest and Testing Library

### 📱 User Experience
- **Responsive Design**: Optimized for desktop and mobile devices
- **Keyboard Shortcuts**: Efficient navigation with hotkeys
- **Loading States**: Smooth loading animations and progress indicators
- **Accessibility**: WCAG compliant with proper ARIA labels and focus management
- **Dark Theme**: Modern dark UI optimized for 3D visualization

### 🛠️ Development Features
- **Vite Build System**: Lightning-fast development and optimized production builds
- **ESLint + Prettier**: Code quality and formatting standards
- **Vitest Testing**: Fast unit testing with coverage reporting
- **Component Architecture**: Modular, reusable React components
- **Performance Monitoring**: Built-in performance tracking and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm 8+ or yarn
- Modern browser with WebGL support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flight-tracker-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 🎮 Usage Guide

### Basic Controls

#### Mouse/Trackpad
- **Left Click + Drag**: Rotate camera around Earth
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out
- **Left Click on Aircraft**: Select flight and show information

#### Keyboard Shortcuts
- **F**: Toggle filters panel
- **I**: Toggle flight information panel (when flight is selected)
- **Ctrl+R**: Refresh flight data
- **Esc**: Close all panels
- **Space**: Pause/Resume data updates

### Interface Panels

#### Control Panel (Bottom Left)
- **Filters Button**: Open flight filtering controls
- **Info Button**: Show detailed flight information
- **Refresh Button**: Manually update flight data
- **Settings Toggles**: 
  - Trails: Show/hide flight paths
  - Labels: Show/hide flight information labels
  - Follow: Auto-track selected aircraft
  - Rotate: Enable/disable Earth rotation

#### Filter Panel (Left Side)
- **Search**: Filter by callsign or country
- **Country**: Filter by origin country
- **Altitude Range**: Filter by flight altitude
- **Velocity Range**: Filter by aircraft speed
- **Statistics**: Real-time flight count information

#### Flight Information Panel (Right Side)
- **Flight Details**: Callsign, ICAO24, country, squawk
- **Position Data**: Latitude, longitude, altitude
- **Movement Data**: Velocity, heading, vertical rate
- **Status Information**: On-ground status, position source
- **Timing Data**: Last contact time, position timestamp

## 🏗️ Architecture

### Project Structure
```
flight-tracker-3d/
├── src/
│   ├── components/           # React components
│   │   ├── Scene3D.tsx      # Main 3D scene container
│   │   ├── Earth.tsx        # 3D Earth model
│   │   ├── Aircraft.tsx     # Aircraft visualization
│   │   ├── FlightTrails.tsx # Flight path rendering
│   │   ├── ControlPanel.tsx # UI control panel
│   │   ├── FilterControls.tsx # Flight filtering
│   │   ├── FlightInfoPanel.tsx # Flight details
│   │   ├── LoadingScreen.tsx # Loading interface
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── services/            # External service integration
│   │   └── flightService.ts # OpenSky API integration
│   ├── store/               # State management
│   │   └── flightStore.ts   # Zustand store
│   ├── types/               # TypeScript definitions
│   │   └── flight.ts        # Flight data types
│   ├── utils/               # Utility functions
│   │   └── textureUtils.ts  # Texture handling
│   ├── __tests__/           # Test files
│   │   ├── App.test.tsx     # Component tests
│   │   ├── flightService.test.ts # Service tests
│   │   └── setup.ts         # Test setup
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
│   └── textures/           # Earth texture files
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS config
└── README.md               # This file
```

### Key Technologies

#### Core Stack
- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

#### 3D Graphics
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions
- **@react-three/postprocessing**: Post-processing effects

#### State & Data
- **Zustand**: Lightweight state management
- **Axios**: HTTP client for API requests
- **OpenSky Network**: Real-time flight data API

#### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **CSS3**: Custom animations and effects

#### Testing
- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing
- **jsdom**: DOM simulation for tests

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# OpenSky Network API (optional - uses default endpoints)
VITE_OPENSKY_BASE_URL=https://opensky-network.org/api
VITE_UPDATE_INTERVAL=30000
VITE_MAX_FLIGHTS=1000

# Development settings
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=info

# Performance settings
VITE_MAX_TRAIL_LENGTH=100
VITE_TARGET_FPS=60
```

### API Configuration

The application uses the OpenSky Network API for flight data:

- **Base URL**: `https://opensky-network.org/api`
- **Rate Limit**: 90 requests per minute
- **Update Frequency**: Every 30 seconds (configurable)
- **Data Format**: JSON with aircraft state vectors

### Performance Tuning

#### Rendering Settings
```typescript
// In Scene3D.tsx
<Canvas
  dpr={[1, 2]}           // Device pixel ratio
  performance={{ 
    min: 0.5            // Minimum performance threshold
  }}
>
```

#### Update Intervals
```typescript
// In App.tsx
const UPDATE_INTERVAL = 30000; // 30 seconds
```

#### Trail Length
```typescript
// In flightStore.ts
const MAX_TRAIL_LENGTH = 100; // Maximum trail points per aircraft
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### Test Structure

- **Component Tests**: `src/__tests__/App.test.tsx`
- **Service Tests**: `src/__tests__/flightService.test.ts`
- **Setup**: `src/__tests__/setup.ts`

### Coverage Targets
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## 📈 Performance

### Optimization Features

#### Three.js Optimizations
- **Object Pooling**: Reuse Three.js objects to reduce GC
- **LOD System**: Level-of-detail for distant objects
- **Frustum Culling**: Only render visible objects
- **Texture Compression**: Efficient texture formats
- **Geometry Instancing**: Batch render similar objects

#### React Optimizations
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Memoize expensive calculations
- **Virtual Scrolling**: Efficient large list rendering
- **Code Splitting**: Lazy load components

#### API Optimizations
- **Request Caching**: Cache API responses for 30 seconds
- **Request Deduplication**: Prevent duplicate requests
- **Background Updates**: Non-blocking data refresh
- **Error Retry**: Automatic retry with exponential backoff

### Performance Metrics

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.0s
- **Frame Rate**: Consistent 60 FPS on modern hardware

## 🐛 Troubleshooting

### Common Issues

#### WebGL Support
```javascript
// Check WebGL support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
  // Show fallback message
}
```

#### Memory Issues
- Reduce `MAX_TRAIL_LENGTH` in settings
- Increase cleanup interval for old flight data
- Disable trails for better performance

#### API Rate Limits
- The app automatically handles rate limiting
- Reduce update frequency in settings
- Check OpenSky Network status

#### Performance Issues
- Enable hardware acceleration in browser
- Close other tabs with 3D content
- Reduce quality settings in browser

### Browser Compatibility

#### Recommended Browsers
- **Chrome 90+**: Full support with hardware acceleration
- **Firefox 88+**: Full support with WebGL 2.0
- **Safari 14+**: Full support on macOS/iOS
- **Edge 90+**: Full support with Chromium engine

#### Minimum Requirements
- **WebGL 1.0**: Required for basic functionality
- **WebGL 2.0**: Recommended for optimal performance
- **RAM**: 4GB minimum, 8GB recommended
- **GPU**: Integrated graphics sufficient, dedicated GPU recommended

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Start development**: `npm run dev`
6. **Make changes and test**
7. **Commit changes**: `git commit -m 'Add amazing feature'`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open Pull Request**

### Code Standards

#### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Use enums for constants
- Avoid `any` types

#### React Components
- Functional components with hooks
- PropTypes or TypeScript interfaces
- Proper error boundaries
- Accessibility compliance

#### Testing
- Write tests for all new features
- Maintain >80% coverage
- Use meaningful test descriptions
- Mock external dependencies

#### Git Commit Messages
```
feat: add flight path prediction
fix: resolve WebGL memory leak
docs: update installation instructions
style: format code with prettier
refactor: optimize Three.js rendering
test: add flight service integration tests
chore: update dependencies
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenSky Network**: Providing real-time flight data
- **Three.js Community**: 3D graphics framework
- **React Team**: Modern UI library
- **NASA**: Earth texture data and imagery
- **Aviation Enthusiasts**: Inspiration and feedback

## 📞 Support

For support, please:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [issues](https://github.com/your-repo/issues)
3. Create a new issue with:
   - Browser and version
   - Operating system
   - Error messages
   - Steps to reproduce

## 🗺️ Roadmap

### Version 1.1.0
- [ ] Flight search functionality
- [ ] Custom Earth textures
- [ ] Aircraft model variations
- [ ] Weather overlay integration

### Version 1.2.0
- [ ] Historical flight data
- [ ] Flight replay functionality
- [ ] Airport information overlay
- [ ] Mobile app development

### Version 2.0.0
- [ ] Multi-globe support
- [ ] Custom flight planning
- [ ] Real-time communication overlay
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for aviation enthusiasts and developers**