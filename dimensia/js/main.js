/* =========================================================
   DIMENSIA · alur permainan, suara, dan penyimpanan lokal
   Mode: Lab Bebas (semua alat), Petualangan Misi (duga -> selidiki -> kunci -> pembahasan),
   Simulasi TKA (gambar tetap, alat terkunci, pembahasan setelah selesai).
   ========================================================= */
const $=id=>document.getElementById(id);
const KUNCI_SIMPAN='dimensia-v1';
const ST={musik:true,fx:true,level:1,pemandu:'orbo',timer:true,bintang:{hitung:0,tampak:0,pgk:0}};
try{const s=JSON.parse(localStorage.getItem(KUNCI_SIMPAN)||'null');if(s){Object.assign(ST,s);ST.bintang=Object.assign({hitung:0,tampak:0,pgk:0},s.bintang)}}catch(e){}
function simpan(){try{localStorage.setItem(KUNCI_SIMPAN,JSON.stringify(ST))}catch(e){}}
const NAMA_LV=['','Penjelajah','Penyelidik','Ahli Dimensi'];
const NAMA_JENIS={hitung:'Menghitung susunan kubus',tampak:'Tampak depan, atas, dan samping',pgk:'Sisi, keliling, dan luas bangun datar'};
const NAMA_MISI={hitung:'Hitung Susunannya',tampak:'Kamera Ajaib',pgk:'Benar atau Salah'};

