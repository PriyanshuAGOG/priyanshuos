import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- HERO -->
<section class="hero" id="home">
  <div class="wrap">
    <div class="hero-text">
      <div class="hero-kicker eyebrow rise">PRIYANSHU AGARWAL <b>—</b> PERSONAL BRAIN INTERFACE</div>
      <h1 class="rise"><span class="title-reveal"><span>I’m Priyanshu.</span></span><br><span class="title-reveal"><span class="l2">I do things.</span></span></h1>
      <p class="sub rise">This is my interactive portfolio: a living archive of projects, systems, experiments, AI workflows, founder-office work, community builds, and the way I think.</p>
      <p class="micro rise">Ask anything. Or inspect the proof manually.</p>
      <div class="hero-cta rise">
        <button class="btn primary magnetic" data-ask data-cursor="ask">Ask about Priyanshu</button>
        <button class="btn magnetic" data-go="work" data-cursor="inspect">See proof of work</button>
        <button class="btn magnetic" data-mode-jump="recruiter" data-cursor="clean">Open clean resume view</button>
      </div>
    </div>
    <div class="desk" id="desk" aria-hidden="true">
      <div class="obj" data-d="3" style="top:4%;left:2%" data-case="student" data-cursor="open"><span class="ti">app</span><div class="bd">Student Social</div><div class="ar">→ pods · chat · feeds</div></div>
      <div class="obj" data-d="6" style="top:1%;left:48%" data-case="nirog" data-cursor="open"><span class="ti">founder-office</span><div class="bd">Nirog Bhumi system</div><div class="ar">→ live business</div></div>
      <div class="obj term" data-d="2" style="top:30%;left:8%">$ npm run chaos</div>
      <div class="obj" data-d="8" style="top:24%;left:54%" data-case="ai" data-cursor="open"><span class="ti">ai loop</span><div class="bd">QA prompt card</div><div class="ar">→ break → fix → ship</div></div>
      <div class="obj hide-sm" data-d="4" style="top:54%;left:0%" data-case="hack" data-cursor="open"><span class="ti">community</span><div class="bd">Hackathon pass</div><div class="ar">→ ops + sponsors</div></div>
      <div class="note obj hide-sm" data-d="5" style="top:50%;left:40%;max-width:200px"><div class="nt-meta">// raw note</div><p>built before ready</p></div>
      <div class="obj stamp-obj" data-d="10" style="top:78%;left:14%"><span class="stamp">NOT A CLAIM</span></div>
      <div class="obj hide-sm" data-d="7" style="top:74%;left:52%" data-case="agency" data-cursor="open"><span class="ti">client</span><div class="bd">WooCommerce build</div><div class="ar">→ delivered</div></div>
      <div class="obj stamp-obj hide-sm" data-d="9" style="top:90%;left:62%"><span class="mono" style="font-size:10px;color:var(--dim);letter-spacing:.06em">idea → build → break → fix → ship</span></div>
    </div>
  </div>
</section>`;

export default function Hero() {
  return <RawHtml html={markup} />;
}
