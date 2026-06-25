import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- THINGS THAT BROKE -->
<section class="block" id="broke">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">POSTMORTEMS <b>//</b> HOVER TO RESOLVE</div>
    <h2 class="sec-title">Things that broke<br><span class="d2">and made me better.</span></h2>
    <p class="lead">Most portfolios hide the messy part. I use it as proof. Hover a bug to see the lesson.</p></div>
    <div class="bugs" id="bugs"></div>
  </div>
</section>`;

export default function BrokeSection() {
  return <RawHtml html={markup} />;
}
