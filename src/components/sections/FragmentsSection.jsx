import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- FRAGMENTS -->
<section class="block" id="frag">
  <div class="wrap"><div class="rise"><div class="eyebrow">IDENTITY <b>//</b> FRAGMENTS</div>
  <h2 class="sec-title">Fragments of me.</h2></div><div class="frags" id="frags"></div></div>
</section>`;

export default function FragmentsSection() {
  return <RawHtml html={markup} />;
}
