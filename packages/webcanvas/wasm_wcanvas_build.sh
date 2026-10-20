#!/bin/bash
set -e

# WebCanvas WASM Build Script
# Builds ThorVG library + WebCanvas bindings
#
# Usage:
#   ./wasm_wcanvas_build.sh <EMSDK_PATH>           # default build (all engines, single-threaded)
#   ./wasm_wcanvas_build.sh default <EMSDK_PATH>   # same as above
#   ./wasm_wcanvas_build.sh pthread <EMSDK_PATH>   # pthread build (all engines, multi-thread support)

MODE="default"
if [ "$1" = "default" ] || [ "$1" = "pthread" ]; then
  MODE="$1"
  shift
fi

EMSDK="$1"

if [ -z "$EMSDK" ]; then
  echo "Usage: $0 [default|pthread] <EMSDK_PATH>"
  exit 1
fi

# Remove trailing slash from EMSDK path
EMSDK="${EMSDK%/}"

BUILD_DIR="build_wasm_wcanvas/$MODE"
CROSS="/tmp/.wasm_webcanvas_cross_${MODE}.txt"

# Define exported functions for WebCanvas
EXPORTED_FUNCTIONS="_tvg_canvas_add,_tvg_canvas_draw,_tvg_canvas_sync,_tvg_canvas_update,_tvg_canvas_set_viewport,_tvg_shape_new,_tvg_shape_reset,_tvg_shape_move_to,_tvg_shape_line_to,_tvg_shape_cubic_to,_tvg_shape_close,_tvg_shape_append_rect,_tvg_shape_append_circle,_tvg_shape_append_path,_tvg_shape_get_path,_tvg_shape_set_fill_color,_tvg_shape_set_fill_rule,_tvg_shape_set_trimpath,_tvg_shape_set_stroke_width,_tvg_shape_set_stroke_color,_tvg_shape_set_stroke_join,_tvg_shape_set_stroke_cap,_tvg_shape_set_stroke_gradient,_tvg_shape_set_stroke_dash,_tvg_shape_get_stroke_dash,_tvg_shape_set_gradient,_tvg_shape_set_stroke_miterlimit,_tvg_shape_set_paint_order,_tvg_paint_ref,_tvg_paint_unref,_tvg_paint_duplicate,_tvg_paint_set_transform,_tvg_paint_translate,_tvg_paint_scale,_tvg_paint_rotate,_tvg_paint_set_opacity,_tvg_paint_get_opacity,_tvg_paint_set_clip,_tvg_paint_get_aabb,_tvg_paint_get_obb,_tvg_paint_get_type,_tvg_paint_set_blend_method,_tvg_paint_set_mask_method,_tvg_paint_intersects_region,_tvg_paint_set_visible,_tvg_paint_get_visible,_tvg_linear_gradient_new,_tvg_linear_gradient_set,_tvg_radial_gradient_new,_tvg_radial_gradient_set,_tvg_conic_gradient_new,_tvg_conic_gradient_set,_tvg_gradient_set_color_stops,_tvg_gradient_set_spread,_tvg_gradient_del,_tvg_scene_new,_tvg_scene_add,_tvg_scene_remove,_tvg_scene_clear_effects,_tvg_scene_add_effect_gaussian_blur,_tvg_scene_add_effect_motion_blur,_tvg_scene_add_effect_drop_shadow,_tvg_scene_add_effect_fill,_tvg_scene_add_effect_tint,_tvg_scene_add_effect_tritone,_tvg_picture_new,_tvg_picture_load_raw,_tvg_picture_load_data,_tvg_picture_set_size,_tvg_picture_get_size,_tvg_picture_set_origin,_tvg_picture_set_filter,_tvg_picture_set_accessible,_tvg_picture_set_asset_resolver,_tvg_animation_new,_tvg_animation_set_frame,_tvg_animation_get_picture,_tvg_animation_get_total_frame,_tvg_animation_get_duration,_tvg_animation_set_segment,_tvg_animation_del,_tvg_lottie_animation_new,_tvg_lottie_animation_set_marker,_tvg_lottie_animation_get_markers_cnt,_tvg_lottie_animation_get_marker_info,_tvg_lottie_animation_gen_slot,_tvg_lottie_animation_apply_slot,_tvg_lottie_animation_del_slot,_tvg_lottie_animation_set_quality,_tvg_lottie_animation_set_audio_resolver,_tvg_lottie_animation_set_volume,_tvg_lottie_animation_get_volume,_tvg_text_new,_tvg_text_set_font,_tvg_text_set_size,_tvg_text_set_text,_tvg_text_set_color,_tvg_text_set_gradient,_tvg_text_align,_tvg_text_layout,_tvg_text_wrap_mode,_tvg_text_line_count,_tvg_text_get_text_metrics,_tvg_text_get_glyph_metrics,_tvg_text_spacing,_tvg_text_set_italic,_tvg_text_set_outline,_tvg_font_load_data,_tvg_accessor_new,_tvg_accessor_del,_tvg_accessor_set,_tvg_accessor_generate_id,_tvg_accessor_get_name,_tvg_paint_get_id,_tvg_paint_set_id,_tvg_picture_get_paint,_tvg_video_new,_tvg_video_del,_tvg_video_get_picture,_tvg_video_play,_tvg_video_pause,_tvg_video_stop,_tvg_video_seek,_tvg_video_set_loop,_tvg_video_get_loop,_tvg_video_set_volume,_tvg_video_set_mute,_tvg_video_get_time,_tvg_video_get_duration,_tvg_video_get_volume,_tvg_video_get_muted,_malloc,_free"

