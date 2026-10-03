#!/bin/bash
set -e

BACKEND="$1"
EMSDK="$2"

if [ -z "$2" ]; then
  BACKEND="default"
  EMSDK="$1"
fi

BUILD_DIR="build_wasm_player/$BACKEND"
CROSS="/tmp/.wasm_cross_${BACKEND}.txt"

# Step 1: Build ThorVG library
cd ../../thorvg
rm -rf "$BUILD_DIR"

if [ "$BACKEND" = "wg" ]; then
  sed "s|EMSDK:|$EMSDK|g; s|-sENVIRONMENT=web,worker|-sENVIRONMENT=web|g" ../wasm/wasm32_wg.txt > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dextra="lottie_exp" -Dthreads=false -Dfile="false" -Dpartial=false -Dengines="wg" --cross-file "$CROSS" "$BUILD_DIR"
elif [ "$BACKEND" = "sw" ]; then
  sed "s|EMSDK:|$EMSDK|g; s|-sENVIRONMENT=web,worker|-sENVIRONMENT=web|g" ../wasm/wasm32_sw.txt > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dfile="false" --cross-file "$CROSS" "$BUILD_DIR"
elif [ "$BACKEND" = "gl" ]; then
  sed "s|EMSDK:|$EMSDK|g; s|-sENVIRONMENT=web,worker|-sENVIRONMENT=web|g" ../wasm/wasm32_gl.txt > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file "$CROSS" "$BUILD_DIR"
elif [ "$BACKEND" = "sw-lite" ]; then
  sed "s|EMSDK:|$EMSDK|g; s|-sENVIRONMENT=web,worker|-sENVIRONMENT=web|g" ../wasm/wasm32_sw.txt > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="" -Dthreads=false -Dpartial=false -Dfile="false" --cross-file "$CROSS" "$BUILD_DIR"
elif [ "$BACKEND" = "gl-lite" ]; then
  sed "s|EMSDK:|$EMSDK|g; s|-sENVIRONMENT=web,worker|-sENVIRONMENT=web|g" ../wasm/wasm32_gl.txt > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="" -Dthreads=false -Dpartial=false -Dengines="gl" -Dfile="false" --cross-file "$CROSS" "$BUILD_DIR"
elif [ "$BACKEND" = "wg-lite" ]; then
  sed "s|EMSDK:|$EMSDK|g; s|-sENVIRONMENT=web,worker|-sENVIRONMENT=web|g" ../wasm/wasm32_wg.txt > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, png" -Dextra="" -Dthreads=false -Dpartial=false -Dengines="wg" -Dfile="false" --cross-file "$CROSS" "$BUILD_DIR"
elif [ "$BACKEND" = "pthread" ]; then
  # Use prebuilt OpenMP runtime
  LIBOMP_DIR="$(cd ../wasm/common && pwd)/libomp"
  CLANG_REVISION=$("${EMSDK}upstream/bin/clang" --version | sed -n 's/.*llvm-project \([0-9a-f]\{40\}\)).*/\1/p')
  if [ -z "$CLANG_REVISION" ] || ! grep -q "$CLANG_REVISION" "$LIBOMP_DIR/lib/libomp.a"; then
    echo "libomp.a was not built with this version of emsdk."
    exit 1
  fi
  POOL_SIZE='(function(){var n=globalThis["__THORVG_THREAD_COUNT"];return n>0?2*n-1:0})()'
  sed "s|EMSDK:|$EMSDK|g" ../wasm/wasm32_sw.txt | \
  sed "s|cpp_args = \[|cpp_args = ['-pthread', '-fopenmp', '-I${LIBOMP_DIR}/include', |g" | \
  sed "s|'--bind'|'--bind', '-pthread', '-fopenmp', '-L${LIBOMP_DIR}/lib', '-lomp', '-sPTHREAD_POOL_SIZE=${POOL_SIZE}', '-sPTHREAD_POOL_SIZE_STRICT=0', '-sINITIAL_MEMORY=134217728'|g" > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="lottie, jpg, png, webp, ttf" -Dextra="lottie_exp, openmp" -Dthreads=true -Dpartial=false -Dfile="false" --cross-file "$CROSS" "$BUILD_DIR"
elif [ "$BACKEND" = "default" ]; then
  sed "s|EMSDK:|$EMSDK|g; s|-sENVIRONMENT=web,worker|-sENVIRONMENT=web|g; s|'-sFILESYSTEM=0', ||g; s|'--bind'|'--bind', '--emit-tsd=thorvg.d.ts'|g" ../wasm/wasm32.txt > "$CROSS"
  meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="all" -Dsavers="all" -Dextra="lottie_exp" -Dthreads=false -Dpartial=false -Dengines="all" --cross-file "$CROSS" "$BUILD_DIR"
else
  echo "Unknown preset: $BACKEND" >&2
  echo "Usage: $0 [default|sw|gl|wg|sw-lite|gl-lite|wg-lite|pthread] <EMSDK_PATH>" >&2
  exit 1
fi

ninja -C "$BUILD_DIR"

cd ../packages/lottie-player

# Step 2: Build WASM bindings
rm -rf "$BUILD_DIR"

meson setup -Db_lto=true -Dthorvg_build_dir="$BUILD_DIR" --cross-file "$CROSS" "$BUILD_DIR" ../../wasm/lottie-player

ninja -C "$BUILD_DIR"
# Step 3: Move output to dist
OUT="dist/$BACKEND"
if [ "$BACKEND" = "default" ]; then
  OUT="dist"
elif [ "$BACKEND" = "pthread" ]; then
  OUT="dist/thread"
fi
mkdir -p "$OUT"
mv "$BUILD_DIR/thorvg.wasm" "$BUILD_DIR/thorvg.js" "$OUT"
if [ -f "$BUILD_DIR/thorvg.d.ts" ]; then
  mv "$BUILD_DIR/thorvg.d.ts" "$OUT"
fi
