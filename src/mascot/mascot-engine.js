/* =========================================================================
   PRIYANSHU AVATAR ENGINE v5 — textured volumetric 3D mascot
   -------------------------------------------------------------------------
   The artwork is mapped directly onto a real bevelled 3D solid. There is no
   black shell in front of the character and no video/chroma-key pipeline.
   Every pose keeps Priyanshu's exact illustrated face/outfit while gaining
   physical thickness, perspective, realtime parallax and voice reactions.

   Compatible API:
     createMascot(container, options)
     .trigger(state) / .goIdle() / .preload() / .supports(state)
     .setSpeaking(bool) / .setListening(bool)
     .setAudioLevel(0..1) / .setInputLevel(0..1) / .destroy()
   ========================================================================= */
(function (global) {
  "use strict";

  const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
  const ATLAS_URL = "/assets/avatar/priyanshu-pose-atlas.webp";
  const META_URL = "/assets/avatar/priyanshu-pose-meta.json";
  const FALLBACK_URL = "/assets/avatar/reference/front.jpg";

  const STATES = ["idle", "wave", "point", "sit", "think", "listen", "talk", "groove", "walk"];
  const STATE_POSE = {
    idle: "idle", wave: "wave", point: "point", sit: "sit", think: "think",
    listen: "listen", talk: "talk", groove: "point_down", walk: "walk",
  };

  const CELL_W = 2.56;
  const CELL_H = 3.84;
  const DEPTH = 0.30;
  const BEVEL = 0.045;
  const FADE_SECONDS = 0.12;
  let threePromise = null;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const damp = (lambda, dt) => 1 - Math.exp(-lambda * dt);

  function loadThree() {
    if (!threePromise) threePromise = import(/* @vite-ignore */ THREE_URL);
    return threePromise;
  }

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function lowPowerDevice() {
    const mem = Number(navigator.deviceMemory || 8);
    const cores = Number(navigator.hardwareConcurrency || 8);
    return mem <= 4 || cores <= 4;
  }

  function makeFallback(container) {
    const img = document.createElement("img");
    img.src = FALLBACK_URL;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    Object.assign(img.style, {
      width: "100%", height: "100%", display: "block", objectFit: "contain",
      objectPosition: "center bottom", filter: "drop-shadow(0 10px 14px rgba(0,0,0,.28))",
    });
    container.appendChild(img);
    return () => img.remove();
  }

  function createMascot(container, opts = {}) {
    const options = Object.assign({ autoIdle: true, onStateChange: null, onSpeech: null }, opts);
    let destroyed = false;
    let cleanupFallback = null;
    let api = null;

    const runtime = {
      state: "idle", pose: "idle", previousPose: null, fade: 1,
      speaking: false, listening: false, outputLevel: 0, inputLevel: 0,
      pointerX: 0, pointerY: 0, pointerTargetX: 0, pointerTargetY: 0,
    };

    const ready = (async () => {
      let THREE;
      try {
        THREE = await loadThree();
      } catch (error) {
        console.error("[avatar3d] Three.js failed to load", error);
        cleanupFallback = makeFallback(container);
        return;
      }
      if (destroyed) return;

      let meta;
      try {
        const response = await fetch(META_URL, { cache: "force-cache" });
        if (!response.ok) throw new Error(`pose metadata ${response.status}`);
        meta = await response.json();
      } catch (error) {
        console.error("[avatar3d] pose metadata failed", error);
        cleanupFallback = makeFallback(container);
        return;
      }
      if (destroyed) return;

      const lowPower = lowPowerDevice();
      const reduced = prefersReducedMotion();
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !lowPower,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(lowPower ? 1 : Math.min(global.devicePixelRatio || 1, 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = false;
      renderer.domElement.setAttribute("aria-hidden", "true");
      Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 30);
      camera.position.set(0, 0.02, 8.75);
      camera.lookAt(0, -0.02, 0);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x16181c, 2.25));
      const key = new THREE.DirectionalLight(0xffffff, 1.45);
      key.position.set(4, 5, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9fc7ff, 0.75);
      rim.position.set(-4, 3, -3);
      scene.add(rim);

      const root = new THREE.Group();
      root.position.y = -0.02;
      scene.add(root);

      let atlas;
      try {
        atlas = await new THREE.TextureLoader().loadAsync(ATLAS_URL);
        atlas.colorSpace = THREE.SRGBColorSpace;
        atlas.minFilter = THREE.LinearMipmapLinearFilter;
        atlas.magFilter = THREE.LinearFilter;
        atlas.generateMipmaps = true;
        atlas.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      } catch (error) {
        console.error("[avatar3d] avatar atlas failed", error);
        renderer.dispose();
        renderer.domElement.remove();
        cleanupFallback = makeFallback(container);
        return;
      }
      if (destroyed) return;

      const poses = {};
      const disposableGeometries = [];
      const disposableMaterials = [];

      function applyProjectedUVs(geometry, cell) {
        const position = geometry.getAttribute("position");
        const uv = new Float32Array(position.count * 2);
        for (let i = 0; i < position.count; i += 1) {
          const x = position.getX(i);
          const y = position.getY(i);
          const localU = clamp(x / CELL_W + 0.5, 0, 1);
          const localV = clamp(0.5 - y / CELL_H, 0, 1);
          uv[i * 2] = (cell[0] + localU) / 3;
          uv[i * 2 + 1] = 1 - (cell[1] + localV) / 3;
        }
        geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      }

      function makePose(name, data) {
        const points = data.contour.map(([u, v]) => new THREE.Vector2(
          (u - 0.5) * CELL_W,
          (0.5 - v) * CELL_H,
        ));

        if (!THREE.ShapeUtils.isClockWise(points)) points.reverse();
        const shape = new THREE.Shape(points);

        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: DEPTH,
          bevelEnabled: true,
          bevelThickness: BEVEL,
          bevelSize: BEVEL * 0.78,
          bevelSegments: lowPower ? 1 : 3,
          curveSegments: 1,
          steps: 1,
        });
        geometry.translate(0, 0, -DEPTH / 2);
        applyProjectedUVs(geometry, data.cell);
        geometry.computeVertexNormals();
        disposableGeometries.push(geometry);

        const capMaterial = new THREE.MeshBasicMaterial({
          map: atlas,
          transparent: true,
          alphaTest: 0.018,
          opacity: 0,
          side: THREE.FrontSide,
          depthWrite: false,
          toneMapped: false,
        });
        const sideMaterial = new THREE.MeshStandardMaterial({
          map: atlas,
          transparent: true,
          alphaTest: 0.012,
          opacity: 0,
          roughness: 0.82,
          metalness: 0.0,
          side: THREE.FrontSide,
          depthWrite: false,
        });
        disposableMaterials.push(capMaterial, sideMaterial);

        const mesh = new THREE.Mesh(geometry, [capMaterial, sideMaterial]);
        mesh.name = `Priyanshu_${name}`;
        mesh.visible = false;
        mesh.renderOrder = 2;
        mesh.userData.materials = [capMaterial, sideMaterial];
        root.add(mesh);
        poses[name] = mesh;
      }

      Object.entries(meta).forEach(([name, data]) => makePose(name, data));

      function setOpacity(mesh, value) {
        if (!mesh) return;
        const opacity = clamp(value, 0, 1);
        mesh.visible = opacity > 0.002;
        mesh.userData.materials.forEach((material) => { material.opacity = opacity; });
      }

      setOpacity(poses.idle, 1);
      runtime.pose = "idle";

      function switchPose(poseName) {
        const next = poses[poseName] ? poseName : "idle";
        if (next === runtime.pose) return;
        runtime.previousPose = runtime.pose;
        runtime.pose = next;
        runtime.fade = 0;
        setOpacity(poses[runtime.previousPose], 1);
        setOpacity(poses[runtime.pose], 0);
      }

      function trigger(state) {
        const nextState = STATES.includes(state) ? state : "idle";
        runtime.state = nextState;
        switchPose(STATE_POSE[nextState] || "idle");
        if (typeof options.onStateChange === "function") options.onStateChange(nextState);
      }

      function resize() {
        if (destroyed) return;
        const rect = container.getBoundingClientRect();
        const width = Math.max(2, Math.round(rect.width));
        const height = Math.max(2, Math.round(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      const resizeObserver = global.ResizeObserver ? new ResizeObserver(resize) : null;
      if (resizeObserver) resizeObserver.observe(container);
      else global.addEventListener("resize", resize, { passive: true });
      resize();

      function onPointerMove(event) {
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        runtime.pointerTargetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        runtime.pointerTargetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      }
      function onPointerLeave() {
        runtime.pointerTargetX = 0;
        runtime.pointerTargetY = 0;
      }
      container.addEventListener("pointermove", onPointerMove, { passive: true });
      container.addEventListener("pointerleave", onPointerLeave, { passive: true });

      let raf = 0;
      let last = performance.now();
      let lastRender = 0;
      function frame(now) {
        if (destroyed) return;
        raf = requestAnimationFrame(frame);
        if (document.hidden) { last = now; return; }

        const active = runtime.state !== "idle" || runtime.speaking || runtime.listening || runtime.fade < 1;
        const fps = reduced ? 20 : (active ? (lowPower ? 30 : 45) : 30);
        if (now - lastRender < 1000 / fps) return;
        lastRender = now;

        const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
        last = now;
        const seconds = now / 1000;

        if (runtime.fade < 1) {
          runtime.fade = Math.min(1, runtime.fade + dt / FADE_SECONDS);
          const t = 1 - Math.pow(1 - runtime.fade, 3);
          setOpacity(poses[runtime.previousPose], 1 - t);
          setOpacity(poses[runtime.pose], t);
          if (runtime.fade >= 1 && runtime.previousPose) {
            setOpacity(poses[runtime.previousPose], 0);
            runtime.previousPose = null;
          }
        }

        runtime.pointerX += (runtime.pointerTargetX - runtime.pointerX) * damp(7, dt);
        runtime.pointerY += (runtime.pointerTargetY - runtime.pointerY) * damp(7, dt);

        const maxYaw = runtime.state === "sit" ? 0.08 : 0.145;
        const targetYaw = runtime.pointerX * maxYaw;
        const targetPitch = -runtime.pointerY * 0.035;
        root.rotation.y += (targetYaw - root.rotation.y) * damp(6, dt);
        root.rotation.x += (targetPitch - root.rotation.x) * damp(6, dt);

        let bob = Math.sin(seconds * 1.4) * 0.006;
        let sway = Math.sin(seconds * 0.85) * 0.004;
        let sx = 1;
        let sy = 1;

        if (!reduced) {
          if (runtime.state === "walk") {
            bob += Math.abs(Math.sin(seconds * 7.2)) * 0.038;
            sway += Math.sin(seconds * 7.2) * 0.018;
          } else if (runtime.state === "wave") {
            sway += Math.sin(seconds * 3.6) * 0.012;
          } else if (runtime.state === "think") {
            sway -= 0.008 + Math.sin(seconds * 1.1) * 0.006;
          } else if (runtime.state === "listen") {
            bob += runtime.inputLevel * 0.014;
            root.rotation.y += (0.035 - root.rotation.y) * damp(4, dt);
          } else if (runtime.state === "talk" || runtime.speaking) {
            const level = clamp(runtime.outputLevel, 0, 1);
            bob += level * 0.024 + Math.sin(seconds * 5.0) * 0.005;
            sway += Math.sin(seconds * 2.8) * (0.004 + level * 0.006);
            sx += level * 0.004;
            sy += level * 0.010;
          } else if (runtime.state === "groove") {
            bob += Math.abs(Math.sin(seconds * 4.2)) * 0.025;
            sway += Math.sin(seconds * 3.2) * 0.02;
          }
        }

        root.position.y += (bob - root.position.y) * damp(8, dt);
        root.rotation.z += (sway - root.rotation.z) * damp(7, dt);
        root.scale.x += (sx - root.scale.x) * damp(9, dt);
        root.scale.y += (sy - root.scale.y) * damp(9, dt);

        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(frame);

      api._runtime = { renderer, scene, camera, root, poses, atlas };
      api.trigger = trigger;
      api.goIdle = () => trigger("idle");
      api.supports = (state) => STATES.includes(state);
      api.setSpeaking = (value) => {
        runtime.speaking = !!value;
        if (runtime.speaking) trigger("talk");
        else if (runtime.listening) trigger("listen");
        else trigger("idle");
      };
      api.setListening = (value) => {
        runtime.listening = !!value;
        if (runtime.listening && !runtime.speaking) trigger("listen");
        else if (!runtime.listening && !runtime.speaking && runtime.state === "listen") trigger("idle");
      };
      api.setAudioLevel = (value) => { runtime.outputLevel = clamp(Number(value) || 0, 0, 1); };
      api.setInputLevel = (value) => { runtime.inputLevel = clamp(Number(value) || 0, 0, 1); };
      api.destroy = () => {
        if (destroyed) return;
        destroyed = true;
        cancelAnimationFrame(raf);
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerleave", onPointerLeave);
        if (resizeObserver) resizeObserver.disconnect();
        else global.removeEventListener("resize", resize);
        disposableGeometries.forEach((geometry) => geometry.dispose());
        disposableMaterials.forEach((material) => material.dispose());
        atlas.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        if (global.PriyanshuAvatar3D === api) delete global.PriyanshuAvatar3D;
      };

      global.PriyanshuAvatar3D = api;
      if (runtime.state !== "idle") trigger(runtime.state);
    })().catch((error) => {
      console.error("[avatar3d] initialization failed", error);
      if (!destroyed && !cleanupFallback) cleanupFallback = makeFallback(container);
    });

    api = {
      ready,
      trigger: (state) => { runtime.state = STATES.includes(state) ? state : "idle"; },
      goIdle: () => { runtime.state = "idle"; },
      preload: () => Promise.resolve(),
      supports: (state) => STATES.includes(state),
      setSpeaking: (value) => { runtime.speaking = !!value; },
      setListening: (value) => { runtime.listening = !!value; },
      setAudioLevel: (value) => { runtime.outputLevel = clamp(Number(value) || 0, 0, 1); },
      setInputLevel: (value) => { runtime.inputLevel = clamp(Number(value) || 0, 0, 1); },
      destroy: () => { destroyed = true; if (cleanupFallback) cleanupFallback(); },
      states: STATES.slice(),
    };

    return api;
  }

  global.MascotEngine = {
    createMascot,
    GESTURES: Object.fromEntries(STATES.map((state) => [state, { label: state }])),
  };
})(window);
