/* Kota mainan 3D: satu renderer untuk semua arena, dengan pointer tiap pemain terpisah. */
const MenaraScene=(()=>{
  const palette=['#7ec8ff','#ffb3b8','#c9b5ff','#ffd966','#9be58a','#ffb866'];
  const materials=new Map(),geometries=new Map();
  const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshLambertMaterial({color:c}));return materials.get(c)};
  const geo=(key,fn)=>{if(!geometries.has(key))geometries.set(key,fn());return geometries.get(key)};
  const box=(w,h,d,c)=>new THREE.Mesh(geo(`b${w},${h},${d}`,()=>new THREE.BoxGeometry(w,h,d)),mat(c));
  const cylinder=(r,h,segments,c)=>new THREE.Mesh(geo(`c${r},${h},${segments}`,()=>new THREE.CylinderGeometry(r,r,h,segments)),mat(c));
  const add=(g,m,x=0,y=0,z=0)=>{m.position.set(x,y,z);g.add(m);return m};
  let renderer,ready=false;
  try{renderer=new THREE.WebGLRenderer({canvas:document.getElementById('cityCanvas'),antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setSize(innerWidth,innerHeight,false);renderer.setClearColor(0,0);renderer.autoClear=false;ready=true}catch(error){document.getElementById('webglError').hidden=false;console.warn('Renderer DIMENSIA:',error.message)}
  addEventListener('resize',()=>renderer?.setSize(innerWidth,innerHeight,false));
  /* Bangun ruang: balok, kubus, tabung, prisma segienam. Garis tepi tinta supaya rusuknya jelas. */
  const tepi=new THREE.LineBasicMaterial({color:'#1e2a4a'});
  function house(s){
    const g=new THREE.Group(),w=s.width,h=s.height,color=palette[s.color%palette.length];
    const d=s.kind==='kubus'?w:w*.72;
    const body=s.kind==='tabung'?cylinder(w*.5,h,28,color):s.kind==='prisma'?cylinder(w*.5,h,6,color):box(w,h,d,color);
    if(s.kind==='prisma')body.rotation.y=Math.PI/6;
    add(g,body,0,h/2);
    const garis=new THREE.LineSegments(geo('e'+s.kind+w+','+h,()=>new THREE.EdgesGeometry(body.geometry,s.kind==='tabung'?40:1)),tepi);
    garis.rotation.copy(body.rotation);add(g,garis,0,h/2);
    return g;
  }
  function lights(scene){const hemi=new THREE.HemisphereLight('#fff9ee','#668fa5',.85);scene.add(hemi);const sun=new THREE.DirectionalLight('#fff0d4',.55);sun.position.set(-4,9,8);scene.add(sun);return hemi}
  function tree(scene,x,z,scale=1){const g=new THREE.Group();add(g,cylinder(.07,.8,7,'#a86b32'),0,.4);add(g,new THREE.Mesh(geo('tree',()=>new THREE.ConeGeometry(.48,1.2,7)),mat('#1f9d55')),0,1.15);g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g)}
  function create(el,character=0,home=false,color='#ffc93c'){
    const pick=home==='pick';home=!!home;
    const scene=new THREE.Scene();scene.background=null; /* langit biru halaman terlihat di belakang arena */const hemi=lights(scene);let seru=null;
    const camera=new THREE.OrthographicCamera(-6,6,5,-5,.1,300),tower=new THREE.Group();scene.add(tower);
    if(!pick){add(scene,cylinder(home?7:3.35,.38,48,'#4aa84f'),0,-.35);add(scene,cylinder(home?6.7:3.18,.12,48,'#8fd46a'),0,-.1)}
    if(!home){add(scene,box(4.7,.16,2.5,'#fff8e8'),0,.02);tree(scene,-2.65,-.5,.75);tree(scene,2.7,-.7,.95)}
    const bots=[];
    if(pick){for(let i=0;i<4;i++){const b=RB.buat(ROBOT[i].id);b.g.position.set((i-1.5)*2.9,0,0);scene.add(b.g);bots.push(b);add(scene,cylinder(1.05,.16,40,ROBOT[i].warna),(i-1.5)*2.9,-.08,0)}}
    else if(home){
      const heights=[2,4,6,3,5];
      heights.forEach((count,i)=>{let y=0;for(let j=0;j<count;j++){const s=MenaraCore.shape(700+i*19,j),building=house(s);building.position.set((i-2)*1.75,y,-2.1+(i%2)*.7);building.scale.set(.78,1,.78);scene.add(building);y+=s.height}});
      for(let i=0;i<4;i++){const b=RB.buat(ROBOT[i].id);b.g.position.set((i-1.5)*2.9,.1,2.6);b.g.scale.setScalar(.72);scene.add(b.g);bots.push(b);add(scene,cylinder(.95,.2,32,palette[i]),(i-1.5)*2.9,0,2.6)}
      tree(scene,-5,-1,1.2);tree(scene,5,-.5,1.4);
    }else{/* ROBOT KOMANDAN: berdiri di panggung bundar berwarna tim, ikut besar-kecil bersama robotnya */
      const b=RB.buat(ROBOT[character].id);scene.add(b.g);bots.push(b);
      add(b.g,cylinder(1.05,.22,40,color),0,-.11);const cincin=add(b.g,new THREE.Mesh(geo('cincin',()=>new THREE.TorusGeometry(1.12,.06,8,48)),mat('#ffffff')),0,0);cincin.rotation.x=Math.PI/2;
      /* tanda seru merah di atas kepala saat gempa */
      seru=new THREE.Group();add(seru,box(.26,.8,.26,'#e8323c'),0,.62);add(seru,new THREE.Mesh(geo('titikseru',()=>new THREE.SphereGeometry(.17,12,8)),mat('#e8323c')),0,0);seru.position.set(0,3.2,0);seru.visible=false;b.g.add(seru)}
    // Awan di belakang menara; seluruh dekorasi dibuat tanpa tekstur dari internet.
    for(let i=0;i<5;i++){const cloud=new THREE.Group();for(let j=0;j<3;j++){const m=new THREE.Mesh(geo('cloud',()=>new THREE.SphereGeometry(1,12,8)),mat('#ffffff'));m.scale.set(.8,.28,.45);add(cloud,m,j*.7,Math.sin(j)*.13)}cloud.position.set(-10+i*4,5+(i%3)*2,-12);scene.add(cloud)}
    return {el,scene,camera,tower,home,pick,hemi,seru,komandan:!home&&!pick,selected:0,bots,meshes:[],loose:[],incoming:null,incomingKey:'',follow:0,targetY:0,drag:null,anim:null,robotMood:'idle'};
  }
  function sync(v,p){
    while(v.meshes.length>p.blocks.length){const m=v.meshes.pop();v.tower.remove(m);v.scene.add(m);m.position.y+=.1;v.loose.push({mesh:m,vy:2,vx:(Math.random()-.5)*4,life:1.1})}
    for(let i=v.meshes.length;i<p.blocks.length;i++){const data=p.blocks[i],m=house(data);m.position.set(data.x,data.y,0);v.tower.add(m);v.meshes.push(m)}
    const key=p.placed+'-'+p.phase;
    if(v.incomingKey!==key){if(v.incoming)v.scene.remove(v.incoming);v.incoming=null;v.incomingKey=key;if(p.phase==='build'){v.incoming=house(p.next);v.incoming.position.set(-2.15,MenaraCore.height(p)+2.75,0);v.scene.add(v.incoming)}}
  }
  function project(v,point){const p=point.clone().project(v.camera),b=v.el.getBoundingClientRect();return{x:(p.x+1)*b.width/2,y:(1-p.y)*b.height/2}}
  function drag(v,p,clientX,clientY){if(!v.incoming)return;const b=v.el.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((clientX-b.left)/b.width*2-1,-((clientY-b.top)/b.height)*2+1),v.camera);const pos=new THREE.Vector3();if(ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),0),pos)){v.incoming.position.x=Math.max(-3.6,Math.min(3.6,pos.x));v.incoming.position.y=Math.max(MenaraCore.height(p)+.6,Math.min(MenaraCore.height(p)+4,pos.y-p.next.height*.55))}}
  function drop(v,p,onLand){if(!v.incoming||v.anim)return;const x=v.incoming.position.x,hit=MenaraCore.landing(p,x);v.anim={from:v.incoming.position.clone(),target:hit.ok?new THREE.Vector3(hit.x,MenaraCore.height(p),0):new THREE.Vector3(-2.15,MenaraCore.height(p)+2.75,0),elapsed:0,duration:hit.ok?.48:.6,done:onLand,hit,x};}
  /* Posisi komandan dihitung dari kamera (koordinat layar), jadi selalu terlihat apa pun ukuran arenanya.
     Saat membangun: di pojok kanan bawah. Saat gempa/soal: melompat ke depan, jauh lebih besar, panik dengan tanda seru. */
  const sinarKomandan=new THREE.Raycaster(),bidangDepan=new THREE.Plane(new THREE.Vector3(0,0,1),-2);
  function komandan(v,r,p,t,dt,span,aspect,motion){
    const panik=p.phase==='question'||p.phase==='feedback',sempit=aspect<1;
    const tuju=panik?{x:sempit?-.1:-.52,y:-.95,h:sempit?.9:.86,w:sempit?.98:.45}:{x:sempit?.6:.74,y:-.74,h:.35,w:sempit?.42:.26},tinggiBadan=panik?4.1:2.7; /* saat panik tanda seru ikut dihitung supaya tidak terpotong */
    sinarKomandan.setFromCamera(new THREE.Vector2(tuju.x,tuju.y),v.camera);const pos=new THREE.Vector3();if(!sinarKomandan.ray.intersectPlane(bidangDepan,pos))return;
    const s=Math.min(2*span*tuju.h/tinggiBadan,2*span*aspect*tuju.w/2.4),k=v.siapKomandan?Math.min(1,dt*(panik?9:5)):1;v.siapKomandan=true;
    r.g.position.lerp(pos,k);r.g.scale.setScalar(r.g.scale.x+(s-r.g.scale.x)*k);
    r.g.rotation.y+=((panik?.32:-.2)+(panik&&motion?Math.sin(t*16)*.12:0)-r.g.rotation.y)*Math.min(1,k*2);
    if(v.seru){v.seru.visible=p.phase==='question';v.seru.position.y=3.2+(motion?Math.abs(Math.sin(t*8))*.25:0);v.seru.rotation.z=motion?Math.sin(t*14)*.18:0}
    /* lampu alarm: cahaya memerah berdenyut selama soal */
    const a=p.phase==='question'&&motion?.5+.5*Math.sin(t*9):0;v.hemi.color.setRGB(1,.976-.36*a,.933-.42*a);
  }
  function update(v,p,t,dt,motion=true){
    if(p)sync(v,p);
    const h=p?MenaraCore.height(p):5;
    const target=p?Math.max(0,h-3.4):0;v.follow+=(target-v.follow)*Math.min(1,dt*5);
    const b=v.el.getBoundingClientRect();if(b.width<2||b.height<2)return;
    const aspect=b.width/b.height,span=v.pick?Math.max(2.2,6.6/aspect):v.home?Math.max(4.8,7.9/aspect):Math.max(4.8,4.3/aspect);
    v.camera.left=-span*aspect;v.camera.right=span*aspect;v.camera.top=span;v.camera.bottom=-span;
    const cy=v.pick?1.45:v.home?3.2:v.follow+3.2;v.camera.position.set(v.pick?0:v.home?10:6,cy+(v.pick?2.2:6),19);v.camera.lookAt(0,cy,0);v.camera.updateProjectionMatrix();
    v.tower.position.x=p?.phase==='question'&&motion?Math.sin(t*28)*.055:0;
    v.tower.rotation.z=p?.phase==='question'&&motion?Math.sin(t*19)*.009:0;
    v.meshes.forEach(m=>m.visible=m.position.y>v.follow-5);
    v.bots.forEach((r,i)=>{r.upd(motion?t:t*.2);if(v.pick){const k=i===v.selected?1.18:.9;r.g.scale.setScalar(r.g.scale.x+(k-r.g.scale.x)*.18);r.g.rotation.y=Math.sin(t*.6+i)*.2}else if(v.komandan){if(p)komandan(v,r,p,t,dt,span,aspect,motion)}else r.g.rotation.y=.2+Math.sin(t*.6+i)*.15});
    if(v.anim){const a=v.anim;a.elapsed+=dt;const u=Math.min(1,a.elapsed/a.duration);if(a.hit.ok)v.incoming.position.lerpVectors(a.from,a.target,u*u);else{const k=Math.max(0,(u-.45)/.55);v.incoming.position.lerpVectors(a.from,a.target,k*k*(3-2*k));v.incoming.rotation.z=Math.sin(u*Math.PI*5)*.16*(1-u)}if(u===1){v.anim=null;v.incoming.rotation.z=0;a.done(a.x,a.hit)}}
    v.loose=v.loose.filter(item=>{item.life-=dt;item.vy-=dt*12;item.mesh.position.y+=item.vy*dt;item.mesh.position.x+=item.vx*dt;item.mesh.rotation.z+=dt*1.2;if(item.life<=0){v.scene.remove(item.mesh);return false}return true});
    if(v.incoming&&p&&!v.anim){const pos=project(v,v.incoming.position.clone().add(new THREE.Vector3(0,p.next.height*.55,.3)));const handle=v.el.querySelector('.piece-handle');if(handle){handle.style.left=pos.x+'px';handle.style.top=pos.y+'px'}}
  }
  /* PANGGUNG JUARA 3D: undakan berwarna tim yang tumbuh dari tanah, robot di atasnya,
     mahkota berputar untuk juara 1, sinar di belakangnya, dan konfeti. Tulisan digambar ke tekstur kanvas. */
  const MEDALI=['#ffcc33','#d5dce6','#e0a46a','#9cc3ff'],TINGGI=[2.2,1.75,1.35,1.02],LEBAR=3.4,JARAK=3.62;
  function papan(rank,name,meter,h){
    const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/LEBAR);const x=c.getContext('2d');
    x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle='#1e2a4a';
    /* medali di kiri, nama dan tinggi menara di kanan; isi menempel di bagian atas undakan */
    x.lineWidth=9;x.fillStyle=MEDALI[rank];x.beginPath();x.arc(74,77,60,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#1e2a4a';x.font='800 92px "Baloo 2","Nunito",sans-serif';x.fillText(String(rank+1),74,84);
    let f=60;const huruf=()=>x.font='800 '+f+'px "Baloo 2","Nunito",sans-serif';huruf();while(x.measureText(name).width>350&&f>20){f-=2;huruf()}
    x.lineWidth=12;x.strokeText(name,324,52);x.fillStyle='#ffffff';x.fillText(name,324,52);
    x.font='800 34px "Nunito",sans-serif';const w=x.measureText(meter).width+48,l=324-w/2,r=324+w/2;
    x.fillStyle='#1e2a4a';x.beginPath();x.moveTo(l+23,91);x.arcTo(r,91,r,137,23);x.arcTo(r,137,l,137,23);x.arcTo(l,137,l,91,23);x.arcTo(l,91,r,91,23);x.fill();
    x.fillStyle='#ffffff';x.fillText(meter,324,115);
    return new THREE.CanvasTexture(c);
  }
  function podium(el,list){
    const scene=new THREE.Scene();scene.background=null;lights(scene);
    const n=list.length,urut=n===1?[0]:n===2?[1,0]:[1,0,2,3].filter(i=>i<n),W=n*JARAK+.4,H=5.8;
    add(scene,cylinder(W/2+1.5,.3,48,'#4aa84f'),0,-.16).scale.z=.42;add(scene,cylinder(W/2+1.25,.1,48,'#8fd46a'),0,-.03).scale.z=.42;
    const v={el,scene,camera:new THREE.PerspectiveCamera(28,1,.1,300),bots:[],entries:[],textures:[],confetti:[],W,H,t0:null,podium:true,meshes:[],loose:[]};
    urut.forEach((rank,slot)=>{const d=list[rank],h=TINGGI[rank],x=(slot-(urut.length-1)/2)*JARAK,tiang=new THREE.Group();
      add(tiang,box(LEBAR,h,2,d.color),0,h/2);
      add(tiang,new THREE.LineSegments(geo('pe'+h,()=>new THREE.EdgesGeometry(new THREE.BoxGeometry(LEBAR,h,2))),tepi),0,h/2);
      add(tiang,box(LEBAR+.22,.16,2.22,rank?'#fff8e8':'#ffcc33'),0,h+.08);
      const tex=papan(rank,d.name,d.meter,h);v.textures.push(tex);
      add(tiang,new THREE.Mesh(new THREE.PlaneGeometry(LEBAR*.94,h*.94),new THREE.MeshBasicMaterial({map:tex,transparent:true})),0,h/2,1.012);
      tiang.position.x=x;scene.add(tiang);
      const r=RB.buat(ROBOT[d.character].id);r.g.position.set(x,0,.1);scene.add(r.g);v.bots.push(r);
      v.entries.push({rank,x,h,tiang,robot:r,besar:rank?.86:1,tunda:.25+(n-1-rank)*.5,sorak:0})});
    const juara=v.entries.find(e=>e.rank===0),emas=new THREE.MeshLambertMaterial({color:'#ffcc33',side:THREE.DoubleSide});
    /* sinar di belakang juara */
    const s=new THREE.Shape();for(let i=0;i<32;i++){const r=i%2?1.3:2.5,a=i*Math.PI/16;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
    v.sinar=add(scene,new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshBasicMaterial({color:'#fff3c4',transparent:true,opacity:.8})),juara.x,juara.h+1.6,-1.6);
    /* mahkota */
    const m=new THREE.Group();m.add(new THREE.Mesh(new THREE.CylinderGeometry(.44,.36,.26,24,1,true),emas));
    for(let i=0;i<6;i++){const a=i*Math.PI/3;add(m,new THREE.Mesh(geo('duri',()=>new THREE.ConeGeometry(.1,.32,4)),emas),Math.cos(a)*.41,.27,Math.sin(a)*.41);add(m,new THREE.Mesh(geo('permata',()=>new THREE.SphereGeometry(.055,10,8)),mat(i%2?'#e8323c':'#2f7bea')),Math.cos(a+.52)*.41,0,Math.sin(a+.52)*.41)}
    m.position.set(juara.x,juara.h+3.2,.1);scene.add(m);v.crown=m;
    /* konfeti */
    const warna=['#e8323c','#2f7bea','#1f9d55','#f08c00','#ffc93c','#ffffff'];
    for(let i=0;i<90;i++){const k=new THREE.Mesh(geo('konfeti',()=>new THREE.BoxGeometry(.18,.1,.02)),mat(warna[i%6]));k.position.set((Math.random()-.5)*(W+2),Math.random()*9,-1.5+Math.random()*4);k.visible=false;scene.add(k);v.confetti.push({mesh:k,vy:.9+Math.random()*1.3,putar:1+Math.random()*4,fase:Math.random()*6})}
    return v;
  }
  function updatePodium(v,t,dt,motion=true){
    if(v.t0===null)v.t0=t;const k=motion?t-v.t0:99,b=v.el.getBoundingClientRect();if(b.width<2||b.height<2)return;
    const asp=b.width/b.height,f=Math.tan(14*Math.PI/180),d=Math.max((v.W/2+1.3)/(f*asp),(v.H/2+.75)/f),a=motion?Math.sin(k*.4)*.3:0;
    v.camera.aspect=asp;v.camera.position.set(Math.sin(a)*d,v.H/2+2.2,Math.cos(a)*d);v.camera.lookAt(0,v.H/2-.5,0);v.camera.updateProjectionMatrix();
    const pegas=u=>{const c=1.70158;return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2)};
    let tiba=true;
    for(const e of v.entries){const u=Math.max(0,Math.min(1,(k-e.tunda)/.9)),naik=Math.min(1,u/.7),s=1-Math.pow(1-naik,3),muncul=Math.max(0,(u-.6)/.4);if(u<1)tiba=false;
      e.tiang.scale.y=Math.max(.001,s);e.robot.g.position.y=e.h*s+.16;e.robot.g.scale.setScalar(Math.max(.001,e.besar*pegas(muncul)));e.robot.g.visible=muncul>0;
      e.robot.upd(t);e.robot.g.rotation.y=Math.sin(t*.7+e.rank)*.18;
      if(u===1&&motion&&t>e.sorak){e.sorak=t+(e.rank?3.4+e.rank*.5:2.2);e.robot.aksi(e.rank?'sapa':'senang')}}
    const j=v.entries.find(e=>e.rank===0),ju=Math.max(0,Math.min(1,(k-j.tunda-.9)/.5));
    v.crown.visible=v.sinar.visible=ju>0;v.crown.scale.setScalar(Math.max(.001,pegas(ju)));v.crown.rotation.y=t*1.4;v.crown.position.y=j.h+3.2+Math.sin(t*2.2)*.09;
    v.sinar.scale.setScalar(Math.max(.001,ju*(1+.05*Math.sin(t*3))));v.sinar.rotation.z=t*.25;v.sinar.lookAt(v.camera.position.x,v.sinar.position.y,v.camera.position.z);v.sinar.rotateZ(t*.25);
    for(const c of v.confetti){c.mesh.visible=tiba&&motion;if(!c.mesh.visible)continue;c.mesh.position.y-=c.vy*dt;c.mesh.position.x+=Math.sin(t*1.6+c.fase)*dt*.5;c.mesh.rotation.x+=c.putar*dt;c.mesh.rotation.z+=c.putar*.6*dt;if(c.mesh.position.y<0)c.mesh.position.y=8.5}
  }
  function render(v){if(!ready||v.el.hidden||!v.el.isConnected)return;const b=v.el.getBoundingClientRect();if(b.width<2||b.height<2||b.bottom<0||b.top>innerHeight)return;renderer.setViewport(b.left,innerHeight-b.bottom,b.width,b.height);renderer.setScissor(Math.max(0,b.left),Math.max(0,innerHeight-b.bottom),Math.min(b.width,innerWidth-b.left),Math.min(b.height,innerHeight-b.top));renderer.setScissorTest(true);renderer.clearDepth();renderer.render(v.scene,v.camera)}
  function frame(){if(ready){renderer.setScissorTest(false);renderer.setClearColor(0x000000,0);renderer.clear()}}
  function mood(v,state){v.robotMood=state;v.bots.forEach(r=>r.aksi(state))}
  function dispose(v){(v.textures||[]).forEach(t=>t.dispose());v.scene.clear();v.meshes=[];v.loose=[];v.incoming=null}
  return{ready,create,sync,update,render,frame,drag,drop,project,mood,dispose,house,podium,updatePodium};
})();
