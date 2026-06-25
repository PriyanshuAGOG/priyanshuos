/* ============================================================================
   MASCOT — "Priyanshu, live" — free-roaming companion + realtime voice
   ----------------------------------------------------------------------------
   This is Priyanshu's personal portfolio, so the mascot IS Priyanshu: it
   speaks in the first person and the visitor is effectively talking to him.

   • No chrome — just the character and its speech. Tap the mascot to talk.
   • Free-roaming: it walks (real walk-cycle), sits on components, thinks when
     you pause on a section, and uses its whole gesture set.
   • Voice: tap once to grant the mic, then it listens continuously for
     "hi/hello Priyanshu" and holds a realtime conversation. Native path is
     zero-delay; sttEndpoint/brainEndpoint/ttsEndpoint hooks allow a premium
     swap later.

   Performance: one pinned, preloaded clip per gesture (no per-trigger
   fetch/decode churn) and the locomotion loop sleeps when nothing is moving.
   ========================================================================== */
(function () {
  "use strict";

  const CFG = Object.assign(
    {
      lang: "en-US", voiceName: null, rate: 1.05, pitch: 1.0,
      sttEndpoint: null, brainEndpoint: null, ttsEndpoint: null,
      wakeWords: ["priyanshu", "preyanshu", "priyansh", "hey mascot"],
      sleepAfterMs: 30000,
    },
    window.MASCOT_CONFIG || {}
  );

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------------------------------------------------------------- DOM (minimal)
  const root = el("div"); root.id = "mascot-root"; root.setAttribute("aria-live", "polite");
  const charEl = el("div", "m-char");
  charEl.setAttribute("role", "button");
  charEl.setAttribute("tabindex", "0");
  charEl.setAttribute("aria-label", "Talk to Priyanshu");
  const canvasWrap = el("div", "m-canvaswrap");
  const veil = el("div", "m-veil", '<div class="m-spin"></div>');
  charEl.append(canvasWrap, veil);
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
      videoBase: "videos/", pin: true, ambient: false, spontaneous: false, fx: false,
      onStateChange: () => {}, onSpeech: () => {},
    });
    mascot.ready.then(() => {
      veil.classList.add("hidden");
      if (mascot.preload) mascot.preload(); // warm all gestures for instant, judder-free switches
      startLife();
    });
  }

  // ---------------------------------------------------------------- locomotion
  const pos = { x: 60, y: 60 }, target = { x: 60, y: 60 };
  let facing = 1, perchEl = null, moving = false, charW = 130, charH = 188, raf = null;

  function measure() { const r = charEl.getBoundingClientRect(); if (r.width) { charW = r.width; charH = r.height; } }
  function groundY() { return window.innerHeight - charH * 0.98; }
  function perchPointFor(e) {
    const r = e.getBoundingClientRect();
    return {
      x: clamp(r.left + Math.min(r.width * 0.5, 64) - charW / 2, 6, window.innerWidth - charW - 6),
      y: clamp(r.top - charH * 0.86, 6, window.innerHeight - charH - 6),
    };
  }
  let pendingGesture = "idle";
  function goTo(x, y, opts = {}) {
    perchEl = opts.perch || null;
    target.x = clamp(x, 4, window.innerWidth - charW - 4);
    target.y = clamp(y, 4, window.innerHeight - charH - 4);
    pendingGesture = opts.gesture || "idle";
    ensureTick();
  }
  function ensureTick() { if (!raf) raf = requestAnimationFrame(tick); }

  function tick() {
    if (perchEl) {
      if (!document.contains(perchEl)) perchEl = null;
      else { const p = perchPointFor(perchEl); target.x = p.x; target.y = p.y; }
    }
    const dx = target.x - pos.x, dy = target.y - pos.y, dist = Math.hypot(dx, dy);
    let lean = 0;

    if (dist > 1.2) {
      const speed = clamp(dist * 0.085, 1.1, 7); // gentle ease-out, slow enough to read as walking
      pos.x += (dx / dist) * Math.min(speed, dist);
      pos.y += (dy / dist) * Math.min(speed, dist);
      if (Math.abs(dx) > 1.5) facing = dx > 0 ? 1 : -1;
      if (dist > 18) {
        if (!moving) { moving = true; charEl.classList.add("walking"); }
        charEl.classList.toggle("is-air", target.y < groundY() - 30);
        if (!convoActive) setGesture("idle"); // idle clip + CSS walk-cycle = walking
        lean = facing * 2;
      }
    } else if (moving) {
      moving = false; pos.x = target.x; pos.y = target.y;
      charEl.classList.remove("walking");
      if (!convoActive) setGesture(pendingGesture);
    }

    charEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${lean}deg) scaleX(${facing})`;
    positionBubble();

    // keep ticking only while there's something to animate (saves CPU at rest)
    if (moving || dist > 1.2) raf = requestAnimationFrame(tick);
    else raf = null;
  }

  function positionBubble() {
    if (!bubble.classList.contains("show")) return;
    const bx = clamp(pos.x + charW / 2, 120, window.innerWidth - 120), by = pos.y + 6;
    bubble.style.transform = `translate(${bx}px, ${by}px) translate(-50%,-100%)`;
  }

  // ---------------------------------------------------------------- ambient behaviour
  const PERCH_SEL = ".case, .node, .fcard, .bug, .col, .route-node, h2, .stamp";
  let wanderTimer = null, scrollStopTimer = null;

  function perchCandidate() {
    const inView = Array.from(document.querySelectorAll(PERCH_SEL)).filter((e) => {
      const r = e.getBoundingClientRect();
      return r.top > 40 && r.top < window.innerHeight * 0.7 && r.width > 60;
    });
    if (!inView.length) return null;
    inView.sort((a, b) => Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.32) -
                          Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.32));
    return inView[Math.floor(Math.random() * Math.min(3, inView.length))];
  }
  function onSettle() {
    if (convoActive || reduce) return;
    const c = perchCandidate();
    if (c) { const p = perchPointFor(c); goTo(p.x, p.y, { perch: c, gesture: pick(["sit", "think", "point", "listen", "sit", "think"]) }); }
    else goTo(clamp(pos.x, 40, window.innerWidth - charW - 40), groundY(), { gesture: "idle" });
  }
  function wander() {
    clearTimeout(wanderTimer);
    if (reduce) return;
    wanderTimer = setTimeout(() => {
      if (!convoActive && !moving && !perchEl) {
        goTo(40 + Math.random() * (window.innerWidth - charW - 80), groundY(), { gesture: Math.random() < 0.25 ? "groove" : "idle" });
      }
      wander();
    }, 11000 + Math.random() * 8000);
  }

  function startLife() {
    measure();
    pos.x = clamp(window.innerWidth - 190, 20, window.innerWidth - charW - 20);
    pos.y = groundY(); target.x = pos.x; target.y = pos.y;
    charEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(1)`;
    if (reduce) { setGesture("idle"); return; }

    setTimeout(() => setGesture("wave"), 700);
    setTimeout(() => say("Hey — I'm Priyanshu. Tap me and let's talk; I'll walk you through what I've built.", { gesture: "talk" }), 1400);

    window.addEventListener("scroll", () => {
      perchEl = null;
      if (!convoActive && !moving) setGesture("idle");
      ensureTick();
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(onSettle, 950);
    }, { passive: true });

    wander();
    setTimeout(onSettle, 3000);
  }

  window.addEventListener("resize", () => {
    measure();
    pos.x = clamp(pos.x, 4, window.innerWidth - charW - 4);
    pos.y = clamp(pos.y, 4, window.innerHeight - charH - 4);
    ensureTick();
  });

  charEl.addEventListener("mouseenter", () => { if (!convoActive && !moving) setGesture("point"); });
  charEl.addEventListener("mouseleave", () => { if (!convoActive && !moving && gesture === "point") setGesture("idle"); });
  charEl.addEventListener("click", onMascotTap);
  charEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onMascotTap(); } });

  function onMascotTap() {
    if (!micEnabled && SR) { enableMic(); return; }    // first tap grants the mic, then wakes
    if (!convoActive) wakeUp(); else startListening();
  }

  // ---------------------------------------------------------------- bubble
  let bubbleT = null;
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

  // first-person knowledge base — keyword-scored
  const KB = [
    { k: ["who", "you", "yourself", "about you", "introduce", "tell me about"], a: "I'm Priyanshu — a builder-operator from Jaipur. I work across apps, websites, AI workflows, founder-office systems and community ops. My one rule: turn chaos into systems, and back what I say with proof.", s: "→ that's me, honestly", g: "talk" },
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
    if (/\b(stop|quiet|shush|enough)\b/.test(n)) { stopSpeaking(); return { spoken: "Alright, I'll pause.", g: "idle" }; }
    if (/\b(bye|goodbye|sleep|that s all|thats all|see you)\b/.test(n)) { goToSleep(); return { spoken: "Catch you later — I'll be around the page.", g: "wave" }; }
    if (/\b(thanks|thank you|cool|nice|awesome|great|love it)\b/.test(n)) return { spoken: pick(["Anytime!", "Glad that helped.", "Appreciate it."]), g: "wave" };
    if (/\b(hi|hii|hey|hello|yo|sup)\b/.test(n) && n.split(" ").length <= 3) return { spoken: "Hey! Good to meet you. Ask me what I've built, what broke, or how I work.", g: "wave" };
    if (/\b(help|what can you do|commands)\b/.test(n)) return { spoken: "Ask me about my projects, stack, failures, story or AI workflow. Or tell me to do things: “open work”, “show Nirog Bhumi”, “switch to recruiter mode”, “go to contact”.", g: "talk" };

    if (/\bcopy\b/.test(n) && /\bemail\b/.test(n)) return { spoken: "Done — I copied my email to your clipboard.", s: "→ hello@priyanshu.os", g: "point", action: () => navigator.clipboard && navigator.clipboard.writeText("hello@priyanshu.os") };
    const mode = MODES.find((m) => n.includes(m));
    if (mode && /\b(mode|switch|turn|go)\b/.test(n)) return { spoken: `Sure — switching to ${mode} mode.`, s: "→ accent + framing updated", g: "point", action: () => window.setMode && window.setMode(mode) };
    if (/\b(open|go|scroll|show|take me|navigate|jump|see)\b/.test(n)) {
      for (const key in SECTIONS) if (n.includes(key)) { const id = SECTIONS[key]; return { spoken: `Taking you to ${key}.`, s: "→ scrolling", g: "point", action: () => { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); } }; }
    }

    // score the knowledge base
    let best = null, score = 0;
    for (const item of KB) { let s = 0; for (const kw of item.k) if (n.includes(kw)) s += kw.includes(" ") ? 2 : 1; if (s > score) { score = s; best = item; } }
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

  // ---------------------------------------------------------------- STT (continuous, wake-word)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recog = null, micEnabled = false, recogRunning = false, recogPaused = false;
  function buildRecognizer() {
    if (!SR) return null;
    const r = new SR(); r.lang = CFG.lang; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onstart = () => { recogRunning = true; };
    r.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { micEnabled = false; charEl.classList.remove("is-live"); showBubble({ text: "I need mic permission to hear you — allow it and tap me again. (You can keep reading either way.)", sticky: false }); } };
    r.onend = () => { recogRunning = false; if (micEnabled && !recogPaused) setTimeout(startRecognition, 250); };
    r.onresult = (e) => {
      let interim = "", finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) finalText += t; else interim += t; }
      if (convoActive && interim && !speaking) showBubble({ you: interim + "…", sticky: true });
      if (!finalText) return;
      const n = norm(finalText);
      if (!convoActive) { if (CFG.wakeWords.some((w) => n.includes(w))) wakeUp(); }
      else handleUtterance(finalText.trim());
    };
    return r;
  }
  function startRecognition() { if (!SR || !micEnabled || recogRunning || recogPaused) return; if (!recog) recog = buildRecognizer(); try { recog.start(); } catch (_) {} }
  function pauseRecognition() { recogPaused = true; if (recog && recogRunning) { try { recog.stop(); } catch (_) {} } }
  function resumeRecognition() { recogPaused = false; if (micEnabled) startRecognition(); }
  function startListening() { if (!micEnabled) { enableMic(); return; } resumeRecognition(); if (convoActive && !speaking) setGesture("listen"); }
  function enableMic() {
    if (!SR) { wakeUp(); openType(); return; }
    micEnabled = true; charEl.classList.add("is-live"); startRecognition();
    wakeUp();
  }

  // ---------------------------------------------------------------- conversation
  let convoActive = false, sleepTimer = null, busy = false;
  function conversationSpot() { return { x: clamp(window.innerWidth - charW - 30, 20, window.innerWidth - charW - 8), y: groundY() }; }
  function armSleep() { clearTimeout(sleepTimer); sleepTimer = setTimeout(goToSleep, CFG.sleepAfterMs); }
  function goToSleep() { if (!convoActive) return; convoActive = false; clearTimeout(sleepTimer); facing = 1; charEl.classList.toggle("is-live", micEnabled); setGesture("idle"); onSettle(); wander(); }

  function wakeUp() {
    clearTimeout(wanderTimer);
    convoActive = true; perchEl = null;
    const spot = conversationSpot();
    facing = 1; moving = true; target.x = spot.x; target.y = spot.y; ensureTick();
    const arrive = setInterval(() => {
      if (Math.hypot(target.x - pos.x, target.y - pos.y) < 4) {
        clearInterval(arrive); setGesture("wave");
        setTimeout(() => say(INTRO, { gesture: "talk", source: "→ ask me anything, or say “open work”" }), 700);
      }
    }, 80);
    setTimeout(() => { if (convoActive && gesture !== "talk" && gesture !== "wave") { setGesture("wave"); say(INTRO, { gesture: "talk" }); } }, 1800);
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

  function openType() { const q = window.prompt("Ask Priyanshu:"); if (q && q.trim()) { if (!convoActive) wakeUp(); setTimeout(() => handleUtterance(q.trim()), convoActive ? 0 : 1900); } }

  document.addEventListener("visibilitychange", () => { if (document.hidden) { stopSpeaking(); pauseRecognition(); } else if (micEnabled) resumeRecognition(); });

  window.PriyanshuMascot = {
    ask: (t) => { if (!convoActive) wakeUp(); setTimeout(() => handleUtterance(t), convoActive ? 0 : 1800); },
    say, wake: wakeUp, sleep: goToSleep, enableMic, gesture: setGesture, config: CFG,
  };
})();
