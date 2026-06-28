import { useEffect, useMemo, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_1401kw6hdp9gfnssm486zamz7f9d';

async function fetchConversationToken() {
  const response = await fetch(`/api/elevenlabs-token?agent_id=${encodeURIComponent(AGENT_ID)}`);
  if (!response.ok) throw new Error(`ElevenLabs token request failed (${response.status})`);
  const data = await response.json();
  if (!data.token) throw new Error('ElevenLabs token response did not include a token');
  return data.token;
}

export default function ElevenLabsMascotBridge() {
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
      const conversationToken = await fetchConversationToken();
      await conversation.startSession({ conversationToken, connectionType: 'webrtc' });
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
