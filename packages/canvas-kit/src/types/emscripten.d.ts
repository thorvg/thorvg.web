/**
 * Emscripten Module type definitions for ThorVG
 */

export interface EmscriptenModule {
  // Emscripten standard memory management
  _malloc(size: number): number;
  _free(ptr: number): void;

  // Memory heaps
  HEAPU8: Uint8Array;
  HEAP8: Int8Array;
  HEAPU16: Uint16Array;
  HEAP16: Int16Array;
  HEAPU32: Uint32Array;
  HEAP32: Int32Array;
  HEAPF32: Float32Array;
  HEAPF64: Float64Array;

  // ThorVG initialization
  init(): number;
  term(): void;

  // TvgCanvas class (Embind)
  TvgCanvas: TvgCanvasConstructor;
}

export interface TvgCanvasConstructor {
  new (
    engineType: string,
    selector: string,
    width: number,
    height: number
  ): TvgCanvasInstance;
}

export interface TvgCanvasInstance {
  error(): string;
  resize(width: number, height: number): boolean;
  clear(): boolean;
  render(): Uint8ClampedArray | undefined;
  size(): { width: number; height: number };
  ptr(): number;
  delete(): void;
}

// CAPI function signatures
export interface ThorVGCAPI {
  // Canvas functions
  _tvg_canvas_push(canvas: number, paint: number): number;
  _tvg_canvas_remove(canvas: number, paint: number): number;
  _tvg_canvas_update(canvas: number): number;
  _tvg_canvas_draw(canvas: number, preserve: number): number;
  _tvg_canvas_sync(canvas: number): number;
  _tvg_canvas_set_viewport(canvas: number, x: number, y: number, w: number, h: number): number;

  // Paint functions
  _tvg_paint_translate(paint: number, x: number, y: number): number;
  _tvg_paint_rotate(paint: number, angle: number): number;
  _tvg_paint_scale(paint: number, sx: number, sy: number): number;
  _tvg_paint_set_opacity(paint: number, opacity: number): number;
  _tvg_paint_get_opacity(paint: number): number;
  _tvg_paint_set_visible(paint: number, visible: number): number;
  _tvg_paint_get_visible(paint: number): number;
  _tvg_paint_get_aabb(paint: number, aabb: number): number;
  _tvg_paint_duplicate(paint: number): number;
  _tvg_paint_unref(paint: number, free: number): number;

  // Shape functions
  _tvg_shape_new(): number;
  _tvg_shape_move_to(shape: number, x: number, y: number): number;
  _tvg_shape_line_to(shape: number, x: number, y: number): number;
  _tvg_shape_cubic_to(
    shape: number,
    cx1: number,
    cy1: number,
    cx2: number,
    cy2: number,
    x: number,
    y: number
  ): number;
  _tvg_shape_close(shape: number): number;
  _tvg_shape_append_rect(
    shape: number,
    x: number,
    y: number,
    w: number,
    h: number,
    rx: number,
    ry: number,
    clockwise: number
  ): number;
  _tvg_shape_append_circle(
    shape: number,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    clockwise: number
  ): number;
  _tvg_shape_set_fill_color(
    shape: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): number;
  _tvg_shape_set_gradient(shape: number, gradient: number): number;
  _tvg_shape_set_stroke_width(shape: number, width: number): number;
  _tvg_shape_set_stroke_color(
    shape: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): number;
  _tvg_shape_set_stroke_gradient(shape: number, gradient: number): number;
  _tvg_shape_set_stroke_cap(shape: number, cap: number): number;
  _tvg_shape_set_stroke_join(shape: number, join: number): number;
  _tvg_shape_set_stroke_miterlimit(shape: number, miterlimit: number): number;

  // Scene functions
  _tvg_scene_new(): number;
  _tvg_scene_push(scene: number, paint: number): number;
  _tvg_scene_remove(scene: number, paint: number): number;

  // Picture functions
  _tvg_picture_new(): number;
  _tvg_picture_load_data(
    picture: number,
    data: number,
    size: number,
    mimetype: string,
    rpath: string,
    copy: number
  ): number;
  _tvg_picture_load(picture: number, path: string): number;
  _tvg_picture_set_size(picture: number, w: number, h: number): number;
  _tvg_picture_get_size(picture: number, w: number, h: number): number;
  _tvg_paint_rel(paint: number): number;

  // Text functions
  _tvg_text_new(): number;
  _tvg_text_set_font(text: number, name: number): number;
  _tvg_text_set_text(text: number, utf8: number): number;
  _tvg_text_set_size(text: number, size: number): number;
  _tvg_text_set_color(text: number, r: number, g: number, b: number): number;
  _tvg_text_align(text: number, halign: number, valign: number): number;
  _tvg_text_layout(text: number, width: number, height: number): number;
  _tvg_text_wrap_mode(text: number, mode: number): number;
  _tvg_text_set_italic(text: number, shear: number): number;
  _tvg_text_set_outline(text: number, width: number, r: number, g: number, b: number): number;
  _tvg_text_set_gradient(text: number, gradient: number): number;
  _tvg_text_set_stroke_gradient(text: number, gradient: number): number;

  // Font functions
  _tvg_font_load_data(name: number, data: number, size: number, mimetype: number, copy: number): number;
  _tvg_font_load(name: number, path: string): number;
  _tvg_font_unload(name: number): number;

  // Animation functions
  _tvg_animation_new(): number;
  _tvg_animation_del(animation: number): number;
  _tvg_animation_get_picture(animation: number): number;
  _tvg_animation_set_frame(animation: number, frame: number): number;
  _tvg_animation_get_frame(animation: number): number;
  _tvg_animation_get_total_frame(animation: number, framePtr: number): number;
  _tvg_animation_get_duration(animation: number, durationPtr: number): number;
  _tvg_animation_set_segment(animation: number, segment: number): number;

  // Gradient functions
  _tvg_linear_gradient_new(): number;
  _tvg_linear_gradient_set(gradient: number, x1: number, y1: number, x2: number, y2: number): number;
  _tvg_radial_gradient_new(): number;
  _tvg_radial_gradient_set(
    gradient: number,
    cx: number,
    cy: number,
    r: number,
    fx: number,
    fy: number,
    fr: number
  ): number;
  _tvg_gradient_set_color_stops(gradient: number, stops: number, count: number): number;
  _tvg_gradient_set_spread(gradient: number, spread: number): number;
  _tvg_gradient_del(gradient: number): number;
}

// Combined module interface
export type ThorVGModule = EmscriptenModule & ThorVGCAPI;
