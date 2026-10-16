/* Select / menu scene */
const PCOL=['#e8323c','#2f7bea','#1f9d55','#f08c00'];
const sel={scene:new THREE.Scene(),cam:new THREE.PerspectiveCamera(38,1,.1,100),chars:[],markers:[]};
sel.scene.background=new THREE.Color('#9fdcff');lights(sel.scene);
{const g=new THREE.Mesh(new THREE.CircleGeometry(40,40),lam('#86d36f'));g.rotation.x=-Math.PI/2;sel.scene.add(g);
 CHARS.forEach((d,i)=>{const x=(i-1.5)*3.1;const ped=cyl(1.2,1.35,.5,i%2?'#ffffff':'#e8323c',32);ped.position.set(x,.25,0);sel.scene.add(ped);
  const c=makeChar(d);c.position.set(x,.5,0);sel.scene.add(c);sel.chars.push(c)});
 PCOL.forEach(col=>{const m=cone(.3,.55,col,4);m.rotation.x=Math.PI;m.visible=false;sel.scene.add(m);sel.markers.push(m)});
 for(let i=0;i<5;i++){const cl=new THREE.Group();for(let j=0;j<4;j++)cl.add(ball(1+Math.random()*.6,'#ffffff',j*1.1,Math.random()*.4,0));cl.position.set(-22+i*10,8+Math.random()*3,-20);sel.scene.add(cl)}
}

/* =========================================================
   PENGATURAN (tersimpan di perangkat)
   ========================================================= */
const $=id=>document.getElementById(id);
const DEF={sessionMin:5,qTime:30,penalty:0,theme:'petualangan',music:true,fx:true,sound:true,names:['Kelompok Merah','Kelompok Biru','Kelompok Hijau','Kelompok Kuning'],topics:[1,2,3,4,5,6]};
const ST=JSON.parse(JSON.stringify(DEF));
try{const s=JSON.parse(localStorage.getItem('laskar-pecahan-v2')||'{}');Object.assign(ST,s)}catch(e){}
while(ST.names.length<4)ST.names.push(DEF.names[ST.names.length]);
function save(){try{localStorage.setItem('laskar-pecahan-v2',JSON.stringify(ST))}catch(e){}}
let toastT;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),3200)}

/* =========================================================
   SUARA: musik & efek dibuat langsung dengan Web Audio (tanpa file)
   ========================================================= */
const AC=window.AudioContext||window.webkitAudioContext;
const SND={ctx:null,timer:null,step:0,next:0,tempoMul:1};
function audioInit(){
  if(!AC)return false;
  try{
    if(!SND.ctx){const c=new AC();SND.ctx=c;SND.master=c.createGain();
      const limiter=c.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=8;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.18;
      SND.master.connect(limiter);limiter.connect(c.destination);
      SND.mus=c.createGain();SND.mus.connect(SND.master);SND.fxg=c.createGain();SND.fxg.connect(SND.master);
      const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.noise=b;applyVol(true)}
    if(SND.ctx.state==='suspended')SND.ctx.resume();
    return true}catch(e){return false}
}
function applyVol(now){if(!SND.ctx)return;const t=SND.ctx.currentTime,k=now?.001:.06;
  SND.master.gain.setTargetAtTime(ST.sound?2.2*(ST.volume??.85):0,t,k);SND.mus.gain.setTargetAtTime(ST.music?.42:0,t,k);SND.fxg.gain.setTargetAtTime(ST.fx?.9:0,t,k)}
const mf=m=>440*Math.pow(2,(m-69)/12);
function tone(dest,t,f,dur,o={}){const c=SND.ctx,os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);
  if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+(o.glide||dur));
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=f*.06;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+dur+.02)}
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||.3,t+(o.a||.005));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  os.connect(g);g.connect(dest);os.start(t);os.stop(t+dur+.03)}
function noiz(dest,t,dur,vol,hp){const c=SND.ctx,s=c.createBufferSource();s.buffer=SND.noise;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=c.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*.5);s.stop(t+dur+.03)}
const IN={
  lead:(t,m,d)=>tone(SND.mus,t,mf(m),d,{type:'square',vol:.075}),
  bass:(t,m,d)=>tone(SND.mus,t,mf(m),d,{type:'triangle',vol:.28}),
  pad:(t,m,d)=>tone(SND.mus,t,mf(m),d,{type:'triangle',vol:.045,a:.04}),
  kick:t=>tone(SND.mus,t,150,.16,{vol:.5,f2:45,glide:.12}),
  snare:t=>noiz(SND.mus,t,.12,.16,1500),
  hat:t=>noiz(SND.mus,t,.035,.06,7000),
  mar:(t,m)=>{tone(SND.mus,t,mf(m),.45,{vol:.22,a:.003});tone(SND.mus,t,mf(m)*4,.1,{vol:.04,a:.002})},
  pluck:(t,m)=>tone(SND.mus,t,mf(m),.24,{vol:.3,a:.004,f2:mf(m)*.97}),
  wood:(t,f)=>tone(SND.mus,t,f,.05,{vol:.12,a:.001,f2:f*.8,glide:.04}),
  boop:t=>tone(SND.mus,t,240,.15,{vol:.35,f2:90,glide:.1}),
  bub:t=>tone(SND.mus,t,450+Math.random()*350,.09,{vol:.07,f2:1500,glide:.08})
};
const SONGS={
  /* 1. Petualangan: chiptune semangat ala game arena (rekomendasi) */
  petualangan:{tempo:132,swing:0,
    lead:[[72,0,76,0,79,0,76,0,72,0,74,76,0,0,0,0],[74,0,79,0,83,0,79,0,74,0,76,77,0,0,0,0],[76,0,81,0,84,0,81,0,79,0,77,76,0,74,0,0],[77,0,76,0,74,0,72,0,74,0,0,0,79,0,0,0]],
    root:[36,43,45,41],chord:[[60,64,67],[59,62,67],[57,60,64],[57,60,65]],
    play(i,t,u){const b=i>>4,s=i&15,L=this.lead[b][s];if(L)IN.lead(t,L,u*1.8);
      if(s%2===0)IN.bass(t,this.root[b]+(s%4===2?12:0),u*1.7);if(s===0||s===8)this.chord[b].forEach(m=>IN.pad(t,m,u*7.5));
      if(s%8===0)IN.kick(t);if(s%8===4)IN.snare(t);if(s%2===1)IN.hat(t)}},
  /* 2. Ceria Gelembung: imut, memantul, marimba + bunyi gelembung (gaya game hewan peliharaan) */
  ceria:{tempo:108,swing:.33,
    lead:[[77,0,81,0,84,0,81,79,0,77,0,0,74,0,0,0],[74,0,77,0,81,0,79,77,0,74,0,0,72,0,0,0],[70,0,74,0,77,0,79,0,81,0,79,0,77,0,0,0],[79,0,0,77,79,0,81,0,84,0,0,0,0,0,0,0]],
    root:[41,38,46,36],
    play(i,t,u){const b=i>>4,s=i&15,L=this.lead[b][s];if(L)IN.mar(t,L);
      if(s===0||s===8)IN.pluck(t,this.root[b]+12);if(s===3||s===11)IN.pluck(t,this.root[b]+19);
      if(s===0||s===8)IN.boop(t);if(s===4||s===12)IN.wood(t,1600);if(s===14)IN.wood(t,1200);
      if(s%2===1&&Math.random()<.12)IN.bub(t)}}
};
function musicStart(){if(!audioInit()||SND.timer)return;SND.step=0;SND.next=SND.ctx.currentTime+.1;SND.timer=setInterval(sched,25)}
function sched(){const c=SND.ctx,song=SONGS[ST.theme]||SONGS.petualangan;if(SND.next<c.currentTime-.2)SND.next=c.currentTime+.05;
  while(SND.next<c.currentTime+.15){const u=60/(song.tempo*SND.tempoMul)/4;let t=SND.next;if(song.swing&&SND.step%2)t+=u*song.swing;
    if(ST.sound&&ST.music)song.play(SND.step%64,t,u);SND.next+=u;SND.step++}}
