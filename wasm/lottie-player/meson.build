project('thorvg-wasm-player', 'cpp',
        version : '1.0.0',
        default_options : ['cpp_std=c++14'])

cc = meson.get_compiler('cpp')

if cc.get_id() != 'emscripten'
    error('This project requires Emscripten compiler')
endif

# Find ThorVG library
thorvg_dir = meson.project_source_root() + '/../../thorvg'
thorvg_lib = cc.find_library('thorvg', dirs: thorvg_dir + '/build_wasm_player/src')

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
    dependencies : [thorvg_lib],
)
