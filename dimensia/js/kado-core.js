/* DIMENSIA · Lomba Bungkus Kado: aturan murni (bisa diuji tanpa browser).
   Setiap pesanan adalah kotak kubus/balok berukuran bilangan bulat (cm).
   Langkah 1 ISI   : pilih banyak permen kubus 1 cm yang pas = VOLUME.
   Langkah 2 BUNGKUS: pilih luas kertas kado yang pas = LUAS PERMUKAAN.
   Pilihan pengecoh sengaja memakai angka yang sering tertukar (volume <-> luas, luas alas, lupa satu pasang sisi). */
const KadoCore=(()=>{
  const defaults={players:1,minutes:5,level:2,volume:85,music:true,fx:true,motion:true,names:['Tim Orbo','Tim Hexi','Tim Nova','Tim Zipp'],characters:[0,1,2,3]};
  const clamp=(v,min,max,f)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.round(Number(v)))):f;
  function settings(raw={}){return{...defaults,players:[1,2,4].includes(+raw.players)?+raw.players:1,minutes:clamp(raw.minutes,1,60,5),level:clamp(raw.level,1,3,2),volume:clamp(raw.volume,0,100,85),music:raw.music!==false,fx:raw.fx!==false,motion:raw.motion!==false,
    names:defaults.names.map((n,i)=>String(raw.names?.[i]||n).trim().slice(0,24)||n),characters:[0,1,2,3].map((n,i)=>[0,1,2,3].includes(raw.characters?.[i])?raw.characters[i]:n)}}
  function random(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  function acak(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  const UKURAN={1:{s:[2,3],p:[2,4],l:[1,3],t:[1,3]},2:{s:[2,4],p:[3,6],l:[2,4],t:[1,4]},3:{s:[3,5],p:[3,7],l:[2,5],t:[2,5]}};
  /* kesabaran pelanggan (detik): makin lama makin singkat */
  const sabar=(level,i)=>Math.max([0,18,15,12][level],[0,45,38,32][level]-i*2);
  function pilihan(r,benar,pengecoh){const v=[benar];for(const x of pengecoh)if(Number.isInteger(x)&&x>0&&!v.includes(x)&&v.length<4)v.push(x);
    for(let k=1;v.length<4;k++){const x=benar+(k%2?1:-1)*Math.ceil(k/2)*Math.max(2,Math.round(benar*.15));if(x>0&&!v.includes(x))v.push(x)}
    const o=acak(r,v);return{opsi:o,benar:o.indexOf(benar)}}
  function pesanan(seed,i,level=2){
    const r=random(seed+i*7919),U=UKURAN[Math.max(1,Math.min(3,level))],kubus=r()<.3;
    let p,l,t;if(kubus){p=l=t=ri(r,...U.s)}else{p=ri(r,...U.p);l=ri(r,...U.l);t=ri(r,...U.t);if(p===l&&l===t)p++;if(l>p)[p,l]=[l,p]}
    const V=p*l*t,a=p*l,b=p*t,c=l*t,L=2*(a+b+c);
    const isi=pilihan(r,V,acak(r,[L,a*t+a,V+a,a,V*2,p+l+t,V-a]).sort((x,y)=>(y===L)-(x===L)));
    const bungkus=pilihan(r,L,acak(r,[V,a+b+c,2*(a+b),2*(a+c),L+2*a,L-2*c,6*a]).sort((x,y)=>(y===V)-(x===V)));
    return{i,kind:kubus?'kubus':'balok',p,l,t,V,L,luasSisi:[a,b,c],opsiV:isi.opsi,benarV:isi.benar,opsiL:bungkus.opsi,benarL:bungkus.benar,sabar:sabar(level,i),
      rumusV:kubus?`Volume = s × s × s = ${p} × ${p} × ${p} = ${V}`:`Volume = p × l × t = ${p} × ${l} × ${t} = ${V}`,
      rumusL:kubus?`Luas permukaan = 6 × s × s = 6 × ${a} = ${L}`:`Luas permukaan = 2 × (${p}×${l} + ${p}×${t} + ${l}×${t}) = 2 × (${a} + ${b} + ${c}) = ${L}`,
      nama:kubus?`Kubus ${p} × ${p} × ${p}`:`Balok ${p} × ${l} × ${t}`}}
  function player(i,name,character,seed,level){return{i,name,character,seed,level,urut:0,sempurna:0,okV:0,okL:0,gagal:0,riwayat:[],order:pesanan(seed,0,level),phase:'isi',pilihV:null,pilihL:null}}
  /* nilai satu pesanan setelah selesai (atau habis waktu) */
  function nilai(p,habis=false){const o=p.order,v=p.pilihV!==null&&o.opsiV[p.pilihV]===o.V,l=p.pilihL!==null&&o.opsiL[p.pilihL]===o.L,sempurna=v&&l&&!habis;
    if(v)p.okV++;if(l)p.okL++;if(sempurna)p.sempurna++;if(habis)p.gagal++;
    const h={order:o,pilihV:p.pilihV===null?null:o.opsiV[p.pilihV],pilihL:p.pilihL===null?null:o.opsiL[p.pilihL],v,l,sempurna,habis};p.riwayat.push(h);return h}
  function lanjut(p){p.urut++;p.order=pesanan(p.seed,p.urut,p.level);p.phase='isi';p.pilihV=null;p.pilihL=null}
  function rank(players){return players.slice().sort((a,b)=>b.sempurna-a.sempurna||(b.okV+b.okL)-(a.okV+a.okL)||a.gagal-b.gagal||a.i-b.i)}
  return{defaults,settings,random,pesanan,player,nilai,lanjut,rank,sabar};
})();
if(typeof module!=='undefined')module.exports=KadoCore;
