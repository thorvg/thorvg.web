#!/bin/bash

# Canvas Kit WASM Build Script
# Builds ThorVG library + Canvas Kit bindings in 2 steps

EMSDK="$1"

if [ -z "$EMSDK" ]; then
  echo "Usage: $0 <EMSDK_PATH>"
  exit 1
fi

# Remove trailing slash from EMSDK path
EMSDK="${EMSDK%/}"

# Step 1: Build ThorVG library
cd ../../thorvg
rm -rf build_wasm

# Use cross file with all backends
sed "s|EMSDK:|$EMSDK|g; s|'--bind'|'--bind', '--emit-tsd=thorvg.d.ts'|g" ./cross/wasm32_canvaskit.txt > /tmp/.wasm_canvaskit_cross.txt

meson setup \
  -Db_lto=true \
  -Ddefault_library=static \
  -Dstatic=true \
  -Dloaders="all" \
  -Dsavers="all" \
  -Dthreads=false \
  -Dfile="false" \
  -Dbindings="capi" \
  -Dpartial=false \
  -Dengines="all" \
  --cross-file /tmp/.wasm_canvaskit_cross.txt \
  build_wasm

if [ $? -ne 0 ]; then
  echo "ThorVG library meson setup failed!"
  exit 1
fi

ninja -C build_wasm/

if [ $? -ne 0 ]; then
  echo "ThorVG library build failed!"
  exit 1
fi

cd ../packages/canvas-kit

# Step 2: Build WASM bindings
rm -rf build_wasm

cp ../../thorvg/build_wasm/config.h ../../bindings/canvas_kit/config.h
meson setup -Db_lto=true --cross-file /tmp/.wasm_canvaskit_cross.txt build_wasm ../../bindings/canvas_kit

if [ $? -ne 0 ]; then
  echo "Canvas Kit bindings meson setup failed!"
  exit 1
fi

ninja -C build_wasm/

if [ $? -ne 0 ]; then
  echo "Canvas Kit bindings build failed!"
  exit 1
fi

rm ../../bindings/canvas_kit/config.h

echo "Build completed successfully!"
ls -lrt build_wasm/*.{js,wasm}
