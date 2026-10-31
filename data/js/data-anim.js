/* =========================================================
   PENYAJIAN DATA · papan diagram yang bisa "dibongkar" (dipakai Lab dan kartu pembahasan game).
   Setiap resep `anim` dari data-soal.js diputar langkah demi langkah dengan keterangan:
   baca     : garis bantu dari ujung batang ke sumbu tegak
   banding  : garis menyapu dari atas/bawah, batang pertama yang tersentuh = paling banyak/sedikit
   selisih  : bagian batang tinggi di atas batang pendek dipotong dan diangkat
   jumlah   : batang-batang ditumpuk jadi satu menara
   kali     : batang pendek digandakan sampai setinggi batang panjang
   syarat   : garis batas melintang, batang yang lolos menyala
   pikto    : ikon piktogram dibedah menjadi nilainya
   hilang   : data yang terlihat ditumpuk, sisa sampai jumlah seluruhnya = data yang hilang
   ubah     : angka tabel tumbuh menjadi batang satu per satu
   urut     : beberapa resep berurutan (pernyataan PGK)
   pie      : diagram lingkaran; irisan ditarik keluar, lalu lingkaran dibuka menjadi pita 100%
   gTitik, gSelisih, gSegmen : diagram garis; garis bantu dari titik, selisih dua titik, naik-turun tiap ruas
   editor() : diagram batang (atau garis) yang bisa diseret (multi-sentuh) untuk Koki Data dan Lab.
   pizza()  : pizza berpotong yang diwarnai per topping dengan banyak jari, untuk Koki Data dan Lab.
   ========================================================= */