function sfx(name,arg){
  if(!ST.sound||!ST.fx||!audioInit())return;const t=SND.ctx.currentTime+.01,d=SND.fxg,cute=ST.theme==='ceria';
  switch(name){
    case 'tap':cute?tone(d,t,600,.08,{vol:.25,f2:1150,glide:.06}):tone(d,t,880,.05,{type:'square',vol:.07});break;
    case 'good':
      if(cute){[700,950,1300].forEach((f,i)=>tone(d,t+i*.07,f,.12,{vol:.3,f2:f*1.5,glide:.08}));tone(d,t+.24,2093,.45,{vol:.1});tone(d,t+.3,2637,.4,{vol:.07})}
      else{tone(d,t,988,.08,{type:'square',vol:.1});tone(d,t+.08,1319,.35,{type:'square',vol:.1});[1568,2093].forEach((f,i)=>tone(d,t+.2+i*.07,f,.25,{type:'triangle',vol:.12}))}break;
    case 'bad':
      if(cute){tone(d,t,330,.55,{vol:.3,f2:110,glide:.5,vib:9})}
      else{tone(d,t,330,.16,{type:'square',vol:.09});tone(d,t+.16,220,.35,{type:'square',vol:.09,f2:180})}break;
    case 'tick':tone(d,t,arg?1900:1400,.05,{type:arg?'square':'sine',vol:arg?.12:.28,a:.001});break;
    case 'beep':tone(d,t,880,.18,{type:'square',vol:.12});break;
    case 'go':[523,659,784,1047].forEach(f=>tone(d,t,f,.6,{type:'square',vol:.06}));break;
    case 'alarm':[0,.18,.36].forEach(o=>tone(d,t+o,1175,.12,{type:'square',vol:.1}));break;
    case 'whistle':tone(d,t,1800,.9,{type:'square',vol:.08,vib:28});tone(d,t+.9,900,.4,{vol:.2,f2:300});break;
    case 'pop':noiz(d,t,.18,.35,800);tone(d,t,180,.15,{vol:.3,f2:60,glide:.12});[1568,2093,2637].forEach((f,i)=>tone(d,t+.05+i*.05,f,.18,{vol:.06}));break;
    case 'fanfare':{const seq=[[0,67,.14],[.15,67,.14],[.3,67,.14],[.45,72,.55],[1.05,76,.2],[1.3,79,.2],[1.55,84,1.2]];
      seq.forEach(([o,m,du])=>{tone(d,t+o,mf(m),du,{type:cute?'sine':'square',vol:cute?.25:.09});tone(d,t+o,mf(m-12),du,{type:'triangle',vol:.12})});
      [72,76,79].forEach(m=>tone(d,t+1.55,mf(m),1.3,{type:'triangle',vol:.08}));break}
  }
}
function renderSnd(){const b=$('snd');b.setAttribute('aria-pressed',ST.sound);b.querySelector('.on').toggleAttribute('hidden',!ST.sound);b.querySelector('.off').toggleAttribute('hidden',ST.sound);b.setAttribute('aria-label',ST.sound?'Matikan suara':'Nyalakan suara')}
const tap=(el,fn)=>el.addEventListener('pointerdown',e=>{e.preventDefault();fn(e)});
tap($('snd'),()=>{ST.sound=!ST.sound;save();musicStart();applyVol();renderSnd();sfx('tap')});
renderSnd();
document.addEventListener('pointerdown',()=>musicStart(),{once:true});
document.addEventListener('keydown',()=>musicStart(),{once:true});

/* =========================================================
   STATE & ALUR LAYAR
   ========================================================= */
