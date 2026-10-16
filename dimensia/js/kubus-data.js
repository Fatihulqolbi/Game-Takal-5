/* =========================================================
   DIMENSIA · data dan logika susunan kubus
   Tanpa DOM, jadi bisa diuji dengan Node.
   Koordinat: x = kiri ke kanan, y = tinggi, z = depan ke belakang.
   Sisi DEPAN bangun ada di z paling kecil. Semua jawaban dihitung dari
   daftar koordinat ini, bukan dari gambar.
   ========================================================= */
const DK=(()=>{
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
function kocok(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* Peta tinggi h[z][x] -> daftar kubus. Baris pertama = baris paling depan. */
const CONTOH15=[[1,1,0],[2,2,1],[3,3,2]];
function dariTinggi(h){const k=[];h.forEach((row,z)=>row.forEach((t,x)=>{for(let y=0;y<t;y++)k.push({x,y,z})}));return k}
function ukuran(k){return{W:Math.max(...k.map(c=>c.x))+1,H:Math.max(...k.map(c=>c.y))+1,D:Math.max(...k.map(c=>c.z))+1}}
function petaTinggi(k){const{W,D}=ukuran(k),h=Array.from({length:D},()=>Array(W).fill(0));for(const c of k)h[c.z][c.x]=Math.max(h[c.z][c.x],c.y+1);return h}

function validasi(k){
  const g=[],s=new Set();
  if(!k.length)g.push('susunan kosong');
  for(const c of k){
    if(![c.x,c.y,c.z].every(v=>Number.isInteger(v)&&v>=0))g.push('koordinat harus bilangan bulat tidak negatif');
    const id=c.x+','+c.y+','+c.z;if(s.has(id))g.push('posisi ganda '+id);s.add(id);
  }
  for(const c of k)if(c.y>0&&!s.has(c.x+','+(c.y-1)+','+c.z))g.push('kubus melayang di '+c.x+','+c.y+','+c.z);
  return{ok:!g.length,galat:g};
}
function lapisan(k){const a=Array(ukuran(k).H).fill(0);for(const c of k)a[c.y]++;return a}
/* Kubus yang pasti tidak terlihat dari kamera awal (depan-kanan-atas):
   sisi atas, depan, dan kanannya tertutup kubus lain. */
function tertutup(k){const s=new Set(k.map(c=>c.x+','+c.y+','+c.z)),ada=(x,y,z)=>s.has(x+','+y+','+z);
  return k.filter(c=>ada(c.x,c.y+1,c.z)&&ada(c.x,c.y,c.z-1)&&ada(c.x+1,c.y,c.z)).length}

/* Proyeksi ortografis. Hasil: baris dari atas ke bawah, kolom dari kiri ke kanan seperti di gambar.
   depan   : kiri-kanan = x,           atas-bawah = tinggi
   atas    : kiri-kanan = x,           baris atas = belakang
   samping : (dari kanan) kolom kiri = depan
   kiri    : (dari kiri)  kolom kiri = belakang */
function proyeksi(k,arah){
  const{W,H,D}=ukuran(k);let C,Rr,f;
  if(arah==='depan'){C=W;Rr=H;f=c=>[c.x,H-1-c.y]}
  else if(arah==='atas'){C=W;Rr=D;f=c=>[c.x,D-1-c.z]}
  else if(arah==='samping'){C=D;Rr=H;f=c=>[c.z,H-1-c.y]}
  else{C=D;Rr=H;f=c=>[D-1-c.z,H-1-c.y]}
  const g=Array.from({length:Rr},()=>Array(C).fill(0));
  for(const c of k){const[a,b]=f(c);g[b][a]=1}
  return g;
}
const kunci=g=>g.map(r=>r.join('')).join('/');
const kisiKolom=(hs,Rr)=>Array.from({length:Rr},(_,r)=>hs.map(t=>t>=Rr-r?1:0));

/* Generator. Susunan "tangga": tinggi tumpukan tidak pernah naik ke arah depan maupun ke kanan,
   sehingga puncak setiap tumpukan terlihat dari kamera awal dan jumlah kubus bisa ditentukan dari gambar. */
const LV=[null,{W:3,D:2,H:2,min:5,max:9},{W:3,D:3,H:3,min:9,max:16},{W:4,D:3,H:3,min:14,max:24}];
function tangga(r,p){
  const h=Array.from({length:p.D},()=>Array(p.W).fill(0));
  for(let z=p.D-1;z>=0;z--)for(let x=0;x<p.W;x++){
    const batas=Math.min(z<p.D-1?h[z+1][x]:p.H,x>0?h[z][x-1]:p.H);
    h[z][x]=(z===p.D-1&&x===0)?p.H:Math.max(0,batas-(r()<.45?0:r()<.75?1:2));
  }
  return h;
}
function buatSusunan(r,level){
  const p=LV[level]||LV[2];
  for(let i=0;i<300;i++){
    const k=dariTinggi(tangga(r,p)),n=k.length,lap=lapisan(k);
    if(n<p.min||n>p.max)continue;
    if(lap.length<2||lap[0]===lap[lap.length-1])continue;
    if(level>1&&tertutup(k)<1)continue;
    return k;
  }
  return dariTinggi(CONTOH15);
}
/* Untuk Lab Bebas: tumpukan acak, boleh ada yang tersembunyi di belakang. */
function buatBebas(seed){
  const r=rng(seed),W=ri(r,3,4),D=3;
  for(let i=0;i<100;i++){
    const h=Array.from({length:D},()=>Array.from({length:W},()=>r()<.2?0:ri(r,1,3)));
    const k=dariTinggi(h);
    if(k.length>=8&&k.length<=26&&ukuran(k).W===W&&ukuran(k).D===D)return k;
  }
  return dariTinggi(CONTOH15);
}

const NAMA_ARAH={depan:'depan',atas:'atas',samping:'samping kanan'};
function soalHitung(seed,level,contoh){
  const r=rng(seed),k=contoh?dariTinggi(CONTOH15):buatSusunan(r,level),N=k.length;
  let geser=contoh?2:ri(r,0,3);if(N-geser<1)geser=N-1;
  const lap=lapisan(k),tt=tertutup(k);
  const bahas=[
    'Hitung per lapisan, mulai dari bawah: '+lap.map((n,i)=>`lapisan ${i+1} ada ${n} kubus`).join(', ')+'.',
    `${lap.join(' + ')} = ${N}. Jadi seluruhnya ada ${N} kubus satuan.`
  ];
  if(tt>0)bahas.push(`Ada ${tt} kubus yang tertutup rapat. Di atas, di depan, dan di kanannya ada kubus lain, jadi kubus itu tidak terlihat dari sudut pandang awal. Kubus itu tetap harus dihitung.`);
  return{jenis:'hitung',seed,level,kubus:k,lap,
    teks:'Bangun ini disusun dari kubus satuan. Setiap kubus yang berada di atas selalu ditopang kubus di bawahnya, dan tidak ada tumpukan yang tersembunyi di belakang tumpukan yang lebih tinggi. Berapa banyak kubus satuan seluruhnya?',
    opsi:[0,1,2,3].map(i=>N-geser+i),benar:geser,bahas};
}
function soalTampak(seed,level){
  const r=rng(seed),k=buatSusunan(r,level),{H}=ukuran(k),h=petaTinggi(k);
  const arah=level<2?(r()<.5?'depan':'atas'):['depan','atas','samping'][ri(r,0,2)];
  const benar=proyeksi(k,arah),kand=[];
  let hs=null;
  if(arah==='atas'){
    kand.push(benar.map(row=>row.slice().reverse()),benar.slice().reverse());
    const ubah=[];
    benar.forEach((row,a)=>row.forEach((v,b)=>{const g=benar.map(x=>x.slice());g[a][b]=v?0:1;if(g.flat().some(Boolean))ubah.push(g)}));
    kand.push(...kocok(r,ubah));
  }else{
    hs=arah==='depan'?h[0].map((_,x)=>Math.max(...h.map(row=>row[x]))):h.map(row=>Math.max(...row));
    kand.push(kisiKolom(hs.slice().reverse(),H));
    const ubah=[];
    hs.forEach((t,i)=>{for(const d of[1,-1]){const v=hs.slice();v[i]=t+d;if(v[i]>=1&&v[i]<=H)ubah.push(kisiKolom(v,H))}});
    kand.push(...kocok(r,ubah));
  }
  for(const a of['depan','samping','atas','kiri'])if(a!==arah)kand.push(proyeksi(k,a));
  const pakai=new Set([kunci(benar)]),salah=[];
  for(const g of kand){const id=kunci(g);if(!pakai.has(id)){pakai.add(id);salah.push(g)}if(salah.length===3)break}
  const urut=kocok(r,[0,1,2,3]),semua=[benar,...salah],opsi=urut.map(i=>semua[i]),ib=urut.indexOf(0);
  const bahas=[];
  if(arah==='depan')bahas.push('Lihat dari arah panah DEPAN. Setiap kolom terlihat setinggi tumpukan tertingginya.',`Tinggi kolom dari kiri ke kanan: ${hs.join(', ')} kotak.`);
  else if(arah==='samping')bahas.push('Lihat dari samping kanan. Bagian depan bangun berada di sebelah kiri gambar.',`Tinggi kolom dari kiri ke kanan: ${hs.join(', ')} kotak.`);
  else bahas.push('Dari atas, yang terlihat adalah bentuk alasnya. Tinggi tumpukan tidak terlihat.',`Banyak kotak tiap baris, dari belakang ke depan: ${benar.map(row=>row.reduce((a,b)=>a+b,0)).join(', ')}.`);
  bahas.push(`Jadi gambar yang sesuai adalah pilihan ${'ABCD'[ib]}.`);
  return{jenis:'tampak',seed,level,kubus:k,arah,
    teks:`Perhatikan bangun dari kubus satuan ini. Panah pada alas menunjukkan sisi DEPAN. Manakah gambar tampak ${NAMA_ARAH[arah]} bangun tersebut?`,
    opsi,benar:ib,bahas};
}

/* Validator: konstruksi, pilihan, dan kunci harus konsisten dengan data koordinat. */
function periksa(s){
  const g=validasi(s.kubus).galat.slice();
  if(!s.opsi||s.opsi.length!==4||s.opsi.some(o=>o===undefined))g.push('pilihan harus empat');
  else if(s.jenis==='hitung'){
    if(new Set(s.opsi).size!==4)g.push('pilihan kembar');
    if(s.opsi.filter(o=>o===s.kubus.length).length!==1||s.opsi[s.benar]!==s.kubus.length)g.push('kunci tidak sama dengan jumlah kubus');
    if(s.opsi.some(o=>o<1))g.push('pilihan tidak masuk akal');
    if(s.lap.reduce((a,b)=>a+b,0)!==s.kubus.length)g.push('jumlah lapisan tidak sama dengan jumlah kubus');
  }else{
    const ids=s.opsi.map(kunci),kb=kunci(proyeksi(s.kubus,s.arah));
    if(new Set(ids).size!==4)g.push('pilihan kembar');
    if(ids.filter(i=>i===kb).length!==1||ids[s.benar]!==kb)g.push('kunci tidak sama dengan proyeksi');
  }
  return{ok:!g.length,galat:g};
}
/* Dua tahap: buat lalu validasi. Kalau gagal, coba kode berikutnya. */
function buat(jenis,seed,level,contoh){
  for(let i=0;i<60;i++){
    const s=jenis==='hitung'?soalHitung(seed+i,level,contoh&&i===0):soalTampak(seed+i,level);
    if(periksa(s).ok)return s;
  }
  return soalHitung(seed,2,true);
}
return{rng,ri,kocok,CONTOH15,dariTinggi,ukuran,petaTinggi,validasi,lapisan,tertutup,proyeksi,kunci,buatBebas,buat,periksa,NAMA_ARAH};
})();
if(typeof module!=='undefined')module.exports=DK;
