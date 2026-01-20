#!/bin/bash

# WebCanvas WASM Build Script
# Builds ThorVG library + WebCanvas bindings

EMSDK="$1"

if [ -z "$EMSDK" ]; then
  echo "Usage: $0 <EMSDK_PATH>"
  exit 1
fi

# Remove trailing slash from EMSDK path
EMSDK="${EMSDK%/}"

# Define exported functions for WebCanvas
EXPORTED_FUNCTIONS="_tvg_engine_init,_tvg_engine_term,_tvg_swcanvas_create,_tvg_swcanvas_set_target,_tvg_glcanvas_create,_tvg_wgcanvas_create,_tvg_canvas_destroy,_tvg_canvas_add,_tvg_canvas_insert,_tvg_canvas_remove,_tvg_canvas_draw,_tvg_canvas_sync,_tvg_canvas_update,_tvg_canvas_set_viewport,_tvg_shape_new,_tvg_shape_reset,_tvg_shape_move_to,_tvg_shape_line_to,_tvg_shape_cubic_to,_tvg_shape_close,_tvg_shape_append_rect,_tvg_shape_append_circle,_tvg_shape_append_path,_tvg_shape_get_path,_tvg_shape_set_fill_color,_tvg_shape_get_fill_color,_tvg_shape_set_fill_rule,_tvg_shape_get_fill_rule,_tvg_shape_set_trimpath,_tvg_shape_set_stroke_width,_tvg_shape_get_stroke_width,_tvg_shape_set_stroke_color,_tvg_shape_get_stroke_color,_tvg_shape_set_stroke_join,_tvg_shape_get_stroke_join,_tvg_shape_set_stroke_cap,_tvg_shape_get_stroke_cap,_tvg_shape_set_stroke_gradient,_tvg_shape_get_stroke_gradient,_tvg_shape_set_stroke_dash,_tvg_shape_get_stroke_dash,_tvg_shape_set_gradient,_tvg_shape_get_gradient,_tvg_shape_set_stroke_miterlimit,_tvg_paint_rel,_tvg_paint_ref,_tvg_paint_unref,_tvg_paint_get_ref,_tvg_paint_duplicate,_tvg_paint_set_transform,_tvg_paint_get_transform,_tvg_paint_translate,_tvg_paint_scale,_tvg_paint_rotate,_tvg_paint_set_opacity,_tvg_paint_get_opacity,_tvg_paint_set_clip,_tvg_paint_get_clip,_tvg_paint_get_aabb,_tvg_paint_get_obb,_tvg_paint_get_type,_tvg_paint_set_blend_method,_tvg_paint_set_mask_method,_tvg_paint_intersects,_tvg_paint_set_visible,_tvg_paint_get_visible,_tvg_linear_gradient_new,_tvg_linear_gradient_set,_tvg_linear_gradient_get,_tvg_radial_gradient_new,_tvg_radial_gradient_set,_tvg_radial_gradient_get,_tvg_gradient_set_color_stops,_tvg_gradient_get_color_stops,_tvg_gradient_set_spread,_tvg_gradient_get_spread,_tvg_gradient_del,_tvg_scene_new,_tvg_scene_add,_tvg_scene_insert,_tvg_scene_remove,_tvg_scene_clear_effects,_tvg_scene_add_effect_gaussian_blur,_tvg_scene_add_effect_drop_shadow,_tvg_scene_add_effect_fill,_tvg_scene_add_effect_tint,_tvg_scene_add_effect_tritone,_tvg_picture_new,_tvg_picture_load,_tvg_picture_load_raw,_tvg_picture_load_data,_tvg_picture_set_size,_tvg_picture_get_size,_tvg_picture_set_origin,_tvg_picture_get_origin,_tvg_animation_new,_tvg_animation_set_frame,_tvg_animation_get_picture,_tvg_animation_get_frame,_tvg_animation_get_total_frame,_tvg_animation_get_duration,_tvg_animation_set_segment,_tvg_animation_get_segment,_tvg_animation_del,_tvg_text_new,_tvg_text_set_font,_tvg_text_set_size,_tvg_text_set_text,_tvg_text_set_color,_tvg_text_set_gradient,_tvg_text_align,_tvg_text_layout,_tvg_text_wrap_mode,_tvg_text_spacing,_tvg_text_set_italic,_tvg_text_set_outline,_tvg_font_load,_tvg_font_load_data,_tvg_font_unload,_tvg_accessor_new,_tvg_accessor_del,_tvg_accessor_set,_malloc,_free"

