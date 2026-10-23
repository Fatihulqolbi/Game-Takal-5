/* DIMENSIA · Lomba Bungkus Kado: alur permainan (menu, pilih robot, persiapan, arena terbagi, juara).
   Pola layar, suara, dan podium sama dengan Kota Langit supaya terasa satu keluarga game. */
const KadoGame=(()=>{
  const $=id=>document.getElementById(id),C=KadoCore,A=MenaraAudio,V=MenaraScene,S3=KadoScene;
  const STORE='dimensia-bungkus-kado-v1',colors=['#e8323c','#2f7bea','#1f9d55','#f08c00'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time=s=>Math.floor(Math.max(0,s)/60).toString().padStart(2,'0')+':'+Math.floor(Math.max(0,s)%60).toString().padStart(2,'0');
  let raw={};try{raw=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(_){}
  let settings=C.settings(raw),screen='home',session=null,homeView=null,pickView=null,pick={i:0,sel:0},podiumViews=[],sim=0,last=performance.now(),muted=false;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)settings.motion=false;
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(settings))}catch(_){}};
  const configureAudio=()=>{A.configure({...settings,volume:muted?0:settings.volume});$('soundHome').textContent=muted?'Suara mati':A.running?'Suara nyala':'Ketuk layar untuk musik';$('soundHome').classList.toggle('minta',!muted&&!A.running);for(const id of['soundHome','gameSound'])$(id).setAttribute('aria-pressed',!muted);$('gameSound').setAttribute('aria-label',muted?'Nyalakan suara':'Matikan suara')};
  configureAudio();addEventListener('audiostate',configureAudio);
  function show(id){screen=id;for(const n of['home','pick','setup','game','results'])$(n).hidden=n!==id;scrollTo(0,0)}
  function talk(p,teks,mood){p.el.querySelector('.robot-bubble').textContent=ROBOT[p.character].nama+': '+teks;if(mood)p.view.bot.aksi(mood)}

  /* ---------- pilih robot & persiapan (sama seperti Kota Langit) ---------- */
  const SAPA=['Isi permen sebanyak volumenya, bungkus seluas permukaannya!','Volume itu isinya. Luas permukaan itu kulitnya. Jangan tertukar!','Kotak sempurna dapat pita emas!','Ayo cepat, pelanggan sudah menunggu!'];
  ROBOT.forEach((d,j)=>{const b=document.createElement('button');b.type='button';b.className='chunky ccard';b.innerHTML=`<span class="sw" style="background:${d.warna}"></span><b>${d.nama}</b><small>${d.julukan}</small><span class="tk"></span>`;b.addEventListener('click',()=>choose(j));$('pickCards').appendChild(b)});
  function choose(j){pick.sel=j;A.start();A.voice(j);pickView?.bots[j].aksi('sapa');renderPick()}
  function renderPick(){const h=$('pickHead');h.className='sel-head p'+(pick.i+1);h.innerHTML=`<span class="pl">Pemain ${pick.i+1}</span>, pilih robotmu!`;
    [...$('pickCards').children].forEach((c,j)=>{c.setAttribute('aria-pressed',j===pick.sel);c.querySelector('.tk').innerHTML=settings.characters.slice(0,pick.i).map((ci,k)=>ci===j?`<span class="tag t${k}">P${k+1}</span>`:'').join('')});
    $('pickTalk').textContent=ROBOT[pick.sel].nama+': “'+SAPA[pick.sel]+'”';if(pickView)pickView.selected=pick.sel}
  function openPick(n){settings.players=n;pick={i:0,sel:settings.characters[0]};show('pick');renderPick()}
  function confirmPick(){settings.characters[pick.i]=pick.sel;if(/^Tim (Orbo|Hexi|Nova|Zipp)$/.test(settings.names[pick.i]))settings.names[pick.i]='Tim '+ROBOT[pick.sel].nama;A.play('good');
    if(pick.i<settings.players-1){pick.i++;const dipakai=new Set(settings.characters.slice(0,pick.i));let n=settings.characters[pick.i];for(let k=0;k<4&&dipakai.has(n);k++)n=(n+1)%4;pick.sel=n;renderPick()}else{save();setup(settings.players)}}
  function backPick(){A.play('tap');if(pick.i>0){pick.i--;pick.sel=settings.characters[pick.i];renderPick()}else show('home')}
  function setup(n){settings.players=n;show('setup');$('modeBadge').textContent=n+' pemain';$('teamFields').innerHTML='';
    for(let i=0;i<n;i++){const row=document.createElement('div');row.className='team-field';row.style.setProperty('--player',colors[i]);row.innerHTML=`<span class="player-number">P${i+1}</span><input maxlength="24" aria-label="Nama kelompok pemain ${i+1}" autocomplete="off"><span class="robot-tag"><i style="background:${ROBOT[settings.characters[i]].warna}"></i>${ROBOT[settings.characters[i]].nama}</span>`;row.querySelector('input').value=settings.names[i];$('teamFields').appendChild(row)}
    $('sessionMinutes').value=settings.minutes;$('level').value=settings.level;$('bangun').value=settings.bangun;$('bangun').dispatchEvent(new Event('change'));$('volume').value=settings.volume;$('volumeValue').textContent=settings.volume+'%';$('musicEnabled').checked=settings.music;$('fxEnabled').checked=settings.fx;$('motionEnabled').checked=settings.motion}
  function readSettings(){const teams=[...$('teamFields').children];settings=C.settings({...settings,minutes:$('sessionMinutes').value,level:$('level').value,bangun:$('bangun').value,volume:$('volume').value,music:$('musicEnabled').checked,fx:$('fxEnabled').checked,motion:$('motionEnabled').checked,names:settings.names.map((n,i)=>teams[i]?.querySelector('input').value||n)});save();configureAudio()}

  /* ---------- arena ---------- */
  function buildPlayer(i,seed){
    const p=C.player(i,settings.names[i],settings.characters[i],seed,settings.level,settings.bangun);p.sisa=p.order.sabar;p.jeda=0;p.sibuk=false;p.tick=-1;
    const el=document.createElement('article');p.el=el;el.className='arena';el.style.setProperty('--player',colors[i]);el.setAttribute('aria-label','Arena '+p.name);
    el.innerHTML=`<header class="arena-head"><div class="who"><span class="player-number">P${i+1}</span><span><b>${escape(p.name)}</b><small>${ROBOT[p.character].nama}, penjaga toko</small></span></div><div class="tower-score"><b>0</b><small>kado sempurna</small></div></header>
      <div class="arena-body"><div class="tower-view scene-slot"><div class="pesanan-tag"></div><div class="clue-pop" hidden></div><div class="robot-bubble"></div></div><section class="question-card kado-card" aria-label="Langkah pesanan pemain ${i+1}"></section></div>
      <footer class="build-footer"><div class="kado-langkah"><i data-l="isi"></i><span>Isi</span><i data-l="bungkus"></i><span>Bungkus</span></div><span class="drag-instruction">Kado terkirim: <b class="kirim">0</b></span></footer>`;
    $('arenas').appendChild(el);p.view=S3.create(el.querySelector('.tower-view'),p.character,colors[i]);
    el.querySelector('.kado-card').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||session?.status!=='play')return;
      if(b.dataset.clue!==undefined)petunjuk(p);else if(b.dataset.opsi!==undefined)jawab(p,+b.dataset.opsi);else if(b.dataset.lanjut!==undefined&&p.phase==='hasil')berikut(p)});
    mulaiPesanan(p,true);return p}
  function kartu(p){const o=p.order,card=p.el.querySelector('.kado-card');card.classList.remove('bahas','bad');card.dataset.fase=p.phase;
    const isi=p.phase==='isi',opsi=isi?o.opsiV:o.opsiL;
    const bangun=o.namaBangun.toLowerCase(),pi=o.bulat?' Pakai π = 22/7.':'';
    const tanya=o.kotak?(isi?`Berapa <b>permen kubus 1 cm</b> yang pas mengisi penuh kotak <b>${o.p} × ${o.l} × ${o.t} cm</b>?`:`Berapa <b>cm² kertas kado</b> yang pas untuk menutup <b>semua sisi</b> kotak ${o.p} × ${o.l} × ${o.t} cm?`)
      :isi?`Berapa <b>cm³ jeli</b> yang pas mengisi penuh <b>${bangun}</b> ini? <small>(${o.teks})</small>${pi}`:`Berapa <b>cm² kertas kado</b> yang pas menutup <b>seluruh kulit</b> ${bangun} ini? <small>(${o.teks})</small>${pi}`;
    card.innerHTML=`<div class="question-head"><span class="quake-label">${isi?'Langkah 1: isi sesuai volume':'Langkah 2: bungkus sesuai luas permukaan'}</span><button type="button" class="clue-btn" data-clue aria-expanded="false"><i>?</i>Petunjuk rumus</button><b class="question-timer">${Math.ceil(p.sisa)}</b></div><div class="question-track"><i></i></div>
      <p class="question-text">${tanya}</p>
      <div class="question-options">${opsi.map((v,j)=>`<button class="answer-option" data-opsi="${j}"><b>${'ABCD'[j]}</b><span>${C.angka(v)} ${isi?o.satuanIsi:'cm²'}</span></button>`).join('')}</div>`;
    tutupPetunjuk(p);
    p.el.querySelectorAll('.kado-langkah i').forEach(e=>{e.classList.toggle('aktif',e.dataset.l===p.phase);e.classList.toggle('done',p.phase==='bungkus'&&e.dataset.l==='isi')})}
  /* petunjuk rumus: hanya muncul kalau diketuk, supaya anak mencoba mengingat dulu */
  function petunjuk(p){const pop=p.el.querySelector('.clue-pop'),btn=p.el.querySelector('[data-clue]');if(!pop.hidden)return tutupPetunjuk(p);
    const o=p.order,isi=p.phase==='isi',t=o.petunjuk;A.play('tap');
    pop.innerHTML=`<b>Petunjuk rumus ${o.namaBangun.toLowerCase()}</b><span class="rumus">${isi?t.v:t.l}</span><small>${isi?t.tipV:t.tipL}</small>${o.bulat?'<small>π = 22/7</small>':''}`;pop.hidden=false;if(btn)btn.setAttribute('aria-expanded','true')}
  function tutupPetunjuk(p){const pop=p.el.querySelector('.clue-pop');pop.hidden=true;p.el.querySelector('[data-clue]')?.setAttribute('aria-expanded','false')}
  function mulaiPesanan(p,awal=false){p.phase='isi';p.sisa=p.order.sabar;p.tick=-1;p.sibuk=false;S3.pesanan(p.view,p.order);
    p.el.querySelector('.pesanan-tag').innerHTML=`<small>Pesanan ${p.urut+1}</small>${p.order.nama}`;kartu(p);
    talk(p,awal?`Pelanggan pertama datang! Isi dulu ${p.order.kotak?'kotaknya dengan permen':p.order.namaBangun.toLowerCase()+'nya dengan jeli'}.`:`Pesanan baru: ${p.order.nama}. Ayo cepat!`,'sapa')}
  function jawab(p,j){if(p.sibuk||!['isi','bungkus'].includes(p.phase))return;const o=p.order;p.sibuk=true;
    const card=p.el.querySelector('.kado-card');card.querySelectorAll('[data-opsi]').forEach(b=>{b.disabled=true;b.setAttribute('aria-pressed',+b.dataset.opsi===j)});A.play('tap');
    if(p.phase==='isi'){p.pilihV=j;const n=o.opsiV[j],ok=n===o.V;
      S3.isiPermen(p.view,n,()=>{if(session?.status==='done')return;A.play(ok?'place':'bad');
        const u=o.satuanIsi,isiNya=o.kotak?'permennya':'jelinya',a=C.angka;
        talk(p,ok?`Pas! ${a(n)} ${u} mengisi penuh. Sekarang bungkus!`:n>o.V?`Waduh, ${isiNya} tumpah ${a(n-o.V)} ${u}! Volumenya cuma ${a(o.V)}.`:`Belum penuh, kurang ${a(o.V-n)} ${u}.`,ok?'senang':'bingung');
        p.phase='bungkus';p.sibuk=false;kartu(p)})}
    else{p.pilihL=j;const a=o.opsiL[j],ok=a===o.L,sempurna=ok&&o.opsiV[p.pilihV]===o.V;
      S3.bungkus(p.view,a,sempurna,()=>{if(session?.status==='done')return;selesai(p,false)})}}
  function selesai(p,habis){const h=C.nilai(p,habis),o=p.order;p.phase='hasil';p.sibuk=false;p.jeda=6;
    A.play(h.sempurna?'perfect':habis?'quake':'bad');
    talk(p,h.sempurna?'Kado sempurna! Pelanggan senang sekali!':habis?'Yaah, pelanggannya pergi karena menunggu terlalu lama.':'Kadonya belum sempurna. Lihat pembahasannya!',h.sempurna?'senang':'bingung');
    p.el.querySelector('.tower-score>b').textContent=p.sempurna;
    const card=p.el.querySelector('.kado-card');card.classList.add('bahas');card.classList.toggle('bad',!h.sempurna);
    const baris=(ok,judul,isi,pilih,unit)=>`<div class="kunci-baris ${ok?'ok':'no'}"><b>${judul}</b><span>${isi}${pilih===null?' (belum dijawab)':ok?'':`. Pilihanmu ${C.angka(pilih)} ${unit}`}</span></div>`;tutupPetunjuk(p);
    card.innerHTML=`<div class="bahas-hasil"><b>${h.sempurna?'Kado sempurna!':habis?'Pelanggan pergi':'Kado belum sempurna'}</b><span>${o.nama}</span></div><div class="bahas-kunci">${baris(h.v,'Isi = volume',o.rumusV+' '+(o.kotak?'permen':'cm³'),h.pilihV,o.satuanIsi)}${baris(h.l,'Bungkus = luas',o.rumusL+' cm²',h.pilihL,'cm²')}</div>
      <p class="kado-ingat">Volume menghitung <b>isi</b> (kubus satuan, cm³). Luas permukaan menghitung <b>kulit</b> (persegi satuan, cm²).</p><button class="primary-btn next-block" data-lanjut>Pesanan berikutnya <span class="hitung">${p.jeda}</span></button>`;
    p.el.querySelector('.kirim').textContent=p.riwayat.length}
  /* kotak yang sudah jadi tetap terlihat selama pembahasan, baru dikirim saat pesanan berikutnya */
  function berikut(p){if(p.phase!=='hasil')return;const h=p.riwayat.at(-1);C.lanjut(p);p.phase='kirim';
    S3.kirim(p.view,h.sempurna,()=>{if(session&&session.status!=='done')mulaiPesanan(p)})}

  /* ---------- sesi ---------- */
  function clearViews(){podiumViews.forEach(V.dispose);podiumViews=[]}
  function start(){if(!V.ready)return;clearViews();$('pause').hidden=true;show('game');$('arenas').innerHTML='';$('arenas').className='arenas mode-'+settings.players;
    const seed=Math.floor(Math.random()*0x7fffffff);session={status:'countdown',beforePause:'play',remaining:settings.minutes*60,total:settings.minutes*60,countdown:3.2,lastCount:-1,players:[],seed};
    for(let i=0;i<settings.players;i++)session.players.push(buildPlayer(i,seed));
    $('countdown').hidden=false;$('countdownNumber').textContent='3';A.pause(false);A.urgent(false);A.start();updateTime()}
  function updateTime(){$('sessionClock').textContent=time(Math.ceil(session.remaining));$('sessionProgress').style.width=100*session.remaining/session.total+'%';$('sessionClock').parentElement.classList.toggle('urgent',session.remaining<=30)}
  function pause(){if(!session||!['play','countdown'].includes(session.status))return;session.beforePause=session.status;session.status='paused';$('pause').hidden=false;A.pause(true);$('resumeGame').focus()}
  function resume(){if(session?.status!=='paused')return;session.status=session.beforePause;$('pause').hidden=true;A.pause(false);A.start()}
  function finish(){if(!session||session.status==='done')return;session.status='done';$('pause').hidden=true;$('countdown').hidden=true;show('results');A.urgent(false);A.pause(false);A.play('finish');
    const ranking=C.rank(session.players);
    $('resultSubtitle').textContent=`${ranking[0].name} membuat ${ranking[0].sempurna} kado sempurna!`;
    podiumViews=[V.podium($('podium'),ranking.map(p=>({character:p.character,color:colors[p.i],name:p.name,meter:p.sempurna+' kado sempurna'})))];
    $('podium').setAttribute('aria-label','Panggung juara: '+ranking.map((p,i)=>'juara '+(i+1)+' '+p.name).join(', '));
    $('resultTable').innerHTML=ranking.map((p,i)=>`<div class="result-row"><b>${i+1}</b><b>${escape(p.name)}</b><span><b>${p.sempurna}</b><small>Kado sempurna</small></span><span><b>${p.okV}</b><small>Isi tepat (volume)</small></span><span><b>${p.okL}</b><small>Bungkus tepat (luas)</small></span></div>`).join('')}

  function loop(now){const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,.06);last=now;
    if(session?.status!=='paused')sim+=dt;V.frame();
    if(screen==='home'&&V.ready){if(!homeView)homeView=S3.home($('homeStage'));S3.updateHome(homeView,sim,settings.motion);V.render(homeView)}
    if(screen==='pick'&&V.ready){if(!pickView){pickView=V.create($('pickStage'),0,'pick');pickView.selected=pick.sel}V.update(pickView,null,sim,dt,settings.motion);V.render(pickView)}
    if(screen==='game'&&session){
      if(session.status==='countdown'){session.countdown-=elapsed;const n=Math.ceil(session.countdown);if(n!==session.lastCount){session.lastCount=n;$('countdownNumber').textContent=n>0?Math.min(3,n):'Buka!';A.play('count')}if(session.countdown<=0){session.status='play';$('countdown').hidden=true}}
      else if(session.status==='play'){
        session.remaining=Math.max(0,session.remaining-elapsed);updateTime();if(session.remaining<=0)finish();
        else for(const p of session.players){
          if((p.phase==='isi'||p.phase==='bungkus')&&!p.sibuk){p.sisa=Math.max(0,p.sisa-elapsed);const card=p.el.querySelector('.kado-card');card.querySelector('.question-timer').textContent=Math.ceil(p.sisa);card.querySelector('.question-track i').style.width=100*p.sisa/p.order.sabar+'%';
            const s=Math.ceil(p.sisa);if(s<=5&&s!==p.tick){p.tick=s;A.play('tick')}if(p.sisa<=0)selesai(p,true)}
          else if(p.phase==='hasil'){p.jeda-=elapsed;const n=p.el.querySelector('.kado-card .hitung');if(n)n.textContent=Math.max(0,Math.ceil(p.jeda));if(p.jeda<=0)berikut(p)}}
        A.urgent(session.remaining<=30||session.players.some(p=>(p.phase==='isi'||p.phase==='bungkus')&&p.sisa<p.order.sabar*.3));
      }
      if(screen==='game')session.players.forEach(p=>{const panik=session.status==='play'&&(p.phase==='isi'||p.phase==='bungkus')&&p.sisa<p.order.sabar*.3;S3.update(p.view,sim,session.status==='paused'?0:dt,settings.motion,panik);V.render(p.view)});
    }
    if(screen==='results')podiumViews.forEach(v=>{V.updatePodium(v,sim,dt,settings.motion);V.render(v)});
    requestAnimationFrame(loop)}

  document.querySelectorAll('[data-players]').forEach(b=>b.addEventListener('click',()=>{A.start();A.play('tap');openPick(Number(b.dataset.players))}));
  $('pickGo').addEventListener('click',confirmPick);$('pickBack').addEventListener('click',backPick);
  $('pickStage').addEventListener('pointerup',e=>{if(!pickView)return;const b=pickView.el.getBoundingClientRect();let best=-1,jarak=b.width/7;pickView.bots.forEach((r,j)=>{const q=V.project(pickView,r.g.position.clone().setY(1.4)),d=Math.hypot(q.x-(e.clientX-b.left),q.y-(e.clientY-b.top));if(d<jarak){jarak=d;best=j}});if(best>=0)choose(best)});
  document.querySelectorAll('[data-hello]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.hello;homeView?.bots[i].aksi('sapa');$('robotTalk').textContent=ROBOT[i].nama+': “'+SAPA[i]+'”';A.start();A.voice(i)}));
  $('setupBack').addEventListener('click',()=>{readSettings();pick.i=settings.players-1;pick.sel=settings.characters[pick.i];show('pick');renderPick()});
  $('setupForm').addEventListener('submit',e=>{e.preventDefault();if(!$('setupForm').reportValidity())return;readSettings();start()});
  $('volume').addEventListener('input',()=>{settings.volume=+$('volume').value;$('volumeValue').textContent=settings.volume+'%';configureAudio();A.start();save()});
  for(const id of['soundHome','gameSound'])$(id).addEventListener('click',()=>{muted=!muted;configureAudio();A.start()});
  $('pauseGame').addEventListener('click',pause);$('resumeGame').addEventListener('click',resume);$('endGame').addEventListener('click',finish);
  $('playAgain').addEventListener('click',start);$('changeSettings').addEventListener('click',()=>setup(settings.players));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});addEventListener('bookreturn',()=>{pause();A.stop()});
  /* papan ketik: tiap pemain punya 4 tombol (1234, 7890, qwer, uiop); Esc = jeda */
  addEventListener('keydown',e=>{if(e.key==='Escape'&&screen==='game'){session.status==='paused'?resume():pause();return}if(e.repeat||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||session?.status!=='play')return;
    const keys=['1234','7890','qwer','uiop'];for(const p of session.players){const j=keys[p.i].indexOf(e.key.toLowerCase());if(j<0)continue;e.preventDefault();if(p.phase==='hasil')berikut(p);else jawab(p,j)}});
  requestAnimationFrame(loop);
  return{get session(){return session},get settings(){return settings},get screen(){return screen},jawab:(i,j)=>jawab(session.players[i],j)};
})();
