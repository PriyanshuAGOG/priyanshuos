import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- ROUTE MAP -->
<section class="block" id="story">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">ROUTE MAP <b>//</b> NON-LINEAR</div>
    <h2 class="sec-title">I didn’t follow the cleanest path.<br><span class="d2">I followed the one where I could build the most.</span></h2></div>
    <div class="route" id="route"><svg class="rpath" id="rpath"></svg><div id="routeNodes"></div></div>
  </div>
</section>`;

export default function StorySection() {
  return <RawHtml html={markup} />;
}
