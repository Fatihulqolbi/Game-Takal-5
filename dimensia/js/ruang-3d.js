/* =========================================================
   DIMENSIA · Lab Bangun Ruang: panggung 3D
   VOLUME  : kubus/balok diisi kubus satuan lapis demi lapis; prisma & tabung ditumpuk lapisan alasnya;
             limas & kerucut dituang 3 kali ke prisma/tabung yang sama alas dan tingginya;
             bola dituang ke tabung pas (tinggi 2r) dan hanya mengisi 2/3.
   LUAS    : sisi-sisi bangun dibuka menjadi jaring-jaring; tiap sisi diberi label luasnya.
   BEDANYA : bangun yang sama ditampilkan dua kali: isi air (volume) dan bungkus kado (luas permukaan).
   Setiap tampilan mengembalikan linimasa {durasi, tanda[]} supaya panel langkah bisa menyala bergantian.
   ========================================================= */
const R3=(()=>{
const INK='#1e2a4a',WARNA=['#ffc93c','#5aa2ff','#ff8c92','#5cbf5a','#c9b5ff','#f08c00'],AIR='#3aa0ff';
const mudah=u=>u<0?0:u>1?1:u*u*(3-2*u),antara=(t,a,b)=>mudah((t-a)/(b-a));
let renderer,scene,camera,root,isi,el,lantai,anim=null,orbit={y:-.55,x:.5,yT:-.55,xT:.5},seret=null,ukuranDunia=5,siap=false;
const bahan=new Map();
const lam=(c,o={})=>{const k=c+JSON.stringify(o);if(!bahan.has(k))bahan.set(k,new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide,...o}));return bahan.get(k)};
const garisBahan=new THREE.LineBasicMaterial({color:INK});
function tepi(geo,mesh){const g=new THREE.LineSegments(new THREE.EdgesGeometry(geo,20),garisBahan);mesh.add(g);return g}
function jala(geo,warna,o){const m=new THREE.Mesh(geo,lam(warna,o));tepi(geo,m);return m}

/* label teks sebagai sprite (selalu menghadap kamera) */
function label(teks,warna='#ffffff',besar=1){
  const c=document.createElement('canvas'),x=c.getContext('2d'),f=64;x.font=`800 ${f}px "Baloo 2","Nunito",sans-serif`;
  const w=Math.ceil(x.measureText(teks).width)+60;c.width=w;c.height=f+40;
  x.font=`800 ${f}px "Baloo 2","Nunito",sans-serif`;x.fillStyle=warna;x.strokeStyle=INK;x.lineWidth=8;
  const r=30;x.beginPath();x.moveTo(r,4);x.arcTo(w-4,4,w-4,c.height-4,r);x.arcTo(w-4,c.height-4,4,c.height-4,r);x.arcTo(4,c.height-4,4,4,r);x.arcTo(4,4,w-4,4,r);x.fill();x.stroke();
  x.fillStyle=INK;x.textAlign='center';x.textBaseline='middle';x.fillText(teks,w/2,c.height/2+4);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));
  s.userData.rasio=w/c.height;s.userData.besar=besar;s.renderOrder=20;return s;
}
function ukurLabel(s){const h=.5*s.userData.besar/root.scale.x;s.scale.set(h*s.userData.rasio,h,1)}

