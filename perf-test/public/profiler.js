var statsFPS = new Stats();
        statsFPS.showPanel(0); // 0: fps
        statsFPS.dom.style.cssText =
          "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
        document.body.appendChild(statsFPS.dom);

        var statsMS = new Stats();
        statsMS.showPanel(1); // 1: ms
        statsMS.dom.style.cssText =
          "position:fixed;top:0;left:80px;cursor:pointer;opacity:0.9;z-index:10000";
        document.body.appendChild(statsMS.dom);

        var statsMB;
        if (self.performance && self.performance.memory) {
          statsMB = new Stats();
          statsMB.showPanel(2); // 2: mb
          statsMB.dom.style.cssText =
            "position:fixed;top:0;left:160px;cursor:pointer;opacity:0.9;z-index:10000";
          document.body.appendChild(statsMB.dom);
        }

        function animate() {
          statsFPS.begin();
          statsMS.begin();
          if (statsMB) statsMB.begin();

          statsFPS.end();
          statsMS.end();
          if (statsMB) statsMB.end();

          requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);