const DA=(()=>{
  const NS='http://www.w3.org/2000/svg',INK='#1e2a4a',W=DT.WARNA,BATAL={},angka=DT.angka;
  const el=(tag,attr={},parent)=>{const e=document.createElementNS(NS,tag);for(const k in attr)e.setAttribute(k,attr[k]);parent?.appendChild(e);return e};
  const txt=(parent,x,y,s,o={})=>{const t=el('text',{x,y,'text-anchor':o.anchor||'middle','font-size':o.size||16,'font-weight':o.w||900,fill:o.fill||INK,'font-family':o.font||'Nunito,system-ui,sans-serif'},parent);t.textContent=s;return t};
  const mudah=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const gerakMinimal=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tween(tok,ms,f){return new Promise((ok,no)=>{if(tok.batal)return no(BATAL);const lama=tok.cepat?1:ms,t0=performance.now();
    const langkah=now=>{if(tok.batal)return no(BATAL);const u=lama<=1?1:Math.min(1,(now-t0)/lama);f(mudah(u),u);u<1?requestAnimationFrame(langkah):ok()};requestAnimationFrame(langkah)})}
  const tunggu=(tok,ms)=>tween(tok,tok.cepat?1:ms,()=>{});
  const lerp=(a,b,u)=>a+(b-a)*u;
  /* tangkap jari ke elemen; bisa gagal kalau jarinya sudah terangkat, dan itu tidak apa-apa */
  const tangkap=(el,e)=>{try{el.setPointerCapture(e.pointerId)}catch(_){}};
  const garisDi=(atas,x1,y1,x2,y2,warna='#e8323c',putus=true)=>el('line',{x1,y1,x2,y2,stroke:warna,'stroke-width':4,'stroke-linecap':'round','stroke-dasharray':putus?'9 7':'none'},atas);
  const labelDi=(atas,x,y,s,warna='#e8323c')=>{const gg=el('g',{class:'da-label'},atas),t=txt(gg,x,y+6,s,{size:17}),w=Math.max(34,s.length*10+18);el('rect',{x:x-w/2,y:y-14,width:w,height:28,rx:14,fill:'#fff',stroke:warna,'stroke-width':3},gg);gg.appendChild(t);return gg};

  /* ---------- papan diagram batang (elemen SVG hidup) ---------- */
  function papan(host,d,o={}){host.innerHTML='';const g=DT.tataBatang(d,o);
    const svg=el('svg',{viewBox:`0 0 ${g.W} ${g.H}`,class:'da-svg',role:'img','aria-label':'Diagram batang '+d.judul},host);
    el('rect',{width:g.W,height:g.H,rx:14,fill:'#fff'},svg);
    if(!o.tanpaJudul)txt(svg,g.W/2,26,d.judul,{size:19,font:"'Baloo 2',Nunito,sans-serif"});
    const grid=el('g',{},svg);
    for(let v=0;v<=g.ytop+1e-9;v+=g.step){const y=g.y(v);el('line',{x1:g.L,x2:g.L+g.w,y1:y,y2:y,stroke:v?'#c9d6e8':INK,'stroke-width':v?1.5:3,'stroke-dasharray':v?'5 5':'none'},grid);txt(grid,g.L-9,y+5,angka(v),{anchor:'end',size:15,w:800})}
    el('line',{x1:g.L,x2:g.L,y1:g.T-8,y2:g.y(0),stroke:INK,'stroke-width':3},grid);txt(grid,g.L-4,g.T-14,'('+d.satuan+')',{size:13,w:800,fill:'#5b6b85'});
    if(o.kanan){el('line',{x1:g.L+g.w+8,x2:g.L+g.w+o.kanan-6,y1:g.y(0),y2:g.y(0),stroke:INK,'stroke-width':3},grid)}
    /* mode garis: batang disembunyikan, ujungnya jadi titik yang disambung garis */
    const lapisGaris=el('g',{},svg),garisEl=o.garis?el('polyline',{fill:'none',stroke:'#2f7bea','stroke-width':4.5,'stroke-linejoin':'round','stroke-linecap':'round'},lapisGaris):null;if(o.garis)svg.classList.add('da-garis');
    const bars=d.nilai.map((v,i)=>{const gg=el('g',{class:'da-bar','data-i':i},svg),x=g.x(i)-g.bw/2,kosong=i===o.tanpa||v===null,mulai=o.nol?0:(kosong?0:v);
      const r=el('rect',{x,y:g.y(mulai),width:g.bw,height:g.px(mulai),fill:W[i%6],stroke:INK,'stroke-width':3,rx:3},gg);
      if(kosong){el('rect',{x,y:g.T+g.h*.35,width:g.bw,height:g.h*.65,fill:'#f1f4f9',stroke:'#9aa6b8','stroke-width':3,'stroke-dasharray':'7 6',rx:4,class:'da-kosong'},gg);txt(gg,g.x(i),g.T+g.h*.7,'?',{size:34,fill:'#9aa6b8'}).classList.add('da-kosong')}
      const kata=String(d.label[i]).split(' '),lb=el('text',{x:g.x(i),y:g.y(0)+22,'text-anchor':'middle','font-size':d.label.length>5?13:15,'font-weight':800,fill:INK},gg);
      (kata.length>1&&d.label[i].length>8?[kata[0],kata.slice(1).join(' ')]:[d.label[i]]).forEach((b,k)=>{const t=el('tspan',{x:g.x(i),dy:k?16:0},lb);t.textContent=b});
      return{g:gg,r,v:kosong?0:mulai,i,dot:o.garis?el('circle',{cx:g.x(i),cy:g.y(mulai),r:8,fill:'#fff',stroke:INK,'stroke-width':3.5},gg):null}});
    const segarGaris=()=>{if(!garisEl)return;garisEl.setAttribute('points',bars.map(b=>`${g.x(b.i)},${g.y(b.v)}`).join(' '));bars.forEach(b=>b.dot.setAttribute('cy',g.y(b.v)))};segarGaris();
    const atas=el('g',{class:'da-atas'},svg);
    const P={host,svg,g,d,bars,atas,
      set(i,v){const b=bars[i];b.v=v;b.r.setAttribute('y',g.y(v));b.r.setAttribute('height',Math.max(0,g.px(v)));segarGaris()},
      redup(keep){bars.forEach((b,i)=>b.g.style.opacity=keep.includes(i)?1:.25)},
      normal(){bars.forEach(b=>{b.g.style.opacity=1;b.r.setAttribute('stroke',INK);b.r.setAttribute('stroke-width',3)})},
      hapus(){atas.innerHTML=''},
      kotak(x,y,w,h,fill,extra={}){return el('rect',{x,y,width:w,height:Math.max(0,h),fill,stroke:INK,'stroke-width':3,rx:3,...extra},atas)},
      garis:(x1,y1,x2,y2,warna,putus)=>garisDi(atas,x1,y1,x2,y2,warna,putus),
      label:(x,y,s,warna)=>labelDi(atas,x,y,s,warna),
      kolom:k=>g.L+g.w+14+k*((o.kanan-20)/2)};
    return P}

  /* ---------- papan piktogram (ikon bisa dibedah) ---------- */
  function papanPikto(host,d){host.innerHTML='';const n=d.label.length,maksIkon=Math.max(4,...d.nilai.map(v=>Math.ceil(v/d.unit))),Lk=132,iw=40,Wd=Math.max(460,Lk+maksIkon*iw+90),rowH=50,T=44,H=T+n*rowH+56;
    const svg=el('svg',{viewBox:`0 0 ${Wd} ${H}`,class:'da-svg',role:'img','aria-label':'Piktogram '+d.judul},host);el('rect',{width:Wd,height:H,rx:14,fill:'#fff'},svg);
    txt(svg,Wd/2,26,d.judul,{size:19,font:"'Baloo 2',Nunito,sans-serif"});
    const rows=d.nilai.map((v,i)=>{const y=T+i*rowH,g=el('g',{class:'da-row'},svg);el('rect',{x:10,y,width:Wd-20,height:rowH,fill:i%2?'#f6f9fd':'#fff',stroke:'#c9d6e8','stroke-width':1.5},g);
      txt(g,20,y+31,d.label[i],{anchor:'start',size:16,w:800});el('line',{x1:Lk,x2:Lk,y1:y,y2:y+rowH,stroke:'#c9d6e8','stroke-width':1.5},g);
      const penuh=Math.floor(v/d.unit),sisa=v-penuh*d.unit,ikon=[];
      for(let k=0;k<penuh+(sisa?1:0);k++){const cx=Lk+12+k*iw+iw/2,ig=el('g',{class:'da-ikon','data-row':i,'data-k':k},g);txt(ig,cx,y+35,d.ikon,{size:30,w:400});
        if(k===penuh)el('rect',{x:cx,y:y+5,width:iw/2+2,height:rowH-10,fill:i%2?'#f6f9fd':'#fff'},ig);ikon.push({g:ig,cx,nilai:k===penuh?sisa:d.unit})}
      return{g,y,ikon,ujung:Lk+12+ikon.length*iw+8}});
    txt(svg,20,T+n*rowH+36,`Keterangan: ${d.ikon} = ${angka(d.unit)} ${d.satuan}`,{anchor:'start',size:17,w:800});
    const atas=el('g',{class:'da-atas'},svg);
    return{host,svg,d,rows,atas,rowH,hapus(){atas.innerHTML=''},redup(i){rows.forEach((r,k)=>r.g.style.opacity=k===i?1:.3)},normal(){rows.forEach(r=>r.g.style.opacity=1)}}}
  /* ---------- papan diagram lingkaran: gambar dari data-soal.js, ditambah ruang untuk pita 100% ---------- */
  function papanPie(host,d,a={}){host.innerHTML=DT.svgLingkaran(d,{tampil:a.tampil,tanpa:a.tanpa});const svg=host.querySelector('svg'),{W:Wd,H,cx,cy,r}=DT.PIE,W2=Wd+200;
    /* papan dilebarkan ke kanan: di sana lingkaran dibuka menjadi satu kolom 100% */
    svg.classList.add('da-svg');svg.setAttribute('viewBox',`0 0 ${W2} ${H}`);svg.querySelector('rect').setAttribute('width',W2);svg.querySelector('text')?.setAttribute('x',W2/2);
    const per=sel=>{const m={};svg.querySelectorAll(sel).forEach(e=>m[+e.dataset.i]=e);return m},path=per('.iris'),teks=per('.iris-t'),iris=DT.tataPie(d),atas=el('g',{class:'da-atas'},svg);
    const kena=(i,f)=>{if(path[i])f(path[i]);if(teks[i])f(teks[i])};
    return{svg,d,iris,path,teks,atas,cx,cy,r,H,kol:{x:Wd-14,w:46,t:52,h:264},
      redup(keep){iris.forEach(k=>kena(k.i,e=>e.style.opacity=keep.includes(k.i)?1:.28))},
      tarik(i,jarak){const k=iris[i],t=`translate(${(Math.cos(k.mid)*jarak).toFixed(1)} ${(Math.sin(k.mid)*jarak).toFixed(1)})`;kena(i,e=>e.setAttribute('transform',t))}}}
  /* kurung tegak di kanan kolom 100% */
  function kurung(atas,x,ya,yb,teks,warna='#e8323c'){el('path',{d:`M${x} ${ya}H${x+8}V${yb}H${x}`,fill:'none',stroke:warna,'stroke-width':3.5},atas);return labelDi(atas,x+14+Math.max(34,teks.length*10+18)/2,(ya+yb)/2,teks,warna)}

  /* ---------- papan diagram garis ---------- */
  function papanGaris(host,d){host.innerHTML=DT.svgGaris(d);const svg=host.querySelector('svg');svg.classList.add('da-svg');
    const g=DT.tataBatang(d),titik=[...svg.querySelectorAll('.titik')],atas=el('g',{class:'da-atas'},svg);
    return{svg,d,g,titik,atas,redup(keep){titik.forEach((t,i)=>t.style.opacity=keep.includes(i)?1:.3)},
      sorot(i,warna='#e8323c'){const t=titik[i];t.style.opacity=1;t.setAttribute('r',10);t.setAttribute('stroke',warna);t.setAttribute('stroke-width',5);atas.appendChild(t.cloneNode())}}}

  /* satu ikon pecah menjadi lencana bernilai */
  function lencana(P,ik,y,teks,warna='#ffc93c'){const g=el('g',{class:'da-lencana'},P.atas);el('circle',{cx:ik.cx,cy:y,r:17,fill:warna,stroke:INK,'stroke-width':3},g);txt(g,ik.cx,y+6,teks,{size:teks.length>2?13:16});return g}

  /* ---------- resep animasi ---------- */
  const OPS={
    async baca(P,tok,a,cap){const{g}=P,b=P.bars[a.i],v=P.d.nilai[a.i],y=g.y(v),x0=g.x(a.i)-g.bw/2;P.redup([a.i]);
      cap(`Lihat ujung batang ${P.d.label[a.i]}.`);b.r.setAttribute('stroke-width',6);await tunggu(tok,700);
      const l=P.garis(x0,y,x0,y);cap('Tarik garis lurus dari ujung batang ke sumbu tegak.');await tween(tok,900,u=>l.setAttribute('x2',lerp(x0,g.L,u)));
      P.label(g.L-2,y,angka(v));cap(DT.baca(P.d,'batang',a.i)[0]);await tunggu(tok,1600)},
    async banding(P,tok,a,cap){const{g}=P,v=P.d.nilai[a.i],y0=a.max?g.T-4:g.y(0),y1=g.y(v),l=P.garis(g.L,y0,g.L+g.w,y0,'#2f7bea',false);
      cap(a.max?'Turunkan garis dari atas. Batang yang pertama tersentuh adalah yang paling tinggi.':'Naikkan garis dari bawah. Ujung batang yang pertama tersentuh adalah yang paling pendek.');
      await tween(tok,1500,u=>{const y=lerp(y0,y1,u);l.setAttribute('y1',y);l.setAttribute('y2',y)});
      P.redup([a.i]);P.bars[a.i].r.setAttribute('stroke-width',6);P.label(g.x(a.i),y1-22,`${a.max?'paling banyak':'paling sedikit'}: ${angka(v)}`,'#2f7bea');
      cap(`${P.d.label[a.i]} paling ${a.max?'banyak':'sedikit'}: ${angka(v)} ${P.d.satuan}.`);await tunggu(tok,1700)},
    async selisih(P,tok,a,cap){const{g,d}=P,[bi,ki]=d.nilai[a.i]>=d.nilai[a.j]?[a.i,a.j]:[a.j,a.i],vb=d.nilai[bi],vk=d.nilai[ki],dif=vb-vk;P.redup([bi,ki]);
      cap(`Bandingkan batang ${d.label[bi]} (${angka(vb)}) dan ${d.label[ki]} (${angka(vk)}).`);await tunggu(tok,1100);
      const yk=g.y(vk),xa=Math.min(g.x(bi),g.x(ki))-g.bw/2-6,xb=Math.max(g.x(bi),g.x(ki))+g.bw/2+6,l=P.garis(xa,yk,xa,yk,'#2f7bea');
      cap(`Tarik garis setinggi batang ${d.label[ki]}.`);await tween(tok,900,u=>l.setAttribute('x2',lerp(xa,xb,u)));
      const x=g.x(bi)-g.bw/2,pot=P.kotak(x,g.y(vb),g.bw,g.px(dif),'#ff5252',{'stroke-dasharray':'none'});
      cap(`Bagian batang ${d.label[bi]} di atas garis adalah selisihnya. Potong!`);await tween(tok,500,(u,k)=>pot.style.opacity=.4+.6*Math.abs(Math.sin(k*9)));
      const tx=P.kolom(0)-x+10;await tween(tok,1200,u=>{pot.setAttribute('transform',`translate(${tx*u} ${-24*Math.sin(u*Math.PI)})`);P.set(bi,lerp(vb,vk,u))});
      P.label(P.kolom(0)+10+g.bw/2,g.y(vb)-20,'selisih '+angka(dif));cap(`Selisih = ${angka(vb)} − ${angka(vk)} = ${angka(dif)} ${d.satuan}.`);await tunggu(tok,1900)},
    async jumlah(P,tok,a,cap){const{g,d}=P,lebar=Math.min(g.bw,70),x1=P.kolom(0)+8;let alas=0;P.redup(a.idx);
      cap(a.idx.length>2?'Tumpuk semua batang menjadi satu menara.':'Tumpuk kedua batang menjadi satu menara.');await tunggu(tok,900);
      for(const i of a.idx){const v=d.nilai[i],c=P.kotak(g.x(i)-g.bw/2,g.y(v),g.bw,g.px(v),W[i%6]),dx=x1-(g.x(i)-g.bw/2),dy=g.y(alas+v)-g.y(v);
        await tween(tok,tok.cepat?1:650,u=>{c.setAttribute('transform',`translate(${dx*u} ${dy*u-30*Math.sin(u*Math.PI)})`);c.setAttribute('width',lerp(g.bw,lebar,u))});
        if(g.px(v)>22)txt(P.atas,x1+lebar/2,g.y(alas+v/2)+6,angka(v),{size:15});alas+=v;cap(`${a.idx.slice(0,a.idx.indexOf(i)+1).map(k=>angka(d.nilai[k])).join(' + ')} = ${angka(alas)}`)}
      const y=g.y(alas),l=P.garis(x1,y,x1,y);await tween(tok,800,u=>l.setAttribute('x2',lerp(x1,g.L,u)));
      P.label(g.L-2,y,angka(alas));cap(`Tinggi menara = jumlahnya = ${angka(alas)} ${d.satuan}.`);await tunggu(tok,1900)},
    async kali(P,tok,a,cap){const{g,d}=P,vb=d.nilai[a.i],vk=d.nilai[a.j],lebar=Math.min(g.bw,50),xa=P.kolom(0)+2,xb=xa+lebar+12;P.redup([a.i,a.j]);
      cap(`Berapa kali batang ${d.label[a.j]} supaya setinggi batang ${d.label[a.i]}?`);await tunggu(tok,1100);
      const besar=P.kotak(g.x(a.i)-g.bw/2,g.y(vb),g.bw,g.px(vb),W[a.i%6]);await tween(tok,700,u=>{besar.setAttribute('transform',`translate(${(xa-g.x(a.i)+g.bw/2)*u} 0)`);besar.setAttribute('width',lerp(g.bw,lebar,u))});
      for(let k=0;k<a.k;k++){const c=P.kotak(g.x(a.j)-g.bw/2,g.y(vk),g.bw,g.px(vk),W[a.j%6]),dy=g.y(vk*(k+1))-g.y(vk);
        await tween(tok,600,u=>{c.setAttribute('transform',`translate(${(xb-g.x(a.j)+g.bw/2)*u} ${dy*u-24*Math.sin(u*Math.PI)})`);c.setAttribute('width',lerp(g.bw,lebar,u))});
        txt(P.atas,xb+lebar/2,g.y(vk*k+vk/2)+6,(k+1)+'×',{size:14});cap(`${k+1} kali: ${angka(vk*(k+1))}`)}
      P.label(xb+lebar/2,g.y(vb)-20,'= '+a.k+' kali','#1f9d55');cap(`${angka(vk)} × ${a.k} = ${angka(vb)}, jadi ${a.k} kali.`);await tunggu(tok,1900)},
    async syarat(P,tok,a,cap){const{g,d}=P,y=g.y(a.b),l=P.garis(g.L,y,g.L,y,'#e8323c',false);
      cap(`Tarik garis batas di angka ${angka(a.b)}.`);await tween(tok,900,u=>l.setAttribute('x2',lerp(g.L,g.L+g.w,u)));P.label(g.L-2,y,angka(a.b));
      let c=0;for(const b of P.bars){const v=d.nilai[b.i],lolos=a.cmp==='>'?v>a.b:v<a.b;
        if(lolos){c++;b.r.setAttribute('stroke','#1f9d55');b.r.setAttribute('stroke-width',7);P.label(g.x(b.i),g.y(v)-22,'✓'+c,'#1f9d55')}else b.g.style.opacity=.25;
        cap(`${d.label[b.i]}: ${angka(v)} ${lolos?'':'tidak '}${a.cmp==='>'?'lebih dari':'kurang dari'} ${angka(a.b)}.`);await tunggu(tok,750)}
      cap(`Ada ${c} data yang ${a.cmp==='>'?'lebih dari':'kurang dari'} ${angka(a.b)}.`);await tunggu(tok,1800)},
    async pikto(P,tok,a,cap){const r=P.rows[a.i],d=P.d;P.redup(a.i);let total=0;
      cap(`Keterangan: 1 ikon = ${angka(d.unit)} ${d.satuan}. Bedah tiap ikon ${d.label[a.i]}!`);await tunggu(tok,1200);
      for(const ik of r.ikon){ik.g.style.opacity=.2;lencana(P,ik,r.y+P.rowH/2,angka(ik.nilai),ik.nilai<d.unit?'#9fdcff':'#ffc93c');total+=ik.nilai;
        cap(r.ikon.slice(0,r.ikon.indexOf(ik)+1).map(x=>angka(x.nilai)).join(' + ')+' = '+angka(total)+(ik.nilai<d.unit?' (setengah ikon = setengah nilai)':''));await tunggu(tok,650)}
      const g=el('g',{},P.atas);el('rect',{x:r.ujung,y:r.y+9,width:64,height:32,rx:16,fill:'#fff',stroke:'#e8323c','stroke-width':3},g);txt(g,r.ujung+32,r.y+31,'= '+angka(total),{size:16});
      cap(`${d.label[a.i]} = ${angka(total)} ${d.satuan}.`);await tunggu(tok,1800)},
    async hilang(P,tok,a,cap){const{g,d}=P,x1=P.kolom(0)+8,lebar=Math.min(g.bw,70);let alas=0;
      cap('Tumpuk semua data yang terlihat menjadi satu menara.');await tunggu(tok,900);
      for(const b of P.bars){if(b.i===a.i)continue;const v=d.nilai[b.i],c=P.kotak(g.x(b.i)-g.bw/2,g.y(v),g.bw,g.px(v),W[b.i%6]),dx=x1-(g.x(b.i)-g.bw/2),dy=g.y(alas+v)-g.y(v);
        await tween(tok,550,u=>{c.setAttribute('transform',`translate(${dx*u} ${dy*u})`);c.setAttribute('width',lerp(g.bw,lebar,u))});alas+=v}
      const yT=g.y(a.total),l=P.garis(g.L,yT,g.L,yT,'#1f9d55',false);cap(`Jumlah seluruhnya ${angka(a.total)}: tarik garisnya.`);
      await tween(tok,800,u=>l.setAttribute('x2',lerp(g.L,x1+lebar+8,u)));P.label(g.L-2,yT,angka(a.total),'#1f9d55');
      const v=d.nilai[a.i],gap=P.kotak(x1,yT,lebar,g.px(v),'#ffe1e3',{'stroke-dasharray':'7 5',stroke:'#e8323c'});txt(P.atas,x1+lebar/2,g.y(alas+v/2)+7,'?',{size:22,fill:'#e8323c'});
      cap(`Bagian kosong menara = data yang hilang = ${angka(a.total)} − ${angka(alas)} = ${angka(v)}.`);await tunggu(tok,1700);
      P.bars[a.i].g.querySelectorAll('.da-kosong').forEach(k=>k.remove());
      await tween(tok,1000,u=>{gap.setAttribute('transform',`translate(${(g.x(a.i)-g.bw/2-x1)*u} ${(g.y(v)-yT)*u})`);gap.setAttribute('width',lerp(lebar,g.bw,u))});
      gap.remove();P.set(a.i,v);P.bars[a.i].r.setAttribute('stroke-width',6);cap(`${d.label[a.i]} = ${angka(v)} ${d.satuan}.`);await tunggu(tok,1600)},
    async pie(P,tok,a,cap){const{d,iris}=P,L=a.langkah||[],sel=a.idx||[],K=P.kol,py=p=>p/100*K.h;
      if(a.mode==='ubah'){iris.forEach(k=>{if(P.path[k.i])P.path[k.i].style.opacity=0;if(P.teks[k.i])P.teks[k.i].style.opacity=0});cap(L[0]||'');await tunggu(tok,1500);
        for(const k of iris){cap(`${d.label[k.i]}: ${angka(d.nilai[k.i])} dari ${angka(d.total)} = ${angka(k.pct)}%`);await tween(tok,600,u=>{if(P.path[k.i])P.path[k.i].style.opacity=u;if(P.teks[k.i])P.teks[k.i].style.opacity=u});await tunggu(tok,400)}
        cap(L[L.length-1]);await tunggu(tok,1700);return}
      if(sel.length){P.redup(sel);await tween(tok,500,u=>sel.forEach(i=>P.tarik(i,16*u)))}
      cap(L[0]||'Satu lingkaran utuh = 100%.');await tunggu(tok,1700);
      /* buka lingkaran menjadi satu kolom 100%: yang dipilih di bawah, yang paling besar dulu kalau membandingkan */
      const urut=a.mode==='banding'?iris.slice().sort((p,q)=>a.max?q.pct-p.pct:p.pct-q.pct):[...sel.map(i=>iris[i]),...iris.filter(k=>!sel.includes(k.i))];
      cap('Buka lingkarannya jadi satu kolom. Kolom penuh = 100%, tinggi tiap bagian = persennya.');
      let alas=0;const seg=urut.filter(k=>k.pct>0).map(k=>{const h=py(k.pct),y=K.t+K.h-alas-h,g=el('g',{},P.atas),hilang=a.mode==='hilang'&&k.i===a.tanpa;
        const rect=el('rect',{x:K.x,y:y+h,width:K.w,height:0,fill:hilang?'#ffe1e3':W[k.i%6],stroke:hilang?'#e8323c':INK,'stroke-width':2.5,'stroke-dasharray':hilang?'6 5':'none'},g),s={k,y,h,g,rect,hilang};alas+=h;return s});
      [0,50,100].forEach(v=>{const y=K.t+K.h-py(v);el('line',{x1:K.x-7,x2:K.x,y1:y,y2:y,stroke:INK,'stroke-width':2},P.atas);txt(P.atas,K.x-11,y+5,v+'%',{size:13,w:800,anchor:'end'})});
      for(const s of seg){if(sel.length&&!sel.includes(s.k.i)&&a.mode!=='hilang')s.g.style.opacity=.4;await tween(tok,300,u=>{s.rect.setAttribute('y',s.y+s.h*(1-u));s.rect.setAttribute('height',s.h*u)});
        if(s.h>22)txt(s.g,K.x+K.w/2,s.y+s.h/2+5,s.hilang?'?':angka(s.k.pct)+'%',{size:13,fill:s.hilang?'#e8323c':INK})}
      await tunggu(tok,900);
      const xr=K.x+K.w+4,s0=seg.find(s=>s.k.i===sel[0]);
      if(a.mode==='gabung'){const h=seg.filter(s=>sel.includes(s.k.i)).reduce((t,s)=>t+s.h,0);kurung(P.atas,xr,K.t+K.h-h,K.t+K.h,angka(sel.reduce((t,i)=>t+iris[i].pct,0))+'%','#1f9d55')}
      else if(a.mode==='selisih'){const[b,k]=sel.map(i=>seg.find(s=>s.k.i===i)).sort((p,q)=>q.h-p.h);
        el('rect',{x:K.x+3,y:b.y+b.h-k.h,width:K.w-6,height:k.h,fill:'none',stroke:INK,'stroke-width':3,'stroke-dasharray':'6 4'},P.atas);
        const lebih=el('rect',{x:K.x,y:b.y,width:K.w,height:b.h-k.h,fill:'#ff5252',stroke:INK,'stroke-width':2.5},P.atas);await tween(tok,500,(u,t)=>lebih.style.opacity=.4+.6*Math.abs(Math.sin(t*9)));
        kurung(P.atas,xr,b.y,b.y+b.h-k.h,'selisih '+angka(b.k.pct-k.k.pct)+'%')}
      else if(a.mode==='hilang'){const h=seg.find(s=>s.hilang);
        kurung(P.atas,xr,K.t,K.t+K.h-(h?h.h:0),'terlihat '+angka(100-iris[a.tanpa].pct)+'%','#2f7bea');await tunggu(tok,1300);
        if(h){await tween(tok,600,(u,t)=>h.rect.style.opacity=.5+.5*Math.abs(Math.sin(t*8)));kurung(P.atas,xr,h.y,h.y+h.h,'= '+angka(iris[a.tanpa].pct)+'%')}}
      else if(s0)kurung(P.atas,xr,s0.y,s0.y+s0.h,a.mode==='banding'?`paling ${a.max?'besar':'kecil'}`:a.mode==='pecahan'?DT.pecahan(Math.round(s0.k.pct)):angka(s0.k.pct)+'%','#1f9d55');
      for(const t of L.slice(1)){cap(t);await tunggu(tok,1900)}
      if(a.mode==='hilang'&&P.path[a.tanpa]){const p=P.path[a.tanpa];p.setAttribute('fill',W[a.tanpa%6]);p.removeAttribute('stroke-dasharray');const t=P.teks[a.tanpa];if(t){t.textContent=a.tampil==='banyak'?angka(d.nilai[a.tanpa]):angka(iris[a.tanpa].pct)+'%';t.setAttribute('fill',INK)}await tunggu(tok,1400)}},
    async ubah(P,tok,a,cap){const{d}=P;cap('Setiap baris tabel menjadi satu batang. Angkanya = tinggi batangnya.');await tunggu(tok,900);
      for(const b of P.bars){const v=d.nilai[b.i];cap(`${d.label[b.i]}: ${angka(v)} → batang setinggi ${angka(v)}.`);await tween(tok,700,u=>P.set(b.i,v*u));await tunggu(tok,250)}
      cap('Diagram yang tepat punya tinggi batang yang sama persis dengan tabel.');await tunggu(tok,1600)}
  };
  /* ---------- resep diagram garis ---------- */
  const OPSG={
    async gTitik(P,tok,a,cap){const{g,d}=P,L=a.langkah||[];P.redup(a.idx);let k0=0;
      if(a.mode==='banding'){const v=d.nilai[a.idx[0]],y0=a.max?g.T-4:g.y(0),y1=g.y(v),l=garisDi(P.atas,g.L,y0,g.L+g.w,y0,'#2f7bea',false);k0=1;
        cap(L[0]||'');await tunggu(tok,900);cap(a.max?'Turunkan garis dari atas. Titik pertama yang tersentuh adalah yang paling tinggi.':'Naikkan garis dari bawah. Titik pertama yang tersentuh adalah yang paling rendah.');
        await tween(tok,1500,u=>{const y=lerp(y0,y1,u);l.setAttribute('y1',y);l.setAttribute('y2',y)})}
      for(const[k,i]of a.idx.entries()){const v=d.nilai[i],x=g.x(i),y=g.y(v);P.sorot(i);cap(L[k0+k]||`Lihat titik ${d.label[i]}.`);await tunggu(tok,600);
        const l=garisDi(P.atas,x,y,x,y);await tween(tok,800,u=>l.setAttribute('x2',lerp(x,g.L,u)));labelDi(P.atas,g.L-2,y,angka(v));await tunggu(tok,1200)}
      for(const t of L.slice(k0+a.idx.length)){cap(t);await tunggu(tok,1800)}},
    async gSelisih(P,tok,a,cap){const{g,d}=P,L=a.langkah||[],vi=d.nilai[a.i],vj=d.nilai[a.j];P.redup([a.i,a.j]);
      for(const[k,i]of[a.i,a.j].entries()){const v=d.nilai[i],x=g.x(i),y=g.y(v);P.sorot(i);cap(L[k]||'');const l=garisDi(P.atas,x,y,x,y,'#2f7bea');await tween(tok,800,u=>l.setAttribute('x2',lerp(x,g.L,u)));labelDi(P.atas,g.L-2,y,angka(v),'#2f7bea');await tunggu(tok,1000)}
      const xa=Math.min(g.L+g.w-40,Math.max(g.x(a.i),g.x(a.j))+26),ya=g.y(vi),yb=g.y(vj),l=garisDi(P.atas,xa,ya,xa,ya,'#e8323c',false);
      for(const y of[ya,yb])el('line',{x1:xa-8,x2:xa+8,y1:y,y2:y,stroke:'#e8323c','stroke-width':4},P.atas);
      await tween(tok,800,u=>l.setAttribute('y2',lerp(ya,yb,u)));labelDi(P.atas,xa,(ya+yb)/2,'selisih '+angka(Math.abs(vi-vj)));
      for(const t of L.slice(2)){cap(t);await tunggu(tok,1900)}},
    async gSegmen(P,tok,a,cap){const{g,d}=P,L=a.langkah||[];
      const tandai=(k,tebal)=>{const x1=g.x(k),y1=g.y(d.nilai[k]),x2=g.x(k+1),y2=g.y(d.nilai[k+1]),dl=d.nilai[k+1]-d.nilai[k],w=dl>0?'#1f9d55':'#e8323c';
        el('line',{x1,y1,x2,y2,stroke:w,'stroke-width':tebal,'stroke-linecap':'round'},P.atas);labelDi(P.atas,(x1+x2)/2,Math.min(y1,y2)-20,(dl>0?'+':'−')+angka(Math.abs(dl)),w)};
      if(a.satu){P.redup([a.i,a.i+1]);cap(L[0]||'');tandai(a.i,8);await tunggu(tok,2800);return}
      cap(L[0]||'Hitung naik-turun tiap ruas garis.');for(let k=0;k<d.nilai.length-1;k++){tandai(k,5);await tunggu(tok,700)}
      await tunggu(tok,600);P.redup([a.i,a.i+1]);tandai(a.i,10);P.sorot(a.i);P.sorot(a.i+1);cap(L[1]||'');await tunggu(tok,2200)}
  };
  /* skala sumbu yang cukup untuk menara jumlah */
  function sumbu(d,a){const t=a.op==='jumlah'?a.idx.reduce((s,i)=>s+d.nilai[i],0):a.op==='hilang'?a.total:0;if(t<=d.ytop)return{ytop:d.ytop,step:d.step};const step=DT.skalaRapi(t);return{ytop:Math.ceil(t/step)*step,step}}
  async function satu(host,d,a,sajian,tok,cap,awal){
    if(a.op==='pie'){const P=papanPie(host,d,a);await OPS.pie(P,tok,a,cap);return}
    if(OPSG[a.op]){const P=papanGaris(host,d);await OPSG[a.op](P,tok,a,cap);return}
    if(a.op==='pikto'){if(sajian==='piktogram'){const P=papanPikto(host,d);await OPS.pikto(P,tok,a,cap);return}a={op:'baca',i:a.i}}
    const s=sumbu(d,a),P=papan(host,d,{...s,kanan:['selisih','jumlah','kali','hilang'].includes(a.op)?150:0,tanpa:a.op==='hilang'?a.i:undefined,nol:a.op==='ubah'});
    if(awal&&sajian&&sajian!=='batang'&&a.op!=='ubah'){cap(`Data dari ${DT.NAMA_SAJIAN[sajian]} digambar menjadi diagram batang supaya mudah dibandingkan.`);await tunggu(tok,1500)}
    if(s.ytop!==d.ytop){cap('Sumbunya diperpanjang supaya menaranya muat.');await tunggu(tok,900)}
    await OPS[a.op](P,tok,a,cap)}
  /* putar resep di dalam `host`; kembalikan kendali berhenti/putar ulang */
  function putar(host,d,anim,o={}){const tok={batal:false,cepat:!!o.cepat||gerakMinimal()};
    host.classList.add('da');host.innerHTML='<div class="da-papan"></div><p class="da-cap" aria-live="polite"></p><button type="button" class="da-ulang" hidden>Putar ulang ▶</button>';
    const papanEl=host.querySelector('.da-papan'),capEl=host.querySelector('.da-cap'),ulang=host.querySelector('.da-ulang');
    const cap=t=>{capEl.textContent=t;capEl.classList.remove('pop');void capEl.offsetWidth;capEl.classList.add('pop')};
    let kendali;
    const jalan=async()=>{try{
        if(anim.op==='urut')for(let k=0;k<anim.list.length;k++){const b=anim.benar?.[k];cap(`Pernyataan ${k+1}: ${anim.teks?.[k]||''}`);await tunggu(tok,1500);await satu(papanEl,d,anim.list[k],o.sajian,tok,cap,k===0);
          if(b!==undefined){cap(`Pernyataan ${k+1} ${b?'BENAR':'SALAH'}.`);capEl.dataset.hasil=b?'benar':'salah';await tunggu(tok,1500);delete capEl.dataset.hasil}}
        else await satu(papanEl,d,anim,o.sajian,tok,cap,true);
        ulang.hidden=false;o.selesai?.()}catch(e){if(e!==BATAL)console.warn('Animasi data:',e)}};
    ulang.addEventListener('click',e=>{e.stopPropagation();kendali.stop();Object.assign(kendali,putar(host,d,anim,o))});
    jalan();kendali={stop(){tok.batal=true},get selesai(){return !ulang.hidden}};return kendali}
  const jelaskan=(host,q,o={})=>putar(host,q.data,q.anim,{...o,sajian:q.sajian});

  /* ---------- editor: seret batang naik-turun (tiap jari memegang satu batang) ---------- */
  function editor(host,d,o={}){const awal=o.awal||d.nilai.map(()=>0),P=papan(host,{...d,nilai:awal.slice()},{tanpaJudul:o.tanpaJudul,garis:o.garis});const{g,svg}=P,pegang=new Map();let kunci=false;
    svg.classList.add('da-editor');svg.style.touchAction='none';
    const gagang=P.bars.map(b=>{const gg=el('g',{class:'da-gagang'},svg),x=g.x(b.i);el('rect',{x:x-g.bw/2-6,y:-9,width:g.bw+12,height:18,rx:9,fill:'#fff',stroke:INK,'stroke-width':3},gg);
      for(const dx of[-8,0,8])el('line',{x1:x+dx,x2:x+dx,y1:-5,y2:5,stroke:INK,'stroke-width':2.5},gg);const angkaEl=txt(gg,x,-16,'',{size:16});angkaEl.style.display=o.angka===false?'none':'';return{gg,angkaEl}});
    const segar=i=>{const v=P.bars[i].v;gagang[i].gg.setAttribute('transform',`translate(0 ${g.y(v)})`);gagang[i].angkaEl.textContent=angka(v)};
    P.bars.forEach(b=>segar(b.i));
    const titik=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};
    const pilihBatang=x=>{let best=-1,jarak=g.slot/2;P.bars.forEach(b=>{const dx=Math.abs(g.x(b.i)-x);if(dx<jarak){jarak=dx;best=b.i}});return best};
    const geser=(i,y)=>{const mentah=(g.y(0)-y)/g.h*g.ytop,snap=o.snap||d.step,v=Math.max(0,Math.min(g.ytop,Math.round(mentah/snap)*snap));if(v!==P.bars[i].v){P.set(i,v);segar(i);o.ubah?.(P.bars.map(b=>b.v),i)}};
    svg.addEventListener('pointerdown',e=>{if(kunci)return;const p=titik(e),i=pilihBatang(p.x);if(i<0)return;e.preventDefault();pegang.set(e.pointerId,i);tangkap(svg,e);P.bars[i].g.classList.add('dipegang');geser(i,p.y)});
    svg.addEventListener('pointermove',e=>{const i=pegang.get(e.pointerId);if(i===undefined)return;geser(i,titik(e).y)});
    const lepas=e=>{const i=pegang.get(e.pointerId);if(i===undefined)return;pegang.delete(e.pointerId);P.bars[i].g.classList.remove('dipegang')};
    svg.addEventListener('pointerup',lepas);svg.addEventListener('pointercancel',lepas);
    /* papan ketik: Tab ke batang, panah atas/bawah */
    P.bars.forEach(b=>{b.g.setAttribute('tabindex','0');b.g.setAttribute('role','slider');b.g.setAttribute('aria-label','Batang '+d.label[b.i]);b.g.addEventListener('keydown',e=>{if(kunci)return;const k={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(!k)return;e.preventDefault();geser(b.i,g.y(b.v+k*(o.snap||d.step)))})});
    return{P,nilai:()=>P.bars.map(b=>b.v),
      set(arr){arr.forEach((v,i)=>{P.set(i,v);segar(i)})},
      tandai(benar){P.bars.forEach((b,i)=>{b.g.classList.remove('salah','benar');void b.g.getBBox?.();b.g.classList.add(benar[i]?'benar':'salah')})},
      bayangan(arr){arr.forEach((v,i)=>{P.kotak(g.x(i)-g.bw/2,g.y(v),g.bw,g.px(v),'none',{'stroke-dasharray':'8 6',stroke:'#1f9d55','stroke-width':4})})},
      kunci(v=true){kunci=v;svg.classList.toggle('terkunci',v)}}}

  /* ---------- pizza: tiap potong diwarnai topping yang dipilih; jari yang menyeret ikut mewarnai ---------- */
  function pizza(host,o){host.innerHTML='';const n=o.n,R=150,C=170,svg=el('svg',{viewBox:'0 0 340 340',class:'da-svg da-pizza',role:'img','aria-label':`Pizza ${n} potong`},host);svg.style.touchAction='none';
    el('circle',{cx:C,cy:C,r:R+12,fill:'#e2a05b',stroke:INK,'stroke-width':4},svg);
    const isi=Array(n).fill(-1),iris=[],pegang=new Map();let pakai=0,kunci=false;
    for(let k=0;k<n;k++){const a0=-Math.PI/2+k*2*Math.PI/n,a1=a0+2*Math.PI/n,m=(a0+a1)/2,p=el('path',{d:DT.busur(C,C,R,a0,a1),class:'da-iris','data-k':k,fill:'#ffe9b0',stroke:INK,'stroke-width':2.5},svg);
      const t=txt(svg,C+R*.7*Math.cos(m),C+R*.7*Math.sin(m)+(n>12?7:9),'',{size:n>12?20:26,w:400});t.style.pointerEvents='none';iris.push({p,t})}
    const gambar=k=>{const v=isi[k];iris[k].p.setAttribute('fill',v<0?'#ffe9b0':W[v%6]);iris[k].t.textContent=v<0?'':(o.ikon?.[v]||'')};
    const hitung=()=>o.label.map((_,i)=>isi.filter(v=>v===i).length);
    const cat=(k,v)=>{if(kunci||isi[k]===v)return;isi[k]=v;gambar(k);o.ubah?.(hitung(),k,v)};
    const dari=e=>{const t=document.elementFromPoint(e.clientX,e.clientY);return t&&svg.contains(t)&&t.classList.contains('da-iris')?+t.dataset.k:-1};
    /* ketuk potong yang sudah bertopping sama = hapus; seret = warnai semua potong yang dilewati */
    svg.addEventListener('pointerdown',e=>{if(kunci)return;const t=e.target.closest?.('.da-iris'),k=t?+t.dataset.k:dari(e);if(k<0)return;e.preventDefault();tangkap(svg,e);const v=isi[k]===pakai?-1:pakai;pegang.set(e.pointerId,v);cat(k,v)});
    svg.addEventListener('pointermove',e=>{if(!pegang.has(e.pointerId))return;const k=dari(e);if(k>=0)cat(k,pegang.get(e.pointerId))});
    const lepas=e=>pegang.delete(e.pointerId);svg.addEventListener('pointerup',lepas);svg.addEventListener('pointercancel',lepas);
    const api={svg,isi:()=>isi.slice(),hitung,pakai(i){pakai=i},
      set(arr){arr.forEach((v,k)=>{isi[k]=v;gambar(k)});o.ubah?.(hitung())},
      /* potong bertopping sama dijajarkan berdampingan: pizza berubah jadi diagram lingkaran */
      rapikan(nilai=hitung()){const a=[];nilai.forEach((c,i)=>{for(let j=0;j<c;j++)a.push(i)});while(a.length<n)a.push(-1);api.set(a.slice(0,n))},
      kunci(v=true){kunci=v;svg.classList.toggle('terkunci',v)}};
    return api}

  return{papan,papanPikto,papanPie,papanGaris,lencana,putar,jelaskan,editor,pizza,OPS,OPSG,tween,tunggu,el,txt};
})();
