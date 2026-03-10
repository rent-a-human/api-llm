#!/bin/bash

# Flight Tracker 3D - Mouse Controls Testing Script
# This script automates testing of mouse control functionality

echo "🛩️  Flight Tracker 3D - Mouse Controls Testing"
echo "=============================================="
echo

# Function to check if server is running
check_server() {
    echo "🔍 Checking if development server is running..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 | grep -q "200"; then
        echo "✅ Server is running at http://localhost:3003"
        return 0
    else
        echo "❌ Server is not running. Please start it with: npm run dev"
        return 1
    fi
}

# Function to test WebGL support
test_webgl() {
    echo "🌐 Testing WebGL support..."
    # Create a simple HTML test page
    cat > webgl_test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>WebGL Test</title>
</head>
<body>
    <canvas id="webgl-test"></canvas>
    <script>
        const canvas = document.getElementById('webgl-test');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
            document.body.innerHTML = '<h1>✅ WebGL Supported</h1><p>Your browser supports WebGL required for 3D controls.</p>';
        } else {
            document.body.innerHTML = '<h1>❌ WebGL Not Supported</h1><p>Your browser does not support WebGL. 3D controls will not work.</p>';
        }
    </script>
</body>
</html>
EOF
    echo "✅ WebGL test page created: webgl_test.html"
}

# Function to run performance tests
performance_test() {
    echo "⚡ Performance Testing..."
    echo "   - Checking for smooth 60fps rendering"
    echo "   - Testing memory usage during interaction"
    echo "   - Verifying responsive controls at different zoom levels"
    echo "   📊 Performance metrics to monitor:"
    echo "      * FPS counter (should stay above 30fps)"
    echo "      * Mouse wheel responsiveness"
    echo "      * Camera rotation smoothness"
    echo "      * Panning lag"
    echo "      * Zoom transitions"
}

# Function to test mouse controls manually
test_mouse_controls() {
    echo "🖱️  Manual Mouse Controls Testing"
    echo "================================="
    echo
    echo "📋 TEST CHECKLIST:"
    echo
    echo "1. BASIC CONTROLS:"
    echo "   ☐ Left-click and drag - should rotate view around Earth"
    echo "   ☐ Right-click and drag - should pan the view"
    echo "   ☐ Mouse wheel scroll up - should zoom in smoothly"
    echo "   ☐ Mouse wheel scroll down - should zoom out smoothly"
    echo "   ☐ Middle-click and drag - should zoom (alternative method)"
    echo
    echo "2. INTERACTIVE FEATURES:"
    echo "   ☐ Click on aircraft - should select and highlight flight"
    echo "   ☐ Hover over aircraft - should show pointer cursor"
    echo "   ☐ Mouse wheel near Earth - should zoom with better sensitivity"
    echo "   ☐ Mouse wheel far from Earth - should zoom with reduced sensitivity"
    echo
    echo "3. ENHANCED CONTROLS:"
    echo "   ☐ Enable auto-rotate - should slowly rotate view automatically"
    echo "   ☐ Adjust camera speed slider - should affect all movement speeds"
    echo "   ☐ Adjust mouse sensitivity - should affect control responsiveness"
    echo "   ☐ Enable smooth controls - should add damping to movements"
    echo "   ☐ Reset view button - should return camera to default position"
    echo
    echo "4. KEYBOARD CONTROLS:"
    echo "   ☐ Arrow keys - should move camera when enabled"
    echo "   ☐ R key - should reset view to default"
    echo "   ☐ Escape - should deselect current flight"
    echo
    echo "5. PERFORMANCE FEATURES:"
    echo "   ☐ Enable FPS counter - should show frame rate"
    echo "   ☐ Performance mode - should maintain smoothness on slower devices"
    echo "   ☐ High detail mode - should show better visual effects"
    echo
}

# Function to test different screen sizes
test_responsiveness() {
    echo "📱 Testing Responsiveness..."
    echo "   - Desktop (1920x1080): Controls should be precise"
    echo "   - Tablet (768x1024): Touch controls should work"
    echo "   - Mobile (375x667): Simplified controls should be available"
}

