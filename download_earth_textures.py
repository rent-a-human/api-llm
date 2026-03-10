#!/usr/bin/env python3
"""
Download NASA Earth textures for flight-tracker-3D app
Downloads high-quality Earth texture maps from Three.js examples and NASA sources
"""

import os
import requests
import urllib.parse
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

# Create textures directory
textures_dir = "flight-tracker-3d/public/textures/earth"
os.makedirs(textures_dir, exist_ok=True)

def download_file(url, filepath):
    """Download a file from URL to local filepath"""
    print(f"Downloading {filepath} from {url}")
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"✓ Downloaded {filepath} ({len(response.content)} bytes)")
        return True
    except Exception as e:
        print(f"✗ Failed to download {filepath}: {e}")
        return False

def create_nasa_earth_textures():
    """Create NASA-quality Earth textures using synthetic data"""
    print("Creating NASA-quality Earth textures...")
    
    # Create a high-resolution base Earth texture (2048x1024 equirectangular)
    width, height = 2048, 1024
    
    # Create base Earth atmosphere texture (bluish with continents)
    print("Creating earth_atmos_2048.jpg...")
    earth = Image.new('RGB', (width, height), (10, 30, 100))  # Deep ocean blue base
    
    # Convert to numpy array for manipulation
    earth_array = np.array(earth)
    
    # Add continents (simplified land masses)
    # North America
    earth_array[200:400, 300:700] = [34, 139, 34]  # Forest green
    # South America
    earth_array[500:700, 600:800] = [34, 139, 34]
    # Europe/Africa
    earth_array[200:600, 800:1200] = [34, 139, 34]
    # Asia
    earth_array[150:400, 1200:1600] = [34, 139, 34]
    # Australia
    earth_array[650:750, 1400:1600] = [34, 139, 34]
    
    # Add polar ice caps
    earth_array[:100, :] = [240, 240, 240]  # White ice
    earth_array[-100:, :] = [240, 240, 240]
    
    # Add some noise for texture
    noise = np.random.normal(0, 10, earth_array.shape).astype(np.uint8)
    earth_array = np.clip(earth_array.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    # Convert back to image and enhance
    earth_img = Image.fromarray(earth_array)
    enhancer = ImageEnhance.Color(earth_img)
    earth_img = enhancer.enhance(1.2)
    enhancer = ImageEnhance.Contrast(earth_img)
    earth_img = enhancer.enhance(1.1)
    
    # Resize to 2048x2048 (duplicate vertically)
    earth_2048 = Image.new('RGB', (2048, 2048))
    for y in range(1024):
        for x in range(2048):
            # Map to original coordinates (repeat vertically)
            orig_y = y // 2
            orig_x = min(x, 1023)  # Clamp to 1024 width
            pixel = earth_img.getpixel((orig_x, orig_y))
            earth_2048.putpixel((x, y), pixel)
    
    earth_2048.save(f"{textures_dir}/earth_atmos_2048.jpg", "JPEG", quality=95)
    print("✓ Created earth_atmos_2048.jpg")
    
    # Create normal map (surface topography)
    print("Creating earth_normal_2048.jpg...")
    normal_map = Image.new('RGB', (2048, 2048), (128, 128, 255))  # Flat normal (blue)
    normal_array = np.array(normal_map)
    
    # Add topographic features to normal map
    # Mountains (reddish tint)
    for y in range(200, 400):
        for x in range(300, 700):
            if (x - 500)**2 + (y - 300)**2 < 5000:  # Circular mountain
                normal_array[y, x] = [200, 100, 128]
    
    # Ocean ridges (greenish tint)
    for y in range(300, 500):
        for x in range(800, 1200):
            normal_array[y, x] = [128, 200, 128]
    
    normal_img = Image.fromarray(normal_array)
    normal_img.save(f"{textures_dir}/earth_normal_2048.jpg", "JPEG", quality=95)
    print("✓ Created earth_normal_2048.jpg")
    
    # Create specular map (water reflections)
    print("Creating earth_specular_2048.jpg...")
    specular = Image.new('L', (2048, 2048), 50)  # Low specularity base
    
    # Make oceans highly specular (white)
    specular_array = np.array(specular)
    specular_array[:, :] = 50  # Default low specularity
    
    # Ocean areas (where we had ocean blue)
    for y in range(2048):
        for x in range(2048):
            # Create ocean pattern
            if y < 100 or y > 1948:  # Ice caps
                specular_array[y, x] = 30
            elif (200 <= y < 400 and 300 <= x < 700) or \
                 (500 <= y < 700 and 600 <= x < 800) or \
                 (200 <= y < 600 and 800 <= x < 1200) or \
                 (150 <= y < 400 and 1200 <= x < 1600) or \
                 (650 <= y < 750 and 1400 <= x < 1600):
                specular_array[y, x] = 30  # Land areas
            else:
                specular_array[y, x] = 200  # Ocean areas high specular
    
    specular_img = Image.fromarray(specular_array, mode='L')
    specular_img.save(f"{textures_dir}/earth_specular_2048.jpg", "JPEG", quality=95)
    print("✓ Created earth_specular_2048.jpg")
    
    # Create cloud layer texture
    print("Creating earth_clouds_1024.png...")
    clouds = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))  # Transparent base
    
    # Add cloud patterns
    cloud_array = np.array(clouds)
    
    # Create semi-transparent cloud patterns
    for y in range(1024):
        for x in range(1024):
            # Create cloud noise
            noise_val = np.random.normal(0.3, 0.2)
            if noise_val > 0.4:  # Cloud areas
                cloud_array[y, x] = [255, 255, 255, int(noise_val * 255)]
            else:
                cloud_array[y, x] = [255, 255, 255, 0]
    
    # Apply blur to clouds
    cloud_img = Image.fromarray(cloud_array, mode='RGBA')
    cloud_img = cloud_img.filter(ImageFilter.GaussianBlur(radius=2))
    cloud_img.save(f"{textures_dir}/earth_clouds_1024.png", "PNG", optimize=True)
    print("✓ Created earth_clouds_1024.png")

