/* =========================================================
   PENYAJIAN DATA · empat tokoh 3D original (geometri prosedural three.js)
   Bato : tiga batang berdiri      -> DIAGRAM BATANG
   Piko : ubin ikon bertanda ×4    -> PIKTOGRAM
   Tabi : papan tabel berjepit     -> TABEL
   Turi : empat garis + satu miring -> TURUS
   Bentuk data sama dengan robot DIMENSIA dan tokoh Pengukuran (ROBOT + RB.buat), jadi layar pilih tokoh
   dan podium juara dari MenaraScene bisa dipakai ulang apa adanya.
   ========================================================= */
const ROBOT=[
  {id:'bato',nama:'Bato',julukan:'Si Diagram Batang',peran:'Ahli diagram batang',warna:'#FF6B6B',sajian:'batang',kata:'Tinggi batangku sama dengan banyak datanya!'},
  {id:'piko',nama:'Piko',julukan:'Si Piktogram',peran:'Ahli piktogram',warna:'#FF8CC6',sajian:'piktogram',kata:'Satu ikonku bisa bernilai 4. Baca keterangannya dulu!'},
  {id:'tabi',nama:'Tabi',julukan:'Si Tabel Rapi',peran:'Ahli tabel',warna:'#3CC8B4',sajian:'tabel',kata:'Semua data rapi di baris dan kolomku.'},
  {id:'turi',nama:'Turi',julukan:'Si Turus',peran:'Ahli turus',warna:'#9B7BFF',sajian:'turus',kata:'Empat garis tegak, lalu satu garis miring. Itu lima!'}
];
const RB=(()=>{
const mc={},INK='#1e2a4a';
const lam=(c,o)=>{const k=c+JSON.stringify(o||{});return mc[k]||(mc[k]=new THREE.MeshLambertMaterial({color:c,...o}))};
const pijar=c=>mc['p'+c]||(mc['p'+c]=new THREE.MeshBasicMaterial({color:c}));
const tepi=new THREE.LineBasicMaterial({color:INK});
const sph=new THREE.SphereGeometry(1,24,16);
function taruh(p,m,x,y,z){m.position.set(x,y,z);p.add(m);return m}
function bola(p,mat,r,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(sph,mat);m.scale.set(r*sx,r*sy,r*sz);return taruh(p,m,x,y,z)}
function tabung(p,mat,rt,rb,h,seg,x,y,z){return taruh(p,new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat),x,y,z)}
function kotak(p,mat,w,h,d,x,y,z,garis){const m=taruh(p,new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat),x,y,z);if(garis)m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),tepi));return m}
/* mata kartun: putih + pupil gelap (ikut membesar/berkedip lewat userData.s) */
function mata(p,x,y,z,r){const e=new THREE.Group();e.position.set(x,y,z);p.add(e);
  bola(e,pijar('#ffffff'),r,0,0,0,1,1.2,.5);bola(e,pijar('#252A59'),r*.55,0,-r*.1,r*.35,1,1.2,.4);bola(e,pijar('#ffffff'),r*.2,r*.22,r*.3,r*.55);
  e.userData.s=new THREE.Vector3(1,1,1);return e}
