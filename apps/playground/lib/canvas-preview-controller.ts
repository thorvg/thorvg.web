import type {
  Canvas,
  Paint,
  Scene,
  Video,
  ThorVGNamespace,
} from "@thorvg/webcanvas";

export const CANVAS_SIZE = 600;

export interface CanvasPreviewController {
  setZoom(factor: number): void;
  resetForRun(): void;
}

/** Adapt one canvas for preview zoom without changing user paint transforms. */
export function createCanvasPreviewController(
  canvasInstance: Canvas,
  rootScene: Scene,
  element: HTMLCanvasElement,
  onSizeChange: (width: number, height: number) => void,
  VideoClass: ThorVGNamespace["Video"],
): CanvasPreviewController {
  let logicalWidth = CANVAS_SIZE;
  let logicalHeight = CANVAS_SIZE;
  const nativeUpdate = canvasInstance.update.bind(canvasInstance);
  const nativeRender = canvasInstance.render.bind(canvasInstance);
  const nativeResize = canvasInstance.resize.bind(canvasInstance);
  const nativeViewport = canvasInstance.viewport.bind(canvasInstance);
  const canvasPrototype = Object.getPrototypeOf(canvasInstance);
  const nativeDPR = (): number => Reflect.get(canvasPrototype, "dpr", canvasInstance);
  let previewZoom = 1;
  let viewport: [number, number, number, number] | null = null;
  // Changes inside our root scene do not set Canvas's private needsUpdate flag.
  // Track those separately; updatePending records explicit native updates until draw/sync.
  let sceneDirty = true;
  // Canvas construction/root attachment can also leave native updates pending.
  let updatePending = true;

  canvasInstance.add(rootScene);

  // Examples use DPR to convert between their coordinates and rendered pixels.
  // Include preview zoom here while Canvas keeps its native DPR internally.
  Object.defineProperty(canvasInstance, "dpr", {
    configurable: true,
    get: () => nativeDPR() * previewZoom,
  });

  function update(): Canvas {
    nativeUpdate();
    sceneDirty = false;
    updatePending = true;
    return canvasInstance;
  }

  function applyViewport(): void {
    if (viewport) {
      const [x, y, width, height] = viewport;
      // Existing viewport arguments are render-target pixels, without DPR conversion.
      nativeViewport(
        Math.trunc(x * previewZoom),
        Math.trunc(y * previewZoom),
        Math.trunc(width * previewZoom),
        Math.trunc(height * previewZoom),
      );
    } else {
      nativeViewport(0, 0, element.width, element.height);
    }
    sceneDirty = true;
  }

  let nativeRenderActive = false;

  function renderNative(): void {
    nativeRenderActive = true;
    try {
      nativeRender();
    } finally {
      nativeRenderActive = false;
    }
  }

  function render(): Canvas {
    if (sceneDirty) update();
    const previousDPR = nativeDPR();
    const previousWidth = element.width;
    const previousHeight = element.height;
    renderNative();
    updatePending = false;

    // WebCanvas may resize its target and change its DPR transform during render().
    // Restore clipping and process that transform before presenting the final frame.
    if (
      nativeDPR() !== previousDPR ||
      element.width !== previousWidth ||
      element.height !== previousHeight
    ) {
      applyViewport();
      update();
      renderNative();
      updatePending = false;
    }
    return canvasInstance;
  }

  function finishPendingUpdate(): void {
    // ThorVG requires pending updates to finish before changing the viewport.
    if (updatePending) render();
  }

  // Shared by user resizing, zoom, and new-run reset, after pending work is finished.
  function resizeTarget(): void {
    nativeResize(logicalWidth * previewZoom, logicalHeight * previewZoom);
    applyViewport();
    onSizeChange(logicalWidth * previewZoom, logicalHeight * previewZoom);
  }

  // Override only this preview instance, preserving native identity and chaining.
  const methods = {
    resize(width: number, height: number): Canvas {
      if (nativeRenderActive) {
        nativeResize(width, height);
        return canvasInstance;
      }

      finishPendingUpdate();
      logicalWidth = width;
      logicalHeight = height;
      resizeTarget();
      return canvasInstance;
    },
    add(paint: Paint | Video): Canvas {
      if (paint instanceof VideoClass) {
        paint.canvas = canvasInstance;
        const picture = paint.picture;
        if (picture) {
          rootScene.add(picture);
        }
      } else {
        rootScene.add(paint);
      }
      sceneDirty = true;
      return canvasInstance;
    },
    remove(paint?: Paint | Video): Canvas {
      if (paint instanceof VideoClass) {
        paint.canvas = null;
        const picture = paint.picture;
        if (picture) {
          rootScene.remove(picture);
        }
      } else {
        rootScene.remove(paint);
      }
      sceneDirty = true;
      return canvasInstance;
    },
    clear(): Canvas {
      finishPendingUpdate();
      rootScene.clear();
      sceneDirty = true;
      return render();
    },
    update,
    render,
    viewport(x: number, y: number, width: number, height: number): Canvas {
      finishPendingUpdate();
      viewport = [x, y, width, height];
      applyViewport();
      return canvasInstance;
    },
  };
  for (const [name, value] of Object.entries(methods)) {
    Object.defineProperty(canvasInstance, name, {
      configurable: true,
      writable: true,
      value,
    });
  }

  return {
    setZoom(factor: number): void {
      if (!Number.isFinite(factor) || factor <= 0) {
        throw new Error("Preview zoom must be finite and positive");
      }
      finishPendingUpdate();
      if (factor !== previewZoom) {
        previewZoom = factor;
        rootScene.scale(factor);
        resizeTarget();
      }
      render();
    },
    resetForRun(): void {
      finishPendingUpdate();
      viewport = null;
      rootScene.clear();
      logicalWidth = CANVAS_SIZE;
      logicalHeight = CANVAS_SIZE;
      resizeTarget();
      render();
    },
  };
}
