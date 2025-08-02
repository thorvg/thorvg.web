#!/bin/bash

BACKEND="$1"
EMSDK="$2"

if [ -z "$2" ]; then
  BACKEND="all"
  EMSDK="$1"
fi

cd thorvg
rm -rf build_wasm

if [[ "$BACKEND" == "wg" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ./cross/wasm32_wg.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dthreads=false -Dfile="false" -Dbindings="wasm_beta" -Dpartial=false -Dengines="wg" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "sw" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ./cross/wasm32_sw.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dthreads=false -Dbindings="wasm_beta" -Dpartial=false -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "gl" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ./cross/wasm32_gl.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dthreads=false -Dbindings="wasm_beta" -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "sw-lite" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ./cross/wasm32_sw.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="" -Dthreads=false -Dbindings="wasm_beta" -Dpartial=false -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
elif [[ "$BACKEND" == "gl-lite" ]]; then
  sed "s|EMSDK:|$EMSDK|g" ./cross/wasm32_gl.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="" -Dthreads=false -Dbindings="wasm_beta" -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file /tmp/.wasm_cross.txt build_wasm
else
  sed "s|EMSDK:|$EMSDK|g; s|'--bind'|'--bind', '--emit-tsd=thorvg.d.ts'|g" ./cross/wasm32.txt > /tmp/.wasm_cross.txt
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="all" -Dsavers="all" -Dthreads=false -Dbindings="wasm_beta" -Dpartial=false -Dengines="all" --cross-file /tmp/.wasm_cross.txt build_wasm
fi

ninja -C build_wasm/
ls -lrt build_wasm/src/bindings/wasm/*.{js,wasm}

cd ..
