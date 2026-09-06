/* =========================================================================
   PRIYANSHU AVATAR ENGINE v4 - exact-reference 3D relief mascot
   -------------------------------------------------------------------------
   The previous procedural humanoid approximated Priyanshu with primitives.
   This engine instead uses the supplied Priyanshu artwork itself as the front
   surface of a shallow, extruded 3D mesh. Each interaction state has its own
   real silhouette mesh, so the face, hair, glasses, jacket, proportions and
   poses stay faithful to the source artwork while still reacting in realtime.

   Public API remains compatible with src/mascot/mascot.js and ElevenLabs:
     createMascot(container, options)
     .trigger(state)
     .goIdle()
     .preload()
     .supports(state)
     .setSpeaking(bool)
     .setListening(bool)
     .setAudioLevel(0..1)
     .setInputLevel(0..1)
     .destroy()
   ========================================================================= */
(function (global) {
  "use strict";

  const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
  const ATLAS_URL = "/assets/avatar/priyanshu-pose-atlas.webp";
  const META_URL = "/assets/avatar/priyanshu-pose-meta.json";
  const FALLBACK_URL = "/assets/avatar/reference/front.jpg";
  const GLTF_URL = "/assets/avatar/priyanshu-avatar.gltf";

  const STATES = ["idle", "wave", "point", "sit", "think", "listen", "talk", "groove", "walk"];
  const STATE_POSE = {
    idle: "idle",
    wave: "wave",
    point: "point",
    sit: "sit",
    think: "think",
    listen: "listen",
    talk: "talk",
    groove: "point_down",
    walk: "walk",
  };

  const CELL_W = 2.56;
  const CELL_H = 3.84;
  const DEPTH = 0.115;
  const FADE_SECONDS = 0.15;
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
      width: "100%",
      height: "100%",
      display: "block",
      objectFit: "contain",
      objectPosition: "center bottom",
      filter: "drop-shadow(0 10px 14px rgba(0,0,0,.28))",
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
      state: "idle",
      pose: "idle",
      previousPose: null,
      fade: 1,
      speaking: false,
      listening: false,
      outputLevel: 0,
      inputLevel: 0,
      pointerX: 0,
      pointerY: 0,
      pointerTargetX: 0,
      pointerTargetY: 0,
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
      renderer.setPixelRatio(lowPower ? 1 : Math.min(global.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.shadowMap.enabled = false;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
      camera.position.set(0, 0.02, 9.15);
      camera.lookAt(0, -0.03, 0);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0b0d, 1.65));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(4, 5, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9fc7ff, 0.65);
      rim.position.set(-4, 3, -2);
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
        atlas.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      } catch (error) {
        console.error("[avatar3d] avatar atlas failed", error);
        renderer.dispose();
        renderer.domElement.remove();
        cleanupFallback = makeFallback(container);
        return;
      }
      if (destroyed) return;

      // The glTF is a portable canonical mesh asset for external tools/export.
      // Runtime poses use equivalent silhouette extrusion generated from metadata
      // so all nine states can stay resident and switch instantly.
      fetch(GLTF_URL, { method: "HEAD", cache: "force-cache" }).catch(() => {});

      const poses = {};
      const disposableGeometries = [];
      const disposableMaterials = [];
      const disposableTextures = [];

      function poseTexture(data) {
        const tex = atlas.clone();
        tex.needsUpdate = true;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(1 / 3, 1 / 3);
        tex.offset.set(data.cell[0] / 3, 1 - (data.cell[1] + 1) / 3);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = atlas.anisotropy;
        disposableTextures.push(tex);
        return tex;
      }

      function makePose(name, data) {
        const group = new THREE.Group();
        group.name = `Priyanshu_${name}`;
        group.visible = false;

        const shape = new THREE.Shape();
        data.contour.forEach(([u, v], index) => {
          const x = (u - 0.5) * CELL_W;
          const y = (0.5 - v) * CELL_H;
          if (index === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        });
        shape.closePath();

        const shellGeo = new THREE.ExtrudeGeometry(shape, {
          depth: DEPTH,
          bevelEnabled: true,
          bevelThickness: 0.018,
          bevelSize: 0.012,
          bevelSegments: 1,
          curveSegments: 1,
          steps: 1,
        });
        shellGeo.translate(0, 0, -DEPTH / 2);
        shellGeo.computeVertexNormals();
        disposableGeometries.push(shellGeo);

        const shellMat = new THREE.MeshStandardMaterial({
          color: 0x17191d,
          roughness: 0.72,
          metalness: 0.02,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: true,
        });
        disposableMaterials.push(shellMat);
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.renderOrder = 0;
        group.add(shell);

        const faceGeo = new THREE.PlaneGeometry(CELL_W, CELL_H);
        disposableGeometries.push(faceGeo);
        const faceMat = new THREE.MeshBasicMaterial({
          map: poseTexture(data),
          transparent: true,
          alphaTest: 0.025,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: true,
          depthTest: true,
          toneMapped: false,
        });
        disposableMaterials.push(faceMat);
        const face = new THREE.Mesh(faceGeo, faceMat);
        face.position.z = DEPTH / 2 + 0.008;
        face.renderOrder = 2;
        group.add(face);

        const backMat = new THREE.MeshBasicMaterial({
          map: faceMat.map,
          transparent: true,
          alphaTest: 0.04,
          opacity: 0,
          side: THREE.BackSide,
          color: 0x66686d,
          depthWrite: true,
          toneMapped: false,
        });
        disposableMaterials.push(backMat);
        const back = new THREE.Mesh(faceGeo, backMat);
        back.position.z = -DEPTH / 2 - 0.006;
        back.rotation.y = Math.PI;
        back.renderOrder = 1;
        group.add(back);

        group.userData.materials = [shellMat, faceMat, backMat];
        root.add(group);
        poses[name] = group;
      }

      Object.entries(meta).forEach(([name, data]) => makePose(name, data));

      function setOpacity(group, value) {
        if (!group) return;
        const opacity = clamp(value, 0, 1);
        group.visible = opacity > 0.002;
        group.userData.materials.forEach((material) => { material.opacity = opacity; });
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

        const maxYaw = runtime.state === "sit" ? 0.045 : 0.075;
        const targetYaw = runtime.pointerX * maxYaw;
        const targetPitch = -runtime.pointerY * 0.022;
        root.rotation.y += (targetYaw - root.rotation.y) * damp(6, dt);
        root.rotation.x += (targetPitch - root.rotation.x) * damp(6, dt);

        let bob = Math.sin(seconds * 1.45) * 0.006;
        let sway = Math.sin(seconds * 0.85) * 0.004;
        let scaleX = 1;
        let scaleY = 1;

        if (!reduced) {
          if (runtime.state === "walk") {
            bob += Math.abs(Math.sin(seconds * 7.0)) * 0.035;
            sway += Math.sin(seconds * 7.0) * 0.018;
          } else if (runtime.state === "wave") {
            sway += Math.sin(seconds * 4.0) * 0.012;
          } else if (runtime.state === "think") {
            sway += Math.sin(seconds * 1.2) * 0.012;
          } else if (runtime.state === "listen") {
            bob += runtime.inputLevel * 0.012;
            sway -= 0.008;
          } else if (runtime.state === "talk" || runtime.speaking) {
            const level = clamp(runtime.outputLevel, 0, 1);
            bob += level * 0.022 + Math.sin(seconds * 5.2) * 0.006;
            scaleX += level * 0.006;
            scaleY += level * 0.012;
          } else if (runtime.state === "groove") {
            bob += Math.abs(Math.sin(seconds * 4.2)) * 0.026;
            sway += Math.sin(seconds * 3.2) * 0.02;
          }
        }

        root.position.y += (bob - root.position.y) * damp(8, dt);
        root.rotation.z += (sway - root.rotation.z) * damp(7, dt);
        root.scale.x += (scaleX - root.scale.x) * damp(9, dt);
        root.scale.y += (scaleY - root.scale.y) * damp(9, dt);

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
      };
      api.setListening = (value) => {
        runtime.listening = !!value;
        if (runtime.listening && !runtime.speaking) trigger("listen");
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
        disposableTextures.forEach((texture) => texture.dispose());
        atlas.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        if (global.PriyanshuAvatar3D === api) delete global.PriyanshuAvatar3D;
      };

      global.PriyanshuAvatar3D = api;
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
      destroy: () => {
        destroyed = true;
        if (cleanupFallback) cleanupFallback();
      },
      states: STATES.slice(),
    };

    return api;
  }

  global.MascotEngine = {
    createMascot,
    GESTURES: Object.fromEntries(STATES.map((state) => [state, { label: state }])),
  };
})(window);
