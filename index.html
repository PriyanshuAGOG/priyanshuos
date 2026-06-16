<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Priyanshu Agarwal — My Brain, My Builds, My Proof of Work</title>
<meta name="description" content="Interactive portfolio of Priyanshu Agarwal: websites, apps, AI workflows, founder-office systems, community work, experiments, failures, and proof of work." />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
/* ============================================================
   PRIYANSHU OS — chaos to system  (tokens verbatim from PRD §6)
   ============================================================ */
:root{
  --black:#050505; --deep-black:#000000; --soft-black:#0B0B0B;
  --panel:#111111; --border:#242424;
  --text:#F5F5F5; --muted:#A3A3A3; --dim:#6F6F6F; --paper:#F4F2EC;
  --lime:#C7FF3D; --blue:#8FD8FF; --red:#FF4D4D; --gold:#C9A44C;
  --accent:#C7FF3D; --accent-soft:rgba(199,255,61,.14); --accent-line:rgba(199,255,61,.30);
  --maxw:1360px; --ease:cubic-bezier(.16,1,.3,1); --pad:clamp(18px,4vw,56px);
  --f-display:'Space Grotesk',system-ui,sans-serif;
  --f-body:'Inter',system-ui,sans-serif;
  --f-mono:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--black);color:var(--text);font-family:var(--f-body);line-height:1.55;overflow-x:hidden;-webkit-font-smoothing:antialiased;letter-spacing:.01em}
body.lock{overflow:hidden}
::selection{background:var(--accent);color:#000}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.mono{font-family:var(--f-mono);font-variant-ligatures:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding-inline:var(--pad)}

/* layered atmosphere */
#bgfx{position:fixed;inset:0;z-index:0;pointer-events:none}
body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(120% 90% at 82% -10%,var(--accent-soft),transparent 55%),radial-gradient(100% 80% at -10% 110%,rgba(143,216,255,.05),transparent 55%);
  transition:background .6s var(--ease)}
