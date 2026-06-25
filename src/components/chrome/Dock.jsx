import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<!-- DOCK -->
<nav id="dock" aria-label="Primary">
  <button class="dock-btn active" data-go="home" data-cursor="home"><svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg><span>Home</span></button>
  <button class="dock-btn" data-go="brain"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/></svg><span>Brain</span></button>
  <button class="dock-btn" data-go="work"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM9 7V4h6v3"/></svg><span>Work</span></button>
  <button class="dock-btn" data-go="story"><svg viewBox="0 0 24 24"><path d="M5 4h14v16l-7-4-7 4z"/></svg><span>Story</span></button>
  <button class="dock-btn ask" data-ask data-cursor="ask"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 1 1-3-6.2L21 5M12 8v4M12 16h.01"/></svg><span>Ask</span></button>
  <button class="dock-btn" data-go="lab"><svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="4"/></svg><span>Lab</span></button>
  <button class="dock-btn" data-go="contact"><svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg><span>Contact</span></button>
</nav>`;

export default function Dock() {
  return <RawHtml html={markup} />;
}
