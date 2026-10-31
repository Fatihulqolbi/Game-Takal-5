/* PENYAJIAN DATA · Lab Data: belajar sendiri tanpa waktu dan tanpa nilai. Diagramnya bisa "dibongkar":
   1 Rapikan        : benda berserakan → ditumpuk per jenis → berubah jadi batang (tinggi batang = banyak benda)
   2 Turus          : data datang satu per satu; ketuk jenisnya, turus, tabel, dan batang tumbuh bersamaan
   3 Bedah piktogram: ketuk ikon, ikon pecah jadi nilainya; skala ikon bisa diganti
   4 Garis bantu    : ketuk batang untuk menarik garis ke sumbu; seret penggaris mendatar; skala sumbu bisa diganti
   5 Potong & gabung: pilih batang, lalu potong (selisih), tumpuk (jumlah), gandakan (kali), atau tarik garis batas
   6 Ubah sajian    : satu data, empat tampilan; seret batang atau ubah angka tabel, semuanya ikut berubah
   7 Survei kelas   : murid memilih langsung di TV (banyak jari sekaligus), diagram terbentuk, lalu soal dari data kelas sendiri
   8 Potong pizza   : warnai potong pizza per topping; tabel, pecahan, persen, dan pita 100% ikut berubah; rapikan jadi diagram lingkaran
   9 Diagram garis  : seret titik naik-turun; tiap ruas garis menunjukkan naik atau turun berapa; batangnya bisa dimunculkan
   10 Tabel frekuensi: data mentah (angka acak) diketuk satu per satu menjadi turus, frekuensi, dan diagram batang
   Setiap mode punya tantangan kecil dengan animasi pembahasan yang sama seperti di game. */
