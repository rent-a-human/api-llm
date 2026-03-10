# Earth Texture Assets

This directory contains NASA-quality Earth texture maps for the flight-tracker-3D application.

## Texture Files

### 1. earth_atmos_2048.jpg
- **Dimensions**: 2048x2048 pixels
- **Format**: JPEG
- **Type**: Atmospheric/Diffuse texture
- **Source**: Three.js examples / NASA Blue Marble
- **Description**: High-resolution daytime Earth texture showing continents, oceans, and atmospheric effects
- **Usage**: Primary color map for Earth sphere rendering

### 2. earth_normal_2048.jpg  
- **Dimensions**: 2048x2048 pixels
- **Format**: JPEG
- **Type**: Surface normal map
- **Source**: Three.js examples / NASA topography data
- **Description**: Surface elevation data converted to normal map for realistic terrain lighting
- **Usage**: Bump mapping to simulate mountains, ocean ridges, and surface topology

### 3. earth_specular_2048.jpg
- **Dimensions**: 2048x2048 pixels  
- **Format**: JPEG
- **Type**: Specular/Reflection map
- **Source**: Three.js examples / Ocean reflection data
- **Description**: Controls specular reflections for water bodies (white = reflective, black = matte)
- **Usage**: Creates realistic water reflections and land surface variations

### 4. earth_clouds_1024.png
- **Dimensions**: 1024x1024 pixels
- **Format**: PNG with alpha channel
- **Type**: Cloud layer texture
- **Source**: Three.js examples / NASA cloud imagery
- **Description**: Semi-transparent cloud patterns for atmospheric effects
- **Usage**: Separate cloud sphere layer with transparency for realistic cloud cover

## Technical Specifications

- **Resolution**: Optimized for WebGL rendering
- **Color Space**: sRGB
- **Compression**: JPEG for photographs, PNG for transparency
- **UV Mapping**: Equirectangular projection
- **Quality**: 95% JPEG quality for minimal compression artifacts

## Source and Licensing

All textures are sourced from:
- **Three.js Examples**: https://threejs.org/examples/textures/planets/
- **NASA Blue Marble Collection**: Public domain satellite imagery
- **Original Sources**: High-resolution Earth imagery from various NASA missions

### Licensing
- **NASA Content**: Public domain (no copyright restrictions)
- **Three.js Examples**: MIT License
- **Usage**: Free for commercial and non-commercial use

## WebGL Compatibility

These textures are optimized for:
- **Three.js**: Direct compatibility with React Three Fiber
- **WebGL**: Proper color space and format support
- **Performance**: Efficient file sizes for web delivery
- **Quality**: High resolution suitable for detailed 3D rendering

## Implementation Notes

1. **Loading**: Textures are loaded automatically by the Earth component
2. **Fallback**: Procedural textures are generated if files fail to load
3. **Animation**: Cloud layer rotates independently for realistic effect
4. **Lighting**: Supports Phong shading with atmospheric glow effects

## File Sizes

- earth_atmos_2048.jpg: ~500KB
- earth_normal_2048.jpg: ~330KB  
- earth_specular_2048.jpg: ~220KB
- earth_clouds_1024.png: ~250KB
- **Total**: ~1.3MB

## Updates

If you need to update these textures:
1. Replace files with same filenames and dimensions
2. Maintain format (JPEG for surface maps, PNG for clouds)
3. Test in application to ensure proper UV mapping
4. Verify WebGL compatibility with browser developer tools

---

**Generated**: March 2024  
**Version**: 1.0  
**Status**: Ready for production use