# Define exported runtime methods for WebCanvas
EXPORTED_RUNTIME_METHODS="HEAPU8,HEAP8,HEAPU16,HEAP16,HEAPU32,HEAP32,HEAPF32,HEAPF64,addFunction,removeFunction,stringToNewUTF8,UTF8ToString,specialHTMLTargets"

# Step 1: Build ThorVG library
cd ../../thorvg
rm -rf "$BUILD_DIR"

if [ "$MODE" = "pthread" ]; then
  sed "s|EMSDK:|$EMSDK/|g" ../wasm/wasm32.txt | \
    sed "s|, '-fno-exceptions'||g" | \
    sed "s|'-fno-exceptions', ||g" | \
    sed "s|, '-sEXPORTED_RUNTIME_METHODS=[^']*'||g" | \
    sed "s|cpp_args = \[|cpp_args = ['-pthread', |g" | \
    sed "s|'--bind'|'--bind', '-pthread', '--emit-tsd=thorvg.d.ts', '-sPTHREAD_POOL_SIZE=(typeof globalThis[\"__THORVG_THREAD_COUNT\"] !== \"undefined\" ? globalThis[\"__THORVG_THREAD_COUNT\"] : (typeof navigator !== \"undefined\" \&\& navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4))', '-sPTHREAD_POOL_SIZE_STRICT=0', '-sINITIAL_MEMORY=134217728', '-sEXPORTED_FUNCTIONS=${EXPORTED_FUNCTIONS}', '-sEXPORTED_RUNTIME_METHODS=${EXPORTED_RUNTIME_METHODS}', '-sDISABLE_EXCEPTION_CATCHING=0', '-sDISABLE_EXCEPTION_THROWING=0', '-sALLOW_TABLE_GROWTH=1', '-sINITIAL_TABLE=128'|g" > "$CROSS"
else
  sed "s|EMSDK:|$EMSDK/|g" ../wasm/wasm32.txt | \
    sed "s|, '-fno-exceptions'||g" | \
    sed "s|'-fno-exceptions', ||g" | \
    sed "s|, '-sEXPORTED_RUNTIME_METHODS=[^']*'||g" | \
    sed "s|'--bind'|'--bind', '--emit-tsd=thorvg.d.ts', '-sEXPORTED_FUNCTIONS=${EXPORTED_FUNCTIONS}', '-sEXPORTED_RUNTIME_METHODS=${EXPORTED_RUNTIME_METHODS}', '-sDISABLE_EXCEPTION_CATCHING=0', '-sDISABLE_EXCEPTION_THROWING=0', '-sALLOW_TABLE_GROWTH=1', '-sINITIAL_TABLE=128'|g" > "$CROSS"
fi

meson setup \
  -Db_lto=true \
  -Ddefault_library=static \
  -Dstatic=true \
  -Dloaders="all,media" \
  -Dsavers="" \
  -Dthreads="$([ "$MODE" = "pthread" ] && echo true || echo false)" \
  -Dfile="false" \
  -Dbindings="capi" \
  -Dpartial=true \
  -Dengines="all" \
  -Dextra="lottie_exp" \
  --cross-file "$CROSS" \
  "$BUILD_DIR"

ninja -C "$BUILD_DIR"

cd ../packages/webcanvas

# Step 2: Build WASM bindings
rm -rf "$BUILD_DIR"

meson setup -Db_lto=true -Dthorvg_build_dir="$BUILD_DIR" --cross-file "$CROSS" "$BUILD_DIR" ../../wasm/webcanvas

ninja -C "$BUILD_DIR"

# Step 3: Move output to dist
if [ "$MODE" = "pthread" ]; then
  mkdir -p dist/thread
  mv "$BUILD_DIR/thorvg.js" "$BUILD_DIR/thorvg.wasm" dist/thread/
  if [ -f "$BUILD_DIR/thorvg.worker.js" ]; then
    mv "$BUILD_DIR/thorvg.worker.js" dist/thread/
  fi
else
  mkdir -p dist
  mv "$BUILD_DIR/thorvg.js" "$BUILD_DIR/thorvg.wasm" "$BUILD_DIR/thorvg.d.ts" dist/
fi

echo "Build completed successfully! (mode: ${MODE})"
