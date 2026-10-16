/* =========================================================
   DIMENSIA · renderer bersama dan arena kubus 3D (Bedah 3D + Kamera Ajaib)
   Satu kanvas layar penuh di belakang antarmuka; tiap adegan digambar ke
   kotak elemen HTML-nya masing-masing (viewport + scissor).
   ========================================================= */
const GL=(()=>{
  const canvas=document.getElementById('gl');
  const R=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  let pr=Math.min(window.devicePixelRatio||1,2);
  R.setPixelRatio(pr);R.setClearColor(0x000000,0);R.autoClear=false;
  function ukur(){R.setSize(innerWidth,innerHeight,false)}
  addEventListener('resize',ukur);ukur();
  /* resolusi adaptif: kalau perangkat kewalahan, turunkan kerapatan piksel */
  let n=0,acc=0;
  function denyut(dt){acc+=dt;if(++n===90){if(acc/n>.036&&pr>1){pr=1;R.setPixelRatio(pr);ukur()}n=0;acc=0}}
  function mulai(){R.setScissorTest(false);R.clear()}
  function gambar(scene,cam,el){
    const b=el.getBoundingClientRect();if(b.width<4||b.height<4)return null;
    const y=innerHeight-b.bottom;
    R.setViewport(b.left,y,b.width,b.height);R.setScissor(b.left,y,b.width,b.height);R.setScissorTest(true);
    R.clearDepth();R.render(scene,cam);return b;
  }
  function lampu(scene){scene.add(new THREE.HemisphereLight('#ffffff','#aab3ff',.92));const d=new THREE.DirectionalLight('#fff6e0',.6);d.position.set(4,9,7);scene.add(d)}
  return{R,mulai,gambar,lampu,denyut};
})();

const G3=(()=>{
const scene=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,300),grup=new THREE.Group();
GL.lampu(scene);scene.add(grup);
const geo=new THREE.BoxGeometry(.96,.96,.96),egeo=new THREE.EdgesGeometry(geo),sinar=new THREE.Raycaster();
const DASAR=new THREE.Color('#5aa2ff'),PUTIH=new THREE.Color('#ffffff'),WL=['#FFD66D','#FF8C92','#B8A2F7','#8EE2BE'].map(c=>new THREE.Color(c));
const AWAL={az:.62,el:.52};
const PANDANG={'3d':AWAL,depan:{az:0,el:0},atas:{az:0,el:Math.PI/2-.0006},samping:{az:Math.PI/2,el:0}};
const st={bedah:false,ledak:false,trans:false,pindai:-1,kunci:false,az:AWAL.az,el:AWAL.el,taz:AWAL.az,tel:AWAL.el,zoom:1,pandang:'3d',hit:[]};
let kubus=[],dim={W:1,H:1,D:1},tanda=[],skala=4,ty=1,el=null,onUbah=()=>{};
const teksCache={};
function teksTex(t,bg,fg,w,h,font){
  const id=t+bg+w;if(teksCache[id])return teksCache[id];
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  g.fillStyle=bg;const r=h*.42;g.beginPath();g.moveTo(r,2);g.arcTo(w-2,2,w-2,h-2,r);g.arcTo(w-2,h-2,2,h-2,r);g.arcTo(2,h-2,2,2,r);g.arcTo(2,2,w-2,2,r);g.fill();
  g.fillStyle=fg;g.font=font;g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h/2+h*.04);
  return teksCache[id]=new THREE.CanvasTexture(c);
}
function kosongkan(){
  while(grup.children.length){const o=grup.children.pop();o.traverse(m=>{if(m.material&&m.userData.milik)m.material.dispose()})}
  kubus=[];tanda=[];st.hit=[];
}
/* Data koordinat tidak pernah diubah oleh animasi: posisi asli disimpan di userData.asal. */
function muat(k){
  kosongkan();dim=DK.ukuran(k);
  const cx=(dim.W-1)/2,cz=(dim.D-1)/2;
  const pelat=new THREE.Mesh(new THREE.BoxGeometry(dim.W+1,.16,dim.D+2.3),new THREE.MeshLambertMaterial({color:'#EEF1FF'}));
  pelat.position.set(0,-.08,.65);pelat.userData.milik=true;grup.add(pelat);
  const p=[];
  for(let x=0;x<=dim.W;x++)p.push(x-cx-.5,.004,-cz-.5-0+0,x-cx-.5,.004,cz+.5);
  for(let z=0;z<=dim.D;z++)p.push(-cx-.5,.004,z-cz-.5,cx+.5,.004,z-cz-.5);
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  const garis=new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:'#B9C2F2'}));garis.userData.milik=true;grup.add(garis);
  const panah=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.74),new THREE.MeshBasicMaterial({map:teksTex('▲ DEPAN','#FF8C92','#ffffff',512,164,'bold 96px Arial, sans-serif'),transparent:true}));
  panah.rotation.x=-Math.PI/2;panah.position.set(0,.006,cz+1.15);panah.userData.milik=true;grup.add(panah);
  k.forEach((c,i)=>{
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:DASAR.clone(),transparent:true}));
    const e=new THREE.LineSegments(egeo,new THREE.LineBasicMaterial({color:'#1e2a4a',transparent:true}));
    m.add(e);m.userData={milik:true,i,lap:c.y,asal:new THREE.Vector3(c.x-cx,c.y+.5,-(c.z-cz)),op:1,tepi:e};
    e.userData.milik=true;m.position.copy(m.userData.asal);grup.add(m);kubus.push(m);
  });
  Object.assign(st,{bedah:false,ledak:false,trans:false,pindai:-1,zoom:1,pandang:'3d',taz:AWAL.az,tel:AWAL.el,az:AWAL.az,el:AWAL.el});
  skala=0;onUbah('muat');
}
const v=new THREE.Vector3();
function perbarui(){
  for(const m of kubus){
    const u=m.userData;v.copy(u.asal);
    if(st.ledak){v.x*=1.6;v.z*=1.6;v.y=(u.asal.y-.5)*1.6+.5}
    if(st.bedah)v.y+=u.lap*1.3;
    m.position.lerp(v,.16);
    let op=st.trans?.28:1;if(st.pindai>=0&&u.lap!==st.pindai)op=.06;
    u.op=op;const mat=m.material;mat.opacity+=(op-mat.opacity)*.2;mat.depthWrite=mat.opacity>.6;
    u.tepi.material.opacity=Math.max(.2,mat.opacity);
    const dihitung=st.hit.includes(u.i);
    mat.color.lerp(dihitung?PUTIH:(st.bedah||st.pindai>=0)?WL[u.lap%WL.length]:DASAR,.2);
  }
  for(const t of tanda)t.position.copy(kubus[t.userData.i].position);
  let d=st.taz-st.az;d=Math.atan2(Math.sin(d),Math.cos(d));st.az+=d*.16;st.el+=(st.tel-st.el)*.16;
}
function kamera(b){
  const melar=(st.bedah?1.5:1)*(st.ledak?1.3:1);
  let s=(Math.max(dim.W,dim.D+1.4,dim.H)*.6+1)*(melar>1?Math.min(melar,1.7):1)/st.zoom;
  const asp=b.width/b.height;if(asp<1.15)s*=1.15/asp;
  skala=skala?skala+(s-skala)*.14:s;
  const tinggi=dim.H*(st.bedah?1.15:.5)*(st.ledak?1.25:1)-.1;ty+=(tinggi-ty)*.14;
  cam.left=-skala*asp;cam.right=skala*asp;cam.top=skala;cam.bottom=-skala;cam.updateProjectionMatrix();
  const ce=Math.cos(st.el);
  cam.position.set(60*ce*Math.sin(st.az),ty+60*Math.sin(st.el),.3+60*ce*Math.cos(st.az));
  cam.up.set(0,1,0);cam.lookAt(0,ty,.3);
}
function render(){if(!el)return;perbarui();const b=el.getBoundingClientRect();if(b.width<4)return;kamera(b);GL.gambar(scene,cam,el)}