const state={screen:'menu',mode:1,picks:[],picking:0,selIdx:0,players:[],paused:false,running:false,left:0,token:0,lastWhole:-1,startedAt:null};
const H=new THREE.Vector3(-2,0,1.6),S=new THREE.Vector3(5.5,0,-8),E=new THREE.Vector3(-.5,0,.6);
function showScreen(s){state.screen=s;['menu','select','setup','game','podium'].forEach(id=>$(id).hidden=id!==s)}
const fmtTime=s=>{s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function big(text,cls,anim){const b=$('big');b.className='';void b.offsetWidth;b.textContent=text;b.className=(cls||'')+' '+(anim||'show')}
const swatch=d=>d.id==='panda'?'linear-gradient(90deg,#2a2a35 30%,#fff 30%)':d.color;

/* menu */
function renderRules(){$('rules').textContent=`${ST.qTime} detik tiap soal · Benar +5 poin${ST.penalty?` · Salah −${ST.penalty}`:''} · Soal ke-3, 6, 9, … soal cerita`}
function renderTopics(){const w=$('topics');w.innerHTML='';
  const all=document.createElement('button');all.className='chip';all.setAttribute('aria-pressed',ST.topics.length===6);all.innerHTML='<b>★</b>Semua bab';
  tap(all,()=>{ST.topics=[1,2,3,4,5,6];save();sfx('tap');renderTopics()});w.appendChild(all);
  for(const [id,name] of TOPICS){const b=document.createElement('button');b.className='chip';b.setAttribute('aria-pressed',ST.topics.length<6&&ST.topics.includes(id));b.innerHTML=`<b>${id}</b>${name}`;
    tap(b,()=>{sfx('tap');if(ST.topics.length===6)ST.topics=[id];else if(ST.topics.includes(id)){ST.topics=ST.topics.filter(x=>x!==id);if(!ST.topics.length)ST.topics=[1,2,3,4,5,6]}else ST.topics.push(id);save();renderTopics()});w.appendChild(b)}}
renderTopics();renderRules();
tap($('b1'),()=>{sfx('tap');startSelect(1)});tap($('b2'),()=>{sfx('tap');startSelect(2)});tap($('b4'),()=>{sfx('tap');startSelect(4)});
tap($('fs'),()=>{try{document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}});

/* pilih karakter */
const cardsWrap=$('cards');
CHARS.forEach((d,i)=>{const b=document.createElement('button');b.className='chunky ccard';b.innerHTML=`<span class="sw" style="background:${swatch(d)}"></span><b>${d.name}</b><small>${d.kind}</small><span class="tk"></span>`;
  tap(b,()=>{state.selIdx=i;sfx('tap');updateSel()});cardsWrap.appendChild(b)});
let selJump=0;
function startSelect(mode){state.mode=mode;state.picks=[];state.picking=0;state.selIdx=0;showScreen('select');updateSel()}
function updateSel(){const h=$('selHead');h.className='sel-head p'+(state.picking+1);h.innerHTML=`<span class="pl">Pemain ${state.picking+1}</span>, pilih jagoanmu!`;
  [...cardsWrap.children].forEach((c,i)=>{c.setAttribute('aria-pressed',i===state.selIdx);
    c.querySelector('.tk').innerHTML=state.picks.slice(0,state.picking).map((ci,j)=>ci===i?`<span class="tag t${j}">P${j+1}</span>`:'').join('')});
  const count={};sel.markers.forEach((m,j)=>{const on=j<state.picking;m.visible=on;if(on){const ci=state.picks[j];const k=count[ci]=(count[ci]||0)+1;m.position.set(sel.chars[ci].position.x-.9+k*.45,3.9,0)}});selJump=0}
function hideMarkers(){sel.markers.forEach(m=>m.visible=false)}
tap($('selGo'),()=>{sfx('good');state.picks[state.picking]=state.selIdx;
  if(state.picking<state.mode-1){state.picking++;const used=new Set(state.picks);let n=(state.selIdx+1)%4;for(let k=0;k<4&&used.has(n);k++)n=(n+1)%4;state.selIdx=n;updateSel()}else{hideMarkers();openSetup()}});
tap($('selBack'),()=>{sfx('tap');if(state.picking>0){state.picking--;state.selIdx=state.picks[state.picking];updateSel()}else{hideMarkers();showScreen('menu')}});

/* persiapan */
function chipGroup(el,items,get,set){el.innerHTML='';for(const [v,label,sub] of items){const b=document.createElement('button');b.className='chip';b.innerHTML=label+(sub?`<small>${sub}</small>`:'');b.setAttribute('aria-pressed',get()===v);
  tap(b,()=>{set(v);save();sfx('tap');renderSetup()});el.appendChild(b)}}
function renderSetup(){
  $('volume').value=Math.round((ST.volume??.85)*100);$('volumeVal').textContent=$('volume').value+'%';
  chipGroup($('durChips'),[[3,'3 menit'],[5,'5 menit'],[10,'10 menit'],[15,'15 menit']],()=>ST.sessionMin,v=>ST.sessionMin=v);
  chipGroup($('qtChips'),[[15,'15 dtk'],[20,'20 dtk'],[30,'30 dtk'],[45,'45 dtk'],[60,'60 dtk']],()=>ST.qTime,v=>ST.qTime=v);
  chipGroup($('penChips'),[[0,'Tidak dikurangi'],[5,'−5 poin'],[10,'−10 poin']],()=>ST.penalty,v=>ST.penalty=v);
  chipGroup($('themeChips'),[['petualangan','Petualangan','Chiptune semangat · rekomendasi'],['ceria','Ceria Gelembung','Imut & memantul, gaya Pou']],()=>ST.theme,v=>{ST.theme=v;SND.step=0});
  $('durVal').textContent=ST.sessionMin+' menit';$('qtVal').textContent=ST.qTime+' detik';
  $('musT').setAttribute('aria-pressed',ST.music);$('musT').textContent='Musik: '+(ST.music?'nyala':'mati');
  $('fxT').setAttribute('aria-pressed',ST.fx);$('fxT').textContent='Efek suara: '+(ST.fx?'nyala':'mati');
  renderRules();
}
tap($('durMinus'),()=>{ST.sessionMin=Math.max(1,ST.sessionMin-1);save();sfx('tap');renderSetup()});
tap($('durPlus'),()=>{ST.sessionMin=Math.min(60,ST.sessionMin+1);save();sfx('tap');renderSetup()});
tap($('qtMinus'),()=>{ST.qTime=Math.max(10,ST.qTime-5);save();sfx('tap');renderSetup()});
tap($('qtPlus'),()=>{ST.qTime=Math.min(180,ST.qTime+5);save();sfx('tap');renderSetup()});
tap($('musT'),()=>{ST.music=!ST.music;save();applyVol();renderSetup();sfx('tap')});
tap($('fxT'),()=>{ST.fx=!ST.fx;save();applyVol();renderSetup();sfx('tap')});
$('volume').addEventListener('input',()=>{ST.volume=Number($('volume').value)/100;$('volumeVal').textContent=$('volume').value+'%';save();audioInit();applyVol()});
function openSetup(){
  const box=$('names');box.innerHTML='';
  for(let i=0;i<state.mode;i++){const d=CHARS[state.picks[i]];const row=document.createElement('div');row.className='namebox';
    row.innerHTML=`<span class="tag t${i}">P${i+1}</span><span class="sw" style="background:${swatch(d)}"></span><input id="nm${i}" maxlength="22" autocomplete="off" placeholder="${DEF.names[i]}" aria-label="Nama kelompok pemain ${i+1}">`;
    box.appendChild(row);const inp=row.querySelector('input');inp.value=ST.names[i]||'';inp.addEventListener('input',()=>{ST.names[i]=inp.value;save()})}
  renderSetup();showScreen('setup');
}
tap($('setBack'),()=>{sfx('tap');startSelect(state.mode)});
tap($('setGo'),()=>{if(document.activeElement)document.activeElement.blur();sfx('good');startGame()});
const groupName=i=>(ST.names[i]||'').trim()||DEF.names[i];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* =========================================================
   PERMAINAN
   ========================================================= */
const RING=2*Math.PI*38;
function makePlayer(i,def){
  const ar=makeArena();const cam=new THREE.PerspectiveCamera(42,1,.1,100);
  const hero=makeChar(def);hero.position.copy(H);ar.scene.add(hero);
  const el=document.createElement('div');el.className='panel p'+(i+1);
  el.innerHTML=`<div class="hud"><div class="who"><span class="tag t${i}">P${i+1}</span><span class="gn"><b></b><small>${def.name} · ${def.kind}</small></span></div>
    <div class="clock"><svg viewBox="0 0 100 100"><circle class="face" cx="50" cy="50" r="46"/><circle class="trk" cx="50" cy="50" r="38"/><circle class="arc" cx="50" cy="50" r="38" stroke-dasharray="${RING}" stroke-dashoffset="0"/></svg><b>${ST.qTime}</b><small>detik</small></div>
    <div class="score"><span>Poin</span><b>0</b></div></div>
  <div class="stage"><div class="popmsg"></div></div>
  <div class="card waiting"><div class="meta"><span>Bersiap…</span></div><div class="qtext">Soal muncul setelah hitungan mundur.</div><div class="opts"></div><div class="explain" hidden></div></div>`;
  el.querySelector('.gn b').textContent=groupName(i);
  return{i,def,group:groupName(i),scene:ar.scene,parts:ar.parts,cam,hero,enemy:null,score:0,correct:0,wrong:0,num:0,time:ST.qTime,phase:'wait',anim:null,lock:0,q:null,shake:0,el,lastSec:-1,hist:[],
    ui:{score:el.querySelector('.score b'),clock:el.querySelector('.clock'),arc:el.querySelector('.arc'),sec:el.querySelector('.clock b'),stage:el.querySelector('.stage'),pop:el.querySelector('.popmsg'),card:el.querySelector('.card'),meta:el.querySelector('.meta'),text:el.querySelector('.qtext'),opts:el.querySelector('.opts'),exp:el.querySelector('.explain')}};
}
function spawnEnemy(p){if(p.enemy)p.scene.remove(p.enemy);p.enemy=makeSlime();p.enemy.position.copy(S);p.enemy.scale.setScalar(.01);p.scene.add(p.enemy)}
function startGame(){
  const tok=++state.token;
  const wrap=$('panels');wrap.innerHTML='';state.players=[];state.paused=false;state.running=false;state.left=ST.sessionMin*60;state.lastWhole=-1;state.startedAt=new Date();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,state.mode===4?1:1.5));
  for(let i=0;i<state.mode;i++){const p=makePlayer(i,CHARS[state.picks[i]]);state.players.push(p);wrap.appendChild(p.el);spawnEnemy(p)}
  wrap.className=state.mode===4?'quad':state.mode===2?'two':'one';$('vs').hidden=state.mode===1;
  $('pause').hidden=true;$('review').hidden=true;showScreen('game');layout();updateSession();
  SND.tempoMul=1;
  ['3','2','1','MULAI!'].forEach((s,k)=>setTimeout(()=>{if(tok!==state.token)return;
    if(k<3){big(s);sfx('beep')}else{big(s,'wide');sfx('go');state.running=true;state.players.forEach(nextQ)}},400+k*900));
}
function nextQ(p){
  p.num++;p.q=makeQuestion(ST.topics,p.num);p.time=ST.qTime;p.phase='ask';p.anim=null;p.lastSec=-1;spawnEnemy(p);
  const q=p.q,u=p.ui;u.card.classList.remove('waiting');
  u.meta.innerHTML=`<span>Soal ${p.num}</span><span class="k-${q.kind}">${KIND[q.kind]}</span><span>${TOPICS[q.topic-1][1]}</span>`;
  u.text.className='qtext'+(q.story?' story':'');u.text.innerHTML=q.text;
  u.opts.className='opts'+(q.options.length===3?' three':'');u.opts.innerHTML='';u.exp.hidden=true;
  q.options.forEach((o,j)=>{const b=document.createElement('button');b.className='opt';b.dataset.k=o.key;b.innerHTML=(q.options.length===3?'':`<span class="L">${'ABCD'[j]}</span>`)+`<span class="v">${o.html}</span>`;
    tap(b,()=>answer(p,o.key));u.opts.appendChild(b)});
}
function record(p,k,status){const q=p.q;p.hist.push({num:p.num,kind:q.kind,topic:q.topic,text:q.text,options:q.options,answer:q.answer,correctHtml:q.correctHtml,steps:q.steps,picked:k,status})}
function answer(p,k){
  if(p.phase!=='ask'||state.paused||!state.running)return;p.phase='lock';
  const ok=k!==null&&k===p.q.answer;record(p,k,ok?'benar':k===null?'habis':'salah');
  [...p.ui.opts.children].forEach(b=>{const bk=b.dataset.k;b.classList.add(bk===p.q.answer?'right':bk===k?'wrong':'dim')});
  const u=p.ui;u.pop.className='popmsg';void u.pop.offsetWidth;u.score.classList.remove('bump','drop');void u.score.offsetWidth;
  if(ok){p.score+=5;p.correct++;p.anim={type:'hit',t:0};u.pop.textContent='BENAR! +5';u.pop.className='popmsg good show';sfx('good');u.score.classList.add('bump')}
  else{p.wrong++;const before=p.score;p.score=Math.max(0,p.score-ST.penalty);const lost=before-p.score;p.anim={type:'miss',t:0};
    u.pop.textContent=(k===null?'Waktu habis!':'Belum tepat')+(lost?` −${lost}`:'');u.pop.className='popmsg bad show';sfx('bad');if(lost)u.score.classList.add('drop')}
  u.score.textContent=p.score;
  const st=p.q.steps||[];
  u.exp.innerHTML=(ok?'<b>Hebat!</b> Cara mengerjakannya:':`Jawaban benar: <b>${p.q.correctHtml}</b>. Cara mengerjakannya:`)+`<ol>${st.map(x=>`<li>${x}</li>`).join('')}</ol>`;u.exp.hidden=false;
  p.lock=ok?Math.min(5,2.2+st.length*.35):Math.min(7,3.5+st.length*.6);
}
function updateSession(){
  const total=ST.sessionMin*60,left=state.left;$('stime').textContent=fmtTime(left);
  $('sbarFill').style.transform=`scaleX(${Math.max(0,left/total)})`;
  const warn=left<=30;$('sclock').classList.toggle('warn',warn);$('sbar').classList.toggle('warn',warn);
}
function sessionTick(dt){
  state.left-=dt;const whole=Math.ceil(state.left);
  if(whole!==state.lastWhole){state.lastWhole=whole;
    if(whole===60&&ST.sessionMin>1){big('1 MENIT LAGI!','wide','hold');sfx('alarm')}
    if(whole===30){big('30 DETIK LAGI!','wide red','hold');sfx('alarm');SND.tempoMul=1.2}
    if(whole<=10&&whole>0){big(String(whole),'red');sfx('tick',1)}
  }
  if(state.left<=0){state.left=0;endSession()}
  updateSession();
}
function closeOpen(){state.players.forEach(p=>{if(p.phase==='ask'&&p.q)record(p,undefined,'belum');p.phase='end';p.el.classList.remove('danger')})}
function endSession(){
  state.running=false;const tok=state.token;closeOpen();
  big('WAKTU HABIS!','wide','hold');sfx('whistle');SND.tempoMul=1;
  setTimeout(()=>{if(tok===state.token)showPodium()},2300);
}

