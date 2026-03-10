import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { AircraftModel } from '../types/flight';
import { latLngToVector3 } from '../services/flightService';

interface FlightTrailsProps {
  flights: AircraftModel[];
  selectedFlight?: AircraftModel | null;
  maxTrailLength?: number;
}

const FlightTrails: React.FC<FlightTrailsProps> = ({
  flights,
  selectedFlight,
  maxTrailLength = 50
}) => {
  // Generate trail lines for all flights
  const trails = useMemo(() => {
    return flights.map((aircraft) => {
      const { trail } = aircraft;
      
      // Limit trail length
      const limitedTrail = trail.slice(-maxTrailLength);
      
      // Convert lat/lng/alt to 3D coordinates
      const trailPoints = limitedTrail.map((position) => {
        const baseRadius = 50;
        const altitudeScale = (position.altitude || 0) / 1000;
        const pos = latLngToVector3(position.latitude, position.longitude, baseRadius + altitudeScale);
        
        // Add surface offset to prevent z-fighting
        const surfacePos = latLngToVector3(position.latitude, position.longitude, baseRadius + 0.1);
        const normal = new THREE.Vector3(surfacePos.x, surfacePos.y, surfacePos.z).normalize();
        
        return new Vector3(
          pos.x + normal.x * 0.2,
          pos.y + normal.y * 0.2,
          pos.z + normal.z * 0.2
        );
      });

      // Only create trail if we have at least 2 points
      if (trailPoints.length < 2) {
        return null;
      }

      const isSelected = selectedFlight?.icao24 === aircraft.icao24;
      const opacity = isSelected ? 0.8 : 0.3;
      const color = isSelected ? '#ff6b6b' : '#4a90e2';
      const lineWidth = isSelected ? 3 : 1;

      return {
        id: aircraft.icao24,
        points: trailPoints,
        color,
        opacity,
        lineWidth,
        isSelected
      };
    }).filter(Boolean);
  }, [flights, selectedFlight, maxTrailLength]);

  // Create animated trail for selected flight
  const selectedFlightTrail = useMemo(() => {
    if (!selectedFlight || selectedFlight.trail.length < 2) return null;

    const { trail } = selectedFlight;
    const baseRadius = 50;
    const now = Date.now();
    
    // Create gradient trail with different opacity for recent positions
    const trailPoints = trail.map((position, index) => {
      const age = now - position.timestamp;
      const opacity = Math.max(0, 1 - (age / (5 * 60 * 1000))); // Fade over 5 minutes
      
      const altitudeScale = (position.altitude || 0) / 1000;
      const pos = latLngToVector3(position.latitude, position.longitude, baseRadius + altitudeScale);
      
      const surfacePos = latLngToVector3(position.latitude, position.longitude, baseRadius + 0.1);
      const normal = new THREE.Vector3(surfacePos.x, surfacePos.y, surfacePos.z).normalize();
      
      return {
        position: new Vector3(
          pos.x + normal.x * 0.3,
          pos.y + normal.y * 0.3,
          pos.z + normal.z * 0.3
        ),
        opacity: opacity * 0.8
      };
    });

    return trailPoints;
  }, [selectedFlight]);

  return (
    <group>
      {/* Regular flight trails */}
      {trails.map((trail) => (
        <Line
          key={trail.id}
          points={trail.points}
          color={trail.color}
          lineWidth={trail.lineWidth}
          transparent
          opacity={trail.opacity}
          dashed={false}
        />
      ))}

      {/* Selected flight enhanced trail */}
      {selectedFlightTrail && (
        <group>
          {selectedFlightTrail.map((point, index) => {
            if (index === 0) return null;
            
            const prevPoint = selectedFlightTrail[index - 1];
            const midpoint = new Vector3().addVectors(point.position, prevPoint.position).multiplyScalar(0.5);
            const distance = point.position.distanceTo(prevPoint.position);
            
            // Create animated particle for trail effect
            return (
              <mesh key={index} position={midpoint}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial 
                  color="#ff6b6b" 
                  transparent 
                  opacity={point.opacity}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Flight path prediction */}
      {selectedFlight && (
        <FlightPathPrediction 
          aircraft={selectedFlight}
          baseRadius={50}
        />
      )}
    </group>
  );
};

// Component to show predicted flight path
const FlightPathPrediction: React.FC<{
  aircraft: AircraftModel;
  baseRadius: number;
}> = ({ aircraft, baseRadius }) => {
  const prediction = useMemo(() => {
    const { position } = aircraft;
    const { velocity, heading } = position;
    
    if (!velocity || !heading) return null;

    // Simple prediction based on current velocity and heading
    const predictions = [];
    const timeStep = 60; // 1 minute intervals
    const maxSteps = 30; // 30 minutes prediction
    
    const speedKmh = velocity;
    const speedKmMin = speedKmh / 60; // km per minute
    const headingRad = heading * (Math.PI / 180);
    
    let currentLat = position.latitude;
    let currentLng = position.longitude;
    
    for (let i = 1; i <= maxSteps; i++) {
      // Simple distance calculation (not accounting for Earth's curvature)
      const distance = speedKmMin * timeStep * i;
      const distanceInDegrees = distance / 111; // Rough conversion km to degrees
      
      const deltaLat = distanceInDegrees * Math.cos(headingRad);
      const deltaLng = distanceInDegrees * Math.sin(headingRad) / Math.cos(currentLat * (Math.PI / 180));
      
      const predictedLat = currentLat + deltaLat;
      const predictedLng = currentLng + deltaLng;
      
      // Calculate altitude change (assuming constant climb/descent)
      const altitudeChange = (aircraft.position.altitude || 0) + (i * 100); // Assume 100m per minute change
      
      const altitudeScale = altitudeChange / 1000;
      const pos = latLngToVector3(predictedLat, predictedLng, baseRadius + altitudeScale);
      
      const surfacePos = latLngToVector3(predictedLat, predictedLng, baseRadius + 0.1);
      const normal = new THREE.Vector3(surfacePos.x, surfacePos.y, surfacePos.z).normalize();
      
      predictions.push(
        new Vector3(
          pos.x + normal.x * 0.1,
          pos.y + normal.y * 0.1,
          pos.z + normal.z * 0.1
        )
      );
    }
    
    return predictions;
  }, [aircraft, baseRadius]);

  if (!prediction) return null;

  return (
    <group>
      <Line
        points={prediction}
        color="#ffff00"
        lineWidth={1}
        transparent
        opacity={0.4}
        dashed={true}
        dashSize={1}
        gapSize={0.5}
      />
      
      {/* Prediction markers */}
      {prediction.filter((_, index) => index % 5 === 0).map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

export { FlightTrails };