/*
 * Copyright (c) 2026 ThorVG project. All rights reserved.

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

#include <thorvg_capi.h>
#include "thorvg_media.h"
#include "tvgPicture.h"
#include "tvgWebMediaLoader.h"

using namespace tvg;

struct WebCanvasMediaLoader : WebMediaLoader
{
    bool frameUpdated = false;

    //frames are pushed by the host, no media binary is handed over to wasm
    bool open(TVG_UNUSED const char* data, TVG_UNUSED uint32_t size, TVG_UNUSED const LoaderOps& ops) override
    {
        return false;
    }

    //the surface is prepared by tvg_video_load_metadata(), never pulled from a JS player
    RenderSurface* bitmap() override
    {
        return BitmapLoader::bitmap();
    }

    bool sync() override
    {
        auto ret = frameUpdated;
        frameUpdated = false;
        return ret;
    }

    //playback is driven by the JS side
    Result play() override
    {
        paused = false;
        return Result::Success;
    }

    Result pause() override
    {
        paused = true;
        return Result::Success;
    }

    Result stop() override
    {
        paused = true;
        curTime = 0.0f;
        return Result::Success;
    }

    Result seek(float seconds) override
    {
        curTime = seconds;
        return Result::Success;
    }

    Result loop(bool on) override
    {
        looping = on;
        return Result::Success;
    }

    Result volume(float volume) override
    {
        audioVolume = volume;
        return Result::Success;
    }

    Result mute(bool on) override
    {
        muted = on;
        return Result::Success;
    }
};

extern "C" {

uint32_t* tvg_video_load_metadata(Tvg_Video video, uint32_t w, uint32_t h, float duration)
{
    if (!video || w == 0 || h == 0 || duration <= 0.0f) return nullptr;

    auto picture = reinterpret_cast<Video*>(video)->picture();
    auto pimpl = tvg::to<PictureImpl>(picture);

    //reconfiguring reuses the loader in place. swapping it would dangle the bound surface
    auto loader = static_cast<WebCanvasMediaLoader*>(pimpl->loader);
    auto attaching = !loader;
    if (attaching) loader = new WebCanvasMediaLoader;

    auto& surface = loader->surface;

    if (surface.w != w || surface.h != h) {
        tvg::free(surface.buf32);
        auto buf = tvg::calloc<uint32_t>(w * h, sizeof(uint32_t));
        if (!buf) {
            surface.setup(nullptr, 0, 0, 0, 0, ColorSpace::Unknown);
            if (attaching) delete(loader);
            return nullptr;
        }
        surface.setup(buf, w, w, h, sizeof(uint32_t), ColorSpace::ABGR8888S);
    }

    loader->w = static_cast<float>(w);
    loader->h = static_cast<float>(h);
    loader->totalTime = duration;
    loader->curTime = 0.0f;
    loader->frameUpdated = false;

    //the picture takes its intrinsic size from the loader here, so attach it fully prepared
    if (attaching && pimpl->load(loader) != Result::Success) {
        delete(loader);
        return nullptr;
    }

    return surface.buf32;
}

Tvg_Result tvg_video_update_frame(Tvg_Video video, float time)
{
    if (!video) return TVG_RESULT_INVALID_ARGUMENT;

    auto picture = reinterpret_cast<Video*>(video)->picture();
    auto loader = static_cast<WebCanvasMediaLoader*>(tvg::to<PictureImpl>(picture)->loader);
    if (!loader || !loader->surface.buf32) return TVG_RESULT_INSUFFICIENT_CONDITION;

    loader->curTime = time;
    loader->frameUpdated = true;

    return TVG_RESULT_SUCCESS;
}

}  // extern "C"
