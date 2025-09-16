#!/bin/bash

echo "EMSDK: $EMSDK"

rm -rf build_wasm && sh ./wasm_build.sh $EMSDK/
mv thorvg/build_wasm/src/bindings/wasm/thorvg.{wasm,js,d.ts} ./dist

rm -rf build_wasm && sh ./wasm_build.sh sw $EMSDK/
mkdir -p ./dist/sw
mv thorvg/build_wasm/src/bindings/wasm/thorvg.{wasm,js} ./dist/sw

rm -rf build_wasm && sh ./wasm_build.sh gl $EMSDK/
mkdir -p ./dist/gl
mv thorvg/build_wasm/src/bindings/wasm/thorvg.{wasm,js} ./dist/gl

rm -rf build_wasm && sh ./wasm_build.sh sw-lite $EMSDK/
mkdir -p ./dist/sw-lite
mv thorvg/build_wasm/src/bindings/wasm/thorvg.{wasm,js} ./dist/sw-lite

rm -rf build_wasm && sh ./wasm_build.sh gl-lite $EMSDK/
mkdir -p ./dist/gl-lite
mv thorvg/build_wasm/src/bindings/wasm/thorvg.{wasm,js} ./dist/gl-lite
