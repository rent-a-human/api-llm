import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stars, 
  Text, 
  Billboard,
  Environment,
  Html,
  useCursor
} from '@react-three/drei';
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';
import { Group, Vector3, Euler } from 'three';
import { Earth } from './Earth';
import { Aircraft } from './Aircraft';
import { FlightTrails } from './FlightTrails';
import { useFlightStore } from '../store/flightStore';

interface Scene3DProps {
  className?: string;
}

// Enhanced Camera Controller with better mouse controls
const CameraController: React.FC = () => {
  const { cameraPosition, cameraTarget, settings } = useFlightStore();
  const controlsRef = useRef<any>();
  const targetVector = useRef(new Vector3(...cameraTarget));
  const positionVector = useRef(new Vector3(...cameraPosition));
  const [isInteracting, setIsInteracting] = useState(false);
  const { camera, gl } = useThree();

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Only update camera position if not actively interacting
    if (!isInteracting) {
      // Smooth camera movement when not user-controlled
      const lerpFactor = Math.min(delta * 3, 1);
      
      // Update target position smoothly
      targetVector.current.lerp(new Vector3(...cameraTarget), lerpFactor);
      controlsRef.current.target.copy(targetVector.current);

      // Update camera position smoothly  
      positionVector.current.lerp(new Vector3(...cameraPosition), lerpFactor);
      state.camera.position.copy(positionVector.current);
      
      state.camera.lookAt(targetVector.current);
    }
  });

  // Handle interaction events for better user feedback
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => setIsInteracting(true);
    const handleEnd = () => setIsInteracting(false);

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };
  }, []);

  // Optimize mouse control sensitivity based on distance
  const getOptimizedSettings = () => {
    const distance = camera.position.distanceTo(targetVector.current);
    const normalizedDistance = Math.max(0.1, Math.min(2, distance / 200));
    
    return {
      zoomSpeed: Math.max(0.5, settings.cameraSpeed * 2 / normalizedDistance),
      panSpeed: Math.max(0.5, settings.cameraSpeed * 1.5 / normalizedDistance),
      rotateSpeed: Math.max(0.3, settings.cameraSpeed / normalizedDistance),
    };
  };

  const optimizedSettings = getOptimizedSettings();

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={optimizedSettings.rotateSpeed}
      zoomSpeed={optimizedSettings.zoomSpeed}
      panSpeed={optimizedSettings.panSpeed}
      maxDistance={1000}
      minDistance={30}
      maxPolarAngle={Math.PI * 0.95}
      minPolarAngle={0.05}
      screenSpacePanning={false}
      enableKeys={true}
      keys={{
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
      }}
      mouseButtons={{
        LEFT: 0, // Rotate
        MIDDLE: 1, // Zoom
        RIGHT: 2, // Pan
      }}
      touches={{
        ONE: 0, // Rotate
        TWO: 2, // Zoom/Pan
      }}
      onStart={() => setIsInteracting(true)}
      onEnd={() => setIsInteracting(false)}
    />
  );
};

// Enhanced Earth component with better rotation control
const EarthWithRotation: React.FC = () => {
  const earthRef = useRef<Group>(null);
  const { settings, selectedFlight } = useFlightStore();
  const [rotationSpeed, setRotationSpeed] = useState(0.01);

  useFrame((_, delta) => {
    if (earthRef.current && settings.earthRotation) {
      // Slower rotation when a flight is selected for better focus
      const speed = selectedFlight ? rotationSpeed * 0.3 : rotationSpeed;
      earthRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={earthRef}>
      <Earth />
    </group>
  );
};

// Interactive element cursor feedback
const InteractiveAircraft: React.FC<{
  aircraft: any;
  isSelected: boolean;
  showLabel: boolean;
  onClick: (flight: any) => void;
}> = ({ aircraft, isSelected, showLabel, onClick }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(aircraft);
      }}
    >
      <Aircraft
        aircraft={aircraft}
        isSelected={isSelected}
        showLabel={showLabel}
        onClick={onClick}
      />
    </group>
  );
};