/* jeda */
tap($('pauseBtn'),()=>{if(state.screen!=='game')return;sfx('tap');state.paused=true;$('pause').hidden=false});
tap($('resume'),()=>{sfx('tap');state.paused=false;$('pause').hidden=true});
tap($('finish'),()=>{sfx('tap');$('pause').hidden=true;state.paused=false;state.token++;state.running=false;closeOpen();SND.tempoMul=1;showPodium()});

/* keyboard untuk uji di laptop: P1 = 1 2 3 4, P2 = 7 8 9 0, P3 = Q W E R, P4 = U I O P */
const KEYS={'1':[0,0],'2':[0,1],'3':[0,2],'4':[0,3],'7':[1,0],'8':[1,1],'9':[1,2],'0':[1,3],q:[2,0],w:[2,1],e:[2,2],r:[2,3],u:[3,0],i:[3,1],o:[3,2],p:[3,3]};
addEventListener('keydown',e=>{if(state.screen!=='game'||e.target.tagName==='INPUT')return;const m=KEYS[e.key.toLowerCase()];
  if(!m)return;const p=state.players[m[0]];if(!p||!p.q)return;const o=p.q.options[m[1]];if(o)answer(p,o.key)});

/* =========================================================
   PODIUM APRESIASI
   ========================================================= */
let pod=null;
function texCanvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
function fitText(x,text,maxW,size,weight,fam){let s=size;do{x.font=`${weight} ${s}px ${fam}`;s-=2}while(x.measureText(text).width>maxW&&s>12)}
const FD='"Baloo 2", "Trebuchet MS", sans-serif',FB='Nunito, "Segoe UI", sans-serif';
const dateID=d=>d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
function backdropTex(){return texCanvas(2048,900,(x,w,h)=>{
  const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#5cbf5a');g.addColorStop(.55,'#a8dc5e');g.addColorStop(1,'#f2ea6a');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.globalAlpha=.14;x.fillStyle='#ffffff';x.font=`800 210px ${FD}`;x.textAlign='center';
  [['½',180,300],['¾',1850,330],['⅓',300,760],['⅔',1750,780],['¼',1020,240]].forEach(([s,a,b])=>x.fillText(s,a,b));x.globalAlpha=1;
  x.fillStyle='#e8323c';x.fillRect(0,0,w,46);x.fillStyle='#ffffff';x.fillRect(0,46,w,46);
  x.textAlign='center';x.fillStyle='#e8323c';x.font=`800 96px ${FD}`;x.fillText('APRESIASI JUARA',w/2,440);
  x.fillStyle='#1e2a4a';x.font=`700 40px ${FB}`;x.fillText('Laskar Pecahan · Latihan TKA Matematika SD · '+dateID(new Date()),w/2,505)})}
