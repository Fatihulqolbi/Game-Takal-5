/* Layar ujian Latihan: timer naik, navigasi nomor, ragu-ragu. Skor dan pembahasan baru muncul setelah Selesai. */
muatPaket(P=>{
  const C=SoalCore,$=id=>document.getElementById(id),L=C.datar(P);
  const jaw=L.map(b=>b.bagian.map(()=>undefined)),ragu=L.map(()=>false);
  let i=0,detik=0,tick,selesai=false;
  document.title=P.nama+' - Latihan - Soal TKA';
  $('nama').textContent=P.nama+' · Latihan';

  const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  const mulai=()=>{detik=0;$('timer').textContent=mmss(0);clearInterval(tick);tick=setInterval(()=>{$('timer').textContent=mmss(++detik)},1000)};
  const butirTerisi=k=>L[k].bagian.every((g,j)=>C.terisi(g,jaw[k][j]));
  const adaIsi=k=>L[k].bagian.some((g,j)=>C.terisi(g,jaw[k][j]));

  function bagian(g,j){
    const a=jaw[i][j],set=v=>{jaw[i][j]=v;peta()};
    if(g.kind==='angka')return h('div',{class:'bagian'},h('div',{class:'isi'},
      h('label',{for:'in'+j},g.label),g.prefix&&h('span',null,g.prefix),
      h('input',{id:'in'+j,type:'text',inputmode:'decimal',autocomplete:'off',value:a==null?'':a,oninput:e=>set(e.target.value)}),g.unit&&h('span',null,g.unit)));
    if(g.kind==='pg')return h('div',{class:'bagian'},h('b',null,g.label),h('div',{class:'opsi',role:'radiogroup'},
      g.opsi.map((o,k)=>h('label',null,h('input',{type:'radio',name:'pg'+j,checked:a===k,onchange:()=>set(k)}),h('span',null,C.HURUF[k].toUpperCase()+'. '+o)))));
    const arr=a||(jaw[i][j]=[]);
    return h('div',{class:'bagian'},h('table',{class:'bs'},
      h('thead',null,h('tr',null,h('th',null,'Pernyataan'),h('th',{class:'p'},'Benar'),h('th',{class:'p'},'Salah'))),
      h('tbody',null,g.baris.map((r,k)=>h('tr',null,h('td',null,r.teks),
        [true,false].map(v=>h('td',{class:'p'},h('input',{type:'radio',name:'bs'+j+'_'+k,'aria-label':(v?'Benar':'Salah')+': '+r.teks,checked:arr[k]===v,onchange:()=>{arr[k]=v;peta()}}))))))));
  }

  function tampil(){
    const b=L[i],s=$('soal');
    s.replaceChildren(
      h('div',{class:'cerita'},h('b',null,b.soal.judul),b.soal.teks),
      h('div',{class:'pertanyaan'},h('span',{class:'nomor'},b.huruf),b.teks),
      b.gambar&&h('div',{class:'gambar'},h('img',{src:b.gambar,alt:b.alt||''})),
      ...b.bagian.map((g,j)=>Object.assign(bagian(g,j),{id:"bag"+j})),
      h('div',{class:'nav'},
        h('button',{class:'btn',disabled:i===0,onclick:()=>pindah(i-1)},'◂ Sebelumnya'),
        h('button',{class:'btn ragu','aria-pressed':ragu[i],onclick:e=>{ragu[i]=!ragu[i];e.currentTarget.setAttribute('aria-pressed',ragu[i]);peta()}},'Ragu-ragu'),
        i<L.length-1?h('button',{class:'btn',onclick:()=>pindah(i+1)},'Selanjutnya ▸'):h('button',{class:'btn utama',onclick:konfirmasi},'Selesai')));
    peta();scrollTo({top:0});
  }
  function peta(){
    $('grid').replaceChildren(...L.map((b,k)=>h('button',{class:ragu[k]?'ragu':adaIsi(k)?'terisi':'','aria-current':k===i,'aria-label':'Soal '+(k+1)+(ragu[k]?', ragu-ragu':adaIsi(k)?', terisi':', kosong'),onclick:()=>pindah(k)},k+1)));
  }
  const pindah=k=>{i=k;tampil()};

  function konfirmasi(){
    const kosong=L.filter((_,k)=>!butirTerisi(k)).length,r=ragu.filter(Boolean).length;
    $('selesaiInfo').textContent=(kosong?kosong+' butir belum terisi lengkap. ':'Semua butir sudah terisi. ')+(r?r+' butir masih ragu-ragu. ':'')+'Setelah dikumpulkan, jawaban tidak bisa diubah.';
    $('dlgSelesai').showModal();
  }
  function hasil(){
    selesai=true;clearInterval(tick);$('ujian').hidden=true;$('hasil').hidden=false;$('selesai').disabled=true;
    const n=C.nilai(P,jaw);
    $('skor').className='skor'+(n.skor>=70?' bagus':'');
    $('skor').replaceChildren(h('div',null,'Skor kamu'),h('div',{class:'angka'},n.skor),
      h('div',{class:'ringkas'},h('span',{class:'y'},'Benar '+n.benar),h('span',{class:'n'},'Salah '+(n.total-n.benar)),h('span',null,'Waktu '+mmss(detik))));
    $('bahas').replaceChildren(...L.map((b,k)=>h('details',{class:n.hasil[k]?'y':'n'},
      h('summary',null,h('span',{class:'nomor'},b.huruf),'Butir '+b.huruf,h('span',{class:'st'},n.hasil[k]?'Benar':'Salah')),
      h('div',{class:'isi-b'},
        h('div',{style:'white-space:pre-line'},b.teks),
        b.gambar&&h('div',{class:'gambar'},h('img',{src:b.gambar,alt:b.alt||''})),
        b.bagian.map((g,j)=>h('div',{class:'row'},h('b',null,g.label||'Pernyataan'),
          h('div',null,h('div',{class:C.benar(g,jaw[k][j])?'benar':'salah'},'Jawabanmu: '+C.jawab(g,jaw[k][j])),h('div',null,'Kunci: '+C.kunci(g))))),
        h('div',{class:'p'},b.bahas)))));
    scrollTo({top:0});
  }

  $('keluar').addEventListener('click',()=>selesai?location.assign('index.html'):$('dlgKeluar').showModal());
  $('kBatal').addEventListener('click',()=>$('dlgKeluar').close());
  $('sBatal').addEventListener('click',()=>$('dlgSelesai').close());
  $('sOk').addEventListener('click',()=>{$('dlgSelesai').close();hasil()});
  $('selesai').addEventListener('click',konfirmasi);
  $('ulang').addEventListener('click',()=>location.reload());
  $('tglNomor').addEventListener('click',()=>$('samping').classList.toggle('buka'));
  mulai();tampil();
});