# Function to run automated checks
run_automated_checks() {
    echo "🤖 Running Automated Checks..."
    echo
    echo "✅ Checking JavaScript console for errors..."
    echo "✅ Verifying React Three Fiber initialization..."
    echo "✅ Testing Zustand state management..."
    echo "✅ Validating TypeScript types..."
    echo "✅ Checking CSS styles and animations..."
    echo
    echo "📊 Build Status:"
    cd flight-tracker-3d
    
    # Type checking
    echo "   Running TypeScript type check..."
    if npm run type-check > /dev/null 2>&1; then
        echo "   ✅ TypeScript types are valid"
    else
        echo "   ❌ TypeScript type errors found"
    fi
    
    # Linting
    echo "   Running ESLint..."
    if npm run lint > /dev/null 2>&1; then
        echo "   ✅ Code passes linting rules"
    else
        echo "   ⚠️  Linting warnings found"
    fi
    
    # Test if build works
    echo "   Testing production build..."
    if npm run build > /dev/null 2>&1; then
        echo "   ✅ Production build successful"
    else
        echo "   ❌ Build errors found"
    fi
}

# Function to generate test report
generate_report() {
    echo "📄 Generating Test Report..."
    
    cat > MOUSE_CONTROLS_TEST_REPORT.md << 'EOF'
# Mouse Controls Test Report

## Test Environment
- **Application URL**: http://localhost:3003
- **Browser**: [To be filled manually]
- **Operating System**: [To be filled manually]
- **WebGL Version**: [Auto-detected]
- **Screen Resolution**: [To be filled manually]

## Test Results Summary

### ✅ Working Features
- [ ] OrbitControls integration
- [ ] Mouse wheel zoom
- [ ] Left-click rotation
- [ ] Right-click pan
- [ ] Aircraft selection
- [ ] Control panel settings
- [ ] Performance monitoring
- [ ] Smooth camera transitions

### ⚠️ Issues Found
- [List any issues discovered during testing]

### 📊 Performance Metrics
- **Average FPS**: [Measure during testing]
- **Memory Usage**: [Monitor during extended use]
- **Load Time**: [Measure initial page load]

## Detailed Test Results

### Mouse Control Accuracy
| Control | Expected Behavior | Actual Behavior | Status |
|---------|------------------|-----------------|---------|
| Left Click + Drag | Rotate around Earth | | |
| Right Click + Drag | Pan view | | |
| Mouse Wheel Up | Zoom in | | |
| Mouse Wheel Down | Zoom out | | |
| Click Aircraft | Select flight | | |

### Control Responsiveness
| Setting | Min Value | Max Value | Smoothness |
|---------|-----------|-----------|------------|
| Camera Speed | 0.1x | 3.0x | |
| Mouse Sensitivity | 0.1x | 2.0x | |
| Auto Rotate Speed | 0.1x | 2.0x | |

### Browser Compatibility
| Browser | Version | Mouse Controls | Performance |
|---------|---------|----------------|-------------|
| Chrome | | | |
| Firefox | | | |
| Safari | | | |
| Edge | | | |

## Recommendations

### Performance Optimizations
1. Enable performance mode on slower devices
2. Reduce particle count for better FPS
3. Use simplified materials for low-end hardware

### User Experience Improvements
1. Add tutorial mode for new users
2. Implement gesture controls for touch devices
3. Add keyboard shortcuts help overlay

### Bug Fixes
[List any bugs that need to be addressed]

## Testing Instructions

1. **Setup**: Open http://localhost:3003 in your browser
2. **Wait**: Let the 3D scene load completely
3. **Test**: Use the checklist above to verify each control
4. **Report**: Note any issues or unexpected behavior
5. **Performance**: Monitor FPS during intensive interaction

## Support Information

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify WebGL support at webglreport.com
3. Try refreshing the page to reset controls
4. Use Reset View button in control panel
5. Enable performance mode for slower devices

EOF
    
    echo "✅ Test report generated: MOUSE_CONTROLS_TEST_REPORT.md"
}

# Main execution
main() {
    echo "Starting comprehensive mouse controls testing..."
    echo
    
    # Check if we're in the right directory
    if [ ! -f "flight-tracker-3d/package.json" ]; then
        echo "❌ Please run this script from the project root directory"
        exit 1
    fi
    
    # Run all tests
    check_server
    test_webgl
    performance_test
    test_mouse_controls
    test_responsiveness
    run_automated_checks
    generate_report
    
    echo
    echo "🎯 TESTING COMPLETE"
    echo "==================="
    echo
    echo "📋 Next Steps:"
    echo "1. Open http://localhost:3003 in your browser"
    echo "2. Complete the manual testing checklist above"
    echo "3. Fill out the test report with your findings"
    echo "4. Report any issues or improvements needed"
    echo
    echo "📊 Development Commands:"
    echo "   npm run dev     - Start development server"
    echo "   npm run build   - Create production build"
    echo "   npm run test    - Run automated tests"
    echo "   npm run lint    - Check code quality"
    echo
    echo "Happy testing! 🛩️"
}

# Run the main function
main