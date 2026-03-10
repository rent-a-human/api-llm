import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh, ShaderMaterial, TextureLoader } from 'three';
import * as THREE from 'three';

interface EarthProps {
  radius?: number;
  showClouds?: boolean;
}

const Earth: React.FC<EarthProps> = ({ 
  radius = 50, 
  showClouds = true 
}) => {
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);

  // Load Earth textures with fallback
  const textures = useTexture([
    '/textures/earth/earth_atmos_2048.jpg',
    '/textures/earth/earth_normal_2048.jpg',
    '/textures/earth/earth_specular_2048.jpg',
    '/textures/earth/earth_clouds_1024.png'
  ]);

  const [earthTexture, earthNormalMap, earthSpecularMap, earthClouds] = textures;

  // Create procedural textures as fallback
  const fallbackTextures = useMemo(() => {
    const createProceduralTexture = (width: number, height: number, type: 'diffuse' | 'normal' | 'specular' | 'clouds') => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      switch (type) {
        case 'diffuse':
          // Create Earth-like gradient with continents
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, '#1e3a8a'); // Deep blue (oceans)
          gradient.addColorStop(0.3, '#3b82f6'); // Blue
          gradient.addColorStop(0.6, '#22c55e'); // Green (land)
          gradient.addColorStop(0.8, '#16a34a'); // Darker green
          gradient.addColorStop(1, '#fbbf24'); // Brown (mountains)
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);

          // Add continent-like shapes
          ctx.fillStyle = '#22c55e';
          for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 50 + 20;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
          break;

        case 'normal':
          // Create normal map with variations
          ctx.fillStyle = '#8080ff';
          ctx.fillRect(0, 0, width, height);
          
          for (let i = 0; i < 1000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const intensity = Math.random();
            ctx.fillStyle = `rgb(${Math.floor(100 + intensity * 50)}, ${Math.floor(100 + intensity * 50)}, ${Math.floor(200 + intensity * 55)})`;
            ctx.fillRect(x, y, 2, 2);
          }
          break;

        case 'specular':
          // Create specular map (white for water, dark for land)
          ctx.fillStyle = '#333333';
          ctx.fillRect(0, 0, width, height);
          
          for (let i = 0; i < 500; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const intensity = Math.random() * 0.8;
            ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
            ctx.fillRect(x, y, 3, 3);
          }
          break;

        case 'clouds':
          // Semi-transparent white cloud patterns
          ctx.fillStyle = 'rgba(255, 255, 255, 0)';
          ctx.fillRect(0, 0, width, height);
          
          for (let i = 0; i < 300; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 30 + 10;
            const opacity = Math.random() * 0.6 + 0.1;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 8;
      return texture;
    };

    return [
      createProceduralTexture(512, 256, 'diffuse'),
      createProceduralTexture(512, 256, 'normal'),
      createProceduralTexture(512, 256, 'specular'),
      createProceduralTexture(512, 256, 'clouds')
    ];
  }, []);

  // Configure texture properties
  useMemo(() => {
    [earthTexture, earthNormalMap, earthSpecularMap, earthClouds].forEach(texture => {
      if (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 8;
      }
    });

    fallbackTextures.forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 8;
    });
  }, [earthTexture, earthNormalMap, earthSpecularMap, earthClouds, fallbackTextures]);

  // Atmospheric glow shader
  const atmosphereShader = useMemo(() => {
    return {
      uniforms: {
        'c': { value: 0.3 },
        'p': { value: 4.0 },
        glowColor: { value: new THREE.Color('#4A90E2') },
        viewVector: { value: new THREE.Vector3() }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(c - dot(vNormal, vNormel), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    };
  }, []);

  // Animation loop
  useFrame(({ camera }) => {
    if (earthRef.current) {
      // Rotate Earth slowly
      earthRef.current.rotation.y += 0.001;
    }
    
    if (cloudsRef.current && showClouds) {
      // Rotate clouds slightly faster than Earth
      cloudsRef.current.rotation.y += 0.0015;
    }

    // Update atmosphere shader uniform
    if (atmosphereRef.current && atmosphereShader.uniforms) {
      atmosphereShader.uniforms.viewVector.value = 
        new THREE.Vector3().subVectors(camera.position, atmosphereRef.current.position);
    }
  });

  // Use loaded textures or fallbacks
  const finalTextures = useMemo(() => {
    return [
      earthTexture || fallbackTextures[0],
      earthNormalMap || fallbackTextures[1], 
      earthSpecularMap || fallbackTextures[2],
      earthClouds || fallbackTextures[3]
    ];
  }, [earthTexture, earthNormalMap, earthSpecularMap, earthClouds, fallbackTextures]);

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[radius, 64, 32]} />
        <meshPhongMaterial
          map={finalTextures[0]}
          normalMap={finalTextures[1]}
          specularMap={finalTextures[2]}
          specular={new THREE.Color('#222222')}
          shininess={15}
        />
      </mesh>

      {/* Cloud layer */}
      {showClouds && (
        <mesh ref={cloudsRef} position={[0, 0, 0]}>
          <sphereGeometry args={[radius + 0.5, 64, 32]} />
          <meshLambertMaterial
            map={finalTextures[3]}
            transparent={true}
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Atmospheric glow */}
      <mesh ref={atmosphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[radius + 2, 64, 32]} />
        <shaderMaterial
          {...atmosphereShader}
          uniforms={atmosphereShader.uniforms}
          vertexShader={atmosphereShader.vertexShader}
          fragmentShader={atmosphereShader.fragmentShader}
        />
      </mesh>
    </group>
  );
};

export { Earth };