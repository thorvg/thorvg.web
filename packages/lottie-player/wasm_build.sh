#!/bin/bash

BACKEND="$1"
EMSDK="$2"

if [ -z "$2" ]; then
  BACKEND="all"
  EMSDK="$1"
fi

# Step 1: Build ThorVG static library
cd ../../thorvg
rm -rf build_wasm

if [[ "$BACKEND" == "wg" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_wg.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dthreads=false -Dfile="false" -Dpartial=false -Dengines="wg" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "sw" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_sw.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dthreads=false -Dpartial=false -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "gl" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_gl.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dthreads=false -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "sw-lite" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_sw.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="" -Dthreads=false -Dpartial=false -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "gl-lite" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_gl.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="" -Dthreads=false -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
else
  sed "s|EMSDK:|$EMSDK|g; s|'--bind'|'--bind', '--emit-tsd=thorvg.d.ts'|g" ../wasm/wasm32.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="all" -Dsavers="all" -Dthreads=false -Dpartial=false -Dengines="all" --cross-file /tmp/.wasm_cross.txt build_wasm
fi

ninja -C build_wasm/

# Step 2: Build WASM bindings from new location
cd ../wasm/lottie-player
rm -rf build_wasm

meson setup --cross-file /tmp/.wasm_cross.txt build_wasm
ninja -C build_wasm/
ls -lrt build_wasm/*.{js,wasm}

cd ../..
