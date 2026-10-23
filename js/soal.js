/* =========================================================
   BANK SOAL PROSEDURAL (tanpa AI): angka diacak, rumus menghitung jawaban,
   dan setiap soal membawa pembahasan langkah demi langkah (q.steps)
   ========================================================= */
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const lcm=(a,b)=>a/gcd(a,b)*b;
function F(n,d){if(d<0){n=-n;d=-d}const g=gcd(Math.abs(n),d)||1;return{n:n/g,d:d/g}}
const add=(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d);
const sub=(a,b)=>F(a.n*b.d-b.n*a.d,a.d*b.d);
const mul=(a,b)=>F(a.n*b.n,a.d*b.d);
const div=(a,b)=>F(a.n*b.d,a.d*b.n);
const key=f=>f.n+'/'+f.d, val=f=>f.n/f.d;
const fr=(n,d)=>`<span class="fr"><span>${n}</span><span>${d}</span></span>`;
const ff=f=>fr(f.n,f.d);
function show(f){if(f.d===1)return ''+f.n;if(f.n>f.d){const w=Math.floor(f.n/f.d);return `<span class="mx">${w}${fr(f.n%f.d,f.d)}</span>`}return ff(f)}
const showImp=f=>f.d===1?''+f.n:ff(f);
const mixedRaw=(w,n,d)=>`<span class="mx">${w}${fr(n,d)}</span>`;
const dec=x=>(Math.round(x*1000)/1000).toString().replace('.',',');
const terminates=f=>{let d=f.d;while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1};
const DEN=[2,3,4,5,6,8,10,12];
const rf=()=>{const d=pick(DEN);return F(R(1,d-1),d)};
function rfDistinct(k){const o=[],s=new Set();let g=0;while(o.length<k&&g++<300){const f=rf();if(!s.has(key(f))){s.add(key(f));o.push(f)}}return o}
const NAMA=['Budi','Siti','Andi','Rina','Dayu','Made','Ucok','Nanda','Putri','Bima','Lala','Fajar','Wayan','Tiara'];
const names=k=>shuffle(NAMA).slice(0,k);
const KATA=['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas','dua belas'];
const baca=(n,d)=>(n===1?'se':KATA[n]+' ')+'per'+KATA[d];

/* ---------- pilihan jawaban ---------- */
function fracOpts(c,wrongs,disp=show){
  const out=[{html:disp(c),key:key(c)}],seen=new Set([key(c)]);
  const tryAdd=w=>{if(!w||!(w.n>0)||!(w.d>0)||out.length>=4)return;const k=key(w);if(seen.has(k))return;seen.add(k);out.push({html:disp(w),key:k})};
  wrongs.forEach(tryAdd);
  [F(c.n+1,c.d),F(c.n*2+1,c.d*2),F(Math.max(1,c.n-1),c.d),F(c.n,c.d+1),F(c.d,c.n)].forEach(tryAdd);
  let g=0;while(out.length<4&&g++<60)tryAdd(F(c.n+R(1,6),c.d+R(0,4)));
  return{answer:key(c),options:shuffle(out),correctHtml:disp(c)};
}
function rawOpts(list,fill){
  const out=[],seen=new Set();
  const tryAdd=([n,d])=>{if(!(n>0)||!(d>0)||out.length>=4)return;const k=key(F(n,d));if(seen.has(k))return;seen.add(k);out.push({html:fr(n,d),key:k})};
  list.forEach(tryAdd);let g=0;while(out.length<4&&g++<60)tryAdd(fill());
  return{answer:out[0].key,correctHtml:out[0].html,options:shuffle(out)};
}
function textOpts(c,wrongs){
  const out=[{html:c,key:c}],seen=new Set([c]);
  for(const w of wrongs){if(w==null||seen.has(w))continue;seen.add(w);out.push({html:w,key:w});if(out.length===4)break}
  return{answer:c,correctHtml:c,options:shuffle(out)};
}
function pie(n,d){const r=44,c=50;let s='';for(let i=0;i<d;i++){const a0=-Math.PI/2+i*2*Math.PI/d,a1=a0+2*Math.PI/d;
  s+=`<path d="M${c},${c} L${(c+r*Math.cos(a0)).toFixed(2)},${(c+r*Math.sin(a0)).toFixed(2)} A${r},${r} 0 0 1 ${(c+r*Math.cos(a1)).toFixed(2)},${(c+r*Math.sin(a1)).toFixed(2)} Z" fill="${i<n?'#e8323c':'#ffffff'}" stroke="#1e2a4a" stroke-width="2.5" stroke-linejoin="round"/>`}
  return `<svg class="vis" viewBox="0 0 100 100" role="img" aria-label="lingkaran dibagi ${d}, ${n} diwarnai">${s}</svg>`}
function bar(n,d){const w=196/d;let s='';for(let i=0;i<d;i++)s+=`<rect x="${2+i*w}" y="2" width="${w}" height="46" fill="${i<n?'#ffc93c':'#ffffff'}" stroke="#1e2a4a" stroke-width="2.5"/>`;
  return `<svg class="vis bar" viewBox="0 0 200 50" role="img" aria-label="persegi panjang dibagi ${d}, ${n} diwarnai">${s}</svg>`}

