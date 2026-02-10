project('thorvg-wasm-player', 'cpp',
        version : '1.0.0',
        default_options : ['cpp_std=c++17'])

cc = meson.get_compiler('cpp')

if cc.get_id() != 'emscripten'
    error('This project requires Emscripten compiler')
endif

# Find ThorVG library
thorvg_dir = meson.project_source_root() + '/../../thorvg'
thorvg_lib = thorvg_dir + '/build_wasm_player/src/libthorvg-1.a'

thorvg_inc = include_directories(
    '../../thorvg/inc',
    '../../thorvg/src/loaders/lottie',
    '../../thorvg/build_wasm_player',
    '../common'
)

# WASM binding sources
source_files = [
    'tvgWasmLottieAnimation.cpp',
]

# Build WASM executable
executable('thorvg',
    source_files,
    include_directories : thorvg_inc,
    link_args : [thorvg_lib],
)
