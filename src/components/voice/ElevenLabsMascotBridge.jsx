import { useEffect, useRef } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_1401kw6hdp9gfnssm486zamz7f9d';
const GREETING = 'Heyo! Welcome to Priyanshu OS — I\'m Priyanshu. Ask me anything, or just look around.';
const ALLOW_OVERRIDES = import.meta.env.VITE_ELEVENLABS_ALLOW_OVERRIDES === 'true';
const ALLOW_PUBLIC_FALLBACK = import.meta.env.VITE_ELEVENLABS_PUBLIC_FALLBACK === 'true';

const log = (...args) => console.info('[voice]', ...args);

async function fetchConversationToken() {
  const response = await fetch('/api/elevenlabs-token', {
    method: 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) throw new Error(`token endpoint ${response.status}`);
  if (!contentType.includes('application/json')) throw new Error('token endpoint did not return JSON');
  const data = await response.json();
  if (!data.token) throw new Error('token response missing token');
  return data.token;
}

const safeScroll = (id) => {
  const el = document.getElementById(id);
  if (!el) return `Section ${id} is not available`;
  el.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  window.PriyanshuMascot?.gesture?.('point');
  return `Opened ${id}`;
};

const sectionAliases = {
  home: 'home', brain: 'brain', work: 'work', projects: 'work', story: 'story',
  broke: 'broke', failures: 'broke', ai: 'ai', now: 'now', current: 'now',
  lab: 'lab', contact: 'contact',
};

function maybeHandleUserCommand(message) {
  const role = String(message?.source || message?.role || '').toLowerCase();
  if (role !== 'user') return;
  const raw = message?.message || message?.text || message?.sourceText || message?.transcript;
  if (!raw) return;
  const text = String(raw).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (/\b(show|open|go|scroll|take me|navigate|jump)\b/.test(text)) {
    if (/student\s+social|student project/.test(text)) { window.openDrawer?.('student'); window.PriyanshuMascot?.gesture?.('point'); return; }
    if (/nirog\s+bhumi|nirog/.test(text)) { window.openDrawer?.('nirog'); window.PriyanshuMascot?.gesture?.('point'); return; }
    for (const [alias, id] of Object.entries(sectionAliases)) {
      if (new RegExp(`\\b${alias}\\b`).test(text)) { safeScroll(id); return; }
    }
  }

  const mode = ['founder', 'builder', 'recruiter', 'story', 'chaos'].find((m) => text.includes(m));
  if (mode && /\b(mode|switch|change|turn)\b/.test(text)) window.setMode?.(mode);
}

function createClientTools() {
  return {
    navigate_portfolio: ({ section } = {}) => {
      const key = String(section || '').toLowerCase().trim();
      const id = sectionAliases[key];
      return id ? safeScroll(id) : `Unknown section: ${key}`;
    },
    show_project: ({ project } = {}) => {
      const key = String(project || '').toLowerCase();
      if (key.includes('student')) {
        window.openDrawer?.('student');
        window.PriyanshuMascot?.gesture?.('point');
        return 'Opened Student Social';
      }
      if (key.includes('nirog')) {
        window.openDrawer?.('nirog');
        window.PriyanshuMascot?.gesture?.('point');
        return 'Opened Nirog Bhumi';
      }
      safeScroll('work');
      return 'Opened the work section';
    },
    set_portfolio_mode: ({ mode } = {}) => {
      const allowed = new Set(['founder', 'builder', 'recruiter', 'story', 'chaos']);
      const key = String(mode || '').toLowerCase();
      if (!allowed.has(key)) return `Unsupported mode: ${key}`;
      window.setMode?.(key);
      return `Switched to ${key} mode`;
    },
    avatar_gesture: ({ gesture } = {}) => {
      const allowed = new Set(['idle', 'wave', 'highfive', 'walk', 'point', 'sit', 'think', 'listen', 'talk', 'groove']);
      const key = String(gesture || '').toLowerCase();
      if (!allowed.has(key)) return `Unsupported gesture: ${key}`;
      window.PriyanshuMascot?.gesture?.(key);
      return `Avatar gesture: ${key}`;
    },
  };
}

function MascotBridge() {
  const conversation = useConversation({
    clientTools: createClientTools(),
    onConnect: () => window.PriyanshuMascot?.elevenlabs?.onConnect?.(),
    onDisconnect: (details) => window.PriyanshuMascot?.elevenlabs?.onDisconnect?.(details),
    onMessage: (message) => { maybeHandleUserCommand(message); window.PriyanshuMascot?.elevenlabs?.onMessage?.(message); },
    onError: (error) => window.PriyanshuMascot?.elevenlabs?.onError?.(error),
    onModeChange: (mode) => window.PriyanshuMascot?.elevenlabs?.onModeChange?.(mode),
    onStatusChange: (status) => window.PriyanshuMascot?.elevenlabs?.onStatusChange?.(status),
    onVadScore: (score) => window.PriyanshuMascot?.elevenlabs?.onVadScore?.(score),
    onAudioAlignment: (alignment) => window.PriyanshuMascot?.elevenlabs?.onAudioAlignment?.(alignment),
  });

  const convoRef = useRef(conversation);
  convoRef.current = conversation;

  const bridgeRef = useRef(null);
  if (!bridgeRef.current) {
    let starting = false;
    const sessionExtras = () => (ALLOW_OVERRIDES ? { overrides: { agent: { firstMessage: GREETING } } } : {});

    async function connectSecurely() {
      const extras = sessionExtras();
      const conversationToken = await fetchConversationToken();
      log('trying webrtc + server token');
      await convoRef.current.startSession({ ...extras, conversationToken, connectionType: 'webrtc' });
      return 'webrtc+token';
    }

    async function connectPublicFallback() {
      if (!ALLOW_PUBLIC_FALLBACK) throw new Error('public agent fallback disabled');
      const extras = sessionExtras();
      try {
        log('trying public webrtc fallback');
        await convoRef.current.startSession({ ...extras, agentId: AGENT_ID, connectionType: 'webrtc' });
        return 'webrtc+agentId';
      } catch (webrtcError) {
        log('public webrtc unavailable →', webrtcError?.message || webrtcError);
        await convoRef.current.startSession({ ...extras, agentId: AGENT_ID, connectionType: 'websocket' });
        return 'websocket+agentId';
      }
    }

    bridgeRef.current = {
      get status() { return convoRef.current.status; },
      get isSpeaking() { return convoRef.current.isSpeaking; },
      get isListening() { return convoRef.current.isListening; },
      async start() {
        const status = convoRef.current.status;
        if (starting || status === 'connected' || status === 'connecting') return;
        starting = true;
        try {
          window.PriyanshuMascot?.elevenlabs?.onStarting?.();
          if (!navigator.mediaDevices?.getUserMedia) throw new Error('microphone API unavailable');
          const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          permissionStream.getTracks().forEach(track => track.stop());
          let transport;
          try {
            transport = await connectSecurely();
          } catch (secureError) {
            log('secure token connection unavailable →', secureError?.message || secureError);
            transport = await connectPublicFallback();
          }
          log('session opened via', transport);
        } catch (error) {
          log('voice connection failed →', error?.message || error);
          throw error;
        } finally {
          starting = false;
        }
      },
      stop() { try { convoRef.current.endSession(); } catch (_) {} },
      sendText(text) { try { convoRef.current.sendUserMessage(text); } catch (_) {} },
      sendContext(text) { try { convoRef.current.sendContextualUpdate(text); } catch (_) {} },
      setVolume(volume) { try { convoRef.current.setVolume({ volume }); } catch (_) {} },
    };
  }

  useEffect(() => {
    const bridge = bridgeRef.current;
    window.ElevenLabsMascotBridge = bridge;
    window.PriyanshuMascot?.elevenlabs?.onBridgeReady?.();

    const onUnhandled = (event) => {
      const reason = event.reason;
      const msg = reason && (reason.message || String(reason));
      if (msg && /error_type/.test(msg) && /undefined/.test(msg)) {
        console.warn('[voice] suppressed known ElevenLabs SDK error-event parse fault:', msg);
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', onUnhandled);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandled);
      if (window.ElevenLabsMascotBridge === bridge) delete window.ElevenLabsMascotBridge;
      try { convoRef.current?.endSession?.(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    window.PriyanshuMascot?.elevenlabs?.onSpeakingChange?.(conversation.isSpeaking);
    window.PriyanshuAvatar3D?.setSpeaking?.(conversation.isSpeaking);
  }, [conversation.isSpeaking]);

  useEffect(() => {
    window.PriyanshuMascot?.elevenlabs?.onListeningChange?.(conversation.isListening);
    window.PriyanshuAvatar3D?.setListening?.(conversation.isListening);
  }, [conversation.isListening]);

  useEffect(() => {
    if (conversation.status !== 'connected') {
      window.PriyanshuAvatar3D?.setAudioLevel?.(0);
      window.PriyanshuAvatar3D?.setInputLevel?.(0);
      window.PriyanshuAvatar3D?.setSpeaking?.(false);
      window.PriyanshuAvatar3D?.setListening?.(false);
      return undefined;
    }
    let raf = 0;
    let last = 0;
    const sample = (now) => {
      if (now - last >= 33) {
        last = now;
        let output = 0;
        let input = 0;
        try { output = Number(convoRef.current.getOutputVolume?.() || 0); } catch (_) {}
        try { input = Number(convoRef.current.getInputVolume?.() || 0); } catch (_) {}
        window.PriyanshuMascot?.elevenlabs?.onAudioLevel?.(output);
        window.PriyanshuMascot?.elevenlabs?.onInputLevel?.(input);
        window.PriyanshuAvatar3D?.setAudioLevel?.(output);
        window.PriyanshuAvatar3D?.setInputLevel?.(input);
      }
      raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [conversation.status]);

  return null;
}

export default function ElevenLabsMascotBridge() {
  return (
    <ConversationProvider>
      <MascotBridge />
    </ConversationProvider>
  );
}
