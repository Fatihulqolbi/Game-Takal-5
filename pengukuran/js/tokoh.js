/* =========================================================
   PENGUKURAN · empat tokoh 3D original (geometri prosedural three.js)
   Meto  : meteran gulung  -> PANJANG (km–mm)
   Lita  : gelas ukur      -> VOLUME  (kl–ml)
   Grama : anak timbangan  -> BERAT   (kg–mg)
   Tiko  : jam weker       -> WAKTU
   Bentuk data sama dengan robot DIMENSIA (ROBOT + RB.buat), jadi layar pilih tokoh,
   robot komandan, dan podium juara dari MenaraScene bisa dipakai ulang apa adanya.
   ========================================================= */
const ROBOT=[
  {id:'meto',nama:'Meto',julukan:'Si Meteran Lincah',peran:'Ahli panjang: km sampai mm',warna:'#FFC93C',besaran:'panjang',kata:'Panjang apa pun bisa kuukur. Turun tangga dikali 10!'},
  {id:'lita',nama:'Lita',julukan:'Si Gelas Ukur',peran:'Ahli volume: kl sampai ml',warna:'#4FC3F7',besaran:'volume',kata:'1 liter itu 1.000 ml. Byur!'},
  {id:'grama',nama:'Grama',julukan:'Si Anak Timbangan',peran:'Ahli berat: kg sampai mg',warna:'#FF8A65',besaran:'berat',kata:'1 kg = 1.000 g. Aku kuat mengangkatnya!'},
  {id:'tiko',nama:'Tiko',julukan:'Si Jam Weker',peran:'Ahli waktu: minggu sampai detik',warna:'#7ED957',besaran:'waktu',kata:'Tik tok! 1 jam = 60 menit, 1 menit = 60 detik.'}
];
const RB=(()=>{
const mc={};
const lam=(c,o)=>{const k=c+JSON.stringify(o||{});return mc[k]||(mc[k]=new THREE.MeshLambertMaterial({color:c,...o}))};
const pijar=c=>mc['p'+c]||(mc['p'+c]=new THREE.MeshBasicMaterial({color:c}));
const sph=new THREE.SphereGeometry(1,24,16);
function taruh(p,m,x,y,z){m.position.set(x,y,z);p.add(m);return m}
function bola(p,mat,r,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(sph,mat);m.scale.set(r*sx,r*sy,r*sz);return taruh(p,m,x,y,z)}
function tabung(p,mat,rt,rb,h,seg,x,y,z,o){return taruh(p,new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg,1,!!o),mat),x,y,z)}
function kotak(p,mat,w,h,d,x,y,z){return taruh(p,new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat),x,y,z)}
/* mata kartun: putih + pupil gelap (ikut membesar/berkedip lewat userData.s) */
function mata(p,x,y,z,r){const e=new THREE.Group();e.position.set(x,y,z);p.add(e);
  bola(e,pijar('#ffffff'),r,0,0,0,1,1.2,.5);bola(e,pijar('#252A59'),r*.55,0,-r*.1,r*.35,1,1.2,.4);bola(e,pijar('#ffffff'),r*.2,r*.22,r*.3,r*.55);
  e.userData.s=new THREE.Vector3(1,1,1);return e}