function senyum(p,y,z,r=.1){const s=taruh(p,new THREE.Mesh(new THREE.TorusGeometry(r,.026,8,14,Math.PI),pijar('#252A59')),0,y,z);s.rotation.z=Math.PI;return s}
function sepatu(p,c,x,y){return bola(p,lam(c),.18,x,y,.06,1,.7,1.35)}
function teksTekstur(teks,bg,fg,w=256,h=160,ukuran=96){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.beginPath();x.arc(w/2,h/2,h/2-4,0,Math.PI*2);x.rect(h/2,4,w-h,h-8);x.arc(w-h/2,h/2,h/2-4,0,Math.PI*2);x.fill();
  x.fillStyle=fg;x.font=`800 ${ukuran}px "Baloo 2","Nunito",sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(teks,w/2,h/2+6);return new THREE.CanvasTexture(c)}
const kaki=(c,warna,x,atas,bawah)=>tabung(c,lam(warna),.065,.065,atas-bawah,10,x,(atas+bawah)/2,0);

const BUAT={
/* BATO: tiga batang diagram (merah, kuning, biru) yang naik-turun seperti data yang berubah */
bato(c){
  const warna=['#ff6b6b','#ffd54f','#4fc3f7'],tinggi=[.95,1.5,1.15],batang=tinggi.map((h,i)=>({m:kotak(c,lam(warna[i]),.44,1,.52,(i-1)*.46,0,0,true),h}));
  kotak(c,lam(INK),1.62,.08,.66,0,-.86,0);
  const eyes=[mata(c,-.1,.4,.28,.085),mata(c,.1,.4,.28,.085)];senyum(c,.25,.28,.06);
  const tangan=[bola(c,lam('#e04848'),.13,-.86,-.2,.06),bola(c,lam('#2f9be0'),.13,.86,-.1,.06)];
  kaki(c,INK,-.3,-.86,-1.0);kaki(c,INK,.3,-.86,-1.0);sepatu(c,'#ffc93c',-.3,-1.03);sepatu(c,'#ffc93c',.3,-1.03);
  return{pivot:1.5,eyes,tick(t,s,k){const seru=s==='senang'||s==='sapa';
    batang.forEach((b,i)=>{const sk=1+(seru?.35*Math.abs(Math.sin(k*5+i*1.3)):.08*Math.sin(t*2.4+i*1.7));b.m.scale.y=b.h*sk;b.m.position.y=-.82+b.h*sk/2});
    tangan.forEach((h,i)=>{h.position.y=(i?-.1:-.2)+Math.sin(t*2.6+i*2)*.07+(seru?.5*Math.abs(Math.sin(k*5+i)):0)})}};
},
/* PIKO: ubin ikon merah muda berwajah, tanda ×4 di pojok (1 ikon bernilai 4) */
piko(c){
  kotak(c,lam('#FF8CC6'),1.3,1.3,.34,0,0,0,true);
  const muka=tabung(c,lam('#ffffff'),.5,.5,.06,32,0,0,.18);muka.rotation.x=Math.PI/2;
  const eyes=[mata(c,-.17,.08,.24,.1),mata(c,.17,.08,.24,.1)];senyum(c,-.12,.24,.08);
  const tag=taruh(c,new THREE.Mesh(new THREE.PlaneGeometry(.56,.35),new THREE.MeshBasicMaterial({map:teksTekstur('×4','#ffc93c',INK),transparent:true})),.5,.66,.2);
  const tangan=[bola(c,lam('#e0609f'),.14,-.8,-.12,.06),bola(c,lam('#e0609f'),.14,.8,-.12,.06)];
  kaki(c,'#252A59',-.28,-.64,-.95);kaki(c,'#252A59',.28,-.64,-.95);sepatu(c,'#252A59',-.28,-1.0);sepatu(c,'#252A59',.28,-1.0);
  return{pivot:1.42,eyes,tick(t,s,k){const seru=s==='senang'||s==='sapa';
    tag.position.y=.66+.05*Math.sin(t*4);tag.rotation.z=seru?Math.sin(k*12)*.3:.12;tag.scale.setScalar(seru?1.25:1);
    tangan.forEach((h,i)=>{h.position.y=-.12+Math.sin(t*2.4+i*2)*.07+(seru?.5*Math.abs(Math.sin(k*5+i)):0)})}};
},
/* TABI: papan tabel berjepit, baris-barisnya menyala bergantian seperti sedang dibaca */
tabi(c){
  kotak(c,lam('#fffdf6'),1.32,1.62,.14,0,0,0,true);kotak(c,lam('#3CC8B4'),1.24,.36,.16,0,.6,0);kotak(c,lam('#9aa6b8'),.5,.16,.22,0,.86,0);
  const baris=[.24,-.09,-.42].map(y=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1.2,.3,.15),new THREE.MeshLambertMaterial({color:'#e7f7f4'}));return taruh(c,m,0,y,0)});
  kotak(c,pijar(INK),.03,1.18,.17,-.06,-.1,0);for(const y of[.41,.08,-.25,-.58])kotak(c,pijar(INK),1.24,.03,.17,0,y,0);
  const eyes=[mata(c,-.2,.63,.11,.085),mata(c,.2,.63,.11,.085)];senyum(c,.53,.11,.06);
  const tangan=[bola(c,lam('#2aa896'),.14,-.84,-.1,.04),bola(c,lam('#2aa896'),.14,.84,-.1,.04)];
  kaki(c,'#252A59',-.28,-.8,-.97);kaki(c,'#252A59',.28,-.8,-.97);sepatu(c,'#e8323c',-.28,-1.02);sepatu(c,'#e8323c',.28,-1.02);
  return{pivot:1.5,eyes,tick(t,s,k){const seru=s==='senang'||s==='sapa',aktif=Math.floor(t*(seru?8:1.6))%3;
    baris.forEach((m,i)=>m.material.color.set(i===aktif?'#ffe08a':'#e7f7f4'));
    tangan.forEach((h,i)=>{h.position.y=-.1+Math.sin(t*2.4+i*2)*.07+(seru?.5*Math.abs(Math.sin(k*5+i)):0)})}};
},
/* TURI: empat garis tegak ungu dan satu garis miring merah = 5, kepala bulat di atas */
turi(c){
  [-.33,-.11,.11,.33].forEach(x=>tabung(c,lam('#9B7BFF'),.075,.075,1.3,12,x,-.2,0));
  const miring=new THREE.Group();miring.position.set(0,-.2,.12);c.add(miring);tabung(miring,lam('#e8323c'),.075,.075,1.25,12,0,0,0);miring.rotation.z=-1;
  bola(c,lam('#9B7BFF'),.42,0,.78,0);
  const eyes=[mata(c,-.14,.84,.36,.09),mata(c,.14,.84,.36,.09)];senyum(c,.7,.38,.07);
  const tangan=[bola(c,lam('#7a5be0'),.13,-.7,.1,.04),bola(c,lam('#7a5be0'),.13,.7,.1,.04)];
  sepatu(c,'#252A59',-.24,-.92);sepatu(c,'#252A59',.24,-.92);
  return{pivot:1.42,eyes,tick(t,s,k){const seru=s==='senang'||s==='sapa';
    miring.rotation.z=seru?-1+k*9:-1+.12*Math.sin(t*2.2);
    tangan.forEach((h,i)=>{h.position.y=.1+Math.sin(t*2.6+i*2)*.07+(seru?.5*Math.abs(Math.sin(k*5+i)):0)})}};
}
};

function buat(id){
  const g=new THREE.Group(),poros=new THREE.Group(),isi=new THREE.Group();g.add(poros);poros.add(isi);
  const P=BUAT[id](isi);poros.position.y=P.pivot;
  const mulut={bato:[.25,.3],piko:[-.12,.24],tabi:[.53,.12],turi:[.7,.4]}[id];
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
