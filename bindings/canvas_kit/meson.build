project('thorvg-wasm-canvaskit', 'cpp',
        version : '1.0.0',
        default_options : ['cpp_std=c++14'])

cc = meson.get_compiler('cpp')

if cc.get_id() != 'emscripten'
    error('This project requires Emscripten compiler')
endif

# Find ThorVG library
thorvg_dir = meson.project_source_root() + '/../../thorvg'
thorvg_lib = cc.find_library('thorvg', dirs: thorvg_dir + '/build_wasm/src')

thorvg_inc = include_directories(
    '../../thorvg/inc',
    '../../thorvg/src/common',
    '../../thorvg/src/renderer',
    '../../thorvg/src/renderer/sw_engine',
    '../../thorvg/src/renderer/gl_engine',
    '../../thorvg/src/renderer/wg_engine',
    '../../thorvg/src/bindings/capi',
    '../../thorvg/build_wasm'
)

# WASM binding sources
source_files = [
    'tvgWasmDefaultFont.h',
    'tvgWasmCanvasKit.cpp',
]

# Build WASM executable
executable('thorvg',
    source_files,
    include_directories : thorvg_inc,
    dependencies : [thorvg_lib],
)
