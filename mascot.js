/* ============================================================================
   MASCOT INTEGRATION + HYBRID REALTIME VOICE ENGINE  —  Priyanshu OS
   ----------------------------------------------------------------------------
   Mounts the chroma-keyed video mascot (mascot-engine.js) as a floating
   companion and wires it to a realtime voice loop:

     listen (mic)  →  understand  →  talk (speak + animate)  →  idle

   HYBRID by design:
     • Native path (default): browser SpeechRecognition + speechSynthesis.
       Zero backend, zero API keys, near-zero latency — recognition is
       streamed locally and the reply starts speaking the instant the brain
       resolves (which is synchronous for on-site answers).
     • API path (drop-in): set window.MASCOT_CONFIG.{sttEndpoint,brainEndpoint,
       ttsEndpoint} to swap any stage for a premium service later. The state
       machine, UI and barge-in all stay identical.

   The brain reuses the site's own answerFor()/ANSWERS so spoken answers match
   the written ones exactly, and understands navigation commands so the mascot
   can actually drive the page by voice.
   ========================================================================== */
(function () {
  "use strict";

  // ---- configuration (all optional; native fallbacks used when unset) -------
  const CFG = Object.assign(
    {
      lang: "en-US",
      voiceName: null,        // preferred TTS voice name substring, e.g. "Google US English"
      rate: 1.04,             // speech rate
      pitch: 1.0,
      sttEndpoint: null,      // POST audio → {text}    (premium STT)  — optional
      brainEndpoint: null,    // POST {text} → {answer,source?} (LLM)  — optional
      ttsEndpoint: null,      // POST {text} → audio blob (premium TTS)— optional
      greet: true,            // wave + greeting on first reveal
      autoListenAfterReply: false,
    },
    window.MASCOT_CONFIG || {}
  );

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- tiny helpers ---------------------------------------------------------
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const norm = (s) =>
    (typeof window.norm === "function"
      ? window.norm(s)
      : String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim());

  // ===========================================================================
  // 1. BUILD THE UI
  // ===========================================================================
  const root = el("div");
  root.id = "mascot-root";
  root.setAttribute("aria-live", "polite");

  const bubble = el("div", "m-bubble");
  const bar = el("div", "m-bar");
  const stage = el("div", "m-stage is-idle");
  stage.setAttribute("role", "button");
  stage.setAttribute("aria-label", "Talk to the mascot");

  const glow = el("div", "m-glow");
  const mount = el("div", "m-mount");
  const statePill = el("div", "m-statepill", 'MASCOT · <b id="mStateLabel">IDLE</b>');
  const collapseBtn = el("button", "m-collapse", "−");
  collapseBtn.setAttribute("aria-label", "Hide mascot");
  const veil = el("div", "m-veil", '<div class="m-spin"></div>');

  stage.append(glow, mount, statePill, collapseBtn, veil);

  const ICON = {
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>',
  };
  const micBtn = el("button", "m-btn m-mic", ICON.mic);
  micBtn.setAttribute("aria-label", "Push to talk");
  const muteBtn = el("button", "m-btn", ICON.sound);
  muteBtn.setAttribute("aria-label", "Mute voice");
  const typeBtn = el("button", "m-btn", ICON.keyboard);
  typeBtn.setAttribute("aria-label", "Type a question");
  const hint = el("div", "m-hint", "Hold to talk");
  bar.append(hint, typeBtn, muteBtn, micBtn);

  const launch = el("button", "m-launch", ICON.chat);
  launch.setAttribute("aria-label", "Open mascot");

  root.append(bubble, stage, bar, launch);
  document.body.appendChild(root);

  // ===========================================================================
  // 2. MOUNT THE MASCOT ENGINE
  // ===========================================================================
  let mascot = null;
  let currentState = "idle";

  function setStageState(state) {
    currentState = state;
    stage.classList.remove("is-idle", "is-listen", "is-talk", "is-think");
    stage.classList.add("is-" + (["listen", "talk", "think"].includes(state) ? state : "idle"));
    const lbl = document.getElementById("mStateLabel");
    if (lbl) lbl.textContent = state.toUpperCase();
  }

  if (!window.MascotEngine || !window.MascotEngine.createMascot) {
    console.error("[mascot] mascot-engine.js not loaded");
    veil.classList.add("hidden");
  } else {
    mascot = window.MascotEngine.createMascot(mount, {
      videoBase: "videos/",
      ambient: !reduce,
      spontaneous: false, // a corner companion shouldn't shout for attention
      fx: false,
      onStateChange: setStageState,
      onSpeech: () => {}, // we drive speech ourselves through the voice engine
    });
    mascot.ready.then(() => {
      veil.classList.add("hidden");
      if (CFG.greet && !reduce) {
        // greet once the mascot is on-screen
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              io.disconnect();
              setTimeout(greet, 400);
            }
          });
        });
        io.observe(stage);
      }
    });
  }

  function play(state) {
    if (mascot) mascot.trigger(state, false);
    else setStageState(state);
  }

  // ===========================================================================
  // 3. SPEECH BUBBLE
  // ===========================================================================
  let bubbleT = null;
  function showBubble({ you, text, source, sticky }) {
    clearTimeout(bubbleT);
    bubble.innerHTML =
      (you ? `<div class="m-you">You said</div><div class="m-caption">“${esc(you)}”</div>` : "") +
      (text ? `<div class="m-ans">${esc(text)}</div>` : "") +
      (source ? `<div class="m-bsrc">${esc(source)}</div>` : "");
    bubble.classList.add("show");
    if (!sticky) {
      const dur = Math.min(9000, 2600 + (text ? text.length * 45 : 0));
      bubbleT = setTimeout(() => bubble.classList.remove("show"), dur);
    }
  }
  function hideBubble() {
    clearTimeout(bubbleT);
    bubble.classList.remove("show");
  }
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ===========================================================================
  // 4. THE BRAIN  — site answers + voice commands, with optional API override
  // ===========================================================================
  const SECTIONS = {
    home: "home", top: "home", start: "home", intro: "home",
    brain: "brain", zones: "brain",
    work: "work", proof: "work", projects: "work", cases: "work", "case files": "work", "evidence": "work",
    story: "story", route: "story", journey: "story", path: "story",
    ai: "ai", lab: "ai", workflow: "ai",
    now: "now", current: "now", "building now": "now",
    contact: "contact", signal: "contact", hire: "contact", "get in touch": "contact",
    broke: "broke", failures: "broke", "things that broke": "broke", bugs: "broke", postmortem: "broke",
  };
  const MODES = ["founder", "builder", "recruiter", "story", "chaos"];

  // Returns { spoken, source, action } — action runs *after* the reply is shown.
  function localBrain(text) {
    const n = norm(text);

    // barge / control
    if (/\b(stop|quiet|shut up|enough|cancel)\b/.test(n)) {
      stopSpeaking();
      return { spoken: "Okay, I'll stop.", source: null };
    }

    // greetings / smalltalk
    if (/^(hi|hey|hello|yo|hola|namaste|sup)\b/.test(n)) {
      return { spoken: pick([
        "Hey! I'm Priyanshu's mascot. Ask me what he built, what broke, or how he uses AI.",
        "Hello! Want the quick tour, or should I answer something specific about Priyanshu?",
      ]), source: "→ try: what has he built?" };
    }
    if (/\b(thank|thanks|cool|nice|awesome)\b/.test(n)) {
      return { spoken: pick(["Anytime!", "Glad that helped.", "You got it."]), source: null };
    }
    if (/\b(who are you|what are you|your name)\b/.test(n)) {
      return { spoken: "I'm the Priyanshu OS mascot — a voice guide to his proof of work. Ask away, or say things like 'open work' or 'switch to founder mode'.", source: null };
    }
    if (/\b(help|what can you do|commands)\b/.test(n)) {
      return { spoken: "You can ask about Priyanshu's projects, stack, failures, story, or AI workflow. Or command me: 'open work', 'show Nirog Bhumi', 'switch to recruiter mode', 'go to contact', 'copy email'.", source: null };
    }

    // copy email
    if (/\bcopy (the )?email\b/.test(n) || /\bemail\b/.test(n) && /\bcopy|grab\b/.test(n)) {
      return {
        spoken: "Copied his email to your clipboard.",
        source: "→ hello@priyanshu.os",
        action: () => navigator.clipboard && navigator.clipboard.writeText("hello@priyanshu.os"),
      };
    }

    // switch mode
    const mode = MODES.find((m) => n.includes(m));
    if (mode && /\b(mode|switch|turn|go)\b/.test(n)) {
      return {
        spoken: `Switching to ${mode} mode.`,
        source: "→ accent + framing updated",
        action: () => typeof window.setMode === "function" && window.setMode(mode),
      };
    }

    // open a case file / drawer
    if (/\b(open|show|see)\b/.test(n)) {
      if (/\bstudent\b/.test(n)) return drawer("student", "Student Social");
      if (/\bnirog|bhumi\b/.test(n)) return drawer("nirog", "Nirog Bhumi");
      if (/\bhack/.test(n)) return drawer("hack", "the hackathon build");
      if (/\bwoo|client|agency|commerce\b/.test(n)) return drawer("agency", "the client WooCommerce build");
    }

    // navigation to a section
    if (/\b(open|go|scroll|show|take me|navigate|jump)\b/.test(n)) {
      for (const key in SECTIONS) {
        if (n.includes(key)) {
          const id = SECTIONS[key];
          return {
            spoken: `Taking you to ${key}.`,
            source: "→ scrolling",
            action: () => scrollTo(id),
          };
        }
      }
    }

    // fall through to the site's own knowledge base (keeps answers identical
    // to the written "Ask about Priyanshu" feature)
    if (typeof window.answerFor === "function") {
      const r = window.answerFor(text);
      return { spoken: r.a, source: r.s };
    }
    return {
      spoken: "I can answer about Student Social, Nirog Bhumi, his AI workflow, hackathons, his stack, or what he's building now. What would you like to know?",
      source: "→ honest by default. No fake metrics.",
    };
  }

  function drawer(id, label) {
    return {
      spoken: `Opening the ${label} case file.`,
      source: "→ proof, not claims",
      action: () => typeof window.openDrawer === "function" && window.openDrawer(id),
    };
  }
  function scrollTo(id) {
    const t = document.getElementById(id);
    if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // Async wrapper so an API brain can be dropped in transparently.
  async function think(text) {
    if (CFG.brainEndpoint) {
      try {
        play("think");
        const res = await fetch(CFG.brainEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, context: "priyanshu-os" }),
        });
        const data = await res.json();
        return { spoken: data.answer || data.text || "", source: data.source || null, action: null };
      } catch (err) {
        console.warn("[mascot] brain API failed, using local brain", err);
      }
    }
    return localBrain(text);
  }

  // ===========================================================================
  // 5. TEXT-TO-SPEECH  (native speechSynthesis, or premium ttsEndpoint)
  // ===========================================================================
  const synth = window.speechSynthesis || null;
  let voices = [];
  let muted = false;
  let currentAudio = null;

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices() || [];
  }
  if (synth) {
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }
  function pickVoice() {
    if (!voices.length) return null;
    const want = (CFG.voiceName || "").toLowerCase();
    const byName = want && voices.find((v) => v.name.toLowerCase().includes(want));
    if (byName) return byName;
    // prefer a natural-sounding English voice
    const prefs = ["google us english", "samantha", "microsoft aria", "microsoft jenny", "natural"];
    for (const p of prefs) {
      const v = voices.find((x) => x.name.toLowerCase().includes(p));
      if (v) return v;
    }
    return voices.find((v) => /^en[-_]/i.test(v.lang)) || voices[0];
  }

  function stopSpeaking() {
    if (synth) synth.cancel();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (currentState === "talk") play("idle");
  }

  async function speak(text) {
    if (!text) return;
    stopSpeaking();
    if (muted) {
      play("talk");
      setTimeout(() => currentState === "talk" && play("idle"), Math.min(6000, 1200 + text.length * 45));
      return;
    }

    // premium TTS path (optional)
    if (CFG.ttsEndpoint) {
      try {
        const res = await fetch(CFG.ttsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: CFG.voiceName }),
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        play("talk");
        currentAudio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudio = null;
          if (currentState === "talk") play("idle");
          if (CFG.autoListenAfterReply) startListening();
        };
        await currentAudio.play();
        return;
      } catch (err) {
        console.warn("[mascot] TTS API failed, using native voice", err);
      }
    }

    // native path — starts essentially instantly
    if (!synth) {
      play("talk");
      setTimeout(() => currentState === "talk" && play("idle"), 1200 + text.length * 45);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = (v && v.lang) || CFG.lang;
    u.rate = CFG.rate;
    u.pitch = CFG.pitch;
    u.onstart = () => play("talk");
    u.onend = () => {
      if (currentState === "talk") play("idle");
      if (CFG.autoListenAfterReply) startListening();
    };
    u.onerror = () => {
      if (currentState === "talk") play("idle");
    };
    synth.speak(u);
  }

  // ===========================================================================
  // 6. SPEECH-TO-TEXT  (native SpeechRecognition, or premium sttEndpoint)
  // ===========================================================================
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recog = null;
  let listening = false;

  function buildRecognizer() {
    if (!SR) return null;
    const r = new SR();
    r.lang = CFG.lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;

    r.onstart = () => {
      listening = true;
      micBtn.classList.add("is-on");
      micBtn.innerHTML = ICON.stop;
      play("listen");
      showBubble({ text: "Listening…", sticky: true });
    };
    r.onresult = (e) => {
      let interim = "", finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (interim) showBubble({ text: interim + "…", sticky: true });
      if (finalText) handleUtterance(finalText.trim());
    };
    r.onerror = (e) => {
      listening = false;
      micBtn.classList.remove("is-on");
      micBtn.innerHTML = ICON.mic;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        showBubble({ text: "I need microphone permission to listen. You can also type to me with the keyboard button.", source: "→ click 🎤 again after allowing" });
        play("idle");
      } else if (e.error === "no-speech") {
        showBubble({ text: "I didn't catch that — try again?", sticky: false });
        play("idle");
      } else {
        play("idle");
      }
    };
    r.onend = () => {
      listening = false;
      micBtn.classList.remove("is-on");
      micBtn.innerHTML = ICON.mic;
      if (currentState === "listen") play("idle");
    };
    return r;
  }

  function startListening() {
    if (listening) return;
    stopSpeaking(); // barge-in: stop any current reply before listening
    if (!SR) {
      openTypeFallback();
      return;
    }
    if (!recog) recog = buildRecognizer();
    try {
      recog.start();
    } catch (_) {
      /* already started */
    }
  }
  function stopListening() {
    if (recog && listening) {
      try { recog.stop(); } catch (_) {}
    }
  }

  // ===========================================================================
  // 7. THE LOOP  — understand → reply → speak
  // ===========================================================================
  let busy = false;
  async function handleUtterance(text) {
    if (!text || busy) return;
    busy = true;
    stopListening();
    showBubble({ you: text, text: "…", sticky: true });
    const r = await think(text);
    showBubble({ you: text, text: r.spoken, source: r.source, sticky: false });
    // run any side-effect (navigation / mode / drawer) as we start speaking
    if (r.action) {
      try { r.action(); } catch (e) { console.warn(e); }
    }
    speak(r.spoken);
    busy = false;
  }

  function greet() {
    play("wave");
    const line = pick([
      "Hi! I'm Priyanshu's mascot. Tap the mic and ask me anything about him.",
      "Hey there! Want to know what Priyanshu built, broke, and shipped? Just ask.",
    ]);
    showBubble({ text: line, source: "→ tap 🎤 or the keyboard to type" });
    speak(line);
  }

  // ===========================================================================
  // 8. CONTROLS / EVENTS
  // ===========================================================================
  // push-to-talk: hold the mic (pointer) OR click to toggle
  let holdTimer = null, heldDown = false;
  micBtn.addEventListener("pointerdown", () => {
    heldDown = true;
    holdTimer = setTimeout(() => { if (heldDown && !listening) startListening(); }, 140);
  });
  const releaseMic = () => {
    clearTimeout(holdTimer);
    if (heldDown) {
      heldDown = false;
      // short tap toggles; long hold already started → stop on release
      if (listening) stopListening();
      else startListening();
    }
  };
  micBtn.addEventListener("pointerup", releaseMic);
  micBtn.addEventListener("pointerleave", () => { heldDown = false; clearTimeout(holdTimer); });
  micBtn.addEventListener("click", (e) => e.preventDefault());

  // tapping the mascot itself = start a conversation
  stage.addEventListener("click", (e) => {
    if (e.target === collapseBtn) return;
    if (listening) stopListening();
    else startListening();
  });

  // mute toggle
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    if (muted) stopSpeaking();
    muteBtn.innerHTML = muted ? ICON.mute : ICON.sound;
    muteBtn.classList.toggle("is-off", muted);
    muteBtn.setAttribute("aria-label", muted ? "Unmute voice" : "Mute voice");
  });

  // type fallback (also nice for noisy rooms / unsupported browsers)
  function openTypeFallback() {
    const q = window.prompt("Ask the mascot about Priyanshu:");
    if (q && q.trim()) handleUtterance(q.trim());
  }
  typeBtn.addEventListener("click", openTypeFallback);

  // collapse / expand
  collapseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    stopSpeaking();
    stopListening();
    hideBubble();
    root.classList.add("collapsed");
  });
  launch.addEventListener("click", () => {
    root.classList.remove("collapsed");
    if (mascot) mascot.trigger("wave", false);
  });

  // keyboard: press "M" to talk (when not typing in a field)
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "m" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (root.classList.contains("collapsed")) return;
      e.preventDefault();
      if (listening) stopListening();
      else startListening();
    }
  });

  // stop voice if the tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { stopSpeaking(); stopListening(); }
  });

  // If STT is unavailable, relabel the mic so the affordance is honest.
  if (!SR) {
    hint.textContent = "Type to ask";
    micBtn.setAttribute("aria-label", "Type a question (voice input unavailable in this browser)");
  }

  // expose a tiny API for the rest of the site / console
  window.PriyanshuMascot = {
    ask: handleUtterance,
    say: speak,
    listen: startListening,
    play,
    config: CFG,
  };
})();
