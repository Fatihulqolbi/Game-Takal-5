/* DIMENSIA · Lomba Bungkus Kado: aturan murni (bisa diuji tanpa browser).
   Pilihan bangun: 'kotak' (kubus & balok saja) atau 'semua' (kubus, balok, prisma, limas, tabung, kerucut, bola).
   Langkah 1 ISI    : pilih isi yang pas = VOLUME (kotak: permen kubus 1 cm; bangun lain: jeli dalam cm³).
   Langkah 2 BUNGKUS: pilih luas kertas kado yang pas = LUAS PERMUKAAN.
   Pilihan pengecoh sengaja memakai kesalahan yang sering terjadi (volume <-> luas, lupa 1/3, lupa ": 2", lupa tutup, dll).
   π memakai kebiasaan SD: jari-jari selalu kelipatan 7, jadi π = 22/7. Sisi miring memakai tripel bilangan bulat. */
const KadoCore=(()=>{
  const defaults={players:1,minutes:5,level:2,bangun:'semua',volume:85,music:true,fx:true,motion:true,names:['Tim Orbo','Tim Hexi','Tim Nova','Tim Zipp'],characters:[0,1,2,3]};
  const clamp=(v,min,max,f)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.round(Number(v)))):f;
  function settings(raw={}){return{...defaults,players:[1,2,4].includes(+raw.players)?+raw.players:1,minutes:clamp(raw.minutes,1,60,5),level:clamp(raw.level,1,3,2),bangun:raw.bangun==='kotak'?'kotak':'semua',volume:clamp(raw.volume,0,100,85),music:raw.music!==false,fx:raw.fx!==false,motion:raw.motion!==false,
    names:defaults.names.map((n,i)=>String(raw.names?.[i]||n).trim().slice(0,24)||n),characters:[0,1,2,3].map((n,i)=>[0,1,2,3].includes(raw.characters?.[i])?raw.characters[i]:n)}}
  function random(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),pilih=(r,a)=>a[Math.floor(r()*a.length)];
  function acak(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  const bulat=x=>Math.round(x*100)/100,angka=x=>bulat(x).toLocaleString('id-ID',{maximumFractionDigits:2});
  const PI=22/7;
  const KOTAK=['kubus','balok'],SEMUA=['kubus','balok','prisma','limas','tabung','kerucut','bola'];
  const NAMA={kubus:'Kubus',balok:'Balok',prisma:'Prisma segitiga',limas:'Limas segiempat',tabung:'Tabung',kerucut:'Kerucut',bola:'Bola'};
  /* ukuran per tingkat */
  const UKURAN={
    kubus:{1:[2,4],2:[2,5],3:[3,6]},
    balok:{1:{p:[2,4],l:[1,3],t:[1,3]},2:{p:[3,6],l:[2,4],t:[1,4]},3:{p:[3,7],l:[2,5],t:[2,5]}},
    prisma:{1:{segi:[[4,3,5]],t:[2,5]},2:{segi:[[4,3,5],[8,6,10]],t:[3,8]},3:{segi:[[8,6,10],[12,5,13]],t:[5,10]}},
    limas:{1:[[6,4,5],[8,3,5],[16,6,10]],2:[[6,4,5],[8,3,5],[10,12,13],[16,6,10]],3:[[10,12,13],[16,6,10],[16,15,17],[24,5,13]]},
    tabung:{1:{r:[7],t:[2,6]},2:{r:[7,14],t:[3,10]},3:{r:[14,21],t:[5,12]}},
    kerucut:{1:[[7,24,25],[21,20,29]],2:[[7,24,25],[21,20,29],[21,28,35],[28,21,35]],3:[[21,28,35],[28,21,35],[14,48,50],[28,45,53],[35,12,37]]},
    bola:{1:[7,14],2:[7,14,21],3:[14,21,28,35]}};
  /* petunjuk rumus (muncul hanya kalau anak mengetuk tombol petunjuk) */
  const PETUNJUK={
    kubus:{v:'Volume = s × s × s',l:'Luas permukaan = 6 × s × s',tipV:'Hitung permen satu lapis (s × s), lalu kalikan banyak lapisan (s).',tipL:'Kubus punya 6 sisi persegi yang sama besar.'},
    balok:{v:'Volume = p × l × t',l:'Luas permukaan = 2 × (p×l + p×t + l×t)',tipV:'Satu lapis permen = p × l. Ada t lapis.',tipL:'Ada 3 pasang sisi kembar: atas-bawah, depan-belakang, kiri-kanan.'},
    prisma:{v:'Volume = luas alas × t = (a × b : 2) × t',l:'Luas permukaan = 2 × luas segitiga + keliling alas × t',tipV:'Alasnya segitiga, jangan lupa dibagi 2.',tipL:'Ada 2 segitiga (alas & tutup) dan 3 persegi panjang di samping.'},
    limas:{v:'Volume = 1/3 × s × s × t',l:'Luas permukaan = s × s + 4 × (s × m : 2)',tipV:'Limas = 1/3 balok yang alas dan tingginya sama.',tipL:'m = tinggi segitiga sisi tegak, bukan tinggi limas.'},
    tabung:{v:'Volume = π × r × r × t',l:'Luas permukaan = 2 × π × r × r + 2 × π × r × t',tipV:'Luas alas lingkaran (π × r × r) dikali tinggi.',tipL:'2 lingkaran (alas & tutup) + selimut. Selimut dibuka = persegi panjang 2 × π × r kali t.'},
    kerucut:{v:'Volume = 1/3 × π × r × r × t',l:'Luas permukaan = π × r × r + π × r × s',tipV:'Kerucut = 1/3 tabung yang alas dan tingginya sama.',tipL:'s = garis pelukis (sisi miring), bukan tinggi.'},
    bola:{v:'Volume = 4/3 × π × r × r × r',l:'Luas permukaan = 4 × π × r × r',tipV:'Bola mengisi 2/3 tabung yang pas membungkusnya.',tipL:'Kulit bola = 4 lingkaran besar.'}};
  /* kesabaran pelanggan (detik): makin lama makin singkat; bangun bulat/miring diberi waktu tambahan */
  const sabar=(level,i,kind='balok')=>Math.max([0,18,15,12][level],[0,45,38,32][level]-i*2)+(KOTAK.includes(kind)?0:12);
  function pilihan(r,benar,pengecoh){benar=bulat(benar);const v=[benar];for(let x of pengecoh){x=bulat(x);if(Number.isFinite(x)&&x>0&&!v.includes(x)&&v.length<4)v.push(x)}
    for(let k=1;v.length<4;k++){const x=bulat(benar+(k%2?1:-1)*Math.ceil(k/2)*Math.max(2,Math.round(benar*.15)));if(x>0&&!v.includes(x))v.push(x)}
    const o=acak(r,v);return{opsi:o,benar:o.indexOf(benar)}}
  /* bangun ke-i: dalam tiap putaran 7 pesanan, semua bangun muncul sekali dengan urutan acak */
  function jenis(seed,i,bangun){if(bangun==='kotak')return random(seed*13+i*7919)()<.3?'kubus':'balok';
    const putaran=Math.floor(i/SEMUA.length);return acak(random(seed*31+putaran*104729),SEMUA)[i%SEMUA.length]}
  function ukur(kind,r,lv){const U=UKURAN[kind][lv];
    switch(kind){
      case'kubus':{let s=ri(r,...U);if(s===6)s=7;/* kubus 6 cm: volume = luas permukaan (216), jadi dilewati */return{s}}
      case'balok':{let p=ri(r,...U.p),l=ri(r,...U.l),t=ri(r,...U.t);if(p===l&&l===t)p++;if(l>p)[p,l]=[l,p];return{p,l,t}}
      case'prisma':{const[a,b,c]=pilih(r,U.segi);return{a,b,c,t:ri(r,...U.t)}}
      case'limas':{const[s,t,m]=pilih(r,U);return{s,t,m}}
      case'tabung':return{r:pilih(r,U.r),t:ri(r,...U.t)};
      case'kerucut':{const[rr,t,s]=pilih(r,U);return{r:rr,t,s}}
      case'bola':return{r:pilih(r,U)}}}
  /* volume, luas, pengecoh, dan rumus berangka untuk satu bangun */
  function hitung(kind,u){
    switch(kind){
      case'kubus':{const{s}=u,a=s*s,V=a*s,L=6*a;return{V,L,dV:[L,a,V+a,4*a,3*s],dL:[V,4*a,5*a,a,12*s],
        rumusV:`Volume = s × s × s = ${s} × ${s} × ${s} = ${angka(V)}`,rumusL:`Luas permukaan = 6 × s × s = 6 × ${a} = ${angka(L)}`,teks:`rusuk ${s} cm`,nama:`Kubus ${s} × ${s} × ${s} cm`,lebar:s,tinggi:s}}
      case'balok':{const{p,l,t}=u,a=p*l,b=p*t,c=l*t,V=a*t,L=2*(a+b+c);return{V,L,dV:[L,a*t+a,V+a,a,V*2,p+l+t,V-a],dL:[V,a+b+c,2*(a+b),2*(a+c),L+2*a,L-2*c,6*a],
        rumusV:`Volume = p × l × t = ${p} × ${l} × ${t} = ${angka(V)}`,rumusL:`Luas permukaan = 2 × (${p}×${l} + ${p}×${t} + ${l}×${t}) = 2 × (${a} + ${b} + ${c}) = ${angka(L)}`,teks:`${p} × ${l} × ${t} cm`,nama:`Balok ${p} × ${l} × ${t} cm`,lebar:Math.max(p,l),tinggi:t}}
      case'prisma':{const{a,b,c,t}=u,al=a*b/2,kel=a+b+c,V=al*t,L=2*al+kel*t;return{V,L,dV:[L,a*b*t,V+al,kel*t,al*(t+1)],dL:[V,kel*t,al+kel*t,2*al+(a+b)*t,2*a*b+kel*t],
        rumusV:`Volume = (${a} × ${b} : 2) × ${t} = ${angka(al)} × ${t} = ${angka(V)}`,rumusL:`Luas permukaan = 2 × ${angka(al)} + (${a} + ${b} + ${c}) × ${t} = ${angka(2*al)} + ${angka(kel*t)} = ${angka(L)}`,
        teks:`alas segitiga siku-siku ${a} cm & ${b} cm (miring ${c} cm), tinggi prisma ${t} cm`,nama:`Prisma segitiga ${a}-${b}-${c}, t ${t} cm`,lebar:Math.max(a,b),tinggi:t}}
      case'limas':{const{s,t,m}=u,A=s*s,V=A*t/3,L=A+2*s*m;return{V,L,dV:[L,A*t,A*m/3,A*t/2,V+A],dL:[V,2*s*m,A+2*s*t,A+4*s*m,A+s*m],
        rumusV:`Volume = 1/3 × ${s} × ${s} × ${t} = 1/3 × ${A} × ${t} = ${angka(V)}`,rumusL:`Luas permukaan = ${s} × ${s} + 4 × (${s} × ${m} : 2) = ${A} + ${angka(2*s*m)} = ${angka(L)}`,
        teks:`sisi alas ${s} cm, tinggi limas ${t} cm, tinggi segitiga tegak ${m} cm`,nama:`Limas alas ${s} cm, t ${t} cm`,lebar:s,tinggi:t}}
      case'tabung':{const{r,t}=u,al=PI*r*r,kel=2*PI*r,V=al*t,L=2*al+kel*t;return{V,L,dV:[L,kel*t,PI*r*t,al,V*2],dL:[V,kel*t,al+kel*t,2*al+PI*r*t,2*al],
        rumusV:`Volume = 22/7 × ${r} × ${r} × ${t} = ${angka(al)} × ${t} = ${angka(V)}`,rumusL:`Luas permukaan = 2 × ${angka(al)} + ${angka(kel)} × ${t} = ${angka(2*al)} + ${angka(kel*t)} = ${angka(L)}`,
        teks:`jari-jari ${r} cm, tinggi ${t} cm`,nama:`Tabung r ${r}, t ${t} cm`,lebar:2*r,tinggi:t}}
      case'kerucut':{const{r,t,s}=u,al=PI*r*r,sel=PI*r*s,V=al*t/3,L=al+sel;return{V,L,dV:[L,al*t,al*s/3,al,al*t/2],dL:[V,sel,al+PI*r*t,2*al+sel,al+2*sel],
        rumusV:`Volume = 1/3 × 22/7 × ${r} × ${r} × ${t} = 1/3 × ${angka(al)} × ${t} = ${angka(V)}`,rumusL:`Luas permukaan = 22/7 × ${r} × ${r} + 22/7 × ${r} × ${s} = ${angka(al)} + ${angka(sel)} = ${angka(L)}`,
        teks:`jari-jari ${r} cm, tinggi ${t} cm, garis pelukis ${s} cm`,nama:`Kerucut r ${r}, t ${t} cm`,lebar:2*r,tinggi:t}}
      case'bola':{const{r}=u,lb=PI*r*r,V=4/3*lb*r,L=4*lb;return{V,L,dV:[L,4*lb*r,lb*r,2/3*lb*r,4/3*lb],dL:[V,lb,2*lb,3*lb,4*PI*r],
        rumusV:`Volume = 4/3 × 22/7 × ${r} × ${r} × ${r} = ${angka(V)}`,rumusL:`Luas permukaan = 4 × 22/7 × ${r} × ${r} = 4 × ${angka(lb)} = ${angka(L)}`,
        teks:`jari-jari ${r} cm`,nama:`Bola r ${r} cm`,lebar:2*r,tinggi:2*r}}}}
  /* coba > 0 dipakai saat pesanan yang sama sudah pernah keluar: angka diacak ulang, lalu ukuran tingkat berikutnya ikut dipakai */
  function pesanan(seed,i,level=2,bangun='kotak',coba=0){
    const lv=Math.max(1,Math.min(3,level)),kind=bangun==='kotak'&&coba>=24?'balok':jenis(seed,i,bangun),r=random(seed+i*7919+coba*104723),u=ukur(kind,r,Math.min(3,lv+Math.floor(coba/12))),h=hitung(kind,u);
    const[swapV,...dv]=h.dV,[swapL,...dl]=h.dL;
    const isi=pilihan(r,h.V,[swapV,...acak(r,dv)]),bungkus=pilihan(r,h.L,[swapL,...acak(r,dl)]);
    const kotak=KOTAK.includes(kind);
    return{i,kind,u,...(kind==='kubus'?{p:u.s,l:u.s,t:u.s}:kind==='balok'?u:{}),V:bulat(h.V),L:bulat(h.L),opsiV:isi.opsi,benarV:isi.benar,opsiL:bungkus.opsi,benarL:bungkus.benar,sabar:sabar(lv,i,kind),
      rumusV:h.rumusV,rumusL:h.rumusL,nama:h.nama,teks:h.teks,lebar:h.lebar,tinggi:h.tinggi,kotak,satuanIsi:kotak?'permen':'cm³',bulat:['tabung','kerucut','bola'].includes(kind),petunjuk:PETUNJUK[kind],namaBangun:NAMA[kind]}}
  /* pesanan ke-i yang belum pernah keluar (urutannya sama untuk semua pemain karena memakai benih yang sama) */
  function pesananUnik(p,i){let o;for(let c=0;c<48;c++){o=pesanan(p.seed,i,p.level,p.bangun,c);if(!p.dilihat.has(o.nama))break}p.dilihat.add(o.nama);return o}
  function player(i,name,character,seed,level,bangun='kotak'){const p={i,name,character,seed,level,bangun,urut:0,sempurna:0,okV:0,okL:0,gagal:0,petunjuk:0,riwayat:[],dilihat:new Set(),phase:'isi',pilihV:null,pilihL:null};p.order=pesananUnik(p,0);return p}
  /* nilai satu pesanan setelah selesai (atau habis waktu) */
  function nilai(p,habis=false){const o=p.order,v=p.pilihV!==null&&o.opsiV[p.pilihV]===o.V,l=p.pilihL!==null&&o.opsiL[p.pilihL]===o.L,sempurna=v&&l&&!habis;
    if(v)p.okV++;if(l)p.okL++;if(sempurna)p.sempurna++;if(habis)p.gagal++;
    const h={order:o,pilihV:p.pilihV===null?null:o.opsiV[p.pilihV],pilihL:p.pilihL===null?null:o.opsiL[p.pilihL],v,l,sempurna,habis};p.riwayat.push(h);return h}
  function lanjut(p){p.urut++;p.order=pesananUnik(p,p.urut);p.phase='isi';p.pilihV=null;p.pilihL=null}
  function rank(players){return players.slice().sort((a,b)=>b.sempurna-a.sempurna||(b.okV+b.okL)-(a.okV+a.okL)||a.gagal-b.gagal||a.i-b.i)}
  return{defaults,settings,random,pesanan,player,nilai,lanjut,rank,sabar,angka,PETUNJUK,NAMA,SEMUA,KOTAK};
})();
if(typeof module!=='undefined')module.exports=KadoCore;
