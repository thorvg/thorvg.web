/*
 * Copyright (c) 2025 the ThorVG project. All rights reserved.

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

#include "tvgCommon.h"
#include "thorvg_capi.h"
#include "tvgWasmDefaultFont.h"
#include <emscripten.h>
#include <emscripten/bind.h>
#include <string>

using namespace tvg;
using emscripten::class_;
using emscripten::val;
using emscripten::typed_memory_view;
using std::string;


struct TvgEngineMethod
{
    virtual ~TvgEngineMethod() {}
    virtual Canvas* init(string& selector) = 0;
    virtual void resize(Canvas* canvas, uint32_t w, uint32_t h) = 0;
    virtual val output(uint32_t w, uint32_t h)
    {
        return val::undefined();
    }

    void loadFont() {
        Text::load("default", requestFont(), DEFAULT_FONT_SIZE, "ttf", false);
    }
};

#ifdef THORVG_SW_RASTER_SUPPORT

struct TvgSwEngine : TvgEngineMethod
{
    uint8_t* buffer = nullptr;

    ~TvgSwEngine()
    {
        std::free(buffer);
        Initializer::term();
        retrieveFont();
    }

    Canvas* init(string& selector) override
    {
        if (Initializer::init() != Result::Success) return nullptr;
        loadFont();
        return SwCanvas::gen();
    }

    void resize(Canvas* canvas, uint32_t w, uint32_t h) override
    {
        if (!canvas) return;

        std::free(buffer);
        buffer = (uint8_t*)std::malloc(w * h * 4);
        if (!buffer) return;

        static_cast<SwCanvas*>(canvas)->target(
            (uint32_t*)buffer, w, w, h, ColorSpace::ABGR8888S
        );
    }

    val output(uint32_t w, uint32_t h) override
    {
        if (buffer) {
            return val(typed_memory_view(w * h * 4, buffer));
        }
        return val::undefined();
    }
};

#endif

#ifdef THORVG_WG_RASTER_SUPPORT

#include <webgpu/webgpu.h>

static WGPUInstance instance{};
static WGPUAdapter adapter{};
static WGPUDevice device{};
static bool adapterRequested = false;
static bool deviceRequested = false;
static bool initializationFailed = false;

struct TvgWgEngine : TvgEngineMethod
{
    WGPUSurface surface{};

    ~TvgWgEngine()
    {
        if (surface) wgpuSurfaceRelease(surface);
        Initializer::term();
        retrieveFont();
    }

    Canvas* init(string& selector) override
    {
        // Create WebGPU surface
        WGPUEmscriptenSurfaceSourceCanvasHTMLSelector canvasDesc{};
        canvasDesc.chain.next = nullptr;
        canvasDesc.chain.sType = WGPUSType_EmscriptenSurfaceSourceCanvasHTMLSelector;
        canvasDesc.selector.data = selector.c_str();
        canvasDesc.selector.length = WGPU_STRLEN;

        WGPUSurfaceDescriptor surfaceDesc{};
        surfaceDesc.nextInChain = &canvasDesc.chain;
        surface = wgpuInstanceCreateSurface(instance, &surfaceDesc);

        if (!surface) return nullptr;

        if (Initializer::init() != Result::Success) return nullptr;
        loadFont();

        return WgCanvas::gen();
    }

    void resize(Canvas* canvas, uint32_t w, uint32_t h) override
    {
        if (!canvas) return;

        static_cast<WgCanvas*>(canvas)->target(
            device, instance, surface, w, h, ColorSpace::ABGR8888S
        );
    }

    static int init()
    {
        if (initializationFailed) return 1;

        // Init WebGPU instance
        if (!instance) {
            instance = wgpuCreateInstance(nullptr);
        }

        // Request adapter
        if (!adapter) {
            if (adapterRequested) return 2;

            auto onAdapterRequestEnded = [](WGPURequestAdapterStatus status, WGPUAdapter adapter,
                                           WGPUStringView message, WGPU_NULLABLE void* userdata1,
                                           WGPU_NULLABLE void* userdata2) {
                if (status != WGPURequestAdapterStatus_Success) {
                    initializationFailed = true;
                    return;
                }
                *((WGPUAdapter*)userdata1) = adapter;
            };

            const WGPURequestAdapterOptions requestAdapterOptions{
                .powerPreference = WGPUPowerPreference_HighPerformance
            };
            const WGPURequestAdapterCallbackInfo requestAdapterCallback{
                .mode = WGPUCallbackMode_AllowSpontaneous,
                .callback = onAdapterRequestEnded,
                .userdata1 = &adapter
            };
            wgpuInstanceRequestAdapter(instance, &requestAdapterOptions, requestAdapterCallback);

            adapterRequested = true;
            return 2;
        }

        // Request device
        if (deviceRequested) return device == nullptr ? 2 : 0;

        if (!device) {
            auto onDeviceError = [](WGPUDevice const * device, WGPUErrorType type,
                                   WGPUStringView message, void* userdata1, void* userdata2) {};
            auto onDeviceRequestEnded = [](WGPURequestDeviceStatus status, WGPUDevice device,
                                          WGPUStringView message, void* userdata1, void* userdata2) {
                if (status != WGPURequestDeviceStatus_Success) {
                    initializationFailed = true;
                    return;
                }
                *((WGPUDevice*)userdata1) = device;
            };

            const WGPUDeviceDescriptor deviceDesc {
                .label = { "ThorVG Device", WGPU_STRLEN },
                .uncapturedErrorCallbackInfo = { .callback = onDeviceError }
            };
            const WGPURequestDeviceCallbackInfo requestDeviceCallback {
                .mode = WGPUCallbackMode_AllowSpontaneous,
                .callback = onDeviceRequestEnded,
                .userdata1 = &device
            };
            wgpuAdapterRequestDevice(adapter, &deviceDesc, requestDeviceCallback);

            deviceRequested = true;
            return 2;
        }
        return 0;
    }

    static void term()
    {
        if (device) wgpuDeviceRelease(device);
        if (adapter) wgpuAdapterRelease(adapter);
        if (instance) wgpuInstanceRelease(instance);
        device = nullptr;
        adapter = nullptr;
        instance = nullptr;
        adapterRequested = false;
        deviceRequested = false;
        initializationFailed = false;
    }
};

#endif

#ifdef THORVG_GL_RASTER_SUPPORT

#include <emscripten/html5_webgl.h>

struct TvgGlEngine : TvgEngineMethod
{
    intptr_t context = 0;

    ~TvgGlEngine()
    {
        if (context) {
            Initializer::term();
            emscripten_webgl_destroy_context(context);
            context = 0;
        }
        retrieveFont();
    }

    Canvas* init(string& selector) override
    {
        EmscriptenWebGLContextAttributes attrs{};
        attrs.alpha = true;
        attrs.depth = false;
        attrs.stencil = false;
        attrs.premultipliedAlpha = true;
        attrs.failIfMajorPerformanceCaveat = false;
        attrs.majorVersion = 2;
        attrs.minorVersion = 0;
        attrs.enableExtensionsByDefault = true;

        context = emscripten_webgl_create_context(selector.c_str(), &attrs);
        if (context == 0) return nullptr;

        emscripten_webgl_make_context_current(context);

        if (Initializer::init() != Result::Success) return nullptr;
        loadFont();

        return GlCanvas::gen();
    }

    void resize(Canvas* canvas, uint32_t w, uint32_t h) override
    {
        if (!canvas) return;

        static_cast<GlCanvas*>(canvas)->target(
            (void*)context, 0, w, h, ColorSpace::ABGR8888S
        );
    }
};

#endif

// 0: success, 1: fail, 2: wait for async request
int init() {
#ifdef THORVG_WG_RASTER_SUPPORT
    return TvgWgEngine::init();
#else
    return 0;
#endif
}

void term() {
#ifdef THORVG_WG_RASTER_SUPPORT
    TvgWgEngine::term();
#endif
}

class __attribute__((visibility("default"))) TvgCanvas {
public:
    ~TvgCanvas() {
        if (canvas) delete canvas;
        if (engine) delete engine;
    }

    explicit TvgCanvas(string engineType = "sw", string selector = "", uint32_t w = 0, uint32_t h = 0) {
        errorMsg = "None";

#ifdef THORVG_SW_RASTER_SUPPORT
        if (engineType == "sw") engine = new TvgSwEngine;
#endif
#ifdef THORVG_GL_RASTER_SUPPORT
        if (engineType == "gl") engine = new TvgGlEngine;
#endif
#ifdef THORVG_WG_RASTER_SUPPORT
        if (engineType == "wg") engine = new TvgWgEngine;
#endif

        if (!engine) {
            errorMsg = "Invalid engine";
            return;
        }

        canvas = engine->init(selector);
        if (!canvas) {
            errorMsg = "Canvas initialization failed";
            return;
        }

        resize(w, h);
    }

    string error() {
        return errorMsg;
    }

    bool resize(uint32_t w, uint32_t h) {
        if (!canvas || !engine) return false;
        if (width == w && height == h) return true;

        canvas->sync();

        width = w;
        height = h;

        engine->resize(canvas, w, h);

        return true;
    }

    bool clear() {
        if (!canvas) return false;
        canvas->remove();
        return true;
    }

    val render() {
        if (!canvas || !engine) return val::undefined();
        return engine->output(width, height);
    }

    val size() {
        val result = val::object();
        result.set("width", width);
        result.set("height", height);
        return result;
    }

    uintptr_t ptr() {
        return reinterpret_cast<uintptr_t>(canvas);
    }

private:
    Canvas* canvas = nullptr;
    TvgEngineMethod* engine = nullptr;
    uint32_t width = 0;
    uint32_t height = 0;
    string errorMsg;
};

EMSCRIPTEN_BINDINGS(thorvg_canvaskit) {
    emscripten::function("init", &init);
    emscripten::function("term", &term);

    class_<TvgCanvas>("TvgCanvas")
        .constructor<string, string, uint32_t, uint32_t>()
        .function("error", &TvgCanvas::error)
        .function("resize", &TvgCanvas::resize)
        .function("clear", &TvgCanvas::clear)
        .function("render", &TvgCanvas::render)
        .function("size", &TvgCanvas::size)
        .function("ptr", &TvgCanvas::ptr);
}
