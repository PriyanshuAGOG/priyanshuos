import { useEffect, useMemo, useRef } from 'react';
import { Conversation } from '@elevenlabs/react';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_1401kw6hdp9gfnssm486zamz7f9d';

async function fetchConversationToken() {
  const response = await fetch(`/api/elevenlabs-token?agent_id=${encodeURIComponent(AGENT_ID)}`);
  if (!response.ok) throw new Error(`ElevenLabs token request failed (${response.status})`);
  const data = await response.json();
  if (!data.token) throw new Error('ElevenLabs token response did not include a token');
  return data.token;
}

export default function ElevenLabsMascotBridge() {
  const conversationRef = useRef(null);
  const statusRef = useRef('disconnected');
  const speakingRef = useRef(false);

  const setStatus = (status) => {
    statusRef.current = status;
    window.PriyanshuMascot?.elevenlabs?.onStatusChange?.(status);
  };

  const setSpeaking = (isSpeaking) => {
    speakingRef.current = isSpeaking;
    window.PriyanshuMascot?.elevenlabs?.onSpeakingChange?.(isSpeaking);
  };

  const bridge = useMemo(() => ({
    get status() { return statusRef.current; },
    get isSpeaking() { return speakingRef.current; },
    async start() {
      if (conversationRef.current || statusRef.current === 'connecting') return;
      window.PriyanshuMascot?.elevenlabs?.onStarting?.();
      setStatus('connecting');
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const conversationToken = await fetchConversationToken();
        conversationRef.current = await Conversation.startSession({
          conversationToken,
          connectionType: 'webrtc',
          onConnect: () => {
            setStatus('connected');
            window.PriyanshuMascot?.elevenlabs?.onConnect?.();
          },
          onDisconnect: () => {
            conversationRef.current = null;
            setSpeaking(false);
            setStatus('disconnected');
            window.PriyanshuMascot?.elevenlabs?.onDisconnect?.();
          },
          onMessage: (message) => window.PriyanshuMascot?.elevenlabs?.onMessage?.(message),
          onError: (error) => {
            conversationRef.current = null;
            setSpeaking(false);
            setStatus('error');
            window.PriyanshuMascot?.elevenlabs?.onError?.(error);
          },
          onModeChange: (mode) => {
            setSpeaking(mode?.mode === 'speaking' || mode === 'speaking');
            window.PriyanshuMascot?.elevenlabs?.onModeChange?.(mode);
          },
        });
      } catch (error) {
        conversationRef.current = null;
        setSpeaking(false);
        setStatus('error');
        throw error;
      }
    },
    stop() {
      conversationRef.current?.endSession();
      conversationRef.current = null;
      setSpeaking(false);
      setStatus('disconnected');
      window.PriyanshuMascot?.elevenlabs?.onDisconnect?.();
    },
    sendText(text) {
      conversationRef.current?.sendUserMessage(text);
    },
    sendContext(text) {
      conversationRef.current?.sendContextualUpdate(text);
    },
    setVolume(volume) {
      conversationRef.current?.setVolume({ volume });
    },
  }), []);

  useEffect(() => {
    window.ElevenLabsMascotBridge = bridge;
    return () => {
      if (window.ElevenLabsMascotBridge === bridge) delete window.ElevenLabsMascotBridge;
      conversationRef.current?.endSession();
      conversationRef.current = null;
    };
  }, [bridge]);

  return null;
}