/* ---------- geometri bangun utuh (alas di lantai y = 0) ---------- */
function segitigaShape(u){const{a,b}=u,s=new THREE.Shape();s.moveTo(-a/2,-b/2);s.lineTo(a/2,-b/2);s.lineTo(-a/2,b/2);s.closePath();return s}
/* titik alas prisma pada lantai (x,z): A siku-siku, AB = a (depan), AC = b (kiri) */
const prismaTitik=u=>{const{a,b}=u;return{A:[-a/2,b/2],B:[a/2,b/2],C:[-a/2,-b/2]}};
function geoUtuh(id,u){let g;
  switch(id){
    case'kubus':g=new THREE.BoxGeometry(u.s,u.s,u.s);g.translate(0,u.s/2,0);break;
    case'balok':g=new THREE.BoxGeometry(u.p,u.t,u.l);g.translate(0,u.t/2,0);break;
    case'prisma':g=new THREE.ExtrudeGeometry(segitigaShape(u),{depth:u.t,bevelEnabled:false});g.rotateX(-Math.PI/2);break;
    case'limas':g=new THREE.ConeGeometry(u.s/Math.SQRT2,u.t,4,1);g.rotateY(Math.PI/4);g.translate(0,u.t/2,0);break;
    case'tabung':g=new THREE.CylinderGeometry(u.r,u.r,u.t,56);g.translate(0,u.t/2,0);break;
    case'kerucut':g=new THREE.ConeGeometry(u.r,u.t,56);g.translate(0,u.t/2,0);break;
    case'bola':g=new THREE.SphereGeometry(u.r,48,32);g.translate(0,u.r,0);break;
  }
  return g}
const tinggiBangun=(id,u)=>id==='kubus'?u.s:id==='bola'?2*u.r:u.t;
const lebarBangun=(id,u)=>id==='kubus'?u.s:id==='balok'?Math.max(u.p,u.l):id==='prisma'?Math.max(u.a,u.b):id==='limas'?u.s:2*u.r;
/* wadah pembanding untuk limas/kerucut/bola: prisma (balok) atau tabung dengan alas & tinggi sama */
function geoWadah(id,u){if(id==='limas'){const g=new THREE.BoxGeometry(u.s,u.t,u.s);g.translate(0,u.t/2,0);return g}
  const h=id==='bola'?2*u.r:u.t,g=new THREE.CylinderGeometry(u.r,u.r,h,56);g.translate(0,h/2,0);return g}

