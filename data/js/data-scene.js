/* PENYAJIAN DATA · adegan 3D (dipakai menu Bab 4 dan arena lomba).
   Memakai renderer bersama MenaraScene (satu kanvas, digambar per tampilan dengan scissor).
   Arena: tokoh berdiri di panggung, di sebelahnya diagram batang 3D dari data soal yang sedang dikerjakan.
   Menu: diagram batang 3D besar, keempat tokoh berdiri di atas batang-batangnya. */
const DataScene=(()=>{
  const INK='#1e2a4a',bahan=new Map(),mat=c=>{if(!bahan.has(c))bahan.set(c,new THREE.MeshLambertMaterial({color:c}));return bahan.get(c)};
  const garis=new THREE.LineBasicMaterial({color:INK}),kubus=new THREE.BoxGeometry(1,1,1),tepiKubus=new THREE.EdgesGeometry(kubus);
  const WARNA=['#ff6b6b','#ffb74d','#ffd54f','#81c784','#4fc3f7','#9575cd'];
  function lampu(scene){scene.add(new THREE.HemisphereLight('#fff9ee','#7d8fa5',.95));const s=new THREE.DirectionalLight('#fff0d4',.5);s.position.set(-4,9,8);scene.add(s)}
  function batang(warna){const m=new THREE.Mesh(kubus,mat(warna));m.add(new THREE.LineSegments(tepiKubus,garis));return m}
  function alasDiagram(scene,lebar,x){const a=new THREE.Mesh(kubus,mat('#fff8e8'));a.scale.set(lebar,.14,1.5);a.position.set(x,-.07,0);a.add(new THREE.LineSegments(tepiKubus,garis));scene.add(a);
    const sumbu=new THREE.Mesh(kubus,mat(INK));sumbu.scale.set(.08,3.2,.08);sumbu.position.set(x-lebar/2+.1,1.6,-.6);scene.add(sumbu)}
  function create(el,character,color){
    const scene=new THREE.Scene();scene.background=null;lampu(scene);
    const camera=new THREE.PerspectiveCamera(30,1,.1,200);
    const lantai=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,.3,48),mat('#4aa84f'));lantai.scale.z=.42;lantai.position.y=-.3;scene.add(lantai);
    alasDiagram(scene,4,1.1);
    const bot=RB.buat(ROBOT[character].id);bot.g.position.set(-2.2,0,.4);bot.g.scale.setScalar(.62);scene.add(bot.g);
    const alas=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.08,32),mat(color||ROBOT[character].warna));alas.position.y=.04;bot.g.add(alas);
    const seru=new THREE.Group(),s1=new THREE.Mesh(new THREE.BoxGeometry(.26,.8,.26),mat('#e8323c'));s1.position.y=.62;seru.add(s1);seru.add(new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),mat('#e8323c')));seru.position.y=3.1;seru.visible=false;bot.g.add(seru);
    const v={el,scene,camera,bot,bots:[bot],seru,batang:[],tinggi:[],panik:false,skala:.62};
    setData(v,[3,5,2,4],6);return v}
  /* tinggi batang 3D mengikuti data (maks = puncak sumbu) */
  function setData(v,nilai,maks){const n=nilai.length,lebar=3.6,slot=lebar/n;
    if(v.batang.length!==n){v.batang.forEach(b=>v.scene.remove(b));v.batang=nilai.map((_,i)=>{const b=batang(WARNA[i%6]);b.scale.set(slot*.6,.001,.7);b.position.set(1.1-lebar/2+slot*(i+.5),0,0);v.scene.add(b);return b})}
    v.tinggi=nilai.map(x=>Math.max(.001,3*(x||0)/Math.max(1,maks)))}
  function bingkai(v,t,motion){const b=v.el.getBoundingClientRect();if(b.width<2||b.height<2)return false;
    const asp=b.width/b.height,f=Math.tan(15*Math.PI/180),d=Math.max(3.8/(f*asp),2.6/f),ay=motion?Math.sin(t*.3)*.14:0;
    v.camera.aspect=asp;v.camera.position.set(Math.sin(ay)*d,1.6+d*.25,Math.cos(ay)*d);v.camera.lookAt(0,1.45,0);v.camera.updateProjectionMatrix();return true}
  function update(v,t,dt,motion,panik=false){
    v.batang.forEach((b,i)=>{const h=v.tinggi[i]||.001;b.scale.y+=(h-b.scale.y)*Math.min(1,dt*(motion?5:30));b.position.y=b.scale.y/2});
    if(!bingkai(v,t,motion))return;
    v.bot.upd(motion?t:t*.2);v.bot.g.rotation.y=.35+(panik&&motion?Math.sin(t*16)*.12:0);
    const s=v.skala*(panik?1.25:1);v.bot.g.scale.setScalar(v.bot.g.scale.x+(s-v.bot.g.scale.x)*Math.min(1,dt*6));
    v.seru.visible=panik;v.seru.position.y=3.1+(motion?Math.abs(Math.sin(t*8))*.25:0);
    if(panik!==v.panik){v.panik=panik;v.bot.aksi(panik?'panik':'idle')}}
  /* menu: diagram batang besar, tokoh berdiri di atas batang ke-1..4 */
  const TINGGI=[1.6,2.9,2.1,3.6,2.5];
  function home(el){const scene=new THREE.Scene();scene.background=null;lampu(scene);
    const lantai=new THREE.Mesh(new THREE.CylinderGeometry(7,7,.3,48),mat('#4aa84f'));lantai.scale.z=.4;lantai.position.y=-.3;scene.add(lantai);
    alasDiagram(scene,9.6,0);
    const bars=TINGGI.map((h,i)=>{const b=batang(WARNA[i]);b.scale.set(1.15,h,1);b.position.set((i-2)*1.8,h/2,0);scene.add(b);return b});
    /* tokoh ke-i berdiri di batang [0,1,3,4] supaya batang tengah tetap terlihat */
    const tempat=[0,1,3,4],bots=ROBOT.map((r,i)=>{const b=RB.buat(r.id);b.g.scale.setScalar(.6);b.g.position.set((tempat[i]-2)*1.8,TINGGI[tempat[i]],.1);scene.add(b.g);return b});
    return{el,scene,camera:new THREE.PerspectiveCamera(30,1,.1,200),bars,bots,tempat,home:true}}
  function updateHome(v,t,motion){const b=v.el.getBoundingClientRect();if(b.width<2||b.height<2)return;
    const asp=b.width/b.height,f=Math.tan(15*Math.PI/180),d=Math.max(5.6/(f*asp),3.3/f)*.95,ay=motion?Math.sin(t*.3)*.12:0;
    v.camera.aspect=asp;v.camera.position.set(Math.sin(ay)*d,2.2+d*.3,Math.cos(ay)*d);v.camera.lookAt(0,2.1,0);v.camera.updateProjectionMatrix();
    /* batang naik-turun pelan seperti data yang terus berubah, tokoh ikut di atasnya */
    v.bars.forEach((m,i)=>{const h=TINGGI[i]*(1+(motion?.12*Math.sin(t*.9+i*1.4):0));m.scale.y=h;m.position.y=h/2});
    v.bots.forEach((r,i)=>{r.upd(motion?t:t*.2);r.g.rotation.y=.2+Math.sin(t*.6+i)*.25;const k=(t*.5+i*.7)%4;r.g.position.y=v.bars[v.tempat[i]].scale.y+(motion&&k<.5?Math.sin(k/.5*Math.PI)*.5:0)})}
  return{create,setData,update,home,updateHome};
})();
