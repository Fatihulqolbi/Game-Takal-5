/* =========================================================
   DIMENSIA · data dan logika bangun datar 2D
   Tanpa DOM, jadi bisa diuji dengan Node.
   Bangun disimpan sebagai titik sudut pada kertas berpetak (1 petak = 1 satuan).
   Di tahap 2D anak belajar SISI, KELILING, dan LUAS. Karena itu setiap ukuran dipilih
   supaya semua panjang sisinya bilangan bulat (memakai segitiga 3-4-5 dan 6-8-10),
   sehingga keliling bisa dijumlahkan tanpa akar.
   ========================================================= */
const DP=(()=>{
const rng=typeof DK!=='undefined'?DK.rng:require('./kubus-data.js').rng;
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
function kocok(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* Setiap bangun punya beberapa ukuran (varian). Alas selalu mendatar di y = 0. */
const BENTUK=[
  {id:'persegi',nama:'Persegi',lv:1,varian:[[[0,0],[4,0],[4,4],[0,4]],[[0,0],[3,0],[3,3],[0,3]],[[0,0],[5,0],[5,5],[0,5]]]},
  {id:'persegi-panjang',nama:'Persegi panjang',lv:1,varian:[[[0,0],[6,0],[6,4],[0,4]],[[0,0],[7,0],[7,3],[0,3]],[[0,0],[8,0],[8,5],[0,5]]]},
  {id:'segitiga-siku',nama:'Segitiga siku-siku',lv:1,varian:[[[0,0],[4,0],[0,3]],[[0,0],[8,0],[0,6]],[[0,0],[6,0],[0,8]]]},
  {id:'segitiga-sama-kaki',nama:'Segitiga sama kaki',lv:1,varian:[[[0,0],[6,0],[3,4]],[[0,0],[8,0],[4,3]]]},
  {id:'jajargenjang',nama:'Jajargenjang',lv:2,varian:[[[0,0],[6,0],[9,4],[3,4]],[[0,0],[7,0],[10,4],[3,4]],[[0,0],[6,0],[10,3],[4,3]]]},
  {id:'trapesium',nama:'Trapesium',lv:2,varian:[[[0,0],[10,0],[7,4],[3,4]],[[0,0],[8,0],[5,4],[3,4]],[[0,0],[7,0],[4,4],[0,4]]]},
  {id:'belah-ketupat',nama:'Belah ketupat',lv:2,varian:[[[4,0],[8,3],[4,6],[0,3]],[[3,0],[6,4],[3,8],[0,4]]]},
  {id:'segilima',nama:'Segilima',lv:3,varian:[[[0,0],[6,0],[6,4],[3,8],[0,4]],[[0,0],[8,0],[8,3],[4,6],[0,3]]]},
  {id:'segienam',nama:'Segienam',lv:3,varian:[[[0,3],[4,0],[8,0],[12,3],[8,6],[4,6]],[[0,4],[3,0],[6,0],[9,4],[6,8],[3,8]]]}
];
BENTUK.forEach(b=>b.t=b.varian[0]);
const cari=id=>BENTUK.find(b=>b.id===id);
const NAMA_N={3:'segitiga',4:'segiempat',5:'segilima',6:'segienam',7:'segitujuh'};
const sama=(a,b)=>Math.abs(a-b)<1e-6;
const fmt=p=>sama(p,Math.round(p))?''+Math.round(p):'≈ '+p.toFixed(1).replace('.',',');
const angka=v=>String(Math.round(v*100)/100).replace('.',',');

function sifat(t){
  const n=t.length;let A=0;
  for(let i=0;i<n;i++){const a=t[i],b=t[(i+1)%n];A+=a[0]*b[1]-b[0]*a[1]}
  const ccw=A>0;
  const sisi=t.map((a,i)=>{const b=t[(i+1)%n];return{d:[b[0]-a[0],b[1]-a[1]],p:Math.hypot(b[0]-a[0],b[1]-a[1])}});
  const sudut=t.map((b,i)=>{const a=t[(i+n-1)%n],c=t[(i+1)%n],u=[a[0]-b[0],a[1]-b[1]],v=[c[0]-b[0],c[1]-b[1]];
    let g=Math.atan2(v[0]*u[1]-v[1]*u[0],v[0]*u[0]+v[1]*u[1])*180/Math.PI;if(!ccw)g=-g;if(g<0)g+=360;return g});
  const pasang=[];
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(sisi[i].d[0]*sisi[j].d[1]-sisi[i].d[1]*sisi[j].d[0])<1e-9)pasang.push([i,j]);
  const p=sisi.map(s=>s.p);
  return{n,ccw,sisi,sudut,pasang,panjang:p,siku:sudut.filter(g=>sama(g,90)).length,
    luas:Math.abs(A)/2,keliling:p.reduce((x,y)=>x+y,0),
    semuaSama:p.every(x=>sama(x,p[0])),adaSama:p.some((x,i)=>p.some((y,j)=>j>i&&sama(x,y)))};
}

/* Rumus luas dan keliling dengan angka dari bangun itu sendiri (bangun dalam posisi asal, alas mendatar).
   Nilai luasnya diuji sama dengan luas hasil hitungan titik (rumus shoelace). */
function rumus(id,t){
  const S=sifat(t),xs=t.map(p=>p[0]),ys=t.map(p=>p[1]),W=Math.max(...xs)-Math.min(...xs),H=Math.max(...ys)-Math.min(...ys);
  const alas=S.panjang[0],u='satuan persegi';
  let teks,nilai;
  switch(id){
    case'persegi':teks=`sisi × sisi = ${W} × ${W}`;nilai=W*W;break;
    case'persegi-panjang':teks=`panjang × lebar = ${W} × ${H}`;nilai=W*H;break;
    case'segitiga-siku':case'segitiga-sama-kaki':teks=`alas × tinggi : 2 = ${alas} × ${H} : 2`;nilai=alas*H/2;break;
    case'jajargenjang':teks=`alas × tinggi = ${alas} × ${H}`;nilai=alas*H;break;
    case'trapesium':{const atas=S.panjang[2];teks=`(sisi bawah + sisi atas) × tinggi : 2 = (${alas} + ${atas}) × ${H} : 2`;nilai=(alas+atas)*H/2;break}
    case'belah-ketupat':teks=`diagonal 1 × diagonal 2 : 2 = ${W} × ${H} : 2`;nilai=W*H/2;break;
    case'segilima':{const dinding=t[2][1],atap=H-dinding;teks=`persegi panjang + segitiga atap = ${W} × ${dinding} + ${W} × ${atap} : 2 = ${W*dinding} + ${W*atap/2}`;nilai=W*dinding+W*atap/2;break}
    case'segienam':{const tengah=S.panjang[1],samping=(W-tengah)/2;teks=`persegi panjang tengah + 2 segitiga = ${tengah} × ${H} + 2 × (${H} × ${samping} : 2) = ${tengah*H} + ${H*samping}`;nilai=tengah*H+H*samping;break}
    default:teks='hitung petaknya';nilai=S.luas;
  }
  const bagian=S.panjang.map(angka);
  const kel=S.semuaSama?`${S.n} × ${bagian[0]}`:bagian.join(' + ');
  return{luas:nilai,keliling:S.keliling,
    teksLuas:`Luas = ${teks} = ${angka(nilai)} ${u}.`,
    teksKeliling:`Keliling = jumlah semua sisi = ${kel} = ${angka(S.keliling)} satuan.`};
}

/* Pernyataan PGK-Kategori tentang sisi, keliling, dan luas. Nilai kebenarannya selalu dihitung dari bangun. */
function nilai(q,S){
  switch(q.j){
    case'sisi':case'golong':return S.n===q.k;
    case'semuaSama':return S.semuaSama;
    case'adaSama':return S.adaSama;
    case'keliling':return sama(S.keliling,q.k);
    case'luas':return sama(S.luas,q.k);
  }
}
function teks(q){
  switch(q.j){
    case'sisi':return`Bangun ini memiliki ${q.k} sisi.`;
    case'golong':return`Bangun ini termasuk ${NAMA_N[q.k]}.`;
    case'semuaSama':return'Semua sisi bangun ini sama panjang.';
    case'adaSama':return'Ada dua sisi pada bangun ini yang sama panjang.';
    case'keliling':return`Keliling bangun ini ${angka(q.k)} satuan.`;
    case'luas':return`Luas bangun ini ${angka(q.k)} satuan persegi.`;
  }
}
function alasan(q,S,R){
  const daftar=S.panjang.map(fmt).join('; ');
  switch(q.j){
    case'sisi':return`Hitung sisinya satu per satu: bangun ini memiliki ${S.n} sisi.`;
    case'golong':return`Bangun dengan ${S.n} sisi disebut ${NAMA_N[S.n]}.`;
    case'semuaSama':return`Panjang sisinya ${daftar} satuan. ${S.semuaSama?'Semuanya sama panjang.':'Tidak semuanya sama panjang.'}`;
    case'adaSama':return`Panjang sisinya ${daftar} satuan. ${S.adaSama?'Ada sisi yang sama panjang.':'Tidak ada sisi yang sama panjang.'}`;
    case'keliling':return R.teksKeliling;
    case'luas':return R.teksLuas;
  }
}
function ubah(t,q,balik){
  let p=t.map(a=>[balik?-a[0]:a[0],a[1]]);
  for(let i=0;i<q;i++)p=p.map(a=>[-a[1],a[0]]);
  const mx=Math.min(...p.map(a=>a[0])),my=Math.min(...p.map(a=>a[1]));
  return p.map(a=>[a[0]-mx,a[1]-my]);
}
function soal(seed,level){
  const r=rng(seed);
  const calon=BENTUK.filter(b=>b.lv===level),lain=BENTUK.filter(b=>b.lv<level);
  const b=(lain.length&&r()<.25)?lain[ri(r,0,lain.length-1)]:calon[ri(r,0,calon.length-1)];
  const v=ri(r,0,b.varian.length-1),asal=b.varian[v],R=rumus(b.id,asal);
  const t=level>1?ubah(asal,ri(r,0,3),r()<.5):asal.map(a=>a.slice()),S=sifat(t),n=S.n;
  const geser=()=>r()<.5?1:-1;
  const kand=[{j:'sisi',k:r()<.5?n:n+geser()},{j:'golong',k:r()<.5?n:(n===3?4:n===6?5:n+geser())},{j:'semuaSama'},
    {j:'keliling',k:r()<.5?S.keliling:S.keliling+2*geser()}];
  if(level>1)kand.push({j:'adaSama'},{j:'luas',k:r()<.5?S.luas:Math.max(1,S.luas+(r()<.5?2:4)*geser())});
  const m=level>1?4:3;let pilih=kocok(r,kand).slice(0,m);
  for(let i=0;i<30;i++){const v=pilih.map(q=>nilai(q,S));if(v.includes(true)&&v.includes(false))break;pilih=kocok(r,kand).slice(0,m)}
  return{jenis:'pgk',seed,level,bentuk:b.id,varian:v,titik:t,rumus:R,
    teks:'Perhatikan bangun pada kertas berpetak. Satu petak panjangnya 1 satuan. Tentukan Benar atau Salah untuk setiap pernyataan.',
    pernyataan:pilih.map(q=>({j:q.j,k:q.k,teks:teks(q),benar:nilai(q,S),alasan:alasan(q,S,R)}))};
}
/* Validator: hitung ulang dari titik yang ditampilkan dan pastikan memutar/membalik tidak mengubah ukuran. */
function periksa(s){
  const g=[],S=sifat(s.titik),asal=cari(s.bentuk),A=asal&&sifat(asal.varian[s.varian]);
  if(!A)g.push('bentuk tidak dikenal');
  else{
    const urut=x=>x.slice().sort((a,b)=>a-b).map(v=>v.toFixed(6)).join();
    if(A.n!==S.n||!sama(A.luas,S.luas)||urut(A.panjang)!==urut(S.panjang))g.push('ukuran berubah setelah diputar/dibalik');
    if(!sama(s.rumus.luas,S.luas))g.push('rumus luas tidak cocok dengan petak');
  }
  if(!s.titik.every(p=>Number.isInteger(p[0])&&Number.isInteger(p[1])))g.push('titik tidak di perpotongan petak');
  if(!S.panjang.every(p=>sama(p,Math.round(p))))g.push('ada sisi yang panjangnya bukan bilangan bulat');
  if(s.pernyataan.length<3)g.push('pernyataan kurang');
  if(new Set(s.pernyataan.map(q=>q.teks)).size!==s.pernyataan.length)g.push('pernyataan kembar');
  for(const q of s.pernyataan)if(nilai(q,S)!==q.benar)g.push('kunci pernyataan salah: '+q.teks);
  return{ok:!g.length,galat:g};
}
function buat(seed,level){
  for(let i=0;i<60;i++){const s=soal(seed+i,level);if(periksa(s).ok)return s}
  return soal(1,1);
}
return{BENTUK,NAMA_N,cari,sifat,rumus,nilai,fmt,angka,buat,periksa,ubah};
})();
if(typeof module!=='undefined')module.exports=DP;