/* ---------- VOLUME ---------- */
function volume(id,u){
  const L={durasi:0,tanda:[],langkahUpdate:[]};const hud=[];
  if(id==='kubus'||id==='balok'){
    const p=id==='kubus'?u.s:u.p,l=id==='kubus'?u.s:u.l,t=id==='kubus'?u.s:u.t,hantu=jala(geoUtuh(id,u),'#ffffff',{transparent:true,opacity:.12,depthWrite:false});isi.add(hantu);
    const geo=new THREE.BoxGeometry(.9,.9,.9),kubus=[],perLapis=p*l;
    for(let y=0;y<t;y++)for(let z=0;z<l;z++)for(let x=0;x<p;x++){const m=jala(geo,WARNA[y%WARNA.length]);m.position.set(x-(p-1)/2,y+.5,z-(l-1)/2);m.visible=false;isi.add(m);kubus.push(m)}
    const a1=Math.min(3,.08*perLapis+.6),per=Math.max(.35,Math.min(.8,3/t));L.tanda=[0,a1+.2,a1+.2+per*(t-1)+.3];L.durasi=L.tanda[2]+1.2;
    L.update=k=>{let n=0;kubus.forEach((m,i)=>{const y=Math.floor(i/perLapis);let tampak,jatuh=0;
        if(y===0){const mulai=(i/perLapis)*a1;tampak=k>=mulai;m.scale.setScalar(Math.max(.001,antara(k,mulai,mulai+.25)))}
        else{const mulai=a1+.2+per*(y-1);tampak=k>=mulai;jatuh=(1-antara(k,mulai,mulai+per*.8))*2.5;m.scale.setScalar(1)}
        m.visible=tampak;m.position.y=y+.5+jatuh;if(tampak)n++});
      const lapis=Math.min(t,Math.ceil(n/perLapis));
      return n<perLapis?`Lapisan alas: ${n} kubus satuan`:`${lapis} lapisan × ${perLapis} kubus = ${lapis*perLapis} kubus satuan`};
    L.bunyi=k=>Math.floor(Math.min(kubus.length,k<a1?k/a1*perLapis:perLapis+(k-a1-.2)/per*perLapis));
  }
  else if(id==='prisma'||id==='tabung'){
    const hantu=jala(geoUtuh(id,u),'#ffffff',{transparent:true,opacity:.12,depthWrite:false});isi.add(hantu);
    const geo=id==='prisma'?new THREE.ExtrudeGeometry(segitigaShape(u),{depth:.94,bevelEnabled:false}).rotateX(-Math.PI/2):new THREE.CylinderGeometry(u.r,u.r,.94,56).translate(0,.47,0);
    const lapis=[];for(let y=0;y<u.t;y++){const m=jala(geo,WARNA[y%WARNA.length]);m.position.y=y+.03;m.visible=false;isi.add(m);lapis.push(m)}
    const per=Math.max(.3,Math.min(.8,4/u.t));L.tanda=[0,1.6,1.8+per*(u.t-1)+.3];L.durasi=L.tanda[2]+1.2;
    L.update=k=>{let n=0;lapis.forEach((m,y)=>{const mulai=y===0?.2:1.8+per*(y-1);m.visible=k>=mulai;if(y===0)m.scale.set(1,Math.max(.001,antara(k,.2,1)),1);else m.position.y=y+.03+(1-antara(k,mulai,mulai+per*.8))*2.5;if(m.visible)n++});
      return n<=1?'Lapisan alas: tebal 1 cm, isinya = luas alas':`${n} lapisan × luas alas`};
    L.bunyi=k=>k<1.8?(k>.2?1:0):1+Math.floor((k-1.8)/per);
  }
  else{/* limas, kerucut, bola: dituang ke wadah */
    const wadah=jala(geoWadah(id,u),'#ffffff',{transparent:true,opacity:.18,depthWrite:false});isi.add(wadah);
    const hW=id==='bola'?2*u.r:u.t,lebar=lebarBangun(id,u),air=new THREE.Mesh(geoWadah(id,u),lam(AIR,{transparent:true,opacity:.75}));air.scale.y=.001;isi.add(air);
    const tuang=jala(geoUtuh(id,u),id==='bola'?'#ff8c92':'#ffc93c');isi.add(tuang);
    const kali=id==='bola'?1:3,akhir=id==='bola'?2/3:1,dx=lebar*1.25+.8;
    /* tiap tuangan: muncul di samping, naik, miring di atas wadah, mengecil (air pindah), air naik */
    const T=2.4;L.tanda=[0,1,1+T*kali];L.durasi=1+T*kali+1.4;
    L.update=k=>{const j=Math.min(kali-1,Math.max(0,Math.floor((k-1)/T))),q=k<1?0:(k-1-j*T)/T,naik=antara(q,.05,.35),pindah=antara(q,.35,.6),tuangK=antara(q,.6,.95);
      const habis=k>=1+T*kali;tuang.visible=!habis;
      tuang.position.set(dx*(1-pindah),naik*hW*1.15+pindah*.2,0);tuang.rotation.z=tuangK*1.9;tuang.scale.setScalar(Math.max(.001,1-tuangK*.85));
      const level=habis?akhir:(id==='bola'?tuangK*akhir:(j+tuangK)/3);air.scale.y=Math.max(.001,level);
      return id==='bola'?(habis?'Air dari bola = 2/3 tabung':'Bola penuh air dituang ke tabung'):habis?'3 kali tuang baru penuh: volume = 1/3 wadah':`Tuangan ${j+1} dari 3`};
    L.bunyi=k=>k<1?0:Math.floor((k-1)/T*4);
    /* garis 1/3 dan 2/3 di wadah */
    const tandaGaris=(id==='bola'?[2/3]:[1/3,2/3]).map(f=>{const l=label(id==='bola'?'2/3':f<.5?'1/3':'2/3','#ffffff',.8);l.position.set(lebar/2+.6,hW*f,0);isi.add(l);return l});
  }
  return L}

