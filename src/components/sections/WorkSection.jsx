import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- EVIDENCE DESK -->
<section class="block" id="work">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">EVIDENCE DESK <b>//</b> CASE FILES</div>
    <h2 class="sec-title">Not claims.<br><span class="d2">Proof.</span></h2>
    <p class="lead">Five things I actually built, operated, broke, and fixed. Open any file to inspect the work.</p></div>
    <div class="cases" id="cases"></div>
  </div>
</section>`;

export default function WorkSection() {
  return <RawHtml html={markup} />;
}
