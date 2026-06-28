import { useEffect, useRef } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_1401kw6hdp9gfnssm486zamz7f9d';
const GREETING = 'Heyo! Welcome to Priyanshu OS — I\'m Priyanshu. Ask me anything, or just look around.';
// ElevenLabs rejects conversation config overrides unless the agent has them
// explicitly enabled in its security settings — and that rejection comes back as
// a malformed error event that crashes the SDK. So we only send the firstMessage
// override when the deployment opts in; otherwise the greeting is configured on
// the agent itself in the dashboard.
const ALLOW_OVERRIDES = import.meta.env.VITE_ELEVENLABS_ALLOW_OVERRIDES === 'true';

const log = (...args) => console.info('[voice]', ...args);

async function fetchConversationToken() {
  const response = await fetch(`/api/elevenlabs-token?agent_id=${encodeURIComponent(AGENT_ID)}`);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) throw new Error(`token endpoint ${response.status}`);
  if (!contentType.includes('application/json')) throw new Error('token endpoint did not return JSON (no serverless function?)');
  const data = await response.json();
  if (!data.token) throw new Error('token response missing token');
  return data.token;
}

function MascotBridge() {
  const conversation = useConversation({
    onConnect: () => window.PriyanshuMascot?.elevenlabs?.onConnect?.(),
    onDisconnect: (details) => window.PriyanshuMascot?.elevenlabs?.onDisconnect?.(details),
    onMessage: (message) => window.PriyanshuMascot?.elevenlabs?.onMessage?.(message),
    onError: (error) => window.PriyanshuMascot?.elevenlabs?.onError?.(error),
    onModeChange: (mode) => window.PriyanshuMascot?.elevenlabs?.onModeChange?.(mode),
    onStatusChange: (status) => window.PriyanshuMascot?.elevenlabs?.onStatusChange?.(status),
  });

  // `useConversation` returns a brand-new object on every render and re-renders
  // on every status/speaking change. Keep a live ref so the bridge stays a
  // single stable object — otherwise tying the session to `conversation`
  // identity tears the LiveKit room down on every state change (the
  // disconnect/reconnect loop that aborts the audio worklet).
  const convoRef = useRef(conversation);
  convoRef.current = conversation;

  const bridgeRef = useRef(null);
  if (!bridgeRef.current) {
    let starting = false;

    const sessionExtras = () => (ALLOW_OVERRIDES ? { overrides: { agent: { firstMessage: GREETING } } } : {});

    // Try the transports in order of quality, falling through on failure so the
    // agent connects across the widest range of networks and agent configs:
    //   1. WebRTC + server-minted token  (best latency, works for private agents)
    //   2. WebRTC + public agent id      (no backend needed, public agents)
    //   3. WebSocket + public agent id   (most firewall/proxy friendly)
    async function connectWithFallback() {
      const extras = sessionExtras();
      // 1 — WebRTC via token
      try {
        const conversationToken = await fetchConversationToken();
        log('trying webrtc + token');
        await convoRef.current.startSession({ ...extras, conversationToken, connectionType: 'webrtc' });
        return 'webrtc+token';
      } catch (e) {
        log('webrtc+token unavailable →', e?.message || e);
      }
      // 2 — WebRTC via public agent id (SDK mints its own token client-side)
      try {
        log('trying webrtc + agentId');
        await convoRef.current.startSession({ ...extras, agentId: AGENT_ID, connectionType: 'webrtc' });
        return 'webrtc+agentId';
      } catch (e) {
        log('webrtc+agentId unavailable →', e?.message || e);
      }
      // 3 — WebSocket via public agent id (most firewall/proxy friendly)
      log('trying websocket + agentId');
      await convoRef.current.startSession({ ...extras, agentId: AGENT_ID, connectionType: 'websocket' });
      return 'websocket+agentId';
    }

    bridgeRef.current = {
      get status() { return convoRef.current.status; },
      get isSpeaking() { return convoRef.current.isSpeaking; },
      async start() {
        const status = convoRef.current.status;
        if (starting || status === 'connected' || status === 'connecting') return;
        starting = true;
        try {
          window.PriyanshuMascot?.elevenlabs?.onStarting?.();
          await navigator.mediaDevices.getUserMedia({ audio: true });
          const transport = await connectWithFallback();
          log('session opened via', transport, '(awaiting onConnect)');
        } catch (error) {
          log('all transports failed →', error?.message || error);
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

  // Expose the bridge once, and only end the session on real unmount — never on a
  // re-render — so an active conversation is never interrupted.
  useEffect(() => {
    const bridge = bridgeRef.current;
    window.ElevenLabsMascotBridge = bridge;
    window.PriyanshuMascot?.elevenlabs?.onBridgeReady?.();

    // The SDK's server-error handler reads `error_event.error_type` without
    // guarding the shape, so a malformed server error event surfaces as an
    // uncaught promise rejection that can break the page. Swallow only that
    // specific known SDK fault — everything else propagates normally.
    const onUnhandled = (event) => {
      const reason = event.reason;
      const msg = reason && (reason.message || String(reason));
      if (msg && /error_type/.test(msg) && /undefined/.test(msg)) {
        console.warn('[voice] suppressed ElevenLabs SDK error-event parse fault:', msg);
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
  }, [conversation.isSpeaking]);

  return null;
}

export default function ElevenLabsMascotBridge() {
  // `useConversation` (and the granular hooks it composes) must run inside a
  // ConversationProvider in @elevenlabs/react ≥1.x — without it React throws
  // "useRegisterCallbacks must be used within a ConversationProvider", which
  // crashes the whole app before the page can render.
  return (
    <ConversationProvider>
      <MascotBridge />
    </ConversationProvider>
  );
}
