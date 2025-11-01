import Stats from "./stats.js";

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

  const root = document.createElement("div");
  root.style.cssText =
    "position:fixed;top:8px;left:8px;z-index:" +
    zIndex +
    ";display:flex;align-items:flex-start;gap:4px;";
  document.body.appendChild(root);

  const container = document.createElement("div");
  container.style.cssText = "display:flex;cursor:pointer;";
  root.appendChild(container);

  const toggle = document.createElement("button");
  toggle.textContent = "▾";
  toggle.setAttribute("aria-label", "Toggle stats");
  toggle.style.cssText =
    "display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:9999px;border:none;background:rgba(255,255,255,0.7);color:#000;font-weight:700;cursor:pointer;";
  root.appendChild(toggle);

  let collapsed = false;
  const setCollapsed = (v) => {
    collapsed = v;
    container.style.display = v ? "none" : "flex";
    toggle.textContent = v ? "▸" : "▾";
  };
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  });

  const instances = [];

  const addStats = (panelIndex) => {
    const s = new Stats();
    s.showPanel(panelIndex);
    Object.assign(s.dom.style, { cursor: "pointer", opacity: "0.9" });
    container.appendChild(s.dom);
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
