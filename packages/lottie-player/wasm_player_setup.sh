#!/bin/sh
set -e

echo "EMSDK: $EMSDK"

if [ $# -eq 0 ]; then
  set -- default sw gl wg sw-lite gl-lite wg-lite pthread
fi

mkdir -p build_wasm_player
for preset in "$@"; do
  rm -f "build_wasm_player/$preset.exit"
  { sh ./wasm_player_build.sh "$preset" "$EMSDK/" 2>&1 || echo $? > "build_wasm_player/$preset.exit"; } |
    while IFS= read -r line; do
      printf '[%s] %s\n' "$preset" "$line"
    done &
done
wait

failed=""
for preset in "$@"; do
  if [ -f "build_wasm_player/$preset.exit" ]; then
    failed="$failed $preset"
  fi
done

if [ -n "$failed" ]; then
  echo "Failed presets:$failed" >&2
  exit 1
fi
