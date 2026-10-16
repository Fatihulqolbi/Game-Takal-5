/* =========================================================
   DIMENSIA · arena bangun datar 2D (SVG di atas kertas berpetak)
   Alat belajar: nomor sisi, panjang sisi, keliling (garis tepi ditelusuri), luas (petak satuan diwarnai).
   Sisi bisa diketuk untuk dihitung satu per satu (tidak bisa terhitung dua kali).
   ========================================================= */
const G2=(()=>{
const WS=['#FF8C92','#27AFC2','#9A82F0','#F0A93B','#3DBE8B','#E26FB5'];
const st={t:[],alat:{},hitS:[],hitT:[],kunci:false};
let svg=null,onUbah=()=>{},jalan=false,pusat=[0,0],jari=5;
function hitungBingkai(){
  const xs=st.t.map(p=>p[0]),ys=st.t.map(p=>p[1]);
  pusat=[Math.round((Math.min(...xs)+Math.max(...xs))/2),Math.round((Math.min(...ys)+Math.max(...ys))/2)];
  jari=Math.ceil(Math.max(...st.t.map(p=>Math.hypot(p[0]-pusat[0],p[1]-pusat[1]))))+2;
}
function gambar(tr){
  if(!svg||!st.t.length)return;
  const S=DP.sifat(st.t),n=S.n,P=st.t.map(p=>[p[0]-pusat[0],-(p[1]-pusat[1])]),R=jari,a=st.alat;
  let h='<g class="petak">';
  for(let i=-3*R;i<=3*R;i++)h+=`<path d="M${i} ${-R}V${R}"/>`;
  for(let i=-R;i<=R;i++)h+=`<path d="M${-3*R} ${i}H${3*R}"/>`;
  const titikP=P.map(p=>p.join(',')).join(' ');
  h+=`</g><g id="bangun"${tr?` transform="${tr}"`:''}><polygon class="isi" points="${titikP}"/>`;
  /* luas: petak satuan di dalam bangun diwarnai papan catur supaya bisa dihitung */
  if(a.luas){const xs=st.t.map(p=>p[0]),ys=st.t.map(p=>p[1]);h+=`<clipPath id="kp2d"><polygon points="${titikP}"/></clipPath><g class="petak-luas" clip-path="url(#kp2d)">`;
    for(let i=Math.min(...xs);i<Math.max(...xs);i++)for(let j=Math.min(...ys);j<Math.max(...ys);j++)h+=`<rect class="${(i+j)%2?'a':'b'}" x="${i-pusat[0]}" y="${-(j+1-pusat[1])}" width="1" height="1"/>`;
    h+='</g>'}
  /* kelompok sisi sejajar -> warna yang sama */
  const kel=Array(n).fill(-1);let nk=0;
  if(a.sejajar)for(const[i,j]of S.pasang){if(kel[i]<0&&kel[j]<0)kel[i]=kel[j]=nk++;else if(kel[i]<0)kel[i]=kel[j];else if(kel[j]<0)kel[j]=kel[i]}
  const luar=i=>{const d=S.sisi[i].d,p=S.sisi[i].p,k=S.ccw?1:-1;return[k*d[1]/p,k*d[0]/p]}; /* normal ke luar, koordinat layar */
  for(let i=0;i<n;i++){
    const A=P[i],B=P[(i+1)%n],dihitung=st.hitS.includes(i),w=kel[i]>=0?WS[kel[i]%WS.length]:dihitung?'#FF8C92':'#252A59';
    h+=`<line class="sisi" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${w}" stroke-width="${kel[i]>=0||dihitung?.2:.12}"/>`;
  }
  /* keliling: garis tepi ditelusuri berkeliling satu kali */
  if(a.keliling)h+=`<polygon class="keliling" pathLength="100" points="${titikP}"/>`;
  if(a.siku)S.sudut.forEach((g,i)=>{if(Math.abs(g-90)>1e-6)return;
    const b=P[i],u=S.sisi[i].d,v=S.sisi[(i+n-1)%n].d,pu=S.sisi[i].p,pv=S.sisi[(i+n-1)%n].p,s=.55;
    const U=[u[0]/pu*s,-u[1]/pu*s],V=[-v[0]/pv*s,v[1]/pv*s];
    h+=`<path class="siku" d="M${b[0]+U[0]} ${b[1]+U[1]}L${b[0]+U[0]+V[0]} ${b[1]+U[1]+V[1]}L${b[0]+V[0]} ${b[1]+V[1]}"/>`});
  for(let i=0;i<n;i++){
    const A=P[i],B=P[(i+1)%n],m=[(A[0]+B[0])/2,(A[1]+B[1])/2],N=luar(i),urut=st.hitS.indexOf(i);
    const nomor=a.sisi?i+1:urut>=0?urut+1:0; /* lencana nomor tepat di tengah sisi supaya tidak bertumpuk di sudut cekung */
    if(nomor){h+=`<g class="lencana${a.sisi?'':' hit'}"><circle cx="${m[0]}" cy="${m[1]}" r=".4"/><text x="${m[0]}" y="${m[1]}">${nomor}</text></g>`}
    if(a.panjang||a.keliling)h+=`<text class="panjang" x="${m[0]+N[0]*.72}" y="${m[1]+N[1]*.72}">${DP.fmt(S.sisi[i].p)}</text>`;
    h+=`<line class="kena" data-s="${i}" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`;
  }
  for(let i=0;i<n;i++){
    const urut=st.hitT.indexOf(i),tampil=a.titik||urut>=0;
    if(tampil)h+=`<circle class="titik${urut>=0?' hit':''}" cx="${P[i][0]}" cy="${P[i][1]}" r=".24"/>`;
  }
  h+='</g>';
  svg.setAttribute('viewBox',`${-R} ${-R} ${2*R} ${2*R}`);svg.innerHTML=h;
}
function muat(t){st.t=t.map(p=>p.slice());st.alat={};st.hitS=[];st.hitT=[];hitungBingkai();gambar();onUbah('muat')}
function animasi(buat,selesai){
  if(jalan)return;jalan=true;const t0=performance.now();
  (function langkah(now){const u=Math.min(1,(now-t0)/480),e=u*u*(3-2*u);gambar(buat(e));
    if(u<1)requestAnimationFrame(langkah);else{selesai();jalan=false;gambar();onUbah('ubah')}})(t0); /* pusat tetap, supaya bangun tidak melompat */
}
/* putar 90 derajat berlawanan arah jarum jam mengelilingi pusat (titik petak), lalu simpan hasilnya */
function putar(){animasi(e=>`rotate(${-90*e})`,()=>{st.t=st.t.map(p=>[pusat[0]-(p[1]-pusat[1]),pusat[1]+(p[0]-pusat[0])])})}
function balik(){animasi(e=>`scale(${1-2*e},1)`,()=>{st.t=st.t.map(p=>[2*pusat[0]-p[0],p[1]])})}
function pasang(e){
  svg=e;
  e.addEventListener('pointerup',ev=>{
    if(st.kunci||jalan)return;const d=ev.target.dataset;if(!d)return;
    const arr=d.t!==undefined?st.hitT:d.s!==undefined?st.hitS:null;if(!arr)return;
    const i=+(d.t!==undefined?d.t:d.s);
    if(arr.includes(i)){onUbah('sudah');return}
    arr.push(i);gambar();onUbah('hitung');
  });
}
return{st,muat,pasang,putar,balik,
  setel(n,v){st.alat[n]=v;gambar();onUbah('alat')},
  hapus(){st.hitS=[];st.hitT=[];gambar();onUbah('hapus')},
  kunci(b){st.kunci=b;if(b){st.alat={};gambar()}},
  get sifat(){return DP.sifat(st.t)},set onUbah(f){onUbah=f}};
})();
