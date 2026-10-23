/* PENGUKURAN · tangga satuan 3D (dipakai hub, Lab, dan game lomba).
   Memakai renderer bersama MenaraScene (satu kanvas, digambar per tampilan dengan scissor).
   Anak tangga paling kiri = satuan terbesar (km/kl/kg/minggu). Turun ke kanan = dikali, naik ke kiri = dibagi.
   Tiap anak tangga bertuliskan satuan + kata singkatannya; tiap undakan bertuliskan faktornya (×10, ×60, ...). */
const TanggaScene=(()=>{
  const INK='#1e2a4a',WARNA=['#e8323c','#f08c00','#ffc93c','#6cbd45','#2f9be0','#5b6ee8','#b06ae8'];
  const bahan=new Map(),mat=(c,o={})=>{const k=c+JSON.stringify(o);if(!bahan.has(k))bahan.set(k,new THREE.MeshLambertMaterial({color:c,...o}));return bahan.get(k)};
  const garis=new THREE.LineBasicMaterial({color:INK});
  const mudah=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
  function kanvas(w,h,gambar){const c=document.createElement('canvas');c.width=w;c.height=h;gambar(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
  function bulat(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r)}
  /* papan satuan di muka anak tangga */
  function papan(satuan,kata){return kanvas(256,200,(x,w,h)=>{x.fillStyle='#fffdf6';bulat(x,6,6,w-12,h-12,26);x.fill();x.lineWidth=8;x.strokeStyle=INK;x.stroke();
    x.fillStyle=INK;x.textAlign='center';x.textBaseline='middle';const f=satuan.length>4?66:satuan.length>2?88:104;x.font=`800 ${f}px "Baloo 2","Nunito",sans-serif`;x.fillText(satuan,w/2,h*.4);
    x.font='800 38px "Nunito",sans-serif';x.fillStyle='#c2185b';x.fillText(kata,w/2,h*.8)})}
  function label(teks,bg='#ffc93c'){const t=kanvas(256,110,(x,w,h)=>{x.fillStyle=bg;bulat(x,6,6,w-12,h-12,40);x.fill();x.lineWidth=8;x.strokeStyle=INK;x.stroke();x.fillStyle=INK;x.textAlign='center';x.textBaseline='middle';x.font=`800 ${teks.length>4?58:70}px "Baloo 2","Nunito",sans-serif`;x.fillText(teks,w/2,h/2+5)});
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.renderOrder=30;s.scale.set(1,.43,1);return s}
  function lampu(scene){scene.add(new THREE.HemisphereLight('#fff9ee','#7d8fa5',.95));const s=new THREE.DirectionalLight('#fff0d4',.5);s.position.set(-4,9,8);scene.add(s)}

  /* susun tangga untuk satu besaran */
  function bangun(v,besaran){
    if(v.besaran===besaran)return;v.besaran=besaran;v.tangga.clear();v.tekstur?.forEach(t=>t.dispose());v.tekstur=[];
    const T=UK.TANGGA[besaran],n=T.satuan.length,W=n===7?1.2:1.65,H=.46,D=1.7;v.W=W;v.H=H;v.n=n;
    v.anak=T.satuan.map((u,i)=>{const h=(n-i)*H,x=(i-(n-1)/2)*W,g=new THREE.Group();g.position.x=x;
      const m=new THREE.Mesh(new THREE.BoxGeometry(W*.98,h,D),mat(WARNA[(i*(n===7?1:1.5))|0]));m.position.y=h/2;g.add(m);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),garis));
      const tx=papan(u,T.kata[i]);v.tekstur.push(tx);const p=new THREE.Mesh(new THREE.PlaneGeometry(W*.78,W*.61),new THREE.MeshBasicMaterial({map:tx,transparent:true}));
      /* papan di bawah pita undakan supaya tidak tertutup tanda faktor */
      p.position.set(0,Math.max(h-H-W*.33,W*.31),D/2+.01);g.add(p);v.tangga.add(g);return{x,h,g,u}});
    /* faktor di tiap undakan */
    v.faktor=[];for(let i=0;i<n-1;i++){const f=T.faktor?T.faktor[i]:10,s=label('×'+f,'#ffffff');s.scale.multiplyScalar(.62);s.position.set(v.anak[i].x+W/2,v.anak[i+1].h+H*.5,D/2+.25);s.material.opacity=.92;v.tangga.add(s);v.faktor.push(s)}
    /* lantai */
    const lantai=new THREE.Mesh(new THREE.CylinderGeometry(n*W*.62,n*W*.62,.3,48),mat('#4aa84f'));lantai.scale.z=.45;lantai.position.y=-.16;v.tangga.add(lantai);
    v.lebar=n*W;v.tinggi=n*H;
    if(v.bot&&v.pos!==undefined)taruh(v,Math.min(v.pos,n-1));
  }
  function taruh(v,i){v.pos=i;const a=v.anak[i];if(!v.bot)return;v.bot.g.position.set(a.x,a.h,.1)}
  function indeks(v,u){return UK.TANGGA[v.besaran].satuan.indexOf(u)}

  function create(el,character,color,o={}){
    const scene=new THREE.Scene();scene.background=null;lampu(scene);
    const camera=new THREE.PerspectiveCamera(30,1,.1,200),tangga=new THREE.Group();scene.add(tangga);
    const bot=RB.buat(ROBOT[character].id);bot.g.scale.setScalar(o.skala||.55);scene.add(bot.g);
    const seru=new THREE.Group(),s1=new THREE.Mesh(new THREE.BoxGeometry(.26,.8,.26),mat('#e8323c'));s1.position.y=.62;seru.add(s1);seru.add(new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),mat('#e8323c')));seru.position.y=3.1;seru.visible=false;bot.g.add(seru);
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.08,32),mat(color||ROBOT[character].warna));alas.position.y=.04;bot.g.add(alas);
    const v={el,scene,camera,tangga,bot,bots:[bot],seru,anim:[],panik:false,skala:o.skala||.55,lompatan:[]};
    bangun(v,o.besaran||'panjang');taruh(v,3);return v}
  /* lompat dari satuan `dari` ke `ke`; nilai ikut berubah di tiap anak tangga (cb dipanggil tiap mendarat) */
  function lompat(v,dari,ke,nilai,cb,selesai){
    const T=UK.TANGGA[v.besaran],a=indeks(v,dari),b=indeks(v,ke);if(a<0||b<0){selesai?.();return}
    taruh(v,a);let x=nilai,t0=.15;const arah=b>a?1:-1;
    for(let i=a;i!==b;i+=arah){const j=i+arah,dari3=new THREE.Vector3(v.anak[i].x,v.anak[i].h,.1),ke3=new THREE.Vector3(v.anak[j].x,v.anak[j].h,.1),f=T.faktor?T.faktor[Math.min(i,j)]:10;
      x=arah>0?UK.geser(x*f/10,1):UK.geser(x/f*10,-1);const nilaiSini=x,undak=v.faktor[Math.min(i,j)];
      const tanda=label((arah>0?'×':':')+f,arah>0?'#ffc93c':'#9fdcff');tanda.visible=false;tanda.position.set(v.anak[Math.min(i,j)].x+v.W/2,Math.max(v.anak[i].h,v.anak[j].h)+1.4,.4);v.scene.add(tanda);v.lompatan.push(tanda);
      v.anim.push({d:.5,t:-t0,f:u=>{const k=mudah(u);v.bot.g.position.lerpVectors(dari3,ke3,k);v.bot.g.position.y+=Math.sin(u*Math.PI)*.9;tanda.visible=true;tanda.scale.set(1.1,.47,1).multiplyScalar(.6+.4*Math.min(1,u*2));undak.material.opacity=1;undak.scale.set(.75,.32,1)},
        akhir:()=>{v.pos=j;cb?.(nilaiSini,T.satuan[j],j)}});
      v.anim.push({d:.9,t:-(t0+.5),f:u=>{tanda.position.y+=.004;tanda.material.opacity=1-u*u},akhir:()=>{v.scene.remove(tanda);tanda.material.map.dispose();undak.scale.set(.62,.27,1);undak.material.opacity=.92}});
      t0+=.62}
    v.anim.push({d:.1,t:-(t0+.1),f:()=>{},akhir:selesai});
  }
  function bingkai(v,t,motion,dekat=1){const b=v.el.getBoundingClientRect();if(b.width<2||b.height<2)return false;
    const asp=b.width/b.height,f=Math.tan(15*Math.PI/180),d=Math.max((v.lebar/2+.6)/(f*asp),(v.tinggi/2+1.4)/f)*dekat,ay=motion?Math.sin(t*.3)*.12:0;
    v.camera.aspect=asp;v.camera.position.set(Math.sin(ay)*d,v.tinggi*.55+d*.3,Math.cos(ay)*d);v.camera.lookAt(0,v.tinggi*.45,0);v.camera.updateProjectionMatrix();return true}
  function update(v,t,dt,motion,panik=false){
    for(const a of v.anim){a.t+=dt;if(a.t>=0&&!a.selesai){const u=Math.min(1,a.t/a.d);a.f(u);if(u>=1){a.selesai=true;a.akhir?.()}}}
    v.anim=v.anim.filter(a=>!a.selesai);
    if(!bingkai(v,t,motion))return;
    v.bot.upd(motion?t:t*.2);v.bot.g.rotation.y=.25+(panik&&motion?Math.sin(t*16)*.12:0);
    const s=v.skala*(panik?1.3:1);v.bot.g.scale.setScalar(v.bot.g.scale.x+(s-v.bot.g.scale.x)*Math.min(1,dt*6));
    v.seru.visible=panik;v.seru.position.y=3.1+(motion?Math.abs(Math.sin(t*8))*.25:0);
    if(panik!==v.panik){v.panik=panik;v.bot.aksi(panik?'panik':'idle')}
  }
  function sibuk(v){return v.anim.length>0}
  /* layar depan: tangga panjang dengan keempat tokoh di anak tangga berbeda */
  function home(el){const v={el,scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(30,1,.1,200),tangga:new THREE.Group(),anim:[],home:true};
    v.scene.background=null;lampu(v.scene);v.scene.add(v.tangga);bangun(v,'panjang');
    v.bots=ROBOT.map((r,i)=>{const b=RB.buat(r.id),a=v.anak[[1,3,4,6][i]];b.g.scale.setScalar(.62);b.g.position.set(a.x,a.h,.1);v.scene.add(b.g);return b});return v}
  function updateHome(v,t,motion){if(!bingkai(v,t,motion,.92))return;v.bots.forEach((r,i)=>{r.upd(motion?t:t*.2);r.g.rotation.y=.2+Math.sin(t*.6+i)*.25;
    /* sesekali tokoh melompat di tempat */
    const k=(t*.5+i*.7)%4;r.g.position.y=v.anak[[1,3,4,6][i]].h+(motion&&k<.5?Math.sin(k/.5*Math.PI)*.5:0)})}
  return{create,bangun,taruh,lompat,update,sibuk,home,updateHome,WARNA};
})();
