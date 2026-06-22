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

/*
 * Web-only host-driven video playback bindings.
 *
 * The ThorVG engine keeps only the common Video interface; the host-feed
 * entry points (load_metadata / update_frame) are web-specific and therefore
 * injected here at WebCanvas build time. They are compiled into the WebCanvas
 * module and exported through EXPORTED_FUNCTIONS, completing the tvg_video_*
 * C API that the TypeScript layer consumes.
 */

#include <thorvg_capi.h>
#include "thorvg_media.h"
#include "tvgPicture.h"
#include "tvgWebMediaLoader.h"

using namespace tvg;

extern "C" {

Tvg_Result tvg_video_load_metadata(Tvg_Video video, uint32_t w, uint32_t h, float duration)
{
    if (!video) return TVG_RESULT_INVALID_ARGUMENT;

    auto picture = reinterpret_cast<Video*>(video)->picture();
    auto loader = new WebMediaLoader;
    auto ret = loader->open(w, h, duration, ColorSpace::ABGR8888S);
    if (ret != Result::Success) {
        delete(loader);
        return (Tvg_Result) ret;
    }
    return (Tvg_Result) tvg::to<PictureImpl>(picture)->load(loader);
}


Tvg_Result tvg_video_update_frame(Tvg_Video video, const uint32_t* frame, float time)
{
    if (!video) return TVG_RESULT_INVALID_ARGUMENT;

    auto picture = reinterpret_cast<Video*>(video)->picture();
    auto loader = static_cast<WebMediaLoader*>(tvg::to<PictureImpl>(picture)->loader);
    if (!loader) return TVG_RESULT_INSUFFICIENT_CONDITION;

    auto ret = loader->update(frame, time);
    if (ret == Result::Success) PAINT(picture)->mark(RenderUpdateFlag::Image);
    return (Tvg_Result) ret;
}

}  // extern "C"