body::after{content:"";position:fixed;inset:0;z-index:60;pointer-events:none;mix-blend-mode:overlay;opacity:.05;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* ====== GLOBAL CONNECTING SPINE (the headline feature) ====== */
#spine{position:absolute;top:0;left:0;z-index:0;pointer-events:none;overflow:visible}
#spine .track{fill:none;stroke:rgba(255,255,255,.06);stroke-width:1.5}
#spine .draw{fill:none;stroke:var(--accent);stroke-width:2;filter:drop-shadow(0 0 6px var(--accent-line));transition:stroke .6s var(--ease)}
#spine .snode{fill:var(--black);stroke:rgba(255,255,255,.18);stroke-width:1.5;transition:.35s var(--ease)}
#spine .snode.on{stroke:var(--accent);fill:var(--accent);filter:drop-shadow(0 0 8px var(--accent))}
#spine .slabel{font-family:var(--f-mono);font-size:9px;letter-spacing:.16em;fill:var(--dim);text-transform:uppercase;opacity:0;transition:.35s}
#spine .snode.on + .slabel{opacity:1;fill:var(--accent)}
#spine .comet{fill:var(--accent);filter:drop-shadow(0 0 10px var(--accent))}

/* scroll progress bar */
#prog{position:fixed;top:0;left:0;height:2px;width:0;background:var(--accent);z-index:90;box-shadow:0 0 12px var(--accent);transition:background .6s var(--ease)}

/* custom cursor */
#cur,#curd{position:fixed;top:0;left:0;z-index:300;pointer-events:none;border-radius:50%;mix-blend-mode:difference}
#cur{width:7px;height:7px;background:#fff;transform:translate(-50%,-50%)}
#curd{width:34px;height:34px;border:1px solid rgba(255,255,255,.5);transform:translate(-50%,-50%);transition:width .2s,height .2s,opacity .2s}
#curd.big{width:64px;height:64px}
#curlabel{position:fixed;z-index:300;pointer-events:none;font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#000;background:var(--accent);padding:4px 8px;border-radius:6px;transform:translate(-50%,-180%);opacity:0;transition:opacity .18s}
@media (hover:none),(pointer:coarse){#cur,#curd,#curlabel{display:none}}

/* shared chrome */
.stamp{display:inline-flex;align-items:center;gap:.4em;font-family:var(--f-mono);font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:5px 9px;border:1px solid var(--accent);color:var(--accent);border-radius:5px;line-height:1;background:rgba(0,0,0,.4);transform:rotate(-2deg);white-space:nowrap}
.stamp.red{border-color:var(--red);color:var(--red);transform:rotate(2deg)}
.stamp.blue{border-color:var(--blue);color:var(--blue)}
.stamp.gold{border-color:var(--gold);color:var(--gold)}
.note{position:relative;background:var(--soft-black);border:1px solid var(--border);border-radius:6px;padding:13px 15px 14px;max-width:230px;box-shadow:0 16px 36px rgba(0,0,0,.5)}
.note::before{content:"";position:absolute;top:9px;right:11px;width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px var(--accent)}
.note .nt-meta{font-family:var(--f-mono);font-size:9px;letter-spacing:.16em;color:var(--dim);text-transform:uppercase;margin-bottom:6px}
.note p{font-size:14.5px;color:#e9e9e9;font-family:var(--f-display);font-weight:500}
.chip{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;padding:6px 11px;border:1px solid var(--border);border-radius:999px;color:var(--muted);background:rgba(255,255,255,.02);white-space:nowrap}
.chip.live::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-right:7px;box-shadow:0 0 9px var(--accent);animation:pulse 1.8s infinite}
@keyframes pulse{50%{opacity:.35}}
.eyebrow{font-family:var(--f-mono);font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:var(--dim)}
.eyebrow b{color:var(--accent);font-weight:700}

/* reveal system */
.rise{opacity:0;transform:translateY(36px);transition:opacity .85s var(--ease),transform .85s var(--ease)}
.rise.in{opacity:1;transform:none}
.title-reveal{display:inline-block;overflow:hidden;vertical-align:top}
.title-reveal>span{display:inline-block;transform:translateY(110%);transition:transform .9s var(--ease)}
.in .title-reveal>span,.title-reveal.in>span{transform:none}

/* ================= BOOT (§10.1) ================= */
#boot{position:fixed;inset:0;z-index:1000;background:var(--deep-black);display:flex;align-items:center;justify-content:center;transition:opacity .7s var(--ease)}
#boot.gone{opacity:0;pointer-events:none}
.boot-inner{width:min(560px,86vw)}
.boot-log{font-family:var(--f-mono);font-size:13px;line-height:2.1;color:var(--muted)}
.boot-log .ln{opacity:0;transform:translateY(6px)}
.boot-log .ln.show{opacity:1;transform:none;transition:.3s var(--ease)}
.boot-log .ln.ok{color:var(--lime)}
.boot-log .ln .c{color:var(--dim)}
.boot-bar{height:2px;background:#161616;margin-top:22px;border-radius:2px;overflow:hidden}
.boot-bar i{display:block;height:100%;width:0;background:var(--lime);box-shadow:0 0 14px var(--lime)}
#skip{position:fixed;right:22px;bottom:22px;z-index:1001;font-family:var(--f-mono);font-size:11px;letter-spacing:.14em;color:var(--dim);text-transform:uppercase;border:1px solid var(--border);padding:8px 13px;border-radius:6px;opacity:0;transition:.3s}
#skip.show{opacity:1}#skip:hover{color:var(--lime);border-color:var(--lime)}

/* ================= TOP BAR (§8.2) ================= */
#top{position:fixed;top:0;left:0;right:0;z-index:80;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px var(--pad);background:linear-gradient(to bottom,rgba(5,5,5,.92),rgba(5,5,5,.4) 70%,transparent);backdrop-filter:blur(6px)}
.brand{display:flex;flex-direction:column;line-height:1.1}
.brand b{font-family:var(--f-mono);font-size:13px;letter-spacing:.22em}
.brand b span{color:var(--accent)}
.brand small{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.18em;color:var(--dim);text-transform:uppercase;margin-top:3px}
.status-chips{display:flex;gap:9px;align-items:center}
.status-chips .chip{font-size:9.5px;padding:5px 10px}
.kbd{font-family:var(--f-mono);font-size:10px;color:var(--dim);border:1px solid var(--border);border-radius:5px;padding:5px 9px;letter-spacing:.05em}
.kbd:hover{color:var(--accent);border-color:var(--accent-line)}
.modes{display:flex;gap:6px}
.mode-btn{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;padding:6px 9px;border:1px solid var(--border);border-radius:7px;color:var(--dim);transition:.2s}
.mode-btn.on{color:#000;font-weight:700}.mode-btn:hover{color:var(--text)}
@media(max-width:980px){.status-chips .chip{display:none}}
@media(max-width:600px){.brand small{display:none}.modes{display:none}}

/* ================= DOCK (§8.1) ================= */
#dock{position:fixed;left:50%;bottom:18px;transform:translateX(-50%) translateY(40px);opacity:0;z-index:80;display:flex;align-items:center;gap:4px;background:rgba(8,8,8,.72);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:8px;box-shadow:0 24px 60px rgba(0,0,0,.65);max-width:calc(100% - 24px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
#dock.in{opacity:1;transform:translateX(-50%)}
.dock-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 13px;border-radius:12px;color:var(--muted);font-family:var(--f-mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;transition:.22s var(--ease);position:relative}
.dock-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.6}
.dock-btn:hover{color:var(--text);transform:translateY(-4px);background:rgba(255,255,255,.04)}
.dock-btn.active{color:var(--accent)}
.dock-btn.active::after{content:"";position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent)}
.dock-btn.ask{background:var(--accent);color:#000;font-weight:700}.dock-btn.ask svg{stroke:#000}.dock-btn.ask:hover{filter:brightness(1.08);color:#000}
@media(max-width:680px){.dock-btn span{display:none}.dock-btn{padding:11px}.dock-btn.ask span{display:inline}}

/* ================= HERO (§10.2) ================= */
.hero{min-height:100svh;display:flex;align-items:center;padding-top:90px;position:relative;z-index:2}
.hero .wrap{display:grid;grid-template-columns:52% 48%;gap:30px;align-items:center;width:100%}
.hero h1{font-family:var(--f-display);font-weight:700;font-size:clamp(42px,9.2vw,132px);line-height:.94;letter-spacing:-.02em}
.hero h1 .l2{color:var(--accent);transition:color .6s var(--ease)}
.hero .sub{max-width:560px;color:var(--muted);font-size:clamp(15px,1.6vw,18px);margin-top:26px}
.hero .micro{font-family:var(--f-mono);font-size:11px;color:var(--dim);letter-spacing:.08em;margin-top:14px}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.btn{font-family:var(--f-mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;padding:13px 20px;border-radius:11px;border:1px solid var(--border);display:inline-flex;align-items:center;gap:9px;transition:.25s var(--ease)}
.btn.primary{background:var(--accent);color:#000;border-color:var(--accent);font-weight:700}
.btn.primary:hover{transform:translateY(-2px);box-shadow:0 12px 30px var(--accent-soft)}
.btn:not(.primary):hover{border-color:var(--accent-line);color:var(--accent)}
.desk{position:relative;height:min(560px,72vh);perspective:1200px}
.obj{position:absolute;background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:13px 15px;will-change:transform;box-shadow:0 22px 50px rgba(0,0,0,.55);transition:box-shadow .3s,border-color .3s;cursor:pointer}
.obj:hover{border-color:var(--accent-line);box-shadow:0 28px 60px rgba(0,0,0,.7),0 0 0 1px var(--accent-line);z-index:20!important}
.obj .ti{font-family:var(--f-mono);font-size:9px;letter-spacing:.16em;color:var(--dim);text-transform:uppercase}
.obj .bd{font-family:var(--f-display);font-weight:600;font-size:14px;margin-top:5px}
.obj .ar{font-family:var(--f-mono);font-size:9px;color:var(--accent);margin-top:8px;letter-spacing:.06em}
.obj.term{font-family:var(--f-mono);font-size:11px;color:var(--lime);background:#070707}
.obj.stamp-obj{background:transparent;border:none;box-shadow:none;padding:0}
@media(max-width:920px){.hero .wrap{grid-template-columns:1fr;gap:8px}.desk{height:300px;margin-bottom:6px;order:-1}.hero{padding-top:120px;align-items:flex-start}.obj.hide-sm{display:none}}

/* sections */
section.block{position:relative;z-index:2;padding:clamp(90px,13vh,150px) 0}
.sec-title{font-family:var(--f-display);font-weight:700;font-size:clamp(36px,6vw,92px);line-height:1.0;letter-spacing:-.02em;margin-top:16px}
.sec-title .d2{color:var(--accent);transition:color .6s var(--ease)}
.lead{color:var(--muted);max-width:640px;margin-top:18px;font-size:17px}

/* brain interface (§10.3) — neural graph */
.neural{position:relative;margin-top:48px}
.neural svg.nlines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:visible}
.neural svg.nlines path{fill:none;stroke:var(--accent-line);stroke-width:1.2;opacity:.5}
.neural svg.nlines path.hot{stroke:var(--accent);opacity:1;stroke-width:2;filter:drop-shadow(0 0 6px var(--accent-line))}
.brain-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;position:relative;z-index:1}
.node{border:1px solid var(--border);border-radius:20px;padding:22px;background:rgba(255,255,255,.025);transition:.3s var(--ease);position:relative;overflow:hidden}
.node::after{content:"";position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 0%,var(--nc,var(--accent-soft)),transparent 70%);opacity:0;transition:.4s}
.node:hover{transform:translateY(-5px);border-color:var(--nc,var(--accent-line))}
.node:hover::after{opacity:.5}
.node .dot{width:10px;height:10px;border-radius:50%;background:var(--nc,var(--accent));box-shadow:0 0 12px var(--nc,var(--accent));margin-bottom:16px}
.node h3{font-family:var(--f-display);font-size:22px;font-weight:600}
.node .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
.node .tags span{font-family:var(--f-mono);font-size:10px;color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:4px 8px}
.node p{font-size:13.5px;color:var(--dim);margin-top:14px;line-height:1.5}

/* CHAOS MACHINE (§10.4) */
#machine{height:640vh;position:relative}
.machine-pin{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden}
.machine-stage-label{font-family:var(--f-mono);font-size:12px;letter-spacing:.2em;color:var(--dim);text-transform:uppercase;margin-bottom:8px;z-index:3}
.machine-copy{font-family:var(--f-display);font-weight:700;font-size:clamp(28px,5vw,64px);line-height:1.02;text-align:center;letter-spacing:-.02em;max-width:900px;z-index:3}
.machine-copy em{font-style:normal;color:var(--accent)}
.machine-field{position:absolute;inset:0;pointer-events:none;z-index:1}
.machine-field svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.machine-field svg line{stroke:var(--accent-line);stroke-width:1}
.frag{position:absolute;font-family:var(--f-mono);font-size:11px;background:var(--panel);border:1px solid var(--border);border-radius:9px;padding:8px 11px;color:var(--muted);white-space:nowrap;box-shadow:0 14px 30px rgba(0,0,0,.5);will-change:transform}
.frag.broke{border-color:var(--red);color:var(--red)}
.frag.fixed{border-color:var(--accent);color:var(--accent)}
.machine-prog{position:absolute;bottom:84px;left:50%;transform:translateX(-50%);width:min(340px,70vw);height:2px;background:#161616;border-radius:2px;z-index:3}
.machine-prog i{display:block;height:100%;width:0;background:var(--accent);box-shadow:0 0 12px var(--accent)}
.machine-steps{position:absolute;bottom:54px;left:50%;transform:translateX(-50%);display:flex;gap:14px;font-family:var(--f-mono);font-size:9.5px;letter-spacing:.14em;color:var(--dim);text-transform:uppercase;z-index:3}
.machine-steps span.on{color:var(--accent)}
.big-stamp{position:absolute;opacity:0;transform:scale(1.6) rotate(-8deg);transition:.4s var(--ease);z-index:3}
.big-stamp.hit{opacity:1;transform:scale(1) rotate(-4deg)}
.big-stamp .stamp{font-size:18px;padding:14px 22px;letter-spacing:.22em}

/* EVIDENCE DESK (§10.5) */
.cases{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:18px;margin-top:48px}
.case{position:relative;border:1px solid var(--border);border-radius:24px;padding:24px;background:linear-gradient(160deg,rgba(255,255,255,.04),rgba(255,255,255,.012));transition:transform .3s var(--ease),box-shadow .3s,border-color .3s;overflow:hidden;cursor:pointer;transform-style:preserve-3d;will-change:transform}
.case::before{content:"";position:absolute;top:0;left:26px;width:74px;height:8px;background:var(--ac,var(--accent));border-radius:0 0 6px 6px;opacity:.85}
.case:hover{border-color:var(--ac,var(--accent-line));box-shadow:0 30px 70px rgba(0,0,0,.6)}
.case .case-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-top:8px}
.case h3{font-family:var(--f-display);font-size:24px;font-weight:600;line-height:1.05}
.case .role{font-family:var(--f-mono);font-size:10px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase;margin-top:6px}
.case .one{color:var(--muted);font-size:14px;margin-top:14px;min-height:42px}
.case .stk{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
.case .stk span{font-family:var(--f-mono);font-size:10px;color:var(--muted);border:1px solid var(--border);padding:3px 8px;border-radius:6px}
.case .broke-strip{margin-top:16px;font-family:var(--f-mono);font-size:11px;color:var(--red);border-top:1px dashed rgba(255,77,77,.3);padding-top:12px}
.case .open{margin-top:16px;font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;color:var(--accent);display:flex;align-items:center;gap:7px;text-transform:uppercase}
.case:hover .open{gap:11px}

/* DRAWER (§10.6) */
#drawer{position:fixed;inset:0;z-index:200;display:none}#drawer.open{display:block}
.drawer-bg{position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);opacity:0;transition:.3s}
#drawer.open .drawer-bg{opacity:1}
.drawer-panel{position:absolute;right:0;top:0;height:100%;width:min(720px,100%);background:var(--soft-black);border-left:1px solid var(--border);transform:translateX(100%);transition:transform .42s var(--ease);overflow-y:auto;padding:34px var(--pad) 60px}
#drawer.open .drawer-panel{transform:none}
.drawer-close{position:absolute;top:20px;right:24px;font-family:var(--f-mono);font-size:11px;letter-spacing:.12em;color:var(--muted);border:1px solid var(--border);padding:8px 13px;border-radius:8px;text-transform:uppercase}
.drawer-close:hover{color:var(--red);border-color:var(--red)}
.dr-stamps{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
.dr-title{font-family:var(--f-display);font-size:clamp(30px,5vw,46px);font-weight:700;line-height:1;letter-spacing:-.02em}
.dr-meta{font-family:var(--f-mono);font-size:11px;color:var(--dim);margin-top:12px;letter-spacing:.06em;line-height:1.9}
.dr-meta b{color:var(--text);font-weight:500}
.dr-sec{margin-top:26px}
.dr-sec h4{font-family:var(--f-mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.dr-sec p{color:var(--muted);font-size:15px;line-height:1.6}
.dr-sec ul{list-style:none;display:flex;flex-direction:column;gap:8px}
.dr-sec li{padding-left:20px;position:relative;color:#d6d6d6;font-size:14.5px}
.dr-sec li::before{content:"→";position:absolute;left:0;color:var(--accent)}
.dr-sec.broke li::before{content:"×";color:var(--red)}
.dr-sec.fixed li::before{content:"✓";color:var(--accent)}

/* ROUTE MAP (§10.7) — draws on scroll */
.route{margin-top:48px;position:relative;padding-left:34px}
.route svg.rpath{position:absolute;left:0;top:0;width:30px;height:100%;overflow:visible}
.route svg.rpath path.rtrack{fill:none;stroke:rgba(255,255,255,.08);stroke-width:2}
.route svg.rpath path.rdraw{fill:none;stroke:var(--accent);stroke-width:2;filter:drop-shadow(0 0 5px var(--accent-line));transition:stroke .6s}
.route-node{position:relative;padding:6px 0 26px}
.route-node .rdot{position:absolute;left:-34px;top:10px;width:14px;height:14px;border-radius:50%;border:2px solid var(--rc,var(--accent));background:var(--black);transition:.3s;transform:translateX(8px)}
.route-node.lit .rdot{background:var(--rc,var(--accent));box-shadow:0 0 14px var(--rc,var(--accent))}
.route-node h4{font-family:var(--f-display);font-size:20px;font-weight:600}
.route-node .when{font-family:var(--f-mono);font-size:10px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase}
.route-node p{color:var(--muted);font-size:14px;margin-top:6px;max-width:560px}
.route-node.now h4::after{content:"YOU ARE HERE";font-family:var(--f-mono);font-size:9px;letter-spacing:.14em;color:var(--accent);border:1px solid var(--accent-line);padding:3px 7px;border-radius:5px;margin-left:12px;vertical-align:middle}

/* BUGS (§10.8) */
.bugs{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;margin-top:48px}
.bug{position:relative;height:188px;border-radius:18px;perspective:900px;cursor:pointer}
.bug-inner{position:relative;width:100%;height:100%;transition:transform .6s var(--ease);transform-style:preserve-3d}
.bug:hover .bug-inner,.bug:focus-within .bug-inner{transform:rotateY(180deg)}
.bug-face{position:absolute;inset:0;border-radius:18px;padding:20px;backface-visibility:hidden;border:1px solid var(--border);display:flex;flex-direction:column}
.bug-front{background:rgba(255,77,77,.05);border-color:rgba(255,77,77,.28)}
.bug-front .lbl{font-family:var(--f-mono);font-size:10px;letter-spacing:.16em;color:var(--red);text-transform:uppercase}
.bug-front h4{font-family:var(--f-display);font-size:19px;font-weight:600;margin-top:auto}
.bug-front .proj{font-family:var(--f-mono);font-size:10px;color:var(--dim);margin-top:8px}
.bug-back{background:rgba(199,255,61,.05);border-color:var(--accent-line);transform:rotateY(180deg)}
.bug-back .lbl{font-family:var(--f-mono);font-size:10px;letter-spacing:.16em;color:var(--accent);text-transform:uppercase}
.bug-back p{font-size:13.5px;color:#dcdcdc;margin-top:auto;line-height:1.5}

/* AI WORKFLOW (§10.9) */
.loop{display:flex;flex-wrap:wrap;gap:10px;margin-top:42px;align-items:center;justify-content:center}
.loop-step{font-family:var(--f-mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--border);border-radius:10px;padding:12px 16px;background:rgba(255,255,255,.02);color:var(--muted);transition:.25s}
.loop-step:hover{border-color:var(--accent-line);color:var(--accent);transform:translateY(-3px)}
.loop-step.pulse{border-color:var(--accent);color:var(--accent);box-shadow:0 0 0 1px var(--accent-line),0 0 18px var(--accent-soft)}
.loop .arr{color:var(--dim);font-family:var(--f-mono)}
.lanes{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:40px}
.lane{border:1px solid var(--border);border-radius:18px;padding:24px}
.lane.ai{border-color:rgba(143,216,255,.25)}.lane.you{border-color:var(--accent-line)}
.lane h4{font-family:var(--f-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:16px}
.lane.ai h4{color:var(--blue)}.lane.you h4{color:var(--accent)}
.lane li{list-style:none;font-size:14.5px;color:#d4d4d4;padding:7px 0 7px 20px;position:relative;border-bottom:1px solid rgba(255,255,255,.04)}
.lane li::before{content:"";position:absolute;left:0;top:14px;width:7px;height:7px;border-radius:2px;background:var(--blue)}
.lane.you li::before{background:var(--accent)}
@media(max-width:680px){.lanes{grid-template-columns:1fr}}

/* FRAGMENTS (§10.10) */
.frags{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-top:48px}
.fcard{border:1px solid var(--border);border-radius:18px;padding:24px;background:rgba(255,255,255,.022);transition:.3s}
.fcard:hover{transform:translateY(-4px);border-color:var(--accent-line)}
.fcard .ico{font-family:var(--f-mono);font-size:10px;letter-spacing:.16em;color:var(--accent);text-transform:uppercase}
.fcard h4{font-family:var(--f-display);font-size:24px;font-weight:600;margin-top:14px;line-height:1.15}
.fcard p{color:var(--muted);font-size:13.5px;margin-top:10px}

/* BUILD ROOM (§10.11) */
.board{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-top:44px}
.col h4{font-family:var(--f-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.col h4::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--cc,var(--accent))}
.col .task{border:1px solid var(--border);border-radius:12px;padding:13px 14px;font-size:13.5px;color:#dcdcdc;margin-bottom:9px;background:rgba(255,255,255,.02);transition:.25s}
.col .task:hover{border-color:var(--cc,var(--accent-line));transform:translateX(3px)}

/* SIGNAL (§10.12) */
.signal{display:grid;grid-template-columns:1.1fr .9fr;gap:34px;margin-top:48px;align-items:start}
.field{margin-bottom:22px}
.field label{font-family:var(--f-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);display:block;margin-bottom:10px}
.opts{display:flex;flex-wrap:wrap;gap:8px}
.opt{font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--border);padding:9px 13px;border-radius:9px;color:var(--muted);transition:.2s}
.opt.sel,.opt:hover{border-color:var(--accent);color:var(--accent)}
.field textarea,.field input{width:100%;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:13px 15px;color:var(--text);font-family:var(--f-body);font-size:14.5px;resize:vertical}
.field textarea:focus,.field input:focus{border-color:var(--accent-line);outline:none}
.send{font-family:var(--f-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;background:var(--accent);color:#000;font-weight:700;padding:15px 22px;border-radius:12px;transition:.25s}
.send:hover{transform:translateY(-2px);box-shadow:0 14px 32px var(--accent-soft)}
.packet{border:1px solid var(--border);border-radius:20px;padding:26px;background:rgba(255,255,255,.022);position:sticky;top:90px}
.packet .pk-h{font-family:var(--f-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);margin-bottom:16px}
.packet .pk-row{font-family:var(--f-mono);font-size:12px;color:var(--muted);padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;gap:10px}
.packet .pk-row b{color:var(--accent);font-weight:500;text-align:right}
.packet.sent{border-color:var(--accent)}
.sent-banner{margin-top:18px;font-size:14px;color:#dcdcdc;display:none}
.packet.sent .sent-banner{display:block}
@media(max-width:760px){.signal{grid-template-columns:1fr}.packet{position:static}}

/* ASK (§11) */
#ask{position:fixed;inset:0;z-index:210;display:none}#ask.open{display:block}
.ask-bg{position:absolute;inset:0;background:rgba(2,2,2,.78);backdrop-filter:blur(8px)}
.ask-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);opacity:0;transition:.32s var(--ease);width:min(680px,92vw);max-height:84vh;background:var(--soft-black);border:1px solid var(--border);border-radius:22px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.7)}
#ask.open .ask-panel{transform:translate(-50%,-50%) scale(1);opacity:1}
.ask-head{padding:22px 24px;border-bottom:1px solid var(--border)}
.ask-head .h{font-family:var(--f-display);font-size:22px;font-weight:600}
.ask-head p{color:var(--muted);font-size:13.5px;margin-top:8px}
.ask-body{padding:18px 24px;overflow-y:auto;flex:1}
.ask-q{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.ask-q button{font-family:var(--f-mono);font-size:11px;border:1px solid var(--border);padding:8px 12px;border-radius:9px;color:var(--muted);transition:.2s}
.ask-q button:hover{border-color:var(--accent);color:var(--accent)}
.answer{font-size:14.5px;color:#dcdcdc;line-height:1.6;border-left:2px solid var(--accent);padding-left:16px;margin-top:8px}
.answer .src{font-family:var(--f-mono);font-size:11px;color:var(--accent);margin-top:12px}
.ask-foot{padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px}
.ask-foot input{flex:1;background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:12px 14px;color:var(--text);font-family:var(--f-body);font-size:14px}
.ask-foot button{font-family:var(--f-mono);font-size:12px;background:var(--accent);color:#000;font-weight:700;padding:0 18px;border-radius:11px}
.ask-close{position:absolute;top:18px;right:20px;font-family:var(--f-mono);font-size:11px;color:var(--muted);border:1px solid var(--border);padding:7px 11px;border-radius:8px;z-index:2}
.ask-close:hover{color:var(--text)}

/* COMMAND PALETTE (§8.3) */
#cmd{position:fixed;inset:0;z-index:220;display:none}#cmd.open{display:block}
.cmd-bg{position:absolute;inset:0;background:rgba(2,2,2,.7);backdrop-filter:blur(6px)}
.cmd-panel{position:absolute;left:50%;top:18%;transform:translateX(-50%);width:min(560px,92vw);background:var(--soft-black);border:1px solid var(--border);border-radius:18px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.7)}
.cmd-panel input{width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);padding:18px 20px;color:var(--text);font-family:var(--f-body);font-size:16px;outline:none}
.cmd-list{max-height:46vh;overflow-y:auto;padding:8px}
.cmd-item{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:10px;cursor:pointer;font-size:14px}
.cmd-item .g{font-family:var(--f-mono);font-size:10px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase}
.cmd-item.sel,.cmd-item:hover{background:var(--accent-soft)}.cmd-item.sel{color:var(--accent)}

.chaos-only{display:none}body.mode-chaos .chaos-only{display:block}

footer{position:relative;z-index:2;text-align:center;padding:60px var(--pad) 130px;color:var(--dim);font-family:var(--f-mono);font-size:11px;letter-spacing:.08em}
footer .sig{color:var(--accent);font-size:14px;letter-spacing:.04em;margin-bottom:10px}

@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
  #machine{height:auto}.machine-pin{position:relative;height:auto;padding:60px 0;gap:18px}.machine-field{display:none}
  .rise{opacity:1;transform:none}.title-reveal>span{transform:none}
  #spine,#bgfx,#cur,#curd,#curlabel{display:none}#dock{opacity:1;transform:translateX(-50%)}
}
</style>
</head>
<body class="lock mode-builder">

<canvas id="bgfx"></canvas>
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
    <span class="chip live">currently building</span>
    <span class="chip">available for useful chaos</span>
    <button class="kbd" id="cmdOpen" data-cursor="palette">⌘K</button>
  </div>
</header>

<!-- HERO -->
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
</section>

<!-- BRAIN INTERFACE -->
<section class="block" id="brain">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">BRAIN INTERFACE <b>//</b> ZONES</div>
    <h2 class="sec-title">This is not a portfolio.<br><span class="d2">It’s how my brain organizes proof.</span></h2></div>
    <div class="neural"><svg class="nlines" id="nlines"></svg><div class="brain-grid" id="brainGrid"></div></div>
  </div>
</section>

<!-- CHAOS MACHINE -->
<section id="machine" aria-label="Chaos to System">
  <div class="machine-pin">
    <div class="machine-stage-label mono" id="mStage">STAGE 01 — MESS</div>
    <div class="machine-copy" id="mCopy">Everything starts <em>messy.</em></div>
    <div class="machine-field" id="mField"><svg id="mSvg"></svg></div>
    <div class="big-stamp" id="mStamp"><span class="stamp">CHAOS SORTED</span></div>
    <div class="machine-steps" id="mSteps"><span>mess</span><span>map</span><span>build</span><span>break</span><span>fix</span><span>ship</span><span>proof</span></div>
    <div class="machine-prog"><i id="mProg"></i></div>
  </div>
</section>

<!-- EVIDENCE DESK -->
<section class="block" id="work">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">EVIDENCE DESK <b>//</b> CASE FILES</div>
    <h2 class="sec-title">Not claims.<br><span class="d2">Proof.</span></h2>
    <p class="lead">Five things I actually built, operated, broke, and fixed. Open any file to inspect the work.</p></div>
    <div class="cases" id="cases"></div>
  </div>
</section>

<!-- ROUTE MAP -->
<section class="block" id="story">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">ROUTE MAP <b>//</b> NON-LINEAR</div>
    <h2 class="sec-title">I didn’t follow the cleanest path.<br><span class="d2">I followed the one where I could build the most.</span></h2></div>
    <div class="route" id="route"><svg class="rpath" id="rpath"></svg><div id="routeNodes"></div></div>
  </div>
</section>

<!-- THINGS THAT BROKE -->
<section class="block" id="broke">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">POSTMORTEMS <b>//</b> HOVER TO RESOLVE</div>
    <h2 class="sec-title">Things that broke<br><span class="d2">and made me better.</span></h2>
    <p class="lead">Most portfolios hide the messy part. I use it as proof. Hover a bug to see the lesson.</p></div>
    <div class="bugs" id="bugs"></div>
  </div>
</section>

<!-- AI WORKFLOW -->
<section class="block" id="ai">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">AI WORKFLOW <b>//</b> LEVERAGE, NOT IDENTITY</div>
    <h2 class="sec-title">How I use AI<br><span class="d2">without outsourcing my brain.</span></h2></div>
    <div class="loop rise" id="loop"></div>
    <div class="lanes rise">
      <div class="lane ai"><h4>AI helped with</h4><ul><li>speed and first drafts</li><li>generating options to react to</li><li>writing and running test passes</li><li>finding bugs faster</li><li>debugging dead ends</li></ul></div>
      <div class="lane you"><h4>Priyanshu decided</h4><ul><li>direction and what matters</li><li>taste — when it feels generic</li><li>priority and scope</li><li>what to ship and what to ignore</li><li>whether the output is actually true</li></ul></div>
    </div>
  </div>
</section>

<!-- FRAGMENTS -->
<section class="block" id="frag">
  <div class="wrap"><div class="rise"><div class="eyebrow">IDENTITY <b>//</b> FRAGMENTS</div>
  <h2 class="sec-title">Fragments of me.</h2></div><div class="frags" id="frags"></div></div>
</section>

<!-- BUILD ROOM -->
<section class="block" id="now">
  <div class="wrap"><div class="rise"><div class="eyebrow">CURRENT BUILD ROOM <b>//</b> NOW</div>
  <h2 class="sec-title">Now.</h2><p class="lead">What I’m building, learning, exploring, and avoiding right now.</p></div>
  <div class="board" id="board"></div></div>
</section>

<!-- CONTACT -->
<section class="block" id="contact">
  <div class="wrap">
    <div class="rise"><div class="eyebrow">SIGNAL BUILDER <b>//</b> CONTACT</div>
    <h2 class="sec-title">Let’s build<br><span class="d2">something useful.</span></h2>
    <p class="lead">If you have chaos, context, or an idea that needs a system, send the signal.</p></div>
    <div class="signal rise">
      <form id="signalForm" novalidate>
        <div class="field"><label>1 — What is this about?</label><div class="opts" id="sigType"></div></div>
        <div class="field"><label>2 — What is the chaos?</label><textarea name="chaos" rows="3" placeholder="The messy version is fine. That’s the point."></textarea></div>
        <div class="field"><label>3 — What do you need?</label><textarea name="need" rows="2" placeholder="A system, a build, a person who figures it out…"></textarea></div>
        <div class="field"><label>4 — Your contact</label><input name="contact" placeholder="email or @handle" /></div>
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
</section>

<footer><div class="sig">My brain turns chaos into systems.</div>PRIYANSHU.OS — built, broke, tested, rebuilt · useful beats impressive</footer>

<!-- DOCK -->
<nav id="dock" aria-label="Primary">
  <button class="dock-btn active" data-go="home" data-cursor="home"><svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg><span>Home</span></button>
  <button class="dock-btn" data-go="brain"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/></svg><span>Brain</span></button>
  <button class="dock-btn" data-go="work"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM9 7V4h6v3"/></svg><span>Work</span></button>
  <button class="dock-btn" data-go="story"><svg viewBox="0 0 24 24"><path d="M5 4h14v16l-7-4-7 4z"/></svg><span>Story</span></button>
  <button class="dock-btn ask" data-ask data-cursor="ask"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 1 1-3-6.2L21 5M12 8v4M12 16h.01"/></svg><span>Ask</span></button>
  <button class="dock-btn" data-go="ai"><svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="4"/></svg><span>Lab</span></button>
  <button class="dock-btn" data-go="contact"><svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg><span>Contact</span></button>
</nav>

<!-- DRAWER -->
<div id="drawer" aria-hidden="true" role="dialog" aria-modal="true"><div class="drawer-bg" data-drawer-close></div><div class="drawer-panel" id="drawerPanel" tabindex="-1"></div></div>

<!-- ASK -->
<div id="ask" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="ask-bg" data-ask-close></div>
  <div class="ask-panel"><button class="ask-close" data-ask-close>Esc</button>
    <div class="ask-head"><div class="h">Ask the brain interface</div><p>I can answer what a resume cannot: what Priyanshu built, what broke, what he believes, how he uses AI, why founders should care, and what he’s building now.</p></div>
    <div class="ask-body"><div class="ask-q" id="askQ"></div><div id="askAnswer"></div></div>
    <div class="ask-foot"><input id="askInput" placeholder="Ask anything about Priyanshu…" /><button id="askSend">Ask</button></div>
  </div>
</div>

<!-- COMMAND PALETTE -->
<div id="cmd" aria-hidden="true" role="dialog" aria-modal="true"><div class="cmd-bg" data-cmd-close></div>
  <div class="cmd-panel"><input id="cmdInput" placeholder="Type a command… (open work, switch founder mode, ask, copy email)" /><div class="cmd-list" id="cmdList"></div></div>
</div>

<script>
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
const NS='http://www.w3.org/2000/svg';
const el=(t,a={})=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};

/* ---------------- DATA ---------------- */
const PROJECTS=[
 {id:'student',ac:'var(--lime)',cls:'',title:'Student Social / PeerSpark',role:'Builder · solo product',status:'IN PROGRESS',stamps:['IN PROGRESS','AI-ASSISTED'],timeline:'2024 → now',stack:['Next.js','Appwrite','React','Tailwind'],one:'A social app for students — pods, chat, and feeds — built before I fully felt ready.',context:'Students were scattered across generic chat apps with no shared space built for them.',problem:'No single place where a student community could organize into pods and actually talk.',built:['Pod / circle system','Real-time chat & feeds','Appwrite backend + auth','Frontend UI from scratch'],broke:['Appwrite permissions locked users out','Chat actions silently went missing','A one-file frontend got laggy at scale'],fixed:['Rebuilt the permission model around roles','Traced the missing actions to a state bug, added tests','Split the monolith into lazy-loaded modules'],lesson:'Backend permissions are a product surface, not config. Model them on day one.'},
 {id:'nirog',ac:'var(--gold)',cls:'gold',title:'Nirog Bhumi',role:'Founder-office · operator',status:'LIVE WORK',stamps:['LIVE WORK','FOUNDER MODE'],timeline:'live business',stack:['Google Workspace','WordPress','WooCommerce','Content ops'],one:'Founder-office work for a real wellness business: turning a vague operation into a running system.',context:'A live business with consultations, products, and content — and no underlying system.',problem:'Ambiguity everywhere: where files live, how bookings flow, how content ships.',built:['Shared-drive architecture people actually follow','Consultation booking flow','Wellness-commerce product pages','Content calendar + ops documentation'],broke:['Early folder structure no one could navigate','Scope kept drifting without a written system'],fixed:['Rebuilt drive around how people actually search','Wrote the system down so it survives without me'],lesson:'Operating is building. The system is the product when the product is a business.'},
 {id:'hack',ac:'var(--lime)',cls:'',title:'Hackathon Platforms',role:'Community · ops + web',status:'SHIPPED',stamps:['SHIPPED','REAL WORK'],timeline:'multiple events',stack:['HTML/PHP','Landing pages','Sponsor systems'],one:'Event websites, sponsorship systems, and on-the-ground coordination for hackathons.',context:'Hackathons need a web presence, sponsors, and a community that shows up.',problem:'Lots of moving parts; no single owner turning plans into a running event.',built:['Event website + landing frames','Sponsorship coordination system','Community + timeline coordination'],broke:['Unclear scope between organizers','Last-minute content changes under pressure'],fixed:['Defined who owns what, in writing','Built pages flexible enough to absorb changes'],lesson:'In community work, the system that survives chaos beats the plan that looks clean.'},
 {id:'ai',ac:'var(--blue)',cls:'blue',title:'AI QA Workflow',role:'AI-native · process',status:'ACTIVE LOOP',stamps:['ACTIVE LOOP','AI-ASSISTED'],timeline:'ongoing practice',stack:['ChatGPT Agent Mode','Codex','QA prompts'],one:'A repeatable loop where AI drafts, tests, and finds bugs — and I make the calls.',context:'AI can move fast, but speed without judgment ships the wrong thing confidently.',problem:'How to use AI as leverage without letting it decide what matters.',built:['Prompt → build → test → break → fix → ship loop','QA checklists run by an agent','Fix prompts + product critique passes'],broke:['AI generated confidently wrong code','Output looked premium but read generic'],fixed:['Added a verification pass I own','Kept taste and direction strictly human'],lesson:'AI is my multiplier, not my personality. It drafts; taste decides.'},
 {id:'agency',ac:'var(--lime)',cls:'',title:'Agency / Client Websites',role:'Builder · delivery',status:'DELIVERED',stamps:['DELIVERED','REAL WORK'],timeline:'client work',stack:['WordPress','WooCommerce','HTML/PHP','Shopify API','Next.js'],one:'Practical client builds across stacks — picking the right tool, not the trendy one.',context:'Clients need working sites and stores, on real deadlines, on varied stacks.',problem:'Each project wants a different stack; flexibility matters more than preference.',built:['WordPress / WooCommerce stores','Custom HTML/PHP work','Shopify API integrations','Next.js front-ends'],broke:['WordPress vs custom-architecture confusion','Git mistakes under time pressure'],fixed:['Chose architecture by constraint, not habit','Tightened my git discipline after the scare'],lesson:'Stack flexibility is a skill. The right tool is the one the project actually needs.'}
];
const NODES=[
 {nc:'var(--lime)',h:'Build',tags:['Next.js','Appwrite','WordPress','WooCommerce'],p:'Frontends, apps, shippable products. Student Social lives here.'},
 {nc:'var(--gold)',h:'Operate',tags:['founder-office','drive architecture','content ops'],p:'Turning a business into a system. Nirog Bhumi lives here.'},
 {nc:'var(--blue)',h:'AI',tags:['Agent Mode','Codex','QA loops'],p:'AI is leverage, not personality. It drafts; I decide.'},
 {nc:'#fff',h:'Community',tags:['hackathons','roundtables','ChatGPT Lab'],p:'I build with people, not just for them.'},
 {nc:'#fff',h:'Story',tags:['non-linear','ship to learn','proof over permission'],p:'I chose the route where I could build the most.'},
 {nc:'var(--red)',h:'Chaos',tags:['failures','open loops','experiments'],p:'Switch to Chaos mode to see what broke and what’s unfinished.'},
 {nc:'var(--lime)',h:'Proof',tags:['case files','shipped work','lessons'],p:'Every claim above resolves to something inspectable.'}
];
const ROUTE=[
 {c:'var(--lime)',when:'where it started',h:'Curiosity',p:'Less "what should I study," more "what can I build right now?"'},
 {c:'var(--lime)',when:'first builds',h:'Websites',p:'Learned the web by shipping it — HTML, WordPress, real pages for real people.'},
 {c:'#fff',when:'people',h:'Community',p:'Roundtables, the ChatGPT Lab, Enigma — building with others, not just alone.'},
 {c:'#fff',when:'events',h:'Hackathons',p:'Ran the unglamorous ops that make events actually happen.'},
 {c:'var(--blue)',when:'leverage',h:'AI Workflows',p:'Folded AI into how I build — as a multiplier, kept under my judgment.'},
 {c:'var(--lime)',when:'the product',h:'Student Social',p:'Built a full app: pods, chat, feeds. Broke it, fixed it, kept going.'},
 {c:'var(--gold)',when:'operating',h:'Founder’s Office',p:'Learned that running a business is just building a system you can’t see.'},
 {c:'var(--gold)',when:'live work',h:'Nirog Bhumi',p:'Turned a real wellness business into something that runs as a system.'},
 {c:'var(--lime)',when:'right now',h:'Current Build Room',p:'Priyanshu OS, Student Social, Nirog Bhumi systems — all open loops.',now:true}
];
const BUGS=[
 {t:'Appwrite permissions',proj:'Student Social',l:'Backend permissions are a product surface, not an afterthought.'},
 {t:'Chat actions missing',proj:'Student Social',l:'Silent failures hide in state. Tests find what eyes miss.'},
 {t:'Git mistakes',proj:'Client work',l:'Discipline under pressure is a skill you only learn by losing work once.'},
 {t:'AI wrote wrong code',proj:'AI QA Workflow',l:'Confident output still needs a verification pass that I own.'},
 {t:'Premium but generic UI',proj:'Multiple',l:'Looking expensive isn’t having taste. Generic is its own kind of broken.'},
 {t:'One-file laggy frontend',proj:'Student Social',l:'Architecture is a feature. Split early, lazy-load, measure.'},
 {t:'Unclear project scope',proj:'Hackathons',l:'Write down who owns what before the chaos, not during it.'},
 {t:'WP / custom confusion',proj:'Agency',l:'Choose architecture by constraint, never by habit or hype.'}
];
const LOOP=['Prompt','Build','Test','Break','Fix','Document','Ship'];
const FRAGS=[
 {i:'builder',h:'I build before I fully feel ready.',p:'Shipping is how I learn. Permission comes after proof.'},
 {i:'operator',h:'I make chaos manageable.',p:'Give me context and ownership; I’ll return a system.'},
 {i:'ai-native',h:'I use AI as leverage.',p:'It drafts and tests. I decide what’s true and what ships.'},
 {i:'community',h:'I build with people too.',p:'Events, roundtables, labs — building is partly a team sport.'},
 {i:'story',h:'I chose the route where I could build more.',p:'Non-linear on purpose. The detours were the point.'},
 {i:'taste',h:'I care when something feels generic.',p:'Premium isn’t a template. Signature is a decision.'}
];
const BOARD=[
 {h:'Building',c:'var(--lime)',items:['Nirog Bhumi systems','Student Social','Priyanshu OS']},
 {h:'Learning',c:'var(--blue)',items:['Product architecture','Scalable web systems','AI workflows']},
 {h:'Exploring',c:'#fff',items:['Conversational interfaces','Voice-based websites','Better proof-of-work storytelling']},
 {h:'Avoiding',c:'var(--red)',items:['Template portfolios','Fake productivity','Random overengineering']},
 {h:'Open loops',c:'var(--gold)',items:['Make portfolio visually personal','Improve AI answer context','Replace generic visuals','Optimize performance']}
];
const SIGTYPES=['hire','collaborate','website/app','founder-office','AI workflow','community/event','something useful'];
const ANSWERS={
 'who is priyanshu':{a:'A builder-operator from Jaipur. Not just a developer — he works across apps, websites, AI workflows, founder-office systems, community, and ops. His one rule: turn chaos into systems and back claims with proof.',s:'→ see Brain Interface + Evidence Desk'},
 'what is this portfolio':{a:'It’s Priyanshu OS — his brain turned into an interface. Every section answers "who is Priyanshu?" and every interaction answers "why should I care?" by showing proof instead of claims.',s:'→ you’re inside it right now'},
 'what has priyanshu actually built':{a:'Student Social (a full app: pods, chat, feeds), Nirog Bhumi founder-office systems, hackathon platforms, an AI QA workflow, and client websites across WordPress, WooCommerce, and Next.js.',s:'→ open any case file in Evidence Desk'},
 'is he technical or just using ai':{a:'Technical. He builds with Next.js, React, Appwrite, WordPress and more, and ships real apps. AI is leverage for speed, drafts, and testing — but direction, taste, and what ships are his calls.',s:'→ see AI-Native Workflow'},
 'what is his stack':{a:'Next.js, React, TypeScript, Tailwind, Appwrite, WordPress, WooCommerce, HTML/PHP, Shopify API, plus AI tooling like Agent Mode and Codex inside a QA loop.',s:'→ see case file stacks'},
 'why should a founder care':{a:'Because he handles ambiguity without needing perfect instructions. Give him chaos, context, and ownership, and he returns a working system — across product, ops, content, and AI.',s:'→ switch to Founder mode'},
 'what broke in his projects':{a:'Appwrite permissions, missing chat actions, git mistakes, AI-generated wrong code, generic-looking UI, a laggy one-file frontend, unclear scope. Each one became a lesson — that’s the proof.',s:'→ see Things That Broke'},
 'how does he use ai':{a:'In a loop: prompt → build → test → break → fix → document → ship. AI helps with speed, drafts, options, and debugging. Priyanshu owns direction, priority, taste, and whether the output is actually true.',s:'→ see AI-Native Workflow'},
 'what is he building now':{a:'Nirog Bhumi systems, Student Social, and Priyanshu OS itself — while learning product architecture and exploring conversational interfaces. He’s available for useful chaos.',s:'→ see the Current Build Room'}
};
const ASK_SUGGESTED=['Who is Priyanshu?','What has Priyanshu actually built?','Is he technical or just using AI?','Why should a founder care?','What broke in his projects?','How does he use AI?','What is he building now?'];

/* ---------------- RENDER ---------------- */
function stampCls(ac){return ac.includes('blue')?'blue':ac.includes('gold')?'gold':'';}
$('#cases').innerHTML=PROJECTS.map((p,i)=>`<article class="case rise tilt" style="--ac:${p.ac};transition-delay:${i*70}ms" data-case="${p.id}" data-cursor="open" tabindex="0" role="button" aria-label="Open ${p.title} case file"><div class="case-head"><div><h3>${p.title}</h3><div class="role">${p.role}</div></div><span class="stamp ${stampCls(p.ac)}">${p.status}</span></div><p class="one">${p.one}</p><div class="stk">${p.stack.map(s=>`<span>${s}</span>`).join('')}</div><div class="broke-strip">× ${p.broke[0]}</div><div class="open">Open case file <span aria-hidden="true">→</span></div></article>`).join('');
$('#brainGrid').innerHTML=NODES.map((n,i)=>`<div class="node rise" data-node="${i}" style="--nc:${n.nc};transition-delay:${i*60}ms"><div class="dot"></div><h3>${n.h}</h3><div class="tags">${n.tags.map(t=>`<span>${t}</span>`).join('')}</div><p>${n.p}</p></div>`).join('');
$('#routeNodes').innerHTML=ROUTE.map(n=>`<div class="route-node ${n.now?'now':''}" style="--rc:${n.c}"><div class="rdot"></div><div class="when">${n.when}</div><h4>${n.h}</h4><p>${n.p}</p></div>`).join('');
$('#bugs').innerHTML=BUGS.map((b,i)=>`<div class="bug rise" style="transition-delay:${i*50}ms" tabindex="0" aria-label="${b.t}: ${b.l}"><div class="bug-inner"><div class="bug-face bug-front"><span class="lbl">× broke</span><h4>${b.t}</h4><div class="proj">${b.proj}</div></div><div class="bug-face bug-back"><span class="lbl">✓ lesson</span><p>${b.l}</p></div></div></div>`).join('');
$('#loop').innerHTML=LOOP.map((s,i)=>`<div class="loop-step" data-loop="${i}">${s}</div>${i<LOOP.length-1?'<span class="arr">→</span>':'<span class="arr">↺</span>'}`).join('');
$('#frags').innerHTML=FRAGS.map((f,i)=>`<div class="fcard rise" style="transition-delay:${i*55}ms"><div class="ico">// ${f.i}</div><h4>${f.h}</h4><p>${f.p}</p></div>`).join('');
$('#board').innerHTML=BOARD.map((c,i)=>`<div class="col rise" style="--cc:${c.c};transition-delay:${i*55}ms"><h4>${c.h}</h4>${c.items.map(t=>`<div class="task">${t}</div>`).join('')}</div>`).join('');
$('#sigType').innerHTML=SIGTYPES.map(t=>`<button type="button" class="opt" data-sig="${t}">${t}</button>`).join('');
$('#askQ').innerHTML=ASK_SUGGESTED.map(q=>`<button data-ask-q="${q}">${q}</button>`).join('');

/* ---------------- BOOT (§10.1) ---------------- */
const bootLines=['Booting Priyanshu OS...','Loading unfinished ideas...','Loading shipped work...','Loading broken builds...','Loading AI chaos...','Loading founder mode...','Loading proof files...','System ready.'];
function runBoot(){const log=$('#bootLog');if(reduce){endBoot();return;}let i=0;const step=()=>{if(i<bootLines.length){const ok=i===bootLines.length-1;const e=document.createElement('div');e.className='ln'+(ok?' ok':'');e.innerHTML=ok?bootLines[i]:`<span class="c">›</span> ${bootLines[i]}`;log.appendChild(e);requestAnimationFrame(()=>e.classList.add('show'));$('#bootBar').style.width=((i+1)/bootLines.length*100)+'%';$('#bootBar').style.transition='width .25s linear';i++;setTimeout(step,210);}else{setTimeout(endBoot,500);}};setTimeout(step,300);setTimeout(()=>$('#skip').classList.add('show'),800);}
function endBoot(){$('#boot').classList.add('gone');document.body.classList.remove('lock');setTimeout(()=>$('#boot')?.remove(),700);startReveals();$('#dock').classList.add('in');layoutAll();}
$('#skip').addEventListener('click',endBoot);runBoot();

/* ---------------- REVEALS ---------------- */
function startReveals(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.14});$$('.rise').forEach(x=>io.observe(x));}
if(reduce)$$('.rise').forEach(x=>x.classList.add('in'));

/* ---------------- BACKGROUND NEURAL FIELD ---------------- */
const cv=$('#bgfx'),ctx=cv.getContext('2d');let parts=[],dpr=Math.min(2,devicePixelRatio||1);
function sizeCv(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
function seedParts(){const n=innerWidth<700?26:48;parts=Array.from({length:n},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18}));}
let accentRGB=[199,255,61];
function drawField(){ctx.clearRect(0,0,innerWidth,innerHeight);const[r,g,b]=accentRGB;for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;}for(let i=0;i<parts.length;i++){for(let j=i+1;j<parts.length;j++){const a=parts[i],c=parts[j];const dx=a.x-c.x,dy=a.y-c.y,d=Math.hypot(dx,dy);if(d<130){ctx.strokeStyle=`rgba(${r},${g},${b},${(1-d/130)*.10})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(c.x,c.y);ctx.stroke();}}}for(const p of parts){ctx.fillStyle=`rgba(${r},${g},${b},.5)`;ctx.beginPath();ctx.arc(p.x,p.y,1.1,0,7);ctx.fill();}}
if(!reduce){sizeCv();seedParts();}

/* ---------------- SPINE (top→bottom connector) ---------------- */
const spine=$('#spine'),spineG=$('#spineG');
let spinePath=null,spineDraw=null,spineComet=null,spineLen=0,spineNodes=[];
const SPINE_IDS=[['home','start'],['brain','brain'],['machine','chaos'],['work','proof'],['story','story'],['broke','broke'],['ai','ai'],['frag','self'],['now','now'],['contact','signal']];
function buildSpine(){
  if(reduce)return;
  spineG.innerHTML='';spineNodes=[];
  const docH=document.documentElement.scrollHeight,W=innerWidth;
  spine.setAttribute('width',W);spine.setAttribute('height',docH);spine.setAttribute('viewBox',`0 0 ${W} ${docH}`);
  const bandL=Math.max(20,Math.min(70,W*0.045));
  const pts=SPINE_IDS.map(([id],i)=>{const e=$('#'+id);if(!e)return null;const r=e.getBoundingClientRect();const top=r.top+scrollY;const y=top+Math.min(e.offsetHeight/2,innerHeight*0.45);const x=bandL+(i%2?38:0);return{x,y,id};}).filter(Boolean);
  if(pts.length<2)return;
  let d=`M ${pts[0].x} ${pts[0].y}`;
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],my=(a.y+b.y)/2;d+=` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;}
  spinePath=el('path',{class:'track',d});spineG.appendChild(spinePath);
  spineDraw=el('path',{class:'draw',d});spineG.appendChild(spineDraw);
  spineLen=spineDraw.getTotalLength();spineDraw.style.strokeDasharray=spineLen;spineDraw.style.strokeDashoffset=spineLen;
  pts.forEach((p,i)=>{const c=el('circle',{class:'snode',cx:p.x,cy:p.y,r:5});const lab=el('text',{class:'slabel',x:p.x+14,y:p.y+3});lab.textContent=SPINE_IDS[i][1];spineG.appendChild(c);spineG.appendChild(lab);spineNodes.push({c,id:p.id,len:spineDraw.getPointAtLength?0:0});});
  // approximate each node's length-position along path for lighting
  spineNodes.forEach((n,i)=>{n.frac=i/(spineNodes.length-1);});
  spineComet=el('circle',{class:'comet',cx:pts[0].x,cy:pts[0].y,r:4});spineG.appendChild(spineComet);
}

/* ---------------- BRAIN NEURAL LINES (§10.3) ---------------- */
const nlines=$('#nlines');
function buildNeural(){
  const wrap=$('.neural'),grid=$('#brainGrid');if(!wrap)return;
  const wr=wrap.getBoundingClientRect();
  nlines.setAttribute('viewBox',`0 0 ${wr.width} ${wr.height}`);
  nlines.innerHTML='';
  const cards=$$('.node',grid);const cx=wr.width/2,cy=wr.height/2;
  cards.forEach((card,i)=>{const r=card.getBoundingClientRect();const x=r.left-wr.left+r.width/2,y=r.top-wr.top+r.height/2;const p=el('path',{d:`M ${cx} ${cy} Q ${(cx+x)/2} ${(cy+y)/2+18} ${x} ${y}`,'data-line':i});const L=p.getTotalLength?0:0;nlines.appendChild(p);});
  // draw-in
  $$('#nlines path').forEach(p=>{const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;});
}
let neuralDrawn=false;
function drawNeural(){$$('#nlines path').forEach((p,i)=>{const L=p.getTotalLength();p.style.transition=`stroke-dashoffset .9s ${i*70}ms var(--ease)`;p.style.strokeDashoffset=0;});neuralDrawn=true;}
$$('#brainGrid').forEach;
document.addEventListener('mouseover',e=>{const n=e.target.closest('[data-node]');if(n){const i=n.dataset.node;const l=$(`#nlines path[data-line="${i}"]`);if(l)l.classList.add('hot');}});
document.addEventListener('mouseout',e=>{const n=e.target.closest('[data-node]');if(n){const i=n.dataset.node;const l=$(`#nlines path[data-line="${i}"]`);if(l)l.classList.remove('hot');}});

/* ---------------- ROUTE PATH (§10.7) ---------------- */
const rpath=$('#rpath');let rDraw=null,rTrack=null,rLen=0,rNodes=[];
function buildRoute(){
  const route=$('#route'),nodes=$$('.route-node');if(!nodes.length)return;
  const rr=route.getBoundingClientRect();
  rpath.setAttribute('viewBox',`0 0 30 ${rr.height}`);rpath.innerHTML='';
  rNodes=nodes.map(n=>{const r=n.querySelector('.rdot').getBoundingClientRect();return n.offsetTop+10;});
  let d=`M 7 ${rNodes[0]}`;for(let i=1;i<rNodes.length;i++){const a=rNodes[i-1],b=rNodes[i],my=(a+b)/2;const bend=i%2?16:0;d+=` C 7 ${my}, ${7+bend} ${my}, 7 ${b}`;}
  rTrack=el('path',{class:'rtrack',d});rpath.appendChild(rTrack);
  rDraw=el('path',{class:'rdraw',d});rpath.appendChild(rDraw);
  rLen=rDraw.getTotalLength();rDraw.style.strokeDasharray=rLen;rDraw.style.strokeDashoffset=rLen;
}

/* ---------------- CHAOS MACHINE (§10.4) ---------------- */
const STAGES=[{l:'STAGE 01 — MESS',c:'Everything starts <em>messy.</em>'},{l:'STAGE 02 — MAP',c:'Then I map <em>what actually exists.</em>'},{l:'STAGE 03 — BUILD',c:'Then I build the <em>first usable version.</em>'},{l:'STAGE 04 — BREAK',c:'Then reality <em>breaks the assumptions.</em>'},{l:'STAGE 05 — FIX',c:'Then I test, prompt, debug, and <em>rebuild.</em>'},{l:'STAGE 06 — SHIP',c:'Then it becomes <em>something people can use.</em>'},{l:'STAGE 07 — PROOF',c:'Not a claim. <em>Proof.</em>'}];
const FRAGTEXT=['vague idea','product note','a bug','a prompt','deadline','design ref','event plan','db issue','payment flow','content calendar','founder note','scope?'];
const mField=$('#mField'),mSvg=$('#mSvg');let fragEls=[],mLines=[];
function buildFrags(){const W=mField.clientWidth,H=mField.clientHeight;mSvg.setAttribute('viewBox',`0 0 ${W} ${H}`);fragEls=FRAGTEXT.map((t,i)=>{const e=document.createElement('div');e.className='frag';e.textContent=t;e.dataset.mx=(Math.random()*0.78+0.11);e.dataset.my=(Math.random()*0.7+0.14);e.dataset.rot=(Math.random()*18-9).toFixed(1);const cols=4,r=Math.floor(i/cols),c=i%cols;e.dataset.sx=((c+0.5)/cols);e.dataset.sy=(0.30+r*0.15);mField.appendChild(e);return e;});mLines=[];for(let i=0;i<fragEls.length;i++){const ln=el('line');mSvg.appendChild(ln);mLines.push(ln);}}
function placeFrags(p){const W=mField.clientWidth,H=mField.clientHeight;const order=Math.min(1,Math.max(0,(p-0.10)/0.55));const shake=(p>0.43&&p<0.57)?1:0;const pos=[];fragEls.forEach((e,i)=>{const mx=+e.dataset.mx,my=+e.dataset.my,sx=+e.dataset.sx,sy=+e.dataset.sy;let x=(mx+(sx-mx)*order)*W,y=(my+(sy-my)*order)*H;if(shake){x+=(Math.random()-.5)*10;y+=(Math.random()-.5)*10;}const rot=(+e.dataset.rot)*(1-order);e.style.transform=`translate(${x-40}px,${y-14}px) rotate(${rot}deg)`;e.classList.toggle('broke',p>0.43&&p<0.58&&i%3===0);e.classList.toggle('fixed',p>=0.58&&p<0.88&&i%3===0);e.style.opacity=p>0.9?Math.max(0,1-(p-0.9)*9):1;pos.push({x,y});});
  // map-stage lines connect neighbours, visible mainly during map/build
  const lineOp=Math.max(0,Math.min(1,(p-0.13)/0.12))*Math.max(0,Math.min(1,(0.62-p)/0.12));
  mLines.forEach((ln,i)=>{const a=pos[i],b=pos[(i+1)%pos.length];if(!a||!b){ln.setAttribute('opacity',0);return;}ln.setAttribute('x1',a.x);ln.setAttribute('y1',a.y);ln.setAttribute('x2',b.x);ln.setAttribute('y2',b.y);ln.setAttribute('opacity',lineOp*0.6);});}
function machineScroll(){if(reduce){$('#mStage').textContent=STAGES[6].l;$('#mCopy').innerHTML=STAGES[6].c;$('#mStamp').classList.add('hit');return;}const sec=$('#machine'),r=sec.getBoundingClientRect(),total=sec.offsetHeight-innerHeight,p=Math.min(1,Math.max(0,-r.top/total));$('#mProg').style.width=(p*100)+'%';const idx=Math.min(STAGES.length-1,Math.floor(p*STAGES.length));$('#mStage').textContent=STAGES[idx].l;$('#mCopy').innerHTML=STAGES[idx].c;$$('#mSteps span').forEach((s,i)=>s.classList.toggle('on',i<=idx));placeFrags(p);$('#mStamp').classList.toggle('hit',p>0.93);}

/* ---------------- LAYOUT ALL ---------------- */
function layoutAll(){buildSpine();buildNeural();buildRoute();if(!fragEls.length)buildFrags();machineScroll();}
let rzT;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(!reduce){sizeCv();seedParts();}layoutAll();},180);});
addEventListener('load',()=>setTimeout(layoutAll,200));

/* ---------------- MASTER SCROLL LOOP ---------------- */
let sy=scrollY,heroParts=$$('.obj',$('#desk'));
function globalProgress(){const max=document.documentElement.scrollHeight-innerHeight;return max>0?Math.min(1,Math.max(0,scrollY/max)):0;}
function updateSpine(gp){if(reduce||!spineDraw)return;spineDraw.style.strokeDashoffset=spineLen*(1-gp);const pt=spineDraw.getPointAtLength(spineLen*gp);spineComet.setAttribute('cx',pt.x);spineComet.setAttribute('cy',pt.y);const active=activeSection();spineNodes.forEach(n=>n.c.classList.toggle('on',n.id===active));}
function updateRoute(){if(reduce||!rDraw)return;const route=$('#route'),r=route.getBoundingClientRect();const start=innerHeight*0.85,end=innerHeight*0.25;let prog=(start-r.top)/(start-end+r.height*0.4);prog=Math.min(1,Math.max(0,prog));rDraw.style.strokeDashoffset=rLen*(1-prog);const litY=prog*r.height;$$('.route-node').forEach(n=>n.classList.toggle('lit',n.offsetTop<=litY+30));}
function activeSection(){const ids=['home','brain','machine','work','story','broke','ai','frag','now','contact'];let a='home',mid=innerHeight*0.42;ids.forEach(id=>{const e=$('#'+id);if(e&&e.getBoundingClientRect().top<=mid)a=id;});return a;}
function updateDock(){const a=activeSection();const map={home:'home',brain:'brain',machine:'work',work:'work',story:'story',broke:'story',ai:'ai',frag:'ai',now:'contact',contact:'contact'};$$('.dock-btn[data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===map[a]));}
function heroParallax(){if(reduce)return;const t=$('#home').getBoundingClientRect().top;if(t<-innerHeight)return;heroParts.forEach(o=>{const d=+o.dataset.d||4;o.style.transform=`translateY(${(-t)*d*0.012}px)`;});}
let aiSeen=false,aiTimer=null;
function aiLoopPulse(){const loop=$('#loop');if(!loop)return;const r=loop.getBoundingClientRect();if(r.top<innerHeight*0.8&&r.bottom>0&&!aiSeen){aiSeen=true;let i=0;const steps=$$('.loop-step');aiTimer=setInterval(()=>{steps.forEach(s=>s.classList.remove('pulse'));steps[i%steps.length].classList.add('pulse');i++;},520);}else if((r.bottom<0||r.top>innerHeight)&&aiSeen){aiSeen=false;clearInterval(aiTimer);$$('.loop-step').forEach(s=>s.classList.remove('pulse'));}}

let ticking=false;
function frame(){const gp=globalProgress();$('#prog').style.width=(gp*100)+'%';updateSpine(gp);machineScroll();updateRoute();updateDock();heroParallax();aiLoopPulse();ticking=false;}
function onScroll(){if(!ticking){requestAnimationFrame(frame);ticking=true;}}
addEventListener('scroll',onScroll,{passive:true});
if(!reduce){(function loop(){if(!document.hidden){drawField();}requestAnimationFrame(loop);})();}
frame();

/* brain neural draw when section enters */
const brainIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!neuralDrawn){buildNeural();requestAnimationFrame(drawNeural);}}),{threshold:.2});
brainIO.observe($('#brain'));

/* ---------------- HERO DESK pointer parallax ---------------- */
if(finePointer&&!reduce){const desk=$('#desk');desk.addEventListener('mousemove',e=>{const r=desk.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroParts.forEach(o=>{const d=+o.dataset.d||4;o.style.transform=`translate(${x*d*-4}px,${y*d*-4}px)`;});});}

/* ---------------- TILT cards ---------------- */
if(finePointer&&!reduce){$$('.tilt').forEach(c=>{c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`translateY(-6px) rotateX(${ -y*6}deg) rotateY(${x*7}deg)`;});c.addEventListener('mouseleave',()=>c.style.transform='');});}