const DataLab=(()=>{
  const $=id=>document.getElementById(id),A=MenaraAudio,angka=DT.angka,esc=DT.esc,W=DT.WARNA;
  const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tab='rapikan',muted=false,seed=Math.floor(Math.random()*1e9),anim=null,bersih=[];
  const acakR=()=>DT.random(seed++),ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  A.configure({music:false,fx:true,volume:80,motion,lagu:'data'});
  const suara=()=>{A.configure({fx:!muted,music:false});$('suara').textContent=muted?'Suara mati':'Suara nyala';$('suara').setAttribute('aria-pressed',!muted)};
  const TOKOH={rapikan:0,turus:3,pikto:1,garis:0,potong:0,sajian:2,survei:1,lingkaran:1,dgaris:0,frekuensi:3};
  function ucap(teks){const r=ROBOT[TOKOH[tab]];$('ucap').innerHTML=`<i style="background:${r.warna}"></i><b>${r.nama}:</b> ${esc(teks)}`}
  function papan(isi,kecil){$('papan').innerHTML=`<small>${esc(kecil)}</small>${esc(isi)}`;$('papan').hidden=!isi}
  /* ketuk per jari (pointerdown + pointerup di tombol yang sama); klik papan ketik tetap jalan */
  function ketuk(root,fn){const tekan=new Map();
    root.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b&&root.contains(b))tekan.set(e.pointerId,b)});
    root.addEventListener('pointerup',e=>{const b=tekan.get(e.pointerId);tekan.delete(e.pointerId);if(b&&e.target.closest('button')===b&&!b.disabled){b._ketuk=performance.now();fn(b,e)}});
    root.addEventListener('pointercancel',e=>tekan.delete(e.pointerId));
    root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b)||(b._ketuk&&performance.now()-b._ketuk<800))return;fn(b,e)})}
  const panggung=()=>$('panggung'),panel=()=>$('panel');
  /* tangkap jari ke elemen; bisa gagal kalau jarinya sudah terangkat, dan itu tidak apa-apa */
  const tangkap=(el,e)=>{try{el.setPointerCapture(e.pointerId)}catch(_){}};
  function berhenti(){anim?.stop();anim=null;bersih.forEach(f=>f());bersih=[]}
  const BUAH=[{nama:'Apel',ikon:'🍎'},{nama:'Pisang',ikon:'🍌'},{nama:'Jeruk',ikon:'🍊'},{nama:'Anggur',ikon:'🍇'},{nama:'Semangka',ikon:'🍉'}];
  /* konteks kalimat untuk data buatan Lab */
  const KBUAH={id:'lab',judul:'Buah di Meja',kat:'Buah',satuan:'buah',ikon:'🍎',jamak:'jenis buah',kecil:true,f:x=>`banyak ${x}`,f2:(a,b)=>`banyak ${a} dan ${b}`,semua:()=>'buah di meja',
    tanya:k=>`Buah apa yang paling ${k}?`,paling:(x,k)=>`${x[0].toUpperCase()+x.slice(1)} paling ${k}.`,syarat:(op,b)=>`jenis buah yang banyaknya ${op} ${b}`};

  /* ---------- kuis kecil di panel (PG, MCMA, Kategori) + animasi pembahasan ---------- */
  function kuis(host,buat,o={}){let n=0,q,pilih,selesai=false,kendali=null;
    /* wadah baru supaya pendengar lama (kuis sebelumnya di wadah yang sama) ikut hilang */
    const baru=host.cloneNode(false);host.replaceWith(baru);host=baru;host.hidden=false;
    const tampil=()=>{kendali?.stop();q=buat(n);selesai=false;pilih=q.tipe==='pg'?null:q.benar.map(()=>q.tipe==='multi'?false:null);
      const opsi=q.tipe==='kategori'?q.pernyataan.map((s,i)=>`<div class="statement"><span>${i+1}. ${esc(s.teks)}</span><button type="button" data-p="${i}" data-v="true" aria-pressed="false">Benar</button><button type="button" data-p="${i}" data-v="false" aria-pressed="false">Salah</button></div>`).join('')
        :`<div class="soal-opsi${q.opsi[0].startsWith('<svg')?' opsi-gambar':''}${q.opsi.some(x=>x.length>30)?' panjang':''}">${q.opsi.map((v,j)=>`<button type="button" class="answer-option" data-o="${j}" ${q.tipe==='multi'?'aria-pressed="false"':''}><b>${'ABCD'[j]}</b><span>${v.startsWith('<svg')?v:esc(v)}</span></button>`).join('')}</div>`;
      host.innerHTML=`<div class="soal-box"><small class="jenis-soal">${q.tipe==='pg'?'Pilihan ganda':q.tipe==='multi'?'PGK: pilih semua yang benar':'PGK: benar atau salah'}</small>${o.gambar!==false?`<div class="lab-gambar">${q.gambar}</div>`:''}<p class="soal-teks">${esc(q.teks)}</p>${opsi}${q.tipe!=='pg'?'<button type="button" class="submit-answer" data-kirim disabled>Kunci jawaban</button>':''}<div class="lab-hasil" hidden></div></div>`};
    const segar=()=>{host.querySelectorAll('[data-o]').forEach(b=>{if(q.tipe==='multi')b.setAttribute('aria-pressed',pilih[+b.dataset.o])});host.querySelectorAll('[data-p]').forEach(b=>b.setAttribute('aria-pressed',pilih[+b.dataset.p]===(b.dataset.v==='true')));
      const k=host.querySelector('[data-kirim]');if(k)k.disabled=q.tipe==='multi'?!pilih.some(Boolean):pilih.some(v=>v===null)};
    const jawab=j=>{if(selesai)return;selesai=true;const ok=DT.cek(q,j);A.play(ok?'good':'bad');
      host.querySelectorAll('[data-o]').forEach(b=>{b.disabled=true;const k=+b.dataset.o;if(q.tipe==='pg'?k===q.benar:q.benar[k])b.classList.add('correct');else if(q.tipe==='pg'?k===j:j[k])b.classList.add('wrong')});
      host.querySelectorAll('[data-p],[data-kirim]').forEach(b=>b.disabled=true);
      const h=host.querySelector('.lab-hasil');h.hidden=false;h.className='lab-hasil '+(ok?'ok':'no');
      h.innerHTML=`<b>${ok?'Benar!':'Belum tepat.'}</b> Jawaban: ${esc(DT.jawabanTeks(q))}<div class="data-anim"></div><ol class="langkah-data">${q.kunci.map(k=>`<li>${esc(k)}</li>`).join('')}</ol><button type="button" class="chunky lompat-btn" data-lagi>Soal lain</button>`;
      kendali=DA.jelaskan(h.querySelector('.data-anim'),q,{cepat:!motion});ucap(ok?'Hebat! Lihat buktinya di animasi.':'Tidak apa-apa. Perhatikan animasinya, ya!')};
    ketuk(host,b=>{const d=b.dataset;A.play('tap');if(d.lagi!==undefined){n++;tampil()}else if(d.o!==undefined){if(q.tipe==='pg')jawab(+d.o);else{pilih[+d.o]=!pilih[+d.o];segar()}}else if(d.p!==undefined){pilih[+d.p]=d.v==='true';segar()}else if(d.kirim!==undefined)jawab(pilih.slice())});
    tampil();bersih.push(()=>kendali?.stop());return{ulang(){n++;tampil()}}}
  const kartu=(judul,isi,kecil='')=>`<section class="lab-kartu"><h2>${judul}${kecil?` <small>${kecil}</small>`:''}</h2>${isi}</section>`;

  /* ---------- 1. RAPIKAN: benda → tumpukan → batang ---------- */
  function rapikan(){const r=acakR(),jenis=DT.acak(r,BUAH).slice(0,4),nilai=DT.acak(r,[2,3,4,5,6,7,8]).slice(0,4);let fase='acak';
    const d={k:'lab',judul:'Buah di Meja',kat:'Buah',satuan:'buah',ikon:'🍎',label:jenis.map(j=>j.nama),nilai,step:1,unit:1,kelip:1};DT.lengkapi(d);
    const st=panggung();st.innerHTML='<div class="rapi"><div class="rapi-sumbu" hidden></div><div class="rapi-kolom"></div></div>';
    const meja=st.querySelector('.rapi'),kolom=meja.querySelector('.rapi-kolom'),sumbu=meja.querySelector('.rapi-sumbu');
    kolom.innerHTML=jenis.map((j,i)=>`<div class="kol" style="--w:${W[i]}"><span class="kol-n" hidden>${nilai[i]}</span><b>${j.ikon} ${j.nama}</b></div>`).join('');
    const benda=[];jenis.forEach((j,i)=>{for(let k=0;k<nilai[i];k++){const e=document.createElement('div');e.className='benda';e.textContent=j.ikon;e.style.setProperty('--w',W[i]);e.setAttribute('aria-hidden','true');meja.appendChild(e);benda.push({e,i,k,x:r(),y:r(),rot:(r()-.5)*40,taruh:false})}});
    /* ukuran & posisi dalam piksel dari ukuran panggung */
    const ukur=()=>{const b=meja.getBoundingClientRect(),n=jenis.length,cw=b.width/n,s=Math.max(22,Math.min(cw*.5,(b.height*.6)/8,70)),dasar=b.height-48;return{b,n,cw,s,dasar}};
    const atur=()=>{const u=ukur(),hit=jenis.map(()=>0);meja.style.setProperty('--s',u.s+'px');
      benda.forEach(o=>{let x,y,rot=o.rot;if(fase==='acak'&&!o.taruh){x=o.x*(u.b.width-u.s);y=o.y*(u.b.height*.42-u.s)}else{const k=hit[o.i]++;x=u.cw*(o.i+.5)-u.s/2;y=u.dasar-(k+1)*u.s*(fase==='diagram'?1:1.04);rot=0}
        o.e.style.transform=`translate(${x}px,${y}px) rotate(${rot}deg)`});
      sumbu.innerHTML=Array.from({length:9},(_,v)=>`<i style="bottom:${48+v*u.s}px"><span>${v}</span></i>`).join('');
      kolom.querySelectorAll('.kol-n').forEach((k,i)=>k.style.bottom=(48+nilai[i]*u.s+6)+'px')};
    const setFase=f=>{fase=f;meja.dataset.fase=f;sumbu.hidden=f!=='diagram';kolom.querySelectorAll('.kol-n').forEach(k=>k.hidden=f==='acak');atur();
      ucap({acak:'Buahnya berserakan! Seret ke kolomnya atau tekan Rapikan.',rapi:'Sudah rapi! Tumpukan paling tinggi = buah paling banyak.',diagram:'Lihat! Tiap tumpukan jadi batang. Tinggi batang = banyak buah.'}[f]);
      panel().querySelectorAll('[data-fase]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.fase===f))};
    /* seret buah ke kolomnya (tiap jari satu buah) */
    const pegang=new Map();
    meja.addEventListener('pointerdown',e=>{const o=benda.find(x=>x.e===e.target);if(!o||fase!=='acak'||o.taruh)return;e.preventDefault();tangkap(meja,e);pegang.set(e.pointerId,o);o.e.classList.add('dipegang')});
    meja.addEventListener('pointermove',e=>{const o=pegang.get(e.pointerId);if(!o)return;const u=ukur();o.x=Math.max(0,Math.min(1,(e.clientX-u.b.left-u.s/2)/(u.b.width-u.s)));o.yPx=e.clientY-u.b.top-u.s/2;o.e.style.transform=`translate(${o.x*(u.b.width-u.s)}px,${o.yPx}px)`});
    const lepas=e=>{const o=pegang.get(e.pointerId);if(!o)return;pegang.delete(e.pointerId);o.e.classList.remove('dipegang');const u=ukur(),kol=Math.floor((e.clientX-u.b.left)/u.cw);
      if(e.clientY-u.b.top>u.b.height*.45&&kol===o.i){o.taruh=true;A.play('place');if(benda.every(x=>x.taruh))setFase('rapi');else ucap(`Pas! ${jenis[o.i].nama} masuk kolomnya.`)}
      else{if(e.clientY-u.b.top>u.b.height*.45){A.play('bad');ucap(`Itu ${jenis[o.i].nama}, bukan ${jenis[kol]?.nama||'kolom itu'}. Coba lagi!`)}o.y=Math.min(1,Math.max(0,(o.yPx||0)/(u.b.height*.42-u.s)))}
      atur()};
    meja.addEventListener('pointerup',lepas);meja.addEventListener('pointercancel',lepas);
    /* susunan rapi juga dihitung pada tumpukan yang sudah ditaruh saat masih acak */
    const ro=new ResizeObserver(atur);ro.observe(meja);bersih.push(()=>ro.disconnect());
    panel().innerHTML=kartu('Dari benda jadi batang','<p class="kalimat">Diagram batang hanyalah <b>tumpukan benda</b> yang dirapikan. Satu kotak = satu buah.</p><div class="chips rapat"><button type="button" class="chip" data-fase="acak">1. Berserakan</button><button type="button" class="chip" data-fase="rapi">2. Rapikan</button><button type="button" class="chip" data-fase="diagram">3. Jadi diagram</button></div><p class="aturan">Seret tiap buah ke kolomnya. Semua jari boleh ikut menyeret bersamaan!</p><button type="button" class="small-btn" data-baru>Buah baru</button>')
      +kartu('Tantangan','<div id="kuis"></div>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{A.play('tap');if(b.dataset.fase){if(b.dataset.fase==='acak')benda.forEach(o=>o.taruh=false);setFase(b.dataset.fase)}else if(b.dataset.baru!==undefined)buka(tab)});
    kuis($('kuis'),n=>DT.soalData(seed+7,n,1,d,'batang',KBUAH),{gambar:false});
    papan('Buah di Meja',`${DT.jumlah(nilai)} buah`);setFase('acak')}

  /* ---------- 2. TURUS: data datang satu per satu ---------- */
  function turus(){const r=acakR(),jenis=DT.acak(r,BUAH).slice(0,4),NAMA=['Rina','Dika','Siti','Bayu','Nisa','Rudi','Ayu','Fajar','Tono','Lia','Eka','Dewi','Andi','Rara','Joni','Mega','Sari','Budi','Putri','Gilang'];
    const nilai=DT.acak(r,[2,3,4,5,6,7]).slice(0,4),antre=DT.acak(r,jenis.flatMap((j,i)=>Array(nilai[i]).fill(i))).map((i,k)=>({i,nama:NAMA[k%NAMA.length]})),isi=jenis.map(()=>0);let pos=0,auto=null;
    const d=()=>DT.lengkapi({k:'lab',judul:'Buah Kesukaan',kat:'Buah',satuan:'siswa',ikon:'🙂',label:jenis.map(j=>j.nama),nilai:isi.slice(),step:1,unit:1,kelip:1});
    const st=panggung();st.innerHTML='<div class="turus-lab"><div class="turus-kartu" aria-live="polite"></div><div class="tiga"><figure><figcaption>Turus</figcaption><div data-v="turus"></div></figure><figure><figcaption>Tabel</figcaption><div data-v="tabel"></div></figure><figure><figcaption>Diagram batang</figcaption><div data-v="batang"></div></figure></div></div>';
    const gambar=()=>{const x=d();x.step=1;x.ytop=8;st.querySelector('[data-v=turus]').innerHTML=DT.svgTurus(x,{kecil:true});st.querySelector('[data-v=tabel]').innerHTML=DT.svgTabel(x,{kecil:true});st.querySelector('[data-v=batang]').innerHTML=DT.svgBatang(x,{kecil:true});
      const k=st.querySelector('.turus-kartu');if(pos<antre.length){const a=antre[pos];k.innerHTML=`<small>Data ke-${pos+1} dari ${antre.length}</small><b>${a.nama} suka <span>${jenis[a.i].ikon} ${jenis[a.i].nama}</span></b>`}else k.innerHTML=`<small>Selesai: ${antre.length} data</small><b>Turus, tabel, dan batang berisi data yang sama!</b>`};
    const masuk=i=>{if(pos>=antre.length)return;if(antre[pos].i!==i){A.play('bad');ucap(`${antre[pos].nama} suka ${jenis[antre[pos].i].nama}, bukan ${jenis[i].nama}. Baca lagi kartunya!`);st.querySelector('.turus-kartu').classList.remove('goyang');void st.offsetWidth;st.querySelector('.turus-kartu').classList.add('goyang');return}
      isi[i]++;pos++;A.play('place');const v=isi[i];ucap(v%5===0?`Garis ke-5 untuk ${jenis[i].nama} dibuat miring: satu kelompok = 5!`:`${jenis[i].nama}: tambah satu garis turus. Sekarang ${v}.`);gambar();
      if(pos>=antre.length){A.play('good');clearInterval(auto);auto=null;tombolAuto();$('kuisTunggu').hidden=true;kuis($('kuisTurus'),n=>DT.soalData(seed+3,n,1,d(),n%2?'turus':'tabel',{...KBUAH,judul:'Buah Kesukaan',satuan:'siswa',f:x=>`banyak siswa yang suka ${x}`,f2:(a,b)=>`banyak siswa yang suka ${a} dan ${b}`,semua:()=>'siswa yang ditanya',syarat:(op,b)=>`buah yang disukai ${op} ${b} siswa`}))}};
    const tombolAuto=()=>{const b=panel().querySelector('[data-auto]');if(b)b.textContent=auto?'Berhenti ⏸':'Isi otomatis ▶'};
    panel().innerHTML=kartu('Ketuk jenisnya',`<p class="kalimat">Baca kartu di atas, lalu ketuk buahnya. Tiap ketukan = <b>1 garis turus</b>. Garis ke-5 dibuat miring.</p><div class="pilih-jenis">${jenis.map((j,i)=>`<button type="button" class="chunky jenis-btn" data-j="${i}" style="--w:${W[i]}"><span>${j.ikon}</span>${j.nama}</button>`).join('')}</div><div class="row"><button type="button" class="small-btn" data-auto>Isi otomatis ▶</button><button type="button" class="small-btn" data-baru>Data baru</button></div><p class="aturan"><svg class="turus-ikon" viewBox="-6 -2 40 30" aria-hidden="true">${DT.turusSvg(5,0,0)}</svg> = 4 garis tegak + 1 garis miring = <b>5</b>. Hitung per lima supaya cepat.</p>`)+kartu('Tantangan','<div id="kuisTurus" hidden></div><p class="hint" id="kuisTunggu">Selesaikan dulu semua datanya.</p>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{if(b.dataset.j!==undefined)masuk(+b.dataset.j);else if(b.dataset.baru!==undefined)buka(tab);else if(b.dataset.auto!==undefined){if(auto){clearInterval(auto);auto=null}else auto=setInterval(()=>masuk(antre[pos]?.i),motion?650:200);tombolAuto()}});
    bersih.push(()=>clearInterval(auto));papan('Buah Kesukaan','Survei kelas');gambar();ucap('Baca kartunya, lalu ketuk buah yang disukai.')}

  /* ---------- 3. BEDAH PIKTOGRAM ---------- */
  function pikto(unit=4){const r=acakR(),label=DT.acak(r,['Rina','Dika','Siti','Bayu','Nisa','Rudi']).slice(0,4),kelip=unit%2?unit:unit/2,nilai=DT.acak(r,Array.from({length:Math.floor(unit*6/kelip)},(_,k)=>(k+1)*kelip)).slice(0,4);
    const d=DT.lengkapi({k:'buku',judul:'Buku yang Dibaca',kat:'Nama',satuan:'buku',ikon:'📚',label,nilai,unit,kelip,step:DT.skalaRapi(Math.max(...nilai))});
    const st=panggung();st.innerHTML='<div class="pikto-lab"></div>';const host=st.querySelector('.pikto-lab');let P=DA.papanPikto(host,d);const buka=nilai.map(()=>new Set());
    const segarBaris=i=>{const row=P.rows[i];P.atas.querySelectorAll(`[data-baris="${i}"]`).forEach(e=>e.remove());let s=0;
      row.ikon.forEach((ik,k)=>{if(!buka[i].has(k))return;s+=ik.nilai;const g=DA.lencana(P,ik,row.y+P.rowH/2,angka(ik.nilai),ik.nilai<unit?'#9fdcff':'#ffc93c');g.dataset.baris=i});
      if(buka[i].size===row.ikon.length){const g=DA.el('g',{'data-baris':i},P.atas);DA.el('rect',{x:row.ujung,y:row.y+9,width:68,height:32,rx:16,fill:'#fff',stroke:'#e8323c','stroke-width':3},g);DA.txt(g,row.ujung+34,row.y+31,'= '+angka(s),{size:16})}
      row.ikon.forEach((ik,k)=>ik.g.style.opacity=buka[i].has(k)?.2:1)};
    host.addEventListener('pointerup',e=>{const g=e.target.closest('.da-ikon');if(!g)return;const i=+g.dataset.row,k=+g.dataset.k,ik=P.rows[i].ikon[k];
      buka[i].has(k)?buka[i].delete(k):buka[i].add(k);A.play('tap');segarBaris(i);
      ucap(ik.nilai<unit?`Setengah ikon = setengah dari ${angka(unit)} = ${angka(ik.nilai)} buku.`:`Satu ikon = ${angka(unit)} buku. Lihat keterangannya!`)});
    panel().innerHTML=kartu('Skala ikon',`<p class="kalimat">Satu ikon tidak selalu bernilai 1! Lihat <b>keterangan</b> di bawah piktogram.</p><div class="chips rapat">${[1,2,4,5,10].map(u=>`<button type="button" class="chip" data-unit="${u}" aria-pressed="${u===unit}">1 ikon = ${u}</button>`).join('')}</div><p class="aturan">Ketuk ikon untuk <b>membedahnya</b>. Setengah ikon bernilai setengahnya.</p><div class="row"><button type="button" class="small-btn" data-semua>Bedah semua baris ▶</button><button type="button" class="small-btn" data-tutup>Tutup semua</button></div>`)+kartu('Tantangan','<div id="kuis"></div>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),async b=>{A.play('tap');if(b.dataset.unit){berhenti();pikto(+b.dataset.unit);return}
      if(b.dataset.tutup!==undefined){buka.forEach(s=>s.clear());P=DA.papanPikto(host,d);return}
      if(b.dataset.semua!==undefined){anim?.stop();const tok={batal:false,cepat:!motion};anim={stop(){tok.batal=true}};
        try{for(let i=0;i<nilai.length;i++){P=DA.papanPikto(host,d);await DA.OPS.pikto(P,tok,{i},t=>ucap(t))}P=DA.papanPikto(host,d);P.normal();buka.forEach(s=>s.clear())}catch(_){}}});
    kuis($('kuis'),n=>DT.soalData(seed+11,n,2,d,'piktogram'),{gambar:false});papan('Buku yang Dibaca',`1 ikon = ${unit} buku`);ucap('Ketuk ikon bukunya. Berapa nilai satu ikon?')}

  /* ---------- 4. GARIS BANTU & SKALA ---------- */
  function garis(besar=true,step){const r=acakR(),K=DT.cariK('perpus'),n=5,label=K.label.slice(0,n),kelip=besar?5:1,nilai=DT.acak(r,Array.from({length:besar?9:10},(_,k)=>(k+1)*kelip)).slice(0,n);
    const pilihan=besar?[5,10,25]:[1,2,5];step=step||pilihan[1];
    const d=DT.lengkapi({k:'perpus',judul:K.judul,kat:K.kat,satuan:'siswa',ikon:K.ikon,label,nilai,step,unit:step,kelip});d.ytop=besar?50:10;
    const st=panggung();st.innerHTML='<div class="garis-lab"></div>';const host=st.querySelector('.garis-lab');let P;
    const gambar=()=>{P=DA.papan(host,d);const g=P.g,svg=P.svg,pen=DA.el('g',{class:'penggaris'},svg);
      DA.el('rect',{x:g.L,y:-14,width:g.w,height:28,fill:'rgba(255,201,60,.22)',stroke:'none'},pen);DA.el('line',{x1:g.L-4,x2:g.L+g.w,y1:0,y2:0,stroke:'#c2185b','stroke-width':4},pen);
      const lb=DA.el('g',{},pen);DA.el('rect',{x:g.L+g.w-104,y:-34,width:104,height:28,rx:14,fill:'#fff',stroke:'#c2185b','stroke-width':3},lb);const t=DA.txt(lb,g.L+g.w-52,-14,'',{size:16});
      let yv=d.ytop*.6;const taruh=v=>{yv=Math.max(0,Math.min(d.ytop,v));pen.setAttribute('transform',`translate(0 ${g.y(yv)})`);t.textContent='≈ '+angka(Math.round(yv*2/(kelip||1))*(kelip||1)/2)};taruh(yv);
      const titik=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};const seret=new Set();
      svg.style.touchAction='none';
      svg.addEventListener('pointerdown',e=>{const bar=e.target.closest('.da-bar');if(bar){bacaBatang(+bar.dataset.i);return}seret.add(e.pointerId);tangkap(svg,e);const p=titik(e);taruh((g.y(0)-p.y)/g.h*g.ytop)});
      svg.addEventListener('pointermove',e=>{if(!seret.has(e.pointerId))return;const p=titik(e),v=(g.y(0)-p.y)/g.h*g.ytop;taruh(v);
        const bawah=Math.floor(v/step)*step,atas=bawah+step,tengah=Math.abs(v-(bawah+step/2))<step*.12;$('bacaan').innerHTML=Math.abs(v-Math.round(v/step)*step)<step*.12?`Penggaris tepat di garis <b>${angka(Math.round(v/step)*step)}</b>.`:tengah?`Di tengah antara ${angka(bawah)} dan ${angka(atas)}, jadi <b>${angka(bawah+step/2)}</b>.`:`Di antara ${angka(bawah)} dan ${angka(atas)}.`});
      const lepas=e=>seret.delete(e.pointerId);svg.addEventListener('pointerup',lepas);svg.addEventListener('pointercancel',lepas)};
    const bacaBatang=async i=>{anim?.stop();gambar();const tok={batal:false,cepat:!motion};anim={stop(){tok.batal=true}};A.play('tap');try{await DA.OPS.baca(P,tok,{i},t=>ucap(t));}catch(_){}};
    panel().innerHTML=kartu('Skala sumbu',`<p class="kalimat">Tiap garis mendatar tidak selalu naik 1. Lihat angka di <b>sumbu tegak</b>: naiknya berapa?</p><div class="chips rapat">${pilihan.map(s=>`<button type="button" class="chip" data-step="${s}" aria-pressed="${s===step}">Tiap garis = ${s}</button>`).join('')}</div><div class="chips rapat"><button type="button" class="chip" data-besar="0" aria-pressed="${!besar}">Angka kecil</button><button type="button" class="chip" data-besar="1" aria-pressed="${besar}">Angka besar</button></div><p class="aturan"><b>Ketuk batang</b> untuk menarik garis bantu ke sumbu. <b>Seret di papan</b> untuk menggeser penggaris merah muda.</p><p class="bacaan" id="bacaan">Seret penggarisnya ke ujung batang.</p>`)+kartu('Tantangan','<div id="kuis"></div>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{A.play('tap');if(b.dataset.step){berhenti();garis(besar,+b.dataset.step)}else if(b.dataset.besar!==undefined){berhenti();garis(b.dataset.besar==='1')}});
    gambar();kuis($('kuis'),k=>DT.soalData(seed+19,k,besar?3:1,d,'batang'),{gambar:false});papan(K.judul,`Tiap garis = ${step} siswa`);ucap('Ketuk satu batang. Aku tarik garis bantunya ke sumbu!')}

  /* ---------- 5. POTONG & GABUNG ---------- */
  function potong(){const r=acakR(),dasar=ri(r,2,4),K=DT.cariK('buku'),label=DT.acak(r,K.label).slice(0,5),nilai=DT.acak(r,[1,2,3,4,5,6].map(k=>k*dasar)).slice(0,5);
    const d=DT.lengkapi({k:'buku',judul:K.judul,kat:K.kat,satuan:'buku',ikon:K.ikon,label,nilai,step:dasar,unit:dasar,kelip:dasar});let pilih=[],batas=Math.round(d.ytop/2/dasar)*dasar;
    const st=panggung();st.innerHTML='<div class="potong-lab"></div>';const host=st.querySelector('.potong-lab');
    const gambar=()=>{anim?.stop();anim=null;const P=DA.papan(host,d);P.bars.forEach(b=>{b.g.classList.add('bisa-pilih');b.g.classList.toggle('dipilih',pilih.includes(b.i))});
      P.svg.addEventListener('pointerup',e=>{const bar=e.target.closest('.da-bar');if(!bar)return;const i=+bar.dataset.i;pilih=pilih.includes(i)?pilih.filter(k=>k!==i):[...pilih,i];A.play('tap');gambar();info()})};
    const info=()=>{const nm=pilih.map(i=>d.label[i]);$('dipilih').innerHTML=nm.length?`Dipilih: <b>${nm.join(', ')}</b>`:'Ketuk batang untuk memilih.';
      panel().querySelector('[data-op=selisih]').disabled=pilih.length!==2;panel().querySelector('[data-op=kali]').disabled=pilih.length!==2;panel().querySelector('[data-op=jumlah]').disabled=pilih.length<2};
    const jalankan=a=>{anim?.stop();anim=DA.putar(host,d,a,{cepat:!motion,selesai:()=>ucap('Ketuk Kembali memilih untuk mencoba pasangan lain.')});$('kembali').hidden=false};
    panel().innerHTML=kartu('Bongkar diagramnya',`<p class="kalimat">Pilih batang, lalu <b>potong</b>, <b>tumpuk</b>, atau <b>gandakan</b>.</p><p class="bacaan" id="dipilih"></p>
      <div class="op-grid"><button type="button" class="chunky op-btn" data-op="selisih"><b>✂️ Selisih</b><small>potong bagian yang lebih</small></button><button type="button" class="chunky op-btn" data-op="jumlah"><b>🧱 Jumlah</b><small>tumpuk jadi menara</small></button><button type="button" class="chunky op-btn" data-op="kali"><b>✖️ Berapa kali?</b><small>gandakan batang pendek</small></button><button type="button" class="chunky op-btn" data-op="syarat"><b>📏 Garis batas</b><small>siapa yang lebih dari ${'<span id="batasNilai">'+batas+'</span>'}?</small></button></div>
      <div class="row"><button type="button" class="small-btn" data-batas="-1">Batas −</button><button type="button" class="small-btn" data-batas="1">Batas +</button><button type="button" class="small-btn" id="kembali" data-kembali hidden>Kembali memilih</button><button type="button" class="small-btn" data-baru>Data baru</button></div>`)+kartu('Tantangan','<div id="kuis"></div>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{const x=b.dataset;A.play('tap');
      if(x.baru!==undefined){berhenti();potong();return}if(x.kembali!==undefined){$('kembali').hidden=true;gambar();info();return}
      if(x.batas){batas=Math.max(dasar,Math.min(d.ytop-dasar,batas+(+x.batas)*dasar));$('batasNilai').textContent=batas;return}
      const[a,c]=pilih;if(x.op==='selisih')jalankan({op:'selisih',i:a,j:c});else if(x.op==='jumlah')jalankan({op:'jumlah',idx:pilih.slice().sort((p,q)=>p-q)});else if(x.op==='syarat')jalankan({op:'syarat',b:batas,cmp:'>'});
      else if(x.op==='kali'){const[bi,ki]=d.nilai[a]>=d.nilai[c]?[a,c]:[c,a];if(d.nilai[bi]%d.nilai[ki]){ucap(`${angka(d.nilai[bi])} tidak tepat ${angka(d.nilai[ki])} kali berapa pun. Coba pasangan lain, misalnya yang satu dua kali yang lain.`);A.play('bad')}else jalankan({op:'kali',i:bi,j:ki,k:d.nilai[bi]/d.nilai[ki]})}});
    gambar();info();kuis($('kuis'),k=>DT.soalData(seed+23,k,3,d,'batang'),{gambar:false});papan(K.judul,'Pilih batangnya');ucap('Ketuk dua batang, lalu pilih Selisih, Jumlah, atau Berapa kali.')}

  /* ---------- 6. UBAH SAJIAN: satu data, empat tampilan ---------- */
  function sajian(lihat='tabel'){const r=acakR(),K=DT.cariK('kantin'),label=DT.acak(r,K.label).slice(0,4),d=DT.lengkapi({k:'kantin',judul:K.judul,kat:K.kat,satuan:'potong',ikon:K.ikon,label,nilai:DT.acak(r,[3,5,6,8,9,11,12,14]).slice(0,4),step:2,unit:2,kelip:1});d.ytop=16;
    const st=panggung();st.innerHTML=`<div class="sajian-lab"><div class="sajian-editor"></div><div class="sajian-lain"><div class="chips rapat">${['tabel','piktogram','turus','lingkaran'].map(s=>`<button type="button" class="chip" data-lihat="${s}" aria-pressed="${s===lihat}">${DT.besar(DT.NAMA_SAJIAN[s])}</button>`).join('')}</div><div class="sajian-gambar"></div></div></div>`;
    let ed;const segar=()=>{const x={...d,nilai:ed.nilai()};st.querySelector('.sajian-gambar').innerHTML=DT.gambar(x,lihat,{kecil:true,tampil:'banyak',legendaPersen:true});
      panel().querySelectorAll('[data-baris]').forEach(e=>e.querySelector('b').textContent=x.nilai[+e.dataset.baris])};
    ed=DA.editor(st.querySelector('.sajian-editor'),d,{awal:d.nilai.slice(),snap:1,tanpaJudul:true,ubah:(v,i)=>{A.play('tick');segar();ucap(`${d.label[i]} sekarang ${v[i]}. Lihat, ${DT.NAMA_SAJIAN[lihat]}nya ikut berubah!`)}});
    ketuk(st.querySelector('.sajian-lain'),b=>{lihat=b.dataset.lihat;st.querySelectorAll('[data-lihat]').forEach(c=>c.setAttribute('aria-pressed',c===b));A.play('tap');segar()});
    panel().innerHTML=kartu('Satu data, banyak wajah',`<p class="kalimat">Seret batang atau ubah angka tabel. <b>Datanya sama</b>, hanya cara menggambarnya yang berbeda.</p><div class="ubah-tabel">${label.map((l,i)=>`<div class="ubah-baris" data-baris="${i}"><span>${esc(l)}</span><button type="button" class="small-btn" data-ubah="-1" data-i="${i}" aria-label="Kurangi ${esc(l)}">−</button><b>${d.nilai[i]}</b><button type="button" class="small-btn" data-ubah="1" data-i="${i}" aria-label="Tambah ${esc(l)}">+</button></div>`).join('')}</div><div class="row"><button type="button" class="small-btn" data-putar>Tabel → batang ▶</button><button type="button" class="small-btn" data-baru>Data baru</button></div>`)
      +kartu('Kapan pakai yang mana?','<ul class="jelas"><li><b>Tabel</b>: angka tepat, mudah dicari.</li><li><b>Diagram batang</b>: cepat melihat mana yang paling banyak.</li><li><b>Piktogram</b>: menarik, tapi cek nilai satu ikon.</li><li><b>Turus</b>: enak untuk mencatat sambil menghitung.</li><li><b>Diagram lingkaran</b>: melihat bagian dari keseluruhan (persen).</li></ul>');
    ketuk(panel().querySelector('.lab-kartu'),async b=>{A.play('tap');if(b.dataset.baru!==undefined){berhenti();sajian(lihat);return}
      if(b.dataset.ubah){const i=+b.dataset.i,v=ed.nilai();v[i]=Math.max(0,Math.min(16,v[i]+(+b.dataset.ubah)));ed.set(v);segar();return}
      if(b.dataset.putar!==undefined){const host=st.querySelector('.sajian-editor'),x={...d,nilai:ed.nilai()};anim?.stop();anim=DA.putar(host,x,{op:'ubah'},{cepat:!motion,selesai:()=>{const v=x.nilai;ed=DA.editor(host,d,{awal:v,snap:1,tanpaJudul:true,ubah:(n,i)=>{A.play('tick');segar();ucap(`${d.label[i]} sekarang ${n[i]}.`)}});segar()}})}});
    segar();papan(K.judul,'Satu data, empat tampilan');ucap('Seret ujung batang. Tabel, piktogram, dan turusnya ikut berubah!')}

  /* ---------- 7. SURVEI KELAS: data dari murid sendiri ---------- */
  const TOPIK=[{judul:'Buah Favorit',pilih:[['🍎','Apel'],['🍌','Pisang'],['🍊','Jeruk'],['🍉','Semangka']]},{judul:'Hobi Kami',pilih:[['⚽','Sepak bola'],['📖','Membaca'],['🎨','Menggambar'],['🎤','Bernyanyi']]},
    {judul:'Olahraga Favorit',pilih:[['🏸','Bulu tangkis'],['⚽','Sepak bola'],['🏃','Lari'],['🏊','Renang']]},{judul:'Warna Favorit',pilih:[['🔴','Merah'],['🔵','Biru'],['🟢','Hijau'],['🟡','Kuning']]},
    {judul:'Hewan Peliharaan',pilih:[['🐱','Kucing'],['🐶','Anjing'],['🐟','Ikan'],['🐦','Burung']]}];
  function survei(t=0){const T=TOPIK[t],suara=T.pilih.map(()=>0),riwayat=[];
    const data=()=>DT.lengkapi({k:'survei',judul:'Survei: '+T.judul,kat:'Pilihan',satuan:'siswa',ikon:'🙋',label:T.pilih.map(p=>p[1]),nilai:suara.slice(),step:0,unit:0,kelip:1});
    const st=panggung();st.innerHTML=`<div class="survei-lab"><div class="survei-tombol">${T.pilih.map((p,i)=>`<button type="button" class="chunky survei-btn" data-v="${i}" style="--w:${W[i]}"><span>${p[0]}</span><b>${esc(p[1])}</b><i>0</i></button>`).join('')}</div><div class="survei-hasil"><div data-v="batang"></div><div data-v="tabel"></div></div></div>`;
    const gambar=()=>{const d=data();d.step=DT.skalaRapi(Math.max(4,...suara));d.ytop=Math.max(d.step*4,Math.ceil(Math.max(...suara,1)/d.step)*d.step+d.step);
      st.querySelector('[data-v=batang]').innerHTML=DT.svgBatang(d);st.querySelector('[data-v=tabel]').innerHTML=DT.svgTurus({...d,nilai:suara.map(v=>Math.min(v,40))},{kecil:true});
      st.querySelectorAll('.survei-btn i').forEach((e,i)=>e.textContent=suara[i]);$('jumlahSuara').textContent=DT.jumlah(suara);$('buatSoal').disabled=DT.jumlah(suara)<5||suara.filter(Boolean).length<2};
    /* pointerdown: tiap jari langsung dihitung, jadi banyak murid bisa memilih bersamaan */
    st.querySelector('.survei-tombol').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-v]');if(!b)return;e.preventDefault();const i=+b.dataset.v;suara[i]++;riwayat.push(i);A.play('place');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');gambar();ucap(`${T.pilih[i][1]} dapat satu suara. Sekarang ${suara[i]}!`)});
    st.querySelector('.survei-tombol').addEventListener('keydown',e=>{const b=e.target.closest('[data-v]');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))}});
    panel().innerHTML=kartu('Survei kelas',`<div class="chips rapat">${TOPIK.map((x,i)=>`<button type="button" class="chip" data-topik="${i}" aria-pressed="${i===t}">${esc(x.judul)}</button>`).join('')}</div><p class="kalimat">Setiap murid maju dan <b>mengetuk pilihannya satu kali</b>. Beberapa murid boleh mengetuk bersamaan.</p><p class="bacaan">Jumlah suara: <b id="jumlahSuara">0</b></p><div class="row"><button type="button" class="small-btn" data-batal>Batalkan suara terakhir</button><button type="button" class="small-btn" data-ulang>Mulai ulang</button></div><button type="button" class="chunky lompat-btn" id="buatSoal" data-soal disabled>Buat soal dari data kita</button>`)+kartu('Soal dari data kelas','<div id="kuis"><p class="hint">Kumpulkan paling sedikit 5 suara dulu.</p></div>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{const x=b.dataset;A.play('tap');
      if(x.topik){berhenti();survei(+x.topik)}else if(x.ulang!==undefined){berhenti();survei(t)}else if(x.batal!==undefined){const i=riwayat.pop();if(i!==undefined){suara[i]--;gambar()}}
      else if(x.soal!==undefined){const d=data(),K=DT.konteksSurvei(d.judul,'Pilihan','siswa');d.step=DT.skalaRapi(Math.max(...suara));d.ytop=Math.ceil(Math.max(...suara)/d.step)*d.step+d.step;
        kuis($('kuis'),n=>DT.soalData(seed+29,n,DT.jumlah(suara)>20?2:1,d,'batang',K));ucap('Ini soal tentang kelas kita sendiri!')}});
    gambar();papan('Survei: '+T.judul,'Data dari kelas kita');ucap('Ayo memilih! Ketuk satu pilihan saja, ya.')}

  /* ---------- 8. POTONG PIZZA: pizza berpotong = diagram lingkaran ---------- */
  function lingkaran(n=10){const K=DT.cariK('pizza'),r=acakR(),label=DT.acak(r,K.label).slice(0,4),ikon=label.map(l=>DT.IKON_DAPUR[l]);let h=label.map(()=>0);
    const data=()=>DT.lengkapi({k:'pizza',judul:'Pesanan Pizza',kat:'Topping',satuan:'pesanan',ikon:'🍕',label,nilai:h.slice(),total:n,step:1,unit:1,kelip:1});
    const st=panggung();st.innerHTML='<div class="pie-lab"><div class="pie-pizza"></div><div class="pie-sisi"><p class="pie-judul">Pita 100%</p><div class="pie-pita"></div><div class="pie-tabel"></div></div></div>';
    const pct=c=>angka(Math.round(c*1000/n)/10)+'%';
    const segar=()=>{const isi=DT.jumlah(h);
      st.querySelector('.pie-pita').innerHTML=h.map((c,i)=>c?`<span style="width:${c/n*100}%;background:${W[i]}">${c/n>=.1?pct(c):''}</span>`:'').join('')+(isi<n?`<span class="kosong" style="width:${(n-isi)/n*100}%"></span>`:'');
      st.querySelector('.pie-tabel').innerHTML=`<table><thead><tr><th>Topping</th><th>Potong</th><th>Pecahan</th><th>Persen</th></tr></thead><tbody>${label.map((l,i)=>`<tr><td>${ikon[i]} ${esc(l)}</td><td>${h[i]}</td><td>${h[i]}/${n}</td><td>${pct(h[i])}</td></tr>`).join('')}<tr class="jml"><td>Jumlah</td><td>${isi}</td><td>${isi}/${n}</td><td>${pct(isi)}</td></tr></tbody></table>`;
      $('soalPie').disabled=!(isi===n&&h.every(c=>c>0))};
    const pz=DA.pizza(st.querySelector('.pie-pizza'),{n,label,ikon,ubah:(baru,k,v)=>{h=baru;segar();if(k!==undefined){A.play('place');ucap(v<0?'Potongnya dikosongkan lagi.':`1 potong ${label[v]} = 1/${n} pizza = ${angka(100/n)}%. Sekarang ${label[v]} ${h[v]} potong = ${pct(h[v])}.`)}}});
    panel().innerHTML=kartu('Pizza = diagram lingkaran',`<p class="kalimat">Satu pizza utuh = <b>100%</b>. Pizza ini ${n} potong, jadi <b>1 potong = 1/${n} = ${angka(100/n)}%</b>.</p>
      <div class="chips rapat">${[10,20].map(k=>`<button type="button" class="chip" data-n="${k}" aria-pressed="${k===n}">${k} potong</button>`).join('')}</div>
      <div class="pilih-jenis">${label.map((l,i)=>`<button type="button" class="chunky jenis-btn" data-top="${i}" style="--w:${W[i]}" aria-pressed="${i===0}"><span>${ikon[i]}</span>${esc(l)}</button>`).join('')}</div>
      <p class="aturan">Ketuk topping, lalu ketuk atau seret di potong pizza. Ketuk lagi potong yang sama untuk menghapus. Banyak jari boleh mewarnai bersamaan.</p>
      <div class="row"><button type="button" class="small-btn" data-rapikan>Rapikan jadi diagram lingkaran</button><button type="button" class="small-btn" data-acak>Isi acak</button><button type="button" class="small-btn" data-kosong>Kosongkan</button></div>
      <button type="button" class="chunky lompat-btn" id="soalPie" data-soal disabled>Buat soal dari pizzaku</button>`)+kartu('Tantangan','<div id="kuis"><p class="hint">Warnai semua potong dulu, tiap topping paling sedikit 1 potong.</p></div>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{const x=b.dataset;A.play('tap');
      if(x.n){berhenti();lingkaran(+x.n);return}
      if(x.top!==undefined){pz.pakai(+x.top);panel().querySelectorAll('[data-top]').forEach(e=>e.setAttribute('aria-pressed',e===b));ucap(`Topping ${label[+x.top]} siap. Ketuk potong pizzanya!`);return}
      if(x.rapikan!==undefined){pz.rapikan();ucap('Potong yang sama dijajarkan berdampingan. Inilah diagram lingkaran!');return}
      if(x.kosong!==undefined){pz.set(Array(n).fill(-1));return}
      if(x.acak!==undefined){let c;do{c=Array.from({length:n},()=>Math.floor(Math.random()*label.length))}while(label.some((_,i)=>!c.includes(i)));pz.set(c);ucap('Pizzanya terisi acak. Coba rapikan jadi diagram lingkaran!');return}
      if(x.soal!==undefined){kuis($('kuis'),k=>DT.soalData(seed+31,k,2,data(),'lingkaran',K));ucap('Ini soal tentang pizzamu sendiri!')}});
    segar();papan('Pesanan Pizza',`${n} potong = 100%`);ucap('Pilih topping, lalu warnai potong pizzanya.')}

  /* ---------- 9. DIAGRAM GARIS: seret titiknya ---------- */
  function dgaris(){const r=acakR(),K=DT.cariK(DT.acak(r,['perpus','eskrim'])[0]),label=K.label.slice(0,6),d=DT.lengkapi({k:K.id,judul:K.judul,kat:K.kat,satuan:K.satuan,ikon:K.ikon,label,nilai:label.map(()=>ri(r,1,9)*5),step:5,unit:5,kelip:5});d.ytop=50;
    const st=panggung();st.innerHTML='<div class="garis2-lab"></div>';const host=st.querySelector('.garis2-lab');let ed,batang=false;
    const ruas=v=>v.slice(1).map((x,k)=>({k,dl:x-v[k]}));
    const info=v=>{$('ruas').innerHTML=ruas(v).map(({k,dl})=>`<li class="${dl>0?'naik':dl<0?'turun':''}">${esc(label[k])} → ${esc(label[k+1])}: <b>${dl>0?'naik '+dl:dl<0?'turun '+(-dl):'tetap'}</b></li>`).join('')};
    const buat=v=>{ed=DA.editor(host,d,{awal:v,snap:5,garis:true,ubah:(n,i)=>{A.play('tick');info(n);const dl=i>0?n[i]-n[i-1]:null;ucap(`${label[i]} sekarang ${n[i]}.${dl===null?'':dl>0?` Dari ${label[i-1]} garisnya naik ${dl}.`:dl<0?` Dari ${label[i-1]} garisnya turun ${-dl}.`:` Sama dengan ${label[i-1]}, garisnya mendatar.`}`)}});ed.P.svg.classList.toggle('lihat-batang',batang);info(v)};
    panel().innerHTML=kartu('Titik yang disambung',`<p class="kalimat">Diagram garis = <b>ujung batang</b> yang disambung garis. Cocok untuk data yang <b>berubah dari waktu ke waktu</b>.</p><p class="aturan">Seret titiknya naik atau turun. Banyak jari boleh menyeret titik yang berbeda.</p>
      <div class="row"><button type="button" class="small-btn" data-batang aria-pressed="false">Lihat batangnya</button><button type="button" class="small-btn" data-bongkar>Bongkar naik-turun ▶</button><button type="button" class="small-btn" data-baru>Data baru</button></div><ul class="ruas" id="ruas"></ul>`)+kartu('Tantangan','<div id="kuis"></div>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{const x=b.dataset;A.play('tap');
      if(x.baru!==undefined){berhenti();dgaris();return}
      if(x.batang!==undefined){batang=!batang;b.setAttribute('aria-pressed',batang);ed?.P.svg.classList.toggle('lihat-batang',batang);ucap(batang?'Lihat: tiap titik ada di ujung batangnya.':'Batangnya disembunyikan lagi.');return}
      if(x.bongkar!==undefined){const v=ed.nilai(),rs=ruas(v),best=rs.reduce((a,c)=>Math.abs(c.dl)>Math.abs(a.dl)?c:a,rs[0]);anim?.stop();
        anim=DA.putar(host,{...d,nilai:v},{op:'gSegmen',i:best.k,langkah:['Hitung naik-turun tiap ruas garis: hijau naik, merah turun.',`Perubahan paling besar: ${label[best.k]} → ${label[best.k+1]} (${best.dl>0?'naik':'turun'} ${Math.abs(best.dl)}).`]},{cepat:!motion,selesai:()=>{anim=null;buat(v)}})}});
    buat(d.nilai.slice());kuis($('kuis'),k=>DT.soalData(seed+37,k,2,{...d,nilai:ed.nilai()},'garis',K));papan(K.judul,'Seret titiknya');ucap('Seret satu titik ke atas atau ke bawah. Lihat garisnya ikut berubah!')}

  /* ---------- 10. TABEL FREKUENSI: data mentah → turus → frekuensi ---------- */
  function frekuensi(){const K=DT.cariK('ulangan'),r=acakR(),label=K.label.slice(),nilai=label.map(()=>ri(r,1,6)),mentah=DT.acak(r,label.flatMap((l,i)=>Array(nilai[i]).fill(i))),isi=label.map(()=>0),sudah=new Set();let urut=false,auto=null;
    const d=()=>{const x=DT.lengkapi({k:'ulangan',judul:K.judul,kat:'Nilai',satuan:'siswa',ikon:K.ikon,label,nilai:isi.slice(),step:1,unit:1,kelip:1});x.step=1;x.ytop=Math.max(...nilai)+1;return x};
    const st=panggung();st.innerHTML=`<div class="frek-lab"><div class="frek-mentah" aria-label="Data mentah"></div><div class="tiga dua"><figure><figcaption>Tabel frekuensi</figcaption><div data-v="frek"></div></figure><figure><figcaption>Diagram batang</figcaption><div data-v="batang"></div></figure></div></div>`;
    const mentahEl=st.querySelector('.frek-mentah');
    const tulis=()=>{const ks=mentah.map((i,k)=>k);if(urut)ks.sort((a,b)=>mentah[a]-mentah[b]||a-b);mentahEl.innerHTML=ks.map(k=>`<button type="button" class="frek-angka" data-m="${k}" ${sudah.has(k)?'disabled':''} style="--w:${W[mentah[k]%6]}">${label[mentah[k]]}</button>`).join('')};
    const gambar=()=>{const x=d();st.querySelector('[data-v=frek]').innerHTML=DT.svgFrekuensi(x,{kecil:true,turus:true});st.querySelector('[data-v=batang]').innerHTML=DT.svgBatang(x,{kecil:true})};
    const hitung=k=>{if(sudah.has(k))return;sudah.add(k);const i=mentah[k];isi[i]++;A.play('place');mentahEl.querySelector(`[data-m="${k}"]`)?.setAttribute('disabled','');gambar();
      ucap(`Nilai ${label[i]}: tambah satu turus. Frekuensi nilai ${label[i]} sekarang ${isi[i]}.`);
      if(sudah.size===mentah.length){A.play('good');clearInterval(auto);auto=null;const t=panel().querySelector('[data-auto]');if(t){t.textContent='Hitung otomatis ▶';t.disabled=true}$('kuisTunggu').hidden=true;ucap(`Selesai! Jumlah semua frekuensi = ${mentah.length} = banyak siswa.`);kuis($('kuisFrek'),n=>DT.soalData(seed+41,n,2,d(),'frekuensi',K))}};
    ketuk(mentahEl,b=>{if(b.dataset.m!==undefined)hitung(+b.dataset.m)});
    panel().innerHTML=kartu('Dari data mentah',`<p class="kalimat">Nilai ulangan <b>${mentah.length} siswa</b> masih acak. Ketuk tiap angka: turus dan frekuensinya bertambah. <b>Frekuensi</b> = berapa kali nilai itu muncul.</p><div class="row"><button type="button" class="small-btn" data-urut aria-pressed="false">Urutkan datanya</button><button type="button" class="small-btn" data-auto>Hitung otomatis ▶</button><button type="button" class="small-btn" data-baru>Data baru</button></div><p class="aturan">Banyak murid boleh mengetuk angka bersamaan. Jumlah semua frekuensi = banyak siswa.</p>`)+kartu('Tantangan','<div id="kuisFrek" hidden></div><p class="hint" id="kuisTunggu">Hitung dulu semua datanya.</p>','tanpa nilai');
    ketuk(panel().querySelector('.lab-kartu'),b=>{const x=b.dataset;A.play('tap');
      if(x.baru!==undefined){berhenti();frekuensi();return}
      if(x.urut!==undefined){urut=!urut;b.setAttribute('aria-pressed',urut);tulis();ucap(urut?'Data diurutkan: angka yang sama jadi berdampingan, mudah dihitung!':'Data acak lagi.');return}
      if(x.auto!==undefined){if(auto){clearInterval(auto);auto=null}else auto=setInterval(()=>{const k=mentah.findIndex((_,j)=>!sudah.has(j));if(k>=0)hitung(k)},motion?450:120);b.textContent=auto?'Berhenti ⏸':'Hitung otomatis ▶'}});
    bersih.push(()=>clearInterval(auto));tulis();gambar();papan(K.judul,`${mentah.length} siswa`);ucap('Ketuk angka-angkanya satu per satu.')}

  /* ---------- tab ---------- */
  const MODE={rapikan,turus,pikto:()=>pikto(),garis:()=>garis(),potong,sajian:()=>sajian(),survei:()=>survei(),lingkaran:()=>lingkaran(),dgaris,frekuensi};
  function buka(t){berhenti();tab=MODE[t]?t:'rapikan';document.body.dataset.mode=tab;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
    try{history.replaceState(null,'','#'+tab)}catch(_){}MODE[tab]()}
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{A.start();A.play('tap');buka(b.dataset.tab)}));
  $('suara').addEventListener('click',()=>{muted=!muted;suara();A.start()});
  $('fsBtn').addEventListener('click',()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen();else d.documentElement.requestFullscreen?.().catch(()=>{})});
  addEventListener('pointerdown',()=>A.start(),{once:true});
  suara();buka(location.hash.slice(1)||'rapikan');
  return{buka,get tab(){return tab}};
})();
