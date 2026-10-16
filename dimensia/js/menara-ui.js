/* Kota Langit: kontrol pengaturan bergaya Laskar Pecahan (chip dan tombol tambah/kurang).
   Nilai sebenarnya tetap disimpan di <input>/<select> asli yang dibaca menara-game.js. */
(()=>{
  const $=id=>document.getElementById(id),sinkron=[];
  const segar=()=>sinkron.forEach(f=>f());
  const batas=(inp,v)=>Math.max(+inp.min,Math.min(+inp.max,v));
  /* <select data-chips> menjadi deretan chip; teks "Judul · keterangan" dipecah jadi dua baris */
  document.querySelectorAll('select[data-chips]').forEach(sel=>{
    sel.hidden=true;const w=document.createElement('div');w.className='chips';sel.after(w);
    for(const o of sel.options){
      const[judul,ket]=o.textContent.split(' · '),b=document.createElement('button');
      b.type='button';b.className='chip';b.dataset.v=o.value;b.textContent=judul;
      if(ket){const s=document.createElement('small');s.textContent=ket;b.appendChild(s)}
      b.addEventListener('click',()=>{sel.value=o.value;segar()});w.appendChild(b);
    }
    sinkron.push(()=>w.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===sel.value)));
  });
  /* chip nilai cepat untuk input angka */
  document.querySelectorAll('.chips[data-untuk]').forEach(w=>{
    const inp=$(w.dataset.untuk);
    for(const v of w.dataset.nilai.split(',')){
      const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.v=v;b.textContent=v+' '+w.dataset.satuan;
      b.addEventListener('click',()=>{inp.value=v;segar()});w.appendChild(b);
    }
    inp.addEventListener('input',segar);
    sinkron.push(()=>w.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===inp.value)));
  });
  document.querySelectorAll('.stepper button[data-langkah]').forEach(b=>b.addEventListener('click',()=>{
    const inp=$(b.dataset.untuk);inp.value=batas(inp,(+inp.value||+inp.min)+(+b.dataset.langkah)*(+inp.step||1));segar();
  }));
  /* menara-game.js mengisi nilai saat layar persiapan dibuka; samakan chip sesudahnya */
  new MutationObserver(segar).observe($('setup'),{attributes:true,attributeFilter:['hidden']});
  segar();
  $('fsBtn').addEventListener('click',()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen();else if(d.documentElement.requestFullscreen)d.documentElement.requestFullscreen().catch(()=>{})});
})();
