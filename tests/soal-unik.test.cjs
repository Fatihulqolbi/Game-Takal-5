/* Semua game: soal dalam satu sesi tidak boleh berulang. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('Pengukuran: 40 soal pertama selalu berbeda',()=>{
  const U=require('../pengukuran/js/ukur-data.js');
  for(const j of['campur','panjang','volume','berat','waktu'])for(let lv=1;lv<=3;lv++)for(let s=1;s<=25;s++){
    const d=U.dek((n,c)=>U.soal(s*101,n,lv,j,c)),k=new Set();for(let i=0;i<40;i++)k.add(U.kunciSoal(d.ambil(i)));assert.equal(k.size,40,`${j} L${lv} s${s}`)}
});
test('Bungkus Kado: 20 pesanan pertama selalu berbeda',()=>{
  const K=require('../dimensia/js/kado-core.js');
  for(const b of['semua','kotak'])for(let lv=1;lv<=3;lv++)for(let s=1;s<=40;s++){
    const p=K.player(0,'T',0,s*37,lv,b),nama=[p.order.nama];for(let i=0;i<19;i++){K.lanjut(p);nama.push(p.order.nama)}
    assert.equal(new Set(nama).size,20,`${b} L${lv} s${s}: ${nama.join(', ')}`);
  }
  /* 4 pemain dengan daftar bersama: tidak ada pesanan kembar antarpemain */
  for(const b of['semua','kotak'])for(let lv=1;lv<=3;lv++)for(let s=1;s<=20;s++){const D=new Set(),P=[0,1,2,3].map(i=>K.player(i,'T',i,s*37+i*7717,lv,b,D)),nama=P.map(p=>p.order.nama);
    for(let k=0;k<4;k++)P.forEach(p=>{K.lanjut(p);nama.push(p.order.nama)});assert.equal(new Set(nama).size,nama.length,b+' L'+lv+' s'+s+': '+nama.join(', '))}
});
test('Lompat Tangga: 4 pemain tidak pernah mendapat soal yang sama',()=>{
  const U=require('../pengukuran/js/ukur-data.js');
  for(const j of['campur','panjang','waktu'])for(let lv=1;lv<=3;lv++)for(let s=1;s<=15;s++){const D=new Set(),deks=[0,1,2,3].map(i=>U.dek((n,c)=>U.soal(s*101+i*7717,n,lv,j,c),D)),k=new Set();
    for(let n=0;n<12;n++)deks.forEach(d=>k.add(U.kunciSoal(d.ambil(n))));assert.equal(k.size,48,j+' L'+lv+' s'+s)}
});
test('Kota Langit: 40 soal pertama selalu berbeda',()=>{
  const Q=require('../dimensia/js/soal-menara.js');
  for(const j of['2d','3d','campur'])for(let lv=1;lv<=3;lv++)for(let s=1;s<=10;s++){const d=Q.deck(s*7,lv,j),k=new Set();for(let i=0;i<40;i++){const q=d.next();k.add(q.text+q.diagram)}assert.equal(k.size,40,`${j} L${lv} s${s}`)}
});
test('Laskar Pecahan: 30 soal pertama selalu berbeda',()=>{
  const ctx={console,Math};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/soal.js'),'utf8')+';this.makeQuestion=makeQuestion',ctx);
  for(const topik of[[1],[2],[3],[4],[5],[6],[1,2,3,4,5,6]])for(let s=0;s<10;s++){const seen=new Set();for(let n=1;n<=30;n++)ctx.makeQuestion(topik,n,seen);assert.equal(seen.size,30,'bab '+topik.join(','))}
});
