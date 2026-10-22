/* DIMENSIA · Lab Bangun Ruang: panel pilihan, ukuran, langkah hitung, dan suara kecil */
(()=>{
  const $=id=>document.getElementById(id),D=DR;
  const IKON={
    kubus:'<path d="M8 14l12-6 12 6v14l-12 6-12-6z" fill="#ffc93c"/><path d="M8 14l12 6 12-6M20 20v14"/>',
    balok:'<path d="M4 15l14-6 18 5v12l-14 6-18-5z" fill="#5aa2ff"/><path d="M4 15l18 5 14-6M22 20v12"/>',
    prisma:'<path d="M6 28l8-18 8 18zM14 10l16 4 6 16-14-2" fill="#ff8c92"/><path d="M6 28h16M14 10l8 18"/>',
    limas:'<path d="M5 28l13 6 17-8-14-20z" fill="#5cbf5a"/><path d="M5 28L21 6l-3 28M21 6l14 20"/>',
    tabung:'<ellipse cx="20" cy="10" rx="11" ry="4" fill="#c9b5ff"/><path d="M9 10v20c0 5 22 5 22 0V10" fill="#c9b5ff"/><path d="M9 10c0 5 22 5 22 0"/>',
    kerucut:'<path d="M20 5L9 29c0 5 22 5 22 0z" fill="#f08c00"/><path d="M9 29c0-5 22-5 22 0"/>',
    bola:'<circle cx="20" cy="20" r="14" fill="#9fdcff"/><path d="M6 20c0 5 28 5 28 0" fill="none"/>'
  };
  const SAPA={volume:'Volume = ISI di dalam bangun. Kita hitung berapa kubus satuan atau air yang muat.',luas:'Luas permukaan = KULIT luar bangun. Kita buka bangunnya jadi jaring-jaring, lalu jumlahkan luas semua sisinya.',beda:'Volume itu isinya (cm³), luas permukaan itu bungkusnya (cm²). Bangun yang sama punya dua-duanya!'};
  let st={id:'kubus',mode:'volume',pilihan:{}};
  try{Object.assign(st,JSON.parse(localStorage.getItem('dimensia-ruang')||'{}'))}catch(_){}
  if(!D.cari(st.id))st.id='kubus';
  const simpan=()=>{try{localStorage.setItem('dimensia-ruang',JSON.stringify(st))}catch(_){}};

  /* suara kecil, dibuat dengan kode */
  let ac=null;const nada=(f,d=.12,v=.12,tipe='triangle',tunda=0)=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();const t=ac.currentTime+tunda,o=ac.createOscillator(),g=ac.createGain();o.type=tipe;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d+.02)}catch(_){}};
  const klik=()=>nada(640,.07,.1);

  $('pilihRuang').innerHTML=D.BENTUK.map(b=>`<button class="chunky bangun-ruang" data-id="${b.id}"><svg viewBox="0 0 40 40" aria-hidden="true"><g stroke="#1e2a4a" stroke-width="2" stroke-linejoin="round" fill="none">${IKON[b.id]}</g></svg><span>${b.nama}</span></button>`).join('');

  function ukuranMarkup(b){
    return b.ukuran.map(c=>{const v=st.pilihan[b.id]?.[c.k]??c.awal;
      if(c.pilih)return `<div class="field"><span class="lbl">${c.label}</span><div class="chips">${c.pilih.map((p,i)=>`<button class="chip" data-k="${c.k}" data-v="${i}" aria-pressed="${i===v}">${p.teks}</button>`).join('')}</div></div>`;
      return `<div class="field"><span class="lbl">${c.label}</span><div class="stepper"><button type="button" data-k="${c.k}" data-d="-1" aria-label="Kurangi" ${v<=c.min?'disabled':''}>−</button><output>${v} cm</output><button type="button" data-k="${c.k}" data-d="1" aria-label="Tambah" ${v>=c.maks?'disabled':''}>+</button></div></div>`}).join('')}

  let tanda=[];
  function segarkan(main=true){
    const b=D.cari(st.id),u=D.ukuran(st.id,st.pilihan[st.id]),H=D.hitung(st.id,u);
    document.querySelectorAll('.bangun-ruang').forEach(e=>e.setAttribute('aria-pressed',e.dataset.id===st.id));
    document.querySelectorAll('[data-mode]').forEach(e=>{e.setAttribute('aria-pressed',e.dataset.mode===st.mode);e.setAttribute('aria-selected',e.dataset.mode===st.mode)});
    $('judulRuang').innerHTML=st.mode==='volume'?`Volume ${b.nama.toLowerCase()}`:st.mode==='luas'?`Luas permukaan ${b.nama.toLowerCase()}`:`Volume <span>vs</span> luas permukaan`;
    $('ukuranRuang').innerHTML=ukuranMarkup(b);
    if(st.mode==='beda'){
      $('langkahRuang').className='langkah-ruang beda';
      $('langkahRuang').innerHTML=`<li class="baris-beda kepala"><span></span><b class="v">Volume</b><b class="l">Luas permukaan</b></li>`+['Artinya','Dihitung dari','Satuan','Contoh'].map((n,i)=>`<li class="baris-beda nyala"><span>${n}</span><span class="v">${D.BEDA[0][i+1]}</span><span class="l">${D.BEDA[1][i+1]}</span></li>`).join('');
      $('hasilRuang').innerHTML=`<div class="hasil-dua"><div class="v"><small>Volume ${b.nama.toLowerCase()}</small><b>${D.angka(H.volume.nilai)} cm³</b></div><div class="l"><small>Luas permukaan</small><b>${D.angka(H.luas.nilai)} cm²</b></div></div>`;
    }else{
      const data=st.mode==='volume'?H.volume:H.luas;
      $('langkahRuang').className='langkah-ruang';
      $('langkahRuang').innerHTML=(H.pi?`<li class="pi">π = ${H.pi}${H.pi==='22/7'?' (jari-jari kelipatan 7)':''}</li>`:'')+data.langkah.map((t,i)=>`<li data-i="${i}">${t}</li>`).join('');
      $('hasilRuang').innerHTML=`<div class="hasil-satu ${st.mode}"><small>${st.mode==='volume'?'Volume':'Luas permukaan'}</small><b>${D.angka(data.nilai)} ${st.mode==='volume'?'cm³':'cm²'}</b></div>`;
    }
    const a=R3.tampilkan(st.id,u,st.mode==='beda'?'beda':st.mode,H);tanda=a?.tanda||[];
    $('ucapRuang').innerHTML=`<b>Orbo:</b> ${SAPA[st.mode]}`;
    simpan();if(main&&a)R3.mainkan();
  }
  $('pilihRuang').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;st.id=b.dataset.id;klik();segarkan()});
  document.querySelector('.tab-ruang').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;st.mode=b.dataset.mode;klik();segarkan()});
  $('ukuranRuang').addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(!b||b.disabled)return;const c=D.cari(st.id).ukuran.find(x=>x.k===b.dataset.k),p=st.pilihan[st.id]=st.pilihan[st.id]||{};
    if(b.dataset.v!==undefined)p[c.k]=+b.dataset.v;else p[c.k]=Math.max(c.min,Math.min(c.maks,(p[c.k]??c.awal)+(+b.dataset.d)));klik();segarkan()});
  $('mainRuang').addEventListener('click',()=>{nada(523,.12,.12);nada(784,.16,.12,'triangle',.08);R3.mainkan()});
  $('akhirRuang').addEventListener('click',()=>{klik();R3.lompatAkhir()});
  $('fsRuang').addEventListener('click',()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen();else d.documentElement.requestFullscreen?.().catch(()=>{})});

  if(!window.THREE||!R3.pasang($('stageRuang'))){$('galatRuang').hidden=false;return}
  segarkan();
  /* lingkaran animasi: teks HUD, langkah yang menyala, bunyi pop saat kubus/lapisan muncul */
  let bunyiLama=0;
  (function loop(now){const teks=R3.frame(now),a=R3.anim;
    if(teks!==null&&teks!==undefined)$('hudRuang').textContent=teks;
    if(a&&st.mode!=='beda'){const lis=$('langkahRuang').querySelectorAll('li[data-i]');lis.forEach((li,i)=>li.classList.toggle('nyala',a.t>=(tanda[i]??0)-1e-6));
      if(a.bunyi&&a.main){const n=a.bunyi(a.t);if(n>bunyiLama)nada(420+Math.min(n,40)*14,.06,.07,'square');bunyiLama=n}else bunyiLama=0}
    $('hasilRuang').classList.toggle('muncul',!a||a.t>=a.durasi-1e-6||st.mode==='beda');
    requestAnimationFrame(loop)})(performance.now());
})();