/* ---------------- MAGNETIC buttons ---------------- */
if(finePointer&&!reduce){$$('.magnetic').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform=`translate(${x*.25}px,${y*.35}px)`;});b.addEventListener('mouseleave',()=>b.style.transform='');});}

/* ---------------- CUSTOM CURSOR ---------------- */
if(finePointer&&!reduce){const cur=$('#cur'),curd=$('#curd'),lab=$('#curlabel');let cx=innerWidth/2,cy=innerHeight/2,dx=cx,dy=cy;
 addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;cur.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;lab.style.left=cx+'px';lab.style.top=cy+'px';});
 (function curLoop(){dx+=(cx-dx)*.18;dy+=(cy-dy)*.18;curd.style.transform=`translate(${dx}px,${dy}px) translate(-50%,-50%)`;requestAnimationFrame(curLoop);})();
 document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-cursor],a,button');curd.classList.toggle('big',!!t);const c=e.target.closest('[data-cursor]');if(c){lab.textContent=c.dataset.cursor;lab.style.opacity=1;}else{lab.style.opacity=0;}});
}

/* ---------------- DRAWER (§10.6) ---------------- */
let lastFocus=null;
function openDrawer(id){const p=PROJECTS.find(x=>x.id===id);if(!p)return;lastFocus=document.activeElement;$('#drawerPanel').innerHTML=`<button class="drawer-close" data-drawer-close>Close · Esc</button><div class="dr-stamps">${p.stamps.map(s=>`<span class="stamp ${stampCls(p.ac)}">${s}</span>`).join('')}</div><h2 class="dr-title">${p.title}</h2><div class="dr-meta"><b>Role</b> · ${p.role}<br><b>Timeline</b> · ${p.timeline}<br><b>Stack</b> · ${p.stack.join(' · ')}</div><div class="dr-sec"><h4>Context</h4><p>${p.context}</p></div><div class="dr-sec"><h4>Problem</h4><p>${p.problem}</p></div><div class="dr-sec"><h4>What I built</h4><ul>${p.built.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="dr-sec broke"><h4>What broke</h4><ul>${p.broke.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="dr-sec fixed"><h4>How I fixed it</h4><ul>${p.fixed.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="dr-sec"><h4>What I learned</h4><p>${p.lesson}</p></div><button class="btn primary" data-ask style="margin-top:24px">Ask about this →</button>`;const d=$('#drawer');d.classList.add('open');d.setAttribute('aria-hidden','false');document.body.classList.add('lock');$('#drawerPanel').focus();}
function closeDrawer(){const d=$('#drawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');document.body.classList.remove('lock');if(lastFocus)lastFocus.focus();}
document.addEventListener('click',e=>{const c=e.target.closest('[data-case]');if(c){openDrawer(c.dataset.case);}if(e.target.closest('[data-drawer-close]'))closeDrawer();});
$('#cases').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.case){e.preventDefault();openDrawer(e.target.dataset.case);}});

