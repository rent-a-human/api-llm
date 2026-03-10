# WALL-E Quad Jetson Orin Nano Development Environment Setup Guide

## Overview
This guide provides step-by-step instructions for setting up the Jetson Orin Nano development environment for the WALL-E Quad robot project, including ROS 2, AI/ML frameworks, and hardware integration.

---

## 1. Hardware Prerequisites

### Required Components
- [ ] Jetson Orin Nano Developer Kit
- [ ] High-speed microSD card (64GB+ UHS-3)
- [ ] USB-C power supply (official NVIDIA adapter)
- [ ] HDMI monitor and cables
- [ ] USB keyboard and mouse
- [ ] Internet connection (Ethernet recommended for setup)
- [ ] Cooling solution (fan or heat sink)

### Optional but Recommended
- [ ] NVMe SSD (Samsung 970 EVO Plus 250GB+)
- [ ] USB 3.0 hub for multiple devices
- [ ] Development laptop for remote access
- [ ] Logic analyzer for hardware debugging

---

## 2. Initial System Setup

### Step 1: Install JetPack
```bash
# Download and flash JetPack 6.0 (latest stable)
# Use NVIDIA SDK Manager or balenaEtcher

# Post-installation verification
nvidia@ubuntu:~$ jetson_release
# Should show Orin Nano with JetPack 6.0

# Update system packages
sudo apt update && sudo apt upgrade -y
sudo reboot
```

### Step 2: System Configuration
```bash
# Configure GPU performance modes
sudo nvpmodel -m 1  # 15W mode (recommended for development)
sudo nvpmodel -q    # Verify current mode

# Enable maximum CPU performance
sudo nvpmodel -m 1
echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Install essential development tools
sudo apt install -y build-essential cmake git curl wget vim htop
```

---

## 3. ROS 2 Installation and Configuration

### Step 1: Install ROS 2 Iron
```bash
# Add ROS 2 repository
sudo apt install -y software-properties-common curl
sudo add-apt-repository universe
curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo apt-key add -

# Install ROS 2 Iron desktop full
sudo apt update
sudo apt install -y ros-iron-desktop-full

# Initialize rosdep
sudo rosdep init
rosdep update

# Add ROS environment to bashrc
echo "source /opt/ros/iron/setup.bash" >> ~/.bashrc
source ~/.bashrc

# Install additional tools
sudo apt install -y \
    python3-argcomplete \
    ros-iron-ros-base \
    ros-iron-ament-cmake \
    ros-iron-ament-lint \
    python3-rosdep \
    python3-catkin-tools
```

### Step 2: Create WALL-E Workspace
```bash
# Create workspace directory
mkdir -p ~/wall_e_ws/src
cd ~/wall_e_ws

# Initialize workspace
source /opt/ros/iron/setup.bash
catkin init
catkin config --cmake-args -DCMAKE_BUILD_TYPE=Release

# Install common ROS 2 dependencies
sudo apt install -y \
    ros-iron-tf2-ros \
    ros-iron-tf2-geometry-msgs \
    ros-iron-cv-bridge \
    ros-iron-image-transport \
    ros-iron-rqt* \
    ros-iron-rviz2 \
    ros-iron-navigation2 \
    ros-iron-slam-toolbox \
    ros-iron-robot-localization \
    ros-iron-robot-state-publisher \
    ros-iron-joint-state-publisher-gui
```

---

## 4. AI/ML Framework Installation

### Step 1: Install PyTorch and CUDA
```bash
# Install PyTorch with CUDA support (PyTorch 2.0+ recommended)
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Verify CUDA installation
python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'PyTorch version: {torch.__version__}')"
# Expected: CUDA available: True, PyTorch 2.0+ cu118
```

### Step 2: Install Computer Vision Libraries
```bash
# Install OpenCV with CUDA support
pip3 install opencv-contrib-python==4.8.1.78
sudo apt install -y python3-opencv

# Install additional vision libraries
pip3 install \
    numpy \
    scipy \
    matplotlib \
    pillow \
    scikit-image \
    jupyterlab \
    seaborn \
    pandas

# Install YOLO dependencies
pip3 install ultralytics
```

### Step 3: Install Ollama for Qwen3-VL
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Install Qwen3-VL 4B model (GGUF format)
ollama pull qwen2-vl:4b

# Test installation
ollama list
ollama run qwen2-vl:4b "Hello, test basic functionality"