/* ---------- LUAS PERMUKAAN: jaring-jaring ---------- */
/* engsel: kelompok di tepi sisi; sumbu x lokal sepanjang tepi, z lokal mengarah ke luar bangun */
function engsel(induk,x,z,arah,y=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=Math.atan2(arah[0],arah[1]);induk.add(g);const lipat=new THREE.Group();g.add(lipat);return lipat}
function persegi(w,h,warna){const g=new THREE.PlaneGeometry(w,h);g.translate(0,h/2,0);return jala(g,warna)}
function segitiga(titik,warna){const s=new THREE.Shape();s.moveTo(...titik[0]);titik.slice(1).forEach(p=>s.lineTo(...p));s.closePath();return jala(new THREE.ShapeGeometry(s),warna)}
function pasangLabel(induk,teks,warna,x,y,z=.02){const l=label(teks,warna);l.position.set(x,y,z);induk.add(l);return l}
function luas(id,u,H){
  const L={durasi:0,tanda:[],angkat:0};const labels=[],cw=b=>WARNA[b.warna],lb=H.luas.bagian,tl=b=>`${b.rumus.replace(/ /g,'')} = ${DR.angka(b.nilai)}`;
  const tampilLabel=k=>labels.forEach(l=>{const a=antara(k,l.userData.muncul,l.userData.muncul+.4);l.visible=a>0;l.material.opacity=a});
  const catat=(l,muncul)=>{l.userData.muncul=muncul;labels.push(l)};
  if(id==='kubus'||id==='balok'){
    const p=id==='kubus'?u.s:u.p,l=id==='kubus'?u.s:u.l,t=id==='kubus'?u.s:u.t,w=id==='kubus'?[0,0,0]:[0,1,2];
    const bawah=persegi(p,l,WARNA[w[0]]);bawah.rotation.x=-Math.PI/2;bawah.position.z=l/2;isi.add(bawah);catat(pasangLabel(bawah,tl(lb[0]),WARNA[w[0]],0,l/2),3.6);
    const depan=engsel(isi,0,l/2,[0,1]),belakang=engsel(isi,0,-l/2,[0,-1]),kiri=engsel(isi,-p/2,0,[-1,0]),kanan=engsel(isi,p/2,0,[1,0]);
    depan.add(persegi(p,t,WARNA[w[1]]));belakang.add(persegi(p,t,WARNA[w[1]]));kiri.add(persegi(l,t,WARNA[w[2]]));kanan.add(persegi(l,t,WARNA[w[2]]));
    [depan,belakang].forEach(g=>catat(pasangLabel(g,tl(lb[1]??lb[0]),WARNA[w[1]],0,t/2),1.4));[kiri,kanan].forEach(g=>catat(pasangLabel(g,tl(lb[2]??lb[0]),WARNA[w[2]],0,t/2),2.6));
    const tutup=new THREE.Group();tutup.position.y=t;belakang.add(tutup);const tm=persegi(p,l,WARNA[w[0]]);tutup.add(tm);catat(pasangLabel(tm,tl(lb[0]),WARNA[w[0]],0,l/2),3.6);
    L.tanda=id==='kubus'?[0,.6,3.6]:[3.6,.6,1.8,4.4];L.durasi=5.4;L.lebarJaring=Math.max(p+2*t,2*l+2*t);
    L.update=k=>{const a=antara(k,.4,1.4)*Math.PI/2,b=antara(k,1.6,2.6)*Math.PI/2,c2=antara(k,2.7,3.5)*Math.PI/2;
      depan.rotation.x=a;belakang.rotation.x=a;kiri.rotation.x=b;kanan.rotation.x=b;tutup.rotation.x=-Math.PI/2+c2;tampilLabel(k);
      return k<.4?'Bangun utuh: semua sisi menutup':k<3.6?'Sisi-sisinya dibuka satu per satu':'Jaring-jaring: jumlahkan luas semua sisi'};
  }
  else if(id==='prisma'){
    const{a,b,c,t}=u,P=prismaTitik(u),pusat=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
    const alas=segitiga([[P.A[0],-P.A[1]],[P.B[0],-P.B[1]],[P.C[0],-P.C[1]]],cw(lb[0]));alas.rotation.x=-Math.PI/2;isi.add(alas);catat(pasangLabel(alas,tl(lb[0]),cw(lb[0]),-a/6,-b/6+0),3.4);
    /* tiga sisi tegak: AB (depan), CA (kiri), BC (miring) */
    const sisiT=[[P.A,P.B,[0,1],a,lb[1]],[P.C,P.A,[-1,0],b,lb[2]],[P.B,P.C,[b/c,-a/c],c,lb[3]]].map(([p,q,n,pjg,bag])=>{const m=pusat(p,q),g=engsel(isi,m[0],m[1],n);const muka=persegi(pjg,t,cw(bag));g.add(muka);catat(pasangLabel(g,tl(bag),cw(bag),0,t/2),1.6);return g});
    const tutup=new THREE.Group();tutup.position.y=t;sisiT[0].add(tutup);const tt=segitiga([[-a/2,0],[a/2,0],[-a/2,b]],cw(lb[0]));tutup.add(tt);catat(pasangLabel(tt,tl(lb[0]),cw(lb[0]),-a/6,b/3),3.4);
    L.tanda=[3.4,1.6,4.2];L.durasi=5.2;L.lebarJaring=Math.max(a+2*t,b+2*t+b)+1;
    L.update=k=>{const r=antara(k,.4,1.6)*Math.PI/2;sisiT.forEach(g=>g.rotation.x=r);tutup.rotation.x=-Math.PI/2+antara(k,2,3)*Math.PI/2;tampilLabel(k);
      return k<.4?'Prisma utuh':k<3.4?'Sisi tegak dibuka':'Jaring-jaring prisma: 2 segitiga + 3 persegi panjang'};
  }
  else if(id==='limas'){
    const{s,t,m}=u,miring=Math.atan2(s/2,t);
    const alas=persegi(s,s,cw(lb[0]));alas.rotation.x=-Math.PI/2;alas.position.z=s/2;isi.add(alas);catat(pasangLabel(alas,tl(lb[0]),cw(lb[0]),0,s/2),.3);
    const tegak=[[0,s/2,[0,1]],[0,-s/2,[0,-1]],[-s/2,0,[-1,0]],[s/2,0,[1,0]]].map(([x,z,n])=>{const g=engsel(isi,x,z,n);const tr=segitiga([[-s/2,0],[s/2,0],[0,m]],cw(lb[1]));g.add(tr);catat(pasangLabel(g,tl(lb[1]),cw(lb[1]),0,m/3),1.8);return g});
    L.tanda=[0,1.8,1.8,3.4];L.durasi=4.4;L.lebarJaring=s+2*m;
    L.update=k=>{const r=-miring+antara(k,.5,1.7)*(Math.PI/2+miring);tegak.forEach(g=>g.rotation.x=r);tampilLabel(k);
      return k<.5?'Limas utuh':'Jaring-jaring limas: 1 persegi + 4 segitiga'};
  }
  else if(id==='tabung'||id==='kerucut'){
    /* selimut dibuka: setiap titik bergeser dari permukaan lengkung ke bidang datar di depan (z = r) */
    const r=u.r,h=u.t,N=64,M=id==='tabung'?1:10,s=u.s,pos=new Float32Array((N+1)*(M+1)*3),idx=[];
    for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c3=a+N+1,d=c3+1;idx.push(a,c3,b,b,c3,d)}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);
    const selimut=new THREE.Mesh(geo,lam(cw(lb[1])));isi.add(selimut);
    const garis=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array((2*(N+1)+2)*3),3)),garisBahan);isi.add(garis);
    const titik=(i,j,q)=>{const th=-Math.PI+2*Math.PI*i/N;
      if(id==='tabung'){const y=j*h,c1=[r*Math.sin(th),y,r*Math.cos(th)],f=[r*th,y+2*r,r+.01];return c1.map((v,n)=>v+(f[n]-v)*q)}
      const d=s*j/M,c1=[r*Math.sin(th)*j/M,h-h*j/M,r*Math.cos(th)*j/M],ph=th*r/s,f=[d*Math.sin(ph),2*r+s-d*Math.cos(ph),r+.01];return c1.map((v,n)=>v+(f[n]-v)*q)};
    const bentuk=q=>{for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){const p=titik(i,j,q),o=(j*(N+1)+i)*3;pos[o]=p[0];pos[o+1]=p[1];pos[o+2]=p[2]}geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
      const gp=garis.geometry.attributes.position.array;let o=0;const tulis=p=>{gp[o++]=p[0];gp[o++]=p[1];gp[o++]=p[2]};
      for(let i=0;i<=N;i++)tulis(titik(i,M,q));for(let i=N;i>=0;i--)tulis(titik(i,0,q));tulis(titik(0,M,q));tulis(titik(0,M,q));garis.geometry.attributes.position.needsUpdate=true};
    /* alas (dan tutup tabung) berputar ke bidang depan */
    const cakram=(y,warna)=>{const g=new THREE.Group();g.position.set(0,y,r);isi.add(g);const d=jala(new THREE.CircleGeometry(r,56),warna);d.rotation.x=-Math.PI/2;d.position.z=-r;g.add(d);return g};
    const alas=cakram(0,cw(lb[0])),tutup=id==='tabung'?cakram(h,cw(lb[0])):null;
    const lAlas=pasangLabel(alas,tl(lb[0]),cw(lb[0]),0,.02,-r);lAlas.position.set(0,.05,-r);catat(lAlas,3.6);
    if(tutup){const lt=pasangLabel(tutup,tl(lb[0]),cw(lb[0]),0,.05,-r);catat(lt,3.6)}
    const lSel=label(tl(lb[1]),cw(lb[1]));isi.add(lSel);catat(lSel,3.6);
    L.tanda=[3.6,.6,2,3.6];L.kamera={x:.12,y:0};L.durasi=5;L.angkat=2*r;L.lebarJaring=id==='tabung'?2*Math.PI*r:2*s;L.tinggiJaring=id==='tabung'?h+4*r:2*r+s;
    L.update=k=>{const q=antara(k,.6,2.4);bentuk(q);
      alas.rotation.x=-antara(k,2.4,3.2)*Math.PI/2;if(tutup){tutup.position.y=h+2*r*q;tutup.position.z=r;tutup.rotation.x=antara(k,2.4,3.2)*Math.PI/2}
      if(alas){alas.position.y=2*r*antara(k,2.4,3.2)}
      lSel.position.set(0,id==='tabung'?2*r+h/2:2*r+s*.55,r+.3);tampilLabel(k);
      return k<.6?'Bangun utuh':k<2.4?'Selimut dibuka':'Jaring-jaring: lingkaran + '+(id==='tabung'?'persegi panjang':'juring')};
  }
  else if(id==='bola'){
    const r=u.r,bola=jala(new THREE.SphereGeometry(r,48,32).translate(0,r,0),'#ffffff',{transparent:true,opacity:.35,depthWrite:false});isi.add(bola);
    const cakram=[0,1,2,3].map(i=>{const d=jala(new THREE.CircleGeometry(r,56),cw(lb[0]));d.position.set(0,r,0);isi.add(d);const l=pasangLabel(d,DR.angka(lb[0].nilai)+" cm²",cw(lb[0]),0,0,.05);catat(l,3.4);return d});
    const tuju=[[2.4*r,3.2*r],[4.6*r,3.2*r],[2.4*r,1.1*r],[4.6*r,1.1*r]];
    L.tanda=[.4,1.6,3.4];L.durasi=4.6;L.kamera={x:.15,y:0};L.lebarJaring=7*r;L.geser=-2.2*r;
    L.update=k=>{cakram.forEach((d,i)=>{const muncul=antara(k,.3,1),pergi=antara(k,1.6+i*.35,2.4+i*.35);d.visible=muncul>0;d.scale.setScalar(Math.max(.001,muncul));
        d.position.set(tuju[i][0]*pergi,r+(tuju[i][1]-r)*pergi,0);d.rotation.y=(1-pergi)*Math.PI/2});tampilLabel(k);
      return k<1.6?'Lingkaran besar membelah bola':'Kulit bola = 4 lingkaran besar'};
  }
  return L}