const LoadingFallback: React.FC = () => (
  <Html center>
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-white text-lg">Loading 3D Scene...</p>
    </div>
  </Html>
);

// Performance monitor component
const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return (
    <Html position={[0, 0, 0]}>
      <div className="absolute top-4 right-4 z-50 bg-black/70 text-white p-2 rounded text-xs font-mono">
        FPS: {fps}
      </div>
    </Html>
  );
};

const Scene3D: React.FC<Scene3DProps> = ({ className }) => {
  const { filteredFlights, selectedFlight, settings, selectFlight } = useFlightStore();
  const [performanceMode, setPerformanceMode] = useState(false);

  // Auto-enable performance mode on slower devices
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    // Check for low-end device indicators
    const renderer = gl.getParameter(gl.RENDERER);
    const isLowEnd = /intel|swiftshader|llvmpipe/i.test(renderer);
    
    if (isLowEnd) {
      setPerformanceMode(true);
    }
  }, []);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, 500],
          fov: 75,
          near: 0.1,
          far: 2000,
        }}
        gl={{ 
          antialias: !performanceMode,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={performanceMode ? [1, 1.5] : [1, 2]}
        performance={{ 
          min: performanceMode ? 0.8 : 0.5,
          max: 60,
          debounce: 200
        }}
        onCreated={(state) => {
          // Optimize renderer settings
          state.gl.setClearColor('#000011', 1);
          state.gl.shadowMap.enabled = !performanceMode;
          state.gl.shadowMap.type = 2; // PCFSoftShadowMap
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting - optimized for performance */}
          <ambientLight intensity={performanceMode ? 0.3 : 0.2} />
          <directionalLight 
            position={[100, 100, 50]} 
            intensity={performanceMode ? 0.8 : 1}
            castShadow={!performanceMode}
            shadow-mapSize={performanceMode ? [1024, 1024] : [2048, 2048]}
            shadow-camera-far={1000}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
          <pointLight position={[-100, -100, -100]} intensity={performanceMode ? 0.3 : 0.5} color="#4A90E2" />

          {/* Background */}
          <Stars 
            radius={1000} 
            depth={performanceMode ? 30 : 50} 
            count={performanceMode ? 2000 : 5000} 
            factor={performanceMode ? 3 : 4} 
            saturation={0} 
            fade 
            speed={performanceMode ? 0.5 : 1}
          />

          {/* Camera Controls */}
          <CameraController />

          {/* Earth */}
          <EarthWithRotation />

          {/* Flight Trails */}
          {settings.showTrails && (
            <FlightTrails 
              flights={filteredFlights}
              selectedFlight={selectedFlight}
            />
          )}

          {/* Aircraft */}
          {filteredFlights.map((aircraft) => (
            <InteractiveAircraft
              key={aircraft.icao24}
              aircraft={aircraft}
              isSelected={selectedFlight?.icao24 === aircraft.icao24}
              showLabel={settings.showLabels}
              onClick={selectFlight}
            />
          ))}

          {/* Post-processing - conditionally enabled */}
          {!performanceMode && (
            <EffectComposer multisampling={4}>
              <Bloom 
                intensity={0.2} 
                luminanceThreshold={0.9} 
                luminanceSmoothing={0.025} 
              />
              <SMAA />
            </EffectComposer>
          )}

          {/* Environment for reflections */}
          <Environment preset="night" />

          {/* Performance Monitor (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <PerformanceMonitor />
          )}
        </Suspense>
      </Canvas>

      {/* Mouse Controls Instructions Overlay */}
      <div className="absolute top-4 left-4 z-40 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-xs">
        <h3 className="font-semibold mb-2">Mouse Controls</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Left Click + Drag:</span>
            <span>Rotate View</span>
          </div>
          <div className="flex justify-between">
            <span>Right Click + Drag:</span>
            <span>Pan View</span>
          </div>
          <div className="flex justify-between">
            <span>Mouse Wheel:</span>
            <span>Zoom In/Out</span>
          </div>
          <div className="flex justify-between">
            <span>Click Aircraft:</span>
            <span>Select Flight</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scene3D;