function numTex(n,w,h){return texCanvas(Math.round(220*w),Math.round(220*h),(x,W,H)=>{x.fillStyle='#2f6fd6';x.fillRect(0,0,W,H);x.strokeStyle='#ffffff';x.lineWidth=10;x.strokeRect(16,16,W-32,H-32);
  x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font=`800 ${Math.round(Math.min(H*.62,W*.5))}px ${FD}`;x.fillText(n,W/2,H*.56)})}
function boardTex(title,name,score){return texCanvas(640,400,(x,w,h)=>{
  x.fillStyle='#d8ef5a';x.fillRect(0,0,w,h);x.fillStyle='#ffffff';x.fillRect(18,18,w-36,h-36);x.fillStyle='#e8323c';x.fillRect(18,18,w-36,64);
  x.textAlign='center';x.fillStyle='#ffffff';x.font=`800 40px ${FD}`;x.fillText('LASKAR PECAHAN',w/2,64);
  fitText(x,title,w-80,76,800,FD);x.fillStyle='#1e2a4a';x.fillText(title,w/2,170);
  fitText(x,name,w-80,52,800,FD);x.fillStyle='#2f6fd6';x.fillText(name,w/2,240);
  x.fillStyle='#1e2a4a';x.font=`800 74px ${FD}`;x.fillText(score+' poin',w/2,330)})}
const PLACE={1:{h:1.6,medal:'#ffcc33',title:'JUARA 1'},2:{h:1.15,medal:'#cfd6de',title:'JUARA 2'},3:{h:.85,medal:'#d08a4a',title:'JUARA 3'},4:{h:.6,medal:'#2f7bea',title:'JUARA HARAPAN'}};
function rankPlaces(ps){const r=ps.slice().sort((a,b)=>b.score-a.score||b.correct-a.correct);
  r.forEach(p=>p.place=1+r.filter(o=>o.score>p.score||(o.score===p.score&&o.correct>p.correct)).length);return r}
function makeMedalist(p,place,solo){
  const c=makeChar(p.def,{happy:true}),ud=c.userData;ud.pen.visible=false;ud.arm.visible=false;ud.armL.visible=false;
  const hold=new THREE.Group();ud.inner.add(hold);
  const board=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1),new THREE.MeshBasicMaterial({map:boardTex(solo?'PENGHARGAAN':PLACE[place].title,p.group,p.score)}));hold.add(board);
  for(const s of[-1,1])hold.add(ball(.2,ud.limb,s*.82,-.05,-.04));
  const medal=new THREE.Group();const disc=cyl(.19,.19,.06,PLACE[place].medal,24);disc.rotation.x=Math.PI/2;medal.add(disc);
  medal.add(ball(.07,'#ffffff',0,0,.04,1,1,.4));
  const bandR=new THREE.Mesh(new THREE.BoxGeometry(.2,.07,.03),lam('#e8323c'));bandR.position.set(0,.22,0);medal.add(bandR);
  const bandW=new THREE.Mesh(new THREE.BoxGeometry(.2,.07,.03),lam('#ffffff'));bandW.position.set(0,.15,0);medal.add(bandW);
  medal.position.set(0,1.22,.8);ud.inner.add(medal);
  Object.assign(ud,{hold,medal,place,phase:Math.random()*Math.PI*2,bob:0});
  return c;
}
function buildPodium(ranked,solo){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#9fdcff');lights(scene);
  const sp=new THREE.DirectionalLight('#ffffff',.35);sp.position.set(-4,8,10);scene.add(sp);
  const bd=new THREE.Mesh(new THREE.PlaneGeometry(30,13.2),new THREE.MeshBasicMaterial({map:backdropTex()}));bd.position.set(0,6.6,-4);scene.add(bd);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,24),lam('#2c365a'));floor.rotation.x=-Math.PI/2;floor.position.z=6;scene.add(floor);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(30,.12,.6),lam('#e8323c'));strip.position.set(0,.06,-3.4);scene.add(strip);
  const groups={};ranked.forEach(p=>(groups[p.place]=groups[p.place]||[]).push(p));
  const pl=Object.keys(groups).map(Number).sort((a,b)=>a-b);
  const order=[pl[3],pl[1],pl[0],pl[2]].filter(v=>v!==undefined);
  const slots=order.map(place=>({place,ps:groups[place],w:2.5*groups[place].length+.4,h:PLACE[Math.min(place,4)].h}));
  const total=slots.reduce((s,x)=>s+x.w,0)+.2*(slots.length-1);let x0=-total/2;
  const chars=[];
  for(const sl of slots){sl.x=x0+sl.w/2;x0+=sl.w+.2;const pk=Math.min(sl.place,4);
    const side=lam('#2f6fd6'),top=lam('#5b92ee');
    const blk=new THREE.Mesh(new THREE.BoxGeometry(sl.w,sl.h,2.2),[side,side,top,side,new THREE.MeshBasicMaterial({map:numTex(String(sl.place),sl.w,sl.h)}),side]);
    blk.position.set(sl.x,sl.h/2,0);scene.add(blk);
    sl.ps.forEach((p,k)=>{const c=makeMedalist(p,pk,solo);c.position.set(sl.x+(k-(sl.ps.length-1)/2)*2.5,sl.h,.15);scene.add(c);chars.push(c)})}
  const conf=[];const cg=new THREE.PlaneGeometry(.16,.26);const CC=['#e8323c','#ffffff','#ffc93c','#2f7bea','#5cbf5a'];
  for(let i=0;i<90;i++){const m=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:CC[i%5],side:THREE.DoubleSide}));
    m.position.set((Math.random()-.5)*22,Math.random()*12+2,(Math.random()-.5)*6+1);m.userData.v=.8+Math.random()*1.2;m.userData.s=Math.random()*4;scene.add(m);conf.push(m)}
  const shots=[];const bg=new THREE.BoxGeometry(.18,.18,.04);
  for(let i=0;i<70;i++){const m=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:CC[i%5],side:THREE.DoubleSide}));m.visible=false;m.userData={v:new THREE.Vector3(),life:0};scene.add(m);shots.push(m)}
  const cam=new THREE.PerspectiveCamera(40,1,.1,100);
  return{scene,cam,chars,conf,shots,t:0,nextShot:1.2,width:total};
}
function cannon(){const s=pod.shots;s.forEach((m,i)=>{const side=i%2?1:-1;m.position.set(side*(pod.width/2+.8),.4,1.2);
  m.userData.v.set(-side*(2+Math.random()*4),7+Math.random()*5,(Math.random()-.3)*3);m.userData.life=2.2+Math.random();m.visible=true});sfx('pop')}
function praise(p){const n=p.correct+p.wrong;if(!n)return'Ayo coba lagi, pasti bisa!';const a=p.correct/n;
  return a>=.8?'Luar biasa! Kalian jago pecahan.':a>=.6?'Hebat! Sedikit lagi jadi master pecahan.':a>=.4?'Bagus! Terus berlatih, ya.':'Semangat! Latihan lagi pasti makin pintar.'}