/* ---------- Suara (semua dibuat dengan kode, tanpa file audio) ---------- */
const AC=window.AudioContext||window.webkitAudioContext,SND={ctx:null,mus:null,langkah:0};
function audio(){if(!AC)return null;if(!SND.ctx)SND.ctx=new AC();if(SND.ctx.state==='suspended')SND.ctx.resume();return SND.ctx}
function nada(f,dur,o={}){
  const c=SND.ctx,t=c.currentTime+(o.tunda||0),os=c.createOscillator(),g=c.createGain();
  os.type=o.jenis||'sine';os.frequency.setValueAtTime(f,t);if(o.ke)os.frequency.exponentialRampToValueAtTime(o.ke,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(o.vol||.1,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  os.connect(g);g.connect(c.destination);os.start(t);os.stop(t+dur+.03);
}
function fx(n){
  if(!ST.fx||!audio())return;
  if(n==='klik')nada(620,.06,{jenis:'triangle',vol:.08});
  else if(n==='magnet'){nada(240,.13,{jenis:'square',ke:520,vol:.045});nada(880,.09,{tunda:.09,vol:.07})}
  else if(n==='pindah')nada(320,.3,{ke:640,vol:.05});
  else if(n==='lapis')[392,523,659].forEach((f,i)=>nada(f,.16,{tunda:i*.07,jenis:'triangle',vol:.08}));
  else if(n==='benar')[523,659,784,1047].forEach((f,i)=>nada(f,.2,{tunda:i*.09,jenis:'triangle',vol:.1}));
  else if(n==='salah')nada(260,.22,{ke:190,jenis:'sawtooth',vol:.045});
  else if(n==='tolak')nada(200,.08,{jenis:'square',vol:.04});
}
const AKOR=[0,5,9,7],POLA=[0,7,12,7,14,7,12,7];
function musik(){
  clearInterval(SND.mus);SND.mus=null;if(!ST.musik||!audio())return;
  SND.mus=setInterval(()=>{if(document.hidden)return;const i=SND.langkah++,akar=AKOR[Math.floor(i/8)%4];
    nada(196*Math.pow(2,(akar+POLA[i%8])/12),.45,{vol:.02});if(i%8===0)nada(98*Math.pow(2,akar/12),1.6,{jenis:'triangle',vol:.03})},310);
}

/* ---------- Layar ---------- */
let layar='home',S=null,kubusAktif=[];
function tampil(n){layar=n;for(const id of['home','pilih','main'])$(id).hidden=id!==n;document.body.className=n==='main'?'terang':'gelap';$('hasil').hidden=true}
function pemandu(){return ROBOT.find(r=>r.id===ST.pemandu)||ROBOT[0]}
function kartu(){const r=pemandu();$('kartu').innerHTML=`<i style="background:${r.warna}"></i><b>${r.nama}</b>, ${r.julukan}. “${r.kata}”<br><small>Ketuk robot untuk memilih pemandu. Geser untuk memutarnya.</small>`}
function ucap(teks,aksi){$('ucap').innerHTML=`<b>${pemandu().nama}:</b> ${teks}`;if(aksi)PEMANDU.aksi(aksi)}
function tombolSuara(){$('bMusik').setAttribute('aria-pressed',ST.musik);$('bFx').setAttribute('aria-pressed',ST.fx);$('bTimer').setAttribute('aria-pressed',ST.timer)}
function segarkanPilih(){
  $('lvBtns').className='rapat';
  $('lvBtns').innerHTML=[1,2,3].map(l=>`<button class="btn kecil" data-lv="${l}" aria-pressed="${ST.level===l}">${NAMA_LV[l]}</button>`).join('');
  document.querySelectorAll('.bintang[data-b]').forEach(e=>{const n=ST.bintang[e.dataset.b]||0;e.textContent='★'.repeat(n)+'☆'.repeat(3-n)});
}

/* ---------- Sesi ---------- */
const buatSoal=(jenis,seed,level,contoh)=>jenis==='pgk'?DP.buat(seed,level):DK.buat(jenis,seed,level,contoh&&jenis==='hitung');
const soal=()=>S&&S.daftar?S.daftar[S.i]:null;
const terkunci=()=>S.mode!=='lab'&&(S.tahap==='duga'||S.tahap==='jawab');
const salin=p=>Array.isArray(p)?p.slice():p;
const lengkap=()=>Array.isArray(S.pilih)?S.pilih.every(v=>v!==null):S.pilih!==null;
const benarkah=(s,p)=>p===null?false:s.jenis==='pgk'?s.pernyataan.every((q,i)=>p[i]===q.benar):p===s.benar;
function arena(n){S.arena=n;$('stage3d').hidden=n!=='kubus';$('stage2d').hidden=n!=='poligon';$('alat3d').hidden=n!=='kubus';$('alat2d').hidden=n!=='poligon';$('pilihBangun').hidden=!(n==='poligon'&&S.mode==='lab')}
/* rumus keliling & luas untuk bangun 2D yang sedang tampil */
let rumusAktif=null;
function muat2D(t,rumus){rumusAktif=rumus;G2.muat(t)}
/* Lab 2D: anak memilih sendiri bangunnya; tombol "Ukuran lain" hanya mengganti ukuran bangun yang sama */
function ikonBangun(t){const xs=t.map(p=>p[0]),ys=t.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0,h=Math.max(...ys)-y0,k=Math.min(30/w,22/h),ox=(36-w*k)/2,oy=(28-h*k)/2;
  return`<svg viewBox="0 0 36 28" aria-hidden="true"><polygon points="${t.map(p=>[ox+(p[0]-x0)*k,28-oy-(p[1]-y0)*k].join(',')).join(' ')}"/></svg>`}
$('pilihBangun').innerHTML=DP.BENTUK.map(b=>`<button class="btn bangun" data-bangun="${b.id}">${ikonBangun(b.t)}<span>${b.nama}</span></button>`).join('');
function pilihBangun(id,varian=0){const b=DP.cari(id)||DP.BENTUK[0];S.bangun=b.id;S.varian=varian%b.varian.length;const t=b.varian[S.varian],alat={...G2.st.alat};G2.kunci(false);muat2D(t,DP.rumus(b.id,t));Object.assign(G2.st.alat,alat);G2.setel('_',false);
  $('pilihBangun').querySelectorAll('[data-bangun]').forEach(e=>e.setAttribute('aria-pressed',e.dataset.bangun===b.id))}
function muatKubus(k,kunci){kubusAktif=k;G3.muat(k);G3.kunci(kunci)}

function mulai(mode,jenis){
  if(S&&S.jam)clearInterval(S.jam);
  const seed=Math.floor(Math.random()*900000)+1000;
  S={mode,jenis,i:0,hasil:[],pilih:null,duga:null,tahap:'',tinjau:false,seed};
  if(mode==='misi')S.daftar=[0,1,2].map(i=>buatSoal(jenis,seed+i*101,ST.level,i===0&&ST.level===2));
  if(mode==='tka'){
    S.daftar=['hitung','pgk','tampak','pgk','hitung','tampak'].map((j,i)=>buatSoal(j,seed+i*101,ST.level));
    S.sisa=ST.timer?600:null;
    if(S.sisa!==null)S.jam=setInterval(()=>{if(S.tahap==='selesai'||S.tinjau)return;S.sisa--;info();if(S.sisa<=0)selesai()},1000);
  }
  tampil('main');PEMANDU.ganti(ST.pemandu);
  if(mode==='lab'){S.arena=jenis;bukaLab(true)}else bukaSoal();
}
function bukaLab(contoh){
  S.tahap='lab';
  if(S.arena==='kubus'){arena('kubus');muatKubus(contoh?DK.dariTinggi(DK.CONTOH15):DK.buatBebas(S.seed++),false);
    ucap('Ini Lab Kubus. Geser layar untuk memutar bangun, ketuk kubus untuk menghitungnya, lalu coba tombol Bedah lapisan.','petunjuk')}
  else{arena('poligon');pilihBangun(S.bangun||'persegi',S.varian||0);
    ucap('Ini Lab Bangun Datar 2D. Pilih bangunnya di bawah, ketuk setiap sisi untuk menghitungnya, lalu coba tombol Keliling dan Luas.','petunjuk')}
  segarkan();
}
function bukaSoal(){
  const s=soal();
  S.pilih=s.jenis==='pgk'?s.pernyataan.map(()=>null):null;S.duga=null;S.tahap=S.mode==='misi'?'duga':'jawab';
  if(s.jenis==='pgk'){arena('poligon');muat2D(s.titik,s.rumus);G2.kunci(true)}else{arena('kubus');muatKubus(s.kubus,true)}
  ucap(S.mode==='misi'?'Amati dulu baik-baik, lalu buat dugaanmu. Alat penyelidik terbuka setelah dugaan dikunci.':'Simulasi TKA. Amati gambarnya, lalu kunci jawabanmu.','petunjuk');
  segarkan();
}
/* Pembuktian visual memakai objek yang sama dengan soalnya */
function bukti(){
  const s=soal();
  if(s.jenis==='pgk'){G2.kunci(false);return}
  G3.kunci(false);
  if(s.jenis==='hitung')G3.setel('bedah',true);else G3.pandang(s.arah);
}
function kunciJawab(){
  const s=soal();if(!lengkap())return;
  if(S.tahap==='duga'){
    S.duga=salin(S.pilih);S.tahap='coba';
    if(s.jenis==='pgk')G2.kunci(false);else G3.kunci(false);
    fx('lapis');ucap('Dugaanmu sudah dicatat. Sekarang selidiki dengan alat di bawah. Kalau sudah yakin, kunci jawaban akhirmu.','petunjuk');segarkan();return;
  }
  const benar=benarkah(s,S.pilih);
  S.hasil[S.i]={pilih:salin(S.pilih),benar,dugaBenar:benarkah(s,S.duga)};
  if(S.mode==='tka'){fx('klik');lanjut();return}
  S.tahap='bahas';fx(benar?'benar':'salah');
  ucap(benar?'Tepat! Lihat pembuktiannya di layar.':'Belum tepat. Ayo kita periksa bersama di layar.',benar?'senang':'bingung');
  bukti();segarkan();
}
function lanjut(){
  if(S.tinjau){S.tinjau=false;S.tahap='selesai';$('hasil').hidden=false;return}
  if(S.i<S.daftar.length-1){S.i++;bukaSoal()}else selesai();
}
function selesai(){
  clearInterval(S.jam);S.tahap='selesai';
  const n=S.daftar.length;for(let i=0;i<n;i++)if(!S.hasil[i])S.hasil[i]={pilih:null,benar:false,dugaBenar:false};
  const b=S.hasil.filter(h=>h.benar).length;S.bintang=0;
  if(S.mode==='misi'){
    const d=S.hasil.filter(h=>h.dugaBenar).length;
    S.bintang=b===n&&d>=n-1?3:b>=n-1?2:1;
    if(S.bintang>(ST.bintang[S.jenis]||0)){ST.bintang[S.jenis]=S.bintang;simpan()}
  }
  fx(b>=n-1?'benar':'klik');tampilHasil();
}
function tampilHasil(){
  const n=S.daftar.length,b=S.hasil.filter(h=>h.benar).length;
  let h=`<h2>${S.mode==='misi'?'Misi selesai':'Simulasi selesai'}</h2>`;
  if(S.mode==='misi')h+=`<div class="bintang-besar">${'★'.repeat(S.bintang)}<span>${'★'.repeat(3-S.bintang)}</span></div><p>1 bintang: misi selesai. 2 bintang: paling banyak satu jawaban keliru. 3 bintang: semua tepat dan dugaan awal hampir selalu tepat.</p>`;
  h+=`<p><b>Benar ${b} dari ${n} soal</b>${S.mode==='tka'?`, nilai ${Math.round(b/n*100)}`:''}</p><div class="rekap">`;
  S.daftar.forEach((s,i)=>{const r=S.hasil[i];h+=`<div class="${r.benar?'ok':'no'}"><b>${r.benar?'✔':'✘'}</b><span>Soal ${i+1}: ${NAMA_JENIS[s.jenis]}${r.pilih===null?' (belum dijawab)':''}</span><button class="btn kecil" data-tinjau="${i}">Pembahasan</button></div>`});
  h+='</div>';
  const kuasai=[],latih=[];
  for(const j of Object.keys(NAMA_JENIS)){const idx=S.daftar.map((s,i)=>s.jenis===j?i:-1).filter(i=>i>=0);if(!idx.length)continue;(idx.every(i=>S.hasil[i].benar)?kuasai:latih).push(NAMA_JENIS[j])}
  h+=`<div class="materi">${kuasai.length?`<b>Sudah dikuasai:</b> ${kuasai.join('; ')}.<br>`:''}${latih.length?`<b>Perlu dilatih lagi:</b> ${latih.join('; ')}.`:''}</div>`;
  h+=`<div class="baris"><button class="btn utama" id="ulang">Ulangi</button><button class="btn" id="kePilih">Kembali ke pilihan misi</button></div>`;
  $('hasilIsi').innerHTML=h;$('hasil').hidden=false;segarkanPilih();
}
function tinjau(i){
  const s=S.daftar[i];S.i=i;S.tinjau=true;S.tahap='bahas';
  S.pilih=S.hasil[i].pilih!==null?salin(S.hasil[i].pilih):(s.jenis==='pgk'?s.pernyataan.map(()=>null):null);
  if(s.jenis==='pgk'){arena('poligon');muat2D(s.titik,s.rumus)}else{arena('kubus');muatKubus(s.kubus,false)}
  bukti();$('hasil').hidden=true;ucap('Ini pembahasannya. Coba putar atau bedah bangunnya supaya lebih jelas.','petunjuk');segarkan();
}

/* ---------- Gambar tampak (kisi 2D) ---------- */
function kisi(g,C,R){
  C=C||g[0].length;R=R||g.length;const ox=(C-g[0].length)/2,oy=R-g.length;let h='';
  g.forEach((row,r)=>row.forEach((v,c)=>{h+=`<rect class="${v?'isi':'kosong'}" x="${(c+ox)*10+1}" y="${(r+oy)*10+1}" width="10" height="10"/>`}));
  return`<svg class="kisi" viewBox="0 0 ${C*10+2} ${R*10+2}">${h}</svg>`;
}

/* ---------- Penyegaran antarmuka ---------- */
function info(){
  let h=`<span class="cip">${S.mode==='lab'?'Lab Bebas':S.mode==='misi'?'Misi: '+NAMA_MISI[S.jenis]:'Simulasi TKA'}</span>`;
  if(S.mode!=='lab')h+=`<span class="cip">${NAMA_LV[ST.level]}</span>`;
  if(S.mode==='tka'&&S.sisa!==null){const m=Math.max(0,S.sisa);h+=`<span class="cip waktu${m<=60?' genting':''}">${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}</span>`}
  $('info').innerHTML=h;
}
function panel(){
  const p=$('panel');if(S.mode==='lab'){p.hidden=true;return}
  p.hidden=false;
  const s=soal(),bahas=S.tahap==='bahas',hasil=S.hasil[S.i];
  let h=`<div class="meta">Soal ${S.i+1} dari ${S.daftar.length}, ${s.jenis==='pgk'?'PGK-Kategori':'Pilihan Ganda'}, kode soal ${s.seed}</div><p class="tanya">${s.teks}</p>`;
  if(s.jenis==='pgk'){
    h+=s.pernyataan.map((q,i)=>{const j=S.pilih[i];
      return`<div class="pern ${bahas?(j===q.benar?'ok':'no'):''}"><div class="pt"><b>${i+1}</b><span>${q.teks}</span></div>
        <div class="bs"><button class="btn" data-p="${i}" data-n="1" aria-pressed="${j===true}" ${bahas?'disabled':''}>Benar</button><button class="btn" data-p="${i}" data-n="0" aria-pressed="${j===false}" ${bahas?'disabled':''}>Salah</button></div>
        ${bahas?`<div class="alasan"><b>${q.benar?'Benar':'Salah'}.</b> ${q.alasan}<button class="btn" data-bukti="${i}">Lihat bukti</button></div>`:''}</div>`}).join('');
  }else{
    const C=s.jenis==='tampak'?Math.max(...s.opsi.map(g=>g[0].length)):0,R=s.jenis==='tampak'?Math.max(...s.opsi.map(g=>g.length)):0;
    h+=`<div class="opsi">`+s.opsi.map((o,i)=>`<button class="btn op ${bahas?(i===s.benar?'ok':i===S.pilih?'no':''):''}" data-o="${i}" aria-pressed="${S.pilih===i}" ${bahas?'disabled':''}><b>${'ABCD'[i]}</b>${s.jenis==='hitung'?o:kisi(o,C,R)}</button>`).join('')+`</div>`;
  }
  if(bahas){
    const judul=!hasil||hasil.pilih===null?'Belum dijawab':hasil.benar?'Jawabanmu tepat':'Jawabanmu belum tepat';
    h+=`<div class="bahas"><h3>${judul}</h3>${s.bahas?`<ol>${s.bahas.map(x=>`<li>${x}</li>`).join('')}</ol>`:'<p class="ket">Ketuk “Lihat bukti” pada tiap pernyataan untuk melihat buktinya pada bangun.</p>'}</div>`;
    h+=`<button class="btn utama" id="lanjutBtn">${S.tinjau?'Kembali ke rekap':S.i<S.daftar.length-1?'Soal berikutnya':'Lihat hasil'}</button>`;
  }else{
    const label=S.tahap==='duga'?'Kunci dugaan':S.tahap==='coba'?'Kunci jawaban akhir':'Kunci jawaban';
    if(S.tahap==='duga')h+='<p class="ket">Langkah 1 dari 2: buat dugaan dulu tanpa alat.</p>';
    if(S.tahap==='coba')h+='<p class="ket">Langkah 2 dari 2: selidiki, lalu ubah jawabanmu kalau perlu.</p>';
    h+=`<button class="btn utama" id="kunciBtn" ${lengkap()?'':'disabled'}>${label}</button>`;
  }
  p.innerHTML=h;
}
function hud(){
  const s=soal();let h='';
  if(S.mode!=='lab'&&terkunci())h='<span class="cip">Alat terkunci</span>';
  else if(S.arena==='kubus'&&S.tahap==='bahas'&&s&&s.jenis==='hitung'){
    for(let i=s.lap.length-1;i>=0;i--)h+=`<span class="cip l${i%4}">Lapisan ${i+1}: ${s.lap[i]} kubus</span>`;
    h+=`<span class="cip">Jumlah: ${s.lap.join(' + ')} = ${s.kubus.length}</span>`;
  }
  if(S.arena==='poligon'&&rumusAktif&&!terkunci()){if(G2.st.alat.keliling)h+=`<span class="cip rumus kel">${rumusAktif.teksKeliling}</span>`;if(G2.st.alat.luas)h+=`<span class="cip rumus luas">${rumusAktif.teksLuas} Satu petak = 1 satuan persegi.</span>`}
  $('hud').innerHTML=h;
  const v=G3.st.pandang,boleh=S.arena==='kubus'&&(S.mode==='lab'||S.tahap==='bahas')&&DK.NAMA_ARAH[v];
  $('mini').hidden=!boleh;
  if(boleh)$('mini').innerHTML=`Tampak ${DK.NAMA_ARAH[v]}${kisi(DK.proyeksi(kubusAktif,v))}`;
}
function alat(){
  const kunci=terkunci(),lab=S.mode==='lab';
  document.querySelectorAll('.khusus-lab').forEach(e=>e.hidden=!lab);
  if(S.arena==='kubus'){
    const st=G3.st,H=G3.dim.H;
    $('pindaiBtns').innerHTML=`<button class="btn" data-l="-1" aria-pressed="${st.pindai<0}">Semua</button>`+Array.from({length:H},(_,i)=>`<button class="btn" data-l="${i}" aria-pressed="${st.pindai===i}">${i+1}</button>`).join('');
    $('alat3d').querySelectorAll('button').forEach(b=>{const d=b.dataset;b.disabled=kunci;
      if(d.t)b.setAttribute('aria-pressed',!!st[d.t]);if(d.v)b.setAttribute('aria-pressed',st.pandang===d.v)});
    $('nHitung').textContent=st.hit.length;
  }else{
    const st=G2.st;
    $('alat2d').querySelectorAll('button').forEach(b=>{b.disabled=kunci;if(b.dataset.t)b.setAttribute('aria-pressed',!!st.alat[b.dataset.t])});
    $('nHitung2').textContent=st.hitS.length;
  }
}
function segarkan(){if(!S||layar!=='main')return;info();panel();hud();alat()}

/* ---------- Kejadian ---------- */
G3.onUbah=apa=>{if(apa==='hitung')fx('magnet');if(apa==='sudah'){fx('tolak');ucap('Kubus itu sudah dihitung. Pilih kubus yang lain.')}if(S){hud();alat()}};
G2.onUbah=apa=>{if(apa==='hitung')fx('magnet');if(apa==='sudah'){fx('tolak');ucap('Bagian itu sudah dihitung. Pilih yang lain.')}if(S){hud();alat()}};
$('alat3d').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.v){G3.pandang(d.v);fx('pindah');if(d.v!=='3d')ucap(`Kamera pindah ke tampak ${DK.NAMA_ARAH[d.v]}. Bandingkan dengan bangun 3D-nya.`)}
  else if(d.t){G3.setel(d.t,!G3.st[d.t]);fx(d.t==='trans'?'klik':'lapis')}
  else if(d.l!==undefined){G3.setel('pindai',+d.l);fx('klik')}
  else if(d.a==='kiri'){G3.putar(1);fx('pindah')}
  else if(d.a==='kanan'){G3.putar(-1);fx('pindah')}
  else if(d.a==='zmin'){G3.zoom(1/1.2);fx('klik')}
  else if(d.a==='zplus'){G3.zoom(1.2);fx('klik')}
  else if(d.a==='reset'){G3.st.zoom=1;G3.pandang('3d');fx('pindah')}
  else if(d.a==='hapus'){G3.hapusHitung();fx('klik')}
  else if(d.a==='baru'){fx('lapis');bukaLab(false)}
  else if(d.a==='contoh'){fx('lapis');bukaLab(true)}
  else if(d.a==='periksa'){
    const n=G3.st.hit.length,N=G3.jumlah;
    if(n===N){fx('benar');ucap(`Tepat! Semua ${N} kubus sudah kamu hitung, tidak ada yang terlewat.`,'senang')}
    else{fx('salah');ucap(`Kamu sudah menghitung ${n} kubus, tetapi masih ada kubus yang belum terhitung. Coba Bedah lapisan atau Transparan untuk mencari yang tersembunyi.`,'bingung')}
  }
});
$('alat2d').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.t){G2.setel(d.t,!G2.st.alat[d.t]);fx('klik')}
  if(d.t==='keliling'&&G2.st.alat.keliling)ucap('Keliling adalah panjang garis tepi bangun. Jumlahkan panjang semua sisinya.','petunjuk');
  if(d.t==='luas'&&G2.st.alat.luas)ucap('Luas adalah banyak petak satuan yang menutupi bangun. Bandingkan hitungan petaknya dengan rumusnya.','petunjuk');
  if(d.a==='hapus'){G2.hapus();fx('klik')}
  else if(d.a==='ukuran'){fx('lapis');pilihBangun(S.bangun,S.varian+1);ucap(`Ukuran ${DP.cari(S.bangun).nama.toLowerCase()} berubah. Bentuknya tetap, keliling dan luasnya ikut berubah.`,'petunjuk')}
  else if(d.a==='periksa'){
    const n=G2.sifat.n,a=G2.st.hitS.length;
    if(a===n){fx('benar');ucap(`Tepat! ${S.mode==='lab'?DP.cari(S.bangun).nama:'Bangun ini'} memiliki ${n} sisi.`,'senang')}
    else{fx('salah');ucap(`Kamu baru menghitung ${a} sisi. Masih ada yang terlewat. Ketuk setiap sisinya.`,'bingung')}
  }
});
const DEMO={sisi:'sisi',golong:'sisi',semuaSama:'panjang',adaSama:'panjang',keliling:'keliling',luas:'luas'};
function buktiPgk(i){
  const q=soal().pernyataan[i];G2.st.alat={};G2.setel(DEMO[q.j],true);
  fx('pindah');ucap(q.alasan,'petunjuk');
}
$('panel').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.o!==undefined){S.pilih=+d.o;fx('klik');panel()}
  else if(d.p!==undefined){S.pilih[+d.p]=d.n==='1';fx('klik');panel()}
  else if(d.bukti!==undefined)buktiPgk(+d.bukti);
  else if(b.id==='kunciBtn')kunciJawab();
  else if(b.id==='lanjutBtn'){fx('klik');lanjut()}
});
$('hasil').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;fx('klik');
  if(b.dataset.tinjau!==undefined)tinjau(+b.dataset.tinjau);
  else if(b.id==='ulang')mulai(S.mode,S.jenis);
  else if(b.id==='kePilih'){S=null;tampil('pilih');segarkanPilih()}
});
$('pilih').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;fx('klik');
  if(d.lv){ST.level=+d.lv;simpan();segarkanPilih()}
  else if(d.mulai){const[m,j]=d.mulai.split(':');mulai(m,j)}
  else if(b.id==='bTimer'){ST.timer=!ST.timer;simpan();tombolSuara()}
  else if(b.id==='keHome')tampil('home');
});
$('mulai').addEventListener('click',()=>{fx('lapis');tampil('pilih');segarkanPilih()});
$('keluar').addEventListener('click',()=>{fx('klik');if(S&&S.jam)clearInterval(S.jam);S=null;tampil('pilih');segarkanPilih()});
$('bMusik').addEventListener('click',()=>{ST.musik=!ST.musik;simpan();tombolSuara();musik()});
$('bFx').addEventListener('click',()=>{ST.fx=!ST.fx;simpan();tombolSuara();fx('klik')});
$('bFs').addEventListener('click',()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen();else if(d.documentElement.requestFullscreen)d.documentElement.requestFullscreen().catch(()=>{})});
addEventListener('pointerdown',()=>{if(!SND.mus&&ST.musik)musik()},{passive:true});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('resize',()=>segarkan());

