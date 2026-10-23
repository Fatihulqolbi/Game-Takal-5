const MenaraAudio=(()=>{
  let ctx,master,mus,fx,limiter,timer,step=0,urgent=false,paused=false;
  let config={volume:85,music:true,fx:true};
  function start(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;if(!ctx){ctx=new AC();master=ctx.createGain();mus=ctx.createGain();fx=ctx.createGain();limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=9;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.2;mus.connect(master);fx.connect(master);master.connect(limiter);limiter.connect(ctx.destination);ctx.onstatechange=()=>dispatchEvent(new Event('audiostate'));apply()};if(ctx.state==='suspended')ctx.resume();if(!timer)timer=setInterval(music,50);return true}catch(_){return false}}
  function apply(){if(!ctx)return;master.gain.setTargetAtTime(config.volume/100*1.6,ctx.currentTime,.04);mus.gain.setTargetAtTime(config.music&&!paused?.95:0,ctx.currentTime,.04);fx.gain.setTargetAtTime(config.fx?1:0,ctx.currentTime,.02)}
  function tone(freq,duration=.18,volume=.17,type='triangle',offset=0,end){if(!ctx)return;const t=ctx.currentTime+offset,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(fx);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
  /* MUSIK LATAR: lagu ceria 4 birama (C–G–Am–F) dengan drum, bas, melodi, dan akor.
     Dijadwalkan sedikit di depan waktu audio supaya ketukannya rapat. Saat gempa/waktu hampir habis: lebih cepat dan minor. */
  const LAGU={tempo:138,akor:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],bas:[65.41,98,110,87.31],
    melodi:[[4,7,12,7,4,7,12,null,16,null,14,12,7,null,4,null],[2,7,11,7,2,7,11,null,14,null,12,11,7,null,2,null],[0,4,9,4,0,4,9,null,12,null,11,9,4,null,0,null],[5,9,12,9,5,9,12,null,17,null,16,12,14,null,11,null]]};
  const GENTING={tempo:164,akor:[[9,12,16],[5,9,12],[2,5,9],[4,8,11]],bas:[110,87.31,73.42,82.41]};
  /* LAGU BAB 3 (Pengukuran): ciri khas sendiri, F mayor F–Dm–Bb–C, bunyi marimba, bas bulat, tepuk tangan, dan akor di ketukan lepas */
  const UKUR={tempo:124,ukur:true,akor:[[5,9,12],[2,5,9],[-2,2,5],[0,4,7]],bas:[87.31,73.42,58.27,65.41],
    melodi:[[12,null,9,null,5,null,9,12,14,null,12,null,9,null,null,null],[14,null,9,null,5,null,9,14,17,null,14,null,12,null,null,null],
      [10,null,14,null,17,null,14,10,12,null,10,null,5,null,null,null],[7,null,12,null,16,null,14,12,10,null,9,null,7,null,null,null]]};
  const GENTING_UKUR={tempo:150,ukur:true,genting:true,akor:[[2,5,9],[-2,2,5],[0,4,7],[4,7,11]],bas:[73.42,58.27,65.41,82.41]};
  GENTING.genting=true;
  let desis,berikut=0;
  function suara(freq,t,dur,vol,type,ke){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(ke)o.frequency.exponentialRampToValueAtTime(ke,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(mus);o.start(t);o.stop(t+dur+.03);o.onended=()=>{o.disconnect();g.disconnect()}}
  function derau(t,dur,vol,lolos){if(!desis){desis=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=desis.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=desis;f.type='highpass';f.frequency.value=lolos;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(f);f.connect(g);g.connect(mus);n.start(t,Math.random()*.5,dur+.02);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect()}}
  function ketuk(i,t,L){if(L.ukur)return ketukUkur(i,t,L);const s=i%16,bar=Math.floor(i/16)%4,putaran=Math.floor(i/64),akor=L.akor[bar],hz=n=>523.25*2**(n/12);
    if(s%4===0)suara(150,t,.2,.95,'sine',42);                                  /* kick di setiap ketukan */
    if(s===4||s===12){derau(t,.15,.42,1400);suara(190,t,.1,.25,'triangle',120)} /* snare */
    if(s%2===0)derau(t,s%4===2?.07:.03,s%4===2?.2:.09,7000);                    /* hi-hat */
    if(L===GENTING&&s%2)derau(t,.03,.1,7000);
    if(s%2===0)suara(L.bas[bar]*(s%4===2?2:1),t,.16,.34,'sawtooth');            /* bas melompat oktaf */
    if(s===0||s===6||s===10)akor.forEach(n=>suara(hz(n)/2,t,.22,.085,'triangle'));
    const n=L===GENTING?akor[[0,2,1,2][s%4]]+12:LAGU.melodi[bar][s];
    if(n!==null){suara(hz(n),t,L===GENTING?.09:.15,.15,'square');if(putaran%2&&L!==GENTING)suara(hz(n)*2,t,.12,.06,'triangle')}
    if(s===14&&bar===3&&L!==GENTING)[0,1,2].forEach(k=>derau(t+k*.036,.05,.3,2500)); /* isian drum penutup putaran */
  }
  function ketukUkur(i,t,L){const s=i%16,bar=Math.floor(i/16)%4,akor=L.akor[bar],hz=n=>523.25*2**(n/12);
    if(s===0||s===8||s===10)suara(120,t,.24,.9,'sine',45);                       /* kick: 1, 3, dan sinkop */
    if(s===4||s===12){derau(t,.09,.36,2200);derau(t+.012,.08,.22,2200)}          /* tepuk tangan */
    derau(t,.025,s%2?.05:.1,9000);                                                /* shaker */
    if(s%4===0||s===6)suara(L.bas[bar],t,.3,.42,'triangle');                       /* bas bulat */
    if(s%4===2)akor.forEach(n=>suara(hz(n),t,.12,.07,'sine'));                     /* akor di ketukan lepas */
    const n=L.genting?akor[[0,1,2,1][s%4]]+12:UKUR.melodi[bar][s];
    if(n!==null){suara(hz(n),t,L.genting?.08:.22,.2,'sine');suara(hz(n)*4,t,.05,.05,'sine')} /* marimba: nada dasar + ketukan kayu */
    if(s===14&&bar===3&&!L.genting)suara(1568,t,.08,.12,'square');
  }
  function music(){if(!ctx||ctx.state!=='running'||paused||document.hidden||!config.music)return;const uk=config.lagu==='ukur',L=urgent?(uk?GENTING_UKUR:GENTING):(uk?UKUR:LAGU),d=60/L.tempo/4;
    if(berikut<ctx.currentTime)berikut=ctx.currentTime+.06;
    while(berikut<ctx.currentTime+.22){ketuk(step++,berikut,L);berikut+=d}}
  function play(name){if(!config.fx||!start())return;if(name==='tap')tone(650,.09,.18);if(name==='place'){tone(140,.16,.38,'sine',0,60);tone(650,.13,.18,'triangle',.06)}if(name==='perfect')[523,784,1047].forEach((f,i)=>tone(f,.25,.21,'triangle',i*.07));if(name==='good')[523,659,784,1047].forEach((f,i)=>tone(f,.28,.23,'triangle',i*.08));if(name==='bad'){tone(240,.45,.24,'sawtooth',0,90)}if(name==='quake'){tone(85,.65,.32,'triangle',0,38);tone(510,.16,.15,'square',.08);tone(680,.16,.15,'square',.28)}if(name==='tick')tone(1200,.08,.19,'sine');if(name==='count')tone(700,.2,.25,'triangle');if(name==='finish')[523,523,659,784,1047,1319].forEach((f,i)=>tone(f,.5,.25,'triangle',i*.16));}
  /* Orbo: gelembung naik. Hexi: bip mesin. Nova: denting bintang. Zipp: desing cepat. */
  function voice(i){if(!config.fx||!start())return;
    if(i===0){tone(520,.13,.22,'sine',0,900);tone(880,.16,.22,'sine',.14,1400)}
    else if(i===1){tone(220,.1,.15,'square');tone(330,.1,.15,'square',.12);tone(220,.16,.15,'square',.24)}
    else if(i===2)[1047,1319,1568,2093].forEach((f,k)=>tone(f,.18,.17,'triangle',k*.07));
    else{tone(300,.22,.16,'sawtooth',0,1600);tone(1500,.14,.14,'sine',.2,650)}}
  /* Browser baru mengizinkan suara setelah layar disentuh: coba saat halaman dibuka, lalu pastikan menyala pada sentuhan pertama. */
  addEventListener('load',()=>start());for(const n of['pointerdown','keydown','touchend'])addEventListener(n,()=>{if(!ctx||ctx.state!=='running')start()},true);
  return{get running(){return !!ctx&&ctx.state==='running'},start,play,voice,configure(value){config={...config,...value};apply()},urgent(value){urgent=value},pause(value){paused=value;apply()},stop(){clearInterval(timer);timer=null;paused=true;apply()}};
})();
