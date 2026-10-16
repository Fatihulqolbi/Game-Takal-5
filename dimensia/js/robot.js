/* =========================================================
   DIMENSIA · empat robot 3D original (geometri prosedural three.js)
   Orbo (bola kapsul melayang), Hexi (kepala prisma segienam),
   Nova (bintang lima), Zipp (origami segitiga terbang).
   ========================================================= */
const ROBOT=[
  {id:'orbo',nama:'Orbo',julukan:'Si Penjelajah Bulat',peran:'Pemandu utama dan robot pemindai',warna:'#55D8E8',kata:'Aku mendeteksi bentuk misterius! Ayo kita periksa!'},
  {id:'hexi',nama:'Hexi',julukan:'Insinyur Segibanyak',peran:'Ahli konstruksi geometri',warna:'#B8A2F7',kata:'Bentuknya hampir benar! Coba susun bagian ini lagi!'},
  {id:'nova',nama:'Nova',julukan:'Bintang Penemu',peran:'Pemberi semangat',warna:'#FFD66D',kata:'Waaah! Hebat! Kamu menemukan rahasianya!'},
  {id:'zipp',nama:'Zipp',julukan:'Navigator Lipatan',peran:'Ahli sudut pandang',warna:'#8EE2BE',kata:'Dari depan kelihatannya begitu. Bagaimana kalau dari atas?'}
];
const RB=(()=>{
const mc={};
const lam=(c,datar)=>mc[c+(datar?'d':'')]||(mc[c+(datar?'d':'')]=new THREE.MeshLambertMaterial({color:c,flatShading:!!datar,side:datar?THREE.DoubleSide:THREE.FrontSide}));
const pijar=c=>mc['p'+c]||(mc['p'+c]=new THREE.MeshBasicMaterial({color:c}));
const sph=new THREE.SphereGeometry(1,24,16);
function taruh(p,m,x,y,z){m.position.set(x,y,z);p.add(m);return m}
function bola(p,mat,r,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(sph,mat);m.scale.set(r*sx,r*sy,r*sz);return taruh(p,m,x,y,z)}
function tabung(p,mat,rt,rb,h,seg,x,y,z){return taruh(p,new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat),x,y,z)}
function kotak(p,mat,w,h,d,x,y,z){return taruh(p,new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat),x,y,z)}
function mata(p,x,y,z,r,sy){const m=bola(p,pijar('#F2FFFF'),r,x,y,z,1,sy,.45);m.userData.s=m.scale.clone();return m}
function segitiga(p,mat,a,b,c){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c],3));g.computeVertexNormals();const m=new THREE.Mesh(g,mat);p.add(m);return m}

