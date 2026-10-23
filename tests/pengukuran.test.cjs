const test=require('node:test'),assert=require('node:assert/strict');
const U=require('../pengukuran/js/ukur-data.js');
const angkaDari=s=>Number(s.split(' ')[0].replace(/\./g,'').replace(',','.'));

test('Pengukuran: geser desimal tepat tanpa galat',()=>{
  assert.equal(U.geser(2.5,3),2500);assert.equal(U.geser(3,-4),.0003);assert.equal(U.geser(.1,1),1);assert.equal(U.geser(1234,-3),1.234);
  assert.equal(U.ubah('panjang',3.5,'km','m'),3500);assert.equal(U.ubah('berat',750,'g','kg'),.75);assert.equal(U.ubah('volume',2,'l','ml'),2000);
  assert.equal(U.angka(2500),'2.500');assert.equal(U.angka(.75),'0,75');
  assert.equal(U.faktorWaktu('jam','detik'),3600);assert.equal(U.faktorWaktu('minggu','jam'),168);assert.equal(U.faktorWaktu('menit','jam'),1/60);
});
test('Pengukuran: tangga satuan dan singkatan cocok',()=>{
  for(const b of['panjang','volume','berat']){const T=U.TANGGA[b];assert.equal(T.satuan.length,7);assert.equal(T.kata.length,7);
    assert.equal(T.kata.join(' '),U.SINGKAT[b].kalimat);
    /* huruf depan kata = huruf depan satuan (Kakek=k, Hendak=h, Datang=d, Mampir=m, Dengan=d, Cucu=c, Manis=m) */
    T.kata.forEach((k,i)=>assert.equal(k[0].toLowerCase(),T.satuan[i][0],b+' '+k))}
  const W=U.TANGGA.waktu;assert.equal(W.kata.join(' '),U.SINGKAT.waktu.kalimat);W.kata.forEach((k,i)=>assert.equal(k.slice(0,2).toLowerCase(),W.satuan[i].slice(0,2)));
});
test('Pengukuran: semua soal punya 4 pilihan berbeda dan kunci benar',()=>{
  const jenis=new Set();
  for(const j of['campur','panjang','volume','berat','waktu'])for(let lv=1;lv<=3;lv++)for(let s=1;s<=150;s++)for(let i=0;i<8;i++){
    const q=U.soal(s*13,i,lv,j),m=`${j} L${lv} s${s} i${i}: ${q.teks}`;jenis.add(q.besaran+':'+q.jenis);
    assert.equal(q.opsi.length,4,m);assert.equal(new Set(q.opsi).size,4,m+' '+q.opsi.join('|'));
    assert(q.benar>=0&&q.benar<4,m);
    for(const t of[q.teks,...q.opsi,...q.kunci,q.gambar||''])assert(!/NaN|undefined|Infinity|null/.test(t),m+' -> '+t);
    assert(q.opsi.every(o=>o.trim()===o&&o.length),m+' '+q.opsi.join('|'));
    assert(q.opsi.every(o=>!/^-|−\d/.test(o)),m+' negatif '+q.opsi.join('|'));
    if(j!=='campur')assert.equal(q.besaran,j==='waktu'&&q.jenis==='alat'?'waktu':j,m);
    if(q.jenis==='ubah'&&q.besaran!=='waktu'){const L=q.lompat;assert.equal(angkaDari(q.opsi[q.benar]),U.ubah(L.besaran,L.nilai,L.dari,L.ke),m)}
    if(q.jenis==='ubah'&&q.besaran==='waktu'){const L=q.lompat;assert(Math.abs(angkaDari(q.opsi[q.benar])-L.nilai*U.faktorWaktu(L.dari,L.ke))<1e-9,m)}
    if(q.jenis==='banding'){assert(q.kunci.at(-1).endsWith(q.opsi[q.benar]),m);const T=U.TANGGA[q.besaran];for(const bagian of q.kunci[1].split('; ')){const[kiri,kanan]=bagian.split(' = ');if(!kanan)continue;const[x,u]=kiri.split(' '),[y]=kanan.split(' ');assert.equal(U.ubah(q.besaran,angkaDari(x),u,T.pokok),angkaDari(y),m+' '+bagian)}}
    if(q.lompat){const T=U.TANGGA[q.lompat.besaran].satuan;assert(T.includes(q.lompat.dari)&&T.includes(q.lompat.ke),m)}}
  for(const k of['panjang:ubah','panjang:jumlah','panjang:banding','panjang:cerita','panjang:alat','volume:alat','berat:alat','berat:cerita','volume:cerita',
    'waktu:ubah','waktu:gabung','waktu:pecah','waktu:durasi','waktu:selesai','waktu:tahun','waktu:detik','waktu:alat'])assert(jenis.has(k),'tidak muncul: '+k);
});
test('Pengukuran: kunci durasi dan pukul selesai dihitung dengan 60 menit',()=>{
  for(let s=1;s<300;s++)for(let lv=2;lv<=3;lv++){const q=U.soal(s,0,lv,'waktu');
    if(q.jenis==='selesai'){const[, a,dur]=q.teks.match(/pukul (\d\d\.\d\d) selama (.+?)\. /)||[];assert(a,q.teks);
      const mnt=(dur.match(/(\d+) jam/)?.[1]||0)*60+ +(dur.match(/(\d+) menit/)?.[1]||0),[h,m]=a.split('.').map(Number),e=h*60+m+mnt;
      assert.equal(q.opsi[q.benar],U.jamTeks(Math.floor(e/60),e%60),q.teks)}
    if(q.jenis==='durasi'){const t=q.teks.match(/(\d\d)\.(\d\d)/g).map(x=>x.split('.').map(Number)),d=t[1][0]*60+t[1][1]-t[0][0]*60-t[0][1];assert.equal(q.opsi[q.benar],U.lamaTeks(d),q.teks)}}
});
test('Pengukuran: soal sama untuk semua pemain (seed sama)',()=>{
  assert.deepEqual(U.soal(77,5,2,'campur'),U.soal(77,5,2,'campur'));
  const b=new Set();for(let i=0;i<4;i++)b.add(U.soal(77,i,2,'campur').besaran);assert.equal(b.size,4);
});
