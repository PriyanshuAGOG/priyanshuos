import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- DRAWER -->
<div id="drawer" aria-hidden="true" role="dialog" aria-modal="true"><div class="drawer-bg" data-drawer-close></div><div class="drawer-panel" id="drawerPanel" tabindex="-1"></div></div>

<!-- ASK -->
<div id="ask" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="ask-bg" data-ask-close></div>
  <div class="ask-panel"><button class="ask-close" data-ask-close>Esc</button>
    <div class="ask-head"><div class="h">Ask the brain interface</div><p>I can answer what a resume cannot: what Priyanshu built, what broke, what he believes, how he uses AI, why founders should care, and what he’s building now.</p></div>
    <div class="ask-body"><div class="ask-q" id="askQ"></div><div id="askAnswer"></div></div>
    <div class="ask-foot"><button class="voice-btn" id="askVoice" type="button" aria-label="Speak your question" title="Speak your question"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><input id="askInput" placeholder="Ask anything about Priyanshu…" /><button id="askSend">Ask</button></div>
  </div>
</div>

<!-- COMMAND PALETTE -->
<div id="cmd" aria-hidden="true" role="dialog" aria-modal="true"><div class="cmd-bg" data-cmd-close></div>
  <div class="cmd-panel"><input id="cmdInput" placeholder="Type a command… (open work, switch founder mode, ask, copy email)" /><div class="cmd-list" id="cmdList"></div></div>
</div>`;

export default function Overlays() {
  return <RawHtml html={markup} />;
}
