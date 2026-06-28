/* ============================================================================
   MASCOT — "Priyanshu, live" — free-roaming companion + realtime voice
   ----------------------------------------------------------------------------
   This is Priyanshu's personal portfolio, so the mascot IS Priyanshu: it
   speaks in the first person and the visitor is effectively talking to him.

   SYSTEM
   • Engine: WebGL2 chroma-key video mascot (mascot-engine.js), one pinned +
     lazily warmed clip per gesture → smooth switches without startup spikes.
   • Locomotion: time-based velocity (px/s) tuned to the walk clip's stride
     cadence, with ease-in/out. Frame-rate independent. Sleeps when at rest.
   • Choreographer: a per-section script. As you scroll, the mascot walks to a
     real component in the active section and acts on it (sits on a card,
     points at a button, thinks over a bug…), riding it as you scroll.
   • Voice: tap the mascot to grant the mic, then it listens for
     "hi/hello Priyanshu" and holds a realtime, first-person conversation.
     Native path is zero-delay; sttEndpoint/brainEndpoint/ttsEndpoint hooks
     allow a premium swap later.
   ========================================================================== */
(function () {
  "use strict";

  const CFG = Object.assign(
    {
      lang: "en-US", voiceName: null, rate: 1.05, pitch: 1.0,
      sttEndpoint: null, brainEndpoint: null, ttsEndpoint: null,
      wakeWords: ["priyanshu", "preyanshu", "priyansh", "hey priyanshu", "hi priyanshu", "hello priyanshu", "hey mascot"],
      sleepAfterMs: 30000,
      restAfterMs: 2800,            // user-silence in a live call before we rest the agent
      showConnectionStatus: false,  // hide "connecting/disconnected" plumbing text; just be seamless
      walkCadence: 1.25,  // px/s per px of character height — close to the clip's
                          // stride cadence, nudged slightly for screen responsiveness
      sceneDwellMs: 650,  // how long the reader must settle before a scene fires
      elevenLabsAgentId: "agent_1401kw6hdp9gfnssm486zamz7f9d",
    },
    window.MASCOT_CONFIG || {}
  );

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // word-boundary keyword test so "you" doesn't match "your", "ai" not "again"
  const hasKw = (words, n, kw) => (kw.includes(" ") ? n.includes(kw) : words.has(kw));

  // ---------------------------------------------------------------- DOM (minimal)
  const root = el("div"); root.id = "mascot-root"; root.setAttribute("aria-live", "polite");
  const charEl = el("div", "m-char");
  charEl.setAttribute("role", "button"); charEl.setAttribute("tabindex", "0");
  charEl.setAttribute("aria-label", "Talk to Priyanshu");
  const canvasWrap = el("div", "m-canvaswrap");
  const veil = el("div", "m-veil", '<div class="m-spin"></div>');
  const voiceStatus = el("div", "m-voice-status", "Voice ready");
  charEl.append(canvasWrap, veil, voiceStatus);
  const bubble = el("div", "m-bubble");
  root.append(charEl, bubble);
  document.body.appendChild(root);

  // ---------------------------------------------------------------- engine
  let mascot = null, gesture = "idle";
  function setGesture(g) { if (g === gesture) return; gesture = g; if (mascot) mascot.trigger(g, false); }

  if (!window.MascotEngine || !window.MascotEngine.createMascot) {
    console.error("[mascot] mascot-engine.js not loaded"); veil.classList.add("hidden");
  } else {
    mascot = window.MascotEngine.createMascot(canvasWrap, {
      videoBase: "assets/videos/", pin: true, ambient: false, spontaneous: false, fx: false,
      onStateChange: () => {}, onSpeech: () => {},
    });
    mascot.ready.then(() => {
      veil.classList.add("hidden");
      warmMascotClips();
      probeWalk();
      startLife();
    });
  }


  function warmMascotClips() {
    if (!mascot || !mascot.preload) return;
    const warm = ["wave", "point", "sit", "think", "listen", "talk", "groove"];
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
    warm.forEach((gestureName, i) => {
      setTimeout(() => idle(() => mascot.preload([gestureName])), 350 + i * 650);
    });
  }

  // ---------------------------------------------------------------- locomotion (time-based)
  const pos = { x: 60, y: 60 }, target = { x: 60, y: 60 };
  let facing = 1, perchEl = null, moving = false, perched = false;
  let charW = 130, charH = 188, walkPxps = 170, curSpeed = 0, raf = null, lastT = 0;
  let onArrive = null, pendingGesture = "idle";

  let hasWalk = false;
  async function probeWalk() {
    for (const ext of ["webm", "mp4"]) {
      try { const r = await fetch("assets/videos/walk_1." + ext, { method: "HEAD" }); if (r.ok) { hasWalk = true; break; } } catch (_) {}
    }
    if (hasWalk && mascot && mascot.preload) mascot.preload(["walk"]);
  }

  function measure() {
    const r = charEl.getBoundingClientRect();
    if (r.width) { charW = r.width; charH = r.height; walkPxps = CFG.walkCadence * charH; }
  }
  function groundY() { return window.innerHeight - charH * 0.98; }
  function perchPointFor(e) {
    const r = e.getBoundingClientRect();
    return {
      x: clamp(r.left + Math.min(r.width * 0.5, 70) - charW / 2, 6, window.innerWidth - charW - 6),
      y: clamp(r.top - charH * 0.86, 6, window.innerHeight - charH - 6),
    };
  }
  function besidePoint(e) {
    const r = e.getBoundingClientRect();
    const leftRoom = r.left > charW + 24;
    const x = leftRoom ? r.left - charW * 0.82 : Math.min(r.right - charW * 0.18, window.innerWidth - charW - 6);
    const y = clamp(r.bottom - charH * 0.96, 6, window.innerHeight - charH - 6);
    return { x: clamp(x, 6, window.innerWidth - charW - 6), y };
  }

  function moveTo(x, y, opts = {}) {
    target.x = clamp(x, 4, window.innerWidth - charW - 4);
    target.y = clamp(y, 4, window.innerHeight - charH - 4);
    perchEl = opts.perch || null;
    perched = false;
    pendingGesture = opts.gesture || "idle";
    onArrive = opts.onArrive || null;
    ensureTick();
  }
  function ensureTick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); } }

  function tick(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000) || 0.016; lastT = now;

    // ride a perched component as the page scrolls (stay glued unless it bolts)
    if (perchEl) {
      if (!document.contains(perchEl)) { perchEl = null; perched = false; }
      else { const p = perchPointFor(perchEl); target.x = p.x; target.y = p.y; }
    }

    const dx = target.x - pos.x, dy = target.y - pos.y, dist = Math.hypot(dx, dy);
    const stopR = 5;
    let lean = 0;

    if (perched && dist < 90) {
      // glued to the component — snap so it never micro-shuffles while reading
      pos.x = target.x; pos.y = target.y; curSpeed = 0;
    } else if (dist > stopR) {
      const wantSpeed = walkPxps;
      curSpeed += (wantSpeed - curSpeed) * Math.min(1, dt * 7); // ease in/out
      const step = Math.min(curSpeed * dt, dist);
      pos.x += (dx / dist) * step; pos.y += (dy / dist) * step;

      const fastEnough = curSpeed > walkPxps * 0.2;
      if (fastEnough) {
        if (!moving) { moving = true; charEl.classList.toggle("walking", !hasWalk); }
        charEl.classList.toggle("is-air", target.y < groundY() - 30);
        if (!convoActive) setGesture(hasWalk ? "walk" : "idle");
        if (Math.abs(dx) > 1.2) {
          const dir = dx > 0 ? 1 : -1;                 // clip is authored facing LEFT
          facing = hasWalk ? (dir === 1 ? -1 : 1) : dir;
          lean = hasWalk ? 0 : dir * 2;
        }
      }
    } else {
      // arrived
      pos.x = target.x; pos.y = target.y; curSpeed = 0;
      if (moving) {
        moving = false; charEl.classList.remove("walking"); facing = 1;
        if (!convoActive) setGesture(pendingGesture);
        if (perchEl) perched = true;
        const cb = onArrive; onArrive = null; if (cb) try { cb(); } catch (e) { console.warn(e); }
      }
    }

    charEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${lean}deg) scaleX(${facing})`;
    positionBubble();

    const busyMoving = dist > stopR && !(perched && dist < 90);
    if (busyMoving || curSpeed > 1) raf = requestAnimationFrame(tick);
    else raf = null;
  }

  function positionBubble() {
    if (!bubble.classList.contains("show")) return;
    const bx = clamp(pos.x + charW / 2, 120, window.innerWidth - 120), by = pos.y + 6;
    bubble.style.transform = `translate(${bx}px, ${by}px) translate(-50%,-100%)`;
  }

  // ---------------------------------------------------------------- CHOREOGRAPHER
  // Each section gets a beat: a real component to act on + a gesture + a line.
  const SCENES = {
    home:    { sel: "[data-ask], .btn.primary", place: "beside", gesture: "point", line: "Hey — I'm Priyanshu. Tap me and let's actually talk." },
    brain:   { sel: "#brainGrid .node",         place: "on",     gesture: "sit",   line: "This is how I think — I turn chaos into systems." },
    work:    { sel: "#cases .case",             place: "on",     gesture: "sit",   line: "Real things I built, broke, and fixed. Open one." },
    broke:   { sel: "#bugs .bug",               place: "on",     gesture: "think", line: "I don't hide what broke — that's the proof I learned." },
    story:   { sel: "#routeNodes .route-node",  place: "on",     gesture: "sit",   line: "I took the path where I could build the most." },
    ai:      { sel: "#ai h2, #ai .eyebrow",     place: "on",     gesture: "think", line: "AI is my leverage — not my identity." },
    now:     { sel: "#board .col",              place: "on",     gesture: "point", line: "Here's what I'm building right now." },
    contact: { sel: "#signalForm [type=submit], #signalForm", place: "beside", gesture: "wave", line: "Got chaos that needs a system? Send me a signal." },
  };
  const SECTION_IDS = Object.keys(SCENES);
  const shownLines = new Set();
  let activeId = null, lastSceneId = null, scrollSettle = null, scrolling = false;

  function visibleAmount(elm) {
    const r = elm.getBoundingClientRect();
    const vh = window.innerHeight;
    return Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
  }
  function activeSection() {
    let best = null, bestV = 0;
    for (const id of SECTION_IDS) {
      const s = document.getElementById(id); if (!s) continue;
      const v = visibleAmount(s);
      if (v > bestV) { bestV = v; best = id; }
    }
    return best;
  }
  function resolveTarget(scene) {
    const all = Array.from(document.querySelectorAll(scene.sel));
    const vh = window.innerHeight;
    const inView = all.filter((e) => { const r = e.getBoundingClientRect(); return r.top > 30 && r.bottom < vh - 10 && r.width > 40; });
    if (!inView.length) return null;
    inView.sort((a, b) => Math.abs(a.getBoundingClientRect().top - vh * 0.34) - Math.abs(b.getBoundingClientRect().top - vh * 0.34));
    return inView[0];
  }

  function runScene(id, force) {
    if (convoActive || reduce || !id) return;
    const scene = SCENES[id];
    if (!scene) { idleNearSection(id); return; }
    if (id === lastSceneId && !force && perched) return; // already settled here
    lastSceneId = id;

    const tEl = resolveTarget(scene);
    const showLine = () => {
      if (shownLines.has(id)) return;
      shownLines.add(id);
      showBubble({ text: scene.line, sticky: false });
    };

    if (tEl) {
      const p = scene.place === "on" ? perchPointFor(tEl) : besidePoint(tEl);
      moveTo(p.x, p.y, { perch: scene.place === "on" ? tEl : null, gesture: scene.gesture, onArrive: showLine });
    } else {
      // no component in view — stand near the section and do the gesture in place
      const s = document.getElementById(id); const r = s ? s.getBoundingClientRect() : null;
      const x = r ? clamp(r.left + r.width * 0.5 - charW / 2, 30, window.innerWidth - charW - 30) : pos.x;
      moveTo(x, groundY(), { gesture: scene.gesture, onArrive: showLine });
    }
  }
  function idleNearSection() { moveTo(clamp(pos.x, 40, window.innerWidth - charW - 40), groundY(), { gesture: "idle" }); }

  // gentle idle fidget if the reader lingers in one spot
  let fidgetTimer = null;
  function armFidget() {
    clearTimeout(fidgetTimer);
    if (reduce) return;
    fidgetTimer = setTimeout(() => {
      if (!convoActive && !moving && !scrolling) {
        const g = pick(["point", "think", "wave", "groove", "listen"]);
        const back = gesture;
        setGesture(g);
        setTimeout(() => { if (!convoActive && !moving) setGesture(back === "walk" ? "idle" : back); }, 2600);
      }
      armFidget();
    }, 16000 + Math.random() * 9000);
  }

  // ---------------------------------------------------------------- life cycle
  function startLife() {
    measure();
    pos.x = clamp(window.innerWidth - 190, 20, window.innerWidth - charW - 20);
    pos.y = groundY(); target.x = pos.x; target.y = pos.y;
    charEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(1)`;
    if (reduce) { setGesture("idle"); return; }

    // Instant greeting — wave + welcome the moment the page is alive (no
    // permission needed, zero latency).
    setTimeout(() => setGesture("wave"), 500);
    setTimeout(() => { showBubble({ text: "Heyo! Welcome to Priyanshu OS — I'm Priyanshu. Talk to me, or look around.", sticky: false }); }, 1000);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    armFidget();
    armVoiceAutostart();
    setTimeout(() => { activeId = activeSection(); runScene(activeId, true); }, 2600);
  }

  // The browser won't grant the mic / unlock audio until a real user gesture —
  // so the voice agent can't legally open on raw page load. We arm it to fire on
  // the *first* interaction (tap, key, or touch), the earliest allowed moment.
  // primeVoice() grabs the single permission, opens the greeting, and (if the
  // SDK bridge isn't mounted yet) goLive() remembers the intent for onBridgeReady.
  let voiceAutostartArmed = false, voiceAutostartDone = false;
  function armVoiceAutostart() {
    if (voiceAutostartArmed || reduce || CFG.autostartVoice === false) return;
    voiceAutostartArmed = true;
    const fire = () => {
      if (voiceAutostartDone) return;
      voiceAutostartDone = true;
      window.removeEventListener("pointerdown", fire, true);
      window.removeEventListener("keydown", fire, true);
      window.removeEventListener("touchstart", fire, true);
      primeVoice(true);
    };
    window.addEventListener("pointerdown", fire, true);
    window.addEventListener("keydown", fire, true);
    window.addEventListener("touchstart", fire, true);
  }

  function onScroll() {
    if (convoActive) return;
    if (perchEl) { perchEl = null; perched = false; if (!moving) setGesture("idle"); } // detach while scrolling
    scrolling = true;
    clearTimeout(scrollSettle);
    scrollSettle = setTimeout(() => {
      scrolling = false;
      const id = activeSection();
      if (id) { activeId = id; runScene(id); }
    }, CFG.sceneDwellMs);
    armFidget();
  }
  function onResize() {
    measure();
    pos.x = clamp(pos.x, 4, window.innerWidth - charW - 4);
    pos.y = clamp(pos.y, 4, window.innerHeight - charH - 4);
    ensureTick();
  }

  charEl.addEventListener("mouseenter", () => { if (!convoActive && !moving) setGesture("point"); });
  charEl.addEventListener("mouseleave", () => { if (!convoActive && !moving && gesture === "point") setGesture(perched ? lastSceneGesture() : "idle"); });
  charEl.addEventListener("click", onMascotTap);
  charEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onMascotTap(); } });
  function lastSceneGesture() { const s = SCENES[lastSceneId]; return s ? s.gesture : "idle"; }
  function onMascotTap() {
    if (voiceState === "live") { enterResting(); return; } // tap again to put me to rest
    primeVoice(true);
  }

  // ---------------------------------------------------------------- bubble
  let bubbleT = null;
  function setVoiceStatus(label, tone = "idle") {
    // Keep the tone (drives the subtle dot/ring colour) but, when connection
    // status text is hidden, show no words — just a seamless visual state.
    voiceStatus.dataset.tone = tone;
    voiceStatus.textContent = CFG.showConnectionStatus ? label : "";
    voiceStatus.classList.toggle("m-voice-status--silent", !CFG.showConnectionStatus);
    charEl.setAttribute("aria-label", tone === "live" ? "Talking to Priyanshu" : "Talk to Priyanshu");
  }

  function showBubble({ you, text, source, sticky }) {
    clearTimeout(bubbleT);
    bubble.innerHTML = '<div class="m-card">' +
      (you ? `<div class="m-you">You</div><div class="m-caption">“${esc(you)}”</div>` : "") +
      (text ? `<div class="m-ans">${esc(text)}</div>` : "") +
      (source ? `<div class="m-bsrc">${esc(source)}</div>` : "") + "</div>";
    bubble.classList.add("show"); positionBubble();
    if (!sticky) bubbleT = setTimeout(() => bubble.classList.remove("show"), clamp(2800 + (text ? text.length * 46 : 0), 2800, 12000));
  }

  // ---------------------------------------------------------------- BRAIN (first person)
  const SECTIONS = {
    home: "home", top: "home", intro: "home", start: "home", brain: "brain", zones: "brain",
    work: "work", proof: "work", projects: "work", cases: "work", evidence: "work",
    story: "story", route: "story", journey: "story", path: "story",
    ai: "ai", lab: "ai", workflow: "ai", now: "now", current: "now",
    contact: "contact", signal: "contact", hire: "contact",
    broke: "broke", failures: "broke", bugs: "broke", postmortem: "broke",
  };
  const MODES = ["founder", "builder", "recruiter", "story", "chaos"];
  const INTRO =
    "Hey — I'm Priyanshu Agarwal. This is my portfolio, so you're basically talking to me. " +
    "I'm a builder who turns chaos into systems — apps, AI workflows, founder-office ops. " +
    "Ask me anything: what I've built, what broke, or how I use AI.";

  const KB = [
    { k: ["who", "yourself", "about you", "introduce", "tell me about"], a: "I'm Priyanshu — a builder-operator from Jaipur. I work across apps, websites, AI workflows, founder-office systems and community ops. My one rule: turn chaos into systems, and back what I say with proof.", s: "→ that's me, honestly", g: "talk" },
    { k: ["built", "build", "made", "projects", "work", "shipped", "portfolio"], a: "I've built Student Social — a full app with pods, chat and feeds; the Nirog Bhumi founder-office systems; hackathon platforms; an AI QA workflow; and client sites on WordPress, WooCommerce and Next.js.", s: "→ open any case file to inspect it", g: "point" },
    { k: ["technical", "real", "just ai", "developer", "code", "coding", "engineer"], a: "I'm technical — I build with Next.js, React, Appwrite and WordPress, and I ship real apps. AI is my leverage for speed and first drafts, but direction, taste and what ships are my calls.", s: "→ see my AI workflow", g: "think" },
    { k: ["stack", "tech", "technologies", "tools", "languages", "framework"], a: "My stack is Next.js, React, TypeScript, Tailwind, Appwrite, WordPress, WooCommerce and the Shopify API — plus AI tooling running inside a QA loop.", s: "→ stacks are on each case file", g: "point" },
    { k: ["founder", "hire", "why", "care", "ceo", "startup"], a: "If you're a founder — I handle ambiguity without needing perfect instructions. Give me chaos, context and ownership, and I'll hand back a working system across product, ops, content and AI.", s: "→ switch me to Founder mode", g: "talk" },
    { k: ["broke", "break", "fail", "failure", "bug", "wrong", "mistake"], a: "Plenty broke. Appwrite permissions locked users out, chat actions silently vanished, I made git mistakes, AI handed me wrong code. Each break became a lesson — and that's the proof.", s: "→ see Things That Broke", g: "think" },
    { k: ["ai", "use ai", "how do you use", "workflow", "chatgpt", "leverage", "automation"], a: "I use AI in a loop: prompt, build, test, break, fix, document, ship. It speeds up drafts and debugging — but I own direction, priority, taste, and whether the output is actually true.", s: "→ AI is leverage, not identity", g: "think" },
    { k: ["now", "building now", "current", "currently", "learning", "next"], a: "Right now I'm building the Nirog Bhumi systems, Student Social, and this Priyanshu OS itself — while learning product architecture and exploring conversational interfaces, like the one you're using on me.", s: "→ see my Current Build Room", g: "talk" },
    { k: ["student", "social", "peerspark", "pods"], a: "Student Social is a social app I built for students — pods, chat and feeds. I built the pod system, real-time chat, the Appwrite backend and the whole frontend. The hard lesson: backend permissions are a product surface, not config.", s: "→ opening it for you", g: "point", action: () => window.openDrawer && window.openDrawer("student") },
    { k: ["nirog", "bhumi", "founder office", "business", "ops"], a: "Nirog Bhumi is a founder-office system I run — real business ops, content and automation. It's where I turn day-to-day chaos into repeatable systems.", s: "→ opening it for you", g: "point", action: () => window.openDrawer && window.openDrawer("nirog") },
    { k: ["contact", "reach", "email", "talk to you", "get in touch", "connect"], a: "Want to build something? Send me a signal in the contact section — tell me the type, the chaos, and what you need. If it makes sense, I'll reply.", s: "→ hello@priyanshu.os", g: "wave" },
    { k: ["story", "journey", "path", "background", "experience"], a: "I didn't take the cleanest path — I took the one where I could build the most. Messy starts, real projects, things that broke, lessons that stuck. That route map is my story.", s: "→ see the Route Map", g: "sit" },
  ];

  function localBrain(text) {
    const n = norm(text);
    const words = new Set(n.split(" "));
    if (/\b(stop|quiet|shush|enough)\b/.test(n)) { stopSpeaking(); return { spoken: "Alright, I'll pause.", g: "idle" }; }
    if (/\b(bye|goodbye|sleep|that s all|thats all|see you)\b/.test(n)) { goToSleep(); return { spoken: "Catch you later — I'll be around the page.", g: "wave" }; }
    if (/\b(thanks|thank you|cool|nice|awesome|great|love it)\b/.test(n)) return { spoken: pick(["Anytime!", "Glad that helped.", "Appreciate it."]), g: "wave" };
    if (/\b(hi|hii|hey|hello|yo|sup)\b/.test(n) && n.split(" ").length <= 3) return { spoken: "Hey! Good to meet you. Ask me what I've built, what broke, or how I work.", g: "wave" };
    if (/\b(help|what can you do|commands)\b/.test(n)) return { spoken: "Ask me about my projects, stack, failures, story or AI workflow. Or tell me to do things: “open work”, “show Nirog Bhumi”, “switch to recruiter mode”, “go to contact”.", g: "talk" };

    if (/\bcopy\b/.test(n) && /\bemail\b/.test(n)) return { spoken: "Done — I copied my email to your clipboard.", s: "→ hello@priyanshu.os", g: "point", action: () => navigator.clipboard && navigator.clipboard.writeText("hello@priyanshu.os") };
    const mode = MODES.find((m) => n.includes(m));
    if (mode && /\b(mode|switch|turn|go)\b/.test(n)) return { spoken: `Sure — switching to ${mode} mode.`, s: "→ accent + framing updated", g: "point", action: () => window.setMode && window.setMode(mode) };
    if (/\b(open|go|scroll|show|take me|navigate|jump|see)\b/.test(n)) {
      for (const key in SECTIONS) if (hasKw(words, n, key)) { const id = SECTIONS[key]; return { spoken: `Taking you to ${key}.`, s: "→ scrolling", g: "point", action: () => { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); } }; }
    }

    let best = null, score = 0;
    for (const item of KB) { let s = 0; for (const kw of item.k) if (hasKw(words, n, kw)) s += kw.includes(" ") ? 2 : 1; if (s > score) { score = s; best = item; } }
    if (best && score >= 1) return { spoken: best.a, s: best.s, g: best.g, action: best.action };
    return { spoken: "Good question — I don't have that exact context yet, but ask me about Student Social, Nirog Bhumi, my AI workflow, my stack, my failures, or what I'm building now.", s: "→ honest by default, no fake metrics", g: "talk" };
  }

  async function think(text) {
    if (CFG.brainEndpoint) {
      try {
        setGesture("think");
        const res = await fetch(CFG.brainEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, persona: "priyanshu-first-person" }) });
        const d = await res.json();
        return { spoken: d.answer || d.text || "", s: d.source || null, g: "talk" };
      } catch (e) { console.warn("[mascot] brain API failed, using local brain", e); }
    }
    return localBrain(text);
  }

  // ---------------------------------------------------------------- TTS
  const synth = window.speechSynthesis || null;
  let voices = [], currentAudio = null, speaking = false;
  function loadVoices() { if (synth) voices = synth.getVoices() || []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function pickVoice() {
    if (!voices.length) return null;
    const want = (CFG.voiceName || "").toLowerCase();
    if (want) { const v = voices.find((x) => x.name.toLowerCase().includes(want)); if (v) return v; }
    for (const p of ["google uk english male", "daniel", "google us english", "microsoft guy", "alex", "natural"]) { const v = voices.find((x) => x.name.toLowerCase().includes(p)); if (v) return v; }
    return voices.find((v) => /^en[-_]/i.test(v.lang)) || voices[0];
  }
  function stopSpeaking() { if (synth) synth.cancel(); if (currentAudio) { currentAudio.pause(); currentAudio = null; } speaking = false; }

  async function say(text, opts = {}) {
    if (!text) return;
    stopSpeaking();
    if (!moving) setGesture(opts.gesture || "talk");
    showBubble({ you: opts.you, text, source: opts.source, sticky: false });
    const onDone = () => { speaking = false; if (convoActive) { setGesture("listen"); resumeRecognition(); armSleep(); } else if (!moving) setGesture("idle"); };

    if (CFG.ttsEndpoint) {
      try {
        pauseRecognition();
        const res = await fetch(CFG.ttsEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, voice: CFG.voiceName }) });
        const url = URL.createObjectURL(await res.blob());
        currentAudio = new Audio(url); speaking = true;
        currentAudio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onDone(); };
        await currentAudio.play(); return;
      } catch (e) { console.warn("[mascot] TTS API failed, native voice", e); }
    }
    if (!synth) { speaking = true; setTimeout(onDone, clamp(1200 + text.length * 42, 1200, 8000)); return; }
    pauseRecognition();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(); if (v) u.voice = v;
    u.lang = (v && v.lang) || CFG.lang; u.rate = CFG.rate; u.pitch = CFG.pitch;
    u.onstart = () => { speaking = true; }; u.onend = onDone; u.onerror = onDone;
    synth.speak(u);
  }

  // ---------------------------------------------------------------- STT (local wake-word listener)
  // Cheap, always-on, on-device recognition whose ONLY job while resting is to
  // catch "hi Priyanshu" and flip the realtime agent on. It is stopped while a
  // live ElevenLabs call owns the mic, so the two never contend for it.
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recog = null, micEnabled = false, recogRunning = false, recogPaused = false;
  function buildRecognizer() {
    if (!SR) return null;
    const r = new SR(); r.lang = CFG.lang; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onstart = () => { recogRunning = true; };
    r.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { micEnabled = false; charEl.classList.remove("is-live"); } };
    r.onend = () => { recogRunning = false; if (micEnabled && !recogPaused) setTimeout(startRecognition, 250); };
    r.onresult = (e) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      if (!finalText) return;
      const n = norm(finalText);
      if (voiceState === "localchat") { handleUtterance(finalText.trim()); return; } // local-brain fallback
      if ((voiceState === "resting" || voiceState === "dormant") && CFG.wakeWords.some((w) => n.includes(w))) wakeFromName();
    };
    return r;
  }
  function startRecognition() { if (!SR || !micEnabled || recogRunning || recogPaused) return; if (!recog) recog = buildRecognizer(); try { recog.start(); } catch (_) {} }
  function pauseRecognition() { recogPaused = true; if (recog && recogRunning) { try { recog.stop(); } catch (_) {} } }
  function resumeRecognition() { recogPaused = false; if (micEnabled) startRecognition(); }
  function startListening() { resumeRecognition(); if (voiceState === "localchat" && !speaking) setGesture("listen"); }

  // ---------------------------------------------------------------- voice state machine
  // dormant → (first interaction, mic granted) → live → (silence) → resting ⇄ live
  let voiceState = "dormant";      // dormant | resting | live | localchat
  let convoActive = false;         // true while a conversation owns the mascot (pauses page choreography)
  let voicePrimed = false, voiceLivePending = false, agentSpeaking = false;
  let restTimer = null, sleepTimer = null, busy = false;
  const hasBridge = () => !!window.ElevenLabsMascotBridge;
  function conversationSpot() { return { x: clamp(window.innerWidth - charW - 30, 20, window.innerWidth - charW - 8), y: groundY() }; }

  // One permission prompt for the whole origin; the realtime agent and the
  // wake-word listener both reuse it afterward (no second prompt, no lag).
  async function primeVoice(goLiveAfter) {
    if (voicePrimed) { if (goLiveAfter) goLive(); return; }
    voicePrimed = true;
    if (SR) {
      try { await navigator.mediaDevices.getUserMedia({ audio: true }); micEnabled = true; charEl.classList.add("is-live"); }
      catch (_) { micEnabled = false; }
    }
    if (goLiveAfter) goLive(); else enterResting();
  }

  // Open the realtime ElevenLabs agent (or, if the SDK never came up, the local
  // brain) — used for the opening greeting and for every wake-word re-entry.
  function goLive() {
    if (voiceState === "live") return;
    if (!hasBridge()) {
      // Bridge not mounted yet — remember intent, rest meanwhile, and a silent
      // local brain covers the visitor if the SDK never loads at all.
      voiceLivePending = true;
      if (voiceState !== "localchat") enterResting();
      clearTimeout(window.__mascotLocalFallback);
      window.__mascotLocalFallback = setTimeout(() => { if (voiceLivePending && !hasBridge()) goLocalChat(true); }, 4000);
      return;
    }
    voiceState = "live"; convoActive = true; voiceLivePending = false;
    clearTimeout(fidgetTimer); clearTimeout(sleepTimer); perchEl = null; perched = false;
    pauseRecognition();                       // hand the mic to the realtime agent
    setVoiceStatus("Connecting…", "busy");
    const spot = conversationSpot();
    moveTo(spot.x, spot.y, { gesture: "wave" });
    window.ElevenLabsMascotBridge.start().catch((error) => {
      console.warn("[mascot] voice connect failed — falling back", error);
      voiceFailover();
    });
  }

  // Connection couldn't be established (or errored before connecting). Keep an
  // interaction path alive: rest (retryable by wake-word/tap) where we have a
  // listener, otherwise drop to the silent local brain so the visitor can
  // still chat. Idempotent per attempt.
  function voiceFailover() {
    if (voiceState !== "live") return;
    if (micEnabled && SR) enterResting();
    else { voiceState = "resting"; convoActive = false; goLocalChat(false); }
  }

  // Drop the realtime connection, release the mic to the wake-word listener, and
  // let the mascot go back to roaming/guiding the page. Zero idle cost.
  function enterResting() {
    const wasLive = voiceState === "live";
    voiceState = "resting"; convoActive = false; agentSpeaking = false;
    clearTimeout(restTimer); clearTimeout(sleepTimer);
    if (wasLive && hasBridge() && window.ElevenLabsMascotBridge.status !== "disconnected") {
      try { window.ElevenLabsMascotBridge.stop(); } catch (_) {}
    }
    setVoiceStatus("", "idle");
    charEl.classList.toggle("is-live", micEnabled);   // subtle ring = "listening for my name"
    facing = 1; if (!moving) setGesture("idle");
    if (micEnabled) resumeRecognition();
    lastSceneId = null; runScene(activeSection(), true); armFidget();
  }

  // Heard "hi Priyanshu" while resting → instant visual wave (microseconds),
  // then the realtime audio warms up behind it (sub-second).
  function wakeFromName() {
    if (voiceState === "live" || voiceState === "localchat") return;
    setGesture("wave");
    goLive();
  }

  // Rest the live agent after a beat of user silence (configurable).
  function armRest() { clearTimeout(restTimer); restTimer = setTimeout(() => { if (voiceState === "live" && !agentSpeaking) enterResting(); }, CFG.restAfterMs); }
  function cancelRest() { clearTimeout(restTimer); }

  // -------- local-brain fallback (only if the realtime SDK is unavailable) ----
  function armSleep() { clearTimeout(sleepTimer); sleepTimer = setTimeout(() => { if (voiceState === "localchat") enterResting(); }, CFG.sleepAfterMs); }
  function goLocalChat(greet) {
    voiceLivePending = false; voiceState = "localchat"; convoActive = true;
    clearTimeout(fidgetTimer); perchEl = null; perched = false;
    const spot = conversationSpot();
    moveTo(spot.x, spot.y, { gesture: "wave", onArrive: () => {
      setGesture("wave");
      if (greet) setTimeout(() => say(INTRO, { gesture: "talk" }), 600);
    } });
    armSleep();
    if (micEnabled) resumeRecognition();
  }
  async function handleUtterance(text) {
    if (!text || busy) return;
    const n = norm(text);
    if (CFG.wakeWords.some((w) => n === w)) return;
    busy = true; clearTimeout(sleepTimer); pauseRecognition();
    showBubble({ you: text, text: "…", sticky: true });
    const r = await think(text);
    if (r.action) { try { r.action(); } catch (e) { console.warn(e); } }
    say(r.spoken, { you: text, source: r.s, gesture: r.g || "talk" });
    busy = false;
  }
  function openType() { const q = window.prompt("Ask Priyanshu:"); if (q && q.trim()) { if (voiceState !== "localchat") goLocalChat(false); setTimeout(() => handleUtterance(q.trim()), 200); } }

  // Backward-compatible aliases used elsewhere in the file / public API.
  function wakeUp() { primeVoice(true); }
  function goToSleep() { enterResting(); }
  function enableMic() { primeVoice(true); }
  function startElevenLabsConversation() { primeVoice(true); }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { stopSpeaking(); pauseRecognition(); }
    else if (micEnabled && (voiceState === "resting" || voiceState === "localchat")) resumeRecognition();
  });

  window.PriyanshuMascot = {
    ask: (t) => {
      if (hasBridge() && window.ElevenLabsMascotBridge.status === "connected") { window.ElevenLabsMascotBridge.sendText(t); return; }
      if (voiceState !== "localchat") goLocalChat(false);
      setTimeout(() => handleUtterance(t), 200);
    },
    say, wake: wakeUp, sleep: goToSleep, enableMic, gesture: setGesture, config: CFG,
    state: () => gesture, voiceState: () => voiceState, hasWalk: () => hasWalk, scene: (id) => runScene(id, true),
    elevenlabs: {
      // Fired once the voice SDK bridge has mounted. If a wake/greeting was
      // requested before it was ready, open the conversation now.
      onBridgeReady: () => { if (voiceLivePending) goLive(); },
      onStarting: () => { charEl.classList.add("is-live"); setVoiceStatus("Connecting…", "busy"); if (!moving) setGesture("listen"); },
      onConnect: () => { voiceState = "live"; convoActive = true; charEl.classList.add("is-live"); setVoiceStatus("Live", "live"); setGesture("wave"); cancelRest(); armRest(); },
      onDisconnect: () => { if (voiceState === "live") enterResting(); else { charEl.classList.toggle("is-live", micEnabled); setVoiceStatus("", "idle"); } },
      onSpeakingChange: (isSpeaking) => { if (voiceState !== "live") return; agentSpeaking = isSpeaking; setVoiceStatus(isSpeaking ? "Speaking" : "Listening", "live"); if (!moving) setGesture(isSpeaking ? "talk" : "listen"); if (isSpeaking) cancelRest(); else armRest(); },
      onModeChange: (mode) => { if (voiceState !== "live" || !mode || !mode.mode) return; const sp = mode.mode === "speaking"; agentSpeaking = sp; setVoiceStatus(sp ? "Speaking" : "Listening", "live"); if (!moving) setGesture(sp ? "talk" : "listen"); if (sp) cancelRest(); else armRest(); },
      onMessage: (message) => {
        const text = message?.message || message?.text || message?.sourceText || message?.transcript;
        if (!text) return;
        const role = message?.source || message?.role;
        if (role === "user") { cancelRest(); showBubble({ you: text, sticky: true }); }
        else showBubble({ text, sticky: false });
      },
      onError: (error) => { console.warn("[mascot] ElevenLabs error", error); voiceFailover(); },
    },
  };
})();