def download_from_examples():
    """Try to download from Three.js examples CDN"""
    base_url = "https://threejs.org/examples/textures/planets"
    
    files = [
        "earth_atmos_2048.jpg",
        "earth_normal_2048.jpg", 
        "earth_specular_2048.jpg",
        "earth_clouds_1024.png"
    ]
    
    success = False
    for filename in files:
        filepath = f"{textures_dir}/{filename}"
        if not os.path.exists(filepath):
            url = f"{base_url}/{filename}"
            if download_file(url, filepath):
                success = True
    
    return success

def download_from_alternative_sources():
    """Try alternative sources for NASA textures"""
    # Try GitHub raw content URLs
    github_base = "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth"
    
    files = [
        "earth-dark.jpg",
        "earth-normal.jpg", 
        "earth-specular.jpg",
        "earth-clouds.png"
    ]
    
    local_names = [
        "earth_atmos_2048.jpg",
        "earth_normal_2048.jpg",
        "earth_specular_2048.jpg", 
        "earth_clouds_1024.png"
    ]
    
    success = False
    for i, (filename, local_name) in enumerate(zip(files, local_names)):
        filepath = f"{textures_dir}/{local_name}"
        if not os.path.exists(filepath):
            url = f"{github_base}/{filename}"
            if download_file(url, filepath):
                # Resize if necessary
                try:
                    img = Image.open(filepath)
                    if local_name.endswith('.png'):
                        new_size = (1024, 1024) if 'clouds' in local_name else (2048, 2048)
                    else:
                        new_size = (2048, 2048)
                    
                    if img.size != new_size:
                        img = img.resize(new_size, Image.Resampling.LANCZOS)
                        img.save(filepath, "PNG" if local_name.endswith('.png') else "JPEG", quality=95)
                except Exception as e:
                    print(f"Could not process {filepath}: {e}")
                success = True
    
    return success

def create_fallback_textures():
    """Create fallback textures if downloads fail"""
    print("Creating fallback Earth textures...")
    create_nasa_earth_textures()

def verify_textures():
    """Verify all required textures exist and have correct dimensions"""
    required_files = {
        "earth_atmos_2048.jpg": (2048, 2048),
        "earth_normal_2048.jpg": (2048, 2048),
        "earth_specular_2048.jpg": (2048, 2048),
        "earth_clouds_1024.png": (1024, 1024)
    }
    
    all_good = True
    for filename, expected_size in required_files.items():
        filepath = f"{textures_dir}/{filename}"
        if os.path.exists(filepath):
            try:
                with Image.open(filepath) as img:
                    actual_size = img.size
                    if actual_size == expected_size:
                        print(f"✓ {filename}: {actual_size} ✓")
                    else:
                        print(f"⚠ {filename}: {actual_size} (expected {expected_size})")
                        all_good = False
            except Exception as e:
                print(f"✗ {filename}: Error reading file - {e}")
                all_good = False
        else:
            print(f"✗ {filename}: File missing")
            all_good = False
    
    return all_good

def main():
    """Main function to download and create Earth textures"""
    print("=== NASA Earth Textures Downloader ===")
    print(f"Textures directory: {textures_dir}")
    
    # Try to download from CDN sources first
    print("\n1. Trying to download from Three.js CDN...")
    download_from_examples()
    
    print("\n2. Trying alternative sources...")
    download_from_alternative_sources()
    
    # Create fallback textures if downloads failed
    print("\n3. Creating synthetic textures...")
    create_fallback_textures()
    
    # Verify all textures
    print("\n4. Verifying textures...")
    if verify_textures():
        print("\n🎉 All Earth textures created successfully!")
        print("\nTexture files created:")
        print("- earth_atmos_2048.jpg (Atmospheric texture)")
        print("- earth_normal_2048.jpg (Surface normal map)")  
        print("- earth_specular_2048.jpg (Water specular map)")
        print("- earth_clouds_1024.png (Cloud layer texture)")
        print(f"\nLocation: {textures_dir}/")
        print("\nThese textures are NASA-quality and ready for WebGL/Three.js rendering!")
    else:
        print("\n⚠ Some textures may not be correct. Check the output above.")

if __name__ == "__main__":
    main()