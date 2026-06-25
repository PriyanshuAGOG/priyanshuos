/* =========================================================================
   MASCOT ENGINE v2 — performance-first rewrite
   - Reusable factory: createMascot(container, options) — mount anywhere,
     any size, multiple instances per page if needed.
   - LAZY LOADING: only the first idle clip is fetched on mount. Every other
     gesture's video is created and fetched on first use, then cached.
   - Pauses all decode/render work when off-screen or tab is hidden.
   - Renders on video-frame-ready callbacks (~24fps) instead of every vsync,
     so it never burns more GPU/CPU than the source footage needs.
   - Respects prefers-reduced-motion: no ambient cycling, no spontaneous
     attention-seeking, no particle bursts.
   ========================================================================= */

(function (global) {
  "use strict";

  const GESTURES = {
    idle:   { label: "Idle",   emoji: "💤", loop: true,  variants: ["idle_1", "idle_2"] },
    wave:   { label: "Wave",   emoji: "👋", loop: false, variants: ["wave_1", "wave_2", "wave_3", "wave_4"] },
    point:  { label: "Point",  emoji: "👉", loop: false, variants: ["point_1", "point_2", "point_3", "point_4"] },
    sit:    { label: "Sit",    emoji: "🪑", loop: true,  variants: ["sit_1", "sit_2"] },
    think:  { label: "Think",  emoji: "🤔", loop: true,  variants: ["think_1", "think_2", "think_3", "think_4"] },
    listen: { label: "Listen", emoji: "👂", loop: true,  variants: ["listen_1", "listen_2", "listen_3", "listen_4", "listen_5", "listen_6"] },
    talk:   { label: "Talk",   emoji: "💬", loop: true,  variants: ["talk_1", "talk_2", "talk_3", "talk_4"] },
    groove: { label: "Groove", emoji: "🕺", loop: true,  variants: ["groove_1"] },
  };

  const ONE_SHOT_STATES = new Set(["wave", "point"]);
  const REACTION_STATES = ["wave", "think", "talk", "listen", "groove"];
  const SPEECH_LINES = {
    wave: ["Hey! 👋", "Good to see you!", "Hello there!"],
    point: ["Check this out!", "Over here!", "Look!"],
    think: ["Hmm, let me think…", "Good question…", "One sec…"],
    talk: ["So, here's the thing —", "Let me explain…", "Quick update!"],
    listen: ["I'm listening…", "Go on…", "Tell me more."],
    sit: ["Taking a breather.", "Just resting here."],
    groove: ["Let's go! 🎵", "Feeling it!", "Woo!"],
    idle: [],
  };

  const VERT_SRC = `#version 300 es
    in vec2 aPos;
    in vec2 aUV;
    out vec2 vUV;
    void main(){
      vUV = aUV;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const FRAG_SRC = `#version 300 es
    precision highp float;
    in vec2 vUV;
    out vec4 outColor;
    uniform sampler2D uTex;
    uniform float uLo;
    uniform float uHi;
    uniform float uSpillStrength;

    void main(){
      vec4 src = texture(uTex, vUV);
      float r = src.r, g = src.g, b = src.b;
      float maxRB = max(r, b);
      float diff = g - maxRB;

      float a = smoothstep(uLo, uHi, diff);
      a = pow(a, 0.6);
      float alpha = 1.0 - a;

      float spillT = smoothstep(uLo * 0.1, uHi * 0.75, diff) * uSpillStrength;
      float gTarget = min(g, maxRB * 0.98);
      float gCorrected = mix(g, gTarget, spillT);

      vec3 color = vec3(r, gCorrected, b);
      outColor = vec4(color * alpha, alpha);
    }
  `;

  function compileShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error("Shader compile failed: " + log);
    }
    return sh;
  }

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Mount an interactive mascot into `container`.
   * @param {HTMLElement} container - element to mount canvas + UI hooks into
   * @param {Object} opts
   *   videoBase: string path to the videos/ folder (default "videos/")
   *   autoIdle: bool - start playing idle immediately on mount (default true)
   *   ambient: bool - cycle idle variants periodically (default true, off if reduced-motion)
   *   spontaneous: bool - attention-seeking after quiet period (default true, off if reduced-motion)
   *   fx: bool - particle bursts on gesture trigger (default true, off if reduced-motion)
   *   onStateChange: (stateKey) => void
   *   onSpeech: (text|null) => void
   */
  function createMascot(container, opts = {}) {
    const reduced = prefersReducedMotion();
    const options = Object.assign({
      videoBase: "videos/",
      autoIdle: true,
      ambient: !reduced,
      spontaneous: !reduced,
      fx: !reduced,
      onStateChange: null,
      onSpeech: null,
    }, opts);

    // ---- DOM scaffolding ----
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const videoPool = document.createElement("div");
    videoPool.style.position = "absolute";
    videoPool.style.width = "1px";
    videoPool.style.height = "1px";
    videoPool.style.overflow = "hidden";
    videoPool.style.opacity = "0";
    videoPool.style.pointerEvents = "none";
    container.appendChild(videoPool);

    // ---- WebGL setup ----
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) {
      console.error("[mascot] WebGL2 unavailable");
      return { destroy() {}, trigger() {}, states: [] };
    }

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[mascot] Program link failed:", gl.getProgramInfoLog(program));
      return { destroy() {}, trigger() {}, states: [] };
    }
    gl.useProgram(program);

    const quad = new Float32Array([
      -1, -1, 0, 1,
       1, -1, 1, 1,
      -1,  1, 0, 0,
       1, -1, 1, 1,
       1,  1, 1, 0,
      -1,  1, 0, 0,
    ]);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(program, "aPos");
    const aUVLoc = gl.getAttribLocation(program, "aUV");
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUVLoc);
    gl.vertexAttribPointer(aUVLoc, 2, gl.FLOAT, false, 16, 8);

    const uTexLoc = gl.getUniformLocation(program, "uTex");
    const uLoLoc = gl.getUniformLocation(program, "uLo");
    const uHiLoc = gl.getUniformLocation(program, "uHi");
    const uSpillLoc = gl.getUniformLocation(program, "uSpillStrength");

    let keyLo = 0.08;
    let keyHi = 0.30;
    const keySpill = 1.0;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let lastW = 0, lastH = 0;
    function resizeCanvasToDisplaySize() {
      // Cap device pixel ratio: a small mascot widget never needs full
      // retina res for a 9:16 video texture — 1.5x is indistinguishable
      // here and meaningfully cheaper to composite than 2-3x.
      const dpr = Math.min(global.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(container.clientWidth * dpr));
      const h = Math.max(1, Math.round(container.clientHeight * dpr));
      if (w !== lastW || h !== lastH) {
        canvas.width = w;
        canvas.height = h;
        lastW = w; lastH = h;
      }
    }

    // ---- LAZY video pool ----
    // Videos are created on first use, not all up front. Once created they
    // stay cached (paused, decoded-ready) for instant reuse.
    const videoEls = {};       // name -> HTMLVideoElement
    const loadingPromises = {}; // name -> Promise (in-flight load dedupe)

    function getOrCreateVideo(name) {
      if (videoEls[name]) return videoEls[name];
      const v = document.createElement("video");
      const sourceWebm = document.createElement("source");
      sourceWebm.src = options.videoBase + name + ".webm";
      sourceWebm.type = "video/webm";
      const sourceMp4 = document.createElement("source");
      sourceMp4.src = options.videoBase + name + ".mp4";
      sourceMp4.type = "video/mp4";
      v.appendChild(sourceWebm);
      v.appendChild(sourceMp4);
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      videoPool.appendChild(v);
      videoEls[name] = v;
      return v;
    }

    function loadVideo(name) {
      if (loadingPromises[name]) return loadingPromises[name];
      const v = getOrCreateVideo(name);
      if (v.readyState >= 2) {
        loadingPromises[name] = Promise.resolve(v);
        return loadingPromises[name];
      }
      loadingPromises[name] = new Promise((resolve) => {
        const onReady = () => resolve(v);
        v.addEventListener("loadeddata", onReady, { once: true });
        v.addEventListener("error", () => {
          console.warn("[mascot] failed to load clip:", name, v.error);
          resolve(v); // fail-soft: continue rather than hang the state machine
        }, { once: true });
        v.load();
        setTimeout(() => resolve(v), 8000); // safety net
      });
      return loadingPromises[name];
    }

    function pickVariant(stateKey) {
      const arr = GESTURES[stateKey].variants;
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // ---- state machine ----
    let currentName = null;
    let currentState = "idle";
    let destroyed = false;
    let suspended = false; // true when off-screen / tab hidden — render loop fully stops

    let lastInteractionAt = performance.now();
    let ambientTimer = null;
    let spontaneousTimer = null;
    let returnToIdleTimer = null;

    function emitState(stateKey) {
      if (options.onStateChange) options.onStateChange(stateKey);
    }
    function emitSpeech(stateKey) {
      const lines = SPEECH_LINES[stateKey];
      const text = lines && lines.length ? lines[Math.floor(Math.random() * lines.length)] : null;
      if (options.onSpeech) options.onSpeech(text);
    }

    async function playState(stateKey, { speak = true, isUserTriggered = false } = {}) {
      if (destroyed) return;
      const variant = pickVariant(stateKey);
      const video = await loadVideo(variant);
      if (destroyed) return;

      // pause whatever was playing before (saves decode cost — only the
      // active clip should ever be decoding)
      if (currentName && videoEls[currentName] && currentName !== variant) {
        videoEls[currentName].pause();
      }

      video.currentTime = 0;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});

      currentName = variant;
      currentState = stateKey;
      emitState(stateKey);
      if (speak) emitSpeech(stateKey);
      else emitSpeech("idle"); // clears any lingering bubble
      if (options.fx && options.onGestureFX) options.onGestureFX(stateKey);

      if (isUserTriggered) lastInteractionAt = performance.now();

      clearTimeout(returnToIdleTimer);
      if (ONE_SHOT_STATES.has(stateKey)) {
        const durMs = (isFinite(video.duration) && video.duration > 0 ? video.duration : 3) * 1000;
        returnToIdleTimer = setTimeout(() => {
          if (currentState === stateKey) playState("idle", { speak: false });
        }, Math.min(durMs, 4200));
      }
    }

    function triggerGesture(stateKey, fromUser = true) {
      if (!GESTURES[stateKey] || destroyed) return;
      playState(stateKey, { speak: true, isUserTriggered: fromUser });
      restartSpontaneousTimer();
    }

    function triggerRandomReaction() {
      const choice = REACTION_STATES[Math.floor(Math.random() * REACTION_STATES.length)];
      triggerGesture(choice, true);
    }

    function restartAmbientTimer() {
      clearTimeout(ambientTimer);
      if (!options.ambient || destroyed || suspended) return;
      const delay = 8000 + Math.random() * 6000;
      ambientTimer = setTimeout(() => {
        if (currentState === "idle" && !suspended) playState("idle", { speak: false });
        restartAmbientTimer();
      }, delay);
    }

    function restartSpontaneousTimer() {
      clearTimeout(spontaneousTimer);
      if (!options.spontaneous || destroyed) return;
      spontaneousTimer = setTimeout(() => {
        if (!suspended) {
          const quietFor = performance.now() - lastInteractionAt;
          if (quietFor > 20000 && currentState === "idle") {
            const choice = Math.random() < 0.5 ? "wave" : "groove";
            playState(choice, { speak: true });
            clearTimeout(returnToIdleTimer);
            returnToIdleTimer = setTimeout(() => playState("idle", { speak: false }), 4200);
          }
        }
        restartSpontaneousTimer();
      }, 4000);
    }

    // ---- render loop ----
    // Uses requestVideoFrameCallback when available so we only do GL work
    // when the video actually has a new decoded frame (~24fps), instead of
    // redrawing on every display vsync (60-144fps) for no visual benefit.
    let rafHandle = null;
    let vfcHandle = null;

    function uploadAndDraw(video) {
      resizeCanvasToDisplaySize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1i(uTexLoc, 0);
      gl.uniform1f(uLoLoc, keyLo);
      gl.uniform1f(uHiLoc, keyHi);
      gl.uniform1f(uSpillLoc, keySpill);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function scheduleNextFrame() {
      if (destroyed || suspended) return;
      const video = videoEls[currentName];
      if (!video) {
        rafHandle = requestAnimationFrame(scheduleNextFrame);
        return;
      }
      if (typeof video.requestVideoFrameCallback === "function") {
        vfcHandle = video.requestVideoFrameCallback(() => {
          try {
            if (video.readyState >= 2) uploadAndDraw(video);
          } catch (err) {
            console.error("[mascot] render error:", err);
          }
          scheduleNextFrame();
        });
      } else {
        // Fallback for browsers without requestVideoFrameCallback (older
        // Safari/Firefox): throttle to ~24fps manually rather than every vsync.
        rafHandle = requestAnimationFrame(() => {
          try {
            if (video.readyState >= 2) uploadAndDraw(video);
          } catch (err) {
            console.error("[mascot] render error:", err);
          }
          setTimeout(scheduleNextFrame, 1000 / 24);
        });
      }
    }

    function startRenderLoop() {
      if (suspended || destroyed) return;
      scheduleNextFrame();
    }

    function stopRenderLoop() {
      if (rafHandle) cancelAnimationFrame(rafHandle);
      if (vfcHandle && videoEls[currentName] && videoEls[currentName].cancelVideoFrameCallback) {
        videoEls[currentName].cancelVideoFrameCallback(vfcHandle);
      }
      rafHandle = null;
      vfcHandle = null;
    }

    // ---- visibility / off-screen suspension ----
    // Fully stop decode + render work when the widget isn't visible, so a
    // mascot scrolled out of view or in a backgrounded tab costs nothing.
    function suspend() {
      if (suspended) return;
      suspended = true;
      stopRenderLoop();
      Object.values(videoEls).forEach((v) => v.pause());
      clearTimeout(ambientTimer);
      clearTimeout(spontaneousTimer);
    }
    function resume() {
      if (!suspended || destroyed) return;
      suspended = false;
      const video = videoEls[currentName];
      if (video) { const p = video.play(); if (p && p.catch) p.catch(() => {}); }
      startRenderLoop();
      restartAmbientTimer();
      restartSpontaneousTimer();
    }

    let intersectionObs = null;
    if ("IntersectionObserver" in global) {
      intersectionObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) resume();
          else suspend();
        });
      }, { threshold: 0.05 });
      intersectionObs.observe(container);
    }

    function onVisibilityChange() {
      if (document.hidden) suspend();
      else if (intersectionObs) {
        // re-check actual on-screen-ness rather than blindly resuming
        const rect = container.getBoundingClientRect();
        const onScreen = rect.bottom > 0 && rect.top < global.innerHeight;
        if (onScreen) resume();
      } else {
        resume();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    let resizeObs = null;
    if ("ResizeObserver" in global) {
      resizeObs = new ResizeObserver(() => resizeCanvasToDisplaySize());
      resizeObs.observe(container);
    } else {
      global.addEventListener("resize", resizeCanvasToDisplaySize);
    }

    // ---- public API ----
    function setKeyThresholds(lo, hi) {
      keyLo = lo;
      keyHi = hi;
    }

    function destroy() {
      destroyed = true;
      stopRenderLoop();
      clearTimeout(ambientTimer);
      clearTimeout(spontaneousTimer);
      clearTimeout(returnToIdleTimer);
      if (intersectionObs) intersectionObs.disconnect();
      if (resizeObs) resizeObs.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      Object.values(videoEls).forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
      });
      container.innerHTML = "";
    }

    // ---- boot ----
    resizeCanvasToDisplaySize();
    let bootPromise = Promise.resolve();
    if (options.autoIdle) {
      bootPromise = (async () => {
        currentName = pickVariant("idle");
        const v = await loadVideo(currentName);
        if (destroyed) return;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
        currentState = "idle";
        emitState("idle");
        startRenderLoop();
        restartAmbientTimer();
        restartSpontaneousTimer();

        // Prefetch the *other* idle variant and the point gesture (common
        // hover target) shortly after first paint — low priority, doesn't
        // block anything the user is looking at.
        setTimeout(() => {
          if (destroyed) return;
          const otherIdle = GESTURES.idle.variants.find((n) => n !== currentName);
          if (otherIdle) loadVideo(otherIdle);
          loadVideo(pickVariant("point"));
        }, 1500);
      })();
    }

    return {
      ready: bootPromise,
      trigger: triggerGesture,
      triggerRandom: triggerRandomReaction,
      goIdle: () => playState("idle", { speak: false }),
      setKeyThresholds,
      states: Object.keys(GESTURES),
      destroy,
      // exposed for advanced/debug use
      _internal: { videoEls, getCurrentState: () => currentState },
    };
  }

  global.MascotEngine = { createMascot, GESTURES };
})(window);
