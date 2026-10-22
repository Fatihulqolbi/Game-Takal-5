/* DIMENSIA · Lomba Bungkus Kado: adegan 3D tiap arena.
   Memakai renderer bersama MenaraScene (satu kanvas, digambar per arena dengan scissor).
   Isi kotak: permen kubus 1 cm jatuh lapis demi lapis; kelebihan permen tumpah ke meja.
   Bungkus : lembar kertas kado terbang menutup sisi-sisi kotak; kertas kurang = ada sisi bolong,
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
  /* kardus terbuka berukuran p × l × t, diskalakan supaya muat di meja */
  function pesanan(v,o){
    v.kotak.clear();v.permen=[];v.kertas=[];v.anim=[];v.kotak.position.set(0,0,0);v.kotak.scale.setScalar(1);v.kotak.visible=true;
    const{p,l,t}=o,k=Math.min(3.1/Math.max(p,l),2.6/t);v.k=k;v.dim={p,l,t};
    const isi=new THREE.Group();isi.scale.setScalar(k);v.kotak.add(isi);v.isi=isi;
    const dinding=mat('#d9a066',{transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false});
    const sisi=(w,h,x,y,z,ry,rx=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),dinding);m.position.set(x,y,z);m.rotation.set(rx,ry,0);isi.add(m)};
    sisi(p,l,0,0,0,0,-Math.PI/2);sisi(p,t,0,t/2,l/2,0);sisi(p,t,0,t/2,-l/2,0);sisi(l,t,-p/2,t/2,0,Math.PI/2);sisi(l,t,p/2,t/2,0,Math.PI/2);
    const rangka=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(p,t,l)),garis);rangka.position.y=t/2;isi.add(rangka);
    /* petak 1 cm di alas supaya ukurannya bisa dihitung */
    const pts=[];for(let i=0;i<=p;i++)pts.push(i-p/2,.01,-l/2,i-p/2,.01,l/2);for(let j=0;j<=l;j++)pts.push(-p/2,.01,j-l/2,p/2,.01,j-l/2);
    const kisi=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(pts,3)),new THREE.LineBasicMaterial({color:'#8a5a2b'}));isi.add(kisi);
    v.kotak.position.x=7;v.anim.push({d:.7,t:0,f:u=>{v.kotak.position.x=7*(1-mudah(u))}});
  }
  /* isi n permen; yang melebihi volume tumpah ke meja */
  function isiPermen(v,n,selesai){
    const{p,l,t}=v.dim,V=p*l*t,per=Math.min(.05,1.5/Math.max(1,n));
    for(let j=0;j<n;j++){const m=new THREE.Mesh(geoKubus,mat(PERMEN[(j*7+Math.floor(j/(p*l)))%PERMEN.length]));m.add(new THREE.LineSegments(tepiKubus,garis));
      let tuju;if(j<V){const x=j%p,z=Math.floor(j/p)%l,y=Math.floor(j/(p*l));tuju=new THREE.Vector3(x-(p-1)/2,y+.5,z-(l-1)/2)}
      else{const a=j*2.399,rr=Math.max(p,l)/2+1+(j-V)%3*.9;tuju=new THREE.Vector3(Math.cos(a)*rr,.45,Math.sin(a)*rr*.5+.4)}
      const dari=new THREE.Vector3(tuju.x*.3,t+4,tuju.z*.3);m.position.copy(dari);m.visible=false;v.isi.add(m);v.permen.push(m);
      const mulai=j*per;v.anim.push({d:.45,t:-mulai,f:u=>{m.visible=true;m.position.lerpVectors(dari,tuju,u*u);m.rotation.y=(1-u)*3}})}
    v.anim.push({d:.2,t:-(n*per+.45),f:()=>{},akhir:selesai});
  }
  /* bungkus dengan kertas seluas `luas`; sisi diisi berurutan alas, depan, belakang, kiri, kanan, tutup */
  function bungkus(v,luas,sempurna,selesai){
    const{p,l,t}=v.dim,L=2*(p*l+p*t+l*t),e=.03;
    const sisi=[{w:p,h:l,pos:[0,-e,0],rot:[Math.PI/2,0,0],a:p*l},{w:p,h:t,pos:[0,t/2,l/2+e],rot:[0,0,0],a:p*t},{w:p,h:t,pos:[0,t/2,-l/2-e],rot:[0,Math.PI,0],a:p*t},
      {w:l,h:t,pos:[-p/2-e,t/2,0],rot:[0,-Math.PI/2,0],a:l*t},{w:l,h:t,pos:[p/2+e,t/2,0],rot:[0,Math.PI/2,0],a:l*t},{w:p,h:l,pos:[0,t+e,0],rot:[-Math.PI/2,0,0],a:p*l}];
    let sisa=luas,urut=0;
    sisi.forEach((s,i)=>{const cukup=sisa>=s.a;sisa-=s.a;if(!cukup)return;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.h),bahanKertas(s.w));m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),garis));v.isi.add(m);v.kertas.push(m);
      const dari=new THREE.Vector3(0,t+3.5,1.5),ke=new THREE.Vector3(...s.pos),r0=new THREE.Euler(-Math.PI/2,0,0),q0=new THREE.Quaternion().setFromEuler(r0),q1=new THREE.Quaternion().setFromEuler(new THREE.Euler(...s.rot));
      m.position.copy(dari);m.visible=false;const mulai=urut++*.22;
      v.anim.push({d:.5,t:-mulai,f:u=>{m.visible=true;const k=mudah(u);m.position.lerpVectors(dari,ke,k);m.quaternion.copy(q0).slerp(q1,k)}})});
    /* kertas berlebih: lembar kusut mencuat */
    if(luas>L){const n=Math.min(4,Math.ceil((luas-L)/Math.max(p*t,p*l,l*t)));for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1),bahanKertas(1.4));v.isi.add(m);v.kertas.push(m);
      const ke=new THREE.Vector3((i%2?1:-1)*(p/2+.4),t+.3,(i-1.5)*.6),mulai=urut++*.22;m.visible=false;
      v.anim.push({d:.5,t:-mulai,f:u=>{m.visible=true;m.position.lerpVectors(new THREE.Vector3(0,t+3.5,1.5),ke,mudah(u));m.rotation.set(.7+i,1.2*i,.5*u)}})}}
    if(sempurna){const pita=new THREE.Group(),y=t+e*2;
      const a=new THREE.Mesh(new THREE.BoxGeometry(p+.1,t+.1,.3),mat('#ffd54a'));a.position.y=t/2;pita.add(a);const b=new THREE.Mesh(new THREE.BoxGeometry(.3,t+.1,l+.1),mat('#ffd54a'));b.position.y=t/2;pita.add(b);
      for(const s of[-1,1]){const tali=new THREE.Mesh(new THREE.TorusGeometry(.38,.12,8,20),mat('#ffd54a'));tali.position.set(s*.36,y+.3,0);tali.rotation.set(0,0,s*.6);pita.add(tali)}
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
