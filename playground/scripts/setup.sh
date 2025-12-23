#!/bin/bash

# Setup script for ThorVG Playground
# This script copies the necessary Canvas Kit files to the public directory

set -e

echo "🚀 Setting up ThorVG Playground..."

# Create public directory if it doesn't exist
mkdir -p public/canvas-kit

# Check if canvas-kit dist exists in the parent packages directory
CANVAS_KIT_PATH="../packages/canvas-kit/dist"

if [ -d "$CANVAS_KIT_PATH" ]; then
  echo "📦 Copying Canvas Kit files from $CANVAS_KIT_PATH..."
  cp -r "$CANVAS_KIT_PATH"/*.wasm public/canvas-kit/ 2>/dev/null || echo "⚠️  No WASM files found"
  cp -r "$CANVAS_KIT_PATH"/*.js public/canvas-kit/ 2>/dev/null || echo "⚠️  No JS files found"
  echo "✅ Canvas Kit files copied successfully!"
else
  echo "⚠️  Canvas Kit build not found at $CANVAS_KIT_PATH"
  echo "   Please build the canvas-kit package first:"
  echo "   cd ../packages/canvas-kit && pnpm build"
  exit 1
fi

echo "✨ Setup complete! Run 'yarn dev' to start the playground."