const BUAT={
orbo(c){
  bola(c,lam('#55D8E8'),.72,0,0,0,1,1.08,1);
  bola(c,lam('#2FB9C9'),.34,0,.62,0,1,.5,1);
  tabung(c,lam('#2FB9C9'),.025,.025,.2,8,0,.86,0);bola(c,pijar('#FFD66D'),.08,0,.98,0);
  bola(c,lam('#252A59'),.56,0,.08,.44,1,.72,.7);
  const eyes=[mata(c,-.2,.1,.82,.1,1.5),mata(c,.2,.1,.82,.1,1.5)];
  const orbit=new THREE.Group();orbit.rotation.x=Math.PI/2-.32;c.add(orbit);
  const cincin=new THREE.Group();orbit.add(cincin);
  cincin.add(new THREE.Mesh(new THREE.TorusGeometry(.96,.04,10,56),lam('#FFD66D')));
  bola(cincin,pijar('#FFF3C4'),.09,.96,0,0);bola(cincin,pijar('#FF8C92'),.06,-.96,0,0);
  const tangan=[bola(c,lam('#2FB9C9'),.15,-1.02,-.15,.2),bola(c,lam('#2FB9C9'),.15,1.02,-.15,.2)];
  const api=[-.3,.3].map(x=>{tabung(c,lam('#2FB9C9'),.12,.17,.24,14,x,-.84,0);const f=taruh(c,new THREE.Mesh(new THREE.ConeGeometry(.1,.3,10),pijar('#FFD66D')),x,-1.08,0);f.rotation.x=Math.PI;return f});
  return{pivot:1.5,eyes,tick(t,s,k){cincin.rotation.z=t*1.6;
    tangan.forEach((h,i)=>{h.position.y=-.15+Math.sin(t*2.4+i*2)*.07+(s==='senang'||s==='sapa'?.55*Math.abs(Math.sin(k*5)):0)});
    api.forEach((f,i)=>f.scale.y=.75+.35*Math.sin(t*19+i*3))}};
},
hexi(c){
  const kepala=tabung(c,lam('#B8A2F7'),.64,.64,.62,6,0,0,0);kepala.rotation.x=Math.PI/2;
  const layar=tabung(c,lam('#252A59'),.47,.47,.06,6,0,0,.32);layar.rotation.x=Math.PI/2;
  const eyes=[mata(c,-.18,-.02,.37,.085,1.25),mata(c,.18,-.02,.37,.085,1.25)];
  const alis=[kotak(c,lam('#FFB36B'),.2,.045,.04,-.18,.2,.37),kotak(c,lam('#FFB36B'),.2,.045,.04,.18,.2,.37)];
  tabung(c,lam('#7C6AD6'),.03,.03,.22,8,0,.66,0);bola(c,pijar('#FFB36B'),.08,0,.8,0);
  tabung(c,lam('#9A82F0'),.36,.46,.5,6,0,-.82,0);kotak(c,lam('#FFB36B'),.28,.16,.06,0,-.8,.39);
  const lengan=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.42,-.68,0);c.add(g);
    const l=tabung(g,lam('#7C6AD6'),.05,.05,.42,8,s*.18,-.1,0);l.rotation.z=s*1.05;
    bola(g,lam('#FFB36B'),.13,s*.4,-.2,0);return g});
  const kaki=new THREE.Group();kaki.position.y=-1.07;c.add(kaki);
  for(const x of[-.2,.2]){for(let i=0;i<3;i++){const t=taruh(kaki,new THREE.Mesh(new THREE.TorusGeometry(.12,.038,8,18),lam('#7C6AD6')),x,-.06-i*.1,0);t.rotation.x=Math.PI/2}
    bola(kaki,lam('#FFB36B'),.17,x,-.36,.05,1,.5,1.3)}
  return{pivot:1.5,eyes,tick(t,s,k){
    const lompat=Math.abs(Math.sin(t*2.2));kaki.scale.y=.85+.25*lompat;c.position.y=(s==='idle'?.05*lompat:0);
    const angkat=s==='senang'||s==='sapa'?1.4*Math.abs(Math.sin(k*4)):s==='bingung'?.5:0;
    lengan[0].rotation.z=-angkat;lengan[1].rotation.z=s==='bingung'?0:angkat;
    const a=s==='bingung'?.35:s==='petunjuk'?-.2:0;alis[0].rotation.z=a;alis[1].rotation.z=-a}};
},
nova(c){
  const b=new THREE.Shape();
  for(let i=0;i<10;i++){const r=i%2?.44:.84,a=Math.PI/2+i*Math.PI/5,x=Math.cos(a)*r,y=Math.sin(a)*r;i?b.lineTo(x,y):b.moveTo(x,y)}
  b.closePath();
  const g=new THREE.ExtrudeGeometry(b,{depth:.16,bevelEnabled:true,bevelThickness:.13,bevelSize:.13,bevelSegments:5,curveSegments:4});g.translate(0,0,-.08);
  c.add(new THREE.Mesh(g,lam('#FFD66D')));
  const eyes=[-.19,.19].map(x=>{const e=new THREE.Group();e.position.set(x,.08,.22);c.add(e);
    bola(e,pijar('#ffffff'),.14,0,0,0,1,1.15,.5);bola(e,pijar('#252A59'),.075,0,0,.06,1,1.15,.4);bola(e,pijar('#ffffff'),.028,.03,.04,.09);
    e.userData.s=new THREE.Vector3(1,1,1);return e});
  const pipi=[bola(c,pijar('#FF8C92'),.09,-.4,-.12,.2,1,.7,.4),bola(c,pijar('#FF8C92'),.09,.4,-.12,.2,1,.7,.4)];
  const senyum=taruh(c,new THREE.Mesh(new THREE.TorusGeometry(.09,.024,8,14,Math.PI),pijar('#252A59')),0,-.12,.24);senyum.rotation.z=Math.PI;
  const sepatu=[bola(c,lam('#FF8C92'),.17,-.32,-1.0,.05,1,.75,1.35),bola(c,lam('#FF8C92'),.17,.32,-1.0,.05,1,.75,1.35)];
  const percik=[0,1,2,3].map(i=>taruh(c,new THREE.Mesh(new THREE.OctahedronGeometry(.085),pijar(i%2?'#FFF3C4':'#FF8C92')),0,0,0));
  return{pivot:1.42,eyes,salto:true,tick(t,s,k){
    percik.forEach((p,i)=>{const a=t*1.3+i*Math.PI/2;p.position.set(Math.cos(a)*1.2,Math.sin(a*1.7)*.35+.1,Math.sin(a)*.7);p.rotation.y=t*3});
    const gembira=s==='senang'||s==='sapa';pipi.forEach(p=>p.scale.setScalar(gembira?.13:.09).multiply(new THREE.Vector3(1,.7,.4)));
    sepatu.forEach((b,i)=>b.position.y=-1.0+Math.sin(t*3+i*Math.PI)*.04)}};
},
zipp(c){
  const mint=lam('#8EE2BE',true),gading=lam('#FFF6E5',true),pink=lam('#FFB7CF',true);
  const badan=taruh(c,new THREE.Mesh(new THREE.ConeGeometry(.62,1.0,3),mint),0,0,0);badan.rotation.y=Math.PI/3;
  const dasar=taruh(c,new THREE.Mesh(new THREE.ConeGeometry(.62,.34,3),gading),0,-.67,0);dasar.rotation.set(Math.PI,Math.PI/3,0);
  const panel=kotak(c,lam('#252A59'),.36,.2,.04,0,-.2,.25);panel.rotation.x=-.33;
  const eyes=[mata(c,-.08,-.19,.29,.05,1.3),mata(c,.08,-.19,.29,.05,1.3)];
  const sayap=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.2,-.05,-.1);c.add(g);
    segitiga(g,gading,[0,0,.3],[0,0,-.4],[s*1.05,.2,-.15]);
    segitiga(g,pink,[s*1.05,.2,-.15],[0,0,-.4],[s*.75,.02,-.72]);return g});
  segitiga(c,pink,[0,.1,-.3],[-.22,-.4,-.3],[0,-.2,-.85]);segitiga(c,pink,[0,.1,-.3],[.22,-.4,-.3],[0,-.2,-.85]);
  const jejak=[0,1,2,3].map(i=>kotak(c,pijar('#ffffff'),.05,.05,.16,0,-.28-i*.05,-1.05-i*.3));
  return{pivot:1.5,eyes,tick(t,s,k){
    const buka=s==='petunjuk'||s==='sapa'?.7:s==='senang'?.5*Math.sin(k*14):.22*Math.sin(t*5);
    sayap[0].rotation.z=-buka;sayap[1].rotation.z=buka;
    jejak.forEach((j,i)=>j.visible=Math.floor(t*6+i)%2===0)}};
}};

