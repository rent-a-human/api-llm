// Placeholder for Earth texture fallbacks
// These would normally be actual texture image files

// You can download these textures from NASA or other sources:
// NASA Blue Marble: https://visibleearth.nasa.gov/
// Three.js examples: https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets

export const EARTH_TEXTURES = {
  diffuse: '/textures/earth/earth_atmos_2048.jpg',
  normal: '/textures/earth/earth_normal_2048.jpg', 
  specular: '/textures/earth/earth_specular_2048.jpg',
  clouds: '/textures/earth/earth_clouds_1024.png',
};

export const getEarthTextureFallback = async (textureType: keyof typeof EARTH_TEXTURES): Promise<string> => {
  // In a real application, you would implement texture generation or use a service
  // For now, we'll create a data URL with a procedural texture
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  switch (textureType) {
    case 'diffuse':
      // Create a simple gradient for the atmosphere
      const gradient = ctx.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, '#1e3a8a'); // Deep blue
      gradient.addColorStop(0.3, '#3b82f6'); // Blue
      gradient.addColorStop(0.7, '#22c55e'); // Green
      gradient.addColorStop(1, '#fbbf24'); // Yellow/brown
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
      
      // Add some noise texture
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
        ctx.fillRect(Math.random() * 512, Math.random() * 256, 1, 1);
      }
      break;
      
    case 'normal':
      // Create a normal map with some variation
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(0, 0, 512, 256);
      
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgb(${Math.random() * 50 + 100}, ${Math.random() * 50 + 100}, ${Math.random() * 50 + 200})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
      }
      break;
      
    case 'specular':
      // Simple white/gray pattern
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 512, 256);
      
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 256, 3, 3);
      }
      break;
      
    case 'clouds':
      // Semi-transparent white patterns
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
      ctx.fillRect(0, 0, 512, 256);
      
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4})`;
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 20 + 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
  }
  
  return canvas.toDataURL();
};