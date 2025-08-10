async function getStatsCtor() {
  try {
    const mod = await import("/stats.js");
    return mod.default || mod.Stats || window.Stats;
  } catch {
    return window.Stats;
  }
}

export async function startProfiler(options = {}) {
  if (typeof document === "undefined") {
    throw new Error("startProfiler must run in a browser.");
  }

  const {
    tiles = ["fps", "ms", "mb"],
    zIndex = 10000,
    maxFps = 144,
    maxMs = 33,
  } = options;

  const Stats = await getStatsCtor();
  if (!Stats) throw new Error("Stats constructor not found.");

  const root = document.createElement("div");
  root.style.cssText =
    "position:fixed;top:8px;left:8px;display:flex;gap:4px;z-index:" +
    zIndex +
    ";";
  document.body.appendChild(root);

  const instances = [];

  const addStats = (panelIndex) => {
    const s = new Stats();
    s.showPanel(panelIndex);
    Object.assign(s.dom.style, { cursor: "pointer", opacity: "0.9" });
    root.appendChild(s.dom);
    instances.push(s);
    return s;
  };

  if (tiles.includes("fps")) addStats(0);
  if (tiles.includes("ms")) addStats(1);
  if (tiles.includes("mb") && performance && performance.memory) addStats(2);

  let rafId = 0;
  let last = performance.now();
  let secStart = last;
  let frames = 0;
  let sumDt = 0,
    cntDt = 0;

  const tick = () => {
    const now = performance.now();
    const dt = now - last;
    last = now;

    frames++;
    sumDt += dt;
    cntDt++;

    if (now - secStart >= 1000) {
      const span = now - secStart;
      const fps = (frames * 1000) / span;
      const msAvg = cntDt ? sumDt / cntDt : 0;

      for (const s of instances) {
        if (s.__panels?.fps) s.__panels.fps.update(fps, maxFps);
        if (s.__panels?.ms) s.__panels.ms.update(msAvg, maxMs);
        if (s.__panels?.mb && performance && performance.memory) {
          const m = performance.memory;
          s.__panels.mb.update(
            m.usedJSHeapSize / 1048576,
            m.jsHeapSizeLimit / 1048576
          );
        }
      }

      frames = 0;
      sumDt = 0;
      cntDt = 0;
      secStart = now;
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return {
    dispose() {
      cancelAnimationFrame(rafId);
      instances.forEach((s) => s.dom.remove());
      root.remove();
    },
  };
}

if (typeof window !== "undefined" && !window.startProfiler) {
  window.startProfiler = (...args) => startProfiler(...args);
}
