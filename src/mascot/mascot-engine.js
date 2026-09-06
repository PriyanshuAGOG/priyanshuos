/* =========================================================================
   PRIYANSHU AVATAR ENGINE v3 — lightweight procedural 3D
   -------------------------------------------------------------------------
   Replaces the old chroma-key video pipeline with a true realtime WebGL avatar.
   No video decoding, no per-frame video texture uploads, no animation assets.

   Public API stays compatible with the existing Priyanshu OS choreography:
     createMascot(container, options)
     .trigger(state)
     .goIdle()
     .preload()                 // no-op compatibility
     .supports(state)
     .setSpeaking(bool)
     .setListening(bool)
     .setAudioLevel(0..1)
     .setInputLevel(0..1)
     .destroy()

   The character is intentionally stylised to match the supplied references:
   black swept hair, glasses, white shirt, charcoal jacket, black trousers,
   white sneakers and warm medium-brown skin.
   ========================================================================= */

(function (global) {
  "use strict";

  const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
  const STATES = ["idle", "wave", "point", "sit", "think", "listen", "talk", "groove", "walk"];
  let threePromise = null;

  function loadThree() {
    if (!threePromise) threePromise = import(/* @vite-ignore */ THREE_URL);
    return threePromise;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (lambda, dt) => 1 - Math.exp(-lambda * dt);

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function lowPowerDevice() {
    const mem = Number(navigator.deviceMemory || 8);
    const cores = Number(navigator.hardwareConcurrency || 8);
    return mem <= 4 || cores <= 4;
  }

  function fallbackCharacter(container) {
    const el = document.createElement("div");
    el.className = "m-3d-fallback";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="m-3d-fallback-head"><span></span></div><div class="m-3d-fallback-body"></div>';
    container.appendChild(el);
    return () => el.remove();
  }

  function createMascot(container, opts = {}) {
    const options = Object.assign({
      autoIdle: true,
      onStateChange: null,
      onSpeech: null,
    }, opts);

    let destroyed = false;
    let cleanupFallback = null;
    let api = null;

    const ready = (async () => {
      let THREE;
      try {
        THREE = await loadThree();
      } catch (error) {
        console.error("[avatar3d] Three.js failed to load", error);
        cleanupFallback = fallbackCharacter(container);
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
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = false;
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
      camera.position.set(0, 0.05, 15.8);
      camera.lookAt(0, -0.05, 0);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x17191d, 2.2);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, 2.35);
      key.position.set(4, 7, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xb8d8ff, 1.05);
      rim.position.set(-5, 4, -2);
      scene.add(rim);

      const palette = {
        skin: 0xb96f43,
        skinLight: 0xc98255,
        hair: 0x090a0d,
        jacket: 0x25272b,
        jacket2: 0x34373c,
        shirt: 0xf2f2ef,
        pants: 0x17191d,
        shoe: 0xf5f6f7,
        sole: 0xcfd2d5,
        dark: 0x111317,
        eye: 0x17110d,
        blue: 0x28a7ff,
      };

      const mat = {};
      const material = (name, color, roughness = 0.72, metalness = 0.0) => {
        mat[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness });
        return mat[name];
      };
      material("skin", palette.skin, 0.8);
      material("skinLight", palette.skinLight, 0.8);
      material("hair", palette.hair, 0.58);
      material("jacket", palette.jacket, 0.72);
      material("jacket2", palette.jacket2, 0.7);
      material("shirt", palette.shirt, 0.82);
      material("pants", palette.pants, 0.78);
      material("shoe", palette.shoe, 0.65);
      material("sole", palette.sole, 0.75);
      material("dark", palette.dark, 0.55);
      material("eyeWhite", 0xf8f4ee, 0.6);
      material("eye", palette.eye, 0.5);
      material("blue", palette.blue, 0.52, 0.05);

      const rig = {};
      const avatar = new THREE.Group();
      avatar.position.y = -0.25;
      scene.add(avatar);
      rig.avatar = avatar;

      const geo = {
        sphere16: new THREE.SphereGeometry(1, 16, 12),
        sphere20: new THREE.SphereGeometry(1, 20, 14),
        box: new THREE.BoxGeometry(1, 1, 1),
        cyl12: new THREE.CylinderGeometry(1, 1, 1, 12),
        torus12: new THREE.TorusGeometry(1, 0.09, 6, 18),
      };

      const mesh = (geometry, materialRef, scale, position, parent = avatar) => {
        const m = new THREE.Mesh(geometry, materialRef);
        if (scale) m.scale.set(scale[0], scale[1], scale[2]);
        if (position) m.position.set(position[0], position[1], position[2]);
        parent.add(m);
        return m;
      };

      const group = (position, parent = avatar) => {
        const g = new THREE.Group();
        if (position) g.position.set(position[0], position[1], position[2]);
        parent.add(g);
        return g;
      };

      function limb(parent, length, radius, materialRef, childY = -0.5) {
        return mesh(geo.sphere16, materialRef, [radius, length * 0.5, radius], [0, childY * length, 0], parent);
      }

      rig.body = group([0, 0.35, 0]);
      mesh(geo.sphere20, mat.pants, [0.82, 0.45, 0.48], [0, -0.85, 0], rig.body);
      mesh(geo.sphere20, mat.jacket, [1.12, 1.32, 0.55], [0, 0.20, 0], rig.body);
      mesh(geo.box, mat.shirt, [0.52, 1.45, 0.10], [0, 0.22, 0.53], rig.body);
      mesh(geo.box, mat.jacket2, [0.34, 1.25, 0.09], [-0.60, 0.16, 0.55], rig.body).rotation.z = -0.08;
      mesh(geo.box, mat.jacket2, [0.34, 1.25, 0.09], [0.60, 0.16, 0.55], rig.body).rotation.z = 0.08;
      const zipper = mesh(geo.box, mat.dark, [0.035, 1.20, 0.035], [0, 0.1, 0.68], rig.body);
      zipper.rotation.z = 0.015;
      mesh(geo.box, mat.blue, [0.045, 0.32, 0.035], [0.56, 0.30, 0.69], rig.body);

      mesh(geo.cyl12, mat.skin, [0.30, 0.38, 0.30], [0, 1.64, 0], rig.body);
      rig.head = group([0, 2.28, 0], rig.body);
      const headMesh = mesh(geo.sphere20, mat.skin, [0.88, 1.02, 0.82], [0, 0, 0], rig.head);
      headMesh.rotation.x = -0.02;
      mesh(geo.sphere16, mat.skin, [0.16, 0.29, 0.14], [-0.88, -0.03, 0], rig.head);
      mesh(geo.sphere16, mat.skin, [0.16, 0.29, 0.14], [0.88, -0.03, 0], rig.head);

      const hairClusters = [
        [-0.55, 0.82, -0.06, 0.52, 0.34, 0.50, -0.20],
        [-0.12, 0.94, -0.08, 0.62, 0.38, 0.53, -0.08],
        [ 0.34, 0.91, -0.10, 0.58, 0.36, 0.51,  0.12],
        [ 0.63, 0.68, -0.14, 0.40, 0.39, 0.43,  0.22],
        [-0.72, 0.55, -0.18, 0.34, 0.45, 0.39, -0.18],
        [ 0.10, 0.70,  0.12, 0.58, 0.27, 0.30,  0.06],
      ];
      hairClusters.forEach(([x,y,z,sx,sy,sz,rz]) => {
        const h = mesh(geo.sphere16, mat.hair, [sx,sy,sz], [x,y,z], rig.head);
        h.rotation.z = rz;
      });

      rig.leftEye = group([-0.35, 0.14, 0.74], rig.head);
      rig.rightEye = group([0.35, 0.14, 0.74], rig.head);
      [rig.leftEye, rig.rightEye].forEach((eye) => {
        mesh(geo.sphere16, mat.eyeWhite, [0.20, 0.13, 0.07], [0,0,0], eye);
        const pupil = mesh(geo.sphere16, mat.eye, [0.075, 0.075, 0.045], [0, -0.005, 0.066], eye);
        eye.userData.pupil = pupil;
      });

      const lb = mesh(geo.box, mat.hair, [0.26, 0.045, 0.04], [-0.35, 0.38, 0.80], rig.head);
      const rb = mesh(geo.box, mat.hair, [0.26, 0.045, 0.04], [ 0.35, 0.38, 0.80], rig.head);
      lb.rotation.z = 0.05; rb.rotation.z = -0.05;
      rig.leftBrow = lb; rig.rightBrow = rb;

      const nose = mesh(geo.sphere16, mat.skinLight, [0.10, 0.18, 0.12], [0, -0.08, 0.82], rig.head);
      nose.rotation.x = 0.15;

      function glassesFrame(x) {
        const frame = group([x, 0.13, 0.88], rig.head);
        mesh(geo.box, mat.dark, [0.28,0.025,0.025], [0,0.13,0], frame);
        mesh(geo.box, mat.dark, [0.28,0.025,0.025], [0,-0.13,0], frame);
        mesh(geo.box, mat.dark, [0.025,0.15,0.025], [-0.28,0,0], frame);
        mesh(geo.box, mat.dark, [0.025,0.15,0.025], [0.28,0,0], frame);
        return frame;
      }
      glassesFrame(-0.35); glassesFrame(0.35);
      mesh(geo.box, mat.dark, [0.08,0.025,0.025], [0,0.13,0.88], rig.head);
      mesh(geo.box, mat.dark, [0.32,0.024,0.024], [-0.79,0.17,0.70], rig.head).rotation.y = -0.55;
      mesh(geo.box, mat.dark, [0.32,0.024,0.024], [ 0.79,0.17,0.70], rig.head).rotation.y = 0.55;

      rig.mouth = mesh(geo.box, mat.dark, [0.28, 0.035, 0.035], [0, -0.40, 0.81], rig.head);
      rig.mouth.rotation.x = -0.08;

      function makeArm(side) {
        const s = side === "left" ? -1 : 1;
        const shoulder = group([s * 1.08, 0.93, 0], rig.body);
        limb(shoulder, 1.34, 0.30, mat.jacket2);
        const elbow = group([0, -1.26, 0], shoulder);
        limb(elbow, 1.18, 0.27, mat.jacket2);
        const hand = mesh(geo.sphere16, mat.skin, [0.29,0.37,0.22], [0,-1.16,0], elbow);
        hand.rotation.x = 0.08;
        return { shoulder, elbow, hand };
      }
      const leftArm = makeArm("left");
      const rightArm = makeArm("right");
      rig.leftShoulder = leftArm.shoulder; rig.leftElbow = leftArm.elbow; rig.leftHand = leftArm.hand;
      rig.rightShoulder = rightArm.shoulder; rig.rightElbow = rightArm.elbow; rig.rightHand = rightArm.hand;
      mesh(geo.box, mat.dark, [0.34,0.10,0.27], [0,-0.92,0], rig.leftElbow);

      function makeLeg(side) {
        const s = side === "left" ? -1 : 1;
        const hip = group([s * 0.48, -0.48, 0], rig.body);
        limb(hip, 1.62, 0.38, mat.pants);
        const knee = group([0, -1.54, 0], hip);
        limb(knee, 1.46, 0.34, mat.pants);
        const ankle = group([0, -1.40, 0], knee);
        const shoe = mesh(geo.box, mat.shoe, [0.48,0.25,0.76], [0,-0.16,0.28], ankle);
        shoe.rotation.x = 0.04;
        mesh(geo.box, mat.sole, [0.50,0.07,0.80], [0,-0.42,0.28], ankle);
        mesh(geo.box, mat.blue, [0.14,0.08,0.10], [s * 0.22,-0.25,-0.40], ankle);
        return { hip, knee, ankle };
      }
      const leftLeg = makeLeg("left");
      const rightLeg = makeLeg("right");
      rig.leftHip = leftLeg.hip; rig.leftKnee = leftLeg.knee; rig.leftAnkle = leftLeg.ankle;
      rig.rightHip = rightLeg.hip; rig.rightKnee = rightLeg.knee; rig.rightAnkle = rightLeg.ankle;
      avatar.scale.setScalar(0.92);

      const neutral = {
        bodyX: 0, bodyZ: 0, bodyY: 0.35,
        headX: 0, headY: 0, headZ: 0,
        lsX: 0.05, lsY: 0, lsZ: -0.10, leX: 0.06, leZ: -0.03,
        rsX: 0.05, rsY: 0, rsZ:  0.10, reX: 0.06, reZ:  0.03,
        lhX: 0, lkX: 0, laX: 0,
        rhX: 0, rkX: 0, raX: 0,
      };

      let currentState = "idle";
      let stateStarted = performance.now() / 1000;
      let speaking = false;
      let listening = false;
      let audioLevel = 0;
      let inputLevel = 0;
      let displayedAudio = 0;
      let lastFrame = performance.now();
      let lastDraw = 0;
      let raf = 0;
      let visible = !document.hidden;
      let oneShotTimer = 0;
      let blinkUntil = 0;
      let nextBlink = 2 + Math.random() * 3;
      const mouse = { x: 0, y: 0 };
      let pointerActive = false;

      function setState(state) {
        if (!STATES.includes(state) || destroyed) return;
        if (state === currentState && state !== "talk" && state !== "walk") return;
        currentState = state;
        stateStarted = performance.now() / 1000;
        if (options.onStateChange) options.onStateChange(state);
        clearTimeout(oneShotTimer);
        if (state === "wave" || state === "point") {
          oneShotTimer = setTimeout(() => {
            if (currentState === state) setState("idle");
          }, state === "wave" ? 2700 : 2400);
        }
      }

      function targetPose(state, t) {
        const p = { ...neutral };
        const beat = Math.sin(t * 2.0);
        const fast = Math.sin(t * 7.2);
        switch (state) {
          case "wave":
            p.rsZ = -2.65; p.rsX = -0.05; p.reZ = -0.35 + Math.sin(t * 7.5) * 0.35; p.reX = -0.25; p.headZ = -0.08;
            break;
          case "point":
            p.rsZ = -1.46; p.rsY = -0.22; p.reZ = -0.10; p.reX = -0.10; p.bodyZ = -0.035; p.headY = -0.13;
            break;
          case "sit":
            p.bodyY = -0.55; p.bodyX = -0.03; p.lhX = -1.34; p.rhX = -1.34; p.lkX = 1.58; p.rkX = 1.58;
            p.laX = -0.22; p.raX = -0.22; p.lsZ = -0.30; p.rsZ = 0.30; p.leX = -0.85; p.reX = -0.85;
            break;
          case "think":
            p.rsZ = -0.42; p.rsX = -0.90; p.rsY = -0.18; p.reX = -1.74; p.reZ = 0.30;
            p.lsZ = -0.22; p.lsX = -0.42; p.leX = -1.25; p.leZ = -0.18; p.headZ = -0.12; p.headY = -0.16;
            break;
          case "listen":
            p.headZ = -0.10 + beat * 0.025; p.headY = -0.08; p.lsZ = -0.16; p.rsZ = 0.16; p.bodyZ = beat * 0.01;
            break;
          case "talk": {
            const g = Math.sin(t * 3.4);
            p.lsZ = -0.30 - g * 0.28; p.rsZ = 0.28 + g * 0.24; p.leX = -0.55 + Math.sin(t * 4.1) * 0.25;
            p.reX = -0.45 + Math.cos(t * 3.7) * 0.22; p.headZ = Math.sin(t * 1.8) * 0.035; p.headY = Math.sin(t * 1.15) * 0.04;
            break;
          }
          case "groove":
            p.bodyZ = Math.sin(t * 3.3) * 0.13; p.lsZ = -0.55 + Math.sin(t * 5.0) * 0.45; p.rsZ = 0.55 + Math.sin(t * 5.0 + Math.PI) * 0.45;
            p.lhX = Math.sin(t * 4.0) * 0.18; p.rhX = Math.sin(t * 4.0 + Math.PI) * 0.18;
            break;
          case "walk":
            p.bodyY = 0.35 + Math.abs(fast) * 0.08; p.lhX = fast * 0.70; p.rhX = -fast * 0.70;
            p.lkX = Math.max(0, -fast) * 0.70; p.rkX = Math.max(0, fast) * 0.70; p.lsX = -fast * 0.38; p.rsX = fast * 0.38;
            p.leX = -0.25; p.reX = -0.25; p.bodyZ = Math.sin(t * 7.2) * 0.022;
            break;
          default:
            p.bodyY = 0.35 + Math.sin(t * 1.7) * 0.025; p.headY = Math.sin(t * 0.65) * 0.045; p.headZ = Math.sin(t * 0.85) * 0.025;
            break;
        }
        return p;
      }

      function applyPose(p, dt) {
        const k = damp(11, dt);
        const rot = (obj, x, y, z) => {
          obj.rotation.x = lerp(obj.rotation.x, x, k);
          obj.rotation.y = lerp(obj.rotation.y, y, k);
          obj.rotation.z = lerp(obj.rotation.z, z, k);
        };
        rig.body.position.y = lerp(rig.body.position.y, p.bodyY, k);
        rot(rig.body, p.bodyX, 0, p.bodyZ); rot(rig.head, p.headX, p.headY, p.headZ);
        rot(rig.leftShoulder, p.lsX, p.lsY, p.lsZ); rot(rig.leftElbow, p.leX, 0, p.leZ);
        rot(rig.rightShoulder, p.rsX, p.rsY, p.rsZ); rot(rig.rightElbow, p.reX, 0, p.reZ);
        rot(rig.leftHip, p.lhX, 0, 0); rot(rig.leftKnee, p.lkX, 0, 0); rot(rig.leftAnkle, p.laX, 0, 0);
        rot(rig.rightHip, p.rhX, 0, 0); rot(rig.rightKnee, p.rkX, 0, 0); rot(rig.rightAnkle, p.raX, 0, 0);
      }

      function updateFace(t, dt) {
        displayedAudio = lerp(displayedAudio, speaking ? clamp(audioLevel * 1.6, 0.08, 1) : 0, damp(18, dt));
        const talking = speaking || currentState === "talk";
        const synthetic = talking ? (0.16 + Math.abs(Math.sin(t * 8.7)) * 0.30) : 0;
        const open = clamp(Math.max(displayedAudio, synthetic), 0, 1);
        rig.mouth.scale.y = lerp(rig.mouth.scale.y, 0.72 + open * 4.8, damp(24, dt));
        rig.mouth.scale.x = lerp(rig.mouth.scale.x, 1 - open * 0.18, damp(16, dt));

        if (t > nextBlink) { blinkUntil = t + 0.12; nextBlink = t + 2.2 + Math.random() * 3.8; }
        const blink = t < blinkUntil ? 0.08 : 1;
        rig.leftEye.scale.y = lerp(rig.leftEye.scale.y, blink, damp(35, dt));
        rig.rightEye.scale.y = lerp(rig.rightEye.scale.y, blink, damp(35, dt));

        const attentive = listening ? clamp(inputLevel, 0, 1) : 0;
        rig.leftBrow.rotation.z = 0.05 + attentive * 0.05;
        rig.rightBrow.rotation.z = -0.05 - attentive * 0.05;
      }

      function updateLook(dt) {
        if (!pointerActive || speaking || listening) return;
        const k = damp(5, dt);
        const tx = clamp(mouse.x, -1, 1) * 0.10;
        const ty = clamp(mouse.y, -1, 1) * 0.06;
        rig.head.rotation.y = lerp(rig.head.rotation.y, -tx, k);
        rig.head.rotation.x = lerp(rig.head.rotation.x, ty, k);
        [rig.leftEye, rig.rightEye].forEach((eye) => {
          const pupil = eye.userData.pupil;
          if (pupil) {
            pupil.position.x = lerp(pupil.position.x, tx * 0.55, k);
            pupil.position.y = lerp(pupil.position.y, -ty * 0.45, k);
          }
        });
      }

      function resize() {
        if (destroyed) return;
        const w = Math.max(1, container.clientWidth);
        const h = Math.max(1, container.clientHeight);
        const dprCap = lowPower ? 1.0 : (w < 130 ? 1.25 : 1.5);
        renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, dprCap));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      const resizeObserver = "ResizeObserver" in global ? new ResizeObserver(resize) : null;
      if (resizeObserver) resizeObserver.observe(container); else global.addEventListener("resize", resize);
      resize();

      function onPointerMove(event) {
        const r = container.getBoundingClientRect();
        if (!r.width || !r.height) return;
        mouse.x = ((event.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = ((event.clientY - r.top) / r.height) * 2 - 1;
        pointerActive = true;
      }
      function onPointerLeave() { pointerActive = false; }
      container.addEventListener("pointermove", onPointerMove, { passive: true });
      container.addEventListener("pointerleave", onPointerLeave, { passive: true });

      function onVisibility() {
        visible = !document.hidden;
        if (visible && !raf) { lastFrame = performance.now(); raf = requestAnimationFrame(frame); }
      }
      document.addEventListener("visibilitychange", onVisibility);

      function frame(now) {
        raf = 0;
        if (destroyed || !visible) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
        lastFrame = now;
        const t = now / 1000;
        const active = speaking || listening || currentState === "walk" || currentState === "wave" || currentState === "point" || currentState === "groove";
        const fps = reduced ? 20 : (active ? 45 : 30);
        const minGap = 1000 / fps;
        if (now - lastDraw >= minGap) {
          lastDraw = now;
          const hostWalking = !!container.closest?.(".m-char")?.classList.contains("walking");
          const effectiveState = hostWalking ? "walk" : currentState;
          const p = targetPose(effectiveState, t - stateStarted);
          applyPose(p, dt); updateFace(t, dt); updateLook(dt); renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);

      api._install({
        trigger: (state) => setState(state),
        goIdle: () => setState("idle"),
        supports: (state) => STATES.includes(state),
        preload: () => Promise.resolve(),
        setSpeaking: (v) => {
          speaking = !!v;
          if (speaking && currentState !== "walk") setState("talk");
          else if (!speaking && listening && currentState !== "walk") setState("listen");
        },
        setListening: (v) => {
          listening = !!v;
          if (listening && !speaking && currentState !== "walk") setState("listen");
        },
        setAudioLevel: (v) => { audioLevel = clamp(Number(v) || 0, 0, 1); },
        setInputLevel: (v) => { inputLevel = clamp(Number(v) || 0, 0, 1); },
        destroy: () => {
          destroyed = true; clearTimeout(oneShotTimer); if (raf) cancelAnimationFrame(raf);
          document.removeEventListener("visibilitychange", onVisibility);
          container.removeEventListener("pointermove", onPointerMove); container.removeEventListener("pointerleave", onPointerLeave);
          if (resizeObserver) resizeObserver.disconnect(); else global.removeEventListener("resize", resize);
          renderer.dispose(); Object.values(geo).forEach((g) => g.dispose && g.dispose()); Object.values(mat).forEach((m) => m.dispose && m.dispose());
          if (global.PriyanshuAvatar3D === api) delete global.PriyanshuAvatar3D;
          renderer.domElement.remove();
        },
        states: STATES.slice(),
        _internal: { rig, renderer, scene, getCurrentState: () => currentState },
      });

      global.PriyanshuAvatar3D = api;
      if (options.onStateChange) options.onStateChange(currentState);
    })();

    const pending = [];
    const impl = {};
    api = {
      ready,
      states: STATES.slice(),
      trigger(state) { if (impl.trigger) impl.trigger(state); else pending.push(["trigger", [state]]); },
      goIdle() { if (impl.goIdle) impl.goIdle(); else pending.push(["goIdle", []]); },
      preload() { return Promise.resolve(); },
      supports(state) { return impl.supports ? impl.supports(state) : STATES.includes(state); },
      setSpeaking(v) { if (impl.setSpeaking) impl.setSpeaking(v); else pending.push(["setSpeaking", [v]]); },
      setListening(v) { if (impl.setListening) impl.setListening(v); else pending.push(["setListening", [v]]); },
      setAudioLevel(v) { if (impl.setAudioLevel) impl.setAudioLevel(v); },
      setInputLevel(v) { if (impl.setInputLevel) impl.setInputLevel(v); },
      setKeyThresholds() {},
      destroy() { destroyed = true; if (impl.destroy) impl.destroy(); if (cleanupFallback) cleanupFallback(); },
      _install(next) {
        Object.assign(impl, next); api.states = next.states || api.states; api._internal = next._internal;
        while (pending.length) {
          const [name, args] = pending.shift();
          try { impl[name]?.(...args); } catch (e) { console.warn("[avatar3d] queued call failed", name, e); }
        }
      },
      _internal: null,
    };

    return api;
  }

  global.MascotEngine = { createMascot, GESTURES: Object.fromEntries(STATES.map((s) => [s, { label: s }])) };
})(window);
