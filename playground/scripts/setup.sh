#!/bin/bash

# Setup script for ThorVG Playground
# This script copies the necessary WebCanvas files to the public directory

set -e

echo "🚀 Setting up ThorVG Playground..."

# Create public directory if it doesn't exist
mkdir -p public/webcanvas

# Check if webcanvas dist exists in the parent packages directory
WEBCANVAS_PATH="../packages/webcanvas/dist"

if [ -d "$WEBCANVAS_PATH" ]; then
  echo "📦 Copying WebCanvas files from $WEBCANVAS_PATH..."
  cp -r "$WEBCANVAS_PATH"/*.wasm public/webcanvas/ 2>/dev/null || echo "⚠️  No WASM files found"
  cp -r "$WEBCANVAS_PATH"/*.js public/webcanvas/ 2>/dev/null || echo "⚠️  No JS files found"
  echo "✅ WebCanvas files copied successfully!"
else
  echo "⚠️  WebCanvas build not found at $WEBCANVAS_PATH"
  echo "   Please build the webcanvas package first:"
  echo "   cd ../packages/webcanvas && pnpm build"
  exit 1
fi

echo "✨ Setup complete! Run 'yarn dev' to start the playground."
