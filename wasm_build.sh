rm -rf dist
mkdir dist
cd thorvg

# Build software backend
rm -rf build_wasm
./wasm_build.sh sw $1
cp build_wasm/src/bindings/wasm/thorvg-wasm.wasm ../dist/thorvg-software-wasm.wasm
cp build_wasm/src/bindings/wasm/thorvg-wasm.js ../dist/thorvg-software-wasm.js

# Build webgpu backend
rm -rf build_wasm
./wasm_build.sh wg $1
cp build_wasm/src/bindings/wasm/thorvg-wasm.wasm ../dist/thorvg-webgpu-wasm.wasm
cp build_wasm/src/bindings/wasm/thorvg-wasm.js ../dist/thorvg-webgpu-wasm.js

# Build webgl backend
rm -rf build_wasm
./wasm_build.sh gl $1
cp build_wasm/src/bindings/wasm/thorvg-wasm.wasm ../dist/thorvg-webgl-wasm.wasm
cp build_wasm/src/bindings/wasm/thorvg-wasm.js ../dist/thorvg-webgl-wasm.js

# Post process
cd ..
yarn build

ls -lrt ./dist