/* =========================================================
   DIMENSIA · Lab Bangun Ruang: data dan hitungan VOLUME & LUAS PERMUKAAN
   Tanpa DOM, jadi bisa diuji dengan Node.
   Semua ukuran dalam cm. π memakai kebiasaan SD: 22/7 kalau jari-jari kelipatan 7, selain itu 3,14.
   Ukuran yang memakai sisi miring (prisma, limas, kerucut) dipilih dari pasangan bilangan bulat
   (segitiga 3-4-5, 6-8-10, 5-12-13) supaya tidak ada akar.
   ========================================================= */
const DR=(()=>{
const angka=v=>{const n=Math.round(v*100)/100;return n.toLocaleString('id-ID',{maximumFractionDigits:2})};
const pi=r=>r%7===0?{nilai:22/7,teks:'22/7'}:{nilai:3.14,teks:'3,14'};
const cm2=v=>angka(v)+' cm²',cm3=v=>angka(v)+' cm³';

/* Kontrol ukuran: 'angka' = tombol tambah/kurang, 'pilih' = pilihan pasangan ukuran */
const BENTUK=[
  {id:'kubus',nama:'Kubus',ukuran:[{k:'s',label:'Rusuk (s)',min:1,maks:6,awal:3}]},
  {id:'balok',nama:'Balok',ukuran:[{k:'p',label:'Panjang (p)',min:1,maks:8,awal:4},{k:'l',label:'Lebar (l)',min:1,maks:6,awal:3},{k:'t',label:'Tinggi (t)',min:1,maks:6,awal:2}]},
  {id:'prisma',nama:'Prisma segitiga',ukuran:[{k:'segi',label:'Alas segitiga siku-siku',pilih:[{teks:'3, 4, miring 5',v:{a:4,b:3,c:5}},{teks:'6, 8, miring 10',v:{a:8,b:6,c:10}},{teks:'5, 12, miring 13',v:{a:12,b:5,c:13}}],awal:0},{k:'t',label:'Tinggi prisma (t)',min:1,maks:8,awal:4}]},
  {id:'limas',nama:'Limas segiempat',ukuran:[{k:'segi',label:'Ukuran limas',pilih:[{teks:'sisi alas 6, tinggi 4',v:{s:6,t:4,m:5}},{teks:'sisi alas 8, tinggi 3',v:{s:8,t:3,m:5}},{teks:'sisi alas 10, tinggi 12',v:{s:10,t:12,m:13}}],awal:0}]},
  {id:'tabung',nama:'Tabung',ukuran:[{k:'r',label:'Jari-jari (r)',min:1,maks:7,awal:7},{k:'t',label:'Tinggi (t)',min:1,maks:10,awal:10}]},
  {id:'kerucut',nama:'Kerucut',ukuran:[{k:'segi',label:'Ukuran kerucut',pilih:[{teks:'r 3, tinggi 4, garis pelukis 5',v:{r:3,t:4,s:5}},{teks:'r 6, tinggi 8, garis pelukis 10',v:{r:6,t:8,s:10}},{teks:'r 7, tinggi 24, garis pelukis 25',v:{r:7,t:24,s:25}}],awal:0}]},
  {id:'bola',nama:'Bola',ukuran:[{k:'r',label:'Jari-jari (r)',min:1,maks:7,awal:7}]}
];
const cari=id=>BENTUK.find(b=>b.id===id);
/* nilai ukuran awal / dari pilihan pengguna -> objek ukuran datar, misalnya {p:4,l:3,t:2} */
function ukuran(id,pilihan={}){const b=cari(id),u={};
  for(const c of b.ukuran){const v=pilihan[c.k]??c.awal;if(c.pilih)Object.assign(u,c.pilih[Math.max(0,Math.min(c.pilih.length-1,v))].v);else u[c.k]=Math.max(c.min,Math.min(c.maks,v))}
  return u}

/* bagian = sisi-sisi untuk luas permukaan; warna sama = sisi yang ukurannya sama */
function hitung(id,u){
  switch(id){
    case'kubus':{const s=u.s,a=s*s;return{
      volume:{nilai:a*s,langkah:[`Luas alas = s × s = ${s} × ${s} = ${cm2(a)}`,`Ada ${s} lapisan kubus satuan, tiap lapisan ${a} kubus`,`Volume = luas alas × tinggi = ${a} × ${s} = ${cm3(a*s)}`]},
      luas:{nilai:6*a,bagian:[{nama:'6 sisi persegi',rumus:`${s} × ${s}`,nilai:a,banyak:6,warna:0}],langkah:[`Kubus punya 6 sisi persegi yang sama besar`,`Luas satu sisi = s × s = ${s} × ${s} = ${cm2(a)}`,`Luas permukaan = 6 × ${a} = ${cm2(6*a)}`]}}}
    case'balok':{const{p,l,t}=u,a=p*l,b=p*t,c=l*t,L=2*(a+b+c);return{
      volume:{nilai:a*t,langkah:[`Luas alas = p × l = ${p} × ${l} = ${cm2(a)}`,`Ada ${t} lapisan kubus satuan, tiap lapisan ${a} kubus`,`Volume = luas alas × tinggi = ${a} × ${t} = ${cm3(a*t)}`]},
      luas:{nilai:L,bagian:[{nama:'Atas & bawah',rumus:`${p} × ${l}`,nilai:a,banyak:2,warna:0},{nama:'Depan & belakang',rumus:`${p} × ${t}`,nilai:b,banyak:2,warna:1},{nama:'Kiri & kanan',rumus:`${l} × ${t}`,nilai:c,banyak:2,warna:2}],
        langkah:[`Atas & bawah: 2 × (${p} × ${l}) = ${cm2(2*a)}`,`Depan & belakang: 2 × (${p} × ${t}) = ${cm2(2*b)}`,`Kiri & kanan: 2 × (${l} × ${t}) = ${cm2(2*c)}`,`Luas permukaan = ${angka(2*a)} + ${angka(2*b)} + ${angka(2*c)} = ${cm2(L)}`]}}}
    case'prisma':{const{a,b,c,t}=u,al=a*b/2,kel=a+b+c,L=2*al+kel*t;return{
      volume:{nilai:al*t,langkah:[`Luas alas (segitiga) = alas × tinggi : 2 = ${a} × ${b} : 2 = ${cm2(al)}`,`Lapisan alas ditumpuk setinggi ${t} cm`,`Volume = luas alas × tinggi = ${angka(al)} × ${t} = ${cm3(al*t)}`]},
      luas:{nilai:L,bagian:[{nama:'2 segitiga (alas & tutup)',rumus:`${a} × ${b} : 2`,nilai:al,banyak:2,warna:0},{nama:'Sisi tegak 1',rumus:`${a} × ${t}`,nilai:a*t,banyak:1,warna:1},{nama:'Sisi tegak 2',rumus:`${b} × ${t}`,nilai:b*t,banyak:1,warna:2},{nama:'Sisi tegak miring',rumus:`${c} × ${t}`,nilai:c*t,banyak:1,warna:3}],
        langkah:[`Alas & tutup: 2 × (${a} × ${b} : 2) = ${cm2(2*al)}`,`Sisi tegak: (${a} + ${b} + ${c}) × ${t} = keliling alas × tinggi = ${cm2(kel*t)}`,`Luas permukaan = ${angka(2*al)} + ${angka(kel*t)} = ${cm2(L)}`]}}}
    case'limas':{const{s,t,m}=u,a=s*s,seg=s*m/2,L=a+4*seg,V=a*t/3;return{
      volume:{nilai:V,langkah:[`Luas alas = ${s} × ${s} = ${cm2(a)}`,`Limas penuh air dituang ke balok yang alas dan tingginya sama: 3 kali tuang baru penuh`,`Volume = 1/3 × luas alas × tinggi = 1/3 × ${a} × ${t} = ${cm3(V)}`]},
      luas:{nilai:L,bagian:[{nama:'Alas persegi',rumus:`${s} × ${s}`,nilai:a,banyak:1,warna:0},{nama:'4 segitiga tegak',rumus:`${s} × ${m} : 2`,nilai:seg,banyak:4,warna:1}],
        langkah:[`Alas: ${s} × ${s} = ${cm2(a)}`,`Tinggi segitiga sisi tegak = ${m} cm (bukan tinggi limas ${t} cm)`,`4 segitiga: 4 × (${s} × ${m} : 2) = ${cm2(4*seg)}`,`Luas permukaan = ${angka(a)} + ${angka(4*seg)} = ${cm2(L)}`]}}}
    case'tabung':{const{r,t}=u,P=pi(r),al=P.nilai*r*r,kel=2*P.nilai*r,L=2*al+kel*t;return{pi:P.teks,
      volume:{nilai:al*t,langkah:[`Luas alas (lingkaran) = π × r × r = ${P.teks} × ${r} × ${r} = ${cm2(al)}`,`Lapisan lingkaran ditumpuk setinggi ${t} cm`,`Volume = luas alas × tinggi = ${angka(al)} × ${t} = ${cm3(al*t)}`]},
      luas:{nilai:L,bagian:[{nama:'2 lingkaran (alas & tutup)',rumus:`${P.teks} × ${r} × ${r}`,nilai:al,banyak:2,warna:0},{nama:'Selimut (persegi panjang)',rumus:`${angka(kel)} × ${t}`,nilai:kel*t,banyak:1,warna:1}],
        langkah:[`Alas & tutup: 2 × (π × r × r) = 2 × ${angka(al)} = ${cm2(2*al)}`,`Selimut dibuka jadi persegi panjang: panjangnya keliling alas 2 × π × r = ${angka(kel)} cm, lebarnya tinggi ${t} cm`,`Luas selimut = ${angka(kel)} × ${t} = ${cm2(kel*t)}`,`Luas permukaan = ${angka(2*al)} + ${angka(kel*t)} = ${cm2(L)}`]}}}
    case'kerucut':{const{r,t,s}=u,P=pi(r),al=P.nilai*r*r,sel=P.nilai*r*s,V=al*t/3;return{pi:P.teks,
      volume:{nilai:V,langkah:[`Luas alas = π × r × r = ${P.teks} × ${r} × ${r} = ${cm2(al)}`,`Kerucut penuh air dituang ke tabung yang alas dan tingginya sama: 3 kali tuang baru penuh`,`Volume = 1/3 × luas alas × tinggi = 1/3 × ${angka(al)} × ${t} = ${cm3(V)}`]},
      luas:{nilai:al+sel,bagian:[{nama:'Alas lingkaran',rumus:`${P.teks} × ${r} × ${r}`,nilai:al,banyak:1,warna:0},{nama:'Selimut (juring)',rumus:`${P.teks} × ${r} × ${s}`,nilai:sel,banyak:1,warna:1}],
        langkah:[`Alas: π × r × r = ${cm2(al)}`,`Selimut dibuka jadi juring lingkaran; jari-jari juring = garis pelukis s = ${s} cm`,`Luas selimut = π × r × s = ${P.teks} × ${r} × ${s} = ${cm2(sel)}`,`Luas permukaan = ${angka(al)} + ${angka(sel)} = ${cm2(al+sel)}`]}}}
    case'bola':{const{r}=u,P=pi(r),lb=P.nilai*r*r,V=4/3*P.nilai*r**3;return{pi:P.teks,
      volume:{nilai:V,langkah:[`Bola dimasukkan ke tabung yang pas: jari-jari ${r} cm, tinggi 2 × r = ${2*r} cm`,`Air dari bola hanya mengisi 2/3 tabung`,`Volume = 2/3 × (π × r × r × 2r) = 4/3 × π × r × r × r = 4/3 × ${P.teks} × ${r} × ${r} × ${r} = ${cm3(V)}`]},
      luas:{nilai:4*lb,bagian:[{nama:'4 lingkaran besar',rumus:`${P.teks} × ${r} × ${r}`,nilai:lb,banyak:4,warna:0}],
        langkah:[`Lingkaran besar = lingkaran yang membelah bola tepat di tengah`,`Luas lingkaran besar = π × r × r = ${P.teks} × ${r} × ${r} = ${cm2(lb)}`,`Kulit bola sama dengan 4 lingkaran besar: 4 × ${angka(lb)} = ${cm2(4*lb)}`]}}}
  }
}
/* Perbedaan volume dan luas permukaan, dipakai di tab "Bedanya apa?" */
const BEDA=[
  ['Volume','isi di dalam bangun','berapa kubus satuan / air yang muat','satuan kubik: cm³','air di dalam akuarium'],
  ['Luas permukaan','kulit di luar bangun','berapa persegi satuan untuk membungkus','satuan persegi: cm²','kaca yang membentuk akuarium']
];
return{BENTUK,BEDA,cari,ukuran,hitung,pi,angka};
})();
if(typeof module!=='undefined')module.exports=DR;