function ketuk(x,y){
  const b=el.getBoundingClientRect(),n=new THREE.Vector2((x-b.left)/b.width*2-1,-((y-b.top)/b.height*2-1));
  sinar.setFromCamera(n,cam);
  const kena=sinar.intersectObjects(kubus.filter(m=>m.userData.op>.2),false)[0];
  if(!kena)return;
  const i=kena.object.userData.i;
  if(st.hit.includes(i)){onUbah('sudah');return}
  st.hit.push(i);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:teksTex(''+st.hit.length,'#1e2a4a','#ffffff',128,128,'bold 76px Arial, sans-serif'),depthTest:false}));
  sp.scale.set(.56,.56,1);sp.renderOrder=10;sp.userData={i,milik:true};grup.add(sp);tanda.push(sp);
  onUbah('hitung');
}
function hapusHitung(){for(const t of tanda){grup.remove(t);t.material.dispose()}tanda=[];st.hit=[];onUbah('hapus')}
function pasang(e){
  el=e;let p=null;
  e.addEventListener('pointerdown',ev=>{p={id:ev.pointerId,x:ev.clientX,y:ev.clientY,x0:ev.clientX,y0:ev.clientY,geser:false};try{e.setPointerCapture(ev.pointerId)}catch(_){}});
  e.addEventListener('pointermove',ev=>{
    if(!p||ev.pointerId!==p.id||st.kunci)return;
    if(!p.geser&&Math.hypot(ev.clientX-p.x0,ev.clientY-p.y0)<9)return;
    if(!p.geser){p.geser=true;p.x=ev.clientX;p.y=ev.clientY;return}
    st.taz-=(ev.clientX-p.x)*.006;st.tel=Math.min(1.45,Math.max(.04,st.tel+(ev.clientY-p.y)*.005));
    p.x=ev.clientX;p.y=ev.clientY;
    if(st.pandang!=='bebas'){st.pandang='bebas';onUbah('pandang')}
  });
  const lepas=ev=>{if(!p||ev.pointerId!==p.id)return;const q=p;p=null;if(ev.type==='pointerup'&&!q.geser&&!st.kunci)ketuk(ev.clientX,ev.clientY)};
  e.addEventListener('pointerup',lepas);e.addEventListener('pointercancel',lepas);
}
function pandang(n){const q=PANDANG[n];if(!q)return;st.pandang=n;st.taz=q.az;st.tel=q.el;onUbah('pandang')}
function putar(arah){st.taz+=arah*Math.PI/4;if(st.tel>1.4||st.tel<.08)st.tel=AWAL.el;st.pandang='bebas';onUbah('pandang')}
function zoom(k){st.zoom=Math.min(1.7,Math.max(.65,st.zoom*k))}
function setel(nama,nilai){st[nama]=nilai;onUbah(nama)}
return{st,muat,render,pasang,pandang,putar,zoom,setel,hapusHitung,
  kunci(b){st.kunci=b;if(b){st.taz=AWAL.az;st.tel=AWAL.el;st.pandang='3d';st.zoom=1}},
  get dim(){return dim},get jumlah(){return kubus.length},set onUbah(f){onUbah=f}};
})();
