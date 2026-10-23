/* PENGUKURAN · Lab Tangga Satuan: belajar sendiri tanpa waktu dan tanpa nilai.
   Tab Panjang/Volume/Berat/Waktu: tangga 3D + singkatan yang bisa diketuk, ubah satuan sendiri, tantangan acak.
   Tab Alat ukur: penggaris, gelas ukur, timbangan, dan jam yang bisa digeser, lalu tantangan membaca alat. */
const UkurLab=(()=>{
  const $=id=>document.getElementById(id),A=MenaraAudio,V=MenaraScene,S3=TanggaScene;
  const TOKOH={panjang:0,volume:1,berat:2,waktu:3},LEVEL=['Pemula','Penjelajah','Ahli Ukur'];
  const ALAT=[{id:'penggaris',nama:'Penggaris',besaran:'panjang',min:10,max:150,step:1,awal:74},{id:'gelas',nama:'Gelas ukur',besaran:'volume',min:0,max:1000,step:10,awal:350},
    {id:'timbangan',nama:'Timbangan',besaran:'berat',min:0,max:2000,step:50,awal:1300},{id:'jam',nama:'Jam',besaran:'waktu',min:0,max:719,step:1,awal:8*60+25}];
  const TIPS={penggaris:'Taruh ujung benda tepat di angka 0. Garis panjang = 1 cm, garis kecil = 1 mm. 1 cm = 10 mm.',
    gelas:'Baca permukaan air yang datar, mata sejajar garis skala. Garis panjang tiap 100 ml, garis pendek 50 ml. 1 liter = 1.000 ml.',
    timbangan:'Baca angka yang ditunjuk jarum merah. Angka besar tiap 200 g, garis kecil 100 g. 1 kg = 1.000 g.',
    jam:'Jarum pendek = jam, jarum panjang = menit. Dari satu angka ke angka berikutnya = 5 menit. 1 jam = 60 menit.'};
  let tab='panjang',views={},sim=0,last=performance.now(),muted=false,sibuk=false;
  const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st={};for(const b of UK.BESARAN){const S=UK.TANGGA[b].satuan;st[b]={dari:b==='waktu'?'jam':S[0],ke:b==='waktu'?'menit':S[3],nilai:b==='waktu'?'2':'2,5',lv:1,n:0,benar:0,soal:null,seed:Math.floor(Math.random()*1e9)}}
  const alatSt={i:0,v:ALAT.map(a=>a.awal),lv:1,n:0,benar:0,soal:null,seed:Math.floor(Math.random()*1e9)};
  A.configure({music:false,fx:true,volume:80,motion});
  const suara=()=>{A.configure({fx:!muted,music:false});$('suara').textContent=muted?'Suara mati':'Suara nyala';$('suara').setAttribute('aria-pressed',!muted)};

  function ucap(teks,mood){const r=ROBOT[TOKOH[tab==='alat'?ALAT[alatSt.i].besaran:tab]];$('ucap').textContent=r.nama+': '+teks;const v=views[tab==='alat'?null:tab];if(mood&&v)v.bot.aksi(mood)}
  function papan(isi,kecil){$('papan').innerHTML=`<small>${kecil}</small>${isi}`}
  /* angka ketikan anak: "2,5", "2.5", "1.500", "1.500,25" */
  function baca(s){s=String(s).trim().replace(/\s/g,'');if(!s)return NaN;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
    return /^\d+(\.\d+)?$/.test(s)?Number(s):NaN}

  /* ---------- tab tangga ---------- */
  function panelTangga(){const b=tab,T=UK.TANGGA[b],S=UK.SINGKAT[b],s=st[b],w=b==='waktu';
    const kode=T.satuan.map((u,i)=>`<button class="kode" data-i="${i}" style="--w:${S3.WARNA[(i*(w?1.5:1))|0]}"><b>${u}</b><span>${T.kata[i]}</span>${i<T.satuan.length-1?`<i>×${w?T.faktor[i]:10}</i>`:''}</button>`).join('');
    const kalimat=T.kata.map(k=>`<b>${k.slice(0,w?2:1)}</b>${k.slice(w?2:1)}`).join(' ');
    const unit=(id)=>T.satuan.map(u=>`<button type="button" class="chip" data-${id}="${u}" aria-pressed="${s[id]===u}">${u}</button>`).join('');
    const bonus=UK.BONUS[b].map(x=>`<li>${x}</li>`).join('')+(w?`<li><b>${UK.SINGKAT.tahun.kode}</b>: ${UK.SINGKAT.tahun.kalimat}</li>`:'');
    $('panel').innerHTML=`
      <section class="lab-kartu"><h2>Singkatan ${T.nama.toLowerCase()} <small>ketuk satuannya</small></h2>
        <div class="tangga-kode ${w?'lima':''}">${kode}</div>
        <p class="kalimat">“${kalimat}”</p>
        <p class="aturan">${w?`<b>${S.kode}</b>: 1 minggu = 7 hari, 1 hari = 24 jam, 1 jam = 60 menit, 1 menit = 60 detik.`:`<b>${UK.SINGKAT.aturan.kode}</b>: ${UK.SINGKAT.aturan.kalimat}.`}</p></section>
      <section class="lab-kartu"><h2>Coba ubah sendiri</h2>
        <div class="ubah-baris"><input id="nilai" inputmode="decimal" autocomplete="off" aria-label="Angka yang diubah" value="${s.nilai}"><div class="chips rapat" role="group" aria-label="Satuan asal">${unit('dari')}</div></div>
        <div class="ubah-baris"><span class="ke">jadi</span><div class="chips rapat" role="group" aria-label="Satuan tujuan">${unit('ke')}</div></div>
        <button class="chunky go lompat-btn" id="lompatBtn">Lompat!</button>
        <ol id="langkah" class="langkah"></ol></section>
      <section class="lab-kartu"><h2>Tantangan <small>benar <b>${s.benar}</b> dari <b>${s.n}</b></small></h2>
        <div class="chips rapat">${LEVEL.map((l,i)=>`<button type="button" class="chip" data-lv="${i+1}" aria-pressed="${s.lv===i+1}">${l}</button>`).join('')}</div>
        <div id="soalBox" class="soal-box"></div></section>
      <section class="lab-kartu"><h2>Tahukah kamu?</h2><ul class="bonus">${bonus}</ul></section>`;
    tampilSoal()}
  function lompatUbah(){if(sibuk)return;const b=tab,s=st[b],x=baca($('nilai').value);s.nilai=$('nilai').value;
    if(!(x>0)||x>1e9){ucap('Tulis angkanya dulu, misalnya 2,5 atau 1.500.','bingung');A.play('bad');return}
    if(s.dari===s.ke){ucap('Pilih satuan tujuan yang berbeda, ya.','bingung');return}
    const v=views[b],T=UK.TANGGA[b],a=T.satuan.indexOf(s.dari),z=T.satuan.indexOf(s.ke),turun=z>a,n=Math.abs(z-a),ol=$('langkah');
    ol.innerHTML=`<li class="awal">${UK.angka(x)} ${s.dari}: ${turun?'turun':'naik'} ${n} anak tangga ${turun?'(dikali)':'(dibagi)'}</li>`;
    let prev=x,prevU=s.dari,nomor=0;sibuk=true;$('lompatBtn').disabled=true;papan(`${UK.angka(x)} ${s.dari}`,'Mulai');ucap(turun?'Turun tangga, berarti dikali!':'Naik tangga, berarti dibagi!','sapa');
    S3.lompat(v,s.dari,s.ke,x,(val,u)=>{const f=b==='waktu'?UK.TANGGA.waktu.faktor[Math.min(T.satuan.indexOf(prevU),T.satuan.indexOf(u))]:10;
      ol.insertAdjacentHTML('beforeend',`<li value="${++nomor}">${UK.angka(prev)} ${prevU} ${turun?'×':':'} ${f} = <b>${UK.angka(val)} ${u}</b></li>`);prev=val;prevU=u;papan(`${UK.angka(val)} ${u}`,`Anak tangga ${u}`);A.play('tick')},
      ()=>{sibuk=false;$('lompatBtn').disabled=false;const hasil=UK.geser(prev,0);let akhir=`Jadi ${UK.angka(x)} ${s.dari} = <b>${UK.angka(hasil)} ${s.ke}</b>`;
        const F=b==='waktu'?(turun?UK.faktorWaktu(s.dari,s.ke):1/UK.faktorWaktu(s.dari,s.ke)):10**n;
        if(b==='waktu'&&!Number.isInteger(hasil)&&!turun){const utuh=Math.floor(hasil),sisa=Math.round(x-utuh*F);akhir=`Jadi ${UK.angka(x)} ${s.dari} = <b>${utuh} ${s.ke} ${sisa} ${s.dari}</b>`}
        else if(n>1)akhir+=` (sama saja dengan ${turun?'×':':'} ${UK.angka(F)})`;
        ol.insertAdjacentHTML('beforeend',`<li class="akhir">${akhir}</li>`);A.play('good');ucap('Sampai! Hitung anak tangganya, lalu kali atau bagi.','senang')})}
  /* ---------- tantangan (tangga & alat) ---------- */
  function tampilSoal(){const box=$('soalBox'),alat=tab==='alat',s=alat?alatSt:st[tab],q=s.soal;
    if(!q){box.innerHTML=`<button class="chunky go" data-soal>Soal baru</button><p class="hint">Jawab sendiri dulu. Pembahasan muncul setelah kamu memilih.</p>`;return}
    box.innerHTML=`<p class="soal-teks">${q.teks}</p><div class="soal-opsi">${q.opsi.map((o,j)=>`<button class="answer-option${q.dijawab!==undefined?j===q.benar?' correct':j===q.dijawab?' wrong':'':''}" data-jawab="${j}" ${q.dijawab!==undefined?'disabled':''}><b>${'ABCD'[j]}</b><span>${o}</span></button>`).join('')}</div>
      ${q.dijawab!==undefined?`<ol class="langkah">${q.kunci.map(k=>`<li>${k}</li>`).join('')}</ol><button class="chunky go" data-soal>Soal berikutnya</button>`:''}`}
  function soalBaru(){if(sibuk)return;const alat=tab==='alat',s=alat?alatSt:st[tab];
    /* soal yang sudah pernah keluar di tab ini tidak diulang */
    s.dipakai=s.dipakai||new Set();const buat=c=>alat?UK.alat(s.seed+s.n*7919+c*104723,s.lv,ALAT[alatSt.i].besaran):UK.soal(s.seed,s.n,s.lv,tab,c);
    for(let c=0;c<80;c++){s.soal=buat(c);if(!s.dipakai.has(UK.kunciSoal(s.soal)))break}s.dipakai.add(UK.kunciSoal(s.soal));A.play('tap');
    if(alat){$('alatGambar').innerHTML=s.soal.gambar;$('bacaan').textContent='Tantangan: baca alatnya!';$('geser').disabled=true}
    else{const q=s.soal,v=views[tab];if(q.lompat){S3.bangun(v,q.lompat.besaran);S3.taruh(v,UK.TANGGA[tab].satuan.indexOf(q.lompat.dari));papan(`${UK.angka(q.lompat.nilai)} ${q.lompat.dari}`,'Tantangan')}
      $('alatGambar').hidden=!q.gambar;$('alatGambar').innerHTML=q.gambar||''}
    ucap('Coba jawab sendiri dulu!','sapa');tampilSoal();panelSkor()}
  function jawab(j){const alat=tab==='alat',s=alat?alatSt:st[tab],q=s.soal;if(!q||q.dijawab!==undefined||sibuk)return;
    q.dijawab=j;s.n++;const ok=j===q.benar;if(ok)s.benar++;A.play(ok?'perfect':'bad');ucap(ok?'Betul! Lihat pembahasannya.':'Belum tepat. Baca langkahnya pelan-pelan, ya.',ok?'senang':'bingung');
    tampilSoal();panelSkor();
    if(!alat&&q.lompat){sibuk=true;S3.lompat(views[tab],q.lompat.dari,q.lompat.ke,q.lompat.nilai,(x,u)=>{papan(`${UK.angka(x)} ${u}`,`Anak tangga ${u}`);A.play('tick')},()=>{sibuk=false})}}
  function panelSkor(){const h=[...$('panel').querySelectorAll('h2 small b')].slice(-2),s=tab==='alat'?alatSt:st[tab];if(h.length===2){h[0].textContent=s.benar;h[1].textContent=s.n}}

  /* ---------- tab alat ukur ---------- */
  function gambarAlat(){const a=ALAT[alatSt.i],v=alatSt.v[alatSt.i];let svg,teks;
    if(a.id==='penggaris'){svg=UK.svgPenggaris(v/10,'pita');teks=`Panjang pita: <b>${UK.angka(v/10)} cm</b> = <b>${v} mm</b>`}
    else if(a.id==='gelas'){svg=UK.svgGelas(v,1000,100);teks=`Air: <b>${UK.angka(v)} ml</b> = <b>${UK.angka(v/1000)} liter</b>`}
    else if(a.id==='timbangan'){svg=UK.svgTimbangan(v,2000,200,'g');teks=`Berat: <b>${UK.angka(v)} g</b> = <b>${UK.angka(v/1000)} kg</b>`}
    else{const h=Math.floor(v/60)||12,m=v%60;svg=UK.svgJam(h,m);teks=`Pukul <b>${UK.jamTeks(h,m)}</b>, jarum panjang di menit ${m}`}
    $('alatGambar').innerHTML=svg;$('bacaan').innerHTML=teks;$('jelas').innerHTML=jelaskan(a.id,v).map(x=>`<li>${x}</li>`).join('');
    if(document.activeElement!==$('manual'))$('manual').value=tulisManual(a.id,v)}
  /* ---------- ketik manual: angka yang diketik anak, lalu dijelaskan arti tiap bagiannya ---------- */
  const MANUAL={jam:{label:'Ketik jam',contoh:'12:55',mode:'text'},penggaris:{label:'Ketik panjang (cm)',contoh:'7,4',mode:'decimal'},
    gelas:{label:'Ketik banyak air (ml)',contoh:'350',mode:'numeric'},timbangan:{label:'Ketik berat (gram)',contoh:'1300',mode:'numeric'}};
  const tulisManual=(id,v)=>id==='jam'?UK.jamTeks(Math.floor(v/60)||12,v%60).replace('.',':'):id==='penggaris'?UK.angka(v/10):String(v);
  function bacaManual(id,teks){const t=String(teks).trim();
    if(id==='jam'){const m=t.match(/^(\d{1,2})\s*[:.\s]\s*(\d{1,2})$/)||t.match(/^(\d{1,2})$/);if(!m)return{salah:'Tulis jam dan menit dipisah titik dua, contoh 12:55.'};
      const h=+m[1],mn=m[2]===undefined?0:+m[2];if(h>23)return{salah:'Jam paling besar 23. Coba lagi, ya.'};if(mn>59)return{salah:'Menit paling besar 59, karena 60 menit = 1 jam.'};
      return{v:(h%12)*60+mn,h24:h}}
    const x=baca(t);if(!(x>=0))return{salah:'Tulis angkanya saja, contoh '+MANUAL[id].contoh+'.'};
    if(id==='penggaris'){const mm=Math.round(x*10);if(Math.abs(x*10-mm)>1e-9)return{salah:'Penggaris hanya bisa dibaca sampai milimeter, jadi cukup satu angka di belakang koma (contoh 7,4).'};if(mm<10||mm>150)return{salah:'Penggaris ini panjangnya 1 sampai 15 cm.'};return{v:mm}}
    const maks=id==='gelas'?1000:2000;if(x>maks)return{salah:id==='gelas'?'Gelas ukur ini hanya muat sampai 1.000 ml.':'Timbangan ini hanya sampai 2.000 g.'};
    if(!Number.isInteger(x))return{salah:'Tulis bilangan bulat, contoh '+MANUAL[id].contoh+'.'};return{v:x}}
  function jelaskan(id,v,h24){
    if(id==='jam'){const h=Math.floor(v/60)||12,m=v%60,ang=Math.floor(m/5),sisa=m%5,next=h%12+1;const L=[];
      if(h24!==undefined&&h24>12)L.push(`Jam ${h24} pada jam dinding dibaca jam ${h24-12} ${h24<15?"siang":h24<19?"sore":"malam"}.`);
      if(h24===0)L.push('Jam 0 (tengah malam) pada jam dinding dibaca jam 12.');
      L.push(`<b>${h}</b> adalah <b>jam</b>. Jarum pendek menunjuk angka ${h}${m?`, lalu bergerak pelan menuju angka ${next}`:''}.`);
      L.push(`<b>${String(m).padStart(2,'0')}</b> adalah <b>menit</b>. ${m===0?'Jarum panjang tepat di angka 12.':sisa===0?`Jarum panjang menunjuk angka ${ang}, karena ${ang} × 5 = ${m}.`:`Jarum panjang ada di garis kecil ke-${sisa} setelah angka ${ang||12}, karena ${ang} × 5 + ${sisa} = ${m}.`}`);
      L.push(m===0?`Dibaca: pukul ${h} tepat.`:m===30?`Dibaca: pukul ${h} lewat 30 menit, atau setengah ${next}.`:m>30?`Dibaca: pukul ${h} lewat ${m} menit, atau pukul ${next} kurang ${60-m} menit.`:`Dibaca: pukul ${h} lewat ${m} menit.`);return L}
    if(id==='penggaris'){const cm=Math.floor(v/10),mm=v%10;return[`<b>${cm}</b> adalah <b>cm penuh</b>. Ujung pita melewati angka ${cm} pada penggaris.`,
      mm?`<b>${mm}</b> adalah <b>mm</b>: ada ${mm} garis kecil setelah angka ${cm}. 1 garis kecil = 1 mm.`:'Ujung pita tepat di garis panjang, jadi tidak ada mm tambahan.',
      `${cm} cm ${mm?mm+' mm ':''}= <b>${UK.angka(v/10)} cm</b> = <b>${v} mm</b> (1 cm = 10 mm).`]}
    if(id==='gelas'){const ratus=Math.floor(v/100)*100,sisa=v-ratus;return[`Garis panjang tiap <b>100 ml</b>. Permukaan air ${ratus?`melewati garis ${UK.angka(ratus)}`:'belum sampai garis 100'}.`,
      sisa===0?'Permukaan air tepat di garis panjang.':sisa===50?'Sisanya <b>50 ml</b>, tepat di garis pendek (tengah-tengah).':`Sisanya <b>${sisa} ml</b>, ${sisa<50?'di bawah':'di atas'} garis pendek 50 ml.`,
      `${UK.angka(v)} ml = <b>${UK.angka(v/1000)} liter</b> (1 liter = 1.000 ml).`]}
    const dua=Math.floor(v/200)*200,sisa=v-dua,kg=Math.floor(v/1000),g=v%1000;
    return[`Angka besar tiap <b>200 g</b>. Jarum ${dua?`melewati angka ${UK.angka(dua)}`:'belum sampai angka 200'}.`,
      sisa===0?'Jarum tepat di angka besar.':sisa===100?'Sisanya <b>100 g</b>, tepat di garis kecil di tengahnya.':`Sisanya <b>${sisa} g</b>.`,
      `${UK.angka(v)} g = ${kg?`${kg} kg ${g?g+' g ':''}= `:''}<b>${UK.angka(v/1000)} kg</b> (1 kg = 1.000 g).`]}
  function pakaiManual(){const a=ALAT[alatSt.i],h=bacaManual(a.id,$('manual').value);
    if(h.salah){$('jelas').innerHTML=`<li class="salah">${h.salah}</li>`;A.play('bad');ucap(h.salah,'bingung');return}
    alatSt.v[alatSt.i]=h.v;$('geser').value=h.v;$('geser').disabled=false;alatSt.soal=null;tampilSoal();gambarAlat();A.play('good');
    if(h.h24!==undefined&&(h.h24>12||h.h24===0))$('bacaan').innerHTML=`Pukul <b>${UK.jamTeks(h.h24,h.v%60)}</b>, di jam dinding terlihat ${UK.jamTeks(Math.floor(h.v/60)||12,h.v%60)}`;
    if(h.h24!==undefined)$('jelas').innerHTML=jelaskan('jam',h.v,h.h24).map(x=>`<li>${x}</li>`).join('');
    ucap('Lihat alatnya berubah. Baca penjelasannya, ya!','senang')}
  function panelAlat(){const a=ALAT[alatSt.i];
    $('panel').innerHTML=`
      <section class="lab-kartu"><h2>Pilih alat ukur</h2>
        <div class="chips rapat">${ALAT.map((x,i)=>`<button type="button" class="chip" data-alat="${i}" aria-pressed="${i===alatSt.i}">${x.nama}</button>`).join('')}</div>
        <label class="lbl" for="geser">Geser untuk mengubah</label><input id="geser" type="range" min="${a.min}" max="${a.max}" step="${a.step}" value="${alatSt.v[alatSt.i]}">
        <label class="lbl" for="manual">${MANUAL[a.id].label}</label>
        <div class="ubah-baris"><input id="manual" class="manual" inputmode="${MANUAL[a.id].mode}" autocomplete="off" placeholder="${MANUAL[a.id].contoh}" aria-describedby="jelas"><button type="button" class="chunky go" id="pakai">Tampilkan</button></div>
        <p class="bacaan" id="bacaan" role="status"></p><ul class="jelas" id="jelas"></ul><p class="aturan">${TIPS[a.id]}</p></section>
      <section class="lab-kartu"><h2>Tantangan membaca <small>benar <b>${alatSt.benar}</b> dari <b>${alatSt.n}</b></small></h2>
        <div class="chips rapat">${LEVEL.map((l,i)=>`<button type="button" class="chip" data-lv="${i+1}" aria-pressed="${alatSt.lv===i+1}">${l}</button>`).join('')}</div>
        <div id="soalBox" class="soal-box"></div></section>`;
    alatSt.soal=null;gambarAlat();tampilSoal()}

  function buka(t){if(sibuk)return;tab=t;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));
    const alat=t==='alat';document.body.classList.toggle('mode-alat',alat);$('alatGambar').hidden=!alat;$('papan').hidden=alat;
    if(alat){panelAlat();ucap('Geser alatnya, lalu baca angkanya!')}
    else{const v=views[t];if(v){S3.bangun(v,t);S3.taruh(v,UK.TANGGA[t].satuan.indexOf(st[t].dari))}papan(UK.TANGGA[t].nama,'Tangga satuan');panelTangga();ucap(ROBOT[TOKOH[t]].kata,'sapa')}
    try{history.replaceState(null,'','#'+t)}catch(_){}}

  /* ---------- kejadian ---------- */
  $('panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const s=st[tab];
    if(b.dataset.i!==undefined&&!sibuk){const T=UK.TANGGA[tab],i=+b.dataset.i,v=views[tab],u=T.satuan[i];sibuk=true;A.play('tap');
      S3.lompat(v,T.satuan[v.pos],u,1,null,()=>{sibuk=false});s.dari=u;if(s.ke===u)s.ke=T.satuan[(i+3)%T.satuan.length];
      ucap(`${u} = ${T.lengkap[i]}. Kata kuncinya “${T.kata[i]}”.`,'sapa');papan(u,T.lengkap[i]);const n=$('nilai').value;panelTangga();$('nilai').value=n}
    else if(b.dataset.dari){s.dari=b.dataset.dari;b.parentElement.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b));if(!sibuk)S3.taruh(views[tab],UK.TANGGA[tab].satuan.indexOf(s.dari))}
    else if(b.dataset.ke){s.ke=b.dataset.ke;b.parentElement.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b))}
    else if(b.id==='lompatBtn')lompatUbah();
    else if(b.id==='pakai')pakaiManual();
    else if(b.dataset.lv){const t=tab==='alat'?alatSt:s;t.lv=+b.dataset.lv;b.parentElement.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b))}
    else if(b.dataset.soal!==undefined)soalBaru();
    else if(b.dataset.jawab!==undefined)jawab(+b.dataset.jawab);
    else if(b.dataset.alat!==undefined){alatSt.i=+b.dataset.alat;panelAlat();A.play('tap')}});
  $('panel').addEventListener('input',e=>{if(e.target.id==='geser'){alatSt.v[alatSt.i]=+e.target.value;gambarAlat()}});
  $('panel').addEventListener('keydown',e=>{if(e.target.id==='nilai'&&e.key==='Enter')lompatUbah();if(e.target.id==='manual'&&e.key==='Enter')pakaiManual()});
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{A.start();A.play('tap');buka(b.dataset.tab)}));
  $('suara').addEventListener('click',()=>{muted=!muted;suara();A.start()});
  $('fsBtn').addEventListener('click',()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen();else d.documentElement.requestFullscreen?.().catch(()=>{})});

  function loop(now){const dt=Math.min(.06,Math.max(0,(now-last)/1000));last=now;sim+=dt;V.frame();
    if(V.ready&&tab!=='alat'){const v=views[tab];S3.update(v,sim,dt,motion,false);V.render(v)}
    requestAnimationFrame(loop)}
  if(V.ready)for(const b of UK.BESARAN)views[b]=S3.create($('panggung'),TOKOH[b],ROBOT[TOKOH[b]].warna,{besaran:b,skala:.62});
  const awal=location.hash.slice(1);buka(['panjang','volume','berat','waktu','alat'].includes(awal)?awal:'panjang');
  requestAnimationFrame(loop);
  return{get tab(){return tab},get sibuk(){return sibuk},buka,st,alatSt};
})();
