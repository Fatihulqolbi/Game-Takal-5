/* Bab 5 Soal TKA: format paket, pencocokan angka, dan skor. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../soal/js/soal-core.js'),P=require('../soal/data/latihan-1.js');

test('Soal: angka Indonesia dibaca benar',()=>{
  assert.equal(C.angka('292.500'),292500);assert.equal(C.angka('Rp 292500'),292500);assert.equal(C.angka('3,75'),3.75);assert.equal(C.angka('7.2'),7.2);
  assert(Number.isNaN(C.angka('')));assert(Number.isNaN(C.angka('abc')));assert.equal(C.tampil(273000),'273.000');assert.equal(C.tampil(3.75),'3,75');
});
test('Soal: paket lengkap dan gambarnya ada',()=>{
  const L=C.datar(P);assert.equal(L.length,15);
  L.forEach((b,i)=>{
    assert(b.teks&&b.bahas&&b.bagian.length,'butir '+(i+1));
    if(b.gambar){assert(b.alt);assert(fs.existsSync(path.join(__dirname,'../soal',b.gambar)),b.gambar)}
    b.bagian.forEach(g=>{
      if(g.kind==='angka')assert(Number.isFinite(g.jawab));
      else if(g.kind==='pg'){assert(g.opsi.length>=3&&new Set(g.opsi).size===g.opsi.length);assert(g.benar>=0&&g.benar<g.opsi.length)}
      else{assert.equal(g.kind,'bs');assert(g.baris.some(r=>r.benar)&&g.baris.some(r=>!r.benar))}
    });
  });
});
test('Soal: kunci jawaban memberi skor 100, kosong 0',()=>{
  const kunci=C.datar(P).map(b=>b.bagian.map(g=>g.kind==='angka'?String(g.jawab).replace('.',','):g.kind==='pg'?g.benar:g.baris.map(r=>r.benar)));
  assert.deepEqual(C.nilai(P,kunci),{hasil:Array(15).fill(true),benar:15,total:15,skor:100});
  assert.equal(C.nilai(P,[]).skor,0);
});
test('Soal: satu bagian salah membuat butir salah',()=>{
  const kunci=C.datar(P).map(b=>b.bagian.map(g=>g.kind==='angka'?String(g.jawab):g.kind==='pg'?g.benar:g.baris.map(r=>r.benar)));
  kunci[3][0]='14';const r=C.nilai(P,kunci);assert.equal(r.benar,14);assert.equal(r.hasil[3],false);assert.equal(r.skor,93);
});
