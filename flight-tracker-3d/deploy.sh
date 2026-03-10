#!/bin/bash

# Flight Tracker 3D Deployment Script
# This script builds and prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 Flight Tracker 3D - Production Deployment"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please upgrade to 16.0.0 or higher."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test:run

# Type check
echo ""
echo "🔍 Type checking..."
npm run type-check

# Build application
echo ""
echo "🏗️  Building for production..."
npm run build

# Validate build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"

# Display build information
echo ""
echo "📊 Build Summary:"
echo "=================="
echo "📁 Output directory: dist/"
echo "📄 Total files: $(find dist/ -type f | wc -l)"
echo "💾 Total size: $(du -sh dist/ | cut -f1)"
echo ""

# Display optimized bundle sizes
echo "📦 Bundle Analysis:"
echo "==================="
if [ -f "dist/index.html" ]; then
    echo "📄 HTML: $(stat -f%z dist/index.html 2>/dev/null || stat -c%s dist/index.html) bytes"
fi

# List main JavaScript bundles
for file in dist/assets/*.js; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
        echo "📜 $(basename "$file"): $size bytes"
    fi
done

# List CSS files
for file in dist/assets/*.css; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
        echo "🎨 $(basename "$file"): $size bytes"
    fi
done

echo ""
echo "🌟 Deployment Ready!"
echo "===================="
echo "The application is ready for deployment to any static hosting service."
echo ""
echo "📋 Deployment Options:"
echo "• Vercel: vercel --prod"
echo "• Netlify: netlify deploy --prod --dir=dist"
echo "• AWS S3: aws s3 sync dist/ s3://your-bucket-name"
echo "• GitHub Pages: Upload dist/ contents to gh-pages branch"
echo "• Docker: Use nginx to serve dist/ contents"
echo ""
echo "🔧 Environment Variables:"
echo "Copy the following environment configuration for production:"
echo ""
echo "VITE_OPENSKY_BASE_URL=https://opensky-network.org/api"
echo "VITE_UPDATE_INTERVAL=30000"
echo "VITE_MAX_FLIGHTS=1000"
echo "VITE_ENABLE_DEBUG=false"
echo "VITE_LOG_LEVEL=error"
echo ""
echo "🚀 Ready for production deployment!"

# Optional: Create deployment package
if [ "$1" = "--package" ]; then
    echo ""
    echo "📦 Creating deployment package..."
    tar -czf flight-tracker-3d-production.tar.gz dist/
    echo "✅ Package created: flight-tracker-3d-production.tar.gz"
fi

echo ""
echo "✨ Flight Tracker 3D is ready for the world!"