function buat(id){
  const g=new THREE.Group(),poros=new THREE.Group(),isi=new THREE.Group();g.add(poros);poros.add(isi);
  const P=BUAT[id](isi);poros.position.y=P.pivot;
  const mouthZ={orbo:.86,hexi:.38,nova:.29,zipp:.32}[id];
  const panicMouth=taruh(isi,new THREE.Mesh(new THREE.TorusGeometry(.072,.024,8,16),pijar('#FF8C92')),0,id==='zipp'?-.34:-.23,mouthZ);
  panicMouth.scale.y=1.35;panicMouth.visible=false;
  const sweat=bola(isi,pijar('#75DDFF'),.085,.65,.35,mouthZ,1,1.8,.6);sweat.visible=false;
  const fase=ROBOT.findIndex(r=>r.id===id)*1.7;
  const o={id,g,st:'idle',t:0,t0:0,
    aksi(n){o.st=n;o.t0=o.t},
    upd(t){
      o.t=t;const k=t-o.t0;let es=1,y=Math.sin(t*2+fase)*.07;
      poros.rotation.set(0,0,0);
      panicMouth.visible=sweat.visible=o.st==='panik';
      if(o.st==='senang'){if(k>1.2)o.st='idle';else{const u=k/1.2;y+=Math.sin(u*Math.PI)*.55;if(P.salto)poros.rotation.x=-u*Math.PI*2;else poros.rotation.y=u*Math.PI*2;es=1.15}}
      else if(o.st==='bingung'){if(k>1.7)o.st='idle';else{poros.rotation.z=Math.sin(k*5)*.2;es=.72}}
      else if(o.st==='petunjuk'){if(k>1.7)o.st='idle';else{poros.rotation.x=.2*Math.sin(Math.min(k*3,Math.PI/2));es=1+.35*Math.abs(Math.sin(k*6))}}
      else if(o.st==='sapa'){if(k>1.2)o.st='idle';else{poros.rotation.z=Math.sin(k*9)*.13;y+=Math.abs(Math.sin(k*6))*.16;es=1.2}}
      else if(o.st==='panik'){poros.rotation.z=Math.sin(k*18)*.12;y+=Math.abs(Math.sin(k*12))*.13;es=1.45;sweat.position.y=.45-(k*.75%1)*.6}
      poros.position.y=P.pivot+y;
      const kedip=(t+fase)%3.6<.12?.12:1;
      for(const e of P.eyes){e.scale.copy(e.userData.s).multiplyScalar(es);e.scale.y*=kedip}
      P.tick(t,o.st==='panik'?'sapa':o.st,k);
    }};
  return o;
}
return{buat};
})();