/* ---------- BEDANYA: isi air vs bungkus kado ---------- */
function bedanya(id,u,H){
  const lebar=lebarBangun(id,u),dx=lebar*.75+1.2,h=tinggiBangun(id,u),L={durasi:4,tanda:[0,1.5,3]};
  const bidang=new THREE.Plane(new THREE.Vector3(0,-1,0),0);renderer.localClippingEnabled=true;
  const kiri=new THREE.Group();kiri.position.x=-dx;isi.add(kiri);kiri.add(jala(geoUtuh(id,u),'#ffffff',{transparent:true,opacity:.15,depthWrite:false}));
  const air=new THREE.Mesh(geoUtuh(id,u),new THREE.MeshLambertMaterial({color:AIR,transparent:true,opacity:.8,clippingPlanes:[bidang],side:THREE.DoubleSide}));kiri.add(air);
  /* kertas kado bergaris untuk kulit luar */
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#ff8c92';x.fillRect(0,0,64,64);x.fillStyle='#ffc93c';for(let i=-64;i<64;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i+8,0);x.lineTo(i+72,64);x.lineTo(i+64,64);x.fill()}
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(3,3);
  const kanan=new THREE.Group();kanan.position.x=dx;isi.add(kanan);const kulit=new THREE.Mesh(geoUtuh(id,u),new THREE.MeshLambertMaterial({map:tx,side:THREE.DoubleSide}));tepi(kulit.geometry,kulit);kanan.add(kulit);
  const la=label(`VOLUME = ${DR.angka(H.volume.nilai)} cm³`,'#bfe3ff',1.15),lk=label(`LUAS = ${DR.angka(H.luas.nilai)} cm²`,'#ffd9dc',1.15);
  la.position.set(0,h+1.1,0);lk.position.set(0,h+1.1,0);kiri.add(la);kanan.add(lk);
  L.lebarJaring=2*dx+lebar+1;
  L.update=(k,t)=>{bidang.constant=h*root.scale.x*antara(k,.2,1.6)+.001;const n=1+.035*Math.sin(t*3)*antara(k,1.6,2.2);kulit.scale.setScalar(n);kanan.rotation.y=t*.4;
    return k<1.6?'Kiri: diisi air (volume)':'Kanan: dibungkus kertas kado (luas permukaan)'};
  return L}

