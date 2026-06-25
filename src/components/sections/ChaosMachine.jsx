import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- CHAOS MACHINE -->
<section id="machine" aria-label="Chaos to System">
  <div class="machine-pin">
    <div class="machine-stage-label mono" id="mStage">STAGE 01 — MESS</div>
    <div class="machine-copy" id="mCopy">Everything starts <em>messy.</em></div>
    <div class="machine-field" id="mField"><svg id="mSvg"></svg></div>
    <div class="big-stamp" id="mStamp"><span class="stamp">CHAOS SORTED</span></div>
    <div class="machine-steps" id="mSteps"><span>mess</span><span>map</span><span>build</span><span>break</span><span>fix</span><span>ship</span><span>proof</span></div>
    <div class="machine-prog"><i id="mProg"></i></div>
  </div>
</section>`;

export default function ChaosMachine() {
  return <RawHtml html={markup} />;
}
