#!/bin/bash

BACKEND="$1"
EMSDK="$2"

if [ -z "$2" ]; then
  BACKEND="all"
  EMSDK="$1"
fi

# Step 1: Build ThorVG library
cd ../../thorvg
rm -rf build_wasm_player

if [[ "$BACKEND" == "wg" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_wg.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dextra="lottie_exp" -Dthreads=false -Dfile="false" -Dpartial=false -Dengines="wg" --cross-file /tmp/.wasm_cross.txt build_wasm_player
elif [[ "$BACKEND" == "sw" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_sw.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm_player
elif [[ "$BACKEND" == "gl" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_gl.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm_player
elif [[ "$BACKEND" == "sw-lite" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_sw.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm_player
elif [[ "$BACKEND" == "gl-lite" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_gl.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm_player
else
  sed "s|EMSDK:|$EMSDK|g; s|'--bind'|'--bind', '--emit-tsd=thorvg.d.ts'|g" ../wasm/wasm32.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="all" -Dsavers="all" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dengines="all" --cross-file /tmp/.wasm_cross.txt build_wasm_player
fi

ninja -C build_wasm_player/

cd ../packages/lottie-player

# Step 2: Build WASM bindings
rm -rf build_wasm_player

cp ../../thorvg/build_wasm_player/config.h ../../wasm/lottie-player/config.h
meson setup -Db_lto=true --cross-file /tmp/.wasm_cross.txt build_wasm_player ../../wasm/lottie-player

ninja -C build_wasm_player/
rm ../../wasm/lottie-player/config.h

ls -lrt build_wasm_player/*.{js,wasm}
