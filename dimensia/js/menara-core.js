/* Aturan permainan murni: dapat diuji tanpa renderer/browser. */
const MenaraCore=(()=>{
  const defaults={players:1,minutes:5,questionSeconds:30,penalty:0,level:2,volume:85,music:true,fx:true,motion:true,names:['Tim Orbo','Tim Hexi','Tim Nova','Tim Zipp'],characters:[0,1,2,3],soal:'campur'};
  const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
  function settings(raw={}){return{...defaults,players:[1,2,4].includes(+raw.players)?+raw.players:1,minutes:clamp(raw.minutes,1,60,5),questionSeconds:clamp(raw.questionSeconds,10,180,30),penalty:[0,3,5].includes(+raw.penalty)?+raw.penalty:0,level:clamp(raw.level,1,3,2),soal:['2d','3d','campur'].includes(raw.soal)?raw.soal:'campur',volume:clamp(raw.volume,0,100,85),music:raw.music!==false,fx:raw.fx!==false,motion:raw.motion!==false,names:defaults.names.map((n,i)=>String(raw.names?.[i]||n).trim().slice(0,24)||n),characters:[0,1,2,3].map((n,i)=>[0,1,2,3].includes(raw.characters?.[i])?raw.characters[i]:n)}}
  function random(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  /* Bangun ruang yang ditumpuk. Kubus benar-benar bersisi sama; balok, tabung, dan prisma segienam lebih lebar. */
  function shape(seed,index){const r=random(seed+index*104729),types=['balok','kubus','tabung','prisma'],kind=types[Math.floor(r()*4)],a=Math.floor(r()*5),b=Math.floor(r()*4),color=Math.floor(r()*6);
    if(kind==='kubus'){const sisi=1.2+b*.15;return{kind,width:sisi,height:sisi,color}}
    return{kind,width:2.1+a*.15,height:1.1+b*.1,color}}
  function player(i,name,character,seed){return {i,name,character,seed,blocks:[],placed:0,perfect:0,correct:0,wrong:0,peak:0,phase:'build',history:[],next:shape(seed,0)}}
  const height=p=>p.blocks.reduce((n,b)=>n+b.height,0);
  /* PRINSIP KESEIMBANGAN
     1. Sebuah bangun hanya diam kalau titik beratnya (titik tengahnya) berada di atas bangun penopangnya.
     2. Menara hanya berdiri kalau titik berat gabungan semua bangun di atas suatu bangun masih berada di atas bangun itu.
        Berat bangun dihitung dari lebar x tinggi.
     Peletakan yang melanggar salah satunya DITOLAK (alasan 'luar' atau 'miring'): bangun kembali ke tangan pemain
     dan robot memberi peringatan. Tidak ada bangun yang jatuh karena salah meletakkan. */
  function centre(blocks,from){let m=0,mx=0;for(let j=from;j<blocks.length;j++){const w=blocks[j].width*blocks[j].height;m+=w;mx+=w*blocks[j].x}return m?mx/m:0}
  function unstable(blocks){for(let k=0;k<blocks.length-1;k++)if(Math.abs(centre(blocks,k+1)-blocks[k].x)>blocks[k].width/2+1e-9)return k;return -1}
  const violated=blocks=>{const v=[];for(let k=0;k<blocks.length-1;k++)if(Math.abs(centre(blocks,k+1)-blocks[k].x)>blocks[k].width/2+1e-9)v.push(k);return v};
  /* miring = peletakan ini membuat tumpuan yang tadinya seimbang menjadi tidak seimbang */
  const leans=(p,x)=>{const lama=violated(p.blocks);return violated([...p.blocks,{...p.next,x}]).some(k=>!lama.includes(k))};
  function landing(p,x){const top=p.blocks.at(-1)||{x:0,width:4.5};
    /* tepat di tengah hanya "menempel" kalau posisi tengah itu memang seimbang */
    const perfect=Math.abs(x-top.x)<.24&&!leans(p,top.x),nx=perfect?top.x:x;
    if(Math.abs(nx-top.x)>top.width/2)return {ok:false,reason:'luar',perfect:false,x:nx,side:Math.sign(top.x-nx)};
    if(leans(p,nx)){/* hanya ditolak kalau memang masih ada tempat yang seimbang, supaya pemain tidak pernah buntu */
      let dekat=null;for(let s=-20;s<=20;s++){const c=top.x+s*top.width/40;if(!leans(p,c)&&(dekat===null||Math.abs(c-nx)<Math.abs(dekat-nx)))dekat=c}
      if(dekat!==null)return {ok:false,reason:'miring',perfect:false,x:nx,side:Math.sign(dekat-nx)}}
    return {ok:true,perfect,x:nx}}
  function place(p,x){if(p.phase!=='build')return {ok:false};const result=landing(p,x);if(!result.ok)return result;const b={...p.next,x:result.x,y:height(p)};p.blocks.push(b);p.placed++;if(result.perfect)p.perfect++;p.peak=Math.max(p.peak,height(p));p.next=shape(p.seed,p.placed);const question=p.placed%3===0;if(question)p.phase='question';return {...result,fallen:[],block:b,question}}
  function damage(p,n){const count=Math.min(p.blocks.length,Math.max(0,n));return count?p.blocks.splice(-count):[]}
  function rank(players){return players.slice().sort((a,b)=>Math.round(height(b)*100)-Math.round(height(a)*100)||b.correct-a.correct||b.perfect-a.perfect||a.i-b.i)}
  return{defaults,settings,random,shape,player,height,landing,centre,unstable,place,damage,rank};
})();
if(typeof module!=='undefined')module.exports=MenaraCore;