function senyum(p,y,z,r=.1){const s=taruh(p,new THREE.Mesh(new THREE.TorusGeometry(r,.026,8,14,Math.PI),pijar('#252A59')),0,y,z);s.rotation.z=Math.PI;return s}
function sepatu(p,c,x,y){return bola(p,lam(c),.18,x,y,.06,1,.7,1.35)}
function teksTekstur(teks,bg,fg,w=256,h=128,ukuran=78){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);
  x.fillStyle=fg;x.font=`800 ${ukuran}px "Baloo 2","Nunito",sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(teks,w/2,h/2+6);return new THREE.CanvasTexture(c)}

const BUAT={
/* METO: kotak meteran kuning dengan pita yang keluar-masuk */
meto(c){
  const badan=tabung(c,lam('#FFC93C'),.7,.7,.72,36,0,0,0);badan.rotation.x=Math.PI/2;
  const pinggir=tabung(c,lam('#E0A100'),.72,.72,.12,36,0,0,-.33);pinggir.rotation.x=Math.PI/2;
  const layar=tabung(c,lam('#252A59'),.46,.46,.05,32,0,.05,.37);layar.rotation.x=Math.PI/2;
  const eyes=[mata(c,-.17,.1,.42,.12),mata(c,.17,.1,.42,.12)];senyum(c,-.16,.42,.09);
  kotak(c,lam('#e8323c'),.3,.16,.3,0,.76,0);/* tombol pengunci */
  /* pita ukur: keluar dari kanan bawah, ada garis skala */
  const pita=new THREE.Group();pita.position.set(.62,-.48,.12);c.add(pita);
  const isiPita=new THREE.Group();pita.add(isiPita);
  kotak(isiPita,lam('#FFF3B0'),1,.16,.04,.5,0,0);for(let i=0;i<10;i++)kotak(isiPita,pijar('#1e2a4a'),.02,i%5?.06:.1,.05,.08+i*.1,.04,0);
  const kait=kotak(pita,lam('#9aa6b8'),.06,.26,.12,1,.04,0);
  const tangan=[bola(c,lam('#E0A100'),.15,-.88,-.12,.1),bola(c,lam('#E0A100'),.15,.86,.16,.1)];
  const kaki=[tabung(c,lam('#252A59'),.07,.07,.32,10,-.26,-.82,0),tabung(c,lam('#252A59'),.07,.07,.32,10,.26,-.82,0)];
  sepatu(c,'#e8323c',-.26,-1.02);sepatu(c,'#e8323c',.26,-1.02);void kaki;
  return{pivot:1.5,eyes,tick(t,s,k){
    const panjang=s==='senang'||s==='sapa'?1+1.2*Math.abs(Math.sin(k*4)):.55+.25*Math.sin(t*1.7);
    isiPita.scale.x=panjang;kait.position.x=panjang;
    tangan.forEach((h,i)=>{h.position.y=(i?.16:-.12)+Math.sin(t*2.4+i*2)*.07+(s==='senang'||s==='sapa'?.5*Math.abs(Math.sin(k*5+i)):0)});
    pita.rotation.z=s==='bingung'?-.5:0}};
},
/* LITA: gelas ukur bening berisi air yang bergoyang */
lita(c){
  const kaca=lam('#dff4ff',{transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false});
  tabung(c,kaca,.62,.56,1.5,28,0,0,0,true);tabung(c,kaca,.56,.56,.04,28,0,-.74,0);
  const bibir=new THREE.Mesh(new THREE.TorusGeometry(.62,.035,8,36),lam('#9fdcff'));bibir.rotation.x=Math.PI/2;taruh(c,bibir,0,.75,0);
  const corot=taruh(c,new THREE.Mesh(new THREE.ConeGeometry(.12,.26,12,1,true),kaca),-.64,.74,0);corot.rotation.z=Math.PI/2;
  const gagang=new THREE.Mesh(new THREE.TorusGeometry(.32,.07,10,20,Math.PI),lam('#4FC3F7'));gagang.rotation.z=-Math.PI/2;taruh(c,gagang,.6,.05,0);
  const air=new THREE.Group();c.add(air);
  const isiAir=tabung(air,lam('#4FC3F7',{transparent:true,opacity:.85}),.56,.53,1,28,0,0,0);
  const muka=tabung(air,lam('#7fd6ff'),.57,.57,.02,28,0,0,0);
  for(let i=0;i<5;i++)kotak(c,pijar('#1565d8'),i%2?.12:.2,.025,.02,-.32,-.55+i*.26,.55);
  const eyes=[mata(c,-.17,-.02,.6,.12),mata(c,.17,-.02,.6,.12)];senyum(c,-.24,.58,.08);
  const pipi=[bola(c,pijar('#FF8C92'),.07,-.33,-.17,.55,1,.7,.4),bola(c,pijar('#FF8C92'),.07,.33,-.17,.55,1,.7,.4)];void pipi;
  sepatu(c,'#1565d8',-.26,-.96);sepatu(c,'#1565d8',.26,-.96);
  const tangan=[bola(c,lam('#1565d8'),.14,-.84,-.1,.1),bola(c,lam('#1565d8'),.14,.98,-.25,.1)];
  return{pivot:1.42,eyes,tick(t,s,k){
    const tinggi=s==='senang'?.9:s==='bingung'?.45:.62+.06*Math.sin(t*1.3);
    isiAir.scale.y=tinggi;isiAir.position.y=-.72+tinggi/2;muka.position.y=-.72+tinggi;
    const goyang=(s==='sapa'||s==='senang'?.22:.07)*Math.sin(t*(s==='sapa'?9:3));muka.rotation.z=goyang;muka.rotation.x=goyang*.6;
    tangan.forEach((h,i)=>{h.position.y=-.1-i*.15+Math.sin(t*2.6+i*2)*.06+(s==='senang'||s==='sapa'?.5*Math.abs(Math.sin(k*5+i)):0)})}};
},
/* GRAMA: anak timbangan tembaga bertuliskan 1 kg, suka mengangkat lengan */
grama(c){
  tabung(c,lam('#FF8A65'),.5,.76,1.05,32,0,-.12,0);tabung(c,lam('#E8653F'),.78,.8,.12,32,0,-.66,0);
  tabung(c,lam('#E8653F'),.2,.26,.2,20,0,.5,0);bola(c,lam('#FF8A65'),.27,0,.72,0);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(.62,.3),new THREE.MeshBasicMaterial({map:teksTekstur('1 kg','#fff3e0','#1e2a4a')}));taruh(c,label,0,-.36,.74);label.rotation.x=-.24;
  const eyes=[mata(c,-.17,.05,.6,.12),mata(c,.17,.05,.6,.12)];senyum(c,-.12,.58,.07);
  const alis=[kotak(c,pijar('#252A59'),.16,.035,.03,-.17,.25,.6),kotak(c,pijar('#252A59'),.16,.035,.03,.17,.25,.6)];
  const lengan=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.64,-.05,0);c.add(g);
    const l=tabung(g,lam('#E8653F'),.07,.07,.42,10,s*.16,.1,0);l.rotation.z=-s*.9;bola(g,lam('#FFB38F'),.14,s*.34,.26,0);
    /* barbel kecil di tangan kanan */
    if(s>0){kotak(g,lam('#252A59'),.42,.05,.05,s*.34,.26,.0);bola(g,lam('#252A59'),.1,s*.34-.2,.26,0);bola(g,lam('#252A59'),.1,s*.34+.2,.26,0)}
    return g});
  sepatu(c,'#252A59',-.3,-.86);sepatu(c,'#252A59',.3,-.86);
  return{pivot:1.42,eyes,tick(t,s,k){
    const angkat=s==='senang'||s==='sapa'?1.3*Math.abs(Math.sin(k*4)):.25+.25*Math.sin(t*1.8);
    lengan[0].rotation.z=-angkat;lengan[1].rotation.z=angkat;
    const a=s==='bingung'?.35:0;alis[0].rotation.z=a;alis[1].rotation.z=-a;c.scale.y=1+(s==='idle'?.03*Math.sin(t*3.2):0)}};
},
/* TIKO: jam weker hijau dengan dua lonceng dan jarum yang berputar */
tiko(c){
  const badan=tabung(c,lam('#7ED957'),.72,.72,.5,40,0,0,0);badan.rotation.x=Math.PI/2;
  const muka=tabung(c,lam('#fffdf6'),.58,.58,.06,40,0,0,.25);muka.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;kotak(c,pijar('#1e2a4a'),.03,i%3?.07:.12,.02,Math.sin(a)*.5,Math.cos(a)*.5,.29).rotation.z=-a}
  const jarumJam=new THREE.Group(),jarumMenit=new THREE.Group();jarumJam.position.set(0,0,.3);jarumMenit.position.set(0,0,.31);c.add(jarumJam,jarumMenit);
  kotak(jarumJam,pijar('#1e2a4a'),.05,.26,.02,0,.13,0);kotak(jarumMenit,pijar('#e8323c'),.035,.4,.02,0,.2,0);bola(c,pijar('#1e2a4a'),.05,0,0,.33);
  const eyes=[mata(c,-.2,.24,.33,.1),mata(c,.2,.24,.33,.1)];senyum(c,-.27,.32,.07);
  const lonceng=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.42,.68,0);g.rotation.z=-s*.5;c.add(g);
    taruh(g,new THREE.Mesh(new THREE.SphereGeometry(.26,20,12,0,Math.PI*2,0,Math.PI/2),lam('#FFC93C')),0,0,0);tabung(g,lam('#FFC93C'),.26,.26,.03,20,0,0,0);bola(g,lam('#E0A100'),.06,0,.27,0);return g});
  const palu=kotak(c,lam('#9aa6b8'),.05,.26,.05,0,.82,0);
  const kaki=[-1,1].map(s=>{const k=tabung(c,lam('#4FA83A'),.06,.06,.36,10,s*.38,-.78,0);k.rotation.z=s*.35;return k});void kaki;
  sepatu(c,'#252A59',-.48,-.96);sepatu(c,'#252A59',.48,-.96);
  const tangan=[bola(c,lam('#4FA83A'),.14,-.9,-.05,.05),bola(c,lam('#4FA83A'),.14,.9,-.05,.05)];
  return{pivot:1.5,eyes,tick(t,s,k){
    const cepat=s==='sapa'||s==='senang'?8:1;jarumMenit.rotation.z=-t*cepat*.9;jarumJam.rotation.z=-t*cepat*.075;
    const dering=s==='sapa'||s==='senang';palu.rotation.z=dering?Math.sin(k*40)*.6:0;lonceng.forEach((g,i)=>{g.position.y=.68+(dering?Math.abs(Math.sin(k*30+i))*.04:0)});
    tangan.forEach((h,i)=>{h.position.y=-.05+Math.sin(t*2.4+i*2)*.07+(dering?.5*Math.abs(Math.sin(k*5+i)):0)})}};
}
};

function buat(id){
  const g=new THREE.Group(),poros=new THREE.Group(),isi=new THREE.Group();g.add(poros);poros.add(isi);
  const P=BUAT[id](isi);poros.position.y=P.pivot;
  const mulut={meto:[-.18,.43],lita:[-.26,.6],grama:[-.14,.6],tiko:[-.3,.33]}[id];
  const panicMouth=taruh(isi,new THREE.Mesh(new THREE.TorusGeometry(.072,.024,8,16),pijar('#FF8C92')),0,mulut[0],mulut[1]+.02);
  panicMouth.scale.y=1.35;panicMouth.visible=false;
  const sweat=bola(isi,pijar('#75DDFF'),.085,.6,.35,mulut[1],1,1.8,.6);sweat.visible=false;
  const fase=ROBOT.findIndex(r=>r.id===id)*1.7;
  const o={id,g,st:'idle',t:0,t0:0,
    aksi(n){o.st=n;o.t0=o.t},
    upd(t){
      o.t=t;const k=t-o.t0;let es=1,y=Math.sin(t*2+fase)*.07;
      poros.rotation.set(0,0,0);
      panicMouth.visible=sweat.visible=o.st==='panik';
      if(o.st==='senang'){if(k>1.2)o.st='idle';else{const u=k/1.2;y+=Math.sin(u*Math.PI)*.55;poros.rotation.y=u*Math.PI*2;es=1.15}}
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
