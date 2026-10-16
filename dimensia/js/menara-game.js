/* DIMENSIA Kota Langit: seret, susun, selamatkan menara. */
const KotaGame=(()=>{
  const $=id=>document.getElementById(id),C=MenaraCore,A=MenaraAudio,V=MenaraScene;
  const STORE='dimensia-kota-langit-v1',colors=['#e8323c','#2f7bea','#1f9d55','#f08c00'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time=s=>Math.floor(Math.max(0,s)/60).toString().padStart(2,'0')+':'+Math.floor(Math.max(0,s)%60).toString().padStart(2,'0');
  const height=p=>(Math.round(C.height(p)*10)/10).toFixed(1).replace('.',',');
  let raw={};try{raw=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(_){}
  let settings=C.settings(raw),screen='home',session=null,homeView=null,pickView=null,pick={i:0,sel:0},podiumViews=[],sim=0,last=performance.now(),muted=false;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)settings.motion=false;
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(settings))}catch(_){}};
  const configureAudio=()=>{A.configure({...settings,volume:muted?0:settings.volume});$('soundHome').textContent=muted?'Suara mati':A.running?'Suara nyala':'Ketuk layar untuk musik';$('soundHome').classList.toggle('minta',!muted&&!A.running);for(const id of['soundHome','gameSound'])$(id).setAttribute('aria-pressed',!muted);$('gameSound').setAttribute('aria-label',muted?'Nyalakan suara':'Matikan suara')};
  configureAudio();addEventListener('audiostate',configureAudio);
  function show(id){screen=id;for(const name of['home','pick','setup','game','results'])$(name).hidden=name!==id;scrollTo(0,0)}
  function talk(p,message,mood){p.el.querySelector('.robot-bubble').textContent=ROBOT[p.character].nama+': '+message;if(mood)V.mood(p.view,mood)}
  function setup(n){settings.players=n;show('setup');$('modeBadge').textContent=n+' pemain';$('teamFields').innerHTML='';
    for(let i=0;i<n;i++){const row=document.createElement('div');row.className='team-field';row.style.setProperty('--player',colors[i]);row.innerHTML=`<span class="player-number">P${i+1}</span><input maxlength="24" aria-label="Nama kelompok pemain ${i+1}" autocomplete="off"><span class="robot-tag"><i style="background:${ROBOT[settings.characters[i]].warna}"></i>${ROBOT[settings.characters[i]].nama}</span>`;row.querySelector('input').value=settings.names[i];$('teamFields').appendChild(row)}
    $('sessionMinutes').value=settings.minutes;$('questionSeconds').value=settings.questionSeconds;$('penalty').value=settings.penalty;$('level').value=settings.level;$('jenisSoal').value=settings.soal;$('jenisSoal').dispatchEvent(new Event('change'));$('volume').value=settings.volume;$('volumeValue').textContent=settings.volume+'%';$('musicEnabled').checked=settings.music;$('fxEnabled').checked=settings.fx;$('motionEnabled').checked=settings.motion;
  }
  function readSettings(){const teams=[...$('teamFields').children];settings=C.settings({...settings,minutes:$('sessionMinutes').value,questionSeconds:$('questionSeconds').value,penalty:$('penalty').value,level:$('level').value,soal:$('jenisSoal').value,volume:$('volume').value,music:$('musicEnabled').checked,fx:$('fxEnabled').checked,motion:$('motionEnabled').checked,names:settings.names.map((name,i)=>teams[i]?.querySelector('input').value||name),characters:settings.characters});save();configureAudio()}
  /* Pilih robot per pemain, seperti "pilih jagoanmu" di Laskar Pecahan */
  const SAPA=['Bangun impianmu, satu bentuk setiap kali!','Aku periksa keseimbangannya. Kamu susun bangunnya!','Setiap jawaban benar menyelamatkan menara!','Ayo berlomba sampai menyentuh awan!'];
  ROBOT.forEach((d,j)=>{const b=document.createElement('button');b.type='button';b.className='chunky ccard';b.innerHTML=`<span class="sw" style="background:${d.warna}"></span><b>${d.nama}</b><small>${d.julukan}</small><span class="tk"></span>`;b.addEventListener('click',()=>choose(j));$('pickCards').appendChild(b)});
  function choose(j){pick.sel=j;A.start();A.voice(j);pickView?.bots[j].aksi('sapa');renderPick()}
  function renderPick(){const h=$('pickHead');h.className='sel-head p'+(pick.i+1);h.innerHTML=`<span class="pl">Pemain ${pick.i+1}</span>, pilih robotmu!`;
    [...$('pickCards').children].forEach((c,j)=>{c.setAttribute('aria-pressed',j===pick.sel);c.querySelector('.tk').innerHTML=settings.characters.slice(0,pick.i).map((ci,k)=>ci===j?`<span class="tag t${k}">P${k+1}</span>`:'').join('')});
    $('pickTalk').textContent=ROBOT[pick.sel].nama+': “'+ROBOT[pick.sel].kata+'”';if(pickView)pickView.selected=pick.sel}
  function openPick(n){settings.players=n;pick={i:0,sel:settings.characters[0]};show('pick');renderPick()}
  function confirmPick(){const lama=settings.characters[pick.i];settings.characters[pick.i]=pick.sel;
    if(/^Tim (Orbo|Hexi|Nova|Zipp)$/.test(settings.names[pick.i]))settings.names[pick.i]='Tim '+ROBOT[pick.sel].nama;
    A.play('good');
    if(pick.i<settings.players-1){pick.i++;const dipakai=new Set(settings.characters.slice(0,pick.i));let n=settings.characters[pick.i];for(let k=0;k<4&&dipakai.has(n);k++)n=(n+1)%4;pick.sel=n;renderPick()}
    else{save();setup(settings.players)}}
  function backPick(){A.play('tap');if(pick.i>0){pick.i--;pick.sel=settings.characters[pick.i];renderPick()}else show('home')}
  function buildPlayer(i,seed){
    const p=C.player(i,settings.names[i],settings.characters[i],seed);
    p.deck=DSoal.deck(seed+i*1709,settings.level,settings.soal);p.q=null;p.qRemaining=0;p.selection=null;p.pointer=null;p.feedbackLeft=0;p.lastTick=-1;
    const el=document.createElement('article');p.el=el;el.className='arena';el.style.setProperty('--player',colors[i]);el.setAttribute('aria-label','Arena '+p.name);
    el.innerHTML=`<header class="arena-head"><div class="who"><span class="player-number">P${i+1}</span><span><b>${escape(p.name)}</b><small>${ROBOT[p.character].nama} · penyusun menara</small></span></div><div class="tower-score"><b>0,0 m</b><small>TINGGI MENARA</small></div></header><div class="arena-body"><div class="tower-view scene-slot"><div class="build-note"><span>Taruh titik tengah bangun di atas tumpuannya</span></div><button class="piece-handle" aria-label="Seret bangun pemain ${i+1}; gunakan panah kiri dan kanan lalu Enter untuk meletakkan"><span>SERET ↔</span></button><div class="robot-bubble"></div></div><section class="question-card" aria-label="Soal geometri pemain ${i+1}" hidden></section></div><footer class="build-footer"><div class="build-steps"><i></i><i></i><i></i><span>0/3 menuju soal</span></div><span class="drag-instruction">Seret &amp; lepas</span></footer>`;
    $('arenas').appendChild(el);p.view=V.create(el.querySelector('.tower-view'),p.character);V.sync(p.view,p);talk(p,'Ayo, tumpuk bangun pertama!','sapa');
    const handle=el.querySelector('.piece-handle');
    handle.addEventListener('pointerdown',e=>{if(!canBuild(p)||p.pointer!==null)return;e.preventDefault();A.start();p.pointer=e.pointerId;p.moved=false;p.downAt=[e.clientX,e.clientY];handle.setPointerCapture(e.pointerId);handle.classList.add('dragging');p.view.drag=true;talk(p,'Geser, lalu lepaskan di atas menara.')});
    handle.addEventListener('pointermove',e=>{if(p.pointer!==e.pointerId||!canBuild(p))return;e.preventDefault();if(!p.moved&&Math.hypot(e.clientX-p.downAt[0],e.clientY-p.downAt[1])<8)return;p.moved=true;V.drag(p.view,p,e.clientX,e.clientY);const ok=C.landing(p,p.view.incoming.position.x).ok;handle.style.borderColor=ok?'#1f9d55':'#e8323c';});
    handle.addEventListener('pointerup',e=>{if(p.pointer!==e.pointerId)return;e.preventDefault();p.pointer=null;handle.classList.remove('dragging');p.view.drag=null;handle.style.borderColor='';if(!canBuild(p))return;if(p.moved)drop(p);else talk(p,'Seret bangunnya sampai ke atas menara, lalu lepaskan.','petunjuk')});
    const cancel=()=>{p.pointer=null;handle.classList.remove('dragging');p.view.drag=null;handle.style.borderColor=''};handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',cancel);
    handle.addEventListener('keydown',e=>{if(!canBuild(p))return;if(['ArrowLeft','ArrowRight','Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='ArrowLeft'||e.key==='ArrowRight')p.view.incoming.position.x=Math.max(-3.6,Math.min(3.6,p.view.incoming.position.x+(e.key==='ArrowLeft'?-.25:.25)));else if(!e.repeat)drop(p)}});

    el.querySelector('.question-card').addEventListener('click',e=>{const button=e.target.closest('button');if(!button||session?.status!=='play')return;
      if(button.dataset.next!==undefined){if(p.phase==='feedback')continueBuilding(p);return}
      if(p.phase!=='question')return;
      if(button.dataset.answer!==undefined){const index=Number(button.dataset.answer);if(p.q.type==='pg')answer(p,index);else{p.selection[index]=!p.selection[index];renderSelections(p)}}
      if(button.dataset.statement!==undefined){p.selection[Number(button.dataset.statement)]=button.dataset.value==='true';renderSelections(p)}
      if(button.dataset.submit!==undefined&&complete(p))answer(p,p.selection.slice());
    });
    return p;
  }
  function clearViews(){if(session)session.players.forEach(p=>V.dispose(p.view));podiumViews.forEach(V.dispose);podiumViews=[]}
  function start(){if(!V.ready)return;clearViews();$('pause').hidden=true;$('review').hidden=true;show('game');$('arenas').innerHTML='';$('arenas').className='arenas mode-'+settings.players;
    const seed=Math.floor(Math.random()*0x7fffffff);session={status:'countdown',beforePause:'play',remaining:settings.minutes*60,total:settings.minutes*60,countdown:3.2,lastCount:-1,players:[],seed};
    for(let i=0;i<settings.players;i++)session.players.push(buildPlayer(i,seed));
    $('countdown').hidden=false;$('countdownNumber').textContent='3';A.pause(false);A.urgent(false);A.start();updateTime();
  }
  const canBuild=p=>session?.status==='play'&&p.phase==='build'&&!p.view.anim;
  function drop(p){if(!canBuild(p))return;p.pointer=null;p.el.querySelector('.piece-handle').hidden=true;
    V.drop(p.view,p,(x,hit)=>{if(session.status==='done')return;if(!hit.ok){A.play('bad');p.warned=(p.warned||0)+1;const arah=hit.side<0?'kiri':'kanan';warn(p,hit.reason==='miring'?`Woi, letakkan yang benar! Menaramu terlalu miring, geser ke ${arah}.`:'Woi, letakkan yang benar! Taruh di atas bangun paling atas.');refreshPlayer(p);return}
      const result=C.place(p,x);
      A.play(result.perfect?'perfect':'place');talk(p,result.perfect?'Pas sekali! Seimbang sempurna!':`Seimbang! Berikutnya ${p.next.kind}.`,'senang');
      refreshPlayer(p);
      // Soal muncul setiap tiga bangun yang berhasil terpasang; peletakan yang ditolak tidak dihitung.
      if(result.question)ask(p);else{V.sync(p.view,p);if(p.placed%5===0)greetRival(p)}
    });
  }
  function warn(p,message){talk(p,message,'bingung');const note=p.el.querySelector('.build-note'),span=note.querySelector('span');span.textContent=message;note.classList.remove('warn');void note.offsetWidth;note.classList.add('warn');clearTimeout(p.warnTimer);p.warnTimer=setTimeout(()=>{note.classList.remove('warn');span.textContent='Taruh titik tengah bangun di atas tumpuannya'},2600)}
  function greetRival(p){if(session.players.length<2)return;const other=session.players[(p.i+1)%session.players.length];if(other.phase==='build')talk(other,`${ROBOT[p.character].nama}, menaramu keren! Aku menyusul!`,'sapa')}
  function refreshPlayer(p){p.el.querySelector('.tower-score>b').textContent=height(p)+' m';const count=p.placed%3;const steps=p.el.querySelector('.build-steps');[...steps.querySelectorAll('i')].forEach((el,i)=>el.classList.toggle('done',i<count));steps.querySelector('span').textContent=p.phase==='question'?'Gempa! Jawab soal':count+'/3 menuju soal';p.el.querySelector('.piece-handle').hidden=p.phase!=='build'||!!p.view.anim;p.el.querySelector('.build-note').hidden=p.phase!=='build'}
  function questionBody(q){let opts='';if(q.type==='kategori'){opts=q.statements.map((s,i)=>`<div class="statement"><span>${i+1}. ${escape(s.text)}</span><button data-statement="${i}" data-value="true" aria-pressed="false">Benar</button><button data-statement="${i}" data-value="false" aria-pressed="false">Salah</button></div>`).join('')}
    else opts=`<div class="question-options">${q.options.map((o,i)=>`<button class="answer-option" data-answer="${i}" ${q.type==='multi'?'aria-pressed="false"':''}><b>${'ABCD'[i]}</b><span>${o.startsWith('<svg')?o:escape(o)}</span></button>`).join('')}</div>`;
    return `<div class="question-head"><span class="quake-label">GEMPA · ${escape(q.topic)}</span><b class="question-timer">${settings.questionSeconds}</b></div><div class="question-track"><i></i></div><div class="question-content"><p class="question-text">${escape(q.text)}</p>${q.diagram?`<div class="question-figure">${q.diagram}</div>`:''}</div>${opts}${q.type!=='pg'?'<button class="submit-answer" data-submit disabled>Kunci jawaban</button>':''}<div class="feedback" hidden></div>`;
  }
  function ask(p){p.phase='question';p.q=p.deck.next();p.selection=p.q.type==='pg'?null:p.q.correct.map(()=>p.q.type==='multi'?false:null);p.qRemaining=settings.questionSeconds;p.lastTick=-1;
    const card=p.el.querySelector('.question-card');card.hidden=false;card.innerHTML=questionBody(p.q);p.el.classList.add('quake');refreshPlayer(p);V.sync(p.view,p);talk(p,'Waaah, gempa! Bantu aku menjawab!','panik');A.play('quake');
  }
  const complete=p=>p.q.type==='multi'?p.selection.some(Boolean):p.q.type==='kategori'?p.selection.every(v=>v!==null):p.selection!==null;
  function renderSelections(p){const card=p.el.querySelector('.question-card');card.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',p.selection[Number(b.dataset.answer)]));card.querySelectorAll('[data-statement]').forEach(b=>b.setAttribute('aria-pressed',p.selection[Number(b.dataset.statement)]===(b.dataset.value==='true')));card.querySelector('[data-submit]').disabled=!complete(p);A.play('tap')}
  function answer(p,selection,timeout=false){if(p.phase!=='question'||session?.status!=='play')return;const good=!timeout&&DSoal.correct(p.q,selection);p.phase='feedback';p.feedbackLeft=6;p.el.classList.remove('quake');good?p.correct++:p.wrong++;const removed=good?[]:C.damage(p,settings.penalty);
    p.history.push({question:p.q,selection,correct:good,timeout,removed:removed.length});V.sync(p.view,p);refreshPlayer(p);
    const card=p.el.querySelector('.question-card');card.querySelectorAll('button').forEach(b=>b.disabled=true);card.querySelector('.quake-label').textContent=good?'GEMPA REDA!':timeout?'WAKTU HABIS':'AYO, BELAJAR LAGI';
    if(p.q.type==='pg')card.querySelectorAll('[data-answer]').forEach(b=>{const i=Number(b.dataset.answer);b.classList.toggle('correct',i===p.q.correct);b.classList.toggle('wrong',!good&&i===selection)});
    const fb=card.querySelector('.feedback');fb.hidden=false;fb.classList.toggle('bad',!good);fb.innerHTML=`<b>${good?'Hebat! Menaramu selamat.':(timeout?'Waktu habis. ':'Belum tepat. ')+(removed.length?removed.length+' bangun teratas lepas.':'Menaramu tetap utuh.')}</b>${escape(p.q.explanation)}<br><button class="primary-btn next-block" data-next>Lanjut membangun ↗</button>`;
    talk(p,good?'Yess! Terima kasih, penyusun hebat!':'Tidak apa-apa, kita tumpuk lagi!',good?'senang':'bingung');A.play(good?'good':'bad');
  }
  function continueBuilding(p){if(p.phase!=='feedback')return;p.phase='build';p.q=null;p.selection=null;p.el.querySelector('.question-card').hidden=true;p.el.classList.remove('quake');V.sync(p.view,p);refreshPlayer(p);talk(p,'Bangun berikutnya: '+p.next.kind+'.','sapa')}
  function updateTime(){$('sessionClock').textContent=time(Math.ceil(session.remaining));$('sessionProgress').style.width=100*session.remaining/session.total+'%';$('sessionClock').parentElement.classList.toggle('urgent',session.remaining<=30)}
  function pause(){if(!session||!['play','countdown'].includes(session.status))return;session.beforePause=session.status;session.status='paused';$('pause').hidden=false;A.pause(true);session.players.forEach(p=>{p.pointer=null;p.view.drag=null;p.el.querySelector('.piece-handle').classList.remove('dragging')});$('resumeGame').focus()}
  function resume(){if(session?.status!=='paused')return;session.status=session.beforePause;$('pause').hidden=true;A.pause(false);A.start()}
  function finish(){if(!session||session.status==='done')return;session.status='done';session.players.forEach(p=>{p.pointer=null;p.view.anim=null;if(p.phase==='question'){p.history.push({question:p.q,selection:p.selection,correct:false,incomplete:true,timeout:false,removed:0});p.phase='finished'}});$('pause').hidden=true;$('countdown').hidden=true;show('results');A.urgent(false);A.pause(false);A.play('finish');
    const ranking=C.rank(session.players);
    $('resultSubtitle').textContent=ranking[0].name+' membangun menara tertinggi: '+height(ranking[0])+' meter.';
    podiumViews.forEach(V.dispose);$('podium').setAttribute('aria-label','Panggung juara: '+ranking.map((p,i)=>'juara '+(i+1)+' '+p.name).join(', '));
    podiumViews=[V.podium($('podium'),ranking.map(p=>({character:p.character,color:colors[p.i],name:p.name,meter:height(p)+' meter'})))];
    $('resultTable').innerHTML=ranking.map((p,i)=>`<div class="result-row"><b>${i+1}</b><b>${escape(p.name)}</b><span><b>${height(p)} m</b><small>Tinggi akhir</small></span><span><b>${p.correct}</b><small>Jawaban benar</small></span><span><b>${p.perfect}</b><small>Susunan tepat</small></span></div>`).join('');
  }
  function answerText(q,selection){if(selection===null||selection===undefined)return'Belum dijawab';if(q.type==='pg')return typeof selection==='number'?'Pilihan '+'ABCD'[selection]:'Belum dijawab';if(q.type==='kategori')return selection.map((v,i)=>(i+1)+'. '+(v===null?'—':v?'Benar':'Salah')).join('; ');return selection.map((v,i)=>v?'ABCD'[i]:'').filter(Boolean).join(', ')||'Belum memilih'}
  function reviewMarkup(){return session.players.map(p=>`<h3>${escape(p.name)}</h3>${p.history.length?p.history.map((h,i)=>`<article class="review-item"><small>Soal ${i+1} · ${escape(h.question.topic)} · ${h.incomplete?'Sesi berakhir sebelum jawaban dikunci':h.correct?'Benar':h.timeout?'Waktu habis':'Belum tepat'}</small><h3>${escape(h.question.text)}</h3>${h.question.diagram||''}${h.question.type==='kategori'?h.question.statements.map((s,j)=>`<p>${j+1}. ${escape(s.text)} — <b>${s.answer?'Benar':'Salah'}</b></p>`).join(''):h.question.options.map((o,j)=>`<p>${'ABCD'[j]}. ${o.startsWith('<svg')?o:escape(o)}</p>`).join('')}<p>Jawabanmu: ${escape(answerText(h.question,h.selection))}</p><p>Kunci: ${escape(answerText(h.question,h.question.correct))}</p><div class="explanation">${escape(h.question.explanation)}</div></article>`).join(''):'<p>Belum ada soal. Susun tiga bangun untuk memunculkan soal.</p>'}`).join('')}
  function download(){const body=reviewMarkup(),html=`<!doctype html><html lang="id"><meta charset="utf-8"><title>Pembahasan DIMENSIA</title><style>body{font:16px/1.5 sans-serif;max-width:850px;margin:40px auto;padding:20px;color:#294451}svg{width:230px;max-height:150px}.review-item{border-top:1px solid #aaa;padding:18px 0;break-inside:avoid}.explanation{background:#edf5e7;padding:15px}small{color:#64796f}</style><h1>DIMENSIA · Soal & Pembahasan</h1>${body}</html>`;const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Dimensia-Soal-dan-Pembahasan.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function loop(now){const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,.06);last=now;
    if(session?.status!=='paused')sim+=dt;V.frame();
    if(screen==='home'&&V.ready){if(!homeView)homeView=V.create($('cityPreview'),0,true);V.update(homeView,null,sim,dt,settings.motion);V.render(homeView)}
    if(screen==='pick'&&V.ready){if(!pickView){pickView=V.create($('pickStage'),0,'pick');pickView.selected=pick.sel}V.update(pickView,null,sim,dt,settings.motion);V.render(pickView)}
    if(screen==='game'&&session){
      if(session.status==='countdown'){session.countdown-=elapsed;const n=Math.ceil(session.countdown);if(n!==session.lastCount){session.lastCount=n;$('countdownNumber').textContent=n>0?Math.min(3,n):'Mulai!';A.play('count')}if(session.countdown<=0){session.status='play';$('countdown').hidden=true;session.players.forEach(refreshPlayer)}}
      else if(session.status==='play'){
        session.remaining=Math.max(0,session.remaining-elapsed);updateTime();if(session.remaining<=0)finish();
        else for(const p of session.players){if(p.phase==='question'){p.qRemaining=Math.max(0,p.qRemaining-elapsed);const card=p.el.querySelector('.question-card');card.querySelector('.question-timer').textContent=Math.ceil(p.qRemaining);card.querySelector('.question-track i').style.width=100*p.qRemaining/settings.questionSeconds+'%';const sec=Math.ceil(p.qRemaining);if(sec<=5&&sec!==p.lastTick){p.lastTick=sec;A.play('tick')}if(p.qRemaining<=0)answer(p,null,true)}else if(p.phase==='feedback'){p.feedbackLeft-=elapsed;if(p.feedbackLeft<=0)continueBuilding(p)}}
        A.urgent(session.players.some(p=>p.phase==='question')||session.remaining<=30);
      }
      if(screen==='game')session.players.forEach(p=>{V.update(p.view,p,sim,session.status==='paused'?0:dt,settings.motion);V.render(p.view)});
    }
    if(screen==='results')podiumViews.forEach(v=>{V.updatePodium(v,sim,dt,settings.motion);V.render(v)});
    requestAnimationFrame(loop);
  }
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
  $('showReview').addEventListener('click',()=>{$('reviewContent').innerHTML=reviewMarkup();$('review').hidden=false});$('closeReview').addEventListener('click',()=>{$('review').hidden=true});$('downloadReview').addEventListener('click',download);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});addEventListener('bookreturn',()=>{pause();A.stop()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&screen==='game'){session.status==='paused'?resume():pause();return}if(e.repeat||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||session?.status!=='play')return;const keys=['1234','7890','qwer','uiop'];for(const p of session.players){const i=keys[p.i].indexOf(e.key.toLowerCase());if(i<0||p.phase!=='question'||p.q.type==='kategori')continue;e.preventDefault();if(p.q.type==='pg')answer(p,i);else{p.selection[i]=!p.selection[i];renderSelections(p)}}});
  requestAnimationFrame(loop);
  return{get podium(){return podiumViews[0]},get session(){return session},get settings(){return settings},get screen(){return screen}};
})();
