#!/bin/bash

echo "EMSDK: $EMSDK"

rm -rf build_wasm_player && sh ./wasm_player_build.sh $EMSDK/
mv build_wasm_player/thorvg.wasm ./dist
mv build_wasm_player/thorvg.js ./dist
mv build_wasm_player/thorvg.d.ts ./dist

rm -rf build_wasm_player && sh ./wasm_player_build.sh sw $EMSDK/
mkdir -p ./dist/sw
mv build_wasm_player/thorvg.wasm ./dist/sw
mv build_wasm_player/thorvg.js ./dist/sw

rm -rf build_wasm_player && sh ./wasm_player_build.sh gl $EMSDK/
mkdir -p ./dist/gl
mv build_wasm_player/thorvg.wasm ./dist/gl
mv build_wasm_player/thorvg.js ./dist/gl

rm -rf build_wasm_player && sh ./wasm_player_build.sh sw-lite $EMSDK/
mkdir -p ./dist/sw-lite
mv build_wasm_player/thorvg.wasm ./dist/sw-lite
mv build_wasm_player/thorvg.js ./dist/sw-lite

rm -rf build_wasm_player && sh ./wasm_player_build.sh gl-lite $EMSDK/
mkdir -p ./dist/gl-lite
mv build_wasm_player/thorvg.wasm ./dist/gl-lite
mv build_wasm_player/thorvg.js ./dist/gl-lite

rm -rf build_wasm_player && sh ./wasm_player_build.sh wg $EMSDK/
mkdir -p ./dist/wg
mv build_wasm_player/thorvg.wasm ./dist/wg
mv build_wasm_player/thorvg.js ./dist/wg

rm -rf build_wasm_player && sh ./wasm_player_build.sh wg-lite $EMSDK/
mkdir -p ./dist/wg-lite
mv build_wasm_player/thorvg.wasm ./dist/wg-lite
mv build_wasm_player/thorvg.js ./dist/wg-lite
