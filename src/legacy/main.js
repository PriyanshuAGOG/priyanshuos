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
const lowPower=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||innerWidth<760;
const FIELD_FPS=lowPower?18:30;
function sizeCv(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
function seedParts(){const n=innerWidth<700?26:48;parts=Array.from({length:n},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18}));}
let accentRGB=[199,255,61];
function drawField(){ctx.clearRect(0,0,innerWidth,innerHeight);const[r,g,b]=accentRGB,maxD=130,maxD2=maxD*maxD;for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;}for(let i=0;i<parts.length;i++){for(let j=i+1;j<parts.length;j++){const a=parts[i],c=parts[j];const dx=a.x-c.x,dy=a.y-c.y,d2=dx*dx+dy*dy;if(d2<maxD2){const d=Math.sqrt(d2);ctx.strokeStyle=`rgba(${r},${g},${b},${(1-d/maxD)*.10})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(c.x,c.y);ctx.stroke();}}}for(const p of parts){ctx.fillStyle=`rgba(${r},${g},${b},.5)`;ctx.beginPath();ctx.arc(p.x,p.y,1.1,0,7);ctx.fill();}}
if(!reduce){sizeCv();seedParts();}

/* ---------------- SPINE (top→bottom connector) ---------------- */
const spine=$('#spine'),spineG=$('#spineG');
let spinePath=null,spineDraw=null,spineComet=null,spineLen=0,spineNodes=[];
const SPINE_IDS=[['home','start'],['brain','brain'],['machine','chaos'],['work','proof'],['story','story'],['broke','broke'],['ai','ai'],['frag','self'],['now','now'],['lab','lab'],['contact','signal']];
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
function machineScroll(){if(reduce){$('#mStage').textContent=STAGES[6].l;$('#mCopy').innerHTML=STAGES[6].c;$('#mStamp').classList.add('hit');return;}const sec=$('#machine'),r=sec.getBoundingClientRect();if(r.top>innerHeight||r.bottom<0)return;const total=sec.offsetHeight-innerHeight,p=Math.min(1,Math.max(0,-r.top/total));$('#mProg').style.width=(p*100)+'%';const idx=Math.min(STAGES.length-1,Math.floor(p*STAGES.length));$('#mStage').textContent=STAGES[idx].l;$('#mCopy').innerHTML=STAGES[idx].c;$$('#mSteps span').forEach((s,i)=>s.classList.toggle('on',i<=idx));placeFrags(p);$('#mStamp').classList.toggle('hit',p>0.93);}

/* ---------------- LAYOUT ALL ---------------- */
function layoutAll(){buildSpine();buildNeural();buildRoute();if(!fragEls.length)buildFrags();machineScroll();}
let rzT;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(!reduce){sizeCv();seedParts();}layoutAll();},180);});
addEventListener('load',()=>setTimeout(layoutAll,200));

/* ---------------- MASTER SCROLL LOOP ---------------- */
let sy=scrollY,heroParts=$$('.obj',$('#desk'));
function globalProgress(){const max=document.documentElement.scrollHeight-innerHeight;return max>0?Math.min(1,Math.max(0,scrollY/max)):0;}
function updateSpine(gp){if(reduce||!spineDraw)return;spineDraw.style.strokeDashoffset=spineLen*(1-gp);const pt=spineDraw.getPointAtLength(spineLen*gp);spineComet.setAttribute('cx',pt.x);spineComet.setAttribute('cy',pt.y);const active=activeSection();spineNodes.forEach(n=>n.c.classList.toggle('on',n.id===active));}
function updateRoute(){if(reduce||!rDraw)return;const route=$('#route'),r=route.getBoundingClientRect();if(r.top>innerHeight||r.bottom<0)return;const start=innerHeight*0.85,end=innerHeight*0.25;let prog=(start-r.top)/(start-end+r.height*0.4);prog=Math.min(1,Math.max(0,prog));rDraw.style.strokeDashoffset=rLen*(1-prog);const litY=prog*r.height;$$('.route-node').forEach(n=>n.classList.toggle('lit',n.offsetTop<=litY+30));}
function activeSection(){const ids=['home','brain','machine','work','story','broke','ai','frag','now','lab','contact'];let a='home',mid=innerHeight*0.42;ids.forEach(id=>{const e=$('#'+id);if(e&&e.getBoundingClientRect().top<=mid)a=id;});return a;}
function updateDock(){const a=activeSection();const map={home:'home',brain:'brain',machine:'work',work:'work',story:'story',broke:'story',ai:'ai',frag:'ai',now:'contact',lab:'lab',contact:'contact'};$$('.dock-btn[data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===map[a]));}
function heroParallax(){if(reduce)return;const t=$('#home').getBoundingClientRect().top;if(t<-innerHeight)return;heroParts.forEach(o=>{const d=+o.dataset.d||4;o.style.transform=`translateY(${(-t)*d*0.012}px)`;});}
let aiSeen=false,aiTimer=null;
function aiLoopPulse(){const loop=$('#loop');if(!loop)return;const r=loop.getBoundingClientRect();if(r.top<innerHeight*0.8&&r.bottom>0&&!aiSeen){aiSeen=true;let i=0;const steps=$$('.loop-step');aiTimer=setInterval(()=>{steps.forEach(s=>s.classList.remove('pulse'));steps[i%steps.length].classList.add('pulse');i++;},520);}else if((r.bottom<0||r.top>innerHeight)&&aiSeen){aiSeen=false;clearInterval(aiTimer);$$('.loop-step').forEach(s=>s.classList.remove('pulse'));}}

let ticking=false;
function frame(){const gp=globalProgress();$('#prog').style.width=(gp*100)+'%';updateSpine(gp);machineScroll();updateRoute();updateDock();heroParallax();aiLoopPulse();ticking=false;}
function onScroll(){if(!ticking){requestAnimationFrame(frame);ticking=true;}}
addEventListener('scroll',onScroll,{passive:true});
if(!reduce){let lastField=0;(function fieldLoop(t){if(!document.hidden&&!document.body.classList.contains('reduce-motion')&&t-lastField>1000/FIELD_FPS){drawField();lastField=t;}requestAnimationFrame(fieldLoop);})(0);}
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
window.openDrawer=openDrawer;
function openDrawer(id){const p=PROJECTS.find(x=>x.id===id);if(!p)return;lastFocus=document.activeElement;$('#drawerPanel').innerHTML=`<button class="drawer-close" data-drawer-close>Close · Esc</button><div class="dr-stamps">${p.stamps.map(s=>`<span class="stamp ${stampCls(p.ac)}">${s}</span>`).join('')}</div><h2 class="dr-title">${p.title}</h2><div class="dr-meta"><b>Role</b> · ${p.role}<br><b>Timeline</b> · ${p.timeline}<br><b>Stack</b> · ${p.stack.join(' · ')}</div><div class="dr-sec"><h4>Context</h4><p>${p.context}</p></div><div class="dr-sec"><h4>Problem</h4><p>${p.problem}</p></div><div class="dr-sec"><h4>What I built</h4><ul>${p.built.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="dr-sec broke"><h4>What broke</h4><ul>${p.broke.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="dr-sec fixed"><h4>How I fixed it</h4><ul>${p.fixed.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="dr-sec"><h4>What I learned</h4><p>${p.lesson}</p></div><button class="btn primary" data-ask style="margin-top:24px">Ask about this →</button>`;const d=$('#drawer');d.classList.add('open');d.setAttribute('aria-hidden','false');document.body.classList.add('lock');$('#drawerPanel').focus();}
function closeDrawer(){const d=$('#drawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');document.body.classList.remove('lock');if(lastFocus)lastFocus.focus();}
document.addEventListener('click',e=>{const c=e.target.closest('[data-case]');if(c){openDrawer(c.dataset.case);}if(e.target.closest('[data-drawer-close]'))closeDrawer();});
$('#cases').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.case){e.preventDefault();openDrawer(e.target.dataset.case);}});

/* ---------------- ASK (§11) ---------------- */
function norm(s){return s.toLowerCase().replace(/[^\w\s]/g,'').trim();}
function answerFor(q){const n=norm(q);let best=null,sc=0;for(const k in ANSWERS){let s=0;k.split(' ').forEach(w=>{if(n.includes(w))s++;});if(s>sc){sc=s;best=ANSWERS[k];}}return sc>=1&&best?best:{a:'I don’t have that exact context yet — but I can answer from the proof on this site. Try asking about Student Social, Nirog Bhumi, AI workflows, hackathons, his story, stack, or current work.',s:'→ honest by default. No fake metrics.'};}
function sectionForAnswer(r,q){const text=(q+' '+(r.s||'')).toLowerCase();if(text.includes('broke')||text.includes('failure'))return 'broke';if(text.includes('ai'))return 'ai';if(text.includes('current')||text.includes('now'))return 'now';if(text.includes('case')||text.includes('built')||text.includes('proof'))return 'work';if(text.includes('founder'))return 'work';return 'brain';}
function ask(q){const r=answerFor(q);const sec=sectionForAnswer(r,q);$('#askAnswer').innerHTML=`<div class="answer"><strong style="color:#fff">${q}</strong><br><br>${r.a}<div class="src">${r.s}</div><div class="quick-actions"><button type="button" data-go="${sec}">Open relevant section →</button><button type="button" data-ask-close>Keep browsing</button></div></div>`;$('#askInput').value='';}
function openAsk(pf){const a=$('#ask');a.classList.add('open');a.setAttribute('aria-hidden','false');document.body.classList.add('lock');if(pf)ask(pf);else $('#askAnswer').innerHTML='';setTimeout(()=>$('#askInput').focus(),60);}
function closeAsk(){const a=$('#ask');a.classList.remove('open');a.setAttribute('aria-hidden','true');document.body.classList.remove('lock');}
document.addEventListener('click',e=>{const askBtn=e.target.closest('[data-ask]');if(askBtn){closeDrawer();openAsk(askBtn.dataset.labPrompt||'');}if(e.target.closest('[data-ask-close]'))closeAsk();const qb=e.target.closest('[data-ask-q]');if(qb)ask(qb.dataset.askQ);});
$('#askSend').addEventListener('click',()=>{const v=$('#askInput').value.trim();if(v)ask(v);});
$('#askInput').addEventListener('keydown',e=>{if(e.key==='Enter'){const v=e.target.value.trim();if(v)ask(v);}});

/* ---------------- MODES (§9) ---------------- */
const HEX={founder:'#C9A44C',builder:'#C7FF3D',recruiter:'#8FD8FF',story:'#F5F5F5',chaos:'#C7FF3D'};
function hexRGB(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
window.setMode=setMode;
function setMode(mode){const locked=document.body.classList.contains('lock'),reduced=document.body.classList.contains('reduce-motion');document.body.className='mode-'+mode+(locked?' lock':'')+(reduced?' reduce-motion':'');const hex=HEX[mode]||HEX.builder;const[r,g,b]=hexRGB(hex);accentRGB=[r,g,b];document.documentElement.style.setProperty('--accent',hex);document.documentElement.style.setProperty('--accent-soft',`rgba(${r},${g},${b},.14)`);document.documentElement.style.setProperty('--accent-line',`rgba(${r},${g},${b},.30)`);$$('.mode-btn').forEach(x=>{const on=x.dataset.mode===mode;x.classList.toggle('on',on);x.style.background=on?hex:'';x.style.borderColor=on?hex:'';});}
$$('.mode-btn').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
document.addEventListener('click',e=>{const j=e.target.closest('[data-mode-jump]');if(j){setMode(j.dataset.modeJump);$('#work').scrollIntoView({behavior:reduce?'auto':'smooth'});}});
setMode('builder');

/* ---------------- SIGNAL (§10.12) ---------------- */
let sig={type:'',chaos:'',need:'',contact:''};
function syncPacket(){$('#pkType').textContent=sig.type||'—';$('#pkChaos').textContent=sig.chaos?(sig.chaos.slice(0,26)+(sig.chaos.length>26?'…':'')):'—';$('#pkNeed').textContent=sig.need?(sig.need.slice(0,26)+(sig.need.length>26?'…':'')):'—';$('#pkContact').textContent=sig.contact||'—';}
$('#sigType').addEventListener('click',e=>{const o=e.target.closest('[data-sig]');if(!o)return;$$('#sigType .opt').forEach(x=>x.classList.remove('sel'));o.classList.add('sel');sig.type=o.dataset.sig;syncPacket();setInvalid('type',false);});
$('#signalForm').addEventListener('input',e=>{const n=e.target.name;if(n){sig[n]=e.target.value;syncPacket();if($(`[data-field="${n}"]`)?.classList.contains('invalid'))validateSignal();}});
function validContact(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||/^@[A-Za-z0-9_.-]{2,}$/.test(v);}
function setInvalid(name,on){const f=$(`[data-field="${name}"]`);if(f)f.classList.toggle('invalid',!!on);}
function validateSignal(){const chaos=(sig.chaos||'').trim(),need=(sig.need||'').trim(),contact=(sig.contact||'').trim();const bad={type:!sig.type,chaos:chaos.length<12,need:need.length<6,contact:!validContact(contact)};Object.keys(bad).forEach(k=>setInvalid(k,bad[k]));return !Object.values(bad).some(Boolean);}
$('#signalForm').addEventListener('submit',e=>{e.preventDefault();if(!validateSignal()){$('#pkStamp').innerHTML=`<span class="stamp red">COMPLETE REQUIRED FIELDS</span>`;return;}$('#packet').classList.add('sent');$('#pkStamp').innerHTML=`<span class="stamp">SIGNAL SENT</span>`;$('.pk-h').textContent='// message packet — assembled';});

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


/* ---------------- ACCESSIBILITY: MOTION + VOICE ASK ---------------- */
let motionReduced=reduce||localStorage.getItem('priyanshu-reduce-motion')==='1';
function applyMotion(){document.body.classList.toggle('reduce-motion',motionReduced);const b=$('#motionToggle');if(b){b.classList.toggle('on',motionReduced);b.setAttribute('aria-pressed',String(motionReduced));b.textContent=motionReduced?'Motion off':'Motion';}}
function toggleMotion(){motionReduced=!motionReduced;localStorage.setItem('priyanshu-reduce-motion',motionReduced?'1':'0');applyMotion();flash(motionReduced?'Reduced motion enabled':'Motion restored');}
$('#motionToggle')?.addEventListener('click',toggleMotion);document.addEventListener('click',e=>{if(e.target.closest('[data-motion-action]'))toggleMotion();});applyMotion();
const AskSR=window.SpeechRecognition||window.webkitSpeechRecognition;let askRec=null;
function startAskVoice(){const btn=$('#askVoice');if(!AskSR){$('#askAnswer').innerHTML='<div class="answer">Voice input is not supported in this browser yet. You can still type your question below.</div>';return;}if(askRec){try{askRec.stop();}catch(_){ }askRec=null;btn.classList.remove('listening');return;}askRec=new AskSR();askRec.lang='en-US';askRec.interimResults=true;askRec.continuous=false;btn.classList.add('listening');$('#askInput').placeholder='Listening…';askRec.onresult=e=>{let text='';for(let i=e.resultIndex;i<e.results.length;i++)text+=e.results[i][0].transcript;if(text.trim())$('#askInput').value=text.trim();if(e.results[e.results.length-1].isFinal&&text.trim())ask(text.trim());};askRec.onerror=()=>{$('#askAnswer').innerHTML='<div class="answer">I could not access the microphone. Check browser permission or type the question.</div>';};askRec.onend=()=>{askRec=null;btn.classList.remove('listening');$('#askInput').placeholder='Ask anything about Priyanshu…';};askRec.start();}
$('#askVoice')?.addEventListener('click',startAskVoice);

/* ---------------- KEYS ---------------- */
function updSel(){$$('#cmdList .cmd-item').forEach((e,i)=>e.classList.toggle('sel',i===cmdSel));}
addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#cmd').classList.contains('open')?closeCmd():openCmd();return;}
 if($('#cmd').classList.contains('open')){if(e.key==='Escape')closeCmd();if(e.key==='ArrowDown'){e.preventDefault();cmdSel=Math.min(cmdF.length-1,cmdSel+1);updSel();}if(e.key==='ArrowUp'){e.preventDefault();cmdSel=Math.max(0,cmdSel-1);updSel();}if(e.key==='Enter'){e.preventDefault();runCmd(cmdSel);}return;}
 if(e.key==='Escape'){closeDrawer();closeAsk();}
});

/* dock nav */
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{const t=$('#'+b.dataset.go);if(t)t.scrollIntoView({behavior:(reduce||motionReduced)?'auto':'smooth'});}));
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(!g)return;const t=$('#'+g.dataset.go);if(t)t.scrollIntoView({behavior:(reduce||motionReduced)?'auto':'smooth'});});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)layoutAll();});