/* ---------- panggung ---------- */
function pasang(e){
  el=e;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(_){return false}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setClearColor(0,0);el.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,1,.1,500);
  scene.add(new THREE.HemisphereLight('#ffffff','#9fb6c9',.85));const sun=new THREE.DirectionalLight('#fff6e0',.55);sun.position.set(-5,10,7);scene.add(sun);
  root=new THREE.Group();scene.add(root);isi=new THREE.Group();root.add(isi);
  /* lantai kertas berpetak (1 petak = 1 cm) */
  lantai=new THREE.Group();scene.add(lantai);
  el.addEventListener('pointerdown',ev=>{seret={x:ev.clientX,y:ev.clientY,id:ev.pointerId};try{el.setPointerCapture(ev.pointerId)}catch(_){}});
  el.addEventListener('pointermove',ev=>{if(!seret||ev.pointerId!==seret.id)return;orbit.yT-=(ev.clientX-seret.x)*.01;orbit.xT=Math.max(.05,Math.min(1.35,orbit.xT+(ev.clientY-seret.y)*.006));seret.x=ev.clientX;seret.y=ev.clientY});
  const lepas=()=>{seret=null};el.addEventListener('pointerup',lepas);el.addEventListener('pointercancel',lepas);
  siap=true;return true}
function petak(n,k){scene.remove(lantai);lantai=new THREE.Group();scene.add(lantai);
  const g=new THREE.GridHelper(n,n,'#9fc4e6','#cfe3f5');g.scale.setScalar(k);lantai.add(g);
  const alas=new THREE.Mesh(new THREE.CircleGeometry(n*k*.62,48),new THREE.MeshLambertMaterial({color:'#ffffff',transparent:true,opacity:.55}));alas.rotation.x=-Math.PI/2;alas.position.y=-.01;lantai.add(alas)}
