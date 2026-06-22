project('thorvg-wasm-webcanvas', 'cpp',
        version : '1.0.0',
        default_options : ['cpp_std=c++17'])

cc = meson.get_compiler('cpp')

if cc.get_id() != 'emscripten'
    error('This project requires Emscripten compiler')
endif

# Find ThorVG library
thorvg_dir = meson.project_source_root() + '/../../thorvg'
thorvg_lib_path = thorvg_dir + '/build_wasm_wcanvas/src/libthorvg-1.a'

thorvg_inc = include_directories(
    '../../thorvg/inc',
    '../../thorvg/src/common',
    '../../thorvg/src/bindings/capi',
    '../../thorvg/src/renderer',
    '../../thorvg/src/loaders',
    '../../thorvg/src/loaders/media',
    '../../thorvg/build_wasm_wcanvas',
    '../common'
)

# Media bypass glue subclasses the core loader; built without RTTI to match the core
media_lib = static_library('thorvg-wasm-media',
    'tvgWasmMedia.cpp',
    include_directories : thorvg_inc,
    cpp_args : ['-fno-rtti'],
)

# Build WASM executable
executable('thorvg',
    'tvgWasmWebCanvas.cpp',
    include_directories : thorvg_inc,
    link_whole : media_lib,
    link_args : [thorvg_lib_path],
)
