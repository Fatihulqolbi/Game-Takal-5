/* =========================================================
   PENYAJIAN DATA · data acak, gambar sajian (SVG), dan pembuat soal.
   Tanpa DOM, jadi bisa diuji dengan Node.
   Sajian: diagram batang, piktogram, tabel, dan turus (kisi-kisi TKA no. 26–30).
   Bentuk soal mengikuti TKA: PG, PGK MCMA (pilih semua yang benar), dan PGK Kategori (benar/salah).
   Setiap soal membawa `anim`: resep animasi pembahasan untuk data-anim.js
   (garis bantu, potong selisih, tumpuk jumlah, gandakan batang, garis batas, bedah ikon).
   ========================================================= */
const DT=(()=>{
/* ---------- acak & angka ---------- */
function random(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),pilih=(r,a)=>a[Math.floor(r()*a.length)];
function acak(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const angka=x=>{const[b,d]=String(Math.abs(x)).split('.');return(x<0?'−':'')+b.replace(/\B(?=(\d{3})+(?!\d))/g,'.')+(d?','+d:'')};
const besar=s=>s[0].toUpperCase()+s.slice(1);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const jumlah=a=>a.reduce((s,v)=>s+v,0);
const WARNA=['#ff6b6b','#ffb74d','#ffd54f','#81c784','#4fc3f7','#9575cd'],INK='#1e2a4a';

/* ---------- konteks soal: kalimat dibuat per konteks supaya terdengar wajar ---------- */
const KONTEKS=[
  {id:'perpus',judul:'Pengunjung Perpustakaan',kat:'Hari',urut:true,waktu:true,label:['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],satuan:'siswa',ikon:'🧒',jamak:'hari',
    f:x=>`banyak pengunjung hari ${x}`,f2:(a,b)=>`banyak pengunjung hari ${a} dan hari ${b}`,semua:n=>`pengunjung selama ${n} hari itu`,
    tanya:k=>`Pada hari apa pengunjung paling ${k}?`,paling:(x,k)=>`Pengunjung paling ${k} datang pada hari ${x}.`,syarat:(op,b)=>`hari yang pengunjungnya ${op} ${b} siswa`},
  {id:'buku',judul:'Buku yang Dibaca',kat:'Nama',label:['Rina','Dika','Siti','Bayu','Nisa','Rudi','Ayu','Fajar'],satuan:'buku',ikon:'📚',jamak:'anak',
    f:x=>`banyak buku yang dibaca ${x}`,f2:(a,b)=>`banyak buku yang dibaca ${a} dan ${b}`,semua:n=>`buku yang dibaca ${n} anak itu`,
    tanya:k=>`Siapa yang membaca buku paling ${k}?`,paling:(x,k)=>`${x} membaca buku paling ${k}.`,syarat:(op,b)=>`anak yang membaca ${op} ${b} buku`},
  {id:'panen',judul:'Hasil Panen Buah',kat:'Buah',kecil:true,label:['Mangga','Jeruk','Pisang','Apel','Rambutan','Salak'],satuan:'kg',ikon:'🍊',jamak:'jenis buah',
    f:x=>`hasil panen ${x}`,f2:(a,b)=>`hasil panen ${a} dan ${b}`,semua:()=>'hasil panen semua buah',
    tanya:k=>`Buah apa yang hasil panennya paling ${k}?`,paling:(x,k)=>`Hasil panen paling ${k} adalah ${x}.`,syarat:(op,b)=>`jenis buah yang hasil panennya ${op} ${b} kg`},
  {id:'kantin',judul:'Jajanan Terjual di Kantin',kat:'Jajanan',kecil:true,label:['Roti','Bakwan','Donat','Pisang goreng','Risol','Lemper'],satuan:'potong',ikon:'🍩',jamak:'jenis jajanan',
    f:x=>`banyak ${x} yang terjual`,f2:(a,b)=>`banyak ${a} dan ${b} yang terjual`,semua:()=>'jajanan yang terjual',
    tanya:k=>`Jajanan apa yang paling ${k} terjual?`,paling:(x,k)=>`Jajanan yang paling ${k} terjual adalah ${x}.`,syarat:(op,b)=>`jenis jajanan yang terjual ${op} ${b} potong`},
  {id:'hobi',judul:'Hobi Siswa Kelas 6',kat:'Hobi',kecil:true,label:['Sepak bola','Menari','Membaca','Menggambar','Bernyanyi','Bulu tangkis'],satuan:'siswa',ikon:'🙂',jamak:'hobi',
    f:x=>`banyak siswa yang hobinya ${x}`,f2:(a,b)=>`banyak siswa yang hobinya ${a} dan ${b}`,semua:()=>'siswa yang ditanya',
    tanya:k=>`Hobi apa yang paling ${k} dipilih?`,paling:(x,k)=>`Hobi yang paling ${k} dipilih adalah ${x}.`,syarat:(op,b)=>`hobi yang dipilih ${op} ${b} siswa`},
  {id:'sampah',judul:'Sampah Plastik Terkumpul',kat:'Kelas',urut:true,label:['Kelas 1','Kelas 2','Kelas 3','Kelas 4','Kelas 5','Kelas 6'],satuan:'kg',ikon:'🧴',jamak:'kelas',
    f:x=>`sampah plastik dari ${x}`,f2:(a,b)=>`sampah plastik dari ${a} dan ${b}`,semua:()=>'sampah plastik dari semua kelas',
    tanya:k=>`Kelas mana yang mengumpulkan sampah plastik paling ${k}?`,paling:(x,k)=>`${x} mengumpulkan sampah plastik paling ${k}.`,syarat:(op,b)=>`kelas yang mengumpulkan ${op} ${b} kg sampah plastik`},
  {id:'kendaraan',judul:'Kendaraan yang Lewat',kat:'Kendaraan',kecil:true,label:['Sepeda','Motor','Mobil','Bus','Truk','Becak'],satuan:'kendaraan',ikon:'🚗',jamak:'jenis kendaraan',
    f:x=>`banyak ${x} yang lewat`,f2:(a,b)=>`banyak ${a} dan ${b} yang lewat`,semua:()=>'kendaraan yang lewat',
    tanya:k=>`Kendaraan apa yang paling ${k} lewat?`,paling:(x,k)=>`Kendaraan yang paling ${k} lewat adalah ${x}.`,syarat:(op,b)=>`jenis kendaraan yang jumlahnya ${op} ${b}`},
  {id:'tabungan',judul:'Tabungan Siswa',kat:'Bulan',urut:true,waktu:true,label:['Juli','Agustus','September','Oktober','November','Desember'],satuan:'ribu rupiah',ikon:'🪙',jamak:'bulan',
    f:x=>`tabungan bulan ${x}`,f2:(a,b)=>`tabungan bulan ${a} dan ${b}`,semua:n=>`tabungan selama ${n} bulan`,
    tanya:k=>`Pada bulan apa tabungan paling ${k}?`,paling:(x,k)=>`Tabungan paling ${k} ada pada bulan ${x}.`,syarat:(op,b)=>`bulan yang tabungannya ${op} ${b} ribu rupiah`},
  {id:'pizza',judul:'Topping Pizza Favorit',kat:'Topping',kecil:true,label:['Keju','Sosis','Jamur','Cokelat','Nanas','Ayam'],satuan:'pesanan',ikon:'🍕',jamak:'topping',
    f:x=>`banyak pesanan pizza ${x}`,f2:(a,b)=>`banyak pesanan pizza ${a} dan ${b}`,semua:()=>'pesanan pizza',
    tanya:k=>`Topping apa yang paling ${k} dipesan?`,paling:(x,k)=>`Topping yang paling ${k} dipesan adalah ${x}.`,syarat:(op,b)=>`topping yang dipesan ${op} ${b} kali`},
  {id:'jus',judul:'Pesanan Jus',kat:'Jus',kecil:true,label:['Jeruk','Apel','Mangga','Alpukat','Melon','Jambu'],satuan:'gelas',ikon:'🥤',jamak:'jenis jus',
    f:x=>`banyak jus ${x} yang dipesan`,f2:(a,b)=>`banyak jus ${a} dan jus ${b} yang dipesan`,semua:()=>'jus yang dipesan',
    tanya:k=>`Jus apa yang paling ${k} dipesan?`,paling:(x,k)=>`Jus yang paling ${k} dipesan adalah jus ${x}.`,syarat:(op,b)=>`jenis jus yang dipesan ${op} ${b} gelas`},
  {id:'olahraga',judul:'Olahraga Favorit Siswa',kat:'Olahraga',kecil:true,label:['Sepak bola','Bulu tangkis','Renang','Basket','Voli','Lari'],satuan:'siswa',ikon:'⚽',jamak:'olahraga',
    f:x=>`banyak siswa yang menyukai ${x}`,f2:(a,b)=>`banyak siswa yang menyukai ${a} dan ${b}`,semua:()=>'siswa yang ditanya',
    tanya:k=>`Olahraga apa yang paling ${k} disukai?`,paling:(x,k)=>`Olahraga yang paling ${k} disukai adalah ${x}.`,syarat:(op,b)=>`olahraga yang disukai ${op} ${b} siswa`},
  /* data berurutan waktu: cocok untuk diagram garis */
  {id:'tanaman',judul:'Tinggi Tanaman Kacang',kat:'Minggu',urut:true,waktu:true,naik:true,kecil:true,label:['Minggu 1','Minggu 2','Minggu 3','Minggu 4','Minggu 5','Minggu 6'],satuan:'cm',ikon:'🌱',jamak:'minggu',
    f:x=>`tinggi tanaman pada ${x}`,f2:(a,b)=>`tinggi tanaman pada ${a} dan ${b}`,semua:()=>'tinggi tanaman semua minggu',
    tanya:k=>`Pada minggu ke berapa tanaman paling ${k==='banyak'?'tinggi':'pendek'}?`,paling:(x,k)=>`Tanaman paling ${k==='banyak'?'tinggi':'pendek'} pada ${x}.`,syarat:(op,b)=>`minggu yang tinggi tanamannya ${op} ${b} cm`},
  {id:'hujan',judul:'Curah Hujan Bulanan',kat:'Bulan',urut:true,waktu:true,label:['Januari','Februari','Maret','April','Mei','Juni'],satuan:'mm',ikon:'🌧️',jamak:'bulan',
    f:x=>`curah hujan bulan ${x}`,f2:(a,b)=>`curah hujan bulan ${a} dan ${b}`,semua:n=>`curah hujan selama ${n} bulan`,
    tanya:k=>`Pada bulan apa curah hujan paling ${k==='banyak'?'tinggi':'rendah'}?`,paling:(x,k)=>`Curah hujan paling ${k==='banyak'?'tinggi':'rendah'} pada bulan ${x}.`,syarat:(op,b)=>`bulan yang curah hujannya ${op} ${b} mm`},
  {id:'eskrim',judul:'Penjualan Es Krim',kat:'Hari',urut:true,waktu:true,label:['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],satuan:'porsi',ikon:'🍦',jamak:'hari',
    f:x=>`es krim yang terjual hari ${x}`,f2:(a,b)=>`es krim yang terjual hari ${a} dan hari ${b}`,semua:n=>`es krim yang terjual selama ${n} hari`,
    tanya:k=>`Pada hari apa es krim paling ${k} terjual?`,paling:(x,k)=>`Es krim paling ${k} terjual pada hari ${x}.`,syarat:(op,b)=>`hari yang penjualannya ${op} ${b} porsi`},
  /* tabel frekuensi: kategorinya angka, isinya berapa kali angka itu muncul */
  {id:'ulangan',judul:'Nilai Ulangan Matematika',kat:'Nilai',urut:true,frek:true,label:['5','6','7','8','9','10'],satuan:'siswa',ikon:'📝',jamak:'nilai',
    f:x=>`banyak siswa yang mendapat nilai ${x}`,f2:(a,b)=>`banyak siswa yang mendapat nilai ${a} dan nilai ${b}`,semua:()=>'siswa yang ikut ulangan',sebut:x=>`Frekuensi nilai ${x}`,
    tanya:k=>`Nilai berapa yang paling ${k} diperoleh siswa?`,paling:(x,k)=>`Nilai yang paling ${k} diperoleh siswa adalah ${x}.`,fs:(op,b)=>`banyak siswa yang mendapat nilai ${op} ${b}`},
  {id:'sepatu',judul:'Ukuran Sepatu Siswa',kat:'Ukuran',urut:true,frek:true,label:['31','32','33','34','35','36'],satuan:'siswa',ikon:'👟',jamak:'ukuran',
    f:x=>`banyak siswa yang memakai sepatu ukuran ${x}`,f2:(a,b)=>`banyak siswa yang memakai sepatu ukuran ${a} dan ${b}`,semua:()=>'siswa yang didata',sebut:x=>`Frekuensi ukuran ${x}`,
    tanya:k=>`Ukuran sepatu berapa yang paling ${k} dipakai siswa?`,paling:(x,k)=>`Ukuran sepatu yang paling ${k} dipakai adalah ${x}.`,fs:(op,b)=>`banyak siswa yang ukuran sepatunya ${op} ${b}`},
  {id:'saudara',judul:'Banyak Saudara Kandung',kat:'Saudara',urut:true,frek:true,label:['0','1','2','3','4','5'],satuan:'siswa',ikon:'👨‍👩‍👧',jamak:'pilihan',
    f:x=>`banyak siswa yang punya ${x} saudara`,f2:(a,b)=>`banyak siswa yang punya ${a} saudara dan ${b} saudara`,semua:()=>'siswa yang didata',sebut:x=>`Frekuensi ${x} saudara`,
    tanya:k=>`Banyak saudara berapa yang paling ${k} dimiliki siswa?`,paling:(x,k)=>`Paling ${k} siswa punya ${x} saudara.`,fs:(op,b)=>`banyak siswa yang saudaranya ${op} ${b}`},
  {id:'bacaan',judul:'Buku Dibaca dalam Sebulan',kat:'Buku',urut:true,frek:true,label:['1','2','3','4','5','6'],satuan:'siswa',ikon:'📚',jamak:'pilihan',
    f:x=>`banyak siswa yang membaca ${x} buku`,f2:(a,b)=>`banyak siswa yang membaca ${a} buku dan ${b} buku`,semua:()=>'siswa yang didata',sebut:x=>`Frekuensi ${x} buku`,
    tanya:k=>`Berapa buku yang paling ${k} dibaca siswa dalam sebulan?`,paling:(x,k)=>`Paling ${k} siswa membaca ${x} buku.`,fs:(op,b)=>`banyak siswa yang membaca buku ${op} ${b}`}
];
/* konteks yang cocok untuk tiap sajian */
const cocokK=(K,s)=>s==='frekuensi'?!!K.frek:K.frek?false:s==='garis'?!!K.waktu:s==='lingkaran'?!K.urut:true;
const cariK=id=>KONTEKS.find(k=>k.id===id)||KONTEKS[0];
/* konteks untuk data buatan sendiri (Survei Kelas) */
function konteksSurvei(judul,kat,satuan='siswa'){return{id:'survei',judul,kat,satuan,ikon:'🙋',jamak:'pilihan',kecil:false,label:[],
  f:x=>`banyak ${satuan} yang memilih ${x}`,f2:(a,b)=>`banyak ${satuan} yang memilih ${a} dan ${b}`,semua:()=>`${satuan} yang ikut survei`,
  tanya:k=>`Pilihan apa yang paling ${k} dipilih?`,paling:(x,k)=>`${x} paling ${k} dipilih.`,syarat:(op,b)=>`pilihan yang dipilih ${op} ${b} ${satuan}`}}

/* ---------- data ---------- */
/* skala sumbu yang rapi supaya garis bantu paling banyak ±10 */
const skalaRapi=maks=>maks<=10?1:maks<=20?2:maks<=50?5:maks<=100?10:maks<=200?20:50;
function lengkapi(d){const m=Math.max(1,...d.nilai.filter(v=>v!==null));d.step=d.step||skalaRapi(m);d.ytop=Math.ceil(m/d.step)*d.step+(m%d.step===0?d.step:0);
  if(d.ytop/d.step>12)d.ytop=Math.ceil(m/d.step)*d.step;d.unit=d.unit||d.step;d.kelip=d.kelip||1;
  /* diagram lingkaran: persen tiap bagian dari jumlah seluruhnya */
  if(d.total)d.pct=d.nilai.map(v=>v===null?null:Math.round(v*1000/d.total)/10);return d}
/* nilai berbeda semua supaya "paling banyak" selalu jelas */
function nilaiBeda(r,n,kelip,maksK,minK=1){const pool=acak(r,Array.from({length:maksK-minK+1},(_,i)=>(i+minK)*kelip));return pool.slice(0,n)}
/* bagi `utuh` menjadi n bagian bulat yang berbeda semua dan masing-masing >= min */
function bagi(r,n,utuh,min=1){const pos=Array.from({length:utuh-1},(_,i)=>i+1);
  for(let c=0;c<400;c++){const cut=acak(r,pos).slice(0,n-1).sort((a,b)=>a-b),t=[0,...cut],p=cut.concat(utuh).map((x,i)=>x-t[i]);if(p.every(x=>x>=min)&&new Set(p).size===n)return acak(r,p)}
  const p=Array.from({length:n-1},(_,i)=>min+i);return acak(r,p.concat(utuh-jumlah(p)))}
/* lingkaran: persen kelipatan 5, jumlah seluruhnya kelipatan 20 supaya banyak tiap bagian bulat */
function buatPie(r,level,K){const n=level===1?ri(r,3,4):level===2?4:ri(r,4,5),T=pilih(r,level===1?[20,40,100]:[40,60,80,120,200]),pct=bagi(r,n,20,level===3?1:2).map(x=>x*5);
  return lengkapi({k:K.id,judul:K.judul,kat:K.kat,satuan:K.satuan,ikon:K.ikon,label:acak(r,K.label).slice(0,n),nilai:pct.map(p=>p*T/100),total:T,step:T/10,unit:T/20,kelip:T/20})}
function buatData(r,level,sajian,K){
  if(sajian==='lingkaran')return buatPie(r,level,K);
  const n=sajian==='turus'?ri(r,3,4):sajian==='garis'?(level===1?5:level===2?ri(r,5,6):6):sajian==='frekuensi'?(level===1?4:level===2?5:6):level===1?ri(r,3,4):level===2?ri(r,4,5):ri(r,5,6);
  const label=K.urut?(s=>K.label.slice(s,s+n))(ri(r,0,K.label.length-n)):acak(r,K.label).slice(0,n);
  let step,unit,kelip,nilai;
  if(sajian==='frekuensi'){nilai=nilaiBeda(r,n,1,level===1?10:14);return lengkapi({k:K.id,judul:K.judul,kat:K.kat,satuan:K.satuan,ikon:K.ikon,label,nilai,step:skalaRapi(Math.max(...nilai)),unit:1,kelip:1})}
  if(sajian==='piktogram'){unit=level===1?pilih(r,[1,2]):level===2?pilih(r,[2,4,5]):pilih(r,[4,5,10]);kelip=level===1||unit%2?unit:unit/2;
    nilai=nilaiBeda(r,n,kelip,Math.floor(unit*(level===1?6:8)/kelip));step=skalaRapi(Math.max(...nilai))}
  else if(sajian==='turus'){kelip=1;nilai=nilaiBeda(r,n,1,level===1?14:20,3);step=skalaRapi(Math.max(...nilai))}
  else{step=level===1?pilih(r,[1,2]):level===2?pilih(r,[2,5,10]):pilih(r,[4,10,20]);kelip=level===3?step/2:step;
    nilai=nilaiBeda(r,n,kelip,Math.round(step*10/kelip))}
  if(K.naik)nilai.sort((x,y)=>x-y);
  return lengkapi({k:K.id,judul:K.judul,kat:K.kat,satuan:K.satuan,ikon:K.ikon,label,nilai,step,unit:unit||step,kelip})}

/* ---------- gambar sajian (SVG string) ---------- */
const BATANG={W:560,H:340,L:62,R:18,T:46,B:58};
function teksLabel(x,y,s,f=15){const kata=String(s).split(' ');const baris=kata.length>1&&s.length>8?[kata[0],kata.slice(1).join(' ')]:[s];
  return`<text x="${x}" y="${y}" text-anchor="middle" font-size="${f}" font-weight="800" fill="${INK}">${baris.map((b,i)=>`<tspan x="${x}" dy="${i?f*1.1:0}">${esc(b)}</tspan>`).join('')}</text>`}
const judulSvg=(d,W)=>`<text x="${W/2}" y="26" text-anchor="middle" font-size="19" font-weight="900" fill="${INK}" font-family="'Baloo 2',Nunito,sans-serif">${esc(d.judul)}</text>`;
/* tata letak batang dipakai juga oleh animasi supaya posisinya sama persis */
function tataBatang(d,o={}){const{W,H,L,R,T,B}=BATANG,ytop=o.ytop||d.ytop,step=o.step||d.step,n=d.label.length,w=W-L-R-(o.kanan||0),h=H-T-B,slot=w/n,bw=Math.min(64,slot*.58);
  return{W,H,L,T,B,w,h,ytop,step,n,slot,bw,y:v=>T+h*(1-v/ytop),x:i=>L+slot*(i+.5),px:v=>h*v/ytop}}
/* bingkai, judul, garis skala, dan sumbu tegak (dipakai diagram batang dan diagram garis) */
function kisi(g,d,o,nama){let s=`<svg viewBox="0 0 ${g.W} ${g.H}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,system-ui,sans-serif" role="img" aria-label="${nama} ${esc(d.judul)}"><rect width="${g.W}" height="${g.H}" rx="14" fill="#fff"/>`;
  if(!o.kecil)s+=judulSvg(d,g.W);
  for(let v=0;v<=g.ytop+1e-9;v+=g.step){const y=g.y(v);s+=`<line x1="${g.L}" x2="${g.L+g.w}" y1="${y}" y2="${y}" stroke="${v?'#c9d6e8':INK}" stroke-width="${v?1.5:3}" ${v?'stroke-dasharray="5 5"':''}/><text x="${g.L-9}" y="${y+5}" text-anchor="end" font-size="15" font-weight="800" fill="${INK}">${angka(v)}</text>`}
  return s+`<line x1="${g.L}" x2="${g.L}" y1="${g.T-8}" y2="${g.y(0)}" stroke="${INK}" stroke-width="3"/><text x="${g.L-4}" y="${g.T-14}" text-anchor="middle" font-size="13" font-weight="800" fill="#5b6b85">(${esc(d.satuan)})</text>`}
function svgGaris(d,o={}){const g=tataBatang(d,o),pt=d.nilai.map((v,i)=>[g.x(i),g.y(v)]);let s=kisi(g,d,o,'Diagram garis');
  pt.forEach(([x],i)=>{s+=`<line x1="${x}" x2="${x}" y1="${g.y(0)}" y2="${g.y(0)+7}" stroke="${INK}" stroke-width="3"/>`+teksLabel(x,g.y(0)+24,d.label[i],d.label.length>5?13:15)});
  s+=`<polyline points="${pt.map(p=>p.map(n=>+n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#2f7bea" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  pt.forEach(([x,y],i)=>{s+=`<circle class="titik" data-i="${i}" cx="${+x.toFixed(1)}" cy="${+y.toFixed(1)}" r="7" fill="#fff" stroke="${INK}" stroke-width="3.5"/>`});
  return s+'</svg>'}
/* diagram lingkaran: irisan dimulai dari atas, searah jarum jam */
const PIE={W:560,H:340,cx:180,cy:188,r:120};
function tataPie(d){const T=d.total||jumlah(d.nilai.map(v=>v||0))||1;let a=-Math.PI/2;
  return d.nilai.map((v,i)=>{const s=(v||0)/T*2*Math.PI,a0=a;a+=s;return{i,a0,a1:a,mid:a0+s/2,pct:Math.round((v||0)*1000/T)/10}})}
function busur(cx,cy,r,a0,a1){if(a1-a0>=2*Math.PI-1e-6)return`M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`;
  const p=a=>`${(cx+r*Math.cos(a)).toFixed(1)} ${(cy+r*Math.sin(a)).toFixed(1)}`;return`M${cx} ${cy}L${p(a0)}A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${p(a1)}Z`}
function svgLingkaran(d,o={}){const{W,H,cx,cy,r}=PIE,tampil=o.tampil||'persen',iris=tataPie(d),lx=340;
  let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,system-ui,sans-serif" role="img" aria-label="Diagram lingkaran ${esc(d.judul)}"><rect width="${W}" height="${H}" rx="14" fill="#fff"/>${o.kecil?'':judulSvg(d,W)}<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f6f9fd" stroke="${INK}" stroke-width="3"/>`;
  iris.forEach(k=>{if(k.a1-k.a0<1e-6)return;const kosong=k.i===o.tanpa;s+=`<path class="iris" data-i="${k.i}" d="${busur(cx,cy,r,k.a0,k.a1)}" fill="${kosong?'#f1f4f9':WARNA[k.i%6]}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"${kosong?' stroke-dasharray="7 6"':''}/>`});
  iris.forEach(k=>{if(k.a1-k.a0<1e-6)return;const luar=k.a1-k.a0<.5,rr=luar?r+22:r*.62,x=cx+rr*Math.cos(k.mid),y=cy+rr*Math.sin(k.mid),kosong=k.i===o.tanpa;
    s+=`<text class="iris-t" data-i="${k.i}" x="${x.toFixed(1)}" y="${(y+6).toFixed(1)}" text-anchor="middle" font-size="${luar?15:18}" font-weight="900" fill="${kosong?'#9aa6b8':INK}">${kosong?'?':tampil==='banyak'?angka(d.nilai[k.i]):angka(k.pct)+'%'}</text>`});
  const top=Math.max(64,cy-iris.length*17);
  iris.forEach((k,i)=>{const y=top+i*34;s+=`<rect x="${lx}" y="${y}" width="24" height="24" rx="5" fill="${k.i===o.tanpa?'#f1f4f9':WARNA[i%6]}" stroke="${INK}" stroke-width="2.5"/><text x="${lx+34}" y="${y+18}" font-size="16" font-weight="800" fill="${INK}">${esc(d.label[i])}${o.legendaPersen?` · ${angka(k.pct)}%`:''}</text>`});
  if(tampil==='persen'&&d.total&&!o.tanpaTotal)s+=`<text x="${lx}" y="${top+iris.length*34+22}" font-size="15" font-weight="800" fill="#5b6b85">Jumlah seluruhnya: ${angka(d.total)} ${esc(d.satuan)}</text>`;
  return s+'</svg>'}
function svgBatang(d,o={}){const g=tataBatang(d,o);let s=kisi(g,d,o,'Diagram batang');
  d.nilai.forEach((v,i)=>{const x=g.x(i)-g.bw/2;
    if(i===o.tanpa||v===null)s+=`<rect x="${x}" y="${g.T+g.h*.35}" width="${g.bw}" height="${g.h*.65}" fill="#f1f4f9" stroke="#9aa6b8" stroke-width="3" stroke-dasharray="7 6" rx="4"/><text x="${g.x(i)}" y="${g.T+g.h*.7}" text-anchor="middle" font-size="34" font-weight="900" fill="#9aa6b8">?</text>`;
    else s+=`<rect x="${x}" y="${g.y(v)}" width="${g.bw}" height="${g.px(v)}" fill="${WARNA[i%6]}" stroke="${INK}" stroke-width="3" rx="3"/>`;
    s+=teksLabel(g.x(i),g.y(0)+22,d.label[i],d.label.length>5?13:15)});
  return s+'</svg>'}
function svgPiktogram(d,o={}){const n=d.label.length,maksIkon=Math.max(...d.nilai.map(v=>Math.ceil((v||0)/d.unit)),4),Lk=132,iw=36,W=Math.max(430,Lk+maksIkon*iw+24),rowH=44,T=44,H=T+n*rowH+52;
  let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,system-ui,sans-serif" role="img" aria-label="Piktogram ${esc(d.judul)}"><rect width="${W}" height="${H}" rx="14" fill="#fff"/>${o.kecil?'':judulSvg(d,W)}`;
  d.nilai.forEach((v,i)=>{const y=T+i*rowH;s+=`<rect x="10" y="${y}" width="${W-20}" height="${rowH}" fill="${i%2?'#f6f9fd':'#fff'}" stroke="#c9d6e8" stroke-width="1.5"/><text x="20" y="${y+28}" font-size="16" font-weight="800" fill="${INK}">${esc(d.label[i])}</text><line x1="${Lk}" x2="${Lk}" y1="${y}" y2="${y+rowH}" stroke="#c9d6e8" stroke-width="1.5"/>`;
    if(i===o.tanpa||v===null){s+=`<text x="${Lk+16}" y="${y+30}" font-size="24" font-weight="900" fill="#9aa6b8">?</text>`;return}
    const penuh=Math.floor(v/d.unit),sisa=v-penuh*d.unit;
    for(let k=0;k<penuh;k++)s+=`<text x="${Lk+10+k*iw+iw/2}" y="${y+31}" text-anchor="middle" font-size="27">${d.ikon}</text>`;
    /* setengah ikon: ikon penuh yang separuh kanannya ditutup putih */
    if(sisa){const cx=Lk+10+penuh*iw+iw/2;s+=`<text x="${cx}" y="${y+31}" text-anchor="middle" font-size="27">${d.ikon}</text><rect x="${cx}" y="${y+4}" width="${iw/2+2}" height="${rowH-8}" fill="${i%2?'#f6f9fd':'#fff'}"/>`}});
  const ky=T+n*rowH+34;s+=`<text x="20" y="${ky}" font-size="16" font-weight="800" fill="${INK}">Keterangan: <tspan font-size="22">${d.ikon}</tspan> = ${angka(d.unit)} ${esc(d.satuan)}</text>`;
  return s+'</svg>'}
function svgTabel(d,o={}){const n=d.label.length,W=430,rowH=40,T=o.kecil?8:44,H=T+(n+1)*rowH+12,c=W*.55;
  let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,system-ui,sans-serif" role="img" aria-label="${o.frek?'Tabel frekuensi':'Tabel'} ${esc(d.judul)}"><rect width="${W}" height="${H}" rx="14" fill="#fff"/>${o.kecil?'':judulSvg(d,W)}`;
  s+=`<rect x="20" y="${T}" width="${W-40}" height="${rowH}" fill="#ffe08a" stroke="${INK}" stroke-width="2.5"/><text x="${20+(c-20)/2}" y="${T+26}" text-anchor="middle" font-size="16" font-weight="900" fill="${INK}">${esc(d.kat)}</text><text x="${c+(W-20-c)/2}" y="${T+26}" text-anchor="middle" font-size="16" font-weight="900" fill="${INK}">${o.frek?'Frekuensi':`Banyak (${esc(d.satuan)})`}</text>`;
  d.nilai.forEach((v,i)=>{const y=T+(i+1)*rowH;s+=`<rect x="20" y="${y}" width="${W-40}" height="${rowH}" fill="${i%2?'#f6f9fd':'#fff'}" stroke="${INK}" stroke-width="2"/><text x="${20+(c-20)/2}" y="${y+26}" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">${esc(d.label[i])}</text><text x="${c+(W-20-c)/2}" y="${y+27}" text-anchor="middle" font-size="18" font-weight="900" fill="${i===o.tanpa||v===null?'#9aa6b8':INK}">${i===o.tanpa||v===null?'?':angka(v)}</text>`});
  return s+`<line x1="${c}" x2="${c}" y1="${T}" y2="${T+(n+1)*rowH}" stroke="${INK}" stroke-width="2.5"/></svg>`}
/* turus: 4 garis tegak + 1 garis miring = 5 */
function turusSvg(v,x,y,h=26){let s='';const grup=Math.floor(v/5),sisa=v%5;let cx=x;
  for(let g=0;g<grup;g++){for(let k=0;k<4;k++)s+=`<line x1="${cx+k*7}" x2="${cx+k*7}" y1="${y}" y2="${y+h}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;s+=`<line x1="${cx-4}" x2="${cx+25}" y1="${y+h-3}" y2="${y+3}" stroke="#e8323c" stroke-width="3" stroke-linecap="round"/>`;cx+=40}
  for(let k=0;k<sisa;k++)s+=`<line x1="${cx+k*7}" x2="${cx+k*7}" y1="${y}" y2="${y+h}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;return s}
function svgTurus(d,o={}){const n=d.label.length,W=460,rowH=44,T=o.kecil?8:44,H=T+(n+1)*rowH+12,c=150;
  let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,system-ui,sans-serif" role="img" aria-label="Tabel turus ${esc(d.judul)}"><rect width="${W}" height="${H}" rx="14" fill="#fff"/>${o.kecil?'':judulSvg(d,W)}`;
  s+=`<rect x="20" y="${T}" width="${W-40}" height="${rowH}" fill="#ffe08a" stroke="${INK}" stroke-width="2.5"/><text x="${20+(c-20)/2}" y="${T+28}" text-anchor="middle" font-size="16" font-weight="900" fill="${INK}">${esc(d.kat)}</text><text x="${c+(W-20-c)/2}" y="${T+28}" text-anchor="middle" font-size="16" font-weight="900" fill="${INK}">Turus</text>`;
  d.nilai.forEach((v,i)=>{const y=T+(i+1)*rowH;s+=`<rect x="20" y="${y}" width="${W-40}" height="${rowH}" fill="${i%2?'#f6f9fd':'#fff'}" stroke="${INK}" stroke-width="2"/><text x="${20+(c-20)/2}" y="${y+28}" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">${esc(d.label[i])}</text>`+(i===o.tanpa||v===null?`<text x="${c+20}" y="${y+30}" font-size="22" font-weight="900" fill="#9aa6b8">?</text>`:turusSvg(v,c+20,y+9))});
  return s+`<line x1="${c}" x2="${c}" y1="${T}" y2="${T+(n+1)*rowH}" stroke="${INK}" stroke-width="2.5"/></svg>`}
const svgFrekuensi=(d,o={})=>o.turus?svgFrekTurus(d,o):svgTabel(d,{...o,frek:true});
/* tabel frekuensi lengkap dengan kolom turus (dipakai Lab) */
function svgFrekTurus(d,o={}){const n=d.label.length,W=520,rowH=40,T=o.kecil?8:44,H=T+(n+1)*rowH+12,c1=120,c2=W-140,kol=[[20,c1],[c1,c2],[c2,W-20]],tengah=k=>(kol[k][0]+kol[k][1])/2;
  let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,system-ui,sans-serif" role="img" aria-label="Tabel frekuensi ${esc(d.judul)}"><rect width="${W}" height="${H}" rx="14" fill="#fff"/>${o.kecil?'':judulSvg(d,W)}`;
  s+=`<rect x="20" y="${T}" width="${W-40}" height="${rowH}" fill="#ffe08a" stroke="${INK}" stroke-width="2.5"/>`+[esc(d.kat),'Turus','Frekuensi'].map((t,k)=>`<text x="${tengah(k)}" y="${T+26}" text-anchor="middle" font-size="16" font-weight="900" fill="${INK}">${t}</text>`).join('');
  d.nilai.forEach((v,i)=>{const y=T+(i+1)*rowH;s+=`<rect x="20" y="${y}" width="${W-40}" height="${rowH}" fill="${i%2?'#f6f9fd':'#fff'}" stroke="${INK}" stroke-width="2"/><text x="${tengah(0)}" y="${y+26}" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">${esc(d.label[i])}</text>${turusSvg(v,c1+16,y+7,26)}<text x="${tengah(2)}" y="${y+27}" text-anchor="middle" font-size="18" font-weight="900" fill="${INK}">${angka(v)}</text>`});
  return s+[c1,c2].map(x=>`<line x1="${x}" x2="${x}" y1="${T}" y2="${T+(n+1)*rowH}" stroke="${INK}" stroke-width="2.5"/>`).join('')+'</svg>'}
const gambar=(d,sajian,o)=>({batang:svgBatang,piktogram:svgPiktogram,tabel:svgTabel,turus:svgTurus,lingkaran:svgLingkaran,garis:svgGaris,frekuensi:svgFrekuensi}[sajian]||svgBatang)(d,o);
const NAMA_SAJIAN={batang:'diagram batang',piktogram:'piktogram',tabel:'tabel',turus:'tabel turus',lingkaran:'diagram lingkaran',garis:'diagram garis',frekuensi:'tabel frekuensi'};
const INGAT={
  batang:{kode:'Garis bantu',kalimat:'Tarik garis lurus dari ujung batang ke sumbu tegak. Perhatikan skalanya: satu garis bisa bernilai lebih dari 1.'},
  piktogram:{kode:'Lihat keterangan',kalimat:'Baca keterangan dulu: 1 ikon bernilai berapa? Setengah ikon = setengah nilainya.'},
  tabel:{kode:'Baris & kolom',kalimat:'Cari barisnya, lalu baca angka di kolom banyak. Tabel cocok untuk mencari angka yang tepat.'},
  turus:{kode:'4 tegak + 1 miring = 5',kalimat:'Satu kelompok turus (4 garis tegak + 1 garis miring) bernilai 5.'},
  lingkaran:{kode:'Lingkaran penuh = 100%',kalimat:'Satu lingkaran utuh = 100% = semua data. Banyak satu bagian = persennya × jumlah seluruhnya.'},
  garis:{kode:'Titik, lalu garis bantu',kalimat:'Tiap titik adalah satu data. Garis naik berarti bertambah, garis turun berarti berkurang.'},
  frekuensi:{kode:'Frekuensi = berapa kali muncul',kalimat:'Frekuensi adalah banyaknya data yang bernilai itu. Jumlah semua frekuensi = banyak seluruh data.'}};

/* ---------- langkah membaca satu data sesuai sajiannya ---------- */
function baca(d,s,i){const x=d.label[i],v=d.nilai[i];
  if(s==='tabel')return[`Cari baris ${x} pada tabel, angkanya ${angka(v)}.`];
  if(s==='frekuensi')return[`Cari baris ${d.kat.toLowerCase()} ${x}, frekuensinya ${angka(v)}.`];
  if(s==='garis')return[`Tarik garis mendatar dari titik ${x} ke sumbu tegak: ${angka(v)}.`];
  if(s==='turus'){const g=Math.floor(v/5),k=v%5;return[`Hitung turus ${x}: ${g} kelompok lima${k?` dan ${k} garis`:''}, jadi ${g} × 5${k?` + ${k}`:''} = ${v}.`]}
  if(s==='piktogram'){const p=Math.floor(v/d.unit),h=v%d.unit!==0;return[`${x} punya ${p} ikon${h?' dan setengah ikon':''}. Satu ikon = ${angka(d.unit)} ${d.satuan}${h?`, setengah ikon = ${angka(d.unit/2)}`:''}.`,`${p} × ${angka(d.unit)}${h?` + ${angka(d.unit/2)}`:''} = ${angka(v)}.`]}
  return[v%d.step?`Ujung batang ${x} ada di tengah antara ${angka(v-d.step/2)} dan ${angka(v+d.step/2)}, jadi ${angka(v)}.`:`Tarik garis dari ujung batang ${x} ke sumbu tegak: tepat di angka ${angka(v)}.`]}
const singkat=(d,i)=>`${d.label[i]} = ${angka(d.nilai[i])}`;

/* ---------- pilihan jawaban ---------- */
function opsiTeks(r,benar,pengecoh){const v=[benar];for(const x of pengecoh)if(x&&!v.includes(x)&&v.length<4)v.push(x);const o=acak(r,v);return{opsi:o,benar:o.indexOf(benar)}}
function opsiAngka(r,benar,pengecoh,sat,d){const ok=x=>Number.isFinite(x)&&x>0&&x!==benar,cad=[benar+d.kelip,benar+d.step,benar+2*d.step,benar+3*d.kelip,benar-d.kelip,benar*2+d.kelip];
  const v=[...new Set([...pengecoh.filter(ok),...cad.filter(ok)])];return opsiTeks(r,`${angka(benar)} ${sat}`,v.map(x=>`${angka(x)} ${sat}`))}
const lab=(K,x)=>K.kecil?x.toLowerCase():x;
const fx=(K,d,i)=>K.f(lab(K,d.label[i])),fx2=(K,d,a,b)=>K.f2(lab(K,d.label[a]),lab(K,d.label[b]));
const dua=(r,n)=>{const a=ri(r,0,n-1);let b=ri(r,0,n-2);if(b>=a)b++;return[a,b]};
const OP={'>':'lebih dari','<':'kurang dari'};
/* batas untuk soal syarat: kelipatan kelip yang tidak sama dengan data mana pun, dan memisahkan data */
/* batas di antara data terkecil dan terbesar (boleh sama dengan salah satu data: "lebih dari 6" tidak menghitung yang tepat 6) */
function batas(r,d){const lo=Math.min(...d.nilai),hi=Math.max(...d.nilai),c=[];for(let b=lo+d.kelip;b<hi;b+=d.kelip)c.push(b);
  const rapi=c.filter(b=>b%d.step===0),b=pilih(r,rapi.length?rapi:c.length?c:[lo]),cmp=r()<.6?'>':'<';
  const idx=d.nilai.map(v=>cmp==='>'?v>b:v<b);return{b,cmp,idx,c:idx.filter(Boolean).length}}
/* ---------- pernyataan benar/salah (untuk PGK Kategori dan MCMA) ---------- */
function pernyataan(r,d,s,K,jenis,benar){const n=d.label.length,sat=d.satuan;
  if(jenis==='baca'){const i=ri(r,0,n-1),v=d.nilai[i],t=benar?v:pilih(r,[v+d.kelip,v-d.kelip,v+d.step].filter(x=>x>0&&x!==v));
    return{teks:`${besar(fx(K,d,i))} adalah ${angka(t)} ${sat}.`,benar,anim:{op:s==='piktogram'?'pikto':'baca',i},kunci:`${baca(d,s,i).slice(-1)[0]} Jadi pernyataan ini ${benar?'benar':'salah'}.`}}
  if(jenis==='paling'){const max=r()<.6,urut=d.nilai.map((v,i)=>i).sort((a,b)=>max?d.nilai[b]-d.nilai[a]:d.nilai[a]-d.nilai[b]),i=benar?urut[0]:pilih(r,urut.slice(1));
    return{teks:K.paling(lab(K,d.label[i]),max?'banyak':'sedikit'),benar,anim:{op:'banding',i:urut[0],max},kunci:`Data paling ${max?'banyak':'sedikit'} adalah ${singkat(d,urut[0])}. Jadi pernyataan ini ${benar?'benar':'salah'}.`}}
  if(jenis==='selisih'||jenis==='jumlah'){const[a,b]=dua(r,n),va=d.nilai[a],vb=d.nilai[b],x=jenis==='selisih'?Math.abs(va-vb):va+vb,salah=jenis==='selisih'?[va+vb,x+d.kelip,x-d.kelip]:[Math.abs(va-vb),x+d.kelip,x-d.kelip],t=benar?x:pilih(r,salah.filter(v=>v>0&&v!==x));
    return{teks:`${besar(jenis)} ${fx2(K,d,a,b)} adalah ${angka(t)} ${sat}.`,benar,anim:jenis==='selisih'?{op:'selisih',i:a,j:b}:{op:'jumlah',idx:[a,b]},
      kunci:`${singkat(d,a)}, ${singkat(d,b)}. ${besar(jenis)}nya ${jenis==='selisih'?`${angka(Math.max(va,vb))} − ${angka(Math.min(va,vb))}`:`${angka(va)} + ${angka(vb)}`} = ${angka(x)}. Jadi pernyataan ini ${benar?'benar':'salah'}.`}}
  /* syarat */
  const B=batas(r,d),t=benar?B.c:pilih(r,[B.c+1,B.c-1].filter(v=>v>=1&&v<=n));
  return{teks:`Ada ${t} ${K.syarat(OP[B.cmp],angka(B.b))}.`,benar,anim:{op:'syarat',b:B.b,cmp:B.cmp},kunci:`Data yang ${OP[B.cmp]} ${angka(B.b)}: ${d.label.filter((_,i)=>B.idx[i]).join(', ')||'tidak ada'}, ada ${B.c}. Jadi pernyataan ini ${benar?'benar':'salah'}.`}}
/* pernyataan tentang diagram lingkaran (persen, banyak, gabungan, pecahan) */
const persen=x=>angka(x)+'%';
const fpb=(a,b)=>b?fpb(b,a%b):a;
const pecahan=p=>{const g=fpb(p,100);return`${p/g}/${100/g}`};
function pernyataanPie(r,d,s,K,jenis,benar){const n=d.label.length,T=d.total,sat=d.satuan,lain=(x,c,maks)=>pilih(r,c.filter(v=>v>0&&v!==x&&v<maks));
  const hasil=(teks,mode,idx,k,extra)=>({teks,benar,anim:{op:'pie',mode,idx,tampil:'persen',langkah:[k],...extra},kunci:k});
  const akhir=`Jadi pernyataan ini ${benar?'benar':'salah'}.`;
  if(jenis==='baca'){const i=ri(r,0,n-1),v=d.nilai[i],p=d.pct[i],t=benar?v:lain(v,[v+d.kelip,v-d.kelip,p,v*2],T);
    return hasil(`${besar(fx(K,d,i))} adalah ${angka(t)} ${sat}.`,'baca',[i],`${d.label[i]} = ${persen(p)} × ${angka(T)} = ${angka(v)} ${sat}. ${akhir}`)}
  if(jenis==='persen'){const i=ri(r,0,n-1),p=d.pct[i],t=benar?p:lain(p,[p+5,p-5,p+10,p-10],100);
    return hasil(`Bagian ${d.label[i]} adalah ${persen(t)} dari seluruhnya.`,'persen',[i],`Irisan ${d.label[i]} = ${persen(p)}. ${akhir}`)}
  if(jenis==='pecahan'){const i=ri(r,0,n-1),p=d.pct[i],t=benar?pecahan(p):pecahan(lain(p,[p+5,p-5,p+10,p-10],100));
    return hasil(`Bagian ${d.label[i]} sama dengan ${t} lingkaran.`,'pecahan',[i],`${d.label[i]} = ${persen(p)} = ${p}/100 = ${pecahan(p)}. ${akhir}`)}
  if(jenis==='gabung'){const[a,b]=dua(r,n),x=d.pct[a]+d.pct[b],t=benar?x:lain(x,[x+5,x-5,x+10,Math.abs(d.pct[a]-d.pct[b])],100);
    return hasil(`Gabungan ${d.label[a]} dan ${d.label[b]} adalah ${persen(t)}.`,'gabung',[a,b],`${persen(d.pct[a])} + ${persen(d.pct[b])} = ${persen(x)}. ${akhir}`)}
  const max=r()<.6,urut=d.nilai.map((v,i)=>i).sort((a,b)=>max?d.nilai[b]-d.nilai[a]:d.nilai[a]-d.nilai[b]),i=benar?urut[0]:pilih(r,urut.slice(1));
  return hasil(K.paling(lab(K,d.label[i]),max?'banyak':'sedikit'),'banding',[urut[0]],`Irisan paling ${max?'besar':'kecil'}: ${d.label[urut[0]]} (${persen(d.pct[urut[0]])}). ${akhir}`,{max})}
/* pernyataan tentang diagram garis (baca titik, paling, selisih, naik/turun) */
function pernyataanGaris(r,d,s,K,jenis,benar){const n=d.label.length,sat=d.satuan,akhir=`Jadi pernyataan ini ${benar?'benar':'salah'}.`;
  if(jenis==='naik'){const k=ri(r,0,n-2),dl=d.nilai[k+1]-d.nilai[k],x=Math.abs(dl),arah=dl>0?'naik':'turun',salahArah=r()<.5;
    const t=benar||salahArah?x:pilih(r,[x+d.kelip,x+d.step,x-d.kelip].filter(v=>v>0&&v!==x)),a=benar||!salahArah?arah:dl>0?'turun':'naik';
    const kk=`${d.label[k]} = ${angka(d.nilai[k])}, ${d.label[k+1]} = ${angka(d.nilai[k+1])}: garisnya ${arah} ${angka(x)}. ${akhir}`;
    return{teks:`Dari ${d.label[k]} ke ${d.label[k+1]}, datanya ${a} ${angka(t)} ${sat}.`,benar,anim:{op:'gSegmen',i:k,satu:true,langkah:[kk]},kunci:kk}}
  const p=pernyataan(r,d,'garis',K,jenis,benar),a=p.anim;
  p.anim=a.op==='selisih'?{op:'gSelisih',i:a.i,j:a.j,langkah:[p.kunci]}:a.op==='jumlah'?{op:'gTitik',idx:a.idx,langkah:[p.kunci]}:a.op==='banding'?{op:'gTitik',mode:'banding',idx:[a.i],max:a.max,langkah:[p.kunci]}:{op:'gTitik',idx:[a.i],langkah:[p.kunci]};
  return p}
function daftarPernyataan(r,d,s,K,level,jml){const f=s==='lingkaran'?pernyataanPie:s==='garis'?pernyataanGaris:pernyataan;
  const pool=s==='lingkaran'?['persen','baca','paling','gabung','pecahan']:s==='garis'?['baca','paling','selisih','naik']:s==='frekuensi'?['baca','paling','selisih','jumlah']:level===1?['baca','paling','selisih']:['baca','paling','selisih','jumlah','syarat'];
  const jenis=acak(r,pool).slice(0,jml);
  while(jenis.length<jml)jenis.push(pilih(r,s==='lingkaran'?['persen','baca']:['baca','selisih']));
  /* paling sedikit satu benar dan satu salah */
  const nilai=acak(r,[true,false,...Array.from({length:jml-2},()=>r()<.5)]),hasil=[];
  jenis.forEach((j,k)=>{for(let c=0;c<12;c++){const p=f(r,d,s,K,j,nilai[k]);if(!hasil.some(h=>h.teks===p.teks)){hasil.push(p);return}}hasil.push(f(r,d,s,K,'baca',nilai[k]))});
  return hasil}

/* ---------- jenis soal ---------- */
const G={
  baca(r,d,s,K){const i=ri(r,0,d.label.length-1),v=d.nilai[i],lain=d.nilai.filter((_,k)=>k!==i);
    const pengecoh=[v+d.kelip,v-d.kelip,v+d.step,...lain];if(s==='piktogram'&&v/d.unit!==v)pengecoh.unshift(Math.floor(v/d.unit));if(s==='batang'&&v%d.step)pengecoh.unshift(v-d.step/2,v+d.step/2);
    return{tipe:'pg',teks:`Berapa ${fx(K,d,i)}?`,...opsiAngka(r,v,pengecoh,d.satuan,d),anim:{op:s==='piktogram'?'pikto':'baca',i},kunci:[...baca(d,s,i),`Jadi ${fx(K,d,i)} = ${angka(v)} ${d.satuan}.`]}},
  banding(r,d,s,K){const max=r()<.6,urut=d.nilai.map((v,i)=>i).sort((a,b)=>max?d.nilai[b]-d.nilai[a]:d.nilai[a]-d.nilai[b]),i=urut[0],lain=acak(r,urut.slice(1)).slice(0,3);
    return{tipe:'pg',...opsiTeks(r,d.label[i],lain.map(k=>d.label[k])),teks:K.tanya(max?'banyak':'sedikit'),anim:{op:'banding',i,max},
      kunci:[s==='batang'?`Cari batang yang paling ${max?'tinggi':'pendek'}.`:'Bandingkan semua datanya.',d.label.map((_,k)=>singkat(d,k)).join(', ')+'.',`Paling ${max?'banyak':'sedikit'}: ${d.label[i]} (${angka(d.nilai[i])} ${d.satuan}).`]}},
  selisih(r,d,s,K){const[a,b]=dua(r,d.label.length),va=d.nilai[a],vb=d.nilai[b],x=Math.abs(va-vb);
    return{tipe:'pg',teks:`Selisih ${fx2(K,d,a,b)} adalah …`,...opsiAngka(r,x,[va+vb,x+d.kelip,x-d.kelip,Math.max(va,vb)],d.satuan,d),anim:{op:'selisih',i:a,j:b},
      kunci:[...baca(d,s,a),...baca(d,s,b),`Selisih = yang besar − yang kecil = ${angka(Math.max(va,vb))} − ${angka(Math.min(va,vb))} = ${angka(x)} ${d.satuan}.`]}},
  jumlah(r,d,s,K){const[a,b]=dua(r,d.label.length),va=d.nilai[a],vb=d.nilai[b],x=va+vb;
    return{tipe:'pg',teks:`Jumlah ${fx2(K,d,a,b)} adalah …`,...opsiAngka(r,x,[Math.abs(va-vb),x+d.kelip,x-d.kelip,x+d.step],d.satuan,d),anim:{op:'jumlah',idx:[a,b]},
      kunci:[...baca(d,s,a),...baca(d,s,b),`Jumlah = ${angka(va)} + ${angka(vb)} = ${angka(x)} ${d.satuan}.`]}},
  total(r,d,s,K){const n=d.label.length,x=jumlah(d.nilai),lupa=pilih(r,d.nilai);
    return{tipe:'pg',teks:`Jumlah ${K.semua(n)} adalah …`,...opsiAngka(r,x,[x-lupa,x+d.kelip,x-d.kelip,x+d.step],d.satuan,d),anim:{op:'jumlah',idx:d.nilai.map((_,i)=>i)},
      kunci:[`Baca semua data: ${d.label.map((_,k)=>singkat(d,k)).join(', ')}.`,`Jumlahkan: ${d.nilai.map(angka).join(' + ')} = ${angka(x)} ${d.satuan}.`]}},
  kali(r,d,s,K){const n=d.label.length;let i=-1,j,k;
    for(let c=0;c<30&&i<0;c++){j=ri(r,0,n-1);k=ri(r,2,4);const v=d.nilai[j]*k;if(v>d.ytop)continue;const ada=d.nilai.indexOf(v);
      if(ada>=0){i=ada;break}i=ri(r,0,n-2);if(i>=j)i++;d.nilai[i]=v}
    if(i<0)return{...G.selisih(r,d,s,K),jenisGanti:'selisih'};
    return{tipe:'pg',teks:`${besar(fx(K,d,i))} adalah … kali ${fx(K,d,j)}.`,...opsiTeks(r,`${k} kali`,acak(r,[2,3,4,5,6].filter(x=>x!==k)).map(x=>`${x} kali`)),anim:{op:'kali',i,j,k},
      kunci:[...baca(d,s,i),...baca(d,s,j),`${angka(d.nilai[i])} : ${angka(d.nilai[j])} = ${k}. Batang ${d.label[j]} ditumpuk ${k} kali sama tinggi dengan batang ${d.label[i]}.`]}},
  syarat(r,d,s,K){const B=batas(r,d),n=d.label.length,jamak=K.jamak,nama=d.label.filter((_,i)=>B.idx[i]);
    const o=opsiTeks(r,`${B.c} ${jamak}`,acak(r,[B.c+1,B.c-1,B.c+2,n-B.c,0,n].filter(v=>v>=0&&v<=n&&v!==B.c)).map(v=>`${v} ${jamak}`));
    return{tipe:'pg',teks:`Ada berapa ${K.syarat(OP[B.cmp],angka(B.b))}?`,...o,anim:{op:'syarat',b:B.b,cmp:B.cmp},
      kunci:[`Tarik garis batas di angka ${angka(B.b)}.`,`Yang ${OP[B.cmp]} ${angka(B.b)}: ${nama.join(', ')||'tidak ada'}.`,`Jadi ada ${B.c} ${jamak}.`]}},
  multi(r,d,s,K){const B=batas(r,d),n=d.label.length;let idx=d.label.map((_,i)=>i);
    /* 4 pilihan, ada yang benar dan ada yang salah */
    if(n>4)for(let c=0;c<50;c++){const t=acak(r,d.label.map((_,i)=>i)).slice(0,4);idx=t.sort((a,b)=>a-b);if(t.some(i=>B.idx[i])&&t.some(i=>!B.idx[i]))break}
    return{tipe:'multi',teks:`Pilih semua ${K.syarat(OP[B.cmp],angka(B.b))}.`,opsi:idx.map(i=>d.label[i]),benar:idx.map(i=>B.idx[i]),anim:{op:'syarat',b:B.b,cmp:B.cmp},
      kunci:[`Tarik garis batas di angka ${angka(B.b)}.`,...idx.map(i=>`${singkat(d,i)}: ${B.idx[i]?'ya':'tidak'}, karena ${angka(d.nilai[i])} ${B.idx[i]?'':'tidak '}${OP[B.cmp]} ${angka(B.b)}.`)]}},
  pernyataan(r,d,s,K,level){const p=daftarPernyataan(r,d,s,K,level,4);
    return{tipe:'multi',teks:'Pilih semua pernyataan yang benar.',opsi:p.map(x=>x.teks),benar:p.map(x=>x.benar),anim:{op:'urut',list:p.map(x=>x.anim),teks:p.map(x=>x.teks),benar:p.map(x=>x.benar)},kunci:p.map(x=>x.kunci)}},
  kategori(r,d,s,K,level){const p=daftarPernyataan(r,d,s,K,level,level===3?4:3);
    return{tipe:'kategori',teks:'Tentukan Benar atau Salah untuk setiap pernyataan berikut!',pernyataan:p.map(x=>({teks:x.teks,benar:x.benar})),benar:p.map(x=>x.benar),anim:{op:'urut',list:p.map(x=>x.anim),teks:p.map(x=>x.teks),benar:p.map(x=>x.benar)},kunci:p.map(x=>x.kunci)}},
  hilang(r,d,s,K){const n=d.label.length,i=ri(r,0,n-1),v=d.nilai[i],T=jumlah(d.nilai),S=T-v;
    return{tipe:'pg',tanpa:i,teks:`Jumlah ${K.semua(n)} adalah ${angka(T)} ${d.satuan}. ${K.sebut?K.sebut(d.label[i]):'Data '+d.label[i]} tertutup noda tinta. Berapa ${fx(K,d,i)}?`,...opsiAngka(r,v,[S,v+d.kelip,v-d.kelip,v+d.step],d.satuan,d),anim:{op:'hilang',i,total:T},
      kunci:[`Jumlahkan data yang terlihat: ${d.nilai.filter((_,k)=>k!==i).map(angka).join(' + ')} = ${angka(S)}.`,`Yang hilang = jumlah seluruhnya − yang terlihat = ${angka(T)} − ${angka(S)} = ${angka(v)} ${d.satuan}.`]}},
  /* tabel diketahui, pilih diagram batang yang cocok */
  cocok(r,d,s,K){const n=d.label.length,beda=[],sama=(a,b)=>a.every((v,k)=>v===b[k]);
    const ubah=[()=>{const[a,b]=dua(r,n),x=d.nilai.slice();[x[a],x[b]]=[x[b],x[a]];return x},()=>{const x=d.nilai.slice(),a=ri(r,0,n-1);x[a]=x[a]+d.step<=d.ytop?x[a]+d.step:x[a]-d.step;return x},()=>{const x=d.nilai.slice(),a=ri(r,0,n-1);x[a]=Math.max(d.kelip,x[a]-d.kelip*(x[a]>d.kelip?1:-1));return x},()=>d.nilai.slice().reverse()];
    for(let c=0;c<40&&beda.length<3;c++){const x=pilih(r,ubah)();if(x.every(v=>v>0&&v<=d.ytop)&&!sama(x,d.nilai)&&!beda.some(b=>sama(b,x)))beda.push(x)}
    const semua=acak(r,[d.nilai,...beda]),svg=x=>svgBatang({...d,nilai:x},{kecil:true});
    return{tipe:'pg',sajianPaksa:'tabel',teks:`Data pada tabel digambar menjadi diagram batang. Diagram batang mana yang tepat?`,opsi:semua.map(svg),benar:semua.indexOf(d.nilai),anim:{op:'ubah'},
      kunci:['Baca tiap baris tabel, lalu cocokkan dengan tinggi tiap batang.',d.label.map((_,k)=>singkat(d,k)).join(', ')+'.','Diagram yang semua batangnya sama dengan tabel adalah jawabannya.']}}
};
/* ---------- diagram lingkaran ---------- */
const opsiPersen=(r,p,pengecoh)=>opsiTeks(r,persen(p),[...new Set([...pengecoh,p+5,p-5,p+10,p-10,p*2,p+15,p+20].filter(x=>x>0&&x<100&&x!==p))].map(persen));
Object.assign(G,{
  piePersen(r,d,s,K){const n=d.label.length,i=ri(r,0,n-1),v=d.nilai[i],p=d.pct[i],T=d.total;
    const kunci=[`Irisan ${d.label[i]} = ${persen(p)} dari seluruh lingkaran.`,`Banyaknya = ${p}/100 × ${angka(T)} = ${angka(v)} ${d.satuan}.`];
    return{tipe:'pg',tampil:'persen',teks:`Jumlah ${K.semua(n)} ada ${angka(T)} ${d.satuan}. Berapa ${fx(K,d,i)}?`,...opsiAngka(r,v,[p,T-v,...d.nilai.filter((_,k)=>k!==i)],d.satuan,d),anim:{op:'pie',mode:'baca',idx:[i],tampil:'persen',langkah:kunci},kunci}},
  pieBanyak(r,d,s,K){const n=d.label.length,i=ri(r,0,n-1),v=d.nilai[i],p=d.pct[i],T=d.total;
    const kunci=[`Jumlah seluruhnya = ${d.nilai.map(angka).join(' + ')} = ${angka(T)} ${d.satuan}.`,`${d.label[i]} = ${angka(v)}/${angka(T)} × 100% = ${persen(p)}.`];
    return{tipe:'pg',tampil:'banyak',teks:`${besar(fx(K,d,i))} adalah … dari jumlah seluruhnya.`,...opsiPersen(r,p,[v,...d.pct.filter((_,k)=>k!==i)]),anim:{op:'pie',mode:'persen',idx:[i],tampil:'banyak',langkah:kunci},kunci}},
  pieBanding(r,d,s,K){const max=r()<.6,urut=d.nilai.map((_,i)=>i).sort((a,b)=>max?d.nilai[b]-d.nilai[a]:d.nilai[a]-d.nilai[b]),i=urut[0],tampil=r()<.5?'persen':'banyak';
    const kunci=[`Irisan paling ${max?'besar':'kecil'} = data paling ${max?'banyak':'sedikit'}.`,`Paling ${max?'banyak':'sedikit'}: ${d.label[i]} (${tampil==='persen'?persen(d.pct[i]):angka(d.nilai[i])+' '+d.satuan}).`];
    return{tipe:'pg',tampil,teks:K.tanya(max?'banyak':'sedikit'),...opsiTeks(r,d.label[i],urut.slice(1).map(k=>d.label[k])),anim:{op:'pie',mode:'banding',idx:[i],max,tampil,langkah:kunci},kunci}},
  pieSelisih(r,d,s,K){const n=d.label.length,[a,b]=dua(r,n),pa=d.pct[a],pb=d.pct[b],dp=Math.abs(pa-pb),dv=Math.abs(d.nilai[a]-d.nilai[b]),T=d.total,anim=k=>({op:'pie',mode:'selisih',idx:[a,b],tampil:'persen',langkah:k});
    if(r()<.5){const kunci=[`Selisih bagiannya = ${persen(Math.max(pa,pb))} − ${persen(Math.min(pa,pb))} = ${persen(dp)}.`,`Selisih banyaknya = ${dp}/100 × ${angka(T)} = ${angka(dv)} ${d.satuan}.`];
      return{tipe:'pg',tampil:'persen',teks:`Jumlah ${K.semua(n)} ada ${angka(T)} ${d.satuan}. Selisih ${fx2(K,d,a,b)} adalah …`,...opsiAngka(r,dv,[dp,d.nilai[a]+d.nilai[b],Math.max(d.nilai[a],d.nilai[b])],d.satuan,d),anim:anim(kunci),kunci}}
    const kunci=[`${d.label[a]} = ${persen(pa)}, ${d.label[b]} = ${persen(pb)}.`,`Selisihnya = ${persen(Math.max(pa,pb))} − ${persen(Math.min(pa,pb))} = ${persen(dp)}.`];
    return{tipe:'pg',tampil:'persen',teks:`Selisih persentase ${d.label[a]} dan ${d.label[b]} adalah …`,...opsiPersen(r,dp,[pa+pb]),anim:anim(kunci),kunci}},
  pieGabung(r,d,s,K){const[a,b]=dua(r,d.label.length),pa=d.pct[a],pb=d.pct[b],x=pa+pb;
    const kunci=[`${d.label[a]} = ${persen(pa)}, ${d.label[b]} = ${persen(pb)}.`,`Gabungannya = ${persen(pa)} + ${persen(pb)} = ${persen(x)}.`];
    return{tipe:'pg',tampil:'persen',teks:`Persentase gabungan ${d.label[a]} dan ${d.label[b]} adalah …`,...opsiPersen(r,x,[Math.abs(pa-pb),100-x]),anim:{op:'pie',mode:'gabung',idx:[a,b],tampil:'persen',langkah:kunci},kunci}},
  piePecahan(r,d,s,K){const i=ri(r,0,d.label.length-1),p=d.pct[i],f=pecahan(p),pengecoh=[...d.pct.filter((_,k)=>k!==i),p+5,p-5,p+10].filter(x=>x>0&&x<100&&x!==p).map(pecahan);
    const kunci=[`${d.label[i]} = ${persen(p)} = ${p}/100.`,`Sederhanakan: pembilang dan penyebut dibagi ${fpb(p,100)}, jadi ${p}/100 = ${f}.`];
    return{tipe:'pg',tampil:'persen',teks:`Bagian ${d.label[i]} pada diagram lingkaran jika ditulis sebagai pecahan paling sederhana adalah …`,...opsiTeks(r,f,acak(r,pengecoh)),anim:{op:'pie',mode:'pecahan',idx:[i],tampil:'persen',langkah:kunci},kunci}},
  pieHilang(r,d,s,K){const n=d.label.length,i=ri(r,0,n-1),p=d.pct[i],v=d.nilai[i],T=d.total,S=100-p,lainnya=d.label.map((_,k)=>k).filter(k=>k!==i);
    if(r()<.5){const kunci=['Satu lingkaran penuh = 100%.',`Yang terlihat: ${lainnya.map(k=>persen(d.pct[k])).join(' + ')} = ${persen(S)}.`,`${d.label[i]} = 100% − ${persen(S)} = ${persen(p)}.`];
      return{tipe:'pg',tampil:'persen',tanpa:i,teks:`Bagian ${d.label[i]} tertutup noda tinta. Berapa persen bagian ${d.label[i]}?`,...opsiPersen(r,p,[S,100-S-5]),anim:{op:'pie',mode:'hilang',idx:[i],tanpa:i,tampil:'persen',langkah:kunci},kunci}}
    const sv=T-v,kunci=[`Yang terlihat: ${lainnya.map(k=>angka(d.nilai[k])).join(' + ')} = ${angka(sv)}.`,`${d.label[i]} = ${angka(T)} − ${angka(sv)} = ${angka(v)} ${d.satuan}.`];
    return{tipe:'pg',tampil:'banyak',tanpa:i,teks:`Jumlah ${K.semua(n)} ada ${angka(T)} ${d.satuan}. Data ${d.label[i]} tertutup noda tinta. Berapa ${fx(K,d,i)}?`,...opsiAngka(r,v,[sv,p],d.satuan,d),anim:{op:'pie',mode:'hilang',idx:[i],tanpa:i,tampil:'banyak',langkah:kunci},kunci}},
  /* tabel diketahui, pilih diagram lingkaran yang cocok */
  pieCocok(r,d,s,K){const n=d.label.length,beda=[],sama=(a,b)=>a.every((v,k)=>v===b[k]),T=d.total;
    const ubah=[()=>{const[a,b]=dua(r,n),x=d.nilai.slice();[x[a],x[b]]=[x[b],x[a]];return x},()=>{const[a,b]=dua(r,n),x=d.nilai.slice(),m=d.kelip*ri(r,1,3);x[a]+=m;x[b]-=m;return x}];
    for(let c=0;c<60&&beda.length<3;c++){const x=pilih(r,ubah)();if(x.every(v=>v>0)&&!sama(x,d.nilai)&&!beda.some(b=>sama(b,x)))beda.push(x)}
    const semua=acak(r,[d.nilai,...beda]),svg=x=>svgLingkaran({...d,nilai:x},{kecil:true,tanpaTotal:true});
    const kunci=[`Jumlah seluruhnya = ${d.nilai.map(angka).join(' + ')} = ${angka(T)}.`,d.label.map((l,k)=>`${l} = ${angka(d.nilai[k])}/${angka(T)} = ${persen(d.pct[k])}`).join(', ')+'.','Diagram yang semua irisannya sama dengan persen itu adalah jawabannya.'];
    return{tipe:'pg',teks:'Data pada tabel digambar menjadi diagram lingkaran. Diagram lingkaran mana yang tepat?',opsi:semua.map(svg),benar:semua.indexOf(d.nilai),anim:{op:'pie',mode:'ubah',idx:[],tampil:'persen',langkah:kunci},kunci}},
  /* ---------- diagram garis ---------- */
  gBaca(r,d,s,K){const q=G.baca(r,d,'garis',K);return{...q,anim:{op:'gTitik',idx:[q.anim.i],langkah:q.kunci}}},
  gBanding(r,d,s,K){const q=G.banding(r,d,'garis',K);q.kunci[0]=`Cari titik yang paling ${q.anim.max?'tinggi':'rendah'}.`;return{...q,anim:{op:'gTitik',mode:'banding',idx:[q.anim.i],max:q.anim.max,langkah:q.kunci}}},
  gSelisih(r,d,s,K){const q=G.selisih(r,d,'garis',K);return{...q,anim:{op:'gSelisih',i:q.anim.i,j:q.anim.j,langkah:q.kunci}}},
  gJumlah(r,d,s,K){const q=G.jumlah(r,d,'garis',K);return{...q,anim:{op:'gTitik',idx:q.anim.idx,langkah:q.kunci}}},
  gNaik(r,d,s,K){const dl=d.nilai.slice(1).map((v,k)=>v-d.nilai[k]),naik=r()<.6,ex=naik?Math.max(...dl):Math.min(...dl);
    if(!(naik?ex>0:ex<0)||dl.filter(x=>x===ex).length>1)return{...G.gSelisih(r,d,s,K),jenisGanti:'gSelisih'};
    const k=dl.indexOf(ex),nama=j=>`${d.label[j]} ke ${d.label[j+1]}`,kata=naik?'Kenaikan':'Penurunan',lain=acak(r,dl.map((_,j)=>j).filter(j=>j!==k)).slice(0,3);
    const kunci=[`Hitung perubahan tiap dua titik berurutan: ${dl.map((x,j)=>`${d.label[j]}→${d.label[j+1]} ${x>0?'+':'−'}${angka(Math.abs(x))}`).join(', ')}.`,`${kata} paling besar: ${nama(k)} (${naik?'naik':'turun'} ${angka(Math.abs(ex))} ${d.satuan}).`];
    return{tipe:'pg',teks:`${kata} paling besar terjadi dari …`,...opsiTeks(r,nama(k),lain.map(nama)),anim:{op:'gSegmen',i:k,naik,langkah:kunci},kunci}},
  /* ---------- tabel frekuensi ---------- */
  fSyarat(r,d,s,K){const n=d.label.length,bi=ri(r,1,n-2),cmp=r()<.6?'>':'<',idx=d.label.map((_,i)=>i).filter(i=>cmp==='>'?i>bi:i<bi),x=jumlah(idx.map(i=>d.nilai[i])),b=d.label[bi];
    return{tipe:'pg',teks:`Berapa ${K.fs(OP[cmp],b)}?`,...opsiAngka(r,x,[x+d.nilai[bi],jumlah(d.nilai)-x,idx.length],d.satuan,d),anim:{op:'jumlah',idx},
      kunci:[`${d.kat} yang ${OP[cmp]} ${b}: ${idx.map(i=>d.label[i]).join(', ')} (${b} sendiri tidak ikut).`,`Jumlahkan frekuensinya: ${idx.map(i=>angka(d.nilai[i])).join(' + ')} = ${angka(x)} ${d.satuan}.`]}}
});
/* jenis soal untuk sajian baru, per tingkat */
const BARU={
  lingkaran:{1:['piePersen','pieBanding','pieBanyak','piePecahan','kategori'],2:['piePersen','pieBanyak','pieSelisih','pieGabung','pieHilang','kategori','piePecahan','pieCocok'],3:['piePersen','pieBanyak','pieSelisih','pieGabung','pieHilang','pernyataan','kategori','pieCocok','piePecahan']},
  garis:{1:['gBaca','gBanding','gSelisih','gNaik','kategori'],2:['gBaca','gSelisih','gNaik','gJumlah','kategori','gBanding','pernyataan'],3:['gSelisih','gNaik','gJumlah','pernyataan','kategori','gNaik','gBanding']},
  frekuensi:{1:['baca','banding','selisih','total','kategori'],2:['baca','selisih','total','fSyarat','jumlah','kategori','hilang','banding'],3:['fSyarat','total','hilang','selisih','pernyataan','kategori','jumlah','fSyarat']}};
const JENIS={1:['baca','banding','selisih','kategori','syarat','baca','selisih'],2:['baca','selisih','jumlah','total','syarat','multi','kategori','cocok','banding'],3:['selisih','total','kali','hilang','multi','pernyataan','kategori','cocok','syarat','jumlah']};
const SAJIAN={1:['batang','piktogram','tabel','turus','lingkaran','garis','frekuensi'],2:['batang','piktogram','tabel','turus','lingkaran','garis','frekuensi','batang','lingkaran'],3:['batang','piktogram','tabel','lingkaran','garis','frekuensi','lingkaran','garis','batang']};
const BISA_TURUS=['baca','banding','selisih','jumlah','total','syarat','kategori','multi'];
const lv=x=>Math.max(1,Math.min(3,Math.round(+x)||1));
function rakit(q,d,sajian,K,level,jenis){return{...q,jenis:q.jenisGanti||jenis,sajian,level,konteks:K.id,data:d,gambar:gambar(d,sajian,{tanpa:q.tanpa,tampil:q.tampil}),ingat:INGAT[sajian]}}
/* soal ke-n untuk satu pemain; `c` = percobaan ulang kalau soalnya sudah pernah muncul */
function soal(seed,n,level=1,pilihSajian='campur',c=0){level=lv(level);
  const r=random(seed*7919+n*104729+c*15485863+level*31),urutan=acak(random(seed*31+level),JENIS[level]);
  let jenis=urutan[(n+c)%urutan.length],sajian=pilihSajian==='campur'?pilih(r,SAJIAN[level]):pilihSajian;
  if(BARU[sajian]){const u=acak(random(seed*53+level+sajian.length),BARU[sajian][level]);jenis=u[(n+c)%u.length]}
  else{if(jenis==='cocok'){if(sajian==='piktogram')jenis='selisih';else sajian='tabel'}
    if(sajian==='turus'&&!BISA_TURUS.includes(jenis))sajian='batang'}
  /* tabel → diagram lingkaran: yang tampil tabel, datanya data lingkaran */
  let jenisData=sajian;if(jenis==='pieCocok'){jenisData='lingkaran';sajian='tabel'}
  const K=pilih(r,KONTEKS.filter(k=>cocokK(k,jenisData))),d=buatData(r,level,jenisData,K);
  return rakit(G[jenis](r,d,sajian,K,level),d,sajian,K,level,jenis)}
/* soal dari data yang sudah ada (Koki Data, Lab, dan Survei Kelas); data tidak diubah */
const JENIS_DATA={1:['baca','banding','selisih','kategori','syarat'],2:['selisih','jumlah','total','syarat','multi','kategori','banding'],3:['selisih','total','multi','pernyataan','kategori','syarat','jumlah']};
function soalData(seed,n,level,data,sajian='batang',K,c=0){level=lv(level);K=K||cariK(data.k);
  const r=random(seed*613+n*7919+c*104729),d={...data,label:data.label.slice(),nilai:data.nilai.slice()};lengkapi(d);
  /* data kembar: soal "paling banyak", pernyataan, dan selisih irisan bisa tidak jelas */
  const rawan=['banding','kategori','pernyataan','pieBanding','pieSelisih','gBanding','gNaik'],daftar=BARU[sajian]?BARU[sajian][level].filter(j=>j!=='pieCocok'):JENIS_DATA[level];
  const urutan=acak(random(seed*17+level),daftar).filter(j=>unik(d)||!rawan.includes(j)),jenis=urutan[(n+c)%urutan.length];
  return rakit(G[jenis](r,d,sajian,K,level),d,sajian,K,level,jenis)}
const unik=d=>new Set(d.nilai).size===d.nilai.length;
/* Koki Data: pesanan pelanggan. Pizza (diagram lingkaran, 10 atau 20 potong) atau jus (diagram batang). */
const IKON_DAPUR={Keju:'🧀',Sosis:'🌭',Jamur:'🍄',Cokelat:'🍫',Nanas:'🍍',Ayam:'🍗',Jeruk:'🍊',Apel:'🍎',Mangga:'🥭',Alpukat:'🥑',Melon:'🍈',Jambu:'🍐'};
function dataPesanan(seed,n,level=1){level=lv(level);const r=random(seed*389+n*7919+level),buat=pilih(r,['lingkaran','lingkaran','batang']),K=cariK(buat==='lingkaran'?'pizza':'jus'),k=level===1?3:level===2?4:ri(r,4,5);
  const T=buat==='lingkaran'?(level===1?10:20):0,nilai=T?bagi(r,k,T,1):acak(r,[1,2,3,4,5,6,7,8,9]).slice(0,k),label=acak(r,K.label).slice(0,k);
  const d=lengkapi({k:K.id,judul:K.judul,kat:K.kat,satuan:K.satuan,ikon:K.ikon,label,nilai,step:1,unit:1,kelip:1,...(T?{total:T}:{})});
  if(!T)d.ytop=10;
  d.ikonItem=label.map(l=>IKON_DAPUR[l]||K.ikon);d.pesanan=acak(r,label.flatMap((_,i)=>Array(nilai[i]).fill(i)));d.buat=buat;return d}

const cek=(q,j)=>q.tipe==='pg'?j===q.benar:Array.isArray(j)&&j.length===q.benar.length&&j.every((v,i)=>v===q.benar[i]);
const kunciSoal=q=>q.teks+'|'+q.sajian+'|'+q.data.label.join(',')+'|'+q.data.nilai.join(',');
function dek(buat,dipakai=new Set()){const daftar=[];
  return{ambil(i){while(daftar.length<=i){const n=daftar.length;let q;for(let c=0;c<80;c++){q=buat(n,c);if(!dipakai.has(kunciSoal(q)))break}dipakai.add(kunciSoal(q));daftar.push(q)}return daftar[i]},dipakai}}
/* teks jawaban benar untuk ringkasan */
const jawabanTeks=q=>q.tipe==='pg'?(q.opsi[q.benar].startsWith('<svg')?'ABCD'[q.benar]:q.opsi[q.benar]):q.tipe==='multi'?q.opsi.filter((_,i)=>q.benar[i]).join('; '):q.pernyataan.map((p,i)=>`${i+1}. ${p.benar?'Benar':'Salah'}`).join(', ');

return{KONTEKS,WARNA,INGAT,NAMA_SAJIAN,random,acak,angka,besar,esc,jumlah,skalaRapi,lengkapi,cariK,konteksSurvei,buatData,tataBatang,svgBatang,svgPiktogram,svgTabel,svgTurus,turusSvg,gambar,baca,
  svgLingkaran,svgGaris,svgFrekuensi,tataPie,IKON_DAPUR,busur,PIE,persen,pecahan,cocokK,
  soal,soalData,dataPesanan,cek,dek,kunciSoal,jawabanTeks,JENIS,BARU,G};
})();
if(typeof module!=='undefined')module.exports=DT;