/* ---------- pembahasan: potongan langkah yang dipakai ulang ---------- */
const chain=(n,d)=>{const f=F(n,d);return fr(n,d)+(f.n!==n||f.d!==d?' = '+showImp(f):'')};
const conv=(list,L)=>{const ch=list.filter(([n,d])=>d!==L).map(([n,d])=>`${fr(n,d)} = ${fr(n*L/d,L)}`);return ch.length?ch.join(' dan ')+'.':null};
function finishSteps(n,d){const s=[],g=gcd(n,d),f=F(n,d);
  if(g>1)s.push(`Sederhanakan: bagi pembilang dan penyebut dengan ${g} (FPB-nya) → ${fr(n,d)} = ${showImp(f)}.`);
  if(f.d>1&&f.n>f.d)s.push(`Ubah ke pecahan campuran: ${f.n} : ${f.d} = ${Math.floor(f.n/f.d)} sisa ${f.n%f.d} → ${show(f)}.`);
  return s}
function sumSteps(a,b,op){const L=lcm(a.d,b.d),x=a.n*L/a.d,y=b.n*L/b.d,z=op==='+'?x+y:x-y,s=[];
  if(a.d===b.d)s.push(`Penyebutnya sudah sama (${a.d}), jadi langsung ${op==='+'?'jumlahkan':'kurangkan'} pembilangnya.`);
  else{s.push(`Samakan penyebut dulu. KPK dari ${a.d} dan ${b.d} adalah ${L}.`);s.push(conv([[a.n,a.d],[b.n,b.d]],L))}
  s.push(`${op==='+'?'Jumlahkan':'Kurangkan'} pembilangnya, penyebut tetap: ${fr(x,L)} ${op} ${fr(y,L)} = ${fr(z,L)}.`);
  return s.concat(finishSteps(z,L))}
function mulSteps(a,b){const N=a.n*b.n,D=a.d*b.d;
  return[`Kalikan pembilang dengan pembilang: ${a.n} × ${b.n} = ${N}.`,`Kalikan penyebut dengan penyebut: ${a.d} × ${b.d} = ${D}.`,`Hasilnya ${fr(N,D)}.`].concat(finishSteps(N,D))}
function divSteps(a,b){return[`Membagi pecahan sama dengan mengalikan dengan kebalikannya. Kebalikan ${ff(b)} adalah ${fr(b.d,b.n)}.`,`${ff(a)} : ${ff(b)} = ${ff(a)} × ${fr(b.d,b.n)}.`].concat(mulSteps(a,{n:b.d,d:b.n}))}
function intMulSteps(k,a){const N=k*a.n;return[`Kalikan bilangan bulat dengan pembilangnya: ${k} × ${a.n} = ${N}. Penyebut tetap ${a.d}.`,`Hasilnya ${fr(N,a.d)}.`].concat(finishSteps(N,a.d))}
function cmpTwoSteps(a,b){const L=lcm(a.d,b.d),x=a.n*L/a.d,y=b.n*L/b.d,s=x<y?'<':x>y?'>':'=',st=[];
  if(a.d===b.d)st.push(`Penyebutnya sudah sama (${a.d}).`);
  else{st.push(`Samakan penyebut. KPK dari ${a.d} dan ${b.d} adalah ${L}.`);st.push(conv([[a.n,a.d],[b.n,b.d]],L))}
  st.push(`Bandingkan pembilangnya: ${x} ${s} ${y}. Jadi ${fr(a.n,a.d)} ${s} ${fr(b.n,b.d)}.`);return st}
function commonSteps(fs){const L=fs.reduce((m,f)=>lcm(m,f.d),1);
  if(L<=60)return{L,step:`Samakan penyebut menjadi ${L}: `+fs.map(f=>`${ff(f)} = ${fr(f.n*L/f.d,L)}`).join(', ')+'.',v:f=>f.n*L/f.d,how:'pembilangnya'};
  return{L:0,step:'Ubah ke bentuk desimal: '+fs.map(f=>`${ff(f)} ≈ ${dec(Math.round(val(f)*1000)/1000)}`).join(', ')+'.',v:val,how:'nilai desimalnya'}}
const Q=(text,opts,steps,extra={})=>Object.assign({text,steps},opts,extra);
const fixed=x=>{const s=x.toString();return(s.split('.')[1]||'').length};