/* ---------- Mulai ---------- */
G3.pasang($('stage3d'));G2.pasang($('svg2d'));
$('pilihBangun').addEventListener('click',e=>{const b=e.target.closest('[data-bangun]');if(!b||!S||S.mode!=='lab')return;fx('lapis');pilihBangun(b.dataset.bangun);ucap(`Ini ${DP.cari(S.bangun).nama.toLowerCase()}. Ketuk setiap sisinya, lalu coba Keliling dan Luas.`,'petunjuk');segarkan()});PEMANDU.pasang($('pemandu'));
HOME.pasang($('homeStage'),i=>{ST.pemandu=ROBOT[i].id;simpan();kartu();fx('magnet')});
HOME.pilih(Math.max(0,ROBOT.findIndex(r=>r.id===ST.pemandu)));
kartu();tombolSuara();segarkanPilih();
/* Tautan langsung, misalnya index.html?buka=lab:kubus atau ?buka=misi:hitung&lv=2 */
{const q=new URLSearchParams(location.search),lv=+q.get('lv'),buka=q.get('buka');
 if(lv>=1&&lv<=3)ST.level=lv;
 if(buka&&/^(lab:(kubus|poligon)|misi:(hitung|tampak|pgk)|tka:)$/.test(buka)){const[m,j]=buka.split(':');mulai(m,j)}}
let tl=0;
(function loop(ms){const t=(ms||0)/1000;GL.denyut(Math.min(.1,t-tl));tl=t;GL.mulai();
  if(layar==='home')HOME.render(t);else if(layar==='main'){G3.render();PEMANDU.render(t)}
  requestAnimationFrame(loop)})();
