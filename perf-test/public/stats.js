/**
 * @author mrdoob
 * @license MIT
 * Based on stats.js by mrdoob
 * Original: https://github.com/mrdoob/stats.js
 * Modified: external-updates only (no internal timing)
 */

var Stats = function () {
  var mode = 0;

  var container = document.createElement("div");
  container.style.cssText = "display:flex;cursor:pointer;opacity:0.95;";
  container.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      showPanel(++mode % container.children.length);
    },
    false
  );

  function addPanel(panel) {
    container.appendChild(panel.dom);
    return panel;
  }

  function showPanel(id) {
    for (var i = 0; i < container.children.length; i++) {
      container.children[i].style.display = i === id ? "block" : "none";
    }
    mode = id;
  }

  var fpsPanel = addPanel(new Stats.Panel("FPS", "#0ff", "#002"));
  var msPanel = addPanel(new Stats.Panel("MS", "#0f0", "#020"));
  var memPanel = null;

  if (self.performance && self.performance.memory) {
    memPanel = addPanel(new Stats.Panel("MB", "#f08", "#201"));
  }

  showPanel(0);

  return {
    REVISION: 16,

    dom: container,
    addPanel: addPanel,
    showPanel: showPanel,

    __panels: { fps: fpsPanel, ms: msPanel, mb: memPanel },

    // Backwards Compatibility
    domElement: container,
    setMode: showPanel,
  };
};

Stats.Panel = function (name, fg, bg) {
  var min = Infinity,
    max = 0,
    round = Math.round;
  var acc = null; // acc = (acc + value) / 2

  var PR = round(window.devicePixelRatio || 1);

  var WIDTH = 110 * PR,
    HEIGHT = 60 * PR,
    TEXT_X = 3 * PR,
    TEXT_Y = 2 * PR,
    LINE_HEIGHT = 10 * PR,
    GRAPH_X = 3 * PR,
    GRAPH_Y = 24 * PR,
    GRAPH_WIDTH = 104 * PR,
    GRAPH_HEIGHT = 32 * PR;

  var canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = "width:110px;height:60px";

  var context = canvas.getContext("2d");
  context.font = "bold " + 10 * PR + "px Helvetica,Arial,sans-serif";
  context.textBaseline = "top";

  context.fillStyle = bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = fg;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  context.fillStyle = bg;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  context.globalAlpha = 1;

  return {
    dom: canvas,

    update: function (value, maxValue) {
      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        acc = acc == null ? value : (acc + value) / 2;
      }

      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);

      var firstLine =
        name === "MS"
          ? `${name}: ${value.toFixed(1)}`
          : `${name}: ${round(value)}`;

      var secondLine;
      if (name === "MS") {
        secondLine = `acc: ${acc.toFixed(1)} (${min.toFixed(1)} ~ ${max.toFixed(
          1
        )})`;
      } else {
        secondLine = `acc: ${round(acc)} (${round(min)} ~ ${round(max)})`;
      }

      context.fillStyle = fg;
      context.fillText(firstLine, TEXT_X, TEXT_Y);
      context.fillText(secondLine, TEXT_X, TEXT_Y + LINE_HEIGHT);

      context.drawImage(
        canvas,
        GRAPH_X + PR,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT,
        GRAPH_X,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT
      );

      context.fillStyle = fg;
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

      context.fillStyle = bg;
      context.globalAlpha = 0.9;

      var denom = maxValue > 0 ? maxValue : 1;
      var h = Math.round((1 - value / denom) * GRAPH_HEIGHT);
      if (!Number.isFinite(h)) h = GRAPH_HEIGHT;

      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, h);

      context.globalAlpha = 1;
    },
  };
};

export { Stats as default };