# Create Python wrapper
cat > ~/wall_e_ws/src/ai_interface/ollama_client.py << 'EOF'
import ollama
import asyncio
from typing import List, Dict, Optional

class QwenInterface:
    def __init__(self, model_name: str = "qwen2-vl:4b"):
        self.model_name = model_name
        self.client = ollama.Client()
        
    def analyze_image(self, image_path: str, prompt: str) -> str:
        """Analyze image with text prompt"""
        try:
            response = self.client.generate(
                model=self.model_name,
                prompt=prompt,
                images=[image_path]
            )
            return response['response']
        except Exception as e:
            return f"Error: {e}"
    
    def chat(self, messages: List[Dict[str, str]]) -> str:
        """Multi-turn conversation"""
        try:
            response = self.client.chat(
                model=self.model_name,
                messages=messages
            )
            return response['message']['content']
        except Exception as e:
            return f"Error: {e}"

# Test interface
if __name__ == "__main__":
    interface = QwenInterface()
    print("Qwen3-VL interface ready")
EOF
```

---

## 5. Hardware Integration Setup

### Step 1: Install Sensor Libraries
```bash
# Install I2C and SPI libraries
sudo apt install -y \
    i2c-tools \
    python3-smbus \
    spidev \
    python3-spidev \
    python3-rpi.gpio

# Enable I2C and SPI interfaces
sudo raspi-config  # Note: Different approach for Jetson
# Use Jetson GPIO library instead

# Install Jetson GPIO library
pip3 install Jetson.GPIO
sudo usermod -a -G gpio nvidia

# Create udev rules for sensors
sudo tee /etc/udev/rules.d/99-sensor.rules << 'EOF'
# IMU sensor
SUBSYSTEM=="i2c", ENV{ID_NAME}=="mpu6050", MODE="0666", GROUP="sudo"

# Camera permissions
SUBSYSTEM=="video4linux", MODE="0666", GROUP="sudo"
EOF

sudo udevadm control --reload-rules
```

### Step 2: Install Camera Support
```bash
# Install v4l2 utilities
sudo apt install -y v4l-utils v4l2ucp

# Install ROS camera packages
sudo apt install -y \
    ros-iron-usb-cam \
    ros-iron-image-proc \
    ros-iron-image-pipeline \
    ros-iron-camera-calibration-parsers

# Test camera connectivity
v4l2-ctl --list-devices
v4l2-ctl --device=/dev/video0 --all
```

### Step 3: Motor Control Setup
```bash
# Install PWM and servo libraries
pip3 install \
    adafruit-circuitpython-servokit \
    pigpio

# Enable pigpio service
sudo systemctl enable pigpiod
sudo systemctl start pigpiod

# Test motor control
cat > ~/wall_e_ws/src/hardware_interface/motor_test.py << 'EOF'
import pigpio
import time

class QuadrupedMotor:
    def __init__(self, servo_pin):
        self.pi = pigpio.pi()
        self.pin = servo_pin
        self.pi.set_mode(servo_pin, pigpio.OUTPUT)
        
    def set_angle(self, angle):
        # Convert angle to PWM duty cycle
        pulse = 500 + (angle * 2000 / 180)
        self.pi.set_servo_pulsewidth(self.pin, pulse)
        
    def cleanup(self):
        self.pi.stop()

# Test function
def test_all_motors():
    motor_pins = [12, 13, 18, 19, 20, 21, 22, 23]  # Example pins
    motors = [QuadrupedMotor(pin) for pin in motor_pins]
    
    try:
        for motor in motors:
            motor.set_angle(90)  # Center position
        time.sleep(2)
        
        for motor in motors:
            motor.set_angle(0)   # Minimum position
        time.sleep(1)
        
        for motor in motors:
            motor.set_angle(180) # Maximum position
        time.sleep(1)
        
    finally:
        for motor in motors:
            motor.cleanup()

if __name__ == "__main__":
    test_all_motors()
EOF
```

---

## 6. Navigation and SLAM Setup

### Step 1: Install Navigation Dependencies
```bash
# Install Nav2 dependencies
sudo apt install -y \
    ros-iron-navigation2 \
    ros-iron-slam-toolbox \
    ros-iron-robot-localization \
    ros-iron-octomap-ros \
    ros-iron-octomap-rviz-plugins