/* ---------------- ASK (§11) ---------------- */
function norm(s){return s.toLowerCase().replace(/[^\w\s]/g,'').trim();}
function answerFor(q){const n=norm(q);let best=null,sc=0;for(const k in ANSWERS){let s=0;k.split(' ').forEach(w=>{if(n.includes(w))s++;});if(s>sc){sc=s;best=ANSWERS[k];}}return sc>=1&&best?best:{a:'I don’t have that exact context yet — but I can answer from the proof on this site. Try asking about Student Social, Nirog Bhumi, AI workflows, hackathons, his story, stack, or current work.',s:'→ honest by default. No fake metrics.'};}
function ask(q){const r=answerFor(q);$('#askAnswer').innerHTML=`<div class="answer"><strong style="color:#fff">${q}</strong><br><br>${r.a}<div class="src">${r.s}</div></div>`;$('#askInput').value='';}
function openAsk(pf){const a=$('#ask');a.classList.add('open');a.setAttribute('aria-hidden','false');document.body.classList.add('lock');if(pf)ask(pf);else $('#askAnswer').innerHTML='';setTimeout(()=>$('#askInput').focus(),60);}
function closeAsk(){const a=$('#ask');a.classList.remove('open');a.setAttribute('aria-hidden','true');document.body.classList.remove('lock');}
document.addEventListener('click',e=>{if(e.target.closest('[data-ask]')){closeDrawer();openAsk();}if(e.target.closest('[data-ask-close]'))closeAsk();const qb=e.target.closest('[data-ask-q]');if(qb)ask(qb.dataset.askQ);});
$('#askSend').addEventListener('click',()=>{const v=$('#askInput').value.trim();if(v)ask(v);});
$('#askInput').addEventListener('keydown',e=>{if(e.key==='Enter'){const v=e.target.value.trim();if(v)ask(v);}});

