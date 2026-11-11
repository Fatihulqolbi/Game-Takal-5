/* Inti Soal TKA: meratakan paket, mencocokkan jawaban, dan memberi skor. Dipakai halaman ujian dan tes. */
(function(g){
  const HURUF='abcdefghijklmnopqrstuvwxyz';
  /* "292.500", "Rp 292500", "7,2", "7.2" -> angka; selain itu NaN */
  function angka(s){
    s=String(s==null?'':s).toLowerCase().replace(/rp|\s/g,'');
    if(/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s))s=s.replace(/\./g,'').replace(',','.');
    else s=s.replace(',','.');
    return /^-?\d+(\.\d+)?$/.test(s)?Number(s):NaN;
  }
  function tampil(n){ // 273000 -> "273.000", 7.2 -> "7,2"
    const [a,b]=String(n).split('.');
    return a.replace(/\B(?=(\d{3})+(?!\d))/g,'.')+(b?','+b:'');
  }
  const cocok=(v,jawab)=>{const x=angka(v);return Number.isFinite(x)&&Math.abs(x-jawab)<1e-9};
  function terisi(b,a){
    if(b.kind==='angka')return String(a==null?'':a).trim()!=='';
    if(b.kind==='pg')return Number.isInteger(a);
    return Array.isArray(a)&&b.baris.every((_,i)=>typeof a[i]==='boolean');
  }
  function benar(b,a){
    if(!terisi(b,a))return false;
    if(b.kind==='angka')return cocok(a,b.jawab);
    if(b.kind==='pg')return a===b.benar;
    return b.baris.every((r,i)=>a[i]===r.benar);
  }
  function kunci(b){
    if(b.kind==='angka')return (b.prefix?b.prefix+' ':'')+tampil(b.jawab)+(b.unit?' '+b.unit:'');
    if(b.kind==='pg')return HURUF[b.benar].toUpperCase()+'. '+b.opsi[b.benar];
    return b.baris.map((r,i)=>'('+(i+1)+') '+(r.benar?'Benar':'Salah')).join(', ');
  }
  function jawab(b,a){
    if(!terisi(b,a))return '(kosong)';
    if(b.kind==='angka')return (b.prefix?b.prefix+' ':'')+String(a).trim()+(b.unit?' '+b.unit:'');
    if(b.kind==='pg')return HURUF[a].toUpperCase()+'. '+b.opsi[a];
    return b.baris.map((_,i)=>'('+(i+1)+') '+(a[i]?'Benar':'Salah')).join(', ');
  }
  /* paket -> daftar butir berurutan; tiap butir tahu cerita (soal) dan hurufnya (a, b, c...) */
  function datar(p){return p.soal.flatMap((s,si)=>s.butir.map((b,bi)=>Object.assign({},b,{soal:s,si,huruf:HURUF[bi]})))}
  function nilai(p,jaw){
    const L=datar(p),hasil=L.map((b,i)=>b.bagian.every((bg,k)=>benar(bg,(jaw[i]||[])[k])));
    const n=hasil.filter(Boolean).length;
    return {hasil,benar:n,total:L.length,skor:Math.round(100*n/L.length)};
  }
  const api={angka,tampil,cocok,terisi,benar,kunci,jawab,datar,nilai,HURUF};
  g.SoalCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