# Install additional mapping tools
sudo apt install -y \
    ros-iron-depthimage-to-laserscan \
    ros-iron-laser-geometry \
    ros-iron-laser-pipeline \
    ros-iron-pointcloud-to-laserscan2
```

### Step 2: Create WALL-E Robot Description
```bash
mkdir -p ~/wall_e_ws/src/wall_e_description
cd ~/wall_e_ws/src/wall_e_description

# Create URDF for quadruped robot
cat > wall_e.urdf << 'EOF'
<?xml version="1.0"?>
<robot name="wall_e_quad">
  <material name="blue">
    <color rgba="0.2 0.4 0.8 1.0"/>
  </material>
  
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.4 0.4 0.2"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <geometry>
        <box size="0.4 0.4 0.2"/>
      </geometry>
    </collision>
  </link>
  
  <!-- Front left leg -->
  <link name="front_left_leg">
    <visual>
      <geometry>
        <box size="0.1 0.1 0.3"/>
      </geometry>
      <material name="blue"/>
    </visual>
  </link>
  
  <joint name="front_left_hip" type="continuous">
    <parent link="base_link"/>
    <child link="front_left_leg"/>
    <origin xyz="0.15 0.15 -0.15"/>
    <axis xyz="0 1 0"/>
  </joint>
  
  <!-- Additional leg joints would be defined here -->
  
  <!-- Camera -->
  <link name="camera_link">
    <visual>
      <geometry>
        <box size="0.05 0.05 0.05"/>
      </geometry>
    </visual>
  </link>
  
  <joint name="camera_joint" type="fixed">
    <parent link="base_link"/>
    <child link="camera_link"/>
    <origin xyz="0 0 0.1"/>
  </joint>
  
  <!-- IMU -->
  <link name="imu_link">
    <visual>
      <geometry>
        <box size="0.02 0.02 0.01"/>
      </geometry>
    </visual>
  </link>
  
  <joint name="imu_joint" type="fixed">
    <parent link="base_link"/>
    <child link="imu_link"/>
    <origin xyz="0 0 0.1"/>
  </joint>
</robot>
EOF

# Create launch file
cat > launch/description.launch.py << 'EOF'
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation time'
        ),
        
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            parameters=[{'use_sim_time': LaunchConfiguration('use_sim_time')}],
            arguments=[{'model_description': open('/home/nvidia/wall_e_ws/src/wall_e_description/wall_e.urdf').read()}]
        ),
        
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
            name='joint_state_publisher_gui'
        )
    ])
EOF
```

---

## 7. Power Management Setup

### Step 1: Install Power Monitoring
```bash
# Create power monitoring script
cat > ~/wall_e_ws/src/system_monitor/power_monitor.py << 'EOF'
import subprocess
import time
import json
from datetime import datetime

