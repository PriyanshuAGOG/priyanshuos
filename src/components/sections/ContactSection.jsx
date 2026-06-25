import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- CONTACT -->
<section class="block" id="contact">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">SIGNAL BUILDER <b>//</b> CONTACT</div>
    <h2 class="sec-title">Let’s build<br><span class="d2">something useful.</span></h2>
    <p class="lead">If you have chaos, context, or an idea that needs a system, send the signal.</p></div>
    <div class="signal rise">
      <form id="signalForm" novalidate>
        <div class="field" data-field="type"><label>1 — What is this about? *</label><div class="opts" id="sigType"></div><div class="err">Choose a signal type.</div></div>
        <div class="field" data-field="chaos"><label>2 — What is the chaos? *</label><textarea name="chaos" rows="3" required minlength="12" placeholder="The messy version is fine. That’s the point."></textarea><div class="err">Share at least 12 characters of context.</div></div>
        <div class="field" data-field="need"><label>3 — What do you need? *</label><textarea name="need" rows="2" required minlength="6" placeholder="A system, a build, a person who figures it out…"></textarea><div class="err">Tell me what useful outcome you need.</div></div>
        <div class="field" data-field="contact"><label>4 — Your contact *</label><input name="contact" placeholder="email or @handle" required /><div class="err">Use a valid email or a handle like @priyanshu.</div></div>
        <button class="send magnetic" type="submit" data-cursor="send">Send signal →</button>
      </form>
      <aside class="packet" id="packet">
        <div class="pk-h">// message packet — assembling</div>
        <div class="pk-row"><span>type</span><b id="pkType">—</b></div>
        <div class="pk-row"><span>chaos</span><b id="pkChaos">—</b></div>
        <div class="pk-row"><span>need</span><b id="pkNeed">—</b></div>
        <div class="pk-row"><span>contact</span><b id="pkContact">—</b></div>
        <div style="margin-top:18px" id="pkStamp"></div>
        <div class="sent-banner">Signal received. If it makes sense, Priyanshu will reply.</div>
      </aside>
    </div>
  </div>
</section>`;

export default function ContactSection() {
  return <RawHtml html={markup} />;
}
