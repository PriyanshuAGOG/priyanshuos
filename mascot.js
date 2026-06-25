/* ============================================================================
   MASCOT — free-roaming companion + hybrid realtime voice engine (Priyanshu OS)
   ----------------------------------------------------------------------------
   The character is no longer trapped in a box. It walks across the page, sits
   on real components (riding them as you scroll), thinks when you pause on a
   section, and reacts with its full gesture set (wave / point / sit / think /
   listen / talk / groove).

   VOICE — hybrid, realtime:
     • Wake word: once the mic is enabled, it listens continuously for
       "hi/hello Priyanshu" (or just "Priyanshu"). On wake it walks over,
       waves, speaks a short intro, and stays in conversation.
     • Native path (default, zero-delay): SpeechRecognition streams locally and
       speechSynthesis starts the reply the instant the brain resolves.
     • API path (drop-in): window.MASCOT_CONFIG.{sttEndpoint,brainEndpoint,
       ttsEndpoint} swap any stage for a premium service; everything else stays.

   The brain reuses the site's own answerFor()/ANSWERS and understands
   navigation / mode / case-file commands, so the mascot can drive the page.
   ========================================================================== */
(function () {
  "use strict";

  const CFG = Object.assign(
    {
      lang: "en-US",
      voiceName: null,
      rate: 1.04,
      pitch: 1.0,
      sttEndpoint: null,
      brainEndpoint: null,
      ttsEndpoint: null,
      wakeWords: ["priyanshu", "preyanshu", "priyansh", "hey mascot"],
      sleepAfterMs: 28000, // drop back to roaming if the conversation goes quiet
    },
    window.MASCOT_CONFIG || {}
  );

  const reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia && window.matchMedia("(pointer:coarse)").matches;

  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) =>
    (typeof window.norm === "function"
      ? window.norm(s)
      : String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim());
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ===========================================================================
  // DOM
  // ===========================================================================
  const root = el("div");
  root.id = "mascot-root";
  root.setAttribute("aria-live", "polite");

  const charEl = el("div", "m-char");
  charEl.setAttribute("role", "button");
  charEl.setAttribute("aria-label", "Mascot — tap to talk");
  const canvasWrap = el("div", "m-canvaswrap");
  const veil = el("div", "m-veil", '<div class="m-spin"></div>');
  charEl.append(canvasWrap, veil);

  const bubble = el("div", "m-bubble");

  const ICON = {
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    micoff: '<svg viewBox="0 0 24 24"><path d="M9 9v2a3 3 0 0 0 4.5 2.6M15 11V6a3 3 0 0 0-5.9-.7"/><path d="M5 11a7 7 0 0 0 10.7 6M19 11a7 7 0 0 1-.6 2.8"/><path d="M12 18v3M3 3l18 18"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/></svg>',
  };
  const bar = el("div", "m-bar");
  const status = el("div", "m-status", 'MASCOT · <b id="mStatus">IDLE</b>');
  const typeBtn = el("button", "m-btn", ICON.keyboard);
  typeBtn.setAttribute("aria-label", "Type a question");
  const muteBtn = el("button", "m-btn", ICON.sound);
  muteBtn.setAttribute("aria-label", "Mute voice");
  const micBtn = el("button", "m-btn m-mic", ICON.mic);
  micBtn.setAttribute("aria-label", "Enable voice and wake word");
  bar.append(status, typeBtn, muteBtn, micBtn);

  root.append(charEl, bubble, bar);
  document.body.appendChild(root);

  const setStatus = (t) => {
    const b = document.getElementById("mStatus");
    if (b) b.textContent = t;
  };

  // ===========================================================================
  // MASCOT ENGINE
  // ===========================================================================
  let mascot = null;
  let gesture = "idle";
  function setGesture(g) {
    if (g === gesture) return;
    gesture = g;
    if (mascot) mascot.trigger(g, false);
    setStatus(g.toUpperCase());
  }

  if (!window.MascotEngine || !window.MascotEngine.createMascot) {
    console.error("[mascot] mascot-engine.js not loaded");
    veil.classList.add("hidden");
  } else {
    mascot = window.MascotEngine.createMascot(canvasWrap, {
      videoBase: "videos/",
      ambient: false, // we drive every gesture ourselves
      spontaneous: false,
      fx: false,
      onStateChange: (s) => setStatus(s.toUpperCase()),
      onSpeech: () => {},
    });
    mascot.ready.then(() => {
      veil.classList.add("hidden");
      startLife();
    });
  }

  // ===========================================================================
  // LOCOMOTION  — position the character around the viewport
  // ===========================================================================
  const pos = { x: window.innerWidth - 170, y: window.innerHeight - 210 };
  const target = { x: pos.x, y: pos.y };
  let facing = 1;            // 1 = facing right, -1 = facing left
  let perchEl = null;        // element the mascot is currently sitting on
  let moving = false;
  let charW = 120, charH = 173;

  function measure() {
    const r = charEl.getBoundingClientRect();
    if (r.width) { charW = r.width; charH = r.height; }
  }
  function groundY() { return window.innerHeight - charH * 0.98; }

  // place feet on the top edge of an element (it "sits" on the component)
  function perchPointFor(elm) {
    const r = elm.getBoundingClientRect();
    return {
      x: clamp(r.left + Math.min(r.width * 0.5, 60) - charW / 2, 6, window.innerWidth - charW - 6),
      y: clamp(r.top - charH * 0.88, 6, window.innerHeight - charH - 6),
    };
  }

  function goTo(x, y, opts = {}) {
    perchEl = opts.perch || null;
    target.x = clamp(x, 4, window.innerWidth - charW - 4);
    target.y = clamp(y, 4, window.innerHeight - charH - 4);
    pendingGesture = opts.gesture || "idle";
    pendingSpeak = opts.say || null;
  }
  let pendingGesture = "idle";
  let pendingSpeak = null;

  let raf = null;
  function tick() {
    // if perched, keep tracking the element as the page scrolls
    if (perchEl) {
      if (!document.contains(perchEl)) perchEl = null;
      else {
        const p = perchPointFor(perchEl);
        target.x = p.x;
        target.y = p.y;
      }
    }
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1.2) {
      const speed = clamp(dist * 0.12, 1.6, 13); // ease-out, with a floor
      const nx = (dx / dist) * Math.min(speed, dist);
      const ny = (dy / dist) * Math.min(speed, dist);
      pos.x += nx;
      pos.y += ny;
      if (Math.abs(dx) > 2) facing = dx > 0 ? 1 : -1;
      if (!moving && dist > 8) {
        moving = true;
        charEl.classList.add("walking");
        charEl.classList.toggle("is-air", target.y < groundY() - 30);
        if (!convoActive) setGesture("idle"); // walking look = idle + bob
      }
    } else if (moving) {
      // arrived
      moving = false;
      pos.x = target.x;
      pos.y = target.y;
      charEl.classList.remove("walking");
      if (!convoActive) {
        setGesture(pendingGesture);
        if (pendingSpeak) say(pendingSpeak, { gestureOverride: true });
        pendingSpeak = null;
      }
    }

    charEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(${facing})`;
    positionBubble();
    raf = requestAnimationFrame(tick);
  }

  function positionBubble() {
    if (!bubble.classList.contains("show")) return;
    const bx = clamp(pos.x + charW / 2, 120, window.innerWidth - 120);
    const by = pos.y + 6;
    bubble.style.transform = `translate(${bx}px, ${by}px) translate(-50%,-100%)`;
  }

  // ===========================================================================
  // AMBIENT BEHAVIOUR  — wander, and react to where the reader stops
  // ===========================================================================
  const PERCH_SELECTOR = ".case, .node, .fcard, .bug, .col, .route-node, .panel-card, h2";
  let wanderTimer = null, scrollStopTimer = null, lastScrollY = window.scrollY;

  function visibleSection() {
    const secs = Array.from(document.querySelectorAll("section[id], header[id]"));
    const mid = window.innerHeight / 2;
    let best = null, bestD = Infinity;
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bestD) { bestD = d; best = s; }
    }
    return best;
  }
  function perchCandidate() {
    const all = Array.from(document.querySelectorAll(PERCH_SELECTOR));
    const inView = all.filter((e) => {
      const r = e.getBoundingClientRect();
      return r.top > 40 && r.top < window.innerHeight * 0.7 && r.width > 60;
    });
    if (!inView.length) return null;
    // prefer something near the upper-middle of the viewport
    inView.sort((a, b) => Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.32) -
                          Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.32));
    return inView[Math.floor(Math.random() * Math.min(3, inView.length))];
  }

  // when the reader settles on a section, the mascot goes to perch + react
  function onSettle() {
    if (convoActive || reduce) return;
    const cand = perchCandidate();
    if (cand) {
      const p = perchPointFor(cand);
      const g = pick(["sit", "think", "point", "listen", "sit", "think"]);
      goTo(p.x, p.y, { perch: cand, gesture: g });
    } else {
      // nothing to sit on — idle near the bottom
      goTo(clamp(pos.x, 40, window.innerWidth - charW - 40), groundY(), { gesture: "idle" });
    }
  }

  function wander() {
    clearTimeout(wanderTimer);
    if (reduce) return;
    wanderTimer = setTimeout(() => {
      if (!convoActive && !moving && !perchEl) {
        const x = 40 + Math.random() * (window.innerWidth - charW - 80);
        const g = Math.random() < 0.3 ? "groove" : "idle";
        goTo(x, groundY(), { gesture: g });
      }
      wander();
    }, 9000 + Math.random() * 7000);
  }

  function startLife() {
    measure();
    pos.x = clamp(window.innerWidth - 180, 20, window.innerWidth - charW - 20);
    pos.y = groundY();
    target.x = pos.x; target.y = pos.y;
    if (!raf) tick();
    if (reduce) { setGesture("idle"); return; }

    // first hello after it appears — wave, then speak
    setTimeout(() => setGesture("wave"), 600);
    setTimeout(() => {
      say("Hi! I'm Priyanshu's mascot. Tap me, or enable the mic and say " +
          "“Hi Priyanshu” to talk.", { gesture: "talk", source: "→ I'll walk the page with you" });
    }, 1250);

    window.addEventListener("scroll", () => {
      lastScrollY = window.scrollY;
      perchEl = null; // let go of whatever it was sitting on while scrolling
      if (!convoActive && !moving) setGesture("idle");
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(onSettle, 900);
    }, { passive: true });

    wander();
    setTimeout(onSettle, 2600);
  }

  window.addEventListener("resize", () => {
    measure();
    pos.x = clamp(pos.x, 4, window.innerWidth - charW - 4);
    pos.y = clamp(pos.y, 4, window.innerHeight - charH - 4);
  });

  // hover / tap the mascot
  charEl.addEventListener("mouseenter", () => {
    if (!convoActive && !moving) setGesture("point");
  });
  charEl.addEventListener("mouseleave", () => {
    if (!convoActive && !moving && gesture === "point") setGesture("idle");
  });
  charEl.addEventListener("click", () => {
    if (!convoActive) wakeUp();
    else startListening();
  });

  // ===========================================================================
  // SPEECH BUBBLE
  // ===========================================================================
  let bubbleT = null;
  function showBubble({ you, text, source, sticky }) {
    clearTimeout(bubbleT);
    bubble.innerHTML =
      '<div class="m-card">' +
      (you ? `<div class="m-you">You</div><div class="m-caption">“${esc(you)}”</div>` : "") +
      (text ? `<div class="m-ans">${esc(text)}</div>` : "") +
      (source ? `<div class="m-bsrc">${esc(source)}</div>` : "") +
      "</div>";
    bubble.classList.add("show");
    positionBubble();
    if (!sticky) {
      const dur = clamp(2600 + (text ? text.length * 45 : 0), 2600, 11000);
      bubbleT = setTimeout(() => bubble.classList.remove("show"), dur);
    }
  }
  const hideBubble = () => { clearTimeout(bubbleT); bubble.classList.remove("show"); };

  // ===========================================================================
  // BRAIN  — site answers + commands (+ optional API)
  // ===========================================================================
  const SECTIONS = {
    home: "home", top: "home", intro: "home", start: "home",
    brain: "brain", zones: "brain",
    work: "work", proof: "work", projects: "work", cases: "work", evidence: "work",
    story: "story", route: "story", journey: "story", path: "story",
    ai: "ai", lab: "ai", workflow: "ai",
    now: "now", current: "now",
    contact: "contact", signal: "contact", hire: "contact",
    broke: "broke", failures: "broke", bugs: "broke", postmortem: "broke",
  };
  const MODES = ["founder", "builder", "recruiter", "story", "chaos"];
  const INTRO =
    "Priyanshu's a builder-operator from Jaipur who turns chaos into systems — " +
    "apps, AI workflows, founder-office ops — all backed by proof, not claims. " +
    "Ask me what he built, what broke, or how he uses AI!";

  function localBrain(text) {
    const n = norm(text);

    if (/\b(stop|quiet|shut up|enough)\b/.test(n)) { stopSpeaking(); return { spoken: "Okay, I'll stop.", gesture: "idle" }; }
    if (/\b(bye|goodbye|sleep|that s all|thats all|go away)\b/.test(n)) { goToSleep(); return { spoken: "Catch you later! I'll be around the page.", gesture: "wave" }; }

    if (/\b(thanks|thank you|cool|nice|awesome|great)\b/.test(n)) return { spoken: pick(["Anytime!", "Glad that helped.", "You got it."]), gesture: "wave" };
    if (/\b(who are you|what are you|your name)\b/.test(n)) return { spoken: "I'm the Priyanshu OS mascot — your voice guide to his proof of work. Try “what has he built?” or say “open work”.", gesture: "talk" };
    if (/\b(help|what can you do|commands)\b/.test(n)) return { spoken: "Ask about his projects, stack, failures, story or AI workflow. Or command me: “open work”, “show Nirog Bhumi”, “switch to recruiter mode”, “go to contact”, “copy email”.", gesture: "talk" };

    if (/\bcopy\b/.test(n) && /\bemail\b/.test(n)) {
      return { spoken: "Copied his email to your clipboard.", source: "→ hello@priyanshu.os", gesture: "point",
        action: () => navigator.clipboard && navigator.clipboard.writeText("hello@priyanshu.os") };
    }
    const mode = MODES.find((m) => n.includes(m));
    if (mode && /\b(mode|switch|turn|go)\b/.test(n)) {
      return { spoken: `Switching to ${mode} mode.`, source: "→ accent + framing updated", gesture: "point",
        action: () => typeof window.setMode === "function" && window.setMode(mode) };
    }
    if (/\b(open|show|see)\b/.test(n)) {
      if (/\bstudent\b/.test(n)) return drawer("student", "Student Social");
      if (/\bnirog|bhumi\b/.test(n)) return drawer("nirog", "Nirog Bhumi");
      if (/\bhack/.test(n)) return drawer("hack", "the hackathon build");
      if (/\bwoo|client|agency|commerce\b/.test(n)) return drawer("agency", "the client WooCommerce build");
    }
    if (/\b(open|go|scroll|show|take me|navigate|jump)\b/.test(n)) {
      for (const key in SECTIONS) {
        if (n.includes(key)) {
          const id = SECTIONS[key];
          return { spoken: `Taking you to ${key}.`, source: "→ scrolling", gesture: "point", action: () => scrollToId(id) };
        }
      }
    }

    if (typeof window.answerFor === "function") {
      const r = window.answerFor(text);
      return { spoken: r.a, source: r.s, gesture: "talk" };
    }
    return { spoken: "I can answer about Student Social, Nirog Bhumi, his AI workflow, hackathons, his stack, or what he's building now. What would you like to know?", gesture: "talk" };
  }
  function drawer(id, label) {
    return { spoken: `Opening the ${label} case file.`, source: "→ proof, not claims", gesture: "point",
      action: () => typeof window.openDrawer === "function" && window.openDrawer(id) };
  }
  function scrollToId(id) { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }

  async function think(text) {
    if (CFG.brainEndpoint) {
      try {
        setGesture("think");
        const res = await fetch(CFG.brainEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, context: "priyanshu-os" }) });
        const data = await res.json();
        return { spoken: data.answer || data.text || "", source: data.source || null, gesture: "talk" };
      } catch (e) { console.warn("[mascot] brain API failed, using local brain", e); }
    }
    return localBrain(text);
  }

  // ===========================================================================
  // TTS
  // ===========================================================================
  const synth = window.speechSynthesis || null;
  let voices = [], muted = false, currentAudio = null, speaking = false;
  function loadVoices() { if (synth) voices = synth.getVoices() || []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function pickVoice() {
    if (!voices.length) return null;
    const want = (CFG.voiceName || "").toLowerCase();
    if (want) { const v = voices.find((x) => x.name.toLowerCase().includes(want)); if (v) return v; }
    for (const p of ["google us english", "samantha", "microsoft aria", "microsoft jenny", "natural", "daniel"]) {
      const v = voices.find((x) => x.name.toLowerCase().includes(p));
      if (v) return v;
    }
    return voices.find((v) => /^en[-_]/i.test(v.lang)) || voices[0];
  }
  function stopSpeaking() {
    if (synth) synth.cancel();
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    speaking = false;
  }
  async function say(text, opts = {}) {
    if (!text) return;
    stopSpeaking();
    if (!opts.gestureOverride && !moving) setGesture(opts.gesture || "talk");
    else if (opts.gesture && !moving) setGesture(opts.gesture);
    showBubble({ you: opts.you, text, source: opts.source, sticky: false });

    const onDone = () => {
      speaking = false;
      if (convoActive) { setGesture("listen"); resumeRecognition(); armSleep(); }
      else if (!moving) setGesture("idle");
    };

    if (muted) { speaking = true; setTimeout(onDone, clamp(1200 + text.length * 42, 1200, 7000)); return; }

    if (CFG.ttsEndpoint) {
      try {
        pauseRecognition();
        const res = await fetch(CFG.ttsEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, voice: CFG.voiceName }) });
        const url = URL.createObjectURL(await res.blob());
        currentAudio = new Audio(url);
        speaking = true;
        currentAudio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onDone(); };
        await currentAudio.play();
        return;
      } catch (e) { console.warn("[mascot] TTS API failed, native voice", e); }
    }

    if (!synth) { speaking = true; setTimeout(onDone, clamp(1200 + text.length * 42, 1200, 7000)); return; }
    pauseRecognition(); // don't transcribe our own voice
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = (v && v.lang) || CFG.lang;
    u.rate = CFG.rate; u.pitch = CFG.pitch;
    u.onstart = () => { speaking = true; };
    u.onend = onDone;
    u.onerror = onDone;
    synth.speak(u);
  }

  // ===========================================================================
  // STT  — continuous, wake-word aware
  // ===========================================================================
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recog = null, micEnabled = false, recogRunning = false, recogPaused = false;

  function buildRecognizer() {
    if (!SR) return null;
    const r = new SR();
    r.lang = CFG.lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onstart = () => { recogRunning = true; };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        micEnabled = false; updateMicUI();
        showBubble({ text: "I need microphone permission to listen. You can still type with the keyboard button.", source: "→ tap the mic again after allowing", sticky: false });
      }
    };
    r.onend = () => {
      recogRunning = false;
      if (micEnabled && !recogPaused) setTimeout(startRecognition, 250); // keep it alive
    };
    r.onresult = (e) => {
      let interim = "", finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      if (convoActive && interim && !speaking) showBubble({ you: interim + "…", sticky: true });
      if (!finalText) return;
      const n = norm(finalText);
      const heardWake = CFG.wakeWords.some((w) => n.includes(w));
      if (!convoActive) {
        if (heardWake) wakeUp(finalText);
      } else {
        handleUtterance(finalText.trim());
      }
    };
    return r;
  }
  function startRecognition() {
    if (!SR || !micEnabled || recogRunning || recogPaused) return;
    if (!recog) recog = buildRecognizer();
    try { recog.start(); } catch (_) {}
  }
  function pauseRecognition() { recogPaused = true; if (recog && recogRunning) { try { recog.stop(); } catch (_) {} } }
  function resumeRecognition() { recogPaused = false; if (micEnabled) startRecognition(); }
  function startListening() { // explicit "listen now"
    if (!micEnabled) { enableMic(); return; }
    resumeRecognition();
    if (convoActive && !speaking) setGesture("listen");
  }

  function enableMic() {
    if (!SR) { openType(); return; }
    micEnabled = true;
    updateMicUI();
    startRecognition();
    showBubble({ text: "Voice is on — say “Hi Priyanshu” any time and I'll come over.", source: "→ press M to toggle", sticky: false });
  }
  function disableMic() { micEnabled = false; pauseRecognition(); recogPaused = false; updateMicUI(); }
  function updateMicUI() {
    micBtn.innerHTML = micEnabled ? ICON.mic : ICON.micoff;
    micBtn.classList.toggle("is-live", micEnabled);
    micBtn.setAttribute("aria-label", micEnabled ? "Voice on — tap to turn off" : "Enable voice and wake word");
  }

  // ===========================================================================
  // CONVERSATION
  // ===========================================================================
  let convoActive = false, sleepTimer = null, busy = false;

  function conversationSpot() {
    return { x: clamp(window.innerWidth - charW - 28, 20, window.innerWidth - charW - 8), y: groundY() };
  }
  function armSleep() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(goToSleep, CFG.sleepAfterMs);
  }
  function goToSleep() {
    if (!convoActive) return;
    convoActive = false;
    clearTimeout(sleepTimer);
    facing = 1;
    setGesture("idle");
    onSettle();
    wander();
  }

  function wakeUp(heard) {
    clearTimeout(wanderTimer);
    convoActive = true;
    perchEl = null;
    const spot = conversationSpot();
    facing = -1; // face inward toward the page content
    moving = true;
    target.x = spot.x; target.y = spot.y;
    // when it arrives, wave + intro
    const arriveCheck = setInterval(() => {
      if (Math.hypot(target.x - pos.x, target.y - pos.y) < 4) {
        clearInterval(arriveCheck);
        facing = 1;
        setGesture("wave");
        setTimeout(() => say(INTRO, { gesture: "talk", source: "→ ask me anything, or say “open work”" }), 650);
      }
    }, 80);
    // safety: if already basically there
    setTimeout(() => { if (convoActive && gesture !== "talk" && gesture !== "wave") { setGesture("wave"); say(INTRO, { gesture: "talk" }); } }, 1500);
    armSleep();
    if (micEnabled) resumeRecognition();
  }

  async function handleUtterance(text) {
    if (!text || busy) return;
    const n = norm(text);
    if (CFG.wakeWords.some((w) => n === w)) return; // ignore a bare wake word mid-convo
    busy = true;
    clearTimeout(sleepTimer);
    pauseRecognition();
    showBubble({ you: text, text: "…", sticky: true });
    const r = await think(text);
    if (r.action) { try { r.action(); } catch (e) { console.warn(e); } }
    say(r.spoken, { you: text, source: r.source, gesture: r.gesture || "talk" });
    busy = false;
  }

  // ===========================================================================
  // CONTROLS
  // ===========================================================================
  micBtn.addEventListener("click", () => { if (micEnabled) disableMic(); else enableMic(); });
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    if (muted) stopSpeaking();
    muteBtn.innerHTML = muted ? ICON.mute : ICON.sound;
    muteBtn.classList.toggle("is-off", muted);
    muteBtn.setAttribute("aria-label", muted ? "Unmute voice" : "Mute voice");
  });
  function openType() {
    const q = window.prompt("Ask the mascot about Priyanshu:");
    if (q && q.trim()) {
      if (!convoActive) wakeUp();
      setTimeout(() => handleUtterance(q.trim()), convoActive ? 0 : 1700);
    }
  }
  typeBtn.addEventListener("click", openType);

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key.toLowerCase() === "m") { e.preventDefault(); micEnabled ? disableMic() : enableMic(); }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { stopSpeaking(); pauseRecognition(); }
    else if (micEnabled) resumeRecognition();
  });

  if (!SR) {
    micBtn.innerHTML = ICON.keyboard;
    micBtn.setAttribute("aria-label", "Voice input unavailable — tap to type");
    micBtn.addEventListener("click", openType);
  }

  // public API (console / rest of site)
  window.PriyanshuMascot = {
    ask: (t) => { if (!convoActive) wakeUp(); setTimeout(() => handleUtterance(t), convoActive ? 0 : 1600); },
    say, wake: wakeUp, sleep: goToSleep, enableMic, gesture: setGesture, config: CFG,
  };
})();
