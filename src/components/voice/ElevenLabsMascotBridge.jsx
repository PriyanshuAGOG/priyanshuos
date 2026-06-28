import { useEffect, useRef } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_1401kw6hdp9gfnssm486zamz7f9d';
const GREETING = 'Heyo! Welcome to Priyanshu OS — I\'m Priyanshu. Ask me anything, or just look around.';

async function fetchConversationToken() {
  const response = await fetch(`/api/elevenlabs-token?agent_id=${encodeURIComponent(AGENT_ID)}`);
  if (!response.ok) throw new Error(`ElevenLabs token request failed (${response.status})`);
  const data = await response.json();
  if (!data.token) throw new Error('ElevenLabs token response did not include a token');
  return data.token;
}

function MascotBridge() {
  const conversation = useConversation({
    onConnect: () => window.PriyanshuMascot?.elevenlabs?.onConnect?.(),
    onDisconnect: () => window.PriyanshuMascot?.elevenlabs?.onDisconnect?.(),
    onMessage: (message) => window.PriyanshuMascot?.elevenlabs?.onMessage?.(message),
    onError: (error) => window.PriyanshuMascot?.elevenlabs?.onError?.(error),
    onModeChange: (mode) => window.PriyanshuMascot?.elevenlabs?.onModeChange?.(mode),
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
          const sessionBase = {
            connectionType: 'webrtc',
            overrides: { agent: { firstMessage: GREETING } },
          };
          // Secure path first: a short-lived WebRTC token minted server-side
          // from ELEVENLABS_API_KEY. Fall back to the public agent id directly
          // if the token endpoint/key isn't available, so voice works either way.
          try {
            const conversationToken = await fetchConversationToken();
            await convoRef.current.startSession({ ...sessionBase, conversationToken });
          } catch (tokenError) {
            console.warn('[mascot] token path failed, connecting with agent id', tokenError);
            await convoRef.current.startSession({ ...sessionBase, agentId: AGENT_ID });
          }
        } finally {
          starting = false;
        }
      },
      stop() { convoRef.current.endSession(); },
      sendText(text) { convoRef.current.sendUserMessage(text); },
      sendContext(text) { convoRef.current.sendContextualUpdate(text); },
      setVolume(volume) { convoRef.current.setVolume({ volume }); },
    };
  }

  // Expose the bridge once, and only end the session on real unmount — never
  // on a re-render — so an active conversation is never interrupted.
  useEffect(() => {
    const bridge = bridgeRef.current;
    window.ElevenLabsMascotBridge = bridge;
    window.PriyanshuMascot?.elevenlabs?.onBridgeReady?.();
    return () => {
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
