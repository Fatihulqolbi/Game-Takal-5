/* =========================================================
   3D (three.js)
   ========================================================= */
const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setScissorTest(true);renderer.autoClear=false;
const geoS=new THREE.SphereGeometry(1,22,16);
const matCache={};const lam=c=>matCache[c]||(matCache[c]=new THREE.MeshLambertMaterial({color:c}));
function ball(r,c,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geoS,lam(c));m.scale.set(r*sx,r*sy,r*sz);m.position.set(x,y,z);return m}
function cyl(rt,rb,h,c,seg=12){return new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),lam(c))}
function cone(r,h,c,seg=12){return new THREE.Mesh(new THREE.ConeGeometry(r,h,seg),lam(c))}

const CHARS=[
  {id:'kucing',name:'Miko',kind:'Kucing Oren',color:'#ff9f43',belly:'#ffe3c2',dark:'#e07b1f'},
  {id:'kelinci',name:'Pipi',kind:'Kelinci',color:'#fbf3ee',belly:'#ffd6e2',dark:'#f3b6c8'},
  {id:'panda',name:'Bubu',kind:'Panda',color:'#ffffff',belly:'#f3f3f3',dark:'#2a2a35'},
  {id:'katak',name:'Kiko',kind:'Katak',color:'#7ed957',belly:'#e4f7c8',dark:'#4fa83a'}
];
const arcGeo=new THREE.TorusGeometry(.085,.03,8,16,Math.PI);
function happyEye(x,y,z){const m=new THREE.Mesh(arcGeo,lam('#1e2a4a'));m.position.set(x,y,z);return m}
function makeChar(def,opt={}){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const limb=def.id==='panda'?def.dark:def.color;
  inner.add(ball(.8,def.color,0,.95,0,1,1.05,.9));
  inner.add(ball(.55,def.belly,0,.88,.4,1,1.05,.55));
  const head=new THREE.Group();head.position.y=2.05;inner.add(head);
  head.add(ball(.78,def.color,0,0,0,1.05,.95,1));
  for(const s of[-1,1]){
    if(def.id!=='katak'){
      if(def.id==='panda')head.add(ball(.21,def.dark,s*.28,.04,.6,1,1.25,.6));
      if(opt.happy)head.add(happyEye(s*.27,.03,def.id==='panda'?.79:.74));
      else{head.add(ball(.12,def.id==='panda'?'#ffffff':'#1e2a4a',s*.27,.06,.7));
      head.add(ball(.07,'#1e2a4a',s*.27,.06,.79));
      head.add(ball(.035,'#ffffff',s*.27+.035,.1,.84))}
    }else{
      head.add(ball(.27,def.color,s*.33,.55,.22));head.add(ball(.19,'#ffffff',s*.33,.6,.38));
      if(opt.happy)head.add(happyEye(s*.33,.58,.57));
      else{head.add(ball(.1,'#1e2a4a',s*.33,.62,.53));head.add(ball(.035,'#ffffff',s*.33+.03,.66,.61))}
    }
    head.add(ball(.12,'#ff8fab',s*.48,-.17,.6,1,.6,.5));
    if(def.id==='kucing'){const e=cone(.26,.5,def.color,4);e.position.set(s*.45,.65,0);e.rotation.z=-s*.35;head.add(e);
      const ei=cone(.14,.3,'#ffb3c7',4);ei.position.set(s*.43,.62,.12);ei.rotation.z=-s*.35;head.add(ei)}
    if(def.id==='kelinci'){const e=ball(.18,def.color,s*.28,.95,-.05,1,3.2,.7);e.rotation.z=-s*.12;head.add(e);
      const ei=ball(.1,'#ffb3c7',s*.28,.95,.06,1,2.6,.4);ei.rotation.z=-s*.12;head.add(ei)}
    if(def.id==='panda')head.add(ball(.22,def.dark,s*.52,.58,-.05,1,1,.6));
    inner.add(ball(.3,def.id==='kelinci'?def.color:def.dark,s*.4,.2,.15,1,.6,1.4));
  }
  if(opt.happy){head.add(ball(.13,'#7a2735',0,-.17,.72,1.3,.9,.5));head.add(ball(.07,'#ff7b93',0,-.22,.78,1.3,.6,.4))}
  else head.add(ball(.07,'#1e2a4a',0,-.12,.76,1.4,.8,.6));
  if(def.id==='kucing'){const t=ball(.14,def.color,0,.55,-.9,1,1,2.4);t.rotation.x=.7;inner.add(t)}
  if(def.id==='kelinci')inner.add(ball(.22,'#ffffff',0,.55,-.78));
  const armL=new THREE.Group();armL.position.set(-.82,1.1,.1);inner.add(armL);armL.add(ball(.22,limb,0,0,0));
  const arm=new THREE.Group();arm.position.set(.82,1.1,.1);inner.add(arm);arm.add(ball(.22,limb,0,0,0));
  const pen=new THREE.Group();pen.rotation.x=-.35;arm.add(pen);
  const body=cyl(.11,.11,1.3,'#ffd23f',6);body.position.y=.7;pen.add(body);
  const tip=cone(.11,.32,'#f6d7a7',6);tip.position.y=1.51;pen.add(tip);
  const lead=cone(.04,.11,'#1e2a4a',6);lead.position.y=1.63;pen.add(lead);
  const band=cyl(.12,.12,.1,'#b8c2cc',6);band.position.y=.03;pen.add(band);
  const er=cyl(.11,.11,.22,'#ff8fab',10);er.position.y=-.12;pen.add(er);
  g.userData={inner,head,arm,armL,pen,limb};
  return g;
}
const SLIME=['#9b6bff','#3fc1c9','#ff6f91','#ffa94d'];
function makeSlime(){
  const c=pick(SLIME),g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  inner.add(ball(.9,c,0,.62,0,1,.72,1));
  inner.add(ball(.16,'#ffffff',-.38,1.0,.5,1,.6,.5));
  for(const s of[-1,1]){inner.add(ball(.2,'#ffffff',s*.3,.82,.72));inner.add(ball(.1,'#1e2a4a',s*.3,.8,.89));
    const b=new THREE.Mesh(new THREE.BoxGeometry(.32,.07,.07),lam('#1e2a4a'));b.position.set(s*.3,1.07,.78);b.rotation.z=s*.35;inner.add(b)}
  g.userData={inner,appear:0};return g;
}
function lights(scene){scene.add(new THREE.HemisphereLight('#ffffff','#6f9f5a',.9));const sun=new THREE.DirectionalLight('#fff3d6',.75);sun.position.set(5,10,7);scene.add(sun)}
function makeArena(){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#9fdcff');scene.fog=new THREE.Fog('#9fdcff',20,44);lights(scene);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(50,40),lam('#86d36f'));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;scene.add(ground);
  const disc=cyl(9,9.4,.4,'#f3d9a4',40);disc.position.y=-.2;scene.add(disc);
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2,p=cyl(.16,.16,.9,i%2?'#ffffff':'#e8323c',8);p.position.set(Math.cos(a)*9.2,.45,Math.sin(a)*9.2);scene.add(p)}
  for(let i=0;i<14;i++){const a=Math.PI+(-0.2+Math.random()*1.4)*Math.PI*.5*(i%2?1:-1)+Math.PI/2*0,r=13+Math.random()*9;
    const x=Math.cos(a)*r*(i%2?1:-1),z=-Math.abs(Math.sin(a)*r)-4;const t=new THREE.Group();
    const tr=cyl(.25,.35,1.6,'#9a6a3c',8);tr.position.y=.8;t.add(tr);t.add(ball(1.3,pick(['#4fae4c','#5cbf5a','#3f9c48']),0,2.4,0));t.position.set(x,0,z);scene.add(t)}
  for(const x of[-6,6]){const pole=cyl(.08,.08,4.5,'#d9d9d9',8);pole.position.set(x,2.25,-8);scene.add(pole);
    const top=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,.05),lam('#e8323c'));top.position.set(x+.95,4.1,-8);scene.add(top);
    const bot=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,.05),lam('#ffffff'));bot.position.set(x+.95,3.6,-8);scene.add(bot)}
  for(let i=0;i<4;i++){const cl=new THREE.Group();for(let j=0;j<4;j++)cl.add(ball(1+Math.random()*.6,'#ffffff',j*1.1,Math.random()*.4,0));cl.position.set(-16+i*10,10+Math.random()*3,-25);scene.add(cl)}
  const parts=[];const pg=new THREE.BoxGeometry(.2,.2,.2);
  for(let i=0;i<30;i++){const m=new THREE.Mesh(pg,lam(['#e8323c','#ffffff','#ffc93c','#2f7bea'][i%4]));m.visible=false;m.userData={v:new THREE.Vector3(),life:0};scene.add(m);parts.push(m)}
  return{scene,parts};
}
function burst(parts,pos){for(const m of parts){m.position.copy(pos);m.position.y+=.8;m.userData.v.set((Math.random()-.5)*8,4+Math.random()*6,(Math.random()-.5)*8);m.userData.life=1.1+Math.random()*.5;m.visible=true}}