class PowerMonitor:
    def __init__(self):
        self.log_file = "/home/nvidia/power_log.csv"
        self.start_logging()
    
    def get_power_data(self):
        """Get current power consumption data"""
        try:
            # Get current power mode
            result = subprocess.run(['nvpmodel', '-q'], 
                                  capture_output=True, text=True)
            
            # Get temperature
            temp_result = subprocess.run(['cat', '/sys/class/thermal/thermal_zone0/temp'], 
                                       capture_output=True, text=True)
            temp = int(temp_result.stdout.strip()) / 1000.0
            
            # Get CPU frequency
            cpu_result = subprocess.run(['nvidia-smi', '--query-gpu=power.draw', '--format=csv,noheader,nounits'], 
                                      capture_output=True, text=True)
            
            return {
                'timestamp': datetime.now().isoformat(),
                'power_mode': result.stdout.strip(),
                'temperature': temp,
                'gpu_power': cpu_result.stdout.strip()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def start_logging(self):
        """Start continuous power monitoring"""
        with open(self.log_file, 'w') as f:
            f.write('timestamp,power_mode,temperature,gpu_power\n')
        
        print(f"Power monitoring started. Log file: {self.log_file}")
        
        while True:
            data = self.get_power_data()
            if 'error' not in data:
                with open(self.log_file, 'a') as f:
                    f.write(f"{data['timestamp']},{data['power_mode']},{data['temperature']},{data['gpu_power']}\n")
            time.sleep(10)  # Log every 10 seconds
    
    def get_battery_estimate(self, battery_capacity_wh=100):
        """Estimate remaining battery life"""
        current_data = self.get_power_data()
        if 'error' not in current_data:
            # Estimate current power draw (rough approximation)
            power_watts = float(current_data.get('gpu_power', '15'))
            hours_remaining = battery_capacity_wh / power_watts
            return f"Estimated battery life: {hours_remaining:.1f} hours"
        return "Unable to estimate battery life"

if __name__ == "__main__":
    monitor = PowerMonitor()
EOF

# Make script executable
chmod +x ~/wall_e_ws/src/system_monitor/power_monitor.py
```

---

## 8. Integration Testing

### Step 1: Create System Test Suite
```bash
mkdir -p ~/wall_e_ws/src/system_tests

# Hardware test
cat > ~/wall_e_ws/src/system_tests/hardware_test.py << 'EOF'
#!/usr/bin/env python3
import time
import subprocess
import sys

def test_cuda():
    """Test CUDA availability"""
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA available: {torch.cuda.get_device_name(0)}")
            return True
        else:
            print("❌ CUDA not available")
            return False
    except ImportError:
        print("❌ PyTorch not installed")
        return False

def test_sensors():
    """Test sensor connectivity"""
    tests = {
        "I2C": subprocess.run(['i2cdetect', '-y', '1'], 
                             capture_output=True).returncode == 0,
        "Camera": subprocess.run(['v4l2-ctl', '--list-devices'], 
                               capture_output=True).returncode == 0,
        "GPIO": subprocess.run(['ls', '/sys/class/gpio'], 
                             capture_output=True).returncode == 0
    }
    
    for test_name, result in tests.items():
        status = "✅" if result else "❌"
        print(f"{status} {test_name} test")
    
    return all(tests.values())

def test_ros():
    """Test ROS 2 installation"""
    try:
        result = subprocess.run(['ros2', 'topic', 'list'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ ROS 2 working")
            return True
        else:
            print("❌ ROS 2 not working")
            return False
    except Exception:
        print("❌ ROS 2 not installed")
        return False

def test_ai_models():
    """Test AI model loading"""
    try:
        # Test YOLO
        from ultralytics import YOLO
        model = YOLO('yolov8n.pt')
        print("✅ YOLOv8n model loaded")
        
        # Test Ollama
        import ollama
        response = ollama.list()
        if response:
            print("✅ Ollama available")
        return True
    except Exception as e:
        print(f"❌ AI model test failed: {e}")
        return False

def main():
    """Run all system tests"""
    print("WALL-E Quad System Test Suite")
    print("=" * 40)
    
    tests = {
        "CUDA/GPU": test_cuda,
        "Sensors": test_sensors,
        "ROS 2": test_ros,
        "AI Models": test_ai_models
    }
    
    results = {}
    for test_name, test_func in tests.items():
        print(f"\nRunning {test_name} test...")
        results[test_name] = test_func()
        time.sleep(1)
    
    print("\n" + "=" * 40)
    print("Test Results Summary:")
    passed = sum(results.values())
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! System ready for WALL-E development.")
        return 0
    else:
        print("⚠️  Some tests failed. Review setup before proceeding.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
EOF

chmod +x ~/wall_e_ws/src/system_tests/hardware_test.py
```

---

## 9. Development Workflow

### Step 1: Create Development Scripts
```bash
# Main development setup script
cat > ~/wall_e_ws/setup_dev_env.sh << 'EOF'
#!/bin/bash
echo "Setting up WALL-E Quad development environment..."

# Source ROS 2
source /opt/ros/iron/setup.bash

# Source workspace
source ~/wall_e_ws/install/setup.bash

# Set environment variables
export WALL_E_ROBOT_NAME=wall_e_quad
export WALL_E_WS_DIR=~/wall_e_ws
export WALL_E_LOG_DIR=~/wall_e_logs

# Create log directory
mkdir -p $WALL_E_LOG_DIR

# Set ROS domain ID (avoid conflicts)
export ROS_DOMAIN_ID=42

# Start power monitoring in background
python3 ~/wall_e_ws/src/system_monitor/power_monitor.py &
echo "Power monitoring started (PID: $!)"

echo "Development environment ready!"
echo "Workspace: $WALL_E_WS_DIR"
echo "Logs: $WALL_E_LOG_DIR"
EOF

chmod +x ~/wall_e_ws/setup_dev_env.sh

# Create build script
cat > ~/wall_e_ws/build_all.sh << 'EOF'
#!/bin/bash
echo "Building WALL-E workspace..."

# Source environment
source setup_dev_env.sh

# Clean previous builds
rm -rf build install log

# Build workspace
colcon build --packages-select wall_e_description wall_e_navigation wall_e_ai wall_e_hardware wall_e_control

# Install Python dependencies
pip3 install -r requirements.txt

echo "Build complete!"
EOF

chmod +x ~/wall_e_ws/build_all.sh
```

### Step 2: Performance Optimization
```bash
# Create optimization script
cat > ~/wall_e_ws/optimize_performance.sh << 'EOF'
#!/bin/bash
echo "Optimizing Jetson Orin Nano for WALL-E Quad..."

# Set performance mode
sudo nvpmodel -m 1  # 15W mode

# Configure CPU governor
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Set GPU performance level
sudo nvidia-smi -pl 25  # Set power limit to 25W

# Optimize memory management
echo 1 | sudo tee /proc/sys/vm/drop_caches

# Configure swap (reduce to save memory)
sudo swapoff -a
sudo swapon /var/swapfile

# Set up thermal monitoring
sudo systemctl enable nvfancontrol

echo "Performance optimization complete!"
nvidia-smi
EOF

chmod +x ~/wall_e_ws/optimize_performance.sh
```

---

## 10. Quick Start Commands

### Essential Commands Reference
```bash
# Daily development workflow
cd ~/wall_e_ws
source setup_dev_env.sh

# Build and install packages
./build_all.sh

# Run hardware tests
./src/system_tests/hardware_test.py

# Start navigation simulation
ros2 launch nav2_bringup navigation_launch.py

# Test AI models
python3 -c "
from src.ai_interface.ollama_client import QwenInterface
interface = QwenInterface()
print('Qwen3-VL ready for WALL-E!')
"

# Monitor system performance
htop
nvidia-smi
python3 src/system_monitor/power_monitor.py

# Test motor control
python3 src/hardware_interface/motor_test.py
```

### Common Development Tasks
```bash
# Add new sensor support
sudo apt install ros-iron-<sensor-package>
pip3 install <python-sensor-library>

# Create new ROS 2 package
ros2 pkg create --build-type ament_python wall_e_<component>

# Test camera feed
ros2 run usb_cam usb_cam_node_exe

# Calibrate camera
ros2 run camera_calibration cameracalibrator.py --size 8x6 --square 0.108 image:=/dev/video0

# Test navigation stack
ros2 launch nav2_bringup tb3_simulation_launch.py
```

---

## 11. Troubleshooting Guide

### Common Issues and Solutions

#### CUDA Not Available
```bash
# Check CUDA installation
nvcc --version
nvidia-smi

# Reinstall PyTorch with correct CUDA version
pip3 uninstall torch torchvision torchaudio
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### ROS 2 Package Issues
```bash
# Reset ROS 2 environment
rm -rf ~/.local/share/colcon__log
rm -rf ~/.cache/colcon_cd

# Re-source ROS installation
source /opt/ros/iron/setup.bash
```

#### Motor Control Issues
```bash
# Check GPIO permissions
ls -la /sys/class/gpio/
sudo usermod -a -G gpio $USER

# Restart pigpio service
sudo systemctl restart pigpiod
```

#### Power Throttling
```bash
# Check thermal status
cat /sys/class/thermal/thermal_zone0/temp
nvidia-smi

# Adjust power modes
sudo nvpmodel -m 1  # 15W
sudo nvpmodel -m 2  # 7W (thermal issues)
```

---

## 12. Development Timeline

### Week 1: Basic Setup
- [ ] Hardware assembly and testing
- [ ] JetPack installation and configuration
- [ ] ROS 2 installation and workspace setup
- [ ] Basic motor control implementation

### Week 2: Sensor Integration
- [ ] Camera integration and calibration
- [ ] IMU sensor setup
- [ ] Motor controller integration
- [ ] Basic sensor fusion

### Week 3: AI Integration
- [ ] YOLO object detection setup
- [ ] Qwen3-VL model deployment
- [ ] AI navigation planning
- [ ] Voice interface integration

### Week 4: System Integration
- [ ] Full navigation stack integration
- [ ] Power management optimization
- [ ] Performance benchmarking
- [ ] Field testing preparation

---

This comprehensive setup guide provides everything needed to establish a robust development environment for the WALL-E Quad robot on the Jetson Orin Nano platform. The modular approach allows for incremental development and testing at each stage.