/* DIMENSIA · Lomba Bungkus Kado: adegan 3D tiap arena.
   Memakai renderer bersama MenaraScene (satu kanvas, digambar per arena dengan scissor).
   Isi kotak: permen kubus 1 cm jatuh lapis demi lapis; kelebihan permen tumpah ke meja.
   Bangun lain (prisma, limas, tabung, kerucut, bola): jeli dituang, tingginya sesuai volume; kelebihan menggenang.
   Bungkus : lembar kertas kado terbang menutup bagian kulit bangun; kertas kurang = ada sisi bolong,
             kertas lebih = sisa kertas kusut mencuat. Kotak sempurna mendapat pita. */
const KadoScene=(()=>{
  const INK='#1e2a4a',PERMEN=['#e8323c','#2f7bea','#1f9d55','#f08c00','#ffc93c','#c06bff'];
  const bahan=new Map(),mat=(c,o={})=>{const k=c+JSON.stringify(o);if(!bahan.has(k))bahan.set(k,new THREE.MeshLambertMaterial({color:c,...o}));return bahan.get(k)};
  const garis=new THREE.LineBasicMaterial({color:INK});
  const geoKubus=new THREE.BoxGeometry(.86,.86,.86),tepiKubus=new THREE.EdgesGeometry(geoKubus);
  const mudah=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
  function kertasTekstur(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#ff6f8a';x.fillRect(0,0,64,64);x.fillStyle='#ffd54a';
    for(let i=-64;i<128;i+=20){x.beginPath();x.moveTo(i,0);x.lineTo(i+9,0);x.lineTo(i+73,64);x.lineTo(i+64,64);x.fill()}
    x.fillStyle='#ffffff';for(const[a,b]of[[12,12],[44,40],[20,50],[50,10]]){x.beginPath();x.arc(a,b,3,0,7);x.fill()}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
  const tekstur=typeof document!=='undefined'?kertasTekstur():null;
  const bahanKertas=w=>{const t=tekstur.clone();t.needsUpdate=true;t.repeat.set(Math.max(1,w/2),1);return new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide})};
  function lampu(scene){scene.add(new THREE.HemisphereLight('#fff9ee','#7d8fa5',.9));const s=new THREE.DirectionalLight('#fff0d4',.55);s.position.set(-4,9,8);scene.add(s)}
  function meja(scene){const g=new THREE.Group();
    const atas=new THREE.Mesh(new THREE.BoxGeometry(7.4,.32,4.2),mat('#f3d6a4'));atas.position.y=-.16;g.add(atas);atas.add(new THREE.LineSegments(new THREE.EdgesGeometry(atas.geometry),garis));
    /* sabuk berjalan: garis-garis di tengah meja */
    const sabuk=new THREE.Mesh(new THREE.BoxGeometry(7.2,.04,2.2),mat('#4b5878'));sabuk.position.y=.02;g.add(sabuk);
    for(const x of[-3.2,3.2]){const kaki=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1.4,12),mat('#c48a4a'));kaki.position.set(x,-1,0);g.add(kaki)}
    const rumput=new THREE.Mesh(new THREE.CylinderGeometry(5.6,5.6,.3,48),mat('#4aa84f'));rumput.position.y=-1.85;g.add(rumput);
    scene.add(g);return g}
  function kadoKecil(warna,pita=true){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(.9,.7,.9),mat(warna));b.position.y=.35;g.add(b);b.add(new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry),garis));
    if(pita){const p1=new THREE.Mesh(new THREE.BoxGeometry(.94,.72,.16),mat('#ffd54a'));p1.position.y=.35;g.add(p1);const p2=new THREE.Mesh(new THREE.BoxGeometry(.16,.72,.94),mat('#ffd54a'));p2.position.y=.35;g.add(p2)}
    return g}

  function create(el,character,color){
    const scene=new THREE.Scene();scene.background=null;lampu(scene);
    const camera=new THREE.PerspectiveCamera(30,1,.1,200);meja(scene);
    const kotak=new THREE.Group();scene.add(kotak);
    const tumpukan=new THREE.Group();tumpukan.position.set(-4.6,0,.6);scene.add(tumpukan);
    /* robot komandan di panggung warna tim */
    const bot=RB.buat(ROBOT[character].id);scene.add(bot.g);bot.g.position.set(5,-1.55,1.2);
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,.22,40),mat(color));alas.position.y=-.11;bot.g.add(alas);
    const seru=new THREE.Group();const s1=new THREE.Mesh(new THREE.BoxGeometry(.26,.8,.26),mat('#e8323c'));s1.position.y=.62;seru.add(s1);seru.add(new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),mat('#e8323c')));seru.position.y=3.2;seru.visible=false;bot.g.add(seru);
    return{el,scene,camera,kotak,tumpukan,bots:[bot],bot,seru,permen:[],kertas:[],anim:[],k:1,dim:null,panik:false,terkirim:0};
  }
  /* ---------- label ukuran (sprite) supaya anak bisa membaca r, t, s, dll. langsung di bangunnya ---------- */
  function label(teks){
    const c=document.createElement('canvas'),x=c.getContext('2d'),f=60,font=`800 ${f}px "Baloo 2","Nunito",sans-serif`;x.font=font;
    const w=Math.ceil(x.measureText(teks).width)+48;c.width=w;c.height=f+34;x.font=font;
    x.fillStyle='#fffdf6';x.strokeStyle=INK;x.lineWidth=7;const r=26;x.beginPath();x.moveTo(r,4);x.arcTo(w-4,4,w-4,c.height-4,r);x.arcTo(w-4,c.height-4,4,c.height-4,r);x.arcTo(4,c.height-4,4,4,r);x.arcTo(4,4,w-4,4,r);x.fill();x.stroke();
    x.fillStyle=INK;x.textAlign='center';x.textBaseline='middle';x.fillText(teks,w/2,c.height/2+3);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.renderOrder=30;s.userData.rasio=w/c.height;return s}
  const garisUkur=new THREE.LineBasicMaterial({color:'#c2185b',depthTest:false});
  function tandai(v,teks,pos,dari,ke){const s=label(teks),h=.42/v.k;s.scale.set(h*s.userData.rasio,h,1);s.position.set(...pos);v.isi.add(s);
    if(dari){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...dari),new THREE.Vector3(...ke)]),garisUkur);l.renderOrder=29;v.isi.add(l)}}

  /* ---------- geometri tiap bangun dalam cm, alas di y = 0 ---------- */
  const R2=Math.SQRT2;
  function segitiga(a,b){const s=new THREE.Shape();s.moveTo(-a/2,-b/2);s.lineTo(a/2,-b/2);s.lineTo(-a/2,b/2);s.closePath();return s}
  const tegak=g=>g.rotateX(-Math.PI/2);
  function geoBangun(kind,u,h){/* bangun utuh (h = tinggi penuh) atau isi cairan setinggi h */
    switch(kind){
      case'prisma':return tegak(new THREE.ExtrudeGeometry(segitiga(u.a,u.b),{depth:Math.max(.001,h),bevelEnabled:false}));
      case'limas':{const rr=u.s/R2;return new THREE.CylinderGeometry(rr*(1-h/u.t),rr,Math.max(.001,h),4,1).rotateY(Math.PI/4).translate(0,h/2,0)}
      case'tabung':return new THREE.CylinderGeometry(u.r,u.r,Math.max(.001,h),40,1).translate(0,h/2,0);
      case'kerucut':return new THREE.CylinderGeometry(u.r*(1-h/u.t),u.r,Math.max(.001,h),40,1).translate(0,h/2,0);
      case'bola':{const r=u.r,th=Math.acos(Math.max(-1,Math.min(1,1-h/r))),g=new THREE.SphereGeometry(r,32,16,0,Math.PI*2,Math.PI-th,th).translate(0,r,0);return g}}}
  /* tinggi cairan untuk pecahan volume f (0..1) */
  function tinggiCair(kind,u,H,f){
    if(kind==='limas'||kind==='kerucut')return H*(1-Math.cbrt(1-f));
    if(kind==='bola'){let a=0,b=2*u.r;for(let k=0;k<30;k++){const m=(a+b)/2;(m*m*(3*u.r-m)/(4*u.r**3)<f)?a=m:b=m}return(a+b)/2}
    return f*H}
  /* bagian kulit (untuk kertas kado), berurutan; a = luas bagian */
  function bagianKulit(kind,u,o){const P=22/7,e=.04,out=[],dat=(geo,a,garis=true)=>out.push({geo,a,garis});
    const persegi=(w,h,pos,rot)=>{const g=new THREE.PlaneGeometry(w,h);g.rotateX(rot[0]);g.rotateY(rot[1]);g.translate(...pos);return g};
    switch(kind){
      case'kubus':case'balok':{const{p,l,t}=o;
        dat(persegi(p,l,[0,-e,0],[Math.PI/2,0]),p*l);dat(persegi(p,t,[0,t/2,l/2+e],[0,0]),p*t);dat(persegi(p,t,[0,t/2,-l/2-e],[0,Math.PI]),p*t);
        dat(persegi(l,t,[-p/2-e,t/2,0],[0,-Math.PI/2]),l*t);dat(persegi(l,t,[p/2+e,t/2,0],[0,Math.PI/2]),l*t);dat(persegi(p,l,[0,t+e,0],[-Math.PI/2,0]),p*l);break}
      case'prisma':{const{a,b,c,t}=u,al=a*b/2;
        dat(tegak(new THREE.ShapeGeometry(segitiga(a,b))).translate(0,-e,0),al);
        /* titik alas dalam (x, z) setelah diputar: (x, -y) */
        const T=[[-a/2,b/2],[a/2,b/2],[-a/2,-b/2]],cx=-a/6,cz=b/6;
        [[0,1,a],[2,0,b],[1,2,c]].forEach(([i,j,len])=>{const[x1,z1]=T[i],[x2,z2]=T[j],mx=(x1+x2)/2,mz=(z1+z2)/2;let nx=z2-z1,nz=-(x2-x1);const n=Math.hypot(nx,nz);nx/=n;nz/=n;if(nx*(mx-cx)+nz*(mz-cz)<0){nx=-nx;nz=-nz}
          const g=new THREE.PlaneGeometry(len,t);g.rotateY(Math.atan2(-(z2-z1),x2-x1));g.translate(mx+nx*e,t/2,mz+nz*e);dat(g,len*t)});
        dat(tegak(new THREE.ShapeGeometry(segitiga(a,b))).translate(0,t+e,0),al);break}
      case'limas':{const{s,t,m}=u,h=s/2+e;dat(persegi(s,s,[0,-e,0],[Math.PI/2,0]),s*s);
        const C=[[-h,h],[h,h],[h,-h],[-h,-h]];for(let k=0;k<4;k++){const[x1,z1]=C[k],[x2,z2]=C[(k+1)%4],g=new THREE.BufferGeometry();
          g.setAttribute('position',new THREE.Float32BufferAttribute([x1,0,z1,x2,0,z2,0,t+e*2,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,s/2,0,s/4,m/2],2));g.computeVertexNormals();dat(g,s*m/2)}break}
      case'tabung':{const{r,t}=u,al=P*r*r;dat(new THREE.CircleGeometry(r+e,40).rotateX(Math.PI/2).translate(0,-e,0),al);
        dat(new THREE.CylinderGeometry(r+e,r+e,t,40,1,true).translate(0,t/2,0),2*P*r*t,false);dat(new THREE.CircleGeometry(r+e,40).rotateX(-Math.PI/2).translate(0,t+e,0),al);break}
      case'kerucut':{const{r,t,s}=u;dat(new THREE.CircleGeometry(r+e,40).rotateX(Math.PI/2).translate(0,-e,0),P*r*r);
        dat(new THREE.ConeGeometry(r+e,t+e,40,1,true).translate(0,(t+e)/2,0),P*r*s,false);break}
      case'bola':{const{r}=u;for(let k=0;k<4;k++)dat(new THREE.SphereGeometry(r+e,20,16,k*Math.PI/2,Math.PI/2).translate(0,r,0),P*r*r,false);break}}
    return out}
  function labelBangun(v,o){const u=o.u;
    switch(o.kind){
      case'kubus':tandai(v,`s = ${u.s}`,[0,-.55/v.k,u.s/2+.6/v.k]);break;
      case'balok':tandai(v,`p = ${o.p}`,[0,-.55/v.k,o.l/2+.6/v.k]);tandai(v,`l = ${o.l}`,[o.p/2+.7/v.k,-.4/v.k,0]);tandai(v,`t = ${o.t}`,[o.p/2+.75/v.k,o.t/2,o.l/2]);break;
      case'prisma':tandai(v,`a = ${u.a}`,[0,-.5/v.k,-u.b/2-.55/v.k]);tandai(v,`b = ${u.b}`,[-u.a/2-.75/v.k,-.4/v.k,0]);tandai(v,`t = ${u.t}`,[-u.a/2-.75/v.k,u.t/2,u.b/2]);break;
      case'limas':tandai(v,`s = ${u.s}`,[0,-.5/v.k,u.s/2+.6/v.k]);tandai(v,`t = ${u.t}`,[-.6/v.k,u.t*.35,0],[0,0,0],[0,u.t,0]);tandai(v,`m = ${u.m}`,[u.s/4+.55/v.k,u.t/2+.2/v.k,u.s/4],[0,u.t,0],[0,0,u.s/2]);break;
      case'tabung':tandai(v,`r = ${u.r}`,[u.r/2,u.t+.45/v.k,0],[0,u.t+.02,0],[u.r,u.t+.02,0]);tandai(v,`t = ${u.t}`,[u.r+.75/v.k,u.t/2,0]);break;
      case'kerucut':tandai(v,`r = ${u.r}`,[u.r/2,.4/v.k,u.r*.15],[0,.02,0],[u.r,.02,0]);tandai(v,`t = ${u.t}`,[.55/v.k,u.t*.6,0],[0,0,0],[0,u.t,0]);tandai(v,`s = ${u.s}`,[-u.r/2-.65/v.k,u.t*.4,0],[0,u.t,0],[-u.r,0,0]);break;
      case'bola':tandai(v,`r = ${u.r}`,[u.r/2,u.r+.4/v.k,0],[0,u.r,0],[u.r,u.r,0]);break}}

  /* wadah terbuka sesuai pesanan, diskalakan supaya muat di meja */
  function pesanan(v,o){
    v.kotak.clear();v.permen=[];v.kertas=[];v.anim=[];v.cair=null;v.kotak.position.set(0,0,0);v.kotak.scale.setScalar(1);v.kotak.visible=true;
    const k=Math.min(3.1/o.lebar,(o.tinggi>o.lebar*1.5?3.5:2.6)/o.tinggi);v.k=k;v.o=o;v.dim=o.kotak?{p:o.p,l:o.l,t:o.t}:null;
    const isi=new THREE.Group();isi.scale.setScalar(k);v.kotak.add(isi);v.isi=isi;
    const dinding=mat('#d9a066',{transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false});
    if(o.kotak){const{p,l,t}=o;
      const sisi=(w,h,x,y,z,ry,rx=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),dinding);m.position.set(x,y,z);m.rotation.set(rx,ry,0);isi.add(m)};
      sisi(p,l,0,0,0,0,-Math.PI/2);sisi(p,t,0,t/2,l/2,0);sisi(p,t,0,t/2,-l/2,0);sisi(l,t,-p/2,t/2,0,Math.PI/2);sisi(l,t,p/2,t/2,0,Math.PI/2);
      const rangka=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(p,t,l)),garis);rangka.position.y=t/2;isi.add(rangka);
      /* petak 1 cm di alas supaya ukurannya bisa dihitung */
      const pts=[];for(let i=0;i<=p;i++)pts.push(i-p/2,.01,-l/2,i-p/2,.01,l/2);for(let j=0;j<=l;j++)pts.push(-p/2,.01,j-l/2,p/2,.01,j-l/2);
      isi.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(pts,3)),new THREE.LineBasicMaterial({color:'#8a5a2b'})))}
    else{const g=geoBangun(o.kind,o.u,o.tinggi);isi.add(new THREE.Mesh(g,dinding));isi.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,25),garis))}
    labelBangun(v,o);
    v.kotak.position.x=7;v.anim.push({d:.7,t:0,f:u=>{v.kotak.position.x=7*(1-mudah(u))}});
  }
  /* langkah ISI: kotak diisi n permen kubus 1 cm (kelebihan tumpah); bangun lain dituangi jeli sebanyak n cm³ */
  function isiPermen(v,n,selesai){if(v.o.kotak)return isiKotak(v,n,selesai);
    const o=v.o,H=o.tinggi,f=Math.min(1,n/o.V),hAkhir=tinggiCair(o.kind,o.u,H,f),jeli=mat('#ff5fa2',{transparent:true,opacity:.78});
    const m=new THREE.Mesh(geoBangun(o.kind,o.u,.001),jeli);m.scale.setScalar(.97);v.isi.add(m);v.cair=m;
    /* aliran jeli dari atas */
    const aliran=new THREE.Mesh(new THREE.CylinderGeometry(.08/v.k,.08/v.k,1,10),jeli);aliran.visible=false;v.isi.add(aliran);
    const lama=1.6;v.anim.push({d:lama,t:-.15,f:u=>{const fr=f*mudah(u),h=Math.max(.001,tinggiCair(o.kind,o.u,H,fr));m.geometry.dispose();m.geometry=geoBangun(o.kind,o.u,h);
      const atas=H+2/v.k;aliran.visible=u<1;aliran.scale.y=atas-h;aliran.position.set(0,(atas+h)/2,0)},akhir:()=>{aliran.visible=false;v.isi.remove(aliran)}});
    if(n>o.V){/* tumpah: genangan jeli di meja, makin banyak makin lebar */
      const lebih=Math.min(2,(n-o.V)/o.V),gen=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.05/v.k,32),jeli);gen.position.set(o.lebar*.55,.03/v.k,o.lebar*.35);gen.visible=false;v.isi.add(gen);
      const rr=o.lebar*(.2+.3*lebih);v.anim.push({d:.7,t:-(lama+.1),f:u=>{gen.visible=true;const s=Math.max(.01,rr*mudah(u));gen.scale.set(s,1,s*.7)}});
      v.anim.push({d:.2,t:-(lama+.9),f:()=>{},akhir:selesai})}
    else v.anim.push({d:.2,t:-(lama+.3),f:()=>{},akhir:selesai});
  }
  function isiKotak(v,n,selesai){
    const{p,l,t}=v.dim,V=p*l*t,per=Math.min(.05,1.5/Math.max(1,n));
    for(let j=0;j<n;j++){const m=new THREE.Mesh(geoKubus,mat(PERMEN[(j*7+Math.floor(j/(p*l)))%PERMEN.length]));m.add(new THREE.LineSegments(tepiKubus,garis));
      let tuju;if(j<V){const x=j%p,z=Math.floor(j/p)%l,y=Math.floor(j/(p*l));tuju=new THREE.Vector3(x-(p-1)/2,y+.5,z-(l-1)/2)}
      else{const a=j*2.399,rr=Math.max(p,l)/2+1+(j-V)%3*.9;tuju=new THREE.Vector3(Math.cos(a)*rr,.45,Math.sin(a)*rr*.5+.4)}
      const dari=new THREE.Vector3(tuju.x*.3,t+4,tuju.z*.3);m.position.copy(dari);m.visible=false;v.isi.add(m);v.permen.push(m);
      const mulai=j*per;v.anim.push({d:.45,t:-mulai,f:u=>{m.visible=true;m.position.lerpVectors(dari,tuju,u*u);m.rotation.y=(1-u)*3}})}
    v.anim.push({d:.2,t:-(n*per+.45),f:()=>{},akhir:selesai});
  }
  /* langkah BUNGKUS: kertas seluas `luas` menutup bagian kulit berurutan; kurang = bolong, lebih = kertas kusut mencuat */
  function bungkus(v,luas,sempurna,selesai){
    const o=v.o,H=o.tinggi,bagian=bagianKulit(o.kind,o.u,o),L=o.L,dari=new THREE.Vector3(0,H+3.5/v.k,1.5/v.k);
    let sisa=luas+.01,urut=0;
    for(const b of bagian){const cukup=sisa>=b.a;sisa-=b.a;if(!cukup)continue;
      const m=new THREE.Mesh(b.geo,bahanKertas(b.garis?2:12));if(b.garis)m.add(new THREE.LineSegments(new THREE.EdgesGeometry(b.geo),garis));v.isi.add(m);v.kertas.push(m);
      m.visible=false;const mulai=urut++*.22,putar=urut%2?1:-1;
      v.anim.push({d:.5,t:-mulai,f:u=>{m.visible=true;const k=mudah(u);m.position.copy(dari).multiplyScalar(1-k);m.scale.setScalar(.25+.75*k);m.rotation.set(0,(1-k)*putar*1.5,0)}})}
    /* kertas berlebih: lembar kusut mencuat */
    if(luas>L+.01){const n=Math.min(4,1+Math.floor((luas-L)/L*4)),w=o.lebar;for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.45*w,.32*w),bahanKertas(1.4));v.isi.add(m);v.kertas.push(m);
      const ke=new THREE.Vector3((i%2?1:-1)*(w/2+.1*w),H*.85,(i-1.5)*.18*w),mulai=urut++*.22;m.visible=false;
      v.anim.push({d:.5,t:-mulai,f:u=>{m.visible=true;m.position.lerpVectors(dari,ke,mudah(u));m.rotation.set(.7+i,1.2*i,.5*u)}})}}
    if(sempurna){const pita=new THREE.Group(),w=o.lebar,s=Math.max(1,w*.15);
      if(o.kotak){const{p,l,t}=o;const a=new THREE.Mesh(new THREE.BoxGeometry(p+.1,t+.1,.3),mat('#ffd54a'));a.position.y=t/2;pita.add(a);const b=new THREE.Mesh(new THREE.BoxGeometry(.3,t+.1,l+.1),mat('#ffd54a'));b.position.y=t/2;pita.add(b)}
      for(const x of[-1,1]){const tali=new THREE.Mesh(new THREE.TorusGeometry(.38*s,.12*s,8,20),mat('#ffd54a'));tali.position.set(x*.36*s,H+.3*s,0);tali.rotation.set(0,0,x*.6);pita.add(tali)}
      pita.visible=false;v.isi.add(pita);v.kertas.push(pita);v.anim.push({d:.4,t:-(urut*.22+.3),f:u=>{pita.visible=true;pita.scale.setScalar(Math.max(.001,mudah(u)))}})}
    v.anim.push({d:.2,t:-(urut*.22+.8),f:()=>{},akhir:selesai});
  }
  /* kirim kotak ke tumpukan di kiri */
  function kirim(v,sempurna,lalu){
    v.anim.push({d:.6,t:0,f:u=>{v.kotak.position.x=-6*mudah(u);v.kotak.scale.setScalar(Math.max(.001,1-.6*u))},akhir:()=>{v.kotak.visible=false;
      const n=v.terkirim++,g=kadoKecil(sempurna?PERMEN[n%PERMEN.length]:'#9aa6b8',sempurna);g.position.set((n%2)*.95-.45,Math.floor(n/2)*.72,0);if(n<16)v.tumpukan.add(g);if(lalu)lalu()}});
  }
  function update(v,t,dt,motion,panik){
    for(const a of v.anim){a.t+=dt;if(a.t>=0&&!a.selesai){const u=Math.min(1,a.t/a.d);a.f(u);if(u>=1){a.selesai=true;a.akhir?.()}}}
    v.anim=v.anim.filter(a=>!a.selesai);
    const b=v.el.getBoundingClientRect();if(b.width<2||b.height<2)return;
    /* bidikan dekat: meja dan kotak memenuhi arena, robot di tepi kanan */
    const asp=b.width/b.height,f=Math.tan(15*Math.PI/180),d=Math.max(5.4/(f*asp),2.5/f),ay=motion?Math.sin(t*.35)*.1:0;
    v.camera.aspect=asp;v.camera.position.set(Math.sin(ay)*d,1.2+d*.36,Math.cos(ay)*d);v.camera.lookAt(0,.75,0);v.camera.updateProjectionMatrix();
    v.bot.upd(motion?t:t*.2);v.bot.g.rotation.y=-.35+(panik&&motion?Math.sin(t*16)*.12:0);
    const s=panik?1.35:1.05;v.bot.g.scale.setScalar(v.bot.g.scale.x+(s-v.bot.g.scale.x)*Math.min(1,dt*6));
    v.seru.visible=panik;v.seru.position.y=3.2+(motion?Math.abs(Math.sin(t*8))*.25:0);
    if(panik!==v.panik){v.panik=panik;v.bot.aksi(panik?'panik':'idle')}
    v.tumpukan.rotation.y=Math.sin(t*.6)*.1;
  }
  /* layar depan: tumpukan kado dan empat robot */
  function home(el){
    const scene=new THREE.Scene();scene.background=null;lampu(scene);const camera=new THREE.PerspectiveCamera(30,1,.1,200);meja(scene);
    const kado=new THREE.Group();scene.add(kado);[[-1.6,0,'#e8323c'],[0,0,'#2f7bea'],[1.6,0,'#1f9d55'],[-.8,.72,'#f08c00'],[.8,.72,'#c06bff'],[0,1.44,'#ffc93c']].forEach(([x,y,c])=>{const g=kadoKecil(c);g.scale.setScalar(1.5);g.position.set(x,y*1.5,0);kado.add(g)});
    const bots=ROBOT.map((r,i)=>{const b=RB.buat(r.id);b.g.position.set((i-1.5)*2.6,-1.7,2.6);b.g.scale.setScalar(.8);scene.add(b.g);return b});
    return{el,scene,camera,bots,kado,home:true};
  }
  function updateHome(v,t,motion){const b=v.el.getBoundingClientRect();if(b.width<2||b.height<2)return;const asp=b.width/b.height,f=Math.tan(15*Math.PI/180),d=Math.max(6/(f*asp),3.6/f);
    v.camera.aspect=asp;v.camera.position.set(Math.sin(t*.2)*d*.25,2+d*.25,d);v.camera.lookAt(0,.5,0);v.camera.updateProjectionMatrix();
    v.bots.forEach((r,i)=>{r.upd(motion?t:t*.2);r.g.rotation.y=Math.sin(t*.6+i)*.25});v.kado.rotation.y=motion?Math.sin(t*.5)*.3:0}
  return{create,pesanan,isiPermen,bungkus,kirim,update,home,updateHome};
})();
