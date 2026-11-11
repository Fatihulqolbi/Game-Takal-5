/* Pembuat elemen kecil: h('div',{class:'x'},'teks',anak) */
function h(tag,attrs,...kids){
  const e=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs||{})){
    if(v===false||v==null)continue;
    if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v);
  }
  for(const k of kids.flat(Infinity))if(k!=null&&k!==false)e.append(k.nodeType?k:document.createTextNode(k));
  return e;
}
/* Muat satu paket latihan dari ?p=latihan-N; hanya nama berpola itu yang diterima. */
function muatPaket(cb){
  const id=new URLSearchParams(location.search).get('p')||'';
  if(!/^latihan-\d+$/.test(id)){document.body.textContent='Paket tidak ditemukan.';return}
  const s=document.createElement('script');s.src='data/'+id+'.js';
  s.onload=()=>cb(SOAL_PAKET[id]);s.onerror=()=>{document.body.textContent='Paket tidak ditemukan.'};
  document.head.appendChild(s);
}
