import { useEffect } from 'react';
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
import ElevenLabsMascotBridge from './components/voice/ElevenLabsMascotBridge.jsx';

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
      <ElevenLabsMascotBridge />
    </>
  );
}
