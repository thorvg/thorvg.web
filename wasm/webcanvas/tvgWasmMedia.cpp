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

extern "C" {

Tvg_Result tvg_video_load_metadata(Tvg_Video video, uint32_t* buf, uint32_t w, uint32_t h, float duration)
{
    if (!video) return TVG_RESULT_INVALID_ARGUMENT;

    auto picture = reinterpret_cast<Video*>(video)->picture();
    auto pimpl = tvg::to<PictureImpl>(picture);

    if (pimpl->loader) {
        auto loader = static_cast<WebMediaLoader*>(pimpl->loader);
        auto ret = loader->setup(buf, w, h, ColorSpace::ABGR8888S, duration);
        return (Tvg_Result) ret;
    }

    auto loader = new WebMediaLoader;
    loader->setup(buf, w, h, ColorSpace::ABGR8888S, duration);
    return (Tvg_Result) pimpl->load(loader);
}


Tvg_Result tvg_video_update_frame(Tvg_Video video, float time)
{
    if (!video) return TVG_RESULT_INVALID_ARGUMENT;

    auto picture = reinterpret_cast<Video*>(video)->picture();
    auto loader = static_cast<WebMediaLoader*>(tvg::to<PictureImpl>(picture)->loader);
    auto ret = loader->update(time);
    return (Tvg_Result) ret;
}

}  // extern "C"
