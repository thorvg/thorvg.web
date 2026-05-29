#!/bin/bash

# WebCanvas WASM Setup Script
# Builds WASM and copies output to dist/

echo "EMSDK: $EMSDK"

if [ -z "$EMSDK" ]; then
  echo "ERROR: EMSDK environment variable is not set!"
  echo "Please set EMSDK to your Emscripten SDK path."
  exit 1
fi

# Build WASM with all backends (sw, gl, wg)
echo "Building ThorVG WASM with WebCanvas bindings (default)..."
if ! sh ./wasm_wcanvas_build.sh "$EMSDK/"; then
  echo "WASM build failed!"
  exit 1
fi

# Copy output files to dist/
mv build_wasm_wcanvas/thorvg.js ./dist/
mv build_wasm_wcanvas/thorvg.wasm ./dist/
mv build_wasm_wcanvas/thorvg.d.ts ./dist/

# Build WASM with pthread support
echo "Building ThorVG WASM with WebCanvas bindings (pthread)..."
if ! sh ./wasm_wcanvas_build.sh pthread "$EMSDK/"; then
  echo "Pthread WASM build failed!"
  exit 1
fi

mkdir -p ./dist/thread
mv build_wasm_wcanvas/thorvg.js ./dist/thread/
mv build_wasm_wcanvas/thorvg.wasm ./dist/thread/
if [ -f build_wasm_wcanvas/thorvg.worker.js ]; then
  mv build_wasm_wcanvas/thorvg.worker.js ./dist/thread/
fi
rm -f build_wasm_wcanvas/thorvg.d.ts

echo "WASM setup completed successfully!"
ls -lh ./dist/thorvg.* ./dist/thread/thorvg.* 2>/dev/null