const GEN={
/* 1. KONSEP PECAHAN */
1:{
 biasa:[
  ()=>{const b=pick([2,3,4,5,6,7,8,9]);let a=R(1,b-1);while(gcd(a,b)!==1)a=R(1,b-1);const k=R(2,6);
    return Q(`Bentuk paling sederhana dari <span class="expr">${fr(a*k,b*k)}</span> adalah …`,fracOpts(F(a,b),[F(a,b*k),F(a*k,b),F(a+1,b)],showImp),
      [`Cari FPB (faktor persekutuan terbesar) dari ${a*k} dan ${b*k}. FPB-nya ${k}.`,`Bagi pembilang dan penyebut dengan ${k}: ${a*k} : ${k} = ${a} dan ${b*k} : ${k} = ${b}.`,`Jadi bentuk paling sederhananya ${fr(a,b)}.`])},
  ()=>{const d=R(2,12),n=R(1,d-1);
    return Q(`Pecahan "<i>${baca(n,d)}</i>" ditulis …`,rawOpts([[n,d],[d,n],[n,d+1],[n+1,d]],()=>[R(1,12),R(2,12)]),
      [`Kata sebelum "per" adalah pembilang (angka atas): ${n===1?'"se" artinya satu':KATA[n]} → ${n}.`,`Kata sesudah "per" adalah penyebut (angka bawah): ${KATA[d]} → ${d}.`,`Jadi ditulis ${fr(n,d)}.`])},
 ],
 konsep:[
  ()=>{const d=R(3,10),n=R(1,d-1);const v=Math.random()<.5?pie(n,d):bar(n,d);
    return Q(`Bagian yang diwarnai dari gambar adalah … ${v}`,rawOpts([[n,d],[d-n,d],[n,d-n],[d,n]],()=>[R(1,d),d+R(1,2)]),
      [`Hitung semua bagian yang sama besar: ada ${d} bagian. Ini penyebutnya.`,`Hitung bagian yang diwarnai: ada ${n} bagian. Ini pembilangnya.`,`Jadi bagian yang diwarnai = ${fr(n,d)}.`])},
  ()=>{const b=pick([2,3,4,5,6]);let a=R(1,b-1);while(gcd(a,b)!==1)a=R(1,b-1);const k=R(2,5);
    return Q(`Pecahan yang senilai dengan <span class="expr">${fr(a,b)}</span> adalah …`,rawOpts([[a*k,b*k],[a+k,b+k],[a*k,b+k],[a,b*k]],()=>[a*k+R(1,3),b*k]),
      [`Pecahan senilai didapat dengan mengalikan pembilang DAN penyebut dengan bilangan yang sama.`,`${fr(a,b)} = ${fr(a+' × '+k,b+' × '+k)} = ${fr(a*k,b*k)}.`,`Hati-hati: menambah angka yang sama ke atas dan bawah TIDAK menghasilkan pecahan senilai.`])},
  ()=>{const d=R(3,12),n=R(1,d-1),ask=Math.random()<.5;
    return Q(`Pada pecahan <span class="expr">${fr(n,d)}</span>, ${ask?'penyebut':'pembilang'}nya adalah …`,textOpts(''+(ask?d:n),[''+(ask?n:d),''+(n+d),''+(Math.abs(d-n)||1),''+(d+1)]),
      [`Pembilang adalah angka di atas garis: ${n}.`,`Penyebut adalah angka di bawah garis: ${d}.`,`Jadi ${ask?'penyebut':'pembilang'}nya ${ask?d:n}.`])},
 ],
 cerita:[
  ()=>{const [A]=names(1),d=pick([4,6,8,10,12]),n=R(1,d-1);
    return Q(`Ibu memotong kue bolu menjadi ${d} potong sama besar. ${A} memakan ${n} potong. Pecahan yang menunjukkan bagian kue yang dimakan ${A} adalah …`,rawOpts([[n,d],[d-n,d],[n,d-n],[d,n]],()=>[R(1,d),d+1]),
      [`Diketahui: kue dipotong ${d} bagian, dimakan ${n} potong. Ditanya: pecahan yang dimakan.`,`Seluruh potongan (${d}) menjadi penyebut, potongan yang dimakan (${n}) menjadi pembilang.`,`Jadi bagian yang dimakan ${A} = ${fr(n,d)}.`],{story:1})},
  ()=>{const [A,B]=names(2),d=pick([6,8,10,12]);const n=R(1,3),m=R(1,3);if(n+m>=d)throw 0;const r=d-n-m;
    return Q(`Sebuah pizza dipotong menjadi ${d} bagian sama besar. ${A} makan ${n} potong dan ${B} makan ${m} potong. Bagian pizza yang masih tersisa adalah …`,rawOpts([[r,d],[n+m,d],[r,d+1],[n,d]],()=>[R(1,d-1),d]),
      [`Diketahui: pizza ${d} potong, dimakan ${n} dan ${m} potong. Ditanya: bagian yang tersisa.`,`Potongan yang dimakan: ${n} + ${m} = ${n+m}.`,`Potongan yang tersisa: ${d} − ${n+m} = ${r}.`,`Jadi bagian yang tersisa = ${fr(r,d)}.`],{story:1})},
  ()=>{const T=pick([20,24,30,32,36,40]);const X=R(5,T-5);const g=gcd(X,T);if(g===1)throw 0;
    return Q(`Di kelas 5 ada ${T} siswa. Sebanyak ${X} siswa adalah perempuan. Pecahan paling sederhana yang menunjukkan banyak siswa perempuan adalah …`,fracOpts(F(X,T),[F(T-X,T),F(X,T-X),F(X+1,T)],showImp),
      [`Diketahui: ${X} perempuan dari ${T} siswa. Ditanya: pecahan paling sederhana.`,`Tulis pecahannya: ${fr(X,T)}.`,...finishSteps(X,T)],{story:1})},
 ]},
/* 2. HUBUNGAN BENTUK PECAHAN */
2:{
 biasa:[
  ()=>{const x=pick([0.5,0.25,0.75,0.2,0.4,0.6,0.8,0.125,0.375,1.5,1.25,2.75,0.35,0.45,0.05,2.4]);const k=fixed(x),P=10**k,N=Math.round(x*P),c=F(N,P);
    return Q(`Bentuk pecahan paling sederhana dari <span class="expr">${dec(x)}</span> adalah …`,fracOpts(c,[F(N,10),F(Math.round(x*10)||1,100),F(c.d,c.n)]),
      [`${dec(x)} punya ${k} angka di belakang koma, jadi penyebutnya ${P}.`,`${dec(x)} = ${fr(N,P)}.`,...finishSteps(N,P)])},
  ()=>{const f=F(R(1,24),pick([2,4,5,8,10,20,25]));if(f.n>=f.d)throw 0;const x=val(f),P=[10,100,1000].find(p=>p%f.d===0),m=P/f.d;
    return Q(`Bentuk desimal dari <span class="expr">${ff(f)}</span> adalah …`,textOpts(dec(x),[`${f.n},${f.d}`,dec(x/10),dec(x+0.1),dec(f.d/f.n)]),
      [...(m===1?[`Penyebutnya sudah ${P}.`]:[`Ubah penyebut menjadi ${P}: kalikan pembilang dan penyebut dengan ${m}.`,`${ff(f)} = ${fr(f.n*m,P)}.`]),`${fr(f.n*m,P)} artinya ${f.n*m} per ${P} = ${dec(x)}.`])},
  ()=>{const p=pick([10,20,25,40,50,60,75,80,5,15,35,45]);const c=F(p,100);
    return Q(`Bentuk pecahan paling sederhana dari <span class="expr">${p}%</span> adalah …`,fracOpts(c,[F(p,10),F(1,p),F(p+5,100)]),
      [`Persen (%) artinya "per seratus", jadi ${p}% = ${fr(p,100)}.`,...finishSteps(p,100)])},
 ],
 konsep:[
  ()=>{const d=R(2,9),w=R(1,5);let r=R(1,d-1);while(gcd(r,d)!==1)r=R(1,d-1);const N=w*d+r;
    return Q(`Pecahan <span class="expr">${fr(N,d)}</span> jika diubah ke pecahan campuran adalah …`,fracOpts(F(N,d),[F((w+1)*d+r,d),F(w*d+(d-r),d),F((w-1)*d+r,d),F(r*d+w,d)]),
      [`Bagi pembilang dengan penyebut: ${N} : ${d} = ${w} sisa ${r}.`,`Hasil bagi (${w}) menjadi bilangan bulat, sisa (${r}) menjadi pembilang, penyebut tetap ${d}.`,`Jadi ${fr(N,d)} = ${mixedRaw(w,r,d)}.`])},
  ()=>{const d=R(2,9),w=R(1,5);let r=R(1,d-1);while(gcd(r,d)!==1)r=R(1,d-1);const N=w*d+r;
    return Q(`Pecahan campuran <span class="expr">${mixedRaw(w,r,d)}</span> jika diubah ke pecahan biasa adalah …`,fracOpts(F(N,d),[F(w+r,d),F(w*r+d,d),F(w*d-r,d),F(N,d*w)],showImp),
      [`Kalikan bilangan bulat dengan penyebut: ${w} × ${d} = ${w*d}.`,`Tambahkan pembilangnya: ${w*d} + ${r} = ${N}.`,`Penyebut tetap ${d}. Jadi ${mixedRaw(w,r,d)} = ${fr(N,d)}.`])},
 ],
 cerita:[
  ()=>{const [A]=names(1),x=pick([0.25,0.5,0.75,0.2,0.4,0.6,0.8,1.5,1.25,2.5]);const k=fixed(x),P=10**k,N=Math.round(x*P),c=F(N,P);
    return Q(`Panjang pita ${A} adalah ${dec(x)} meter. Jika ditulis dalam bentuk pecahan paling sederhana, panjang pita itu adalah … meter.`,fracOpts(c,[F(N,10),F(c.d,c.n)]),
      [`Diketahui: panjang pita ${dec(x)} m. Ditanya: bentuk pecahan paling sederhana.`,`${dec(x)} punya ${k} angka di belakang koma, jadi ${dec(x)} = ${fr(N,P)}.`,...finishSteps(N,P)],{story:1})},
  ()=>{const w=R(1,4),[n,d]=pick([[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5]]);const x=w+n/d,P=[10,100].find(p=>p%d===0),m=P/d;
    return Q(`Ayah membeli ${mixedRaw(w,n,d)} kg daging. Berat daging itu jika ditulis dalam bentuk desimal adalah … kg.`,textOpts(dec(x),[`${w},${n}${d}`,`${w},${n}`,dec(x+0.25),dec(w+d/10)]),
      [`Diketahui: berat daging ${mixedRaw(w,n,d)} kg. Ditanya: bentuk desimal.`,`Ubah bagian pecahannya: ${fr(n,d)} = ${fr(n*m,P)} = ${dec(n/d)}.`,`Tambahkan bilangan bulatnya: ${w} + ${dec(n/d)} = ${dec(x)}.`],{story:1})},
  ()=>{const [A]=names(1),p=pick([20,25,40,60,75,80]);const c=F(p,100);
    return Q(`${A} menjawab benar ${p}% dari soal ulangan. Bentuk pecahan paling sederhana dari ${p}% adalah …`,fracOpts(c,[F(p,10),F(100-p,100)]),
      [`Diketahui: ${p}%. Ditanya: pecahan paling sederhana.`,`Persen artinya per seratus: ${p}% = ${fr(p,100)}.`,...finishSteps(p,100)],{story:1})},
 ]},
/* 3. MEMBANDINGKAN & MENGURUTKAN */
3:{
 biasa:[
  ()=>{const k=Math.random()<.5?3:4;const fs=rfDistinct(k);const asc=Math.random()<.5;
    const items=fs.map(f=>({f,d:Math.random()<.3&&terminates(f)}));items.forEach(it=>it.h=it.d?dec(val(it.f)):ff(it.f));
    const order=items.map((_,i)=>i).sort((a,b)=>asc?val(items[a].f)-val(items[b].f):val(items[b].f)-val(items[a].f));
    const toH=o=>o.map(i=>items[i].h).join('<span class="sep">;</span>');
    const cands=[order.slice().reverse()];for(let i=0;i<k-1;i++){const o=order.slice();[o[i],o[i+1]]=[o[i+1],o[i]];cands.push(o)}cands.push(shuffle(order));
    const out=[{html:toH(order),key:order.join('-')}],seen=new Set([order.join('-')]);
    for(const o of cands){const kk=o.join('-');if(seen.has(kk))continue;seen.add(kk);out.push({html:toH(o),key:kk});if(out.length===4)break}
    const cs=commonSteps(fs);const decs=items.filter(it=>it.d);
    const st=[];if(decs.length)st.push('Ubah desimal ke pecahan dulu: '+decs.map(it=>`${it.h} = ${ff(it.f)}`).join(', ')+'.');
    st.push(cs.step,`Bandingkan ${cs.how}: makin besar ${cs.how}, makin besar pecahannya.`,`Urutan dari ${asc?'terkecil ke terbesar':'terbesar ke terkecil'}: ${toH(order)}.`);
    return Q(`Urutan pecahan dari yang <b>${asc?'terkecil ke terbesar':'terbesar ke terkecil'}</b> adalah …`,{options:shuffle(out),answer:order.join('-'),correctHtml:toH(order)},st)},
  ()=>{const fs=rfDistinct(4),big=Math.random()<.5;const c=fs.slice().sort((a,b)=>big?val(b)-val(a):val(a)-val(b))[0];const cs=commonSteps(fs);
    return Q(`Pecahan yang paling <b>${big?'besar':'kecil'}</b> adalah …`,{options:shuffle(fs.map(f=>({html:ff(f),key:key(f)}))),answer:key(c),correctHtml:ff(c)},
      [cs.step,`Cari ${cs.how} yang paling ${big?'besar':'kecil'}.`,`Jadi pecahan yang paling ${big?'besar':'kecil'} adalah ${ff(c)}.`])},
 ],
 konsep:[
  ()=>{const a=rf();let b=rf();if(Math.random()<.25){const k=R(2,4);b={n:a.n*k,d:a.d*k}}if(a.d===b.d&&a.n===b.n)throw 0;
    const s=val(a)<b.n/b.d-1e-9?'<':val(a)>b.n/b.d+1e-9?'>':'=';
    return Q(`Tanda yang tepat untuk <span class="expr">${ff(a)} … ${fr(b.n,b.d)}</span> adalah …`,{answer:s,correctHtml:s==='<'?'&lt;':s==='>'?'&gt;':s,options:['<','>','='].map(x=>({html:x==='<'?'&lt;':x==='>'?'&gt;':x,key:x}))},cmpTwoSteps(a,b))},
  ()=>{const a=rf();const k=R(2,4);const b=F(a.n*k+pick([-1,1]),a.d*k);if(b.n<=0)throw 0;
    const s=val(a)<val(b)?'<':'>';
    return Q(`Tanda yang tepat untuk <span class="expr">${ff(a)} … ${ff(b)}</span> adalah …`,{answer:s,correctHtml:s==='<'?'&lt;':s==='>'?'&gt;':s,options:['<','>','='].map(x=>({html:x==='<'?'&lt;':x==='>'?'&gt;':x,key:x}))},cmpTwoSteps(a,b))},
 ],
 cerita:[
  ()=>{const [A,B]=names(2);const a=rf();let b=rf();if(Math.random()<.2){const k=R(2,3);b={n:a.n*k,d:a.d*k}}
    const va=val(a),vb=b.n/b.d;const c=Math.abs(va-vb)<1e-9?'Sama banyak':va>vb?A:B;
    return Q(`${A} minum ${ff(a)} liter susu. ${B} minum ${fr(b.n,b.d)} liter susu. Siapa yang minum susu lebih banyak?`,textOpts(c,[A,B,'Sama banyak']),
      [`Diketahui: ${A} ${ff(a)} liter, ${B} ${fr(b.n,b.d)} liter. Ditanya: siapa yang lebih banyak.`,...cmpTwoSteps(a,b),`Jadi jawabannya: ${c}.`],{story:1})},
  ()=>{const ns=names(3),fs=rfDistinct(3),far=Math.random()<.5;const idx=fs.map((_,i)=>i).sort((x,y)=>far?val(fs[y])-val(fs[x]):val(fs[x])-val(fs[y]))[0];const cs=commonSteps(fs);
    return Q(`Jarak rumah ke sekolah: ${ns[0]} ${ff(fs[0])} km, ${ns[1]} ${ff(fs[1])} km, dan ${ns[2]} ${ff(fs[2])} km. Rumah siapa yang paling <b>${far?'jauh':'dekat'}</b> dari sekolah?`,textOpts(ns[idx],[...ns,'Semua sama']),
      [`Diketahui: tiga jarak. Ditanya: rumah yang paling ${far?'jauh':'dekat'} (pecahan paling ${far?'besar':'kecil'}).`,cs.step,`Pecahan paling ${far?'besar':'kecil'} adalah ${ff(fs[idx])}, milik ${ns[idx]}.`],{story:1})},
 ]},
/* 4. PENJUMLAHAN & PENGURANGAN */
4:{
 biasa:[
  ()=>{let a=rf(),b=rf();const plus=Math.random()<.5;if(!plus&&val(a)<=val(b))[a,b]=[b,a];if(!plus&&key(a)===key(b))throw 0;
    const r=plus?add(a,b):sub(a,b);const wr=plus?F(a.n+b.n,a.d+b.d):F(Math.abs(a.n-b.n)||1,Math.abs(a.d-b.d)||a.d);const op=plus?'+':'−';
    return Q(`Hasil dari <span class="expr">${ff(a)} ${op} ${ff(b)}</span> adalah …`,fracOpts(r,[wr,plus?sub(add(a,b),F(1,lcm(a.d,b.d))):add(r,F(1,lcm(a.d,b.d)))]),sumSteps(a,b,op))},
 ],
 konsep:[
  ()=>{const w1=R(1,4),w2=R(1,3),a=rf(),b=rf(),plus=Math.random()<.5;const A=add(F(w1,1),a),B=add(F(w2,1),b);if(!plus&&val(A)<=val(B))throw 0;
    const r=plus?add(A,B):sub(A,B),op=plus?'+':'−';
    return Q(`Hasil dari <span class="expr">${show(A)} ${op} ${show(B)}</span> adalah …`,fracOpts(r,[plus?add(F(w1+w2,1),F(a.n+b.n,a.d+b.d)):F(Math.abs(w1-w2)+1,2),plus?add(r,F(1,1)):sub(r,F(1,2))]),
      [`Ubah pecahan campuran ke pecahan biasa: ${show(A)} = ${showImp(A)} dan ${show(B)} = ${showImp(B)}.`,...sumSteps(A,B,op)])},
  ()=>{const a=rf(),c=rf();if(val(c)<=val(a))throw 0;const r=sub(c,a);
    return Q(`<span class="expr">${ff(a)} + <span class="blank"></span> = ${ff(c)}</span> Bilangan yang tepat untuk kotak adalah …`,fracOpts(r,[add(a,c),F(Math.abs(c.n-a.n)||1,Math.abs(c.d-a.d)||c.d)]),
      [`Kotak = hasil − bilangan yang diketahui, jadi kotak = ${ff(c)} − ${ff(a)}.`,...sumSteps(c,a,'−')])},
 ],
 cerita:[
  ()=>{const [A]=names(1),a=rf(),b=rf();const r=add(a,b);
    return Q(`${A} mempunyai ${ff(a)} kg gula. Ibu memberinya lagi ${ff(b)} kg gula. Berat gula ${A} sekarang adalah … kg.`,fracOpts(r,[F(a.n+b.n,a.d+b.d),sub(r,F(1,lcm(a.d,b.d)))]),
      [`Diketahui: punya ${ff(a)} kg, diberi lagi ${ff(b)} kg. Ditanya: berat sekarang. Kata "diberi lagi" artinya dijumlah.`,`Kalimat matematika: ${ff(a)} + ${ff(b)}.`,...sumSteps(a,b,'+')],{story:1})},
  ()=>{const [A]=names(1);const a=add(F(R(1,3),1),rf()),b=rf();const r=sub(a,b);
    return Q(`${A} mempunyai pita sepanjang ${show(a)} meter. Sepanjang ${ff(b)} meter dipakai untuk membuat bunga. Sisa pita ${A} adalah … meter.`,fracOpts(r,[add(a,b),add(r,F(1,2))]),
      [`Diketahui: pita ${show(a)} m, dipakai ${ff(b)} m. Ditanya: sisa. Kata "dipakai" dan "sisa" artinya dikurang.`,`Ubah ke pecahan biasa: ${show(a)} = ${showImp(a)}.`,...sumSteps(a,b,'−')],{story:1})},
 ]},
/* 5. PERKALIAN & PEMBAGIAN */
5:{
 biasa:[
  ()=>{const a=rf(),b=rf();const r=mul(a,b);
    return Q(`Hasil dari <span class="expr">${ff(a)} × ${ff(b)}</span> adalah …`,fracOpts(r,[F(a.n*b.d,a.d*b.n),F(a.n+b.n,a.d+b.d),add(a,b)]),mulSteps(a,b))},
  ()=>{const a=rf(),b=rf();const r=div(a,b);
    return Q(`Hasil dari <span class="expr">${ff(a)} : ${ff(b)}</span> adalah …`,fracOpts(r,[mul(a,b),F(b.n*a.d,b.d*a.n),F(a.n*b.n,a.d*b.n)]),divSteps(a,b))},
 ],
 konsep:[
  ()=>{const k=R(2,9),a=rf();const r=mul(F(k,1),a);
    return Q(`Hasil dari <span class="expr">${k} × ${ff(a)}</span> adalah …`,fracOpts(r,[F(k*a.n,k*a.d+1),F(a.n,k*a.d),F(k+a.n,a.d)]),intMulSteps(k,a))},
  ()=>{const a=rf(),N=a.d*R(2,6);const r=N*a.n/a.d;
    return Q(`<span class="expr">${ff(a)}</span> dari ${N} adalah …`,textOpts(''+r,[''+(N-r||N+1),''+(N/a.d),''+(r+a.n),''+(r*2)]),
      [`"${ff(a)} dari ${N}" artinya ${ff(a)} × ${N}.`,`Bagi ${N} dengan penyebut: ${N} : ${a.d} = ${N/a.d}.`,`Kalikan dengan pembilang: ${N/a.d} × ${a.n} = ${r}.`])},
  ()=>{const a=rf(),k=R(2,6);const r=div(a,F(k,1));
    return Q(`Hasil dari <span class="expr">${ff(a)} : ${k}</span> adalah …`,fracOpts(r,[F(a.n*k,a.d),F(a.n,a.d+k)]),
      [`Dibagi ${k} sama dengan dikali kebalikannya, yaitu ${fr(1,k)}.`,...mulSteps(a,{n:1,d:k})])},
 ],
 cerita:[
  ()=>{const k=R(2,6),a=rf();const r=mul(F(k,1),a);
    return Q(`Setiap anak mendapat ${ff(a)} liter susu. Ada ${k} anak di kelompok itu. Banyak susu yang dibagikan seluruhnya adalah … liter.`,fracOpts(r,[F(a.n,k*a.d),F(k+a.n,a.d),F(a.n*k,a.d+k)]),
      [`Diketahui: tiap anak ${ff(a)} liter, ada ${k} anak. Ditanya: jumlah seluruhnya. "Setiap … ada sekian" artinya dikali.`,`Kalimat matematika: ${k} × ${ff(a)}.`,...intMulSteps(k,a)],{story:1})},
  ()=>{const [A]=names(1),p=F(1,pick([4,5,6,8,10])),c=R(2,8);const t=mul(p,F(c,1));
    return Q(`${A} mempunyai ${show(t)} kg tepung. Tepung itu dimasukkan ke dalam kantong plastik, masing-masing ${ff(p)} kg. Banyak kantong plastik yang dibutuhkan adalah …`,textOpts(''+c,[''+(c+1),''+Math.max(1,c-1),''+(c*2),''+(c+2)]),
      [`Diketahui: tepung ${show(t)} kg, tiap kantong ${ff(p)} kg. Ditanya: banyak kantong. "Dimasukkan masing-masing" artinya dibagi.`,`Kalimat matematika: ${showImp(t)} : ${ff(p)}.`,`Membagi dengan ${ff(p)} sama dengan mengalikan dengan kebalikannya, yaitu ${p.d}.`,`${showImp(t)} × ${p.d} = ${fr(t.n*p.d,t.d)} = ${c}.`,`Jadi butuh ${c} kantong.`],{story:1})},
  ()=>{const a=rf(),T=a.d*R(3,8);const r=T*a.n/a.d;
    return Q(`Di sekolah ada ${T} siswa kelas 6. Sebanyak ${ff(a)} bagian dari mereka suka sepak bola. Banyak siswa yang suka sepak bola adalah … siswa.`,textOpts(''+r,[''+(T-r),''+(T/a.d),''+(r+a.n),''+(r+1)]),
      [`Diketahui: ${T} siswa, yang suka sepak bola ${ff(a)} bagian. Ditanya: banyak siswa.`,`Kalimat matematika: ${ff(a)} × ${T}.`,`${T} : ${a.d} = ${T/a.d}, lalu ${T/a.d} × ${a.n} = ${r}.`,`Jadi ada ${r} siswa.`],{story:1})},
 ]},
/* 6. OPERASI HITUNG CAMPURAN */
6:{
 biasa:[
  ()=>{const x=rf(),y=rf(),z=rf(),v=R(0,2);let r,w,h,st;const rule='Ingat aturannya: kali (×) dan bagi (:) dikerjakan lebih dulu, baru tambah (+) dan kurang (−).';
    if(v===0){const m=mul(y,z);r=add(x,m);w=mul(add(x,y),z);h=`${ff(x)} + ${ff(y)} × ${ff(z)}`;
      st=[rule,`Langkah 1 – kali dulu: ${ff(y)} × ${ff(z)} = ${chain(y.n*z.n,y.d*z.d)}.`,`Langkah 2 – tambahkan: ${ff(x)} + ${showImp(m)}.`,...sumSteps(x,m,'+')]}
    else if(v===1){const m=mul(x,y);if(val(m)<=val(z))throw 0;r=sub(m,z);w=mul(x,sub(y,z).n>0?sub(y,z):y);h=`${ff(x)} × ${ff(y)} − ${ff(z)}`;
      st=[rule,`Langkah 1 – kali dulu: ${ff(x)} × ${ff(y)} = ${chain(x.n*y.n,x.d*y.d)}.`,`Langkah 2 – kurangkan: ${showImp(m)} − ${ff(z)}.`,...sumSteps(m,z,'−')]}
    else{const m=div(x,y);r=add(m,z);w=div(x,add(y,z));h=`${ff(x)} : ${ff(y)} + ${ff(z)}`;
      st=[rule,`Langkah 1 – bagi dulu: ${ff(x)} : ${ff(y)} = ${ff(x)} × ${fr(y.d,y.n)} = ${showImp(m)}.`,`Langkah 2 – tambahkan: ${showImp(m)} + ${ff(z)}.`,...sumSteps(m,z,'+')]}
    return Q(`Hasil dari <span class="expr">${h}</span> adalah …`,fracOpts(r,[w,add(r,F(1,2))]),st)},
 ],
 konsep:[
  ()=>{const x=pick([0.5,0.25,0.75,0.2]),y=rf(),k=R(2,4);const X=F(Math.round(x*100),100);const m=mul(y,F(k,1)),r=add(X,m);
    return Q(`Hasil dari <span class="expr">${dec(x)} + ${ff(y)} × ${k}</span> adalah …`,fracOpts(r,[mul(add(X,y),F(k,1)),add(X,y)]),
      [`Ubah desimal ke pecahan: ${dec(x)} = ${ff(X)}.`,`Kali dulu (sebelum tambah): ${ff(y)} × ${k} = ${chain(y.n*k,y.d)}.`,`Lalu tambahkan: ${ff(X)} + ${showImp(m)}.`,...sumSteps(X,m,'+')])},
  ()=>{const A=add(F(R(1,3),1),rf()),y=rf(),z=rf();const m=mul(A,y);if(val(m)<=val(z))throw 0;const r=sub(m,z);
    return Q(`Hasil dari <span class="expr">${show(A)} × ${ff(y)} − ${ff(z)}</span> adalah …`,fracOpts(r,[mul(A,sub(y,z).n>0?sub(y,z):y),add(m,z)]),
      [`Ubah pecahan campuran: ${show(A)} = ${showImp(A)}.`,`Kali dulu: ${showImp(A)} × ${ff(y)} = ${chain(A.n*y.n,A.d*y.d)}.`,`Lalu kurangkan: ${showImp(m)} − ${ff(z)}.`,...sumSteps(m,z,'−')])},
 ],
 cerita:[
  ()=>{const S=add(F(R(2,4),1),F(1,2)),b=rf(),u=rf(),k=R(2,3);const tot=add(S,b),use=mul(u,F(k,1)),r=sub(tot,use);if(val(r)<=0)throw 0;
    return Q(`Ibu mempunyai ${show(S)} kg beras. Ibu membeli lagi ${ff(b)} kg. Setiap hari beras dipakai ${ff(u)} kg. Sisa beras setelah ${k} hari adalah … kg.`,fracOpts(r,[sub(tot,u),add(r,u)]),
      [`Diketahui: beras ${show(S)} kg, beli lagi ${ff(b)} kg, dipakai ${ff(u)} kg tiap hari selama ${k} hari. Ditanya: sisa beras.`,`Beras yang dipakai: ${k} × ${ff(u)} = ${show(use)} kg.`,`Beras seluruhnya: ${show(S)} + ${ff(b)} = ${show(tot)} kg.`,`Sisa: ${show(tot)} − ${show(use)} = ${show(r)} kg.`],{story:1})},
  ()=>{const X=R(2,6),a=rf();const used=mul(F(X,1),a),r=sub(F(X,1),used);
    return Q(`Kakak mempunyai ${X} kg terigu. Sebanyak ${ff(a)} bagian dipakai untuk membuat kue. Sisa terigu kakak adalah … kg.`,fracOpts(r,[sub(F(X,1),a),used]),
      [`Diketahui: terigu ${X} kg, dipakai ${ff(a)} bagian. Ditanya: sisa terigu.`,`Terigu yang dipakai: ${ff(a)} × ${X} = ${chain(a.n*X,a.d)}${used.n>used.d&&used.d>1?' = '+show(used):''} kg.`,`Sisa: ${X} − ${show(used)} = ${show(r)} kg.`,`Hati-hati: ${ff(a)} di sini adalah BAGIAN dari ${X} kg, bukan ${ff(a)} kg.`],{story:1})},
 ]}
};
const TOPICS=[[1,'Konsep Pecahan'],[2,'Bentuk Pecahan'],[3,'Membandingkan & Mengurutkan'],[4,'Penjumlahan & Pengurangan'],[5,'Perkalian & Pembagian'],[6,'Operasi Campuran']];
const TIPS={
  1:['Konsep Pecahan','Pecahan = bagian dari keseluruhan yang dibagi sama besar. Angka atas (pembilang) = bagian yang diambil, angka bawah (penyebut) = jumlah semua bagian. Pecahan senilai: kali atau bagi atas dan bawah dengan angka yang sama.'],
  2:['Bentuk Pecahan','Desimal → pecahan: 1 angka di belakang koma = per 10, 2 angka = per 100. Persen = per 100. Pecahan campuran → biasa: (bulat × penyebut) + pembilang. Biasa → campuran: bagi pembilang dengan penyebut.'],
  3:['Membandingkan & Mengurutkan','Samakan penyebut dulu (pakai KPK), lalu bandingkan pembilangnya. Pembilang lebih besar = pecahan lebih besar. Bisa juga ubah semua ke desimal.'],
  4:['Penjumlahan & Pengurangan','Samakan penyebut dulu, lalu jumlahkan/kurangkan pembilangnya saja. Penyebut TIDAK ikut dijumlah. Jangan lupa sederhanakan.'],
  5:['Perkalian & Pembagian','Kali: atas × atas, bawah × bawah. Bagi: balik pecahan kedua, lalu kalikan. "… dari …" artinya dikali.'],
  6:['Operasi Campuran','Kerjakan kali dan bagi lebih dulu, baru tambah dan kurang. Kalau ada kurung, kerjakan isi kurung paling awal.']
};
const KIND={biasa:'Soal biasa',konsep:'Konsep',cerita:'Soal cerita'};
/* seen (opsional) = teks soal yang sudah keluar di sesi ini; soal yang sama dicari gantinya supaya tidak berulang */
function makeQuestion(topics,num,seen){
  const kind=num%3===0?'cerita':num%3===1?'biasa':'konsep';let cadangan=null;
  for(let i=0;i<120;i++){try{const t=pick(topics);const q=pick(GEN[t][kind])();if(q.options.length>=3){q.topic=t;q.kind=kind;const k=q.text+'|'+q.options.map(o=>o.key).sort().join(',');if(!seen||!seen.has(k)){seen?.add(k);return q}cadangan=cadangan||q}}catch(e){}}
  if(cadangan)return cadangan;
  return makeQuestion([1],num,seen);
}
