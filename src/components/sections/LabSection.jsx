import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- LAB -->
<section class="block" id="lab">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">LAB <b>//</b> EXPERIMENTS</div>
    <h2 class="sec-title">Useful experiments,<br><span class="d2">not dead links.</span></h2>
    <p class="lead">A small control room for the site’s playful systems: voice, motion, proof shortcuts, and the mascot guide.</p></div>
    <div class="lab-grid rise">
      <article class="lab-card"><h3>Voice brain check</h3><p>Open the brain interface with microphone support and ask a question by speaking or typing.</p><button type="button" data-ask data-lab-prompt="How does he use AI?">Try voice ask →</button></article>
      <article class="lab-card"><h3>Proof jump</h3><p>Go directly to inspectable case files instead of wandering through persona state.</p><button type="button" data-go="work">Open proof →</button></article>
      <article class="lab-card"><h3>Break map</h3><p>Jump to the postmortems where broken assumptions become lessons.</p><button type="button" data-go="broke">See breaks →</button></article>
      <article class="lab-card"><h3>Motion safe mode</h3><p>Reduce particles, scroll theatrics, and continuous effects for a calmer read.</p><button type="button" data-motion-action>Toggle motion →</button></article>
    </div>
  </div>
</section>`;

export default function LabSection() {
  return <RawHtml html={markup} />;
}
