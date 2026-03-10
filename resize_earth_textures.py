#!/usr/bin/env python3
"""
Resize Earth textures to the correct dimensions for Three.js
"""

import os
import sys

# Try to import PIL, if not available use a different approach
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("PIL not available, using alternative resize method")

def resize_with_pil(input_path, output_path, size):
    """Resize image using PIL"""
    with Image.open(input_path) as img:
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to exact dimensions
        resized = img.resize(size, Image.Resampling.LANCZOS)
        resized.save(output_path, quality=95)
    print(f"✓ Resized {os.path.basename(input_path)} to {size}")

def resize_with_convert(input_path, output_path, size):
    """Resize image using convert command"""
    import subprocess
    try:
        cmd = ['convert', input_path, '-resize', f'{size[0]}x{size[1]}!', output_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ Resized {os.path.basename(input_path)} to {size}")
        else:
            print(f"✗ Failed to resize {input_path}: {result.stderr}")
    except Exception as e:
        print(f"✗ Error resizing {input_path}: {e}")

def create_proper_textures():
    """Create textures with proper dimensions"""
    textures_dir = "flight-tracker-3d/public/textures/earth"
    
    # Input files (downloaded from Three.js)
    input_files = [
        ("earth_atmos_2048.jpg", "earth_atmos_2048.jpg", (2048, 2048)),
        ("earth_normal_2048.jpg", "earth_normal_2048.jpg", (2048, 2048)),
        ("earth_specular_2048.jpg", "earth_specular_2048.jpg", (2048, 2048)),
        ("earth_clouds_1024.png", "earth_clouds_1024.png", (1024, 1024))
    ]
    
    for input_file, output_file, target_size in input_files:
        input_path = f"{textures_dir}/{input_file}"
        output_path = f"{textures_dir}/{output_file}"
        
        if not os.path.exists(input_path):
            print(f"✗ Input file missing: {input_path}")
            continue
        
        if PIL_AVAILABLE:
            resize_with_pil(input_path, output_path, target_size)
        else:
            # Try using convert command
            resize_with_convert(input_path, output_path, target_size)

def verify_textures():
    """Verify textures have correct dimensions"""
    textures_dir = "flight-tracker-3d/public/textures/earth"
    
    expected = {
        "earth_atmos_2048.jpg": (2048, 2048),
        "earth_normal_2048.jpg": (2048, 2048),
        "earth_specular_2048.jpg": (2048, 2048),
        "earth_clouds_1024.png": (1024, 1024)
    }
    
    all_good = True
    for filename, expected_size in expected.items():
        filepath = f"{textures_dir}/{filename}"
        if os.path.exists(filepath):
            if PIL_AVAILABLE:
                try:
                    with Image.open(filepath) as img:
                        actual_size = img.size
                        if actual_size == expected_size:
                            print(f"✓ {filename}: {actual_size}")
                        else:
                            print(f"⚠ {filename}: {actual_size} (expected {expected_size})")
                            all_good = False
                except Exception as e:
                    print(f"✗ {filename}: Error - {e}")
                    all_good = False
            else:
                print(f"✓ {filename}: File exists (verification skipped - no PIL)")
        else:
            print(f"✗ {filename}: Missing")
            all_good = False
    
    return all_good

def main():
    print("=== Earth Texture Resizer ===")
    
    create_proper_textures()
    print("\n=== Verification ===")
    
    if verify_textures():
        print("\n🎉 All textures properly resized!")
    else:
        print("\n⚠ Some textures may need manual adjustment")

if __name__ == "__main__":
    main()