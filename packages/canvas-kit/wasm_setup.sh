#!/bin/bash

# Canvas Kit WASM Setup Script
# Builds WASM and copies output to dist/

echo "EMSDK: $EMSDK"

if [ -z "$EMSDK" ]; then
  echo "ERROR: EMSDK environment variable is not set!"
  echo "Please set EMSDK to your Emscripten SDK path."
  exit 1
fi

# Build WASM with all backends (sw, gl, wg)
echo "Building ThorVG WASM with Canvas Kit bindings..."
sh ./wasm_build.sh "$EMSDK/"

if [ $? -ne 0 ]; then
  echo "WASM build failed!"
  exit 1
fi

# Copy output files to dist/
mv build_wasm_canvaskit/thorvg.{wasm,js,d.ts} ./dist

echo "WASM setup completed successfully!"
ls -lh ./dist/thorvg.*
