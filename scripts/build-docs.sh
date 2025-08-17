#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Create dummy thorvg-wasm.js file if build files don't exist
if [ ! -f "./thorvg/build_wasm/src/bindings/wasm/thorvg-wasm.js" ]; then
    echo "// Dummy file for documentation generation" > dist/thorvg-wasm.js
fi

# Create dummy thorvg-wasm.wasm file if build files don't exist  
if [ ! -f "./thorvg/build_wasm/src/bindings/wasm/thorvg-wasm.wasm" ]; then
    touch dist/thorvg-wasm.wasm
fi

# Try to build with rollup (might fail if dependencies are missing)
if [ -f "./thorvg/meson.build" ]; then
    THORVG_VERSION=$(sed -n -e 4p ./thorvg/meson.build | sed 's/..$//' | sed -r 's/.{19}//') rollup -c --bundleConfigAsCjs 2>/dev/null || true
else
    # Use a default version if meson.build doesn't exist
    THORVG_VERSION="0.0.0" rollup -c --bundleConfigAsCjs 2>/dev/null || true
fi

# Generate JSDoc documentation
jsdoc -c jsdoc.json

echo "Documentation generated in ./docs directory"