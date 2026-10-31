/* PENYAJIAN DATA · Lomba Data: alur permainan (menu, pilih tokoh, persiapan, arena terbagi, juara).
   Dua game dengan pola layar, suara, dan podium yang sama seperti Lompat Tangga dan Kota Langit:
   - Detektif Data: soal diagram batang, piktogram, tabel, turus, diagram lingkaran, diagram garis, dan tabel frekuensi muncul terus (PG, PGK MCMA, PGK Kategori).
   - Koki Data    : hitung kertas pesanan, isi tabelnya, sajikan jadi pizza (diagram lingkaran) atau gelas jus (diagram batang), lalu jawab pertanyaan pelanggan.
   Setelah menjawab, kartu pembahasan memutar animasi yang sama dengan Lab (potong selisih, tumpuk jumlah, bedah ikon, ...).
   Semua tombol memakai pointer per jari, jadi empat anak bisa menekan bersamaan di TV layar sentuh. */
const LombaData=(()=>{
  const $=id=>document.getElementById(id),A=MenaraAudio,V=MenaraScene,S3=DataScene;
  const STORE='data-lomba-v1',colors=['#e8323c','#2f7bea','#1f9d55','#f08c00'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time=s=>Math.floor(Math.max(0,s)/60).toString().padStart(2,'0')+':'+Math.floor(Math.max(0,s)%60).toString().padStart(2,'0');
  const defaults={players:1,minutes:5,level:1,sajian:'campur',mode:'detektif',volume:85,music:true,fx:true,motion:true,names:['Tim Bato','Tim Piko','Tim Tabi','Tim Turi'],characters:[0,1,2,3]};
  const clamp=(v,min,max,f)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.round(Number(v)))):f;
  const bersih=(raw={})=>({...defaults,players:[1,2,4].includes(+raw.players)?+raw.players:1,minutes:clamp(raw.minutes,1,60,5),level:clamp(raw.level,1,3,1),sajian:['campur','batang','piktogram','tabel','lingkaran','garis','frekuensi'].includes(raw.sajian)?raw.sajian:'campur',
    mode:raw.mode==='koki'?'koki':'detektif',volume:clamp(raw.volume,0,100,85),music:raw.music!==false,fx:raw.fx!==false,motion:raw.motion!==false,
    names:defaults.names.map((n,i)=>String(raw.names?.[i]||n).trim().slice(0,24)||n),characters:[0,1,2,3].map((n,i)=>[0,1,2,3].includes(raw.characters?.[i])?raw.characters[i]:n)});
  let raw={};try{raw=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(_){}
  let settings=bersih(raw),screen='home',session=null,homeView=null,pickView=null,pick={i:0,sel:0},podiumViews=[],sim=0,last=performance.now(),muted=false;
  const minta=new URLSearchParams(location.search).get('mode');if(minta==='koki'||minta==='detektif')settings.mode=minta;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)settings.motion=false;
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(settings))}catch(_){}};
  const configureAudio=()=>{A.configure({...settings,lagu:'data',volume:muted?0:settings.volume});$('soundHome').textContent=muted?'Suara mati':A.running?'Suara nyala':'Ketuk layar untuk musik';$('soundHome').classList.toggle('minta',!muted&&!A.running);for(const id of['soundHome','gameSound'])$(id).setAttribute('aria-pressed',!muted);$('gameSound').setAttribute('aria-label',muted?'Nyalakan suara':'Matikan suara')};
  configureAudio();addEventListener('audiostate',configureAudio);
  const KOKI=()=>settings.mode==='koki';
  function show(id){screen=id;for(const n of['home','pick','setup','game','results'])$(n).hidden=n!==id;scrollTo(0,0)}
  function talk(p,teks,mood){p.el.querySelector('.robot-bubble').textContent=ROBOT[p.character].nama+': '+teks;if(mood)p.view.bot.aksi(mood)}
  const JUDUL={baca:'baca data',banding:'terbanyak/tersedikit',selisih:'selisih',jumlah:'jumlah',total:'jumlah semua',kali:'berapa kali',syarat:'garis batas',multi:'pilih semua (PGK)',pernyataan:'pilih semua (PGK)',kategori:'benar/salah (PGK)',hilang:'data hilang',cocok:'tabel ke diagram',
    piePersen:'persen ke banyak',pieBanyak:'banyak ke persen',pieBanding:'irisan terbesar/terkecil',pieSelisih:'selisih irisan',pieGabung:'gabungan irisan',piePecahan:'persen ke pecahan',pieHilang:'irisan hilang',pieCocok:'tabel ke diagram lingkaran',
    gBaca:'baca titik',gBanding:'titik tertinggi/terendah',gSelisih:'selisih dua titik',gJumlah:'jumlah dua titik',gNaik:'naik/turun terbesar',fSyarat:'frekuensi dengan syarat'};
  const sabar=(lv,q)=>[0,45,55,65][lv]+(['kategori','pernyataan','multi','cocok','hilang','pieCocok','pieHilang','gNaik','fSyarat'].includes(q.jenis)?15:0);
  /* fase yang punya waktu tunggu per pemain */
  const BERWAKTU=['tanya','hitung','saji'],berwaktu=p=>BERWAKTU.includes(p.phase);
  /* ketuk per jari: pointerdown dan pointerup pada tombol yang sama; klik dari papan ketik tetap jalan */
  function ketuk(root,fn){const tekan=new Map();
    root.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b&&root.contains(b))tekan.set(e.pointerId,b)});
    root.addEventListener('pointerup',e=>{const b=tekan.get(e.pointerId);tekan.delete(e.pointerId);if(b&&e.target.closest('button')===b&&!b.disabled){b._ketuk=performance.now();fn(b)}});
    root.addEventListener('pointercancel',e=>tekan.delete(e.pointerId));
    root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b)||(b._ketuk&&performance.now()-b._ketuk<800))return;fn(b)})}
  function tampilMode(){const m=KOKI();document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.game===settings.mode));
    $('homeTitle').innerHTML=m?'Koki <span>Data</span>':'Detektif <span>Data</span>';
    $('homeSub').textContent=m?'Catat pesanan, isi tabel, sajikan jadi pizza diagram lingkaran atau gelas jus diagram batang':'Baca diagram batang, lingkaran, garis, piktogram, dan tabel lebih cepat dari temanmu';
    $('homeRules').textContent=m?'Tabel tepat, sajian tepat, dan jawaban benar masing-masing 1 poin.':'Soal muncul terus sampai waktu habis. Jawaban benar terbanyak menang.'}

  /* ---------- pilih tokoh & persiapan ---------- */
  ROBOT.forEach((d,j)=>{const b=document.createElement('button');b.type='button';b.className='chunky ccard';b.innerHTML=`<span class="sw" style="background:${d.warna}"></span><b>${d.nama}</b><small>${d.julukan}</small><span class="tk"></span>`;b.addEventListener('click',()=>choose(j));$('pickCards').appendChild(b)});
  function choose(j){pick.sel=j;A.start();A.voice(j);pickView?.bots[j].aksi('sapa');renderPick()}
  function renderPick(){const h=$('pickHead');h.className='sel-head p'+(pick.i+1);h.innerHTML=`<span class="pl">Pemain ${pick.i+1}</span>, pilih tokohmu!`;
    [...$('pickCards').children].forEach((c,j)=>{c.setAttribute('aria-pressed',j===pick.sel);c.querySelector('.tk').innerHTML=settings.characters.slice(0,pick.i).map((ci,k)=>ci===j?`<span class="tag t${k}">P${k+1}</span>`:'').join('')});
    $('pickTalk').textContent=ROBOT[pick.sel].nama+': “'+ROBOT[pick.sel].kata+'”';if(pickView)pickView.selected=pick.sel}
  function openPick(n){settings.players=n;pick={i:0,sel:settings.characters[0]};show('pick');renderPick()}
  function confirmPick(){settings.characters[pick.i]=pick.sel;if(/^Tim (Bato|Piko|Tabi|Turi)$/.test(settings.names[pick.i]))settings.names[pick.i]='Tim '+ROBOT[pick.sel].nama;A.play('good');
    if(pick.i<settings.players-1){pick.i++;const dipakai=new Set(settings.characters.slice(0,pick.i));let n=settings.characters[pick.i];for(let k=0;k<4&&dipakai.has(n);k++)n=(n+1)%4;pick.sel=n;renderPick()}else{save();setup(settings.players)}}
  function backPick(){A.play('tap');if(pick.i>0){pick.i--;pick.sel=settings.characters[pick.i];renderPick()}else show('home')}
  function caraMain(){const m=$('mode').value==='koki';$('fieldSajian').hidden=m;
    $('caraMain').innerHTML=m?'<b>Cara main:</b> 1) hitung kertas pesanan dan isi <b>tabel</b>; 2) sajikan: warnai <b>potong pizza</b> sesuai tabel (diagram lingkaran) atau seret <b>gelas jus</b> (diagram batang); 3) jawab pertanyaan pelanggan. Tiap langkah yang tepat dapat 1 poin.'
      :'<b>Cara main:</b> baca sajian datanya, lalu pilih jawaban. Soal PGK punya tombol <b>Kunci jawaban</b>. Setelah menjawab, lihat animasi pembahasannya: batang dipotong, ditumpuk, atau ikon dibedah. Lupa caranya? Ketuk <b>Petunjuk</b>.'}
  function setup(n){settings.players=n;show('setup');$('modeBadge').textContent=n+' pemain';$('teamFields').innerHTML='';
    for(let i=0;i<n;i++){const row=document.createElement('div');row.className='team-field';row.style.setProperty('--player',colors[i]);row.innerHTML=`<span class="player-number">P${i+1}</span><input maxlength="24" aria-label="Nama kelompok pemain ${i+1}" autocomplete="off"><span class="robot-tag"><i style="background:${ROBOT[settings.characters[i]].warna}"></i>${ROBOT[settings.characters[i]].nama}</span>`;row.querySelector('input').value=settings.names[i];$('teamFields').appendChild(row)}
    $('sessionMinutes').value=settings.minutes;$('level').value=settings.level;$('sajian').value=settings.sajian;$('mode').value=settings.mode;for(const id of['level','sajian','mode'])$(id).dispatchEvent(new Event('change'));$('volume').value=settings.volume;$('volumeValue').textContent=settings.volume+'%';$('musicEnabled').checked=settings.music;$('fxEnabled').checked=settings.fx;$('motionEnabled').checked=settings.motion;caraMain()}
  function readSettings(){const teams=[...$('teamFields').children];settings=bersih({...settings,minutes:$('sessionMinutes').value,level:$('level').value,sajian:$('sajian').value,mode:$('mode').value,volume:$('volume').value,music:$('musicEnabled').checked,fx:$('fxEnabled').checked,motion:$('motionEnabled').checked,names:settings.names.map((n,i)=>teams[i]?.querySelector('input').value||n)});save();configureAudio();tampilMode()}

  /* ---------- arena ---------- */
  function buildPlayer(i,seed){
    /* tiap pemain punya deretan soal sendiri (benih berbeda), dan daftar soal terpakai dibagi bersama: tidak ada soal kembar di layar */
    const benih=seed+i*7717,dek=DT.dek((n,c)=>DT.soal(benih,n,settings.level,settings.sajian,c),session.dipakai);
    const p={i,name:settings.names[i],character:settings.characters[i],seed:benih,dek,urut:0,ronde:0,benar:0,salah:0,habis:0,diagram:0,beruntun:0,terbaik:0,phase:'tanya',pilih:null,sisa:0,total:1,jeda:null,tick:-1,riwayat:[],anim:null};
    const el=document.createElement('article');p.el=el;el.className='arena';el.style.setProperty('--player',colors[i]);el.setAttribute('aria-label','Arena '+p.name);
    el.innerHTML=`<header class="arena-head"><div class="who"><span class="player-number">P${i+1}</span><span><b>${escape(p.name)}</b><small>${ROBOT[p.character].nama}, ${ROBOT[p.character].julukan.toLowerCase()}</small></span></div><div class="tower-score"><b>0</b><small>${KOKI()?'poin':'soal benar'}</small></div></header>
      <div class="arena-body"><div class="tower-view scene-slot"><div class="pesanan-tag papan-nilai"></div><div class="clue-pop" hidden></div><div class="robot-bubble"></div></div><section class="question-card kado-card data-card" aria-label="Soal pemain ${i+1}"></section></div>
      <footer class="build-footer"><span class="drag-instruction">Beruntun: <b class="runtun">0</b></span><span class="drag-instruction">${KOKI()?'Langkah tepat: <b class="nomor">0</b>':'Soal ke-<b class="nomor">1</b>'}</span></footer>`;
    $('arenas').appendChild(el);p.view=S3.create(el.querySelector('.tower-view'),p.character,colors[i]);
    ketuk(el.querySelector('.data-card'),b=>{if(session?.status!=='play')return;const d=b.dataset;
      if(d.clue!==undefined)petunjuk(p);else if(d.opsi!==undefined)pilihOpsi(p,+d.opsi);else if(d.pernyataan!==undefined)pilihPernyataan(p,+d.pernyataan,d.nilai==='true');
      else if(d.kunci!==undefined)kirim(p);else if(d.cek!==undefined)cekKoki(p);else if(d.tiket!==undefined)coret(p,+d.tiket,b);else if(d.tambah!==undefined)tambah(p,+d.tambah,+d.arah);else if(d.topping!==undefined)pilihTopping(p,+d.topping);else if(d.lanjut!==undefined&&p.phase==='hasil')berikut(p)});
    KOKI()?mulaiKoki(p,true):mulaiSoal(p,true);return p}
  function papanNilai(p,isi,kecil){p.el.querySelector('.papan-nilai').innerHTML=`<small>${kecil}</small>${isi}`}
  function skor(p){p.el.querySelector('.tower-score>b').textContent=KOKI()?p.benar+p.diagram:p.benar;p.el.querySelector('.runtun').textContent=p.beruntun;p.el.querySelector('.nomor').textContent=KOKI()?p.diagram:p.urut+1}
  const isi=o=>o.startsWith('<svg')?o:escape(o);
  function opsiMarkup(q){
    if(q.tipe==='kategori')return`<div class="pernyataan-list">${q.pernyataan.map((s,i)=>`<div class="statement"><span>${i+1}. ${escape(s.teks)}</span><button type="button" data-pernyataan="${i}" data-nilai="true" aria-pressed="false">Benar</button><button type="button" data-pernyataan="${i}" data-nilai="false" aria-pressed="false">Salah</button></div>`).join('')}</div>`;
    return`<div class="question-options${q.opsi[0].startsWith('<svg')?' opsi-gambar':''}${q.tipe==='multi'&&q.opsi.some(o=>o.length>34)?' opsi-panjang':''}">${q.opsi.map((v,j)=>`<button type="button" class="answer-option" data-opsi="${j}" ${q.tipe==='multi'?'aria-pressed="false"':''}><b>${'ABCD'[j]}</b><span>${isi(v)}</span></button>`).join('')}</div>`}
  function kartu(p){const q=p.q,card=p.el.querySelector('.data-card');card.classList.remove('bahas','bad','koki');
    card.innerHTML=`<div class="question-head"><span class="quake-label">${DT.besar(DT.NAMA_SAJIAN[q.sajian])}: ${JUDUL[q.jenis]||'soal'}</span><button type="button" class="clue-btn" data-clue aria-expanded="false"><i>?</i>Petunjuk</button><b class="question-timer">${Math.ceil(p.sisa)}</b></div><div class="question-track"><i></i></div>
      <div class="data-soal tipe-${q.tipe}"><div class="data-gambar">${q.gambar}</div><div class="data-kanan"><p class="question-text">${escape(q.teks)}</p>${opsiMarkup(q)}${q.tipe!=='pg'?'<button type="button" class="submit-answer" data-kunci disabled>Kunci jawaban</button>':''}</div></div>`;
    tutupPetunjuk(p)}
  /* petunjuk: cara membaca sajian ini, hanya muncul kalau diketuk */
  function petunjuk(p){const pop=p.el.querySelector('.clue-pop');if(!pop.hidden)return tutupPetunjuk(p);const q=p.q||{sajian:'batang',ingat:DT.INGAT.batang,data:p.data};A.play('tap');
    const d=q.data,skala=q.sajian==='batang'?`Skala sumbu: tiap garis = ${DT.angka(d.step)} ${d.satuan}.`:q.sajian==='piktogram'?`Keterangan: 1 ikon = ${DT.angka(d.unit)} ${d.satuan}, setengah ikon = ${DT.angka(d.unit/2)}.`:q.sajian==='turus'?'4 garis tegak + 1 garis miring = 5. Setiap garis = 1.':q.sajian==='lingkaran'?(d.total?`Jumlah seluruhnya ${DT.angka(d.total)} ${d.satuan}. 10% = ${DT.angka(d.total/10)}, 50% = ${DT.angka(d.total/2)}.`:'Seluruh lingkaran = 100%.'):q.sajian==='garis'?`Skala sumbu: tiap garis = ${DT.angka(d.step)} ${d.satuan}. Garis naik = bertambah.`:q.sajian==='frekuensi'?'Kolom frekuensi = banyak data untuk nilai itu.':'Baris = kategori, kolom = banyaknya.';
    pop.innerHTML=`<b>Petunjuk ${DT.NAMA_SAJIAN[q.sajian]}</b><span class="rumus">${escape(q.ingat.kode)}</span><small>${escape(q.ingat.kalimat)}</small><small><b>${escape(skala)}</b></small><small>${q.sajian==='lingkaran'?'Banyak = persen × jumlah seluruhnya. Persen = banyak : jumlah × 100%.':'Selisih = besar − kecil. Jumlah = tumpuk semuanya.'}</small>`;pop.hidden=false;p.el.querySelector('[data-clue]')?.setAttribute('aria-expanded','true');p.view.bot.aksi('petunjuk')}
  function tutupPetunjuk(p){p.el.querySelector('.clue-pop').hidden=true;p.el.querySelector('[data-clue]')?.setAttribute('aria-expanded','false')}
  function hentikanAnim(p){p.anim?.stop();p.anim=null}
  function mulaiSoal(p,awal=false,q){hentikanAnim(p);
    p.q=q||p.dek.ambil(p.urut);p.phase='tanya';p.pilih=p.q.tipe==='pg'?null:p.q.benar.map(()=>p.q.tipe==='multi'?false:null);p.sisa=sabar(settings.level,p.q);p.total=p.sisa;p.tick=-1;p.jeda=null;
    S3.setData(p.view,p.q.data.nilai.map((v,i)=>i===p.q.tanpa?0:v),p.q.data.ytop);
    papanNilai(p,escape(p.q.data.judul),KOKI()?'Pertanyaan pelanggan':`Soal ${p.urut+1}`);kartu(p);skor(p);
    talk(p,awal?'Ayo mulai! Ketuk Petunjuk kalau lupa caranya.':pilihKata(p.q),'sapa')}
  const pilihKata=q=>({batang:'Lihat ujung batangnya, lalu tarik garis ke sumbu.',piktogram:'Cek keterangan ikonnya dulu!',tabel:'Cari barisnya dengan teliti.',turus:'Hitung per lima, ya!',lingkaran:'Satu lingkaran penuh = 100%!',garis:'Ikuti titiknya, lalu tarik garis ke sumbu.',frekuensi:'Frekuensi = berapa kali muncul.'})[q.sajian];
  function renderPilihan(p){const card=p.el.querySelector('.data-card'),q=p.q;
    card.querySelectorAll('[data-opsi]').forEach(b=>{if(q.tipe==='multi')b.setAttribute('aria-pressed',p.pilih[+b.dataset.opsi])});
    card.querySelectorAll('[data-pernyataan]').forEach(b=>b.setAttribute('aria-pressed',p.pilih[+b.dataset.pernyataan]===(b.dataset.nilai==='true')));
    const k=card.querySelector('[data-kunci]');if(k)k.disabled=q.tipe==='multi'?!p.pilih.some(Boolean):p.pilih.some(v=>v===null)}
  function pilihOpsi(p,j){if(p.phase!=='tanya')return;if(p.q.tipe==='pg')return jawab(p,j);p.pilih[j]=!p.pilih[j];A.play('tap');renderPilihan(p)}
  function pilihPernyataan(p,i,v){if(p.phase!=='tanya'||p.q.tipe!=='kategori')return;p.pilih[i]=v;A.play('tap');renderPilihan(p)}
  function kirim(p){if(p.phase!=='tanya'||p.q.tipe==='pg')return;const card=p.el.querySelector('[data-kunci]');if(card?.disabled)return;jawab(p,p.pilih.slice())}
  function jawab(p,j,habis=false){if(p.phase!=='tanya')return;const q=p.q,ok=!habis&&DT.cek(q,j);p.pilih=j;p.phase='hasil';tutupPetunjuk(p);
    if(ok){p.benar++;p.beruntun++;p.terbaik=Math.max(p.terbaik,p.beruntun)}else{p.beruntun=0;if(habis)p.habis++;else p.salah++}
    p.riwayat.push({q,ok,habis,pilih:habis&&q.tipe==='pg'?null:j});
    A.play(ok?'perfect':habis?'quake':'bad');skor(p);
    talk(p,ok?(p.beruntun>=3?`${p.beruntun} kali beruntun! Detektif hebat!`:'Tepat! Lihat cara membuktikannya.'):habis?'Waktunya habis. Lihat pembahasannya ya!':'Belum tepat. Perhatikan animasinya!',ok?'senang':'bingung');
    const card=p.el.querySelector('.data-card');card.classList.add('bahas');card.classList.toggle('bad',!ok);
    card.innerHTML=`<div class="bahas-hasil"><b>${ok?'Benar!':habis?'Waktu habis':'Belum tepat'}</b><span>Jawaban: ${escape(DT.jawabanTeks(q))}</span></div>
      <div class="data-bahas"><div class="data-anim"></div><div class="bahas-kunci">${kunciMarkup(q,habis?null:j)}<ol class="langkah-data">${q.kunci.map(k=>`<li>${escape(k)}</li>`).join('')}</ol></div></div>
      <p class="kado-ingat">Ingat: <b>${escape(q.ingat.kalimat)}</b></p><button type="button" class="primary-btn next-block" data-lanjut>${KOKI()?'Pesanan berikutnya':'Soal berikutnya'} <span class="hitung"></span></button>`;
    p.anim=DA.jelaskan(card.querySelector('.data-anim'),q,{cepat:!settings.motion,selesai:()=>{if(p.phase==='hasil')p.jeda=6}});
    /* kalau animasinya panjang, tetap lanjut setelah 40 detik */
    p.batasBaca=40}
  /* kunci jawaban yang mudah dibaca: pilihan benar ditulis lengkap, pilihan siswa ditandai */
  function kunciMarkup(q,j){
    if(q.tipe==='pg')return`<div class="kunci-baris ok"><b>Kunci ${'ABCD'[q.benar]}</b><span>${isi(q.opsi[q.benar])}</span></div>`+(typeof j==='number'&&j!==q.benar?`<div class="kunci-baris no"><b>Pilihanmu ${'ABCD'[j]}</b><span>${isi(q.opsi[j])}</span></div>`:'');
    if(q.tipe==='kategori')return q.pernyataan.map((s,i)=>{const pil=j?.[i],tepat=pil===s.benar;return`<div class="kunci-baris ${tepat?'ok':'no'}"><b>${s.benar?'Benar':'Salah'}</b><span>${i+1}. ${escape(s.teks)}${pil===null||pil===undefined||tepat?'':' (jawabanmu: '+(pil?'Benar':'Salah')+')'}</span></div>`}).join('');
    return q.opsi.map((o,i)=>q.benar[i]?`<div class="kunci-baris ${j?.[i]?'ok':'no'}"><b>Pilih ${'ABCD'[i]}</b><span>${isi(o)}</span></div>`:j?.[i]?`<div class="kunci-baris no"><b>Bukan ${'ABCD'[i]}</b><span>${isi(o)}</span></div>`:'').join('')}
  function berikut(p){if(p.phase!=='hasil')return;hentikanAnim(p);p.urut++;if(KOKI()){p.ronde++;mulaiKoki(p)}else mulaiSoal(p)}

  /* ---------- Koki Data: kertas pesanan → tabel → pizza (diagram lingkaran) atau gelas jus (diagram batang) → pertanyaan pelanggan ---------- */
  const WAKTU_KOKI={hitung:[0,60,70,80],saji:[0,70,80,90]};
  const kepalaKoki=(p,judul)=>`<div class="question-head"><span class="quake-label">${judul}</span><button type="button" class="clue-btn" data-clue aria-expanded="false"><i>?</i>Petunjuk</button><b class="question-timer">${Math.ceil(p.sisa)}</b></div><div class="question-track"><i></i></div>`;
  function fase(p,nama){p.phase=nama;p.coba=0;p.sisa=WAKTU_KOKI[nama][settings.level];p.total=p.sisa;p.tick=-1;p.jeda=null}
  function mulaiKoki(p,awal=false){hentikanAnim(p);const d=DT.dataPesanan(p.seed,p.ronde,settings.level);p.data=d;p.q=null;p.tabel=d.label.map(()=>0);p.coret=new Set();p.pizza=null;p.editor=null;fase(p,'hitung');
    const card=p.el.querySelector('.data-card');card.classList.remove('bahas','bad');card.classList.add('koki');
    card.innerHTML=kepalaKoki(p,`1 · Catat pesanan ${d.buat==='lingkaran'?'pizza':'jus'}`)+`<div class="koki-isi"><div class="koki-tiket">${d.pesanan.map((i,k)=>`<button type="button" class="tiket" data-tiket="${k}" aria-pressed="false" aria-label="Pesanan ${k+1}: ${escape(d.label[i])}"><span>${d.ikonItem[i]}</span><small>${escape(d.label[i])}</small></button>`).join('')}</div>
      <div class="koki-kanan"><p class="question-text">Ada <b>${d.pesanan.length} pesanan</b>. Hitung, lalu isi tabelnya. Ketuk kertas untuk mencoretnya.</p><div class="koki-tabel">${d.label.map((l,i)=>`<div class="koki-baris" data-baris="${i}"><span>${d.ikonItem[i]} ${escape(l)}</span><button type="button" class="small-btn" data-tambah="${i}" data-arah="-1" aria-label="Kurangi ${escape(l)}">−</button><b>0</b><button type="button" class="small-btn" data-tambah="${i}" data-arah="1" aria-label="Tambah ${escape(l)}">+</button></div>`).join('')}</div><button type="button" class="submit-answer" data-cek>Cek tabel</button></div></div>`;
    S3.setData(p.view,p.tabel,d.ytop);papanNilai(p,escape(d.judul),`Pesanan ke-${p.ronde+1}`);skor(p);
    talk(p,awal?'Pelanggan datang! Hitung pesanannya, lalu isi tabel.':'Pesanan baru! Hitung dengan teliti, ya.','sapa')}
  function tambah(p,i,arah){if(p.phase!=='hitung')return;p.tabel[i]=Math.max(0,Math.min(p.data.pesanan.length,p.tabel[i]+arah));A.play('tick');
    const r=p.el.querySelector(`[data-baris="${i}"]`);r.querySelector('b').textContent=p.tabel[i];r.classList.remove('salah','benar');S3.setData(p.view,p.tabel,p.data.ytop)}
  function coret(p,k,b){if(p.phase!=='hitung')return;p.coret.has(k)?p.coret.delete(k):p.coret.add(k);b.setAttribute('aria-pressed',p.coret.has(k));A.play('tap')}
  function pilihTopping(p,i){if(p.phase!=='saji'||!p.pizza)return;p.pizza.pakai(i);A.play('tap');p.el.querySelectorAll('.koki-topping').forEach((b,k)=>b.setAttribute('aria-pressed',k===i))}
  /* jeda singkat lalu lanjut, kecuali sesinya sudah selesai atau diganti */
  function jeda(p,lanjut,ms){p.phase='jeda';setTimeout(()=>{if(session?.status!=='done'&&session.players.includes(p)&&p.phase==='jeda')lanjut()},ms)}
  function gagal(p,pesan,menyerah){p.coba++;A.play('bad');if(p.coba>=3){p.beruntun=0;skor(p);talk(p,pesan+' Lihat yang benar, ya.','bingung');menyerah()}else talk(p,pesan+' Coba lagi!','bingung')}
  function cekKoki(p){const d=p.data;
    if(p.phase==='hitung'){const tepat=d.nilai.map((v,i)=>p.tabel[i]===v);
      p.el.querySelectorAll('.koki-baris').forEach((r,i)=>{r.classList.toggle('salah',!tepat[i]);r.classList.toggle('benar',tepat[i])});
      if(tepat.every(Boolean)){p.diagram++;A.play('perfect');skor(p);talk(p,'Tabelnya tepat! Sekarang sajikan datanya.','senang');jeda(p,()=>mulaiSaji(p),1100)}
      else gagal(p,`Baris ${d.label.filter((_,i)=>!tepat[i]).join(', ')} belum tepat.`,()=>{tunjukTabel(p);jeda(p,()=>mulaiSaji(p),2400)})}
    else if(p.phase==='saji'){const pie=d.buat==='lingkaran',v=pie?p.pizza.hitung():p.editor.nilai(),tepat=d.nilai.map((x,i)=>v[i]===x),kosong=pie&&p.pizza.isi().some(x=>x<0);
      if(pie)p.el.querySelectorAll('.koki-topping').forEach((b,i)=>b.classList.toggle('salah',!tepat[i]));else p.editor.tandai(tepat);
      if(tepat.every(Boolean)&&!kosong){p.diagram++;A.play('perfect');skor(p);
        if(pie){p.pizza.rapikan(d.nilai);p.pizza.kunci();talk(p,'Potong yang sama dijajarkan: pizzamu jadi diagram lingkaran!','senang')}else{p.editor.kunci();talk(p,'Gelas jusmu jadi diagram batang yang tepat!','senang')}
        jeda(p,()=>laporan(p),1800)}
      else gagal(p,kosong?'Masih ada potong pizza yang kosong.':`${d.label.filter((_,i)=>!tepat[i]).join(', ')} belum sama dengan tabel.`,()=>{tunjukSaji(p);jeda(p,()=>laporan(p),2800)})}}
  function tunjukTabel(p){p.tabel=p.data.nilai.slice();p.el.querySelectorAll('.koki-baris').forEach((r,i)=>{r.querySelector('b').textContent=p.tabel[i];r.classList.remove('salah');r.classList.add('benar')});S3.setData(p.view,p.tabel,p.data.ytop)}
  function tunjukSaji(p){const d=p.data;if(p.pizza){p.pizza.rapikan(d.nilai);p.pizza.kunci()}else if(p.editor){p.editor.kunci();p.editor.bayangan(d.nilai)}S3.setData(p.view,d.nilai,d.ytop)}
  function mulaiSaji(p){const d=p.data,pie=d.buat==='lingkaran',card=p.el.querySelector('.data-card');fase(p,'saji');
    /* pizza: baris tabel sekaligus tombol topping (angka kanan = potong terwarnai / pesanan) */
    const jml=`<div class="koki-baris jumlah"><span>Jumlah</span><b>${DT.jumlah(d.nilai)}</b></div>`,tabel=pie?`<div class="koki-palet">${d.label.map((l,i)=>`<button type="button" class="koki-topping" data-topping="${i}" style="--w:${DT.WARNA[i%6]}" aria-pressed="${i===0}" aria-label="Pilih topping ${escape(l)}, pesanan ${d.nilai[i]}"><span>${d.ikonItem[i]}</span>${escape(l)} <i>0/${d.nilai[i]}</i></button>`).join('')}${jml}</div>`
      :`<div class="koki-tabel baca">${d.label.map((l,i)=>`<div class="koki-baris"><span>${d.ikonItem[i]} ${escape(l)}</span><b>${d.nilai[i]}</b></div>`).join('')}${jml}</div>`;
    card.innerHTML=kepalaKoki(p,pie?'2 · Buat pizza diagram lingkaran':'2 · Isi gelas jadi diagram batang')+`<div class="koki-isi saji"><div class="koki-kiri">${pie?'<div class="koki-pizza"></div>':'<div class="data-editor"></div>'}</div>
      <div class="koki-kanan"><p class="question-text">${pie?`Pizza ${d.total} potong: <b>1 potong = 1 pesanan</b>. Pilih topping, lalu ketuk atau seret potongnya.`:'Seret tiap gelas sampai tingginya sama dengan tabel.'}</p>${tabel}<button type="button" class="submit-answer" data-cek>${pie?'Cek pizza':'Cek diagram'}</button></div></div>`;
    if(pie)p.pizza=DA.pizza(card.querySelector('.koki-pizza'),{n:d.total,label:d.label,ikon:d.ikonItem,ubah:h=>{card.querySelectorAll('.koki-topping').forEach((b,i)=>{b.querySelector('i').textContent=`${h[i]}/${d.nilai[i]}`;b.classList.remove('salah')});S3.setData(p.view,h,d.ytop);A.play('place')}});
    else p.editor=DA.editor(card.querySelector('.data-editor'),d,{snap:1,tanpaJudul:true,ubah:v=>S3.setData(p.view,v,d.ytop)});
    S3.setData(p.view,d.nilai.map(()=>0),d.ytop);talk(p,pie?'Warnai potong pizzanya sesuai tabel!':'Seret gelasnya sampai pas dengan tabel!','sapa')}
  function laporan(p){const d=p.data;mulaiSoal(p,false,DT.soalData(p.seed,p.ronde,settings.level,d,d.buat,DT.cariK(d.k)));talk(p,'Pelanggan bertanya tentang datamu. Jawab, ya!','sapa')}
  function habisKoki(p){A.play('quake');p.beruntun=0;skor(p);
    if(p.phase==='hitung'){talk(p,'Waktunya habis. Ini tabel yang benar.','bingung');tunjukTabel(p);jeda(p,()=>mulaiSaji(p),2400)}
    else{talk(p,'Waktunya habis. Lihat susunan yang benar.','bingung');tunjukSaji(p);jeda(p,()=>laporan(p),2800)}}

  /* ---------- sesi ---------- */
  function clearViews(){podiumViews.forEach(V.dispose);podiumViews=[]}
  function start(){if(!V.ready)return;clearViews();$('pause').hidden=true;show('game');$('arenas').innerHTML='';$('arenas').className='arenas mode-'+settings.players+(KOKI()?' koki-data':'');
    const seed=Math.floor(Math.random()*0x7fffffff);session={status:'countdown',beforePause:'play',remaining:settings.minutes*60,total:settings.minutes*60,countdown:3.2,lastCount:-1,players:[],seed,dipakai:new Set()};
    $('countdownTip').textContent=KOKI()?'Hitung kertas pesanan dengan teliti. Coret yang sudah dihitung.':'Baca judul, keterangan, dan skalanya dulu.';
    for(let i=0;i<settings.players;i++)session.players.push(buildPlayer(i,seed));
    $('countdown').hidden=false;$('countdownNumber').textContent='3';A.pause(false);A.urgent(false);A.start();updateTime()}
  function updateTime(){$('sessionClock').textContent=time(Math.ceil(session.remaining));$('sessionProgress').style.width=100*session.remaining/session.total+'%';$('sessionClock').parentElement.classList.toggle('urgent',session.remaining<=30)}
  function pause(){if(!session||!['play','countdown'].includes(session.status))return;session.beforePause=session.status;session.status='paused';$('pause').hidden=false;A.pause(true);$('resumeGame').focus()}
  function resume(){if(session?.status!=='paused')return;session.status=session.beforePause;$('pause').hidden=true;A.pause(false);A.start()}
  const poin=p=>KOKI()?p.benar+p.diagram:p.benar;
  const rank=ps=>ps.slice().sort((a,b)=>poin(b)-poin(a)||b.diagram-a.diagram||b.terbaik-a.terbaik||(a.salah+a.habis)-(b.salah+b.habis)||a.i-b.i);
  function finish(){if(!session||session.status==='done')return;session.status='done';session.players.forEach(hentikanAnim);$('pause').hidden=true;$('countdown').hidden=true;show('results');A.urgent(false);A.pause(false);A.play('finish');
    const ranking=rank(session.players),m=KOKI();$('resultTitle').textContent=m?'Juara Koki Data!':'Juara Detektif Data!';
    $('resultSubtitle').textContent=m?`${ranking[0].name} mengumpulkan ${poin(ranking[0])} poin (${ranking[0].diagram} langkah tepat)!`:`${ranking[0].name} menjawab ${ranking[0].benar} soal dengan benar!`;
    $('rankHint').textContent=m?'Urutan juara: poin (tabel tepat + sajian tepat + jawaban benar), lalu langkah tepat, lalu beruntun terbaik.':'Urutan juara: jawaban benar, lalu beruntun terbaik, lalu paling sedikit salah.';
    podiumViews=[V.podium($('podium'),ranking.map(p=>({character:p.character,color:colors[p.i],name:p.name,meter:m?poin(p)+' poin':p.benar+' soal benar'})))];
    $('podium').setAttribute('aria-label','Panggung juara: '+ranking.map((p,i)=>'juara '+(i+1)+' '+p.name).join(', '));
    $('resultTable').innerHTML=ranking.map((p,i)=>`<div class="result-row"><b>${i+1}</b><b>${escape(p.name)}</b>${m?`<span><b>${p.diagram}</b><small>Langkah tepat</small></span>`:''}<span><b>${p.benar}</b><small>Benar</small></span><span><b>${p.terbaik}</b><small>Beruntun terbaik</small></span><span><b>${p.salah+p.habis}</b><small>Salah / habis waktu</small></span></div>`).join('')}

  /* ---------- soal & pembahasan (dilihat di layar atau diunduh) ---------- */
  function jawabanSiswa(h){const q=h.q,j=h.pilih;if(j===null||j===undefined)return'belum dijawab';
    if(q.tipe==='pg')return'ABCD'[j]+(q.opsi[j].startsWith('<svg')?'':'. '+escape(q.opsi[j]));if(q.tipe==='multi')return q.opsi.filter((_,i)=>j[i]).map(escape).join('; ')||'tidak memilih';
    return j.map((v,i)=>`${i+1}. ${v===null?'-':v?'Benar':'Salah'}`).join(', ')}
  function reviewMarkup(){return session.players.map(p=>`<h2>${escape(p.name)}</h2><p class="ringkas">${p.benar} benar dari ${p.riwayat.length} soal${KOKI()?`, ${p.diagram} langkah tepat`:''}, beruntun terbaik ${p.terbaik}.</p>${p.riwayat.length?p.riwayat.map((h,i)=>{const q=h.q;
    const pilihan=q.tipe==='kategori'?`<ol>${q.pernyataan.map(s=>`<li>${escape(s.teks)}</li>`).join('')}</ol>`:`<p>Pilihan: ${q.opsi.map((o,j)=>'ABCD'[j]+'. '+(o.startsWith('<svg')?'(diagram)':escape(o))).join(', ')}</p>${q.opsi[0].startsWith('<svg')?`<div class="opsi-cetak">${q.opsi.map((o,j)=>`<figure><figcaption>${'ABCD'[j]}</figcaption>${o}</figure>`).join('')}</div>`:''}`;
    return`<article class="review-item"><small>Soal ${i+1}: ${DT.NAMA_SAJIAN[q.sajian]}, ${JUDUL[q.jenis]||'soal'}. <span class="${h.ok?'ok':'no'}">${h.ok?'Benar':h.habis?'Waktu habis':'Belum tepat'}</span></small>
      <h3>${escape(q.teks)}</h3>${q.gambar}${pilihan}
      <p>Jawabanmu: <b class="${h.ok?'ok':'no'}">${jawabanSiswa(h)}</b>. Kunci: <b>${escape(DT.jawabanTeks(q))}</b></p>
      <div class="explanation"><ol>${q.kunci.map(k=>'<li>'+escape(k)+'</li>').join('')}</ol>Ingat: ${escape(q.ingat.kalimat)}</div></article>`}).join(''):'<p>Belum ada soal yang dijawab.</p>'}`).join('')}
  function download(){const judul=KOKI()?'Koki Data':'Detektif Data',html=`<!doctype html><html lang="id"><meta charset="utf-8"><title>Pembahasan ${judul}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@600;700;800&display=swap"><style>body{font:16px/1.55 Nunito,system-ui,sans-serif;max-width:860px;margin:32px auto;padding:0 20px;color:#1e2a4a}h1,h2{font-family:'Baloo 2',sans-serif;line-height:1.1}h1{font-size:30px;margin:0}h2{font-size:24px;margin:28px 0 6px;border-bottom:3px solid #1e2a4a;padding-bottom:4px}.sub{color:#5b6b85;margin:4px 0 0}.ringkas{color:#5b6b85}.review-item{border:2px solid #d5deea;border-radius:14px;padding:12px 16px;margin:12px 0;break-inside:avoid}.review-item h3{font-size:17px;margin:4px 0}.review-item small{color:#5b6b85;font-weight:800}.review-item svg{display:block;max-width:420px;max-height:260px;margin:6px 0}.opsi-cetak{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.opsi-cetak figure{margin:0}.opsi-cetak svg{max-width:100%}.explanation{background:#edf7e7;border-radius:10px;padding:8px 12px;margin-top:6px}.explanation ol{margin:0;padding-left:20px}.ok{color:#1f9d55}.no{color:#c62828}@media print{body{margin:0}}</style><h1>Soal dan Pembahasan: ${judul}</h1><p class="sub">Penyajian data: diagram batang, diagram lingkaran, diagram garis, piktogram, tabel, tabel frekuensi, dan turus. ${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}, ${settings.minutes} menit.</p>${reviewMarkup()}</html>`;
    const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=judul.replace(' ','-')+'-Soal-dan-Pembahasan.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

  function loop(now){const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,.06);last=now;
    if(session?.status!=='paused')sim+=dt;V.frame();
    if(screen==='home'&&V.ready){if(!homeView)homeView=S3.home($('homeStage'));S3.updateHome(homeView,sim,settings.motion);V.render(homeView)}
    if(screen==='pick'&&V.ready){if(!pickView){pickView=V.create($('pickStage'),0,'pick');pickView.selected=pick.sel}V.update(pickView,null,sim,dt,settings.motion);V.render(pickView)}
    if(screen==='game'&&session){
      if(session.status==='countdown'){session.countdown-=elapsed;const n=Math.ceil(session.countdown);if(n!==session.lastCount){session.lastCount=n;$('countdownNumber').textContent=n>0?Math.min(3,n):'Mulai!';A.play('count')}if(session.countdown<=0){session.status='play';$('countdown').hidden=true}}
      else if(session.status==='play'){
        session.remaining=Math.max(0,session.remaining-elapsed);updateTime();if(session.remaining<=0)finish();
        else for(const p of session.players){
          if(berwaktu(p)){p.sisa=Math.max(0,p.sisa-elapsed);const card=p.el.querySelector('.data-card');card.querySelector('.question-timer').textContent=Math.ceil(p.sisa);card.querySelector('.question-track i').style.width=100*p.sisa/p.total+'%';
            const s=Math.ceil(p.sisa);if(s<=5&&s!==p.tick){p.tick=s;A.play('tick')}
            if(p.sisa<=0){if(p.phase==='tanya')jawab(p,null,true);else habisKoki(p)}}
          else if(p.phase==='hasil'){p.batasBaca-=elapsed;if(p.jeda===null&&p.batasBaca<=0)p.jeda=4;if(p.jeda!==null){p.jeda-=elapsed;const n=p.el.querySelector('.data-card .hitung');if(n)n.textContent=Math.max(0,Math.ceil(p.jeda));if(p.jeda<=0)berikut(p)}}}
        A.urgent(session.remaining<=30||session.players.some(p=>berwaktu(p)&&p.sisa<p.total*.3));
      }
      if(screen==='game')session.players.forEach(p=>{const panik=session.status==='play'&&berwaktu(p)&&p.sisa<p.total*.3;S3.update(p.view,sim,session.status==='paused'?0:dt,settings.motion,panik);V.render(p.view)});
    }
    if(screen==='results')podiumViews.forEach(v=>{V.updatePodium(v,sim,dt,settings.motion);V.render(v)});
    requestAnimationFrame(loop)}

  document.querySelectorAll('[data-players]').forEach(b=>b.addEventListener('click',()=>{A.start();A.play('tap');openPick(Number(b.dataset.players))}));
  document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>{settings.mode=b.dataset.game;save();tampilMode();A.start();A.play('tap')}));
  $('mode').addEventListener('change',caraMain);
  $('pickGo').addEventListener('click',confirmPick);$('pickBack').addEventListener('click',backPick);
  $('pickStage').addEventListener('pointerup',e=>{if(!pickView)return;const b=pickView.el.getBoundingClientRect();let best=-1,jarak=b.width/7;pickView.bots.forEach((r,j)=>{const q=V.project(pickView,r.g.position.clone().setY(1.4)),d=Math.hypot(q.x-(e.clientX-b.left),q.y-(e.clientY-b.top));if(d<jarak){jarak=d;best=j}});if(best>=0)choose(best)});
  document.querySelectorAll('[data-hello]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.hello;homeView?.bots[i].aksi('sapa');$('robotTalk').textContent=ROBOT[i].nama+': “'+ROBOT[i].kata+'”';A.start();A.voice(i)}));
  $('setupBack').addEventListener('click',()=>{readSettings();pick.i=settings.players-1;pick.sel=settings.characters[pick.i];show('pick');renderPick()});
  $('setupForm').addEventListener('submit',e=>{e.preventDefault();if(!$('setupForm').reportValidity())return;readSettings();start()});
  $('volume').addEventListener('input',()=>{settings.volume=+$('volume').value;$('volumeValue').textContent=settings.volume+'%';configureAudio();A.start();save()});
  for(const id of['soundHome','gameSound'])$(id).addEventListener('click',()=>{muted=!muted;configureAudio();A.start()});
  $('pauseGame').addEventListener('click',pause);$('resumeGame').addEventListener('click',resume);$('endGame').addEventListener('click',finish);
  $('showReview').addEventListener('click',()=>{$('reviewContent').innerHTML=reviewMarkup();$('review').hidden=false});$('closeReview').addEventListener('click',()=>{$('review').hidden=true});$('downloadReview').addEventListener('click',download);
  $('playAgain').addEventListener('click',()=>{$('review').hidden=true;start()});$('changeSettings').addEventListener('click',()=>setup(settings.players));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});addEventListener('bookreturn',()=>{pause();A.stop()});
  /* papan ketik: tiap pemain punya 4 tombol (1234, 7890, qwer, uiop); PG = jawab, PGK = pilih/ubah, lalu tombol Kunci jawaban; Esc = jeda */
  addEventListener('keydown',e=>{if(e.key==='Escape'&&screen==='game'){session.status==='paused'?resume():pause();return}if(e.repeat||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||session?.status!=='play')return;
    const keys=['1234','7890','qwer','uiop'];for(const p of session.players){const j=keys[p.i].indexOf(e.key.toLowerCase());if(j<0)continue;e.preventDefault();
      if(p.phase==='hasil')berikut(p);else if(p.phase==='tanya'){if(p.q.tipe==='kategori'){if(j<p.pilih.length)pilihPernyataan(p,j,p.pilih[j]!==true)}else if(j<p.q.opsi.length)pilihOpsi(p,j)}}});
  tampilMode();requestAnimationFrame(loop);
  return{get session(){return session},get settings(){return settings},get screen(){return screen},jawab:(i,j)=>jawab(session.players[i],j),cekKoki:i=>cekKoki(session.players[i])};
})();
