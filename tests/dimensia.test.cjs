const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../dimensia/js/menara-core.js');
const Q=require('../dimensia/js/soal-menara.js');
test('Setiap tiga pemasangan berhasil memunculkan soal; penalti tidak mengubah hitungan ini',()=>{
  const p=C.player(0,'Tim uji',0,77);
  for(let i=1;i<=9;i++){
    const result=C.place(p,0);assert.equal(result.question,i%3===0);assert.equal(p.placed,i);
    if(result.question){assert.equal(C.place(p,0).ok,false);C.damage(p,3);p.phase='build'}
  }
  assert.equal(p.blocks.length,0);
});
test('Bangun meleset tidak mendapat tinggi atau memicu soal',()=>{
  const p=C.player(0,'Tim',0,12);assert.equal(C.place(p,8).ok,false);assert.equal(p.placed,0);assert.equal(C.height(p),0);
});
test('Pilihan penalti 0, 3, 5; rumah tidak pernah negatif',()=>{
  for(const penalty of[0,3,5])for(const count of[0,2,7]){const p=C.player(0,'Tim',0,1);for(let i=0;i<count;i++){C.place(p,0);p.phase='build'}const removed=C.damage(p,penalty);assert.equal(removed.length,Math.min(count,penalty));assert.equal(p.blocks.length,Math.max(0,count-penalty));assert(C.height(p)>=0)}
});
test('Urutan bangun adil untuk seluruh pemain dan tetap beragam',()=>{
  const seq=Array.from({length:100},(_,i)=>C.shape(12345,i));assert.equal(new Set(seq.map(s=>s.kind)).size,4);
  for(let i=0;i<4;i++){const p=C.player(i,'Tim',i,12345);for(let n=0;n<50;n++){assert.deepEqual(p.next,seq[n]);C.place(p,0);p.phase='build'}}
});
test('Peringkat berdasarkan tinggi aktual, jawaban benar, lalu susunan tepat',()=>{
  const a=C.player(0,'A',0,1),b=C.player(1,'B',1,1),c=C.player(2,'C',2,1),d=C.player(3,'D',3,1);
  for(const p of[a,b,c,d]){C.place(p,0);p.phase='build'}b.correct=2;c.correct=2;c.perfect=5;C.place(d,0);assert.deepEqual(C.rank([a,b,c,d]).map(p=>p.name),['D','C','B','A']);C.damage(d,5);assert.equal(C.rank([a,b,c,d]).at(-1),d);
});
test('Pengaturan rusak dibatasi ke rentang yang dapat dimainkan',()=>{
  const s=C.settings({players:9,minutes:-1,questionSeconds:'abc',penalty:7,volume:999,names:['   ']});assert.equal(s.players,1);assert.equal(s.minutes,1);assert.equal(s.questionSeconds,30);assert.equal(s.penalty,0);assert.equal(s.volume,100);assert.equal(s.names[0],'Tim Orbo');
});
const formula={
  'luas-persegi-panjang':n=>n[0]*n[1], 'keliling-persegi-panjang':n=>2*(n[0]+n[1]),
  'luas-persegi':n=>n[0]**2, 'keliling-persegi':n=>4*n[0], 'sisi-dari-luas':n=>n[0]/n[1],
  'luas-segitiga':n=>n[0]*n[1]/2, 'luas-gabungan':n=>n[0]*n[1]+n[2]*n[3],
  'ubin':n=>n[0]*n[1]/n[2]**2, 'volume-kubus':n=>n[0]**3, 'volume-balok':n=>n[0]*n[1]*n[2],
  'tinggi-balok':n=>n[0]/n[1]/n[2], 'volume-gabungan':n=>n[0]**3+n[1]**3,
  'sudut-lurus':n=>180-n[0], 'sudut-siku':n=>90-n[0], 'perubahan-ukuran':n=>(n[0]*n[1])**2,
  'sisi-dari-keliling':n=>n[0]/4, 'pagar-berpintu':n=>2*(n[0]+n[1])-n[2]
};
test('Kunci aritmetika dihitung ulang secara independen dari ukuran di teks soal',()=>{
  for(const [template,calculate] of Object.entries(formula))for(let seed=1;seed<=60;seed++)for(let level=1;level<=3;level++){
    const q=Q.make(template,seed,level),numbers=q.text.match(/\d+/g).map(Number);assert.equal(q.answer,calculate(numbers),template+' '+seed);assert.equal(q.values[q.correct],calculate(numbers));
  }
});
test('Semua 24 template menghasilkan opsi unik, kunci valid, dan pembahasan',()=>{
  for(const t of Q.templates)for(let seed=1;seed<=50;seed++)for(let level=1;level<=3;level++){
    const q=Q.make(t,seed,level);assert.deepEqual(Q.validate(q),[],t);assert(Q.correct(q,q.correct));assert(!Q.correct(q,null));
    if(q.type==='pg')assert(!Q.correct(q,(q.correct+1)%4));else assert(!Q.correct(q,q.correct.map((v,i)=>i===0?!v:v)));
  }
});
test('Soal berlanjut melewati banyak putaran; semua tipe mendapat giliran',()=>{
  const deck=Q.deck(87,2),all=[];for(let i=0;i<240;i++)all.push(deck.next());assert.equal(new Set(all.map(q=>q.id)).size,240);for(let i=0;i<240;i+=24)assert.equal(new Set(all.slice(i,i+24).map(q=>q.template)).size,24);assert.deepEqual(new Set(all.map(q=>q.type)),new Set(['pg','kategori','multi']));
});

