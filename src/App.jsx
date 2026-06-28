import { useEffect, useState, lazy, Suspense } from 'react';
import GlobalChrome from './components/chrome/GlobalChrome.jsx';
import Dock from './components/chrome/Dock.jsx';
import Overlays from './components/chrome/Overlays.jsx';
import Hero from './components/sections/Hero.jsx';
import BrainSection from './components/sections/BrainSection.jsx';
import ChaosMachine from './components/sections/ChaosMachine.jsx';
import WorkSection from './components/sections/WorkSection.jsx';
import StorySection from './components/sections/StorySection.jsx';
import BrokeSection from './components/sections/BrokeSection.jsx';
import AiSection from './components/sections/AiSection.jsx';
import FragmentsSection from './components/sections/FragmentsSection.jsx';
import NowSection from './components/sections/NowSection.jsx';
import LabSection from './components/sections/LabSection.jsx';
import ContactSection from './components/sections/ContactSection.jsx';
import Footer from './components/sections/Footer.jsx';

// The ElevenLabs voice bridge pulls in the WebRTC/LiveKit SDK (the bulk of the
// JS payload). Code-split it and mount it during idle time after first paint so
// the page and mascot render fast — it's ready well before a user taps to talk.
const ElevenLabsMascotBridge = lazy(() => import('./components/voice/ElevenLabsMascotBridge.jsx'));

function DeferredVoiceBridge() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const handle = idle(() => setReady(true));
    return () => cancel(handle);
  }, []);
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <ElevenLabsMascotBridge />
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    let cancelled = false;
    async function bootLegacySystems() {
      await import('./legacy/main.js');
      await import('./mascot/mascot-engine.js');
      if (!cancelled) await import('./mascot/mascot.js');
    }
    bootLegacySystems();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <GlobalChrome />
      <main>
        <Hero />
        <BrainSection />
        <ChaosMachine />
        <WorkSection />
        <StorySection />
        <BrokeSection />
        <AiSection />
        <FragmentsSection />
        <NowSection />
        <LabSection />
        <ContactSection />
      </main>
      <Footer />
      <Dock />
      <Overlays />
      <DeferredVoiceBridge />
    </>
  );
}
