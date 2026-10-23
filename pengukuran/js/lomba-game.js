/* PENGUKURAN · Lomba Lompat Tangga: alur permainan (menu, pilih tokoh, persiapan, arena terbagi, juara).
   Pola layar, suara, dan podium sama dengan Kota Langit & Bungkus Kado supaya terasa satu keluarga game.
   Setiap soal: tokoh berdiri di anak tangga satuan asal. Setelah menjawab, tokoh melompat ke satuan tujuan
   sambil menunjukkan ×10 / :10 di tiap anak tangga, lalu pembahasan muncul. */
const LombaGame=(()=>{
  const $=id=>document.getElementById(id),A=MenaraAudio,V=MenaraScene,S3=TanggaScene;
  const STORE='pengukuran-lompat-tangga-v1',colors=['#e8323c','#2f7bea','#1f9d55','#f08c00'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time=s=>Math.floor(Math.max(0,s)/60).toString().padStart(2,'0')+':'+Math.floor(Math.max(0,s)%60).toString().padStart(2,'0');
  const defaults={players:1,minutes:5,level:1,jenis:'campur',volume:85,music:true,fx:true,motion:true,names:['Tim Meto','Tim Lita','Tim Grama','Tim Tiko'],characters:[0,1,2,3]};
  const clamp=(v,min,max,f)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.round(Number(v)))):f;
  const bersih=(raw={})=>({...defaults,players:[1,2,4].includes(+raw.players)?+raw.players:1,minutes:clamp(raw.minutes,1,60,5),level:clamp(raw.level,1,3,1),jenis:['campur',...UK.BESARAN].includes(raw.jenis)?raw.jenis:'campur',volume:clamp(raw.volume,0,100,85),music:raw.music!==false,fx:raw.fx!==false,motion:raw.motion!==false,
    names:defaults.names.map((n,i)=>String(raw.names?.[i]||n).trim().slice(0,24)||n),characters:[0,1,2,3].map((n,i)=>[0,1,2,3].includes(raw.characters?.[i])?raw.characters[i]:n)});
  let raw={};try{raw=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(_){}
  let settings=bersih(raw),screen='home',session=null,homeView=null,pickView=null,pick={i:0,sel:0},podiumViews=[],sim=0,last=performance.now(),muted=false;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)settings.motion=false;
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(settings))}catch(_){}};
  const configureAudio=()=>{A.configure({...settings,volume:muted?0:settings.volume});$('soundHome').textContent=muted?'Suara mati':A.running?'Suara nyala':'Ketuk layar untuk musik';$('soundHome').classList.toggle('minta',!muted&&!A.running);for(const id of['soundHome','gameSound'])$(id).setAttribute('aria-pressed',!muted);$('gameSound').setAttribute('aria-label',muted?'Nyalakan suara':'Matikan suara')};
  configureAudio();addEventListener('audiostate',configureAudio);
  function show(id){screen=id;for(const n of['home','pick','setup','game','results'])$(n).hidden=n!==id;scrollTo(0,0)}
  function talk(p,teks,mood){p.el.querySelector('.robot-bubble').textContent=ROBOT[p.character].nama+': '+teks;if(mood)p.view.bot.aksi(mood)}
  const sabar=(lv,i,q)=>Math.max([0,20,17,14][lv],[0,40,35,30][lv]-i)+(q.gambar||['cerita','banding','durasi','selesai','jumlah'].includes(q.jenis)?8:0);
  const JUDUL={ubah:'UBAH SATUAN',jumlah:'SAMAKAN SATUAN',banding:'BANDINGKAN',cerita:'SOAL CERITA',alat:'BACA ALAT UKUR',gabung:'UBAH WAKTU',pecah:'UBAH WAKTU',durasi:'LAMA WAKTU',selesai:'PUKUL BERAPA',tahun:'WAKTU PANJANG',detik:'UBAH WAKTU'};

  /* ---------- pilih tokoh & persiapan ---------- */
  ROBOT.forEach((d,j)=>{const b=document.createElement('button');b.type='button';b.className='chunky ccard';b.innerHTML=`<span class="sw" style="background:${d.warna}"></span><b>${d.nama}</b><small>${d.julukan}</small><span class="tk"></span>`;b.addEventListener('click',()=>choose(j));$('pickCards').appendChild(b)});
  function choose(j){pick.sel=j;A.start();A.voice(j);pickView?.bots[j].aksi('sapa');renderPick()}
  function renderPick(){const h=$('pickHead');h.className='sel-head p'+(pick.i+1);h.innerHTML=`<span class="pl">Pemain ${pick.i+1}</span>, pilih tokohmu!`;
    [...$('pickCards').children].forEach((c,j)=>{c.setAttribute('aria-pressed',j===pick.sel);c.querySelector('.tk').innerHTML=settings.characters.slice(0,pick.i).map((ci,k)=>ci===j?`<span class="tag t${k}">P${k+1}</span>`:'').join('')});
    $('pickTalk').textContent=ROBOT[pick.sel].nama+': “'+ROBOT[pick.sel].kata+'”';if(pickView)pickView.selected=pick.sel}
  function openPick(n){settings.players=n;pick={i:0,sel:settings.characters[0]};show('pick');renderPick()}
  function confirmPick(){settings.characters[pick.i]=pick.sel;if(/^Tim (Meto|Lita|Grama|Tiko)$/.test(settings.names[pick.i]))settings.names[pick.i]='Tim '+ROBOT[pick.sel].nama;A.play('good');
    if(pick.i<settings.players-1){pick.i++;const dipakai=new Set(settings.characters.slice(0,pick.i));let n=settings.characters[pick.i];for(let k=0;k<4&&dipakai.has(n);k++)n=(n+1)%4;pick.sel=n;renderPick()}else{save();setup(settings.players)}}
  function backPick(){A.play('tap');if(pick.i>0){pick.i--;pick.sel=settings.characters[pick.i];renderPick()}else show('home')}
  function setup(n){settings.players=n;show('setup');$('modeBadge').textContent=n+' pemain';$('teamFields').innerHTML='';
    for(let i=0;i<n;i++){const row=document.createElement('div');row.className='team-field';row.style.setProperty('--player',colors[i]);row.innerHTML=`<span class="player-number">P${i+1}</span><input maxlength="24" aria-label="Nama kelompok pemain ${i+1}" autocomplete="off"><span class="robot-tag"><i style="background:${ROBOT[settings.characters[i]].warna}"></i>${ROBOT[settings.characters[i]].nama}</span>`;row.querySelector('input').value=settings.names[i];$('teamFields').appendChild(row)}
    $('sessionMinutes').value=settings.minutes;$('level').value=settings.level;$('jenis').value=settings.jenis;for(const id of['level','jenis'])$(id).dispatchEvent(new Event('change'));$('volume').value=settings.volume;$('volumeValue').textContent=settings.volume+'%';$('musicEnabled').checked=settings.music;$('fxEnabled').checked=settings.fx;$('motionEnabled').checked=settings.motion}
  function readSettings(){const teams=[...$('teamFields').children];settings=bersih({...settings,minutes:$('sessionMinutes').value,level:$('level').value,jenis:$('jenis').value,volume:$('volume').value,music:$('musicEnabled').checked,fx:$('fxEnabled').checked,motion:$('motionEnabled').checked,names:settings.names.map((n,i)=>teams[i]?.querySelector('input').value||n)});save();configureAudio()}

  /* ---------- arena ---------- */
  function buildPlayer(i,seed){
    const p={i,name:settings.names[i],character:settings.characters[i],seed,urut:0,benar:0,salah:0,habis:0,beruntun:0,terbaik:0,phase:'tanya',pilih:null,sisa:0,jeda:0,tick:-1,riwayat:[]};
    const el=document.createElement('article');p.el=el;el.className='arena';el.style.setProperty('--player',colors[i]);el.setAttribute('aria-label','Arena '+p.name);
    el.innerHTML=`<header class="arena-head"><div class="who"><span class="player-number">P${i+1}</span><span><b>${escape(p.name)}</b><small>${ROBOT[p.character].nama} · ${ROBOT[p.character].julukan}</small></span></div><div class="tower-score"><b>0</b><small>SOAL BENAR</small></div></header>
      <div class="arena-body"><div class="tower-view scene-slot"><div class="pesanan-tag papan-nilai"></div><div class="ukur-gambar" hidden></div><div class="clue-pop" hidden></div><div class="robot-bubble"></div></div><section class="question-card kado-card" aria-label="Soal pemain ${i+1}"></section></div>
      <footer class="build-footer"><span class="drag-instruction">Beruntun: <b class="runtun">0</b></span><span class="drag-instruction">Soal ke-<b class="nomor">1</b></span></footer>`;
    $('arenas').appendChild(el);p.view=S3.create(el.querySelector('.tower-view'),p.character,colors[i]);
    el.querySelector('.kado-card').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||session?.status!=='play')return;
      if(b.dataset.clue!==undefined)petunjuk(p);else if(b.dataset.opsi!==undefined)jawab(p,+b.dataset.opsi);else if(b.dataset.lanjut!==undefined&&p.phase==='hasil')berikut(p)});
    mulaiSoal(p,true);return p}
  function papanNilai(p,isi,kecil){p.el.querySelector('.papan-nilai').innerHTML=`<small>${kecil}</small>${isi}`}
  function kartu(p){const q=p.q,card=p.el.querySelector('.kado-card');card.classList.remove('bahas','bad');card.dataset.fase='isi';
    card.innerHTML=`<div class="question-head"><span class="quake-label">${UK.TANGGA[q.besaran].nama.toUpperCase()} · ${JUDUL[q.jenis]||'SOAL'}</span><button type="button" class="clue-btn" data-clue aria-expanded="false"><i>?</i>Petunjuk</button><b class="question-timer">${Math.ceil(p.sisa)}</b></div><div class="question-track"><i></i></div>
      <p class="question-text">${q.teks}</p>
      <div class="question-options">${q.opsi.map((v,j)=>`<button class="answer-option" data-opsi="${j}"><b>${'ABCD'[j]}</b><span>${v}</span></button>`).join('')}</div>`;
    tutupPetunjuk(p)}
  /* petunjuk: singkatan tangga satuan, hanya muncul kalau diketuk */
  function petunjuk(p){const pop=p.el.querySelector('.clue-pop');if(!pop.hidden)return tutupPetunjuk(p);
    const q=p.q,s=UK.SINGKAT,ing=s[q.besaran];A.play('tap');
    const isi=q.jenis==='tahun'?`<span class="rumus">${s.tahun.kode}</span><small>${s.tahun.kalimat}</small>`
      :q.besaran==='waktu'?`<span class="rumus">${ing.kode}</span><small>${ing.kalimat}: 1 minggu = 7 hari, 1 hari = 24 jam, 1 jam = 60 menit, 1 menit = 60 detik.</small>`
      :`<span class="rumus">${ing.kode}</span><small>${ing.kalimat}</small><small><b>${s.aturan.kode}</b>: ${s.aturan.kalimat}</small>`;
    const alat=q.jenis==='alat'?`<small>${q.kunci[0]}.</small>`:'';
    pop.innerHTML=`<b>Petunjuk · ${UK.TANGGA[q.besaran].nama}</b>${isi}${alat}`;pop.hidden=false;p.el.querySelector('[data-clue]')?.setAttribute('aria-expanded','true')}
  function tutupPetunjuk(p){p.el.querySelector('.clue-pop').hidden=true;p.el.querySelector('[data-clue]')?.setAttribute('aria-expanded','false')}
  function mulaiSoal(p,awal=false){
    const q=UK.soal(p.seed,p.urut,settings.level,settings.jenis);p.q=q;p.phase='tanya';p.pilih=null;p.sisa=sabar(settings.level,p.urut,q);p.total=p.sisa;p.tick=-1;
    S3.bangun(p.view,q.lompat?.besaran||q.besaran);const T=UK.TANGGA[p.view.besaran];
    S3.taruh(p.view,q.lompat?T.satuan.indexOf(q.lompat.dari):T.satuan.indexOf(T.pokok));
    papanNilai(p,q.lompat?`${UK.angka(q.lompat.nilai)} ${q.lompat.dari}`:UK.TANGGA[q.besaran].nama,q.lompat?`Mulai dari anak tangga ${q.lompat.dari}`:`Soal ${p.urut+1}`);
    const g=p.el.querySelector('.ukur-gambar');g.hidden=!q.gambar;g.innerHTML=q.gambar||'';
    p.el.querySelector('.nomor').textContent=p.urut+1;kartu(p);
    talk(p,awal?'Ayo mulai! Ketuk Petunjuk kalau lupa singkatannya.':q.lompat?`Aku di anak tangga ${q.lompat.dari}. Mau ke ${q.lompat.ke}!`:'Soal baru, ayo pikirkan!','sapa')}
  function jawab(p,j){if(p.phase!=='tanya')return;const q=p.q;p.pilih=j;p.phase='lompat';tutupPetunjuk(p);
    const card=p.el.querySelector('.kado-card');card.querySelectorAll('[data-opsi]').forEach(b=>{b.disabled=true;const k=+b.dataset.opsi;if(k===q.benar)b.classList.add('correct');else if(k===j)b.classList.add('wrong')});
    const ok=j===q.benar;A.play(ok?'place':'bad');
    talk(p,ok?'Betul! Lihat aku melompat!':'Hmm, belum tepat. Lihat lompatan yang benar!',ok?'senang':'bingung');
    if(q.lompat){S3.lompat(p.view,q.lompat.dari,q.lompat.ke,q.lompat.nilai,(x,u)=>{A.play('tick');papanNilai(p,`${UK.angka(x)} ${u}`,`Sekarang di anak tangga ${u}`)},()=>{if(session?.status!=='done')selesai(p,false)})}
    else setTimeout(()=>{if(session?.status!=='done'&&p.phase==='lompat')selesai(p,false)},900)}
  function selesai(p,habis){const q=p.q,ok=!habis&&p.pilih===q.benar;p.phase='hasil';p.jeda=7;tutupPetunjuk(p);
    if(ok){p.benar++;p.beruntun++;p.terbaik=Math.max(p.terbaik,p.beruntun)}else{p.beruntun=0;if(habis)p.habis++;else p.salah++}
    p.riwayat.push({q,ok,habis,pilih:p.pilih});
    A.play(ok?'perfect':habis?'quake':'bad');
    talk(p,ok?(p.beruntun>=3?`${p.beruntun} kali beruntun! Hebat!`:'Mantap, jawabanmu tepat!'):habis?'Waktunya habis. Baca pembahasannya ya!':'Belum tepat. Baca pembahasannya ya!',ok?'senang':'bingung');
    p.el.querySelector('.tower-score>b').textContent=p.benar;p.el.querySelector('.runtun').textContent=p.beruntun;
    const card=p.el.querySelector('.kado-card');card.classList.add('bahas');card.classList.toggle('bad',!ok);
    const ing=q.jenis==='tahun'?UK.SINGKAT.tahun:q.ingat;
    card.innerHTML=`<div class="bahas-hasil"><b>${ok?'Benar!':habis?'Waktu habis':'Belum tepat'}</b><span>Jawaban: ${q.opsi[q.benar]}${!ok&&p.pilih!==null?` · pilihanmu ${q.opsi[p.pilih]}`:''}</span></div>
      <div class="bahas-kunci">${q.kunci.map((k,i)=>`<div class="kunci-baris ${i===q.kunci.length-1?'ok':''}"><b>${i+1}</b><span>${k}</span></div>`).join('')}</div>
      <p class="kado-ingat"><b>${ing.kode}</b> · ${ing.kalimat}</p><button class="primary-btn next-block" data-lanjut>Soal berikutnya ↗ <span class="hitung">${p.jeda}</span></button>`;
    if(habis&&q.lompat&&!S3.sibuk(p.view))S3.lompat(p.view,q.lompat.dari,q.lompat.ke,q.lompat.nilai,(x,u)=>papanNilai(p,`${UK.angka(x)} ${u}`,`Sekarang di anak tangga ${u}`))}
  function berikut(p){if(p.phase!=='hasil')return;p.urut++;mulaiSoal(p)}

  /* ---------- sesi ---------- */
  function clearViews(){podiumViews.forEach(V.dispose);podiumViews=[]}
  function start(){if(!V.ready)return;clearViews();$('pause').hidden=true;show('game');$('arenas').innerHTML='';$('arenas').className='arenas mode-'+settings.players;
    const seed=Math.floor(Math.random()*0x7fffffff);session={status:'countdown',beforePause:'play',remaining:settings.minutes*60,total:settings.minutes*60,countdown:3.2,lastCount:-1,players:[],seed};
    for(let i=0;i<settings.players;i++)session.players.push(buildPlayer(i,seed));
    $('countdown').hidden=false;$('countdownNumber').textContent='3';A.pause(false);A.urgent(false);A.start();updateTime()}
  function updateTime(){$('sessionClock').textContent=time(Math.ceil(session.remaining));$('sessionProgress').style.width=100*session.remaining/session.total+'%';$('sessionClock').parentElement.classList.toggle('urgent',session.remaining<=30)}
  function pause(){if(!session||!['play','countdown'].includes(session.status))return;session.beforePause=session.status;session.status='paused';$('pause').hidden=false;A.pause(true);$('resumeGame').focus()}
  function resume(){if(session?.status!=='paused')return;session.status=session.beforePause;$('pause').hidden=true;A.pause(false);A.start()}
  const rank=ps=>ps.slice().sort((a,b)=>b.benar-a.benar||b.terbaik-a.terbaik||(a.salah+a.habis)-(b.salah+b.habis)||a.i-b.i);
  function finish(){if(!session||session.status==='done')return;session.status='done';$('pause').hidden=true;$('countdown').hidden=true;show('results');A.urgent(false);A.pause(false);A.play('finish');
    const ranking=rank(session.players);
    $('resultSubtitle').textContent=`${ranking[0].name} menjawab ${ranking[0].benar} soal dengan benar!`;
    podiumViews=[V.podium($('podium'),ranking.map(p=>({character:p.character,color:colors[p.i],name:p.name,meter:p.benar+' soal benar'})))];
    $('podium').setAttribute('aria-label','Panggung juara: '+ranking.map((p,i)=>'juara '+(i+1)+' '+p.name).join(', '));
    $('resultTable').innerHTML=ranking.map((p,i)=>`<div class="result-row"><b>${i+1}</b><b>${escape(p.name)}</b><span><b>${p.benar}</b><small>Benar</small></span><span><b>${p.terbaik}</b><small>Beruntun terbaik</small></span><span><b>${p.salah+p.habis}</b><small>Salah / habis waktu</small></span></div>`).join('')}

  function loop(now){const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,.06);last=now;
    if(session?.status!=='paused')sim+=dt;V.frame();
    if(screen==='home'&&V.ready){if(!homeView)homeView=S3.home($('homeStage'));S3.updateHome(homeView,sim,settings.motion);V.render(homeView)}
    if(screen==='pick'&&V.ready){if(!pickView){pickView=V.create($('pickStage'),0,'pick');pickView.selected=pick.sel}V.update(pickView,null,sim,dt,settings.motion);V.render(pickView)}
    if(screen==='game'&&session){
      if(session.status==='countdown'){session.countdown-=elapsed;const n=Math.ceil(session.countdown);if(n!==session.lastCount){session.lastCount=n;$('countdownNumber').textContent=n>0?Math.min(3,n):'Mulai!';A.play('count')}if(session.countdown<=0){session.status='play';$('countdown').hidden=true}}
      else if(session.status==='play'){
        session.remaining=Math.max(0,session.remaining-elapsed);updateTime();if(session.remaining<=0)finish();
        else for(const p of session.players){
          if(p.phase==='tanya'){p.sisa=Math.max(0,p.sisa-elapsed);const card=p.el.querySelector('.kado-card');card.querySelector('.question-timer').textContent=Math.ceil(p.sisa);card.querySelector('.question-track i').style.width=100*p.sisa/p.total+'%';
            const s=Math.ceil(p.sisa);if(s<=5&&s!==p.tick){p.tick=s;A.play('tick')}if(p.sisa<=0)selesai(p,true)}
          else if(p.phase==='hasil'){p.jeda-=elapsed;const n=p.el.querySelector('.kado-card .hitung');if(n)n.textContent=Math.max(0,Math.ceil(p.jeda));if(p.jeda<=0)berikut(p)}}
        A.urgent(session.remaining<=30||session.players.some(p=>p.phase==='tanya'&&p.sisa<p.total*.3));
      }
      if(screen==='game')session.players.forEach(p=>{const panik=session.status==='play'&&p.phase==='tanya'&&p.sisa<p.total*.3;S3.update(p.view,sim,session.status==='paused'?0:dt,settings.motion,panik);V.render(p.view)});
    }
    if(screen==='results')podiumViews.forEach(v=>{V.updatePodium(v,sim,dt,settings.motion);V.render(v)});
    requestAnimationFrame(loop)}

  document.querySelectorAll('[data-players]').forEach(b=>b.addEventListener('click',()=>{A.start();A.play('tap');openPick(Number(b.dataset.players))}));
  $('pickGo').addEventListener('click',confirmPick);$('pickBack').addEventListener('click',backPick);
  $('pickStage').addEventListener('pointerup',e=>{if(!pickView)return;const b=pickView.el.getBoundingClientRect();let best=-1,jarak=b.width/7;pickView.bots.forEach((r,j)=>{const q=V.project(pickView,r.g.position.clone().setY(1.4)),d=Math.hypot(q.x-(e.clientX-b.left),q.y-(e.clientY-b.top));if(d<jarak){jarak=d;best=j}});if(best>=0)choose(best)});
  document.querySelectorAll('[data-hello]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.hello;homeView?.bots[i].aksi('sapa');$('robotTalk').textContent=ROBOT[i].nama+': “'+ROBOT[i].kata+'”';A.start();A.voice(i)}));
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
