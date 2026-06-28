import { useEffect, useMemo, useRef } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_1401kw6hdp9gfnssm486zamz7f9d';

async function fetchConversationToken() {
  const response = await fetch(`/api/elevenlabs-token?agent_id=${encodeURIComponent(AGENT_ID)}`);
  if (!response.ok) throw new Error(`ElevenLabs token request failed (${response.status})`);
  const data = await response.json();
  if (!data.token) throw new Error('ElevenLabs token response did not include a token');
  return data.token;
}

function MascotBridge() {
  const statusRef = useRef('disconnected');
  const conversation = useConversation({
    onConnect: () => window.PriyanshuMascot?.elevenlabs?.onConnect?.(),
    onDisconnect: () => window.PriyanshuMascot?.elevenlabs?.onDisconnect?.(),
    onMessage: (message) => window.PriyanshuMascot?.elevenlabs?.onMessage?.(message),
    onError: (error) => window.PriyanshuMascot?.elevenlabs?.onError?.(error),
    onModeChange: (mode) => window.PriyanshuMascot?.elevenlabs?.onModeChange?.(mode),
  });

  statusRef.current = conversation.status;

  const bridge = useMemo(() => ({
    get status() { return statusRef.current; },
    get isSpeaking() { return conversation.isSpeaking; },
    async start() {
      window.PriyanshuMascot?.elevenlabs?.onStarting?.();
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Secure path first: a short-lived WebRTC token minted server-side from
      // the ElevenLabs API key (set in Vercel). If that endpoint is missing or
      // the key isn't configured, fall back to connecting with the public
      // agent id directly so the voice agent still works.
      try {
        const conversationToken = await fetchConversationToken();
        await conversation.startSession({ conversationToken, connectionType: 'webrtc' });
      } catch (tokenError) {
        console.warn('[mascot] token path failed, connecting with agent id', tokenError);
        await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' });
      }
    },
    stop() {
      conversation.endSession();
    },
    sendText(text) {
      conversation.sendUserMessage(text);
    },
    sendContext(text) {
      conversation.sendContextualUpdate(text);
    },
    setVolume(volume) {
      conversation.setVolume({ volume });
    },
  }), [conversation]);

  useEffect(() => {
    window.ElevenLabsMascotBridge = bridge;
    return () => {
      if (window.ElevenLabsMascotBridge === bridge) delete window.ElevenLabsMascotBridge;
      conversation.endSession();
    };
  }, [bridge, conversation]);

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