# Define exported runtime methods for WebCanvas
EXPORTED_RUNTIME_METHODS="HEAPU8,HEAPF32,addFunction,removeFunction"

# Step 1: Build ThorVG library
cd ../../thorvg
rm -rf build_wasm_wcanvas

# Generate temporary cross file from wasm32.txt with WebCanvas specific modifications
# 1. Replace EMSDK: placeholder with actual path (preserving the path structure)
# 2. Remove -fno-exceptions from cpp_args
# 3. Remove --closure=1 and -sEXPORTED_RUNTIME_METHODS=FS from cpp_link_args
# 4. Add WebCanvas specific flags: EXPORTED_FUNCTIONS, EXPORTED_RUNTIME_METHODS, exception handling, and TypeScript definitions
sed "s|EMSDK:|$EMSDK/|g" ../wasm/wasm32.txt | \
  sed "s|, '-fno-exceptions'||g" | \
  sed "s|'-fno-exceptions', ||g" | \
  sed "s|, '--closure=1'||g" | \
  sed "s|, '-sEXPORTED_RUNTIME_METHODS=FS'||g" | \
  sed "s|cpp_args = \[|cpp_args = ['-pthread', |g" | \
  sed "s|'--bind'|'--bind', '-pthread', '-sPTHREAD_POOL_SIZE=4', '-sPTHREAD_POOL_SIZE_STRICT=0', '-sINITIAL_MEMORY=134217728', '-sALLOW_MEMORY_GROWTH=1', '--emit-tsd=thorvg.d.ts', '-sEXPORTED_FUNCTIONS=${EXPORTED_FUNCTIONS}', '-sEXPORTED_RUNTIME_METHODS=${EXPORTED_RUNTIME_METHODS}', '-sDISABLE_EXCEPTION_CATCHING=0', '-sDISABLE_EXCEPTION_THROWING=0', '-sALLOW_TABLE_GROWTH=1', '-sINITIAL_TABLE=128'|g" > /tmp/.wasm_webcanvas_cross.txt

meson setup \
  -Db_lto=true \
  -Ddefault_library=static \
  -Dstatic=true \
  -Dloaders="all" \
  -Dsavers="all" \
  -Dthreads=true \
  -Dfile="false" \
  -Dbindings="capi" \
  -Dpartial=true \
  -Dengines="all" \
  -Dextra="lottie_exp" \
  --cross-file /tmp/.wasm_webcanvas_cross.txt \
  build_wasm_wcanvas

if [ $? -ne 0 ]; then
  echo "ThorVG library meson setup failed!"
  exit 1
fi

ninja -C build_wasm_wcanvas/

if [ $? -ne 0 ]; then
  echo "ThorVG library build failed!"
  exit 1
fi

cd ../packages/webcanvas

# Step 2: Build WASM bindings
rm -rf build_wasm_wcanvas

cp ../../thorvg/build_wasm_wcanvas/config.h ../../wasm/webcanvas/config.h
meson setup -Db_lto=true --cross-file /tmp/.wasm_webcanvas_cross.txt build_wasm_wcanvas ../../wasm/webcanvas

if [ $? -ne 0 ]; then
  echo "WebCanvas bindings meson setup failed!"
  exit 1
fi

ninja -C build_wasm_wcanvas/

if [ $? -ne 0 ]; then
  echo "WebCanvas bindings build failed!"
  exit 1
fi

rm ../../wasm/webcanvas/config.h

echo "Build completed successfully!"
ls -lrt build_wasm_wcanvas/*.{js,wasm}