/* ---------------- MODES (§9) ---------------- */
const HEX={founder:'#C9A44C',builder:'#C7FF3D',recruiter:'#8FD8FF',story:'#F5F5F5',chaos:'#C7FF3D'};
function hexRGB(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
function setMode(mode){document.body.className='mode-'+mode+(document.body.classList.contains('lock')?' lock':'');const hex=HEX[mode]||HEX.builder;const[r,g,b]=hexRGB(hex);accentRGB=[r,g,b];document.documentElement.style.setProperty('--accent',hex);document.documentElement.style.setProperty('--accent-soft',`rgba(${r},${g},${b},.14)`);document.documentElement.style.setProperty('--accent-line',`rgba(${r},${g},${b},.30)`);$$('.mode-btn').forEach(x=>{const on=x.dataset.mode===mode;x.classList.toggle('on',on);x.style.background=on?hex:'';x.style.borderColor=on?hex:'';});}
$$('.mode-btn').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
document.addEventListener('click',e=>{const j=e.target.closest('[data-mode-jump]');if(j){setMode(j.dataset.modeJump);$('#work').scrollIntoView({behavior:reduce?'auto':'smooth'});}});
setMode('builder');

/* ---------------- SIGNAL (§10.12) ---------------- */
let sig={type:'',chaos:'',need:'',contact:''};
function syncPacket(){$('#pkType').textContent=sig.type||'—';$('#pkChaos').textContent=sig.chaos?(sig.chaos.slice(0,26)+(sig.chaos.length>26?'…':'')):'—';$('#pkNeed').textContent=sig.need?(sig.need.slice(0,26)+(sig.need.length>26?'…':'')):'—';$('#pkContact').textContent=sig.contact||'—';}
$('#sigType').addEventListener('click',e=>{const o=e.target.closest('[data-sig]');if(!o)return;$$('#sigType .opt').forEach(x=>x.classList.remove('sel'));o.classList.add('sel');sig.type=o.dataset.sig;syncPacket();});
$('#signalForm').addEventListener('input',e=>{const n=e.target.name;if(n){sig[n]=e.target.value;syncPacket();}});
$('#signalForm').addEventListener('submit',e=>{e.preventDefault();if(!sig.type||!sig.contact){$('#pkStamp').innerHTML=`<span class="stamp red">FILL TYPE + CONTACT</span>`;return;}$('#packet').classList.add('sent');$('#pkStamp').innerHTML=`<span class="stamp">SIGNAL SENT</span>`;$('.pk-h').textContent='// message packet — assembled';});

/* ---------------- COMMAND PALETTE (§8.3) ---------------- */
const CMDS=[
 {g:'navigate',l:'Open Brain',fn:()=>$('#brain').scrollIntoView({behavior:'smooth'})},
 {g:'navigate',l:'Open Work',fn:()=>$('#work').scrollIntoView({behavior:'smooth'})},
 {g:'navigate',l:'Open Story',fn:()=>$('#story').scrollIntoView({behavior:'smooth'})},
 {g:'navigate',l:'Open Lab / AI',fn:()=>$('#ai').scrollIntoView({behavior:'smooth'})},
 {g:'navigate',l:'Open Now',fn:()=>$('#now').scrollIntoView({behavior:'smooth'})},
 {g:'navigate',l:'Open Contact',fn:()=>$('#contact').scrollIntoView({behavior:'smooth'})},
 {g:'ask',l:'Ask about Priyanshu',fn:()=>openAsk()},
 {g:'proof',l:'Show Student Social',fn:()=>openDrawer('student')},
 {g:'proof',l:'Show Nirog Bhumi',fn:()=>openDrawer('nirog')},
 {g:'proof',l:'Show failures',fn:()=>{setMode('chaos');$('#broke').scrollIntoView({behavior:'smooth'});}},
 {g:'mode',l:'Switch Founder Mode',fn:()=>setMode('founder')},
 {g:'mode',l:'Switch Builder Mode',fn:()=>setMode('builder')},
 {g:'mode',l:'Switch Recruiter Mode',fn:()=>setMode('recruiter')},
 {g:'mode',l:'Switch Story Mode',fn:()=>setMode('story')},
 {g:'mode',l:'Switch Chaos Mode',fn:()=>setMode('chaos')},
 {g:'action',l:'Copy email',fn:()=>{navigator.clipboard?.writeText('hello@priyanshu.os');flash('Email copied');}}
];
let cmdSel=0,cmdF=CMDS;
function flash(m){const e=document.createElement('div');e.textContent=m;e.style.cssText='position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:400;background:var(--accent);color:#000;font-family:var(--f-mono);font-size:12px;padding:10px 16px;border-radius:10px;font-weight:700';document.body.appendChild(e);setTimeout(()=>e.remove(),1400);}
function renderCmd(){const q=norm($('#cmdInput').value);cmdF=q?CMDS.filter(c=>norm(c.l+' '+c.g).includes(q)):CMDS;cmdSel=0;$('#cmdList').innerHTML=cmdF.map((c,i)=>`<div class="cmd-item ${i===0?'sel':''}" data-i="${i}"><span>${c.l}</span><span class="g">${c.g}</span></div>`).join('')||`<div class="cmd-item">No commands</div>`;}
function openCmd(){$('#cmd').classList.add('open');$('#cmd').setAttribute('aria-hidden','false');$('#cmdInput').value='';renderCmd();setTimeout(()=>$('#cmdInput').focus(),50);}
function closeCmd(){$('#cmd').classList.remove('open');$('#cmd').setAttribute('aria-hidden','true');}
function runCmd(i){const c=cmdF[i];if(c){closeCmd();c.fn();}}
$('#cmdOpen').addEventListener('click',openCmd);
$('#cmdInput').addEventListener('input',renderCmd);
$('#cmdList').addEventListener('click',e=>{const it=e.target.closest('[data-i]');if(it)runCmd(+it.dataset.i);});
document.addEventListener('click',e=>{if(e.target.closest('[data-cmd-close]'))closeCmd();});

/* ---------------- KEYS ---------------- */
function updSel(){$$('#cmdList .cmd-item').forEach((e,i)=>e.classList.toggle('sel',i===cmdSel));}
addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#cmd').classList.contains('open')?closeCmd():openCmd();return;}
 if($('#cmd').classList.contains('open')){if(e.key==='Escape')closeCmd();if(e.key==='ArrowDown'){e.preventDefault();cmdSel=Math.min(cmdF.length-1,cmdSel+1);updSel();}if(e.key==='ArrowUp'){e.preventDefault();cmdSel=Math.max(0,cmdSel-1);updSel();}if(e.key==='Enter'){e.preventDefault();runCmd(cmdSel);}return;}
 if(e.key==='Escape'){closeDrawer();closeAsk();}
});

/* dock nav */
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{const t=$('#'+b.dataset.go);if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth'});}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)layoutAll();});
</script>
</body>
</html>
