import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- BUILD ROOM -->
<section class="block" id="now">
  <div class="wrap"><div class="rise"><div class="eyebrow">CURRENT BUILD ROOM <b>//</b> NOW</div>
  <h2 class="sec-title">Now.</h2><p class="lead">What I’m building, learning, exploring, and avoiding right now.</p></div>
  <div class="board" id="board"></div></div>
</section>`;

export default function NowSection() {
  return <RawHtml html={markup} />;
}