function showPodium(){
  const ps=state.players.slice();const ranked=rankPlaces(ps);const solo=ps.length===1;
  const winners=ranked.filter(p=>p.place===1);
  pod=buildPodium(ranked,solo);
  $('podTitle').textContent=solo?`Hebat, ${ranked[0].group}!`:winners.length>1?'Sama kuat! Juara bersama!':`Selamat, ${winners[0].group}!`;
  $('podSub').textContent=`${ST.sessionMin} menit · ${ST.qTime} detik per soal · salah ${ST.penalty?'−'+ST.penalty:'tidak dikurangi'}`;
  const wrap=$('podCards');wrap.innerHTML='';wrap.className='res'+(ps.length>2?' many':'');
  ranked.forEach(p=>{const n=p.correct+p.wrong;const c=document.createElement('div');c.className='rcard'+(p.place===1?' win':'');
    c.innerHTML=`<div class="rank${p.place>1?' r'+Math.min(p.place,4):''}">${p.place}</div><div class="nm"></div><div class="big">${p.score}<small>poin</small></div>
      <div class="stats"><span>Benar ${p.correct}</span><span>Belum tepat ${p.wrong}</span><span>Ketepatan ${n?Math.round(p.correct/n*100):0}%</span></div><div class="msg">${praise(p)}</div>`;
    const nm=c.querySelector('.nm');nm.textContent=p.group;const sm=document.createElement('small');sm.textContent=`${p.def.name} · ${p.def.kind}`;nm.appendChild(sm);wrap.appendChild(c)});
  showScreen('podium');sfx('fanfare');
}
tap($('again'),()=>{sfx('tap');startGame()});
tap($('toSetup'),()=>{sfx('tap');openSetup()});
tap($('toMenu'),()=>{sfx('tap');showScreen('menu')});

/* =========================================================
   SOAL & PEMBAHASAN (lihat + unduh)
   ========================================================= */
