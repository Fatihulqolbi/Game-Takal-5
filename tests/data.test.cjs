/* Bab 4 Penyajian Data: generator data, gambar sajian, dan kunci jawaban. */
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../data/js/data-soal.js');
const jumlah=a=>a.reduce((s,v)=>s+v,0);
const sajian=['campur','batang','piktogram','tabel','lingkaran','garis','frekuensi'];
const OPS=['baca','banding','selisih','jumlah','kali','syarat','pikto','hilang','ubah','urut','pie','gTitik','gSelisih','gSegmen'];
function cekAnim(a,d,m){assert(OPS.includes(a.op),m+' op '+a.op);const idx=i=>assert(Number.isInteger(i)&&i>=0&&i<d.label.length,m+' indeks '+i);
  if('i'in a)idx(a.i);if('j'in a)idx(a.j);if(a.idx)a.idx.forEach(idx);if(a.op==='urut')a.list.forEach(x=>cekAnim(x,d,m))}

test('Data: angka Indonesia dan skala sumbu rapi',()=>{
  assert.equal(D.angka(1500),'1.500');assert.equal(D.angka(2.5),'2,5');assert.equal(D.angka(230),'230');
  assert.equal(D.skalaRapi(8),1);assert.equal(D.skalaRapi(18),2);assert.equal(D.skalaRapi(45),5);assert.equal(D.skalaRapi(90),10);
});
test('Data: semua soal lengkap, pilihan berbeda, dan kuncinya benar',()=>{
  const jenis=new Set();
  for(const s of sajian)for(let lv=1;lv<=3;lv++)for(let seed=1;seed<=60;seed++)for(let n=0;n<10;n++){
    const q=D.soal(seed*13,n,lv,s),d=q.data,m=`${s} L${lv} s${seed} n${n} ${q.jenis}/${q.sajian}: ${q.teks}`;jenis.add(q.jenis+':'+q.sajian);
    assert(['batang','piktogram','tabel','turus','lingkaran','garis','frekuensi'].includes(q.sajian),m);if(s!=='campur'&&!['cocok','pieCocok'].includes(q.jenis))assert.equal(q.sajian,s,m);
    assert.equal(d.label.length,d.nilai.length,m);assert.equal(new Set(d.nilai).size,d.nilai.length,m+' nilai kembar '+d.nilai);
    assert(d.nilai.every(v=>Number.isInteger(v*2)&&v>0&&v<=d.ytop),m+' nilai '+d.nilai+' ytop '+d.ytop);
    assert(d.ytop/d.step<=12&&d.ytop%d.step===0,m+' skala '+d.step+'/'+d.ytop);
    if(q.sajian==='piktogram')assert(d.nilai.every(v=>(v*2)%d.unit===0),m+' ikon tidak pas '+d.nilai+' unit '+d.unit);
    if(q.sajian==='turus')assert(d.nilai.every(v=>v<=20),m);
    const teks=[q.teks,...q.kunci,...(q.opsi||[]).filter(o=>!o.startsWith('<svg')),...(q.pernyataan||[]).map(p=>p.teks),q.gambar];
    for(const t of teks)assert(!/NaN|undefined|Infinity|null|\[object/.test(t),m+' -> '+t);
    assert(q.gambar.startsWith('<svg')&&q.gambar.endsWith('</svg>'),m);
    cekAnim(q.anim,d,m);
    if(q.tipe==='pg'){assert(q.opsi.length>=3&&q.opsi.length<=4,m+' '+q.opsi.length);assert.equal(new Set(q.opsi).size,q.opsi.length,m+' '+q.opsi.join('|'));assert(q.benar>=0&&q.benar<q.opsi.length,m);if(d.label.length>=4||!['banding','pieBanding'].includes(q.jenis))assert.equal(q.opsi.length,4,m+' '+q.opsi.join('|'))}
    else if(q.tipe==='multi'){assert.equal(q.opsi.length,q.benar.length,m);assert(q.benar.some(Boolean),m+' tidak ada yang benar');assert(q.opsi.length>=3,m);assert.equal(new Set(q.opsi).size,q.opsi.length,m)}
    else{assert.equal(q.tipe,'kategori',m);assert(q.pernyataan.length>=3,m);assert(q.benar.some(Boolean)&&q.benar.some(v=>!v),m+' semua sama');assert.equal(new Set(q.pernyataan.map(p=>p.teks)).size,q.pernyataan.length,m)}
    /* hitung ulang kunci dari data, bukan dari teks pembuatnya */
    const sat=' '+d.satuan,v=q.opsi?.[q.benar],a=q.anim;
    if(q.jenis==='baca')assert.equal(v,D.angka(d.nilai[a.i])+sat,m);
    if(q.jenis==='selisih')assert.equal(v,D.angka(Math.abs(d.nilai[a.i]-d.nilai[a.j]))+sat,m);
    if(q.jenis==='jumlah'||q.jenis==='total')assert.equal(v,D.angka(jumlah(a.idx.map(i=>d.nilai[i])))+sat,m);
    if(q.jenis==='kali'){assert.equal(d.nilai[a.i],d.nilai[a.j]*a.k,m);assert.equal(v,a.k+' kali',m)}
    if(q.jenis==='banding'){const x=a.max?Math.max(...d.nilai):Math.min(...d.nilai);assert.equal(v,d.label[d.nilai.indexOf(x)],m)}
    if(q.jenis==='hilang'){assert.equal(a.total,jumlah(d.nilai),m);assert.equal(v,D.angka(d.nilai[a.i])+sat,m);assert(q.gambar.includes('?'),m)}
    if(q.jenis==='syarat'){const c=d.nilai.filter(x=>a.cmp==='>'?x>a.b:x<a.b).length;assert(v.startsWith(c+' '),m+' '+v+' harus '+c)}
    if(q.jenis==='multi'){q.opsi.forEach((o,k)=>{const x=d.nilai[d.label.indexOf(o)];assert.equal(q.benar[k],a.cmp==='>'?x>a.b:x<a.b,m+' '+o)})}
    if(q.jenis==='cocok'){assert.equal(q.opsi.length,4,m);assert.equal(q.opsi[q.benar],D.svgBatang(d,{kecil:true}),m);assert.equal(new Set(q.opsi).size,4,m)}
    /* lingkaran: persen bulat, jumlahnya 100%, banyak = persen × jumlah seluruhnya */
    if(d.total){assert.equal(jumlah(d.nilai),d.total,m);assert.equal(jumlah(d.pct),100,m);d.pct.forEach((p,k)=>{assert(Number.isInteger(p)&&p>0,m+' persen '+p);assert.equal(p*d.total/100,d.nilai[k],m)})}
    const i0=a.idx?.[0];
    if(q.jenis==='piePersen')assert.equal(v,D.angka(d.nilai[i0])+sat,m);
    if(q.jenis==='pieBanyak')assert.equal(v,d.pct[i0]+'%',m);
    if(q.jenis==='pieGabung')assert.equal(v,(d.pct[a.idx[0]]+d.pct[a.idx[1]])+'%',m);
    if(q.jenis==='pieSelisih')assert([Math.abs(d.pct[a.idx[0]]-d.pct[a.idx[1]])+'%',D.angka(Math.abs(d.nilai[a.idx[0]]-d.nilai[a.idx[1]]))+sat].includes(v),m+' '+v);
    if(q.jenis==='piePecahan'){const[p,r]=v.split('/').map(Number);assert.equal(p/r,d.pct[i0]/100,m);assert.equal(D.pecahan(d.pct[i0]),v,m)}
    if(q.jenis==='pieHilang'){assert(q.gambar.includes('>?<'),m);assert([d.pct[i0]+'%',D.angka(d.nilai[i0])+sat].includes(v),m)}
    if(q.jenis==='pieBanding'){const x=a.max?Math.max(...d.nilai):Math.min(...d.nilai);assert.equal(v,d.label[d.nilai.indexOf(x)],m)}
    if(q.jenis==='pieCocok'){assert.equal(q.sajian,'tabel',m);assert.equal(q.opsi[q.benar],D.svgLingkaran(d,{kecil:true,tanpaTotal:true}),m);assert.equal(new Set(q.opsi).size,q.opsi.length,m)}
    if(q.jenis==='gNaik'){const dl=d.nilai.slice(1).map((x,k)=>x-d.nilai[k]),ex=a.naik?Math.max(...dl):Math.min(...dl);assert.equal(dl.filter(x=>x===ex).length,1,m);assert.equal(v,`${d.label[dl.indexOf(ex)]} ke ${d.label[dl.indexOf(ex)+1]}`,m)}
    if(['gBaca'].includes(q.jenis))assert.equal(v,D.angka(d.nilai[i0])+sat,m);
    if(q.jenis==='gSelisih')assert.equal(v,D.angka(Math.abs(d.nilai[a.i]-d.nilai[a.j]))+sat,m);
    if(q.jenis==='gJumlah')assert.equal(v,D.angka(jumlah(a.idx.map(i=>d.nilai[i])))+sat,m);
    if(q.jenis==='fSyarat')assert.equal(v,D.angka(jumlah(a.idx.map(i=>d.nilai[i])))+sat,m);
    if(q.sajian==='frekuensi')assert(d.label.every((l,k)=>k===0||+l===+d.label[k-1]+1),m+' label frekuensi harus berurutan');
    if(d.k==='tanaman'&&q.sajian==='garis')assert(d.nilai.every((x,k)=>k===0||x>d.nilai[k-1]),m+' tanaman harus terus tumbuh');
    assert(D.cek(q,q.benar),m+' cek kunci');
  }
  /* semua sajian dan jenis muncul */
  for(const j of['piePersen:lingkaran','pieBanyak:lingkaran','pieSelisih:lingkaran','pieGabung:lingkaran','piePecahan:lingkaran','pieHilang:lingkaran','pieCocok:tabel','kategori:lingkaran','pernyataan:lingkaran','gBaca:garis','gNaik:garis','gSelisih:garis','gJumlah:garis','kategori:garis','baca:frekuensi','fSyarat:frekuensi','hilang:frekuensi','kategori:frekuensi','baca:batang','baca:piktogram','baca:tabel','baca:turus','banding:batang','selisih:piktogram','jumlah:batang','total:tabel','kali:batang','syarat:batang','multi:batang','pernyataan:batang','kategori:tabel','hilang:batang','cocok:tabel'])assert(jenis.has(j),'tidak pernah muncul: '+j);
});
test('Data: pernyataan PGK dihitung ulang dari data',()=>{
  for(let lv=1;lv<=3;lv++)for(let seed=1;seed<=200;seed++){const q=D.soal(seed*7,6,lv,'batang');if(!q.anim.list)continue;const d=q.data;
    q.anim.list.forEach((a,k)=>{const t=q.anim.teks[k],b=q.anim.benar[k],m=`L${lv} s${seed}: ${t}`;
      const angkaDi=s=>Number((s.match(/(\d[\d.]*)\s/g)||[]).slice(-1)[0]?.replace(/\./g,''));
      if(a.op==='baca'&&!/^Ada /.test(t))assert.equal(angkaDi(t)===d.nilai[a.i],b,m);
      if(a.op==='selisih')assert.equal(angkaDi(t)===Math.abs(d.nilai[a.i]-d.nilai[a.j]),b,m);
      if(a.op==='jumlah')assert.equal(angkaDi(t)===jumlah(a.idx.map(i=>d.nilai[i])),b,m);
      if(a.op==='syarat'){const c=d.nilai.filter(x=>a.cmp==='>'?x>a.b:x<a.b).length;assert.equal(Number(t.match(/^Ada (\d+)/)[1])===c,b,m)}
      if(a.op==='banding'){const x=a.max?Math.max(...d.nilai):Math.min(...d.nilai);assert.equal(t.includes(d.label[d.nilai.indexOf(x)].toLowerCase())||t.includes(d.label[d.nilai.indexOf(x)]),b,m)}})}
});
test('Data: pernyataan PGK lingkaran dan garis dihitung ulang dari data',()=>{
  for(let lv=1;lv<=3;lv++)for(let seed=1;seed<=150;seed++)for(const s of['lingkaran','garis'])for(let n=0;n<9;n++){const q=D.soal(seed*11,n,lv,s);if(!q.anim.list)continue;const d=q.data;
    q.anim.list.forEach((a,k)=>{const t=q.anim.teks[k],b=q.anim.benar[k],m=`${s} L${lv} s${seed}: ${t}`,i=a.idx?.[0];
      if(a.mode==='persen')assert.equal(t.includes(` ${d.pct[i]}%`),b,m);
      if(a.mode==='gabung')assert.equal(t.includes(` ${d.pct[a.idx[0]]+d.pct[a.idx[1]]}%`),b,m);
      if(a.mode==='pecahan')assert.equal(t.includes(` ${D.pecahan(d.pct[i])} `),b,m);
      if(a.op==='pie'&&a.mode==='baca')assert.equal(t.includes(` ${D.angka(d.nilai[i])} ${d.satuan}`),b,m);
      if(a.op==='gSegmen'){const dl=d.nilai[a.i+1]-d.nilai[a.i];assert.equal(t.endsWith(`${dl>0?'naik':'turun'} ${D.angka(Math.abs(dl))} ${d.satuan}.`),b,m)}})}
});
test('Data: Koki Data (pesanan pizza dan jus) dan Survei Kelas',()=>{
  for(let lv=1;lv<=3;lv++)for(let s=1;s<=80;s++){const d=D.dataPesanan(s,s%7,lv),m=`L${lv} s${s} ${d.buat}`;
    assert(d.nilai.every(v=>Number.isInteger(v)&&v>0),m);assert.equal(new Set(d.nilai).size,d.nilai.length,m);
    assert.equal(d.pesanan.length,jumlah(d.nilai),m);d.nilai.forEach((v,i)=>assert.equal(d.pesanan.filter(x=>x===i).length,v,m));
    assert.equal(d.ikonItem.length,d.label.length,m);
    if(d.buat==='lingkaran'){assert.equal(jumlah(d.nilai),d.total,m);assert([10,20].includes(d.total),m);assert(d.pct.every(Number.isInteger),m)}else assert(Math.max(...d.nilai)<=d.ytop,m);
    for(let n=0;n<8;n++){const q=D.soalData(s,n,lv,d,d.buat);assert.deepEqual(q.data.nilai,d.nilai,'data tidak boleh diubah');assert.equal(q.sajian,d.buat,m);
      for(const t of[q.teks,...q.kunci,...(q.opsi||[]).filter(o=>!o.startsWith('<svg'))])assert(!/NaN|undefined|Infinity|null/.test(t),m+' '+t);assert(D.cek(q,q.benar))}}
  /* survei: boleh ada nilai kembar dan nol */
  const K=D.konteksSurvei('Survei: Buah Favorit','Pilihan','siswa'),d=D.lengkapi({k:'survei',judul:'Survei: Buah Favorit',kat:'Pilihan',satuan:'siswa',ikon:'🙋',label:['Apel','Pisang','Jeruk','Semangka'],nilai:[7,7,0,3],step:0,unit:0,kelip:1});
  for(let n=0;n<20;n++){const q=D.soalData(9,n,1,d,'batang',K);assert(!['banding','kategori','pernyataan'].includes(q.jenis),'data kembar: '+q.jenis);for(const t of[q.teks,...q.kunci,...(q.opsi||[])])assert(!/NaN|undefined/.test(t),t);assert(D.cek(q,q.benar))}
});
