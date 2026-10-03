#!/bin/bash
set -e

# WebCanvas WASM Setup Script
# Builds every WASM mode in parallel and moves the output to dist/

echo "EMSDK: $EMSDK"

if [ -z "$EMSDK" ]; then
  echo "ERROR: EMSDK environment variable is not set!"
  echo "Please set EMSDK to your Emscripten SDK path."
  exit 1
fi

if [ $# -eq 0 ]; then
  set -- default pthread
fi

mkdir -p build_wasm_wcanvas
for mode in "$@"; do
  rm -f "build_wasm_wcanvas/$mode.exit"
  { sh ./wasm_wcanvas_build.sh "$mode" "$EMSDK/" 2>&1 || echo $? > "build_wasm_wcanvas/$mode.exit"; } |
    while IFS= read -r line; do
      printf '[%s] %s\n' "$mode" "$line"
    done &
done
wait

failed=""
for mode in "$@"; do
  if [ -f "build_wasm_wcanvas/$mode.exit" ]; then
    failed="$failed $mode"
  fi
done

if [ -n "$failed" ]; then
  echo "WASM build failed:$failed" >&2
  exit 1
fi

echo "WASM setup completed successfully!"