/* Layar pembuka: empat robot di platform hologram dengan portal bercahaya */
const HOME=typeof GL==='undefined'?null:(()=>{
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,.1,100),sinar=new THREE.Raycaster();
  GL.lampu(scene);
  const robots=ROBOT.map((d,i)=>{
    const r=RB.buat(d.id);r.g.position.x=(i-1.5)*2.5;scene.add(r.g);
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(1,1.08,.14,40),new THREE.MeshLambertMaterial({color:d.warna}));alas.position.set(r.g.position.x,-.07,0);scene.add(alas);
    const cincin=new THREE.Mesh(new THREE.TorusGeometry(1.14,.035,8,48),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.5}));cincin.rotation.x=Math.PI/2;cincin.position.copy(alas.position);scene.add(cincin);
    r.alas=alas;r.cincin=cincin;r.putar=0;return r;
  });
  const portal=new THREE.Group();portal.position.set(0,1.9,-3.2);scene.add(portal);
  [['#55D8E8',2.5,.07],['#B8A2F7',2.15,.05],['#FFD66D',1.8,.035]].forEach(([c,r,t])=>portal.add(new THREE.Mesh(new THREE.TorusGeometry(r,t,10,72),new THREE.MeshBasicMaterial({color:c}))));
  let pilihan=0,el=null;
  function render(t){
    if(!el)return;const b=el.getBoundingClientRect();if(b.width<4||b.height<4)return;
    cam.aspect=b.width/b.height;const f=Math.tan(cam.fov*Math.PI/360);
    const d=Math.max(5.6/(f*cam.aspect),2.3/f);cam.position.set(0,1.75,d);cam.lookAt(0,1.25,0);cam.updateProjectionMatrix();
    robots.forEach((r,i)=>{r.upd(t);r.g.rotation.y=Math.sin(t*.6+i)*.22+r.putar;const a=i===pilihan;
      r.g.scale.setScalar(r.g.scale.x+((a?1.14:1)-r.g.scale.x)*.15);r.cincin.material.opacity=a?.95:.3;r.cincin.scale.setScalar(a?1+.04*Math.sin(t*4):1)});
    portal.children.forEach((p,i)=>{p.rotation.z=t*(.25+i*.18)*(i%2?-1:1);p.rotation.y=Math.sin(t*.5+i)*.35});
    GL.gambar(scene,cam,el);
  }
  function pasang(e,onPilih){
    el=e;let p=null;
    e.addEventListener('pointerdown',ev=>{p={x:ev.clientX,x0:ev.clientX,id:ev.pointerId};try{e.setPointerCapture(ev.pointerId)}catch(_){}});
    e.addEventListener('pointermove',ev=>{if(!p||ev.pointerId!==p.id)return;if(Math.abs(ev.clientX-p.x0)>9){robots[pilihan].putar+=(ev.clientX-p.x)*.012;p.geser=true}p.x=ev.clientX});
    e.addEventListener('pointerup',ev=>{if(!p)return;const q=p;p=null;if(q.geser)return;
      const b=e.getBoundingClientRect();sinar.setFromCamera(new THREE.Vector2((ev.clientX-b.left)/b.width*2-1,-((ev.clientY-b.top)/b.height*2-1)),cam);
      let terbaik=-1,jarak=1e9;robots.forEach((r,i)=>{const k=sinar.intersectObjects([r.g,r.alas],true)[0];if(k&&k.distance<jarak){jarak=k.distance;terbaik=i}});
      if(terbaik>=0){pilih(terbaik);robots[terbaik].aksi('sapa');onPilih(terbaik)}});
    e.addEventListener('pointercancel',()=>{p=null});
  }
  function pilih(i){pilihan=i;robots.forEach(r=>r.putar=0)}
  return{render,pasang,pilih};
})();

/* Robot pemandu kecil di pojok layar permainan */
const PEMANDU=typeof GL==='undefined'?null:(()=>{
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,.1,50);GL.lampu(scene);
  let robot=null,el=null;
  function ganti(id){if(robot)scene.remove(robot.g);robot=RB.buat(id);scene.add(robot.g)}
  function render(t){if(!el||!robot)return;robot.upd(t);robot.g.rotation.y=Math.sin(t*.7)*.25;cam.position.set(0,1.55,7.4);cam.lookAt(0,1.5,0);GL.gambar(scene,cam,el)}
  return{ganti,render,pasang(e){el=e},aksi(n){if(robot)robot.aksi(n)}};
})();
