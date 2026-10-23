/* =========================================================
   PENGUKURAN · data tangga satuan, singkatan, konversi, dan pembuat soal.
   Tanpa DOM, jadi bisa diuji dengan Node.
   Cakupan: panjang (km–mm), volume (kl–ml), berat (kg–mg), waktu,
   dan membaca alat ukur (penggaris, gelas ukur, timbangan, jam).
   Angka desimal digeser lewat notasi eksponen supaya tidak ada galat seperti 0,1 + 0,2 = 0,30000000004.
   ========================================================= */
const UK=(()=>{
/* ---------- tangga satuan ---------- */
const TANGGA={
  panjang:{id:'panjang',nama:'Panjang',pokok:'m',tokoh:0,
    satuan:['km','hm','dam','m','dm','cm','mm'],lengkap:['kilometer','hektometer','dekameter','meter','desimeter','sentimeter','milimeter'],
    kata:['Kakek','Hendak','Datang','Mampir','Dengan','Cucu','Manis'],sifat:'panjang',alat:'penggaris'},
  volume:{id:'volume',nama:'Volume',pokok:'l',tokoh:1,
    satuan:['kl','hl','dal','l','dl','cl','ml'],lengkap:['kiloliter','hektoliter','dekaliter','liter','desiliter','sentiliter','mililiter'],
    kata:['Kakek','Hendak','Datang','Lewat','Dengan','Cucu','Manis'],sifat:'banyak isinya',alat:'gelas'},
  berat:{id:'berat',nama:'Berat',pokok:'g',tokoh:2,
    satuan:['kg','hg','dag','g','dg','cg','mg'],lengkap:['kilogram','hektogram','dekagram','gram','desigram','sentigram','miligram'],
    kata:['Kakek','Hendak','Datang','Gembira','Dengan','Cucu','Manis'],sifat:'berat',alat:'timbangan'},
  waktu:{id:'waktu',nama:'Waktu',pokok:'jam',tokoh:3,
    satuan:['minggu','hari','jam','menit','detik'],lengkap:['minggu','hari','jam','menit','detik'],faktor:[7,24,60,60],
    kata:['Mimi','Harus','Jaga','Meja','Depan'],sifat:'lama',alat:'jam'}
};
const BESARAN=['panjang','volume','berat','waktu'];
/* singkatan supaya mudah diingat */
const SINGKAT={
  panjang:{kalimat:'Kakek Hendak Datang Mampir Dengan Cucu Manis',kode:'Ka-He-Da-M-De-Ce-Me'},
  volume:{kalimat:'Kakek Hendak Datang Lewat Dengan Cucu Manis',kode:'Ka-He-Da-L-De-Ce-Me'},
  berat:{kalimat:'Kakek Hendak Datang Gembira Dengan Cucu Manis',kode:'Ka-He-Da-G-De-Ce-Me'},
  waktu:{kalimat:'Mimi Harus Jaga Meja Depan',kode:'Mi-Ha-Ja-Me-De'},
  aturan:{kode:'TuKa NaBa',kalimat:'turun satu anak tangga dikali 10, naik satu anak tangga dibagi 10'},
  tahun:{kode:'Lu-Wi-Da-A',kalimat:'Lucu Wiwi Dapat Apel: Lustrum 5, Windu 8, Dasawarsa 10, Abad 100 tahun'}
};
/* fakta tambahan per besaran (dipakai di Lab dan pembahasan) */
const BONUS={
  panjang:['1 km = 1.000 m (kira-kira jalan kaki 12 menit)','1 m = 100 cm, 1 cm = 10 mm','Penggaris sekolah biasanya 30 cm'],
  volume:['1 liter = 1 dm³','1 ml = 1 cm³ (kubus satuan di DIMENSIA!)','1 sendok teh kira-kira 5 ml'],
  berat:['1 ton = 1.000 kg','1 kuintal = 100 kg','1 ons = 1 hg = 100 g'],
  waktu:['1 tahun = 12 bulan = 52 minggu = 365 hari','Tahun kabisat = 366 hari','1 bulan = 28 sampai 31 hari']
};
const TAHUN=[{n:'lustrum',t:5},{n:'windu',t:8},{n:'dasawarsa',t:10},{n:'abad',t:100}];

/* ---------- angka ---------- */
const rapi=x=>Number(Number(x).toPrecision(12));
function geser(x,k){x=rapi(x);if(x===0||!k)return x;const[m,e]=x.toExponential().split('e');return rapi(Number(m+'e'+(Number(e)+k)))}
const angka=x=>rapi(x).toLocaleString('id-ID',{maximumFractionDigits:6});
const desimal=x=>{const s=String(rapi(x));return s.includes('.')?s.split('.')[1].length:0};
/* x satuan `dari` -> satuan `ke` (hanya tangga metrik) */
function ubah(besaran,x,dari,ke){const T=TANGGA[besaran].satuan,k=T.indexOf(ke)-T.indexOf(dari);return geser(x,k)}
/* waktu: faktor antar dua satuan di tangga waktu */
function faktorWaktu(dari,ke){const T=TANGGA.waktu.satuan,F=TANGGA.waktu.faktor;let a=T.indexOf(dari),b=T.indexOf(ke),f=1;for(let i=Math.min(a,b);i<Math.max(a,b);i++)f*=F[i];return b>a?f:1/f}
const jamTeks=(h,m)=>String(h).padStart(2,'0')+'.'+String(m).padStart(2,'0');
const lamaTeks=m=>{const j=Math.floor(m/60),s=m%60;return j&&s?`${j} jam ${s} menit`:j?`${j} jam`:`${s} menit`};

/* ---------- acak ---------- */
function random(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),pilih=(r,a)=>a[Math.floor(r()*a.length)];
function acak(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* 4 pilihan berbeda; `pengecoh` berisi teks; cadangan dipakai kalau pengecoh kurang */
function opsi(r,benar,pengecoh,cadangan){const v=[benar];for(const x of[...pengecoh,...(cadangan||[])])if(x&&!v.includes(x)&&v.length<4)v.push(x);
  for(let k=1;v.length<4;k++){const x=benar+' '.repeat(k);v.push(x)}/* tidak pernah terjadi pada soal normal */
  const o=acak(r,v);return{opsi:o,benar:o.indexOf(benar)}}
const nilaiPengecoh=(benar,daftar)=>daftar.map(rapi).filter(x=>x>0&&x!==rapi(benar)&&Number.isFinite(x)&&desimal(x)<=6);

/* ---------- jenis soal ---------- */
function soalUbah(r,lv,besaran){
  const T=TANGGA[besaran],S=T.satuan,maks=[0,3,4,6][lv],k=ri(r,1,maks),turun=lv===1||r()<.6;
  const a=ri(r,0,6-k),dari=S[turun?a:a+k],ke=S[turun?a+k:a];let x;
  if(turun)x=lv===1?ri(r,2,9)*(r()<.4?10:1)+(r()<.3?ri(r,1,9):0):r()<.5?ri(r,11,95)/10:ri(r,2,40);
  else{x=lv===1?ri(r,2,9)*10**k:ri(r,12,999)*(r()<.5?10:1);if(desimal(geser(x,-k))>3)x=ri(r,2,9)*10**k}
  const kk=turun?k:-k,y=geser(x,kk),f=angka(10**k);
  const p=nilaiPengecoh(y,[geser(x,kk+1),geser(x,kk-1),geser(x,-kk),geser(x,kk+2),geser(x,kk-2)]);
  const o=opsi(r,`${angka(y)} ${ke}`,acak(r,p).map(v=>`${angka(v)} ${ke}`));
  return{besaran,jenis:'ubah',teks:`${angka(x)} ${dari} = … ${ke}`,...o,lompat:{besaran,dari,ke,nilai:x},
    kunci:[`Dari ${dari} ke ${ke}: ${turun?'turun':'naik'} ${k} anak tangga`,turun?`Turun = kali: × 10 sebanyak ${k} kali = × ${f}`:`Naik = bagi: : 10 sebanyak ${k} kali = : ${f}`,`${angka(x)} ${turun?'×':':'} ${f} = ${angka(y)} ${ke}`]}}
function soalJumlah(r,lv,besaran){
  const S=TANGGA[besaran].satuan,k=ri(r,1,lv===3?3:2),a0=ri(r,0,6-k),u1=S[a0],u2=S[a0+k],a=ri(r,1,9),b=ri(r,1,10**k-1),kurang=lv===3&&r()<.4;
  const A=geser(a,k),y=kurang?A-b:A+b,op=kurang?'−':'+';
  const p=nilaiPengecoh(y,[kurang?Math.abs(a-b):a+b,kurang?geser(a,k-1)-b:geser(a,k-1)+b,kurang?geser(a,k+1)-b:geser(a,k+1)+b,kurang?A+b:A-b]);
  const o=opsi(r,`${angka(y)} ${u2}`,acak(r,p).map(v=>`${angka(v)} ${u2}`),nilaiPengecoh(y,[A+geser(b,1),y*10,y+10**k]).map(v=>`${angka(v)} ${u2}`));
  return{besaran,jenis:'jumlah',teks:`${a} ${u1} ${op} ${angka(b)} ${u2} = … ${u2}`,...o,lompat:{besaran,dari:u1,ke:u2,nilai:a},
    kunci:[`Samakan satuannya dulu: ${a} ${u1} = ${angka(A)} ${u2} (turun ${k} anak tangga, × ${angka(10**k)})`,`${angka(A)} ${op} ${angka(b)} = ${angka(y)} ${u2}`]}}
function soalBanding(r,lv,besaran){
  const T=TANGGA[besaran],S=T.satuan,pk=S.indexOf(T.pokok),dasar=ri(r,12,95)*10,palingBesar=r()<.6;
  const nilai=[dasar];while(nilai.length<4){const v=dasar+(palingBesar?-1:1)*ri(r,1,9)*(r()<.5?10:5);if(v>0&&!nilai.includes(v))nilai.push(v)}
  /* tulis tiap nilai (dalam satuan pokok) dengan satuan acak yang hasilnya rapi */
  const tulis=v=>{const c=acak(r,[pk-3,pk-2,pk-1,pk,pk+1,pk+2].filter(i=>i>=0&&i<7));for(const i of c){const x=geser(v,i-pk);if(desimal(x)<=3&&x<100000)return{x,u:S[i]}}return{x:v,u:S[pk]}};
  const teks=nilai.map(v=>{const t=tulis(v);return{v,t:`${angka(t.x)} ${t.u}`,x:t.x,u:t.u}});
  const urut=acak(r,teks),benar=teks[0].t,kata=besaran==='volume'?(palingBesar?'paling banyak':'paling sedikit'):besaran==='berat'?(palingBesar?'paling berat':'paling ringan'):(palingBesar?'paling panjang':'paling pendek');
  return{besaran,jenis:'banding',teks:`Mana yang ${kata}?`,opsi:urut.map(t=>t.t),benar:urut.findIndex(t=>t.t===benar),lompat:null,
    kunci:[`Ubah semua ke ${T.pokok} dulu:`,urut.map(t=>t.u===T.pokok?t.t:`${t.t} = ${angka(t.v)} ${T.pokok}`).join('; '),`Jadi yang ${kata}: ${benar}`]}}
function soalCerita(r,lv,besaran){
  if(besaran==='berat'){const a=ri(r,1,5),b=ri(r,1,9)*100+(lv===3?ri(r,1,9)*10:0),y=a*1000+b;
    const o=opsi(r,`${angka(y)} g`,acak(r,[a+b,a*100+b,a*10000+b,y+1000].map(v=>`${angka(v)} g`)));
    return{besaran,jenis:'cerita',teks:`Ibu membeli ${a} kg gula dan ${angka(b)} g tepung. Berat belanjaan Ibu seluruhnya … g`,...o,lompat:{besaran,dari:'kg',ke:'g',nilai:a},kunci:[`${a} kg = ${angka(a*1000)} g`,`${angka(a*1000)} g + ${angka(b)} g = ${angka(y)} g`]}}
  if(besaran==='volume'){const g=pilih(r,[200,250,300]),n=ri(r,2,4),a=ri(r,2,3),sisa=a*1000-g*n;
    const o=opsi(r,`${angka(sisa)} ml`,acak(r,[a*1000-g,g*n,a*100-g*n>0?a*100-g*n:a*1000+g*n,sisa+g].map(v=>`${angka(v)} ml`)));
    return{besaran,jenis:'cerita',teks:`Botol berisi ${a} liter jus. Jus dituang ke ${n} gelas, tiap gelas ${g} ml. Sisa jus di botol … ml`,...o,lompat:{besaran,dari:'l',ke:'ml',nilai:a},kunci:[`${a} liter = ${angka(a*1000)} ml`,`Dituang: ${n} × ${g} = ${angka(g*n)} ml`,`Sisa: ${angka(a*1000)} − ${angka(g*n)} = ${angka(sisa)} ml`]}}
  const n=pilih(r,[2,4,5]),a=ri(r,1,4)*n/ (n===4?2:1),cm=a*100/n;
  const o=opsi(r,`${angka(cm)} cm`,acak(r,[a/n,a*10/n,a*1000/n,cm*2].map(v=>`${angka(v)} cm`)));
  return{besaran,jenis:'cerita',teks:`Pita sepanjang ${angka(a)} m dipotong menjadi ${n} bagian sama panjang. Panjang tiap bagian … cm`,...o,lompat:{besaran,dari:'m',ke:'cm',nilai:a},kunci:[`${angka(a)} m = ${angka(a*100)} cm`,`${angka(a*100)} : ${n} = ${angka(cm)} cm`]}}
/* waktu */
function soalWaktu(r,lv){
  const besaran='waktu',jenis=lv===1?pilih(r,['ubah','ubah','jam']):lv===2?pilih(r,['ubah','gabung','pecah','durasi','jam']):pilih(r,['gabung','pecah','durasi','selesai','tahun','detik','jam']);
  if(jenis==='jam')return soalAlat(r,lv,'waktu');
  if(jenis==='ubah'){const pasang=pilih(r,[['jam','menit'],['menit','detik'],['hari','jam'],['minggu','hari']]),turun=lv===1?r()<.75:r()<.6,[besar,kecil]=pasang,f=faktorWaktu(besar,kecil);
    const n=ri(r,2,lv===1?5:9),x=turun?n:n*f,y=turun?n*f:n,ke=turun?kecil:besar,dari=turun?besar:kecil;
    const p=[turun?n*100:n*10,turun?n*10:x/10,turun?n*f*10:x/100,turun?x+f:y+1];
    const o=opsi(r,`${angka(y)} ${ke}`,acak(r,nilaiPengecoh(y,p)).map(v=>`${angka(v)} ${ke}`),[`${angka(y*2)} ${ke}`,`${angka(y+2)} ${ke}`]);
    return{besaran,jenis,teks:`${angka(x)} ${dari} = … ${ke}`,...o,lompat:{besaran,dari,ke,nilai:x},kunci:[`1 ${besar} = ${f} ${kecil}`,turun?`${n} × ${f} = ${angka(y)} ${kecil}`:`${angka(x)} : ${f} = ${n} ${besar}`]}}
  if(jenis==='gabung'){const j=ri(r,1,4),m=ri(r,1,11)*5,y=j*60+m;
    const o=opsi(r,`${y} menit`,acak(r,[j*100+m,j+m,j*60,y+60,y-10].map(v=>`${v} menit`)));
    return{besaran,jenis,teks:`${j} jam ${m} menit = … menit`,...o,lompat:{besaran,dari:'jam',ke:'menit',nilai:j},kunci:[`${j} jam = ${j} × 60 = ${j*60} menit`,`${j*60} + ${m} = ${y} menit`]}}
  if(jenis==='pecah'){const j=ri(r,1,4),m=ri(r,1,11)*5,x=j*60+m;
    const salah=[x>=100?`${Math.floor(x/100)} jam ${x%100} menit`:`${j} jam ${m+5} menit`,`${j+1} jam ${m} menit`,`${j} jam ${(m+10)%60||5} menit`,`${j-1>0?j-1:j+2} jam ${m} menit`];
    const o=opsi(r,`${j} jam ${m} menit`,acak(r,salah.filter(s=>s!==`${j} jam ${m} menit`)));
    return{besaran,jenis,teks:`${x} menit = … jam … menit`,...o,lompat:{besaran,dari:'menit',ke:'jam',nilai:x},kunci:[`1 jam = 60 menit`,`${x} : 60 = ${j} sisa ${m}`,`Jadi ${x} menit = ${j} jam ${m} menit`]}}
  if(jenis==='durasi'||jenis==='selesai'){const h=ri(r,6,13),m=ri(r,0,11)*5,d=ri(r,4,lv===3?40:20)*5+(lv===3&&r()<.5?ri(r,1,4):0),e=h*60+m+d,he=Math.floor(e/60),me=e%60;
    if(jenis==='durasi'){const desimalSalah=(he*100+me)-(h*100+m),sal=[lamaTeks(d+10),lamaTeks(Math.max(5,d-10)),lamaTeks(d+60),desimalSalah>0&&desimalSalah!==d?lamaTeks(desimalSalah):lamaTeks(d+5)];
      const o=opsi(r,lamaTeks(d),acak(r,sal),[lamaTeks(d+15),lamaTeks(d+30)]);
      return{besaran,jenis,teks:`Kegiatan dimulai pukul ${jamTeks(h,m)} dan selesai pukul ${jamTeks(he,me)}. Lamanya …`,...o,lompat:null,kunci:[`Dari ${jamTeks(h,m)} sampai ${jamTeks(he,me)}`,`Hitung per jam lalu sisa menitnya (1 jam = 60 menit, bukan 100)`,`Lamanya ${lamaTeks(d)}`]}}
    const sal=[jamTeks(he+1,me),jamTeks(he,(me+10)%60),jamTeks(Math.floor((h*100+m+Math.floor(d/60)*100+d%60)/100),(m+d%60)%100),jamTeks(he-1>=0?he-1:he+2,me)];
    const o=opsi(r,jamTeks(he,me),acak(r,sal.filter(s=>s!==jamTeks(he,me))),[jamTeks(he,(me+5)%60),jamTeks(he,(me+50)%60)]);
    return{besaran,jenis,teks:`Dina mulai belajar pukul ${jamTeks(h,m)} selama ${lamaTeks(d)}. Dina selesai pukul …`,...o,lompat:null,kunci:[`${jamTeks(h,m)} + ${lamaTeks(d)}`,`Menit lebih dari 60? Ubah 60 menit jadi 1 jam`,`Selesai pukul ${jamTeks(he,me)}`]}}
  if(jenis==='tahun'){const u=pilih(r,TAHUN),n=ri(r,2,u.t===100?5:6),y=n*u.t,lain=TAHUN.filter(x=>x!==u).map(x=>n*x.t);
    const o=opsi(r,`${y} tahun`,acak(r,lain.filter(v=>v!==y)).map(v=>`${v} tahun`));
    return{besaran,jenis,teks:`${n} ${u.n} = … tahun`,...o,lompat:null,kunci:[`Ingat ${SINGKAT.tahun.kode}: ${SINGKAT.tahun.kalimat}`,`1 ${u.n} = ${u.t} tahun`,`${n} × ${u.t} = ${y} tahun`]}}
  /* detik: dua anak tangga sekaligus */
  const n=ri(r,2,5),y=n*3600;const o=opsi(r,`${angka(y)} detik`,acak(r,[n*60,n*600,n*360,n*36000].map(v=>`${angka(v)} detik`)));
  return{besaran,jenis,teks:`${n} jam = … detik`,...o,lompat:{besaran,dari:'jam',ke:'detik',nilai:n},kunci:[`Dari jam ke menit lalu ke detik: turun 2 anak tangga`,`× 60 × 60 = × 3.600`,`${n} × 3.600 = ${angka(y)} detik`]}}

/* ---------- membaca alat ukur (gambar SVG) ---------- */
const FONT='font-family="Nunito,Segoe UI,sans-serif" font-weight="800"';
function svgPenggaris(L,benda){/* L dalam cm (boleh desimal), penggaris 0–15 cm */
  const s=32,x0=24,w=15*s;let t='';
  for(let i=0;i<=150;i++){const x=x0+i*s/10,h=i%10?i%5?10:16:24;t+=`<line x1="${x}" y1="96" x2="${x}" y2="${96+h}"/>`;if(i%10===0)t+=`<text x="${x}" y="142" text-anchor="middle" ${FONT} font-size="15" fill="#1e2a4a" stroke="none">${i/10}</text>`}
  const panjang=L*s,warna={pensil:'#ffc93c',pita:'#e8323c',krayon:'#2f7bea',paku:'#9aa6b8'}[benda];
  const gbr=benda==='pensil'?`<rect x="${x0}" y="58" width="${Math.max(10,panjang-24)}" height="26" rx="3" fill="${warna}"/><polygon points="${x0+panjang-24},58 ${x0+panjang},71 ${x0+panjang-24},84" fill="#f3d6a4"/><polygon points="${x0+panjang-8},66.5 ${x0+panjang},71 ${x0+panjang-8},75.5" fill="#1e2a4a"/><rect x="${x0}" y="58" width="12" height="26" fill="#ff8fa3"/>`
    :benda==='paku'?`<rect x="${x0}" y="58" width="8" height="26" rx="2" fill="${warna}"/><polygon points="${x0+8},66 ${x0+panjang-10},66 ${x0+panjang},71 ${x0+panjang-10},76 ${x0+8},76" fill="${warna}"/>`
    :`<rect x="${x0}" y="60" width="${panjang}" height="22" rx="${benda==='krayon'?6:2}" fill="${warna}"/>`;
  return`<svg viewBox="0 0 ${w+48} 156" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${benda} di atas penggaris"><g stroke="#1e2a4a" stroke-width="2.4" stroke-linejoin="round"><rect x="8" y="92" width="${w+32}" height="58" rx="6" fill="#fff8d6"/>${t}${gbr}<line x1="${x0}" y1="50" x2="${x0}" y2="96" stroke-dasharray="4 4"/><line x1="${x0+panjang}" y1="50" x2="${x0+panjang}" y2="96" stroke-dasharray="4 4"/></g><text x="${x0+w+10}" y="128" text-anchor="end" ${FONT} font-size="13" fill="#1e2a4a">cm</text></svg>`}
function svgGelas(v,maks,langkah){/* air v ml di gelas ukur 0–maks ml */
  const top=26,bot=236,h=bot-top,y=bot-h*v/maks;let t='';
  for(let a=0;a<=maks;a+=langkah/2){const yy=bot-h*a/maks,besar=a%langkah===0;t+=`<line x1="78" y1="${yy}" x2="${besar?104:94}" y2="${yy}"/>`;if(besar&&a)t+=`<text x="70" y="${yy+5}" text-anchor="end" ${FONT} font-size="14" fill="#1e2a4a" stroke="none">${angka(a)}</text>`}
  return`<svg viewBox="0 0 220 256" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="gelas ukur"><g stroke="#1e2a4a" stroke-width="2.6" stroke-linejoin="round"><rect x="78" y="${y}" width="96" height="${bot-y}" fill="#4fc3f7" fill-opacity=".85" stroke="none"/><path d="M78 ${y}h96" stroke="#1565d8" stroke-width="3"/><path d="M78 18v218h96V18" fill="none"/><path d="M74 18h8M170 18h12l6-8" fill="none"/>${t}<rect x="66" y="236" width="120" height="12" rx="4" fill="#9aa6b8"/></g><text x="208" y="34" text-anchor="end" ${FONT} font-size="15" fill="#1e2a4a">ml</text></svg>`}
function svgTimbangan(v,maks,langkah,satuan){/* jarum menunjuk v (dalam satuan) pada skala 0–maks, satu putaran penuh */
  const cx=120,cy=128,R=88;let t='';const sudut=a=>(a/maks*300-150)*Math.PI/180;
  for(let a=0;a<=maks+1e-9;a=rapi(a+langkah/2)){const s=sudut(a),besar=Math.abs(rapi(a/langkah)-Math.round(a/langkah))<1e-9,r1=besar?R-16:R-9;
    t+=`<line x1="${cx+Math.sin(s)*R}" y1="${cy-Math.cos(s)*R}" x2="${cx+Math.sin(s)*r1}" y2="${cy-Math.cos(s)*r1}"/>`;
    if(besar)t+=`<text x="${cx+Math.sin(s)*(R-30)}" y="${cy-Math.cos(s)*(R-30)+5}" text-anchor="middle" ${FONT} font-size="${maks>=1000?11:14}" fill="#1e2a4a" stroke="none">${angka(a)}</text>`}
  const s=sudut(v);
  return`<svg viewBox="0 0 240 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="timbangan"><g stroke="#1e2a4a" stroke-width="2.6" stroke-linejoin="round"><rect x="40" y="6" width="160" height="16" rx="6" fill="#9aa6b8"/><rect x="112" y="20" width="16" height="14" fill="#9aa6b8"/><rect x="20" y="30" width="200" height="210" rx="34" fill="#ff8a65"/><circle cx="${cx}" cy="${cy}" r="${R+4}" fill="#fffdf6"/>${t}<line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(s)*(R-6)}" y2="${cy-Math.cos(s)*(R-6)}" stroke="#e8323c" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="7" fill="#1e2a4a"/></g><text x="${cx}" y="${cy+44}" text-anchor="middle" ${FONT} font-size="16" fill="#1e2a4a">${satuan}</text></svg>`}
function svgJam(h,m){const cx=110,cy=110,R=94;let t='';
  for(let i=0;i<60;i++){const a=i*6*Math.PI/180,r1=i%5?R-7:R-14;t+=`<line x1="${cx+Math.sin(a)*R}" y1="${cy-Math.cos(a)*R}" x2="${cx+Math.sin(a)*r1}" y2="${cy-Math.cos(a)*r1}" stroke-width="${i%5?1.6:3}"/>`}
  for(let i=1;i<=12;i++){const a=i*30*Math.PI/180;t+=`<text x="${cx+Math.sin(a)*(R-30)}" y="${cy-Math.cos(a)*(R-30)+7}" text-anchor="middle" ${FONT} font-size="20" fill="#1e2a4a" stroke="none">${i}</text>`}
  const ah=((h%12)+m/60)*30*Math.PI/180,am=m*6*Math.PI/180;
  return`<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="jam dinding"><g stroke="#1e2a4a" stroke-width="2.6" stroke-linecap="round"><circle cx="${cx}" cy="${cy}" r="${R+8}" fill="#7ed957"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fffdf6"/>${t}<line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(ah)*50}" y2="${cy-Math.cos(ah)*50}" stroke-width="7"/><line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(am)*76}" y2="${cy-Math.cos(am)*76}" stroke="#e8323c" stroke-width="4.5"/><circle cx="${cx}" cy="${cy}" r="6" fill="#1e2a4a"/></g></svg>`}
function soalAlat(r,lv,besaran){
  if(besaran==='panjang'){const benda=pilih(r,['pensil','pita','krayon','paku']),mm=lv===1?ri(r,3,14)*10:ri(r,25,145),L=mm/10,tanyaMm=lv>1&&r()<.6;
    const y=tanyaMm?`${mm} mm`:`${angka(L)} cm`,p=tanyaMm?[`${angka(L)} mm`,`${mm*10} mm`,`${mm+10} mm`,`${Math.max(5,mm-5)} mm`]:[`${mm} cm`,`${angka(L+1)} cm`,`${angka(Math.max(1,L-1))} cm`,`${angka(rapi(L+.5))} cm`];
    const o=opsi(r,y,acak(r,p.filter(s=>s!==y)));
    return{besaran,jenis:'alat',teks:`Berapa panjang ${benda} ini? Jawab dalam ${tanyaMm?'mm':'cm'}.`,...o,gambar:svgPenggaris(L,benda),lompat:tanyaMm?{besaran,dari:'cm',ke:'mm',nilai:L}:null,
      kunci:[`Ujung ${benda} mulai di angka 0`,`Ujung lainnya tepat di ${angka(L)} cm${mm%10?` (${Math.floor(L)} cm lebih ${mm%10} garis kecil)`:''}`,tanyaMm?`1 cm = 10 mm, jadi ${angka(L)} cm = ${mm} mm`:`Panjangnya ${angka(L)} cm`]}}
  if(besaran==='volume'){const[maks,langkah]=lv===1?[500,100]:[1000,100],v=lv===1?ri(r,1,4)*100:ri(r,2,19)*50,tanyaL=lv===3&&r()<.6;
    const y=tanyaL?`${angka(v/1000)} l`:`${v} ml`,p=tanyaL?[`${angka(v/100)} l`,`${angka(v/10)} l`,`${v} l`,`${angka(rapi(v/1000+.1))} l`]:[`${v+50} ml`,`${v-50>0?v-50:v+100} ml`,`${angka(v/1000)} ml`,`${v+100} ml`];
    const o=opsi(r,y,acak(r,p.filter(s=>s!==y)));
    return{besaran,jenis:'alat',teks:`Berapa banyak air di gelas ukur? Jawab dalam ${tanyaL?'liter':'ml'}.`,...o,gambar:svgGelas(v,maks,langkah),lompat:tanyaL?{besaran,dari:'ml',ke:'l',nilai:v}:null,
      kunci:[`Lihat permukaan air yang datar, sejajar dengan garis skala`,`Garis panjang tiap ${langkah} ml, garis pendek di tengahnya ${langkah/2} ml`,tanyaL?`${v} ml = ${angka(v/1000)} liter (naik 3 anak tangga, : 1.000)`:`Airnya ${v} ml`]}}
  if(besaran==='berat'){const kg=lv===1;const[maks,langkah,sat]=kg?[5,1,'kg']:[2000,200,'g'],v=kg?ri(r,1,4)+(r()<.5?.5:0):ri(r,2,19)*100,tanyaKg=lv===3&&!kg&&r()<.6;
    const y=kg?`${angka(v)} kg`:tanyaKg?`${angka(v/1000)} kg`:`${angka(v)} g`;
    const p=kg?[`${angka(v+1)} kg`,`${angka(v+.5)} kg`,`${angka(Math.max(.5,v-.5))} kg`,`${angka(v*10)} kg`]:tanyaKg?[`${angka(v/100)} kg`,`${angka(v/10)} kg`,`${angka(v)} kg`,`${angka(rapi(v/1000+.1))} kg`]:[`${angka(v+100)} g`,`${angka(v>100?v-100:v+200)} g`,`${angka(v/1000)} g`,`${angka(v*10)} g`];
    const o=opsi(r,y,acak(r,p.filter(s=>s!==y)));
    return{besaran,jenis:'alat',teks:`Berapa berat buah di timbangan? Jawab dalam ${tanyaKg||kg?'kg':'gram'}.`,...o,gambar:svgTimbangan(v,maks,langkah,sat),lompat:tanyaKg?{besaran,dari:'g',ke:'kg',nilai:v}:null,
      kunci:[`Lihat angka yang ditunjuk jarum merah`,`Angka besar tiap ${angka(langkah)} ${sat}, garis kecil di tengahnya ${angka(langkah/2)} ${sat}`,tanyaKg?`${angka(v)} g = ${angka(v/1000)} kg (naik 3 anak tangga, : 1.000)`:`Beratnya ${y}`]}}
  /* jam */
  const h=ri(r,1,12),m=lv===1?pilih(r,[0,15,30,45]):lv===2?ri(r,0,11)*5:ri(r,0,59);
  const tukar=Math.round(m/5)%12||12,p=[jamTeks(tukar,(h%12)*5),jamTeks(h%12+1,m),jamTeks(h,(m+30)%60),jamTeks(h,(m+5)%60),jamTeks(h===1?12:h-1,m)];
  const o=opsi(r,jamTeks(h,m),acak(r,p.filter(s=>s!==jamTeks(h,m))));
  return{besaran:'waktu',jenis:'alat',teks:'Jam menunjukkan pukul berapa?',...o,gambar:svgJam(h,m),lompat:null,
    kunci:[`Jarum pendek (hitam) = jam: ${m>=30&&m?'sudah lewat ':''}angka ${h}`,`Jarum panjang (merah) = menit: tiap angka 5 menit, ${m} menit`,`Pukul ${jamTeks(h,m)}`]}}

/* ---------- pembuat soal ---------- */
/* jenis = 'campur' | 'panjang' | 'volume' | 'berat' | 'waktu' */
function soal(seed,i,level=2,jenis='campur',coba=0){
  const lv=Math.max(1,Math.min(3,level)),r=random(seed+i*7919+coba*104723);
  const besaran=jenis==='campur'?acak(random(seed*31+Math.floor(i/4)*104729),BESARAN)[i%4]:jenis;
  let s;
  if(besaran==='waktu')s=soalWaktu(r,lv);
  else{const tipe=lv===1?pilih(r,['ubah','ubah','ubah','alat']):lv===2?pilih(r,['ubah','ubah','jumlah','alat','cerita']):pilih(r,['ubah','jumlah','banding','cerita','alat']);
    s=tipe==='ubah'?soalUbah(r,lv,besaran):tipe==='jumlah'?soalJumlah(r,lv,besaran):tipe==='banding'?soalBanding(r,lv,besaran):tipe==='cerita'?soalCerita(r,lv,besaran):soalAlat(r,lv,besaran)}
  return{i,gambar:null,...s,ingat:SINGKAT[s.besaran]}}
/* deretan soal tanpa pengulangan: buat(n, coba) membuat soal ke-n; kalau sama dengan soal sebelumnya, coba lagi dengan angka lain */
const kunciSoal=q=>q.teks+'|'+q.opsi[q.benar];
function dek(buat){const daftar=[],dipakai=new Set();
  return{ambil(i){while(daftar.length<=i){const n=daftar.length;let q;for(let c=0;c<80;c++){q=buat(n,c);if(!dipakai.has(kunciSoal(q)))break}dipakai.add(kunciSoal(q));daftar.push(q)}return daftar[i]},dipakai}}
/* soal membaca alat ukur saja (dipakai Lab Alat Ukur) */
function alat(seed,level,besaran){return{gambar:null,...soalAlat(random(seed),Math.max(1,Math.min(3,level)),besaran)}}
return{TANGGA,BESARAN,SINGKAT,BONUS,TAHUN,geser,angka,ubah,faktorWaktu,jamTeks,lamaTeks,random,soal,alat,dek,kunciSoal,svgPenggaris,svgGelas,svgTimbangan,svgJam};
})();
if(typeof module!=='undefined')module.exports=UK;
