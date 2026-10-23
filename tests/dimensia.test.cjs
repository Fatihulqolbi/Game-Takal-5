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
  const deck=Q.deck(87,2),all=[];for(let i=0;i<240;i++)all.push(deck.next());assert.equal(new Set(all.map(q=>q.id)).size,240);assert.equal(new Set(all.slice(0,24).map(q=>q.template)).size,24);assert.equal(new Set(all.map(q=>q.text+q.diagram)).size,240);assert.deepEqual(new Set(all.map(q=>q.type)),new Set(['pg','kategori','multi']));
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
test('Lab Bangun Ruang: volume dan luas permukaan semua bangun cocok dengan rumus baku',()=>{
  const D=require('../dimensia/js/ruang-data.js');assert.deepEqual(D.BENTUK.map(b=>b.id),['kubus','balok','prisma','limas','tabung','kerucut','bola']);
  const PI=r=>r%7===0?22/7:3.14,dekat=(a,b,m)=>assert(Math.abs(a-b)<1e-9,m+': '+a+' ≠ '+b);
  for(const b of D.BENTUK){const daftar=[{}];for(const c of b.ukuran){const nilai=c.pilih?c.pilih.map((_,i)=>i):Array.from({length:c.maks-c.min+1},(_,i)=>c.min+i);const baru=[];for(const d of daftar)for(const v of nilai)baru.push({...d,[c.k]:v});daftar.splice(0,daftar.length,...baru)}
    for(const pil of daftar){const u=D.ukuran(b.id,pil),H=D.hitung(b.id,u),m=b.id+JSON.stringify(u);let V,L;
      switch(b.id){case'kubus':V=u.s**3;L=6*u.s**2;break;case'balok':V=u.p*u.l*u.t;L=2*(u.p*u.l+u.p*u.t+u.l*u.t);break;
        case'prisma':assert.equal(u.a**2+u.b**2,u.c**2);V=u.a*u.b/2*u.t;L=u.a*u.b+(u.a+u.b+u.c)*u.t;break;
        case'limas':assert.equal((u.s/2)**2+u.t**2,u.m**2);V=u.s*u.s*u.t/3;L=u.s*u.s+2*u.s*u.m;break;
        case'tabung':V=PI(u.r)*u.r**2*u.t;L=2*PI(u.r)*u.r*(u.r+u.t);break;
        case'kerucut':assert.equal(u.r**2+u.t**2,u.s**2);V=PI(u.r)*u.r**2*u.t/3;L=PI(u.r)*u.r*(u.r+u.s);break;
        case'bola':V=4/3*PI(u.r)*u.r**3;L=4*PI(u.r)*u.r**2;break}
      dekat(H.volume.nilai,V,m+' volume');dekat(H.luas.nilai,L,m+' luas');dekat(H.luas.bagian.reduce((s,x)=>s+x.nilai*x.banyak,0),L,m+' bagian');
      assert(H.volume.langkah.at(-1).includes(D.angka(V)+' cm³'),m);assert(H.luas.langkah.at(-1).includes(D.angka(L)+' cm²'),m)}}
});
test('Bungkus Kado: pesanan, pilihan, kesabaran, dan nilai kotak sempurna',()=>{
  const K=require('../dimensia/js/kado-core.js');
  const D=require('../dimensia/js/ruang-data.js');
  for(let lv=1;lv<=3;lv++)for(let s=1;s<=120;s++){const jenis=new Set();for(let i=0;i<14;i++){const o=K.pesanan(s*17,i,lv,'semua');jenis.add(o.kind);
    const H=D.hitung(o.kind,o.kind==='kubus'?{s:o.u.s}:o.u),m=o.nama;
    assert(Math.abs(H.volume.nilai-o.V)<.01,m+' V');assert(Math.abs(H.luas.nilai-o.L)<.01,m+' L');assert.notEqual(o.V,o.L,m);
    for(const[ops,b,ans]of[[o.opsiV,o.benarV,o.V],[o.opsiL,o.benarL,o.L]]){assert.equal(ops.length,4);assert.equal(new Set(ops).size,4);assert.equal(ops[b],ans);assert(ops.every(x=>x>0))}
    assert(o.rumusV.endsWith('= '+K.angka(o.V)),o.rumusV);assert(o.rumusL.endsWith('= '+K.angka(o.L)),o.rumusL);assert(o.petunjuk.v&&o.petunjuk.l)}
    assert.equal(jenis.size,7)}
  for(let lv=1;lv<=3;lv++)for(let s=1;s<=200;s++)for(let i=0;i<10;i++){const o=K.pesanan(s*17,i,lv,'kotak');assert(['kubus','balok'].includes(o.kind));
    assert.equal(o.V,o.p*o.l*o.t);assert.equal(o.L,2*(o.p*o.l+o.p*o.t+o.l*o.t));if(o.kind==='kubus')assert(o.p===o.l&&o.l===o.t);
    for(const[ops,b,ans]of[[o.opsiV,o.benarV,o.V],[o.opsiL,o.benarL,o.L]]){assert.equal(ops.length,4);assert.equal(new Set(ops).size,4);assert.equal(ops[b],ans);assert(ops.every(x=>Number.isInteger(x)&&x>0))}
    assert(o.rumusV.endsWith('= '+K.angka(o.V)));assert(o.rumusL.endsWith('= '+K.angka(o.L)))}
  for(let lv=1;lv<=3;lv++)for(let i=1;i<30;i++)assert(K.sabar(lv,i)<=K.sabar(lv,i-1)&&K.sabar(lv,i)>=10&&K.sabar(lv,i,'bola')>K.sabar(lv,i));
  assert.equal(K.settings({bangun:'kotak'}).bangun,'kotak');assert.equal(K.settings({}).bangun,'semua');
  const p=K.player(0,'Tim',0,9,2);p.pilihV=p.order.benarV;p.pilihL=p.order.benarL;assert.equal(K.nilai(p).sempurna,true);K.lanjut(p);
  p.pilihV=p.order.benarV;p.pilihL=(p.order.benarL+1)%4;const h=K.nilai(p);assert.equal(h.sempurna,false);assert.equal(h.v,true);assert.equal(h.l,false);K.lanjut(p);
  K.nilai(p,true);assert.deepEqual([p.sempurna,p.okV,p.okL,p.gagal],[1,2,1,1]);
  const q=K.player(1,'B',1,9,2);assert.equal(K.rank([q,p])[0],p);
});