const RV_CSS=`
.rv{font-family:Nunito,"Segoe UI",system-ui,sans-serif;color:#1e2a4a;line-height:1.55;font-size:17px;max-width:900px;margin:0 auto}
.rv h1,.rv h2,.rv h3{font-family:"Baloo 2","Trebuchet MS",sans-serif;line-height:1.1;margin:0}
.rv h1{font-size:34px}.rv h2{font-size:26px;margin-top:28px;padding:6px 14px;border-radius:12px;background:#1e2a4a;color:#fff;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.rv h3{font-size:20px;margin:18px 0 8px}
.rv .sub{color:#4a5675;margin:4px 0 14px}
.rv .flag{height:10px;border-radius:6px;background:linear-gradient(#e8323c 50%,#fff 50%);border:2px solid #1e2a4a;margin-bottom:14px}
.rv table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}
.rv th,.rv td{border:2px solid #c9d3e6;padding:6px 10px;text-align:left}
.rv th{background:#e9f3fb}
.rv .how{background:#fff8e8;border:3px solid #ffc93c;border-radius:14px;padding:10px 16px;margin:14px 0}
.rv .how ol{margin:6px 0 0;padding-left:22px}
.rv .tips{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}
.rv .tip{border:3px solid #1e2a4a;border-radius:14px;padding:10px 14px;background:#fff}
.rv .tip b{display:block;font-family:"Baloo 2",sans-serif;font-size:18px;color:#e8323c}
.rv .q{border:3px solid #1e2a4a;border-radius:16px;padding:12px 16px;margin:14px 0;background:#fff;break-inside:avoid;page-break-inside:avoid}
.rv .qh{display:flex;gap:6px;flex-wrap:wrap;font-size:13px;font-weight:800;margin-bottom:6px}
.rv .qh span{border:2px solid #1e2a4a;border-radius:99px;padding:0 9px;background:#e9f3fb}
.rv .qh .no{background:#1e2a4a;color:#fff}
.rv .qh .k-cerita{background:#ffc93c}.rv .qh .k-konsep{background:#d9f2d0}
.rv .qt{font-size:19px;font-weight:800;margin:6px 0 10px;display:flex;flex-wrap:wrap;align-items:center;gap:.3em .6em}
.rv .qt.story{display:block;font-weight:700}
.rv .ol{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px;list-style:none;padding:0;margin:0 0 10px}
.rv .ol li{border:2px solid #c9d3e6;border-radius:10px;padding:5px 10px;font-weight:800;font-size:18px;display:flex;align-items:center;gap:8px}
.rv .ol li i{font-style:normal;display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#1e2a4a;color:#fff;font-size:14px;flex:none}
.rv .ol li.key{border-color:#1f9d55;background:#e3f6dd}
.rv .ol li.pick{border-color:#e8323c;background:#ffe5e7}
.rv .ol li em{font-style:normal;font-size:12px;margin-left:auto;font-weight:800}
.rv .verdict{font-weight:800;margin-bottom:8px}
.rv .verdict.ok{color:#1f9d55}.rv .verdict.no{color:#c4202a}.rv .verdict.na{color:#8a6100}
.rv .steps{background:#e9f3fb;border-radius:12px;padding:10px 14px}
.rv .steps b{font-family:"Baloo 2",sans-serif;font-size:17px}
.rv .steps ol{margin:4px 0 0;padding-left:22px}.rv .steps li{margin:3px 0}
.rv .write{border-bottom:2px dashed #9aa6c2;height:34px;margin-top:6px}
.rv .keytable td{text-align:center}
.rv .foot{margin-top:28px;color:#4a5675;font-size:14px;text-align:center}
.rv .fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.02;margin:0 .1em;font-size:.9em}
.rv .fr>span:first-child{border-bottom:.09em solid currentColor;padding:0 .18em .04em}
.rv .fr>span:last-child{padding:.04em .18em 0}
.rv .mx{display:inline-flex;align-items:center;gap:.05em}
.rv .blank{display:inline-block;width:1.4em;height:1.4em;border:.12em dashed #1e2a4a;border-radius:.2em;vertical-align:middle}
.rv .sep{margin:0 .25em;opacity:.6}
.rv .vis{height:110px;width:auto;display:block;margin:6px 0}.rv .vis.bar{height:56px}
.rv .expr{white-space:nowrap}
@media print{.rv h2{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;
{const st=document.createElement('style');st.textContent=RV_CSS;document.head.appendChild(st)}
const STATUS={benar:['ok','✓ Benar'],salah:['no','✗ Belum tepat'],habis:['na','⏱ Waktu habis, tidak dijawab'],belum:['na','Belum sempat dijawab (permainan selesai)']};
function buildReview(withKey){
  const ps=state.players.slice().sort((a,b)=>a.i-b.i);const when=state.startedAt||new Date();
  const used=[...new Set(ps.flatMap(p=>p.hist.map(h=>h.topic)))].sort();
  let h=`<div class="rv"><div class="flag"></div><h1>${withKey?'Soal &amp; Pembahasan':'Lembar Latihan'} · Laskar Pecahan</h1>
  <p class="sub">Latihan TKA Matematika SD · Bab Pecahan · ${dateID(when)} · ${ST.sessionMin} menit · ${ST.qTime} detik per soal</p>
  <table><tr><th>Kelompok</th><th>Karakter</th><th>Poin</th><th>Benar</th><th>Belum tepat</th><th>Jumlah soal</th></tr>
  ${ps.map(p=>`<tr><td><b>${esc(p.group)}</b></td><td>${p.def.name} (${p.def.kind})</td><td>${p.score}</td><td>${p.correct}</td><td>${p.wrong}</td><td>${p.hist.length}</td></tr>`).join('')}</table>
  <div class="how"><b>Cara belajar dengan lembar ini</b><ol>
  ${withKey?'<li>Baca soalnya lagi pelan-pelan.</li><li>Lihat jawaban kelompokmu dan kunci jawabannya (kotak hijau).</li><li>Baca pembahasan langkah demi langkah. Coba kerjakan ulang tanpa melihat.</li><li>Fokus dulu pada soal yang belum tepat.</li>':'<li>Kerjakan setiap soal di kertas atau di garis yang tersedia.</li><li>Tulis caranya, jangan hanya jawabannya.</li><li>Cocokkan dengan kunci jawaban di halaman terakhir.</li>'}</ol></div>`;
  if(used.length)h+=`<h3>Ingat ya!</h3><div class="tips">${used.map(t=>`<div class="tip"><b>${TIPS[t][0]}</b>${TIPS[t][1]}</div>`).join('')}</div>`;
  const keyRows=[];
  ps.forEach(p=>{
    h+=`<h2><span>${esc(p.group)}</span><span>${p.score} poin</span></h2>`;
    if(!p.hist.length)h+=`<p>Belum ada soal yang dijawab.</p>`;
    p.hist.forEach(x=>{
      const L=i=>'ABCD'[i];const ci=x.options.findIndex(o=>o.key===x.answer);const pi=x.options.findIndex(o=>o.key===x.picked);
      h+=`<div class="q"><div class="qh"><span class="no">Soal ${x.num}</span><span class="k-${x.kind}">${KIND[x.kind]}</span><span>${TOPICS[x.topic-1][1]}</span></div>
      <div class="qt${x.kind==='cerita'?' story':''}">${x.text}</div>
      <ol class="ol">${x.options.map((o,i)=>`<li class="${withKey&&i===ci?'key':''}${withKey&&i===pi&&i!==ci?' pick':''}"><i>${L(i)}</i><span>${o.html}</span>${withKey&&i===ci?'<em>kunci</em>':withKey&&i===pi?'<em>jawaban kelompok</em>':''}</li>`).join('')}</ol>`;
      if(withKey){const [cls,txt]=STATUS[x.status];
        h+=`<div class="verdict ${cls}">${txt}${x.status==='salah'?` · Kelompok memilih ${L(pi)}, jawaban benar ${L(ci)}`:''}</div>
        <div class="steps"><b>Pembahasan · Jawaban: ${L(ci)}. ${x.correctHtml}</b><ol>${(x.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ol></div>`}
      else{h+=`<div class="write"></div><div class="write"></div>`;keyRows.push([p.group,x.num,L(ci)])}
      h+=`</div>`});
  });
  if(!withKey&&keyRows.length){h+=`<h2><span>Kunci jawaban</span></h2><table class="keytable"><tr><th>Kelompok</th><th>Soal</th><th>Jawaban</th></tr>${keyRows.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td><b>${r[2]}</b></td></tr>`).join('')}</table>`}
  h+=`<p class="foot">Dibuat oleh game Laskar Pecahan. Terus berlatih, kalian pasti bisa!</p></div>`;
  return h;
}
function reviewDoc(withKey){const title=(withKey?'Soal dan Pembahasan':'Lembar Latihan')+' - Laskar Pecahan';
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@600;700;800&display=swap">
<style>body{margin:0;padding:24px 16px;background:#ffffff}${RV_CSS}</style></head><body>${buildReview(withKey)}</body></html>`}
const dlReady=(window.claude&&typeof window.claude.use==='function')?window.claude.use('downloads').catch(()=>null):Promise.resolve(null);
async function downloadFile(filename,content){
  const dl=await dlReady;
  if(dl){try{await dl.save({filename,data:content});toast('File disimpan. Buka dengan browser untuk membaca atau mencetak.')}
    catch(e){toast(e&&e.code==='declined'?'Unduhan dibatalkan.':e&&e.code==='rate_limited'?'Tunggu sebentar, lalu coba lagi.':'File tidak bisa disimpan di tampilan ini.')}return}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:'text/html'}));a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);toast('File diunduh.')}
  catch(e){toast('File tidak bisa diunduh di tampilan ini.')}
}
const stamp=()=>{const d=state.startedAt||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
tap($('openReview'),()=>{sfx('tap');$('reviewBody').innerHTML=buildReview(true);$('review').hidden=false;$('reviewBody').parentElement.scrollTop=0});
tap($('closeReview'),()=>{sfx('tap');$('review').hidden=true});
tap($('dlFull'),()=>{sfx('tap');downloadFile(`Soal-dan-Pembahasan-Laskar-Pecahan-${stamp()}.html`,reviewDoc(true))});
tap($('dlSheet'),()=>{sfx('tap');downloadFile(`Lembar-Latihan-Laskar-Pecahan-${stamp()}.html`,reviewDoc(false))});

/* layout */
function layout(){renderer.setSize(innerWidth,innerHeight,false);const w=$('panels');if(state.mode===2)w.classList.toggle('portrait',innerWidth<innerHeight*.9)}
addEventListener('resize',layout);layout();

/* =========================================================
   LOOP
   ========================================================= */
const tmp=new THREE.Vector3(),hitPos=new THREE.Vector3(-.5,0,1.2);
const lerpV=(a,b,t,out)=>out.copy(a).lerp(b,t);
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const FULL={left:0,top:0,width:0,height:0,bottom:0};
function renderView(scene,cam,el){
  const r=el?el.getBoundingClientRect():Object.assign(FULL,{width:innerWidth,height:innerHeight,bottom:innerHeight});
  if(r.width<4||r.height<4)return;const x=r.left,y=innerHeight-r.bottom;
  renderer.setViewport(x,y,r.width,r.height);renderer.setScissor(x,y,r.width,r.height);
  const asp=r.width/r.height;cam.aspect=asp;cam.fov=asp<1?48:42;cam.updateProjectionMatrix();renderer.render(scene,cam);
}
function updatePlayer(p,dt,T){
  const hero=p.hero,ud=hero.userData,en=p.enemy,live=state.running&&!state.paused;
  if(live){
    if(p.phase==='ask'){p.time-=dt;if(p.time<=0){p.time=0;answer(p,null)}}
    else if(p.phase==='lock'){p.lock-=dt;if(p.lock<=0)nextQ(p)}
  }
  const frac=Math.max(0,p.time/ST.qTime),sec=Math.ceil(p.time),u=p.ui;
  u.arc.setAttribute('stroke-dashoffset',(RING*(1-frac)).toFixed(1));u.sec.textContent=sec;
  const asking=p.phase==='ask';
  u.clock.classList.toggle('mid',asking&&frac<=.5&&sec>10);u.clock.classList.toggle('low',asking&&sec<=10&&sec>5);u.clock.classList.toggle('crit',asking&&sec<=5);
  p.el.classList.toggle('danger',asking&&live&&sec<=5);
  if(asking&&live&&sec!==p.lastSec){p.lastSec=sec;if(sec<=5&&sec>0&&state.left>10&&state.players.find(o=>o.phase==='ask'&&Math.ceil(o.time)<=5)===p)sfx('tick',0)}
  if(state.paused)return;
  if(en){const eu=en.userData;eu.appear=Math.min(1,eu.appear+dt*2.5);
    if(p.phase==='ask'||p.phase==='wait'){lerpV(S,E,(1-frac)*.88,en.position);en.position.y=Math.abs(Math.sin(T*(sec<=5?9:5)))*.35;en.scale.setScalar(.01+ease(eu.appear)*.99);
      eu.inner.scale.set(1+Math.sin(T*10)*.06,1-Math.sin(T*10)*.06,1)}
    en.lookAt(hero.position.x,en.position.y,hero.position.z)}
  const toE=en?Math.atan2(en.position.x-hero.position.x,en.position.z-hero.position.z):0;
  hero.rotation.y=toE*.55;ud.inner.rotation.set(0,0,0);ud.inner.position.y=Math.abs(Math.sin(T*3.2))*.08;ud.arm.rotation.x=Math.sin(T*2.2)*.15;ud.armL.rotation.x=-Math.sin(T*2.2)*.15;
  if(p.anim&&en){const a=p.anim;a.t+=dt;const t=a.t;
    if(a.type==='hit'){const tgt=tmp.copy(en.position).sub(H).multiplyScalar(.7).add(H);tgt.y=0;
      if(t<.28){hero.position.lerpVectors(H,tgt,ease(t/.28));ud.arm.rotation.x=-2.3*ease(t/.28);ud.inner.position.y=Math.sin(t/.28*Math.PI)*.8}
      else if(t<.5){hero.position.copy(tgt);ud.arm.rotation.x=-2.3+3.6*ease((t-.28)/.22);if(!a.popped){a.popped=1;burst(p.parts,en.position);en.visible=false;p.shake=.25}}
      else if(t<1){hero.position.lerpVectors(tgt,H,ease((t-.5)/.5));ud.inner.rotation.y=ease((t-.5)/.5)*Math.PI*2;ud.arm.rotation.x=1.3*(1-ease((t-.5)/.5))}
      else{hero.position.copy(H);p.anim=null}
    }else{const start=a.from||(a.from=en.position.clone());
      if(t<.3){lerpV(start,hitPos,ease(t/.3),en.position);en.position.y=Math.sin(t/.3*Math.PI)*1.2}
      else if(t<1.2){if(!a.bonk){a.bonk=1;p.shake=.45}const k=(t-.3)/.9;ud.inner.rotation.z=Math.sin(k*Math.PI*4)*.5*(1-k);ud.inner.rotation.x=-.4*(1-k);
        lerpV(hitPos,S,ease(k),en.position);en.position.y=Math.abs(Math.sin(k*Math.PI*3))*.8;en.rotation.y+=dt*8}
      else{en.visible=false;p.anim=null}}
  }
  for(const m of p.parts)if(m.visible){const v=m.userData;v.life-=dt;v.v.y-=14*dt;m.position.addScaledVector(v.v,dt);if(m.position.y<.1){m.position.y=.1;v.v.y*=-.4;v.v.x*=.7;v.v.z*=.7}m.rotation.x+=dt*6;m.rotation.y+=dt*5;if(v.life<=0)m.visible=false}
  const r=u.stage.getBoundingClientRect();const z=10*Math.max(1,1.45/(r.width/Math.max(1,r.height)));
  p.cam.position.set((Math.random()-.5)*p.shake,3.6+z*.12+(Math.random()-.5)*p.shake,z);p.cam.lookAt(0,1.2,-1.6);p.shake=Math.max(0,p.shake-dt*1.2);
}
/* medalis: lompat, angkat papan, goyang kepala, medali berayun */
function updatePodium(dt,T){
  pod.t+=dt;
  pod.chars.forEach(c=>{const ud=c.userData,pl=ud.place,ph=ud.phase,inner=ud.inner,hold=ud.hold;
    const period=pl===1?1.25:pl===2?1.6:2.1,height=pl===1?1.1:pl===2?.7:.45;
    const k=((T+ph)%period)/period;let y=0,sx=1,sy=1;
    if(k<.12){const q=k/.12;sy=1-.22*Math.sin(q*Math.PI);sx=1+.14*Math.sin(q*Math.PI)}
    else if(k<.62){const q=(k-.12)/.5;y=Math.sin(q*Math.PI)*height;sy=1+.1*Math.sin(q*Math.PI);sx=1-.05*Math.sin(q*Math.PI)}
    else if(k<.74){const q=(k-.62)/.12;sy=1-.15*Math.sin(q*Math.PI);sx=1+.1*Math.sin(q*Math.PI)}
    inner.position.y=y;inner.scale.set(sx,sy,sx);
    const big=pl===1?Math.floor((T+ph)/period)%3===2:false;
    inner.rotation.y=big&&k>.12&&k<.62?((k-.12)/.5)*Math.PI*2:Math.sin(T*1.3+ph)*.25;
    ud.head.rotation.z=Math.sin(T*4+ph)*.18;ud.head.rotation.x=-.08+Math.sin(T*2.5+ph)*.06;
    const lift=Math.min(1,Math.max(0,(pl<=2?.5:.1)+.9*Math.sin(T*(pl===1?1.9:pl===2?1.5:1.2)+ph)));
    hold.position.set(Math.sin(T*3+ph)*.08*(pl>2?2:1),.55+lift*2.85,1.02-lift*.55);hold.rotation.set(-.1-lift*.25,0,Math.sin(T*3+ph)*.1);
    ud.medal.rotation.z=Math.sin(T*6+ph)*.35;ud.medal.rotation.x=-.2+Math.cos(T*6+ph)*.15});
  pod.conf.forEach(m=>{m.position.y-=m.userData.v*dt;m.position.x+=Math.sin(T*2+m.userData.s)*dt*.6;m.rotation.x+=dt*3;m.rotation.y+=dt*2;if(m.position.y<0)m.position.y=13});
  pod.nextShot-=dt;if(pod.nextShot<=0){pod.nextShot=4;cannon()}
  pod.shots.forEach(m=>{if(!m.visible)return;const v=m.userData;v.life-=dt;v.v.y-=9*dt;v.v.multiplyScalar(1-dt*.6);m.position.addScaledVector(v.v,dt);m.rotation.x+=dt*8;m.rotation.z+=dt*6;if(v.life<=0||m.position.y<0)m.visible=false});
  const asp=innerWidth/Math.max(1,innerHeight);const z=Math.max(12,pod.width*1.35)*Math.max(1,1.5/asp);
  pod.cam.position.set(Math.sin(pod.t*.25)*1.2,3.6,z);pod.cam.lookAt(0,2.7,0);
}
let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;const T=now/1000;
  renderer.setScissor(0,0,innerWidth,innerHeight);renderer.setViewport(0,0,innerWidth,innerHeight);renderer.setClearColor('#9fdcff');renderer.clear();
  const sc=state.screen;
  if(sc==='menu'||sc==='select'||sc==='setup'){
    selJump+=dt;
    sel.chars.forEach((c,i)=>{const ud=c.userData;const active=sc==='select'&&i===state.selIdx;const picked=sc==='setup'&&state.picks.slice(0,state.mode).includes(i);
      ud.inner.position.y=active?Math.abs(Math.sin(selJump*5))*.6:picked?Math.abs(Math.sin(T*4+i))*.3:Math.abs(Math.sin(T*2.5+i))*.08;
      c.rotation.y=active?Math.sin(selJump*2)*.6:Math.sin(T*.8+i)*.35;ud.arm.rotation.x=active||picked?-1.2+Math.sin(T*8)*.4:Math.sin(T*2+i)*.2});
    sel.markers.forEach(m=>{m.position.y=3.9+Math.sin(T*4)*.15;m.rotation.y=T*2});
    const el=sc==='menu'?$('menuStage'):sc==='select'?$('selStage'):null;
    const r=el?el.getBoundingClientRect():{width:innerWidth,height:innerHeight};const asp=r.width/Math.max(1,r.height);
    sel.cam.position.set(0,3.4,11*Math.max(1,1.9/asp));sel.cam.lookAt(0,1.6,0);renderView(sel.scene,sel.cam,el);
  }else if(sc==='game'){
    if(state.running&&!state.paused)sessionTick(dt);
    for(const p of state.players){updatePlayer(p,dt,T);renderView(p.scene,p.cam,p.ui.stage)}
  }else if(sc==='podium'&&pod){updatePodium(dt,T);renderView(pod.scene,pod.cam,null)}
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
