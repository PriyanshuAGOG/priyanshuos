import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<canvas id="bgfx"></canvas>
<svg id="spine" aria-hidden="true"><g id="spineG"></g></svg>
<div id="prog"></div>

<div id="cur"></div><div id="curd"></div><div id="curlabel"></div>

<!-- BOOT -->
<div id="boot"><div class="boot-inner"><div class="boot-log" id="bootLog"></div><div class="boot-bar"><i id="bootBar"></i></div></div></div>
<button id="skip">Skip intro →</button>

<!-- TOP BAR -->
<header id="top">
  <div class="brand"><b>PRIYANSHU<span>.OS</span></b><small>personal brain interface</small></div>
  <div class="status-chips">
    <span class="modes" role="group" aria-label="View mode">
      <button class="mode-btn" data-mode="founder">Founder</button>
      <button class="mode-btn on" data-mode="builder">Builder</button>
      <button class="mode-btn" data-mode="recruiter">Recruiter</button>
      <button class="mode-btn" data-mode="story">Story</button>
      <button class="mode-btn" data-mode="chaos">Chaos</button>
    </span>
    <span class="chip live" role="status" title="Static status: current work is listed in the Now section." aria-label="Currently building. See the Now section for details.">currently building</span>
    <span class="chip" role="status" title="Static status: available for useful chaos. Use Contact to send a signal." aria-label="Available for useful chaos. Use Contact to send a signal.">available for useful chaos</span>
    <button class="motion-toggle" id="motionToggle" type="button" aria-pressed="false" title="Reduce animations">Motion</button>
    <button class="kbd" id="cmdOpen" data-cursor="palette">⌘K</button>
  </div>
</header>`;

export default function GlobalChrome() {
  return <RawHtml html={markup} />;
}
