import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- AI WORKFLOW -->
<section class="block" id="ai">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">AI WORKFLOW <b>//</b> LEVERAGE, NOT IDENTITY</div>
    <h2 class="sec-title">How I use AI<br><span class="d2">without outsourcing my brain.</span></h2></div>
    <div class="loop rise" id="loop"></div>
    <div class="lanes rise">
      <div class="lane ai"><h4>AI helped with</h4><ul><li>speed and first drafts</li><li>generating options to react to</li><li>writing and running test passes</li><li>finding bugs faster</li><li>debugging dead ends</li></ul></div>
      <div class="lane you"><h4>Priyanshu decided</h4><ul><li>direction and what matters</li><li>taste — when it feels generic</li><li>priority and scope</li><li>what to ship and what to ignore</li><li>whether the output is actually true</li></ul></div>
    </div>
  </div>
</section>`;

export default function AiSection() {
  return <RawHtml html={markup} />;
}
