import RawHtml from '../RawHtml.jsx';

const markup = String.raw`<footer><div class="sig">My brain turns chaos into systems.</div>PRIYANSHU.OS — built, broke, tested, rebuilt · useful beats impressive</footer>`;

export default function Footer() {
  return <RawHtml html={markup} />;
}
