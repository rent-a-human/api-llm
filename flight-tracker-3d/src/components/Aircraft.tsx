import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AircraftModel } from '../types/flight';
import { latLngToVector3 } from '../services/flightService';
import * as THREE from 'three';

interface AircraftProps {
  aircraft: AircraftModel;
  isSelected: boolean;
  showLabel: boolean;
  onClick?: (aircraft: AircraftModel) => void;
}

const Aircraft: React.FC<AircraftProps> = ({
  aircraft,
  isSelected,
  showLabel,
  onClick
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Convert lat/lng to 3D coordinates
  const position = useMemo(() => {
    const { latitude, longitude, altitude } = aircraft.position;
    const baseRadius = 50;
    const altitudeScale = (altitude || 0) / 1000; // Scale altitude
    const pos = latLngToVector3(latitude, longitude, baseRadius + altitudeScale);
    
    // Add small offset to prevent z-fighting
    const offset = latLngToVector3(latitude, longitude, baseRadius + 0.1);
    const normal = new THREE.Vector3(offset.x, offset.y, offset.z).normalize();
    
    return new THREE.Vector3(
      pos.x + normal.x * 0.5,
      pos.y + normal.y * 0.5,
      pos.z + normal.z * 0.5
    );
  }, [aircraft.position]);

  // Simple aircraft geometry (fallback if 3D model doesn't load)
  const SimpleAircraft = useMemo(() => {
    return () => (
      <group>
        {/* Fuselage */}
        <mesh>
          <boxGeometry args={[2, 0.3, 0.3]} />
          <meshPhongMaterial color={isSelected ? '#ff6b6b' : '#4a90e2'} />
        </mesh>
        
        {/* Wings */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.1, 3]} />
          <meshPhongMaterial color={isSelected ? '#ff6b6b' : '#4a90e2'} />
        </mesh>
        
        {/* Tail */}
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.8]} />
          <meshPhongMaterial color={isSelected ? '#ff6b6b' : '#4a90e2'} />
        </mesh>
        
        {/* Nose cone */}
        <mesh position={[1.2, 0, 0]}>
          <coneGeometry args={[0.15, 0.4]} />
          <meshPhongMaterial color={isSelected ? '#ff6b6b' : '#4a90e2'} />
        </mesh>
      </group>
    );
  }, [isSelected]);

  // Animation and rotation
  useFrame(() => {
    if (!meshRef.current) return;

    const { heading } = aircraft.position;
    
    // Convert heading to radians and adjust for Three.js coordinate system
    const headingRad = (heading || 0) * (Math.PI / 180);
    
    // Calculate rotation to face the direction of travel
    // In Three.js, we need to account for the coordinate system differences
    const rotationY = -headingRad + Math.PI / 2;
    
    // Smooth rotation interpolation
    const currentRotation = meshRef.current.rotation.y;
    const targetRotation = rotationY;
    const lerpFactor = 0.1;
    
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      currentRotation,
      targetRotation,
      lerpFactor
    );

    // Add slight banking for turns
    const velocity = aircraft.position.velocity || 0;
    const bankAngle = Math.sin(Date.now() * 0.001) * 0.1 * Math.min(velocity / 500, 1);
    meshRef.current.rotation.z = bankAngle;

    // Scale animation for selected/hovered aircraft
    const targetScale = hovered || isSelected ? 1.2 : 1;
    const currentScale = meshRef.current.scale.x;
    const scaleLerp = 0.1;
    
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(currentScale, targetScale, scaleLerp)
    );
  });

  // Flight info label
  const FlightLabel = useMemo(() => {
    const { callsign, origin_country } = aircraft.flightData;
    const { velocity, altitude } = aircraft.position;
    
    return (
      <Billboard>
        <Text
          position={[0, 3, 0]}
          fontSize={1.5}
          color={isSelected ? '#ff6b6b' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {callsign || aircraft.icao24}
        </Text>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.8}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {Math.round(velocity || 0)} km/h
        </Text>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.8}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {Math.round(altitude || 0)}m
        </Text>
      </Billboard>
    );
  }, [aircraft, isSelected]);

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(aircraft);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <SimpleAircraft />
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -2, 0]}>
          <ringGeometry args={[3, 3.5, 16]} />
          <meshBasicMaterial 
            color="#ff6b6b" 
            transparent 
            opacity={0.6} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover indicator */}
      {hovered && !isSelected && (
        <mesh position={[0, -1.5, 0]}>
          <ringGeometry args={[2, 2.3, 16]} />
          <meshBasicMaterial 
            color="#4a90e2" 
            transparent 
            opacity={0.4} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Flight information label */}
      {showLabel && (hovered || isSelected) && <FlightLabel />}

      {/* Velocity vector indicator */}
      {isSelected && (
        <group>
          {/* Direction line */}
          <mesh position={[3, 0, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 6]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} />
          </mesh>
          
          {/* Arrow head */}
          <mesh position={[6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <coneGeometry args={[0.2, 0.5, 8]} />
            <meshBasicMaterial color="#ff6b6b" />
          </mesh>
        </group>
      )}

      {/* Altitude indicator */}
      <mesh position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]} visible={isSelected}>
        <cylinderGeometry args={[0.02, 0.02, 8]} />
        <meshBasicMaterial color="#ff6b6b" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export { Aircraft };