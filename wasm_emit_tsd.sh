#!/bin/bash

EMSDK="$1"

if [ ! -d "./emit_tsd" ]; then
    sed "s|EMSDK:|$EMSDK|g; s|'--bind'|'--bind', '--emit-tsd=thorvg-wasm.d.ts'|g" thorvg/cross/wasm32.txt > /tmp/.wasm_cross.txt
    meson setup -Db_lto=true -Ddefault_library=static -Dstatic=true -Dloaders="all" -Dsavers="all" -Dthreads=false -Dbindings="wasm_beta" -Dpartial=false -Dengines="all" --cross-file /tmp/.wasm_cross.txt emit_tsd thorvg
fi

ninja -C emit_tsd/
ls -lrt emit_tsd/src/bindings/wasm/*.d.ts