test('Prinsip keseimbangan: peletakan yang salah ditolak tanpa menjatuhkan bangun',()=>{
  const p=C.player(0,'Tim',0,5);p.next={kind:'balok',width:2,height:1,color:0};
  assert.equal(C.landing(p,2.2).ok,true);assert.equal(C.landing(p,2.3).ok,false);
  assert.equal(C.place(p,0).ok,true);p.phase='build';
  p.next={kind:'balok',width:2,height:1,color:0};assert.equal(C.landing(p,1).ok,true);assert.equal(C.landing(p,1.05).ok,false);
  /* tangga miring: tiap bangun sendiri masih tertopang, tetapi titik berat gabungan keluar dari bangun terbawah */
  p.next={kind:'balok',width:2,height:1,color:0};assert.equal(C.place(p,.9).ok,true);p.phase='build';
  p.next={kind:'balok',width:2,height:1,color:0};const tolak=C.place(p,1.8);
  assert.equal(tolak.ok,false);assert.equal(tolak.reason,'miring');assert.equal(C.landing(p,3).reason,'luar');
  assert.equal(p.blocks.length,2);assert.equal(p.placed,2);assert.equal(p.phase,'build');assert.deepEqual(p.next,{kind:'balok',width:2,height:1,color:0});
  assert.equal(C.place(p,.6).ok,true);assert.equal(p.blocks.length,3);assert.equal(C.unstable(p.blocks),-1);
  /* acak: berapa pun peletakannya, bangun tidak pernah berkurang dan pemain tidak pernah buntu */
  const acak=C.random(77),z=C.player(0,'Tim',0,9);for(let i=0;i<600;i++){const n=z.blocks.length,r=C.place(z,(z.blocks.at(-1)?.x||0)+(acak()-.5)*4);z.phase='build';assert.equal(z.blocks.length,n+(r.ok?1:0));if(!r.ok)assert(['luar','miring'].includes(r.reason))}assert(z.blocks.length>50);
  const q=C.player(0,'Tim',0,5);for(let i=0;i<12;i++){const r=C.place(q,0);q.phase='build';assert.equal(r.fallen.length,0)}assert.equal(q.blocks.length,12);
});
test('Kubus bersisi sama dan setiap bangun punya ukuran positif',()=>{
  for(let i=0;i<300;i++){const b=C.shape(99,i);assert(b.width>0&&b.height>0);if(b.kind==='kubus')assert.equal(b.width,b.height)}
});
test('Bangun datar 2D: semua ukuran bersisi bulat dan rumus luas sama dengan hitungan petak',()=>{
  const P=require('../dimensia/js/poligon-data.js');
  for(const b of P.BENTUK)for(const t of b.varian){const S=P.sifat(t),R=P.rumus(b.id,t);assert(S.panjang.every(p=>Math.abs(p-Math.round(p))<1e-9),b.id);assert.equal(R.luas,S.luas,b.id);assert.equal(R.keliling,S.keliling);assert(R.teksLuas.includes(String(S.luas)));assert(R.teksKeliling.includes(String(S.keliling)))}
  for(let l=1;l<=3;l++)for(let s=1;s<=300;s++){const q=P.buat(s*13,l);assert.deepEqual(P.periksa(q).galat,[]);for(const p of q.pernyataan)assert(['sisi','golong','semuaSama','adaSama','keliling','luas'].includes(p.j))}
});
test('Kota Langit: pengaturan Soal 2D, Soal 3D, atau keduanya',()=>{
  assert.equal(C.settings({}).soal,'campur');assert.equal(C.settings({soal:'2d'}).soal,'2d');assert.equal(C.settings({soal:'x'}).soal,'campur');
  for(const jenis of['2d','3d']){const d=Q.deck(11,2,jenis),semua=Q.pilihan(jenis);assert(semua.length>=8);for(let i=0;i<80;i++)assert.equal(Q.dimensi(d.next().template),jenis)}
  assert.equal(Q.pilihan('2d').length+Q.pilihan('3d').length,Q.templates.length);
});
