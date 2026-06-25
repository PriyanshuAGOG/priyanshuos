import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- BRAIN INTERFACE -->
<section class="block" id="brain">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">BRAIN INTERFACE <b>//</b> ZONES</div>
    <h2 class="sec-title">This is not a portfolio.<br><span class="d2">It’s how my brain organizes proof.</span></h2></div>
    <div class="neural"><svg class="nlines" id="nlines"></svg><div class="brain-grid" id="brainGrid"></div></div>
  </div>
</section>`;

export default function BrainSection() {
  return <RawHtml html={markup} />;
}