function kosongkan(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material?.map)c.material.map.dispose()});o.clear()}
/* tampilkan(id, ukuran, mode, hitungan) -> linimasa */
function tampilkan(id,u,mode,H){
  if(!siap)return null;kosongkan(isi);isi.position.set(0,0,0);renderer.localClippingEnabled=false;
  anim=mode==='volume'?volume(id,u):mode==='luas'?luas(id,u,H):bedanya(id,u,H);
  const lebar=Math.max(lebarBangun(id,u)*(mode==='volume'&&['limas','kerucut','bola'].includes(id)?2.6:1.25),anim.lebarJaring||0),tinggi=Math.max(tinggiBangun(id,u)*(mode==='volume'&&['limas','kerucut','bola'].includes(id)?1.6:1),anim.tinggiJaring||0);
  ukuranDunia=Math.max(lebar,tinggi*1.2);const k=7/ukuranDunia;root.scale.setScalar(k);
  if(anim.geser)isi.position.x=anim.geser;
  root.userData.tinggi=tinggi*k;petak(Math.ceil(ukuranDunia*1.3/2)*2,k);
  isi.traverse(o=>{if(o.isSprite)ukurLabel(o)});
  anim.t=0;anim.main=false;anim.update(0,0);orbit.xT=anim.kamera?anim.kamera.x:mode==='luas'?.75:.45;if(anim.kamera){orbit.yT=anim.kamera.y;orbit.y=((orbit.y+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI}return anim}
function mainkan(){if(anim){anim.t=0;anim.main=true}}
function lompatAkhir(){if(anim){anim.t=anim.durasi;anim.main=false;anim.teks=anim.update(anim.t,performance.now()/1000)}}
let terakhir=performance.now();
function frame(now){const dt=Math.min(.05,(now-terakhir)/1000);terakhir=now;
  if(!siap||!el.isConnected)return null;const b=el.getBoundingClientRect();if(b.width<2||b.height<2)return null;
  renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;
  orbit.y+=(orbit.yT-orbit.y)*Math.min(1,dt*6);orbit.x+=(orbit.xT-orbit.x)*Math.min(1,dt*6);
  if(!seret&&!(anim&&anim.main)&&!anim?.kamera)orbit.yT+=dt*.12;
  const h=root.userData.tinggi||4,fitV=(Math.max(h,4.5)*.62+1.6)/Math.tan(camera.fov*Math.PI/360),fitH=(4.4)/(Math.tan(camera.fov*Math.PI/360)*camera.aspect),d=Math.max(fitV,fitH)*1.05;
  camera.position.set(Math.sin(orbit.y)*Math.cos(orbit.x)*d,h*.45+Math.sin(orbit.x)*d,Math.cos(orbit.y)*Math.cos(orbit.x)*d);camera.lookAt(0,h*.45,0);camera.updateProjectionMatrix();
  let teks=null;if(anim){if(anim.main){anim.t=Math.min(anim.durasi,anim.t+dt);if(anim.t>=anim.durasi)anim.main=false}teks=anim.update(anim.t,now/1000)}
  renderer.render(scene,camera);return teks}
return{pasang,tampilkan,mainkan,lompatAkhir,frame,get anim(){return anim},get siap(){return siap}};
})();
