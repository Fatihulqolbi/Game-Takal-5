/* Browser QA Bab 4 Penyajian Data, tanpa dependensi npm. BROWSER_BIN dapat menunjuk Chrome/Edge.
   Memeriksa: buku Bab 4, menu, sepuluh mode Lab, Detektif Data 4 pemain (sentuhan bersamaan), dan Koki Data 2 pemain (tabel dan pizza diisi bersamaan). */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),artifacts=path.join(root,'.qa');fs.mkdirSync(artifacts,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'data-browser-'));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let server,browser,ws,seq=0;const pending=new Map(),errors=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method))},15000);pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}});ws.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function point(selector){return evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`)}
async function click(selector){const p=await point(selector);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p})}
/* beberapa jari menyentuh bersamaan */
async function tapBersama(selectors){const pts=[];for(const s of selectors)pts.push(await point(s));const tp=pts.map((p,i)=>({x:p.x,y:p.y,id:i+1,radiusX:4,radiusY:4,force:1}));
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp});await delay(250);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
/* empat jari sintetis: semua pointerdown dulu, lalu semua pointerup (ID jari berbeda) */
async function tapSintetis(selectors){await evaluate(`(()=>{const el=${JSON.stringify(selectors)}.map(s=>{const e=document.querySelector(s);if(!e)throw Error('Missing '+s);return e});
  const ev=(t,e,i)=>e.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:20+i,pointerType:'touch',isPrimary:i===0}));el.forEach((e,i)=>ev('pointerdown',e,i));el.forEach((e,i)=>ev('pointerup',e,i))})()`)}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(artifacts,'data-'+name+'.png'),Buffer.from(r.data,'base64'))}
async function waitFor(expression,timeout=6000){for(let elapsed=0;elapsed<timeout;elapsed+=100){if(await evaluate(expression))return;await delay(100)}throw Error('Condition timed out: '+expression)}
async function buka(url,siap){await send('Page.navigate',{url});await waitFor(siap,20000);await delay(400)}
const tidakAdaGalat=label=>{if(errors.length){console.error(JSON.stringify(errors,null,1).slice(0,3000));throw Error('Galat JavaScript di '+label)}};
async function pilihTokoh(n){await waitFor(`LombaData.screen==='pick'`);for(let i=0;i<n;i++){await click('#pickCards .ccard:nth-child('+(i+1)+')');await delay(60);await click('#pickGo');await delay(100)}await waitFor(`LombaData.screen==='setup'`)}
/* selektor jawaban benar untuk pemain i (PG, MCMA, atau Kategori) */
async function jawabBenar(i){const pre=`.arena:nth-child(${i+1}) `,q=await evaluate(`(q=>({tipe:q.tipe,benar:q.benar}))(LombaData.session.players[${i}].q)`);
  if(q.tipe==='pg')return[pre+`[data-opsi="${q.benar}"]`];
  if(q.tipe==='multi'){for(let j=0;j<q.benar.length;j++)if(q.benar[j])await click(pre+`[data-opsi="${j}"]`)}else for(let j=0;j<q.benar.length;j++)await click(pre+`[data-pernyataan="${j}"][data-nilai="${q.benar[j]}"]`);
  return[pre+'[data-kunci]']}
async function main(){
  server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403).end();return}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');fs.readFile(f,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');res.end(data)})});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  browser=spawn(process.env.BROWSER_BIN||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  browser.on('error',e=>console.error(e.message));const portFile=path.join(profile,'DevToolsActivePort');for(let i=0;!fs.existsSync(portFile);i++){if(i>100)throw Error('Browser unavailable');await delay(100)}
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0],target=await(await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails)};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:10});

  /* buku: Bab 4 */
  await buka(base+'/index.html#5',`document.querySelector('[data-play="data/index.html"]')`);
  await waitFor(`document.getElementById('whereTxt').textContent==='Bab 4: Penyajian Data'`,20000).catch(async e=>{console.log(await evaluate('location.href+" | "+document.getElementById("whereTxt").textContent'));throw e});await delay(900);await shot('buku');tidakAdaGalat('buku');console.log('PASS buku Bab 4');

  /* menu */
  await buka(base+'/data/index.html',`typeof DataScene!=='undefined'&&MenaraScene.ready`);await delay(700);await click('[data-hello="2"]');await delay(300);await shot('menu');tidakAdaGalat('menu');console.log('PASS menu Penyajian Data');

  /* Lab: sepuluh mode */
  await buka(base+'/data/lab.html',`typeof DataLab!=='undefined'`);
  await click('[data-fase="rapi"]');await delay(900);await shot('lab-rapi');await click('[data-fase="diagram"]');await delay(900);await shot('lab-diagram');
  assert.equal(await evaluate(`document.querySelector('.rapi').dataset.fase`),'diagram');
  await click('[data-tab="turus"]');await delay(300);await click('[data-auto]');await waitFor(`!document.getElementById('kuisTunggu')||document.getElementById('kuisTunggu').hidden`,25000);await delay(300);await shot('lab-turus');
  await click('#kuisTurus .answer-option, #kuisTurus [data-p]');await delay(1500);
  await click('[data-tab="pikto"]');await delay(300);await evaluate(`document.querySelector('.da-ikon').dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))`);await delay(200);
  assert(await evaluate(`document.querySelectorAll('.da-lencana').length>0`),'ikon dibedah');await shot('lab-pikto');
  await click('[data-tab="garis"]');await delay(300);await evaluate(`document.querySelector('.garis-lab .da-bar').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);await delay(2600);await shot('lab-garis');
  await click('[data-tab="potong"]');await delay(300);
  for(const i of[0,2]){await evaluate(`document.querySelectorAll('.potong-lab .da-bar')[${i}].dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))`);await delay(100)}
  await click('[data-op="selisih"]');await delay(4200);await shot('lab-selisih');await click('#kembali');await delay(200);
  for(const i of[0,1,2]){await evaluate(`document.querySelectorAll('.potong-lab .da-bar')[${i}].dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))`);await delay(80)}
  await evaluate(`document.querySelectorAll('.potong-lab .da-bar')[2].dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))`);
  await click('[data-op="jumlah"]');await delay(4500);await shot('lab-jumlah');
  await click('[data-tab="sajian"]');await delay(300);await click('[data-ubah="1"][data-i="0"]');await click('[data-lihat="piktogram"]');await delay(200);await shot('lab-sajian');
  await click('[data-tab="lingkaran"]');await delay(300);await click('[data-top="1"]');await click('[data-acak]');await delay(200);await click('[data-rapikan]');await delay(500);
  assert(await evaluate(`!document.getElementById('soalPie').disabled`),'pizza penuh');await shot('lab-pizza');await click('#soalPie');await delay(300);await click('#kuis .answer-option, #kuis [data-p]');await delay(3500);await shot('lab-pizza-kuis');
  await click('[data-tab="dgaris"]');await delay(300);await click('[data-batang]');await delay(400);await shot('lab-dgaris');await click('[data-bongkar]');await delay(6500);await shot('lab-dgaris-bongkar');
  assert(await evaluate(`document.querySelectorAll('.garis2-lab .da-garis').length===1`),'editor garis kembali');
  await click('[data-tab="frekuensi"]');await delay(300);await tapBersama(['.frek-angka[data-m="0"]','.frek-angka[data-m="1"]','.frek-angka[data-m="2"]']);await delay(150);
  assert.equal(await evaluate(`document.querySelectorAll('.frek-angka:disabled').length`),3,'tiga jari mengetuk data mentah');
  await click('[data-urut]');await click('[data-auto]');await waitFor(`document.getElementById('kuisTunggu').hidden`,25000);await delay(300);await shot('lab-frekuensi');
  await click('[data-tab="survei"]');await delay(300);
  /* empat murid mengetuk bersamaan */
  await tapBersama(['.survei-btn[data-v="0"]','.survei-btn[data-v="1"]','.survei-btn[data-v="2"]','.survei-btn[data-v="3"]']);await delay(150);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.survei-btn i')].map(e=>+e.textContent)`),[1,1,1,1],'empat sentuhan bersamaan terhitung');
  for(let k=0;k<6;k++){await tapBersama(['.survei-btn[data-v="'+(k%2)+'"]']);await delay(60)}
  await click('#buatSoal');await delay(400);await shot('lab-survei');tidakAdaGalat('lab');console.log('PASS Lab Data: 10 mode, sentuhan bersamaan di Survei Kelas dan Tabel frekuensi');

  /* Detektif Data: 4 pemain, menjawab bersamaan */
  await buka(base+'/data/lomba.html?mode=detektif',`typeof LombaData!=='undefined'&&MenaraScene.ready`);await shot('lomba-home');
  await click('[data-players="4"]');await pilihTokoh(4);await evaluate(`document.getElementById('level').value='2';document.getElementById('level').dispatchEvent(new Event('change'))`);await click('.start-btn');
  await waitFor(`LombaData.session?.status==='play'`,7000);await delay(500);await shot('detektif-soal');
  for(let ronde=0;ronde<3;ronde++){const target=[];for(let i=0;i<4;i++)target.push(...await jawabBenar(i));await tapSintetis(target);
    await waitFor(`LombaData.session.players.every(p=>p.phase==='hasil')`);if(ronde===0){await delay(2200);await shot('detektif-bahas')}
    assert.deepEqual(await evaluate(`LombaData.session.players.map(p=>p.benar)`),[ronde+1,ronde+1,ronde+1,ronde+1],'semua jawaban benar terhitung');
    await tapSintetis([0,1,2,3].map(i=>`.arena:nth-child(${i+1}) [data-lanjut]`));await waitFor(`LombaData.session.players.every(p=>p.phase==='tanya')`)}
  const kembar=await evaluate(`(()=>{const k=LombaData.session.players.flatMap(p=>p.riwayat.map(h=>DT.kunciSoal(h.q)));return k.length-new Set(k).size})()`);assert.equal(kembar,0,'soal antarpemain tidak kembar');
  await click('#pauseGame');await click('#endGame');await waitFor(`LombaData.screen==='results'`);await delay(1600);await shot('detektif-juara');
  await click('#showReview');await delay(200);assert(await evaluate(`document.querySelectorAll('#reviewContent .review-item').length===12`));await click('#closeReview');
  tidakAdaGalat('detektif');console.log('PASS Detektif Data: 4 pemain menjawab bersamaan, pembahasan beranimasi, podium, ulasan');

  /* Koki Data: 2 pemain. Tabel diisi bersamaan, lalu pizza diwarnai dua jari di dua arena (atau gelas jus diseret) */
  await buka(base+'/data/lomba.html?mode=koki',`typeof LombaData!=='undefined'&&MenaraScene.ready`);
  await click('[data-players="2"]');await pilihTokoh(2);await click('.start-btn');await waitFor(`LombaData.session?.status==='play'`,7000);await delay(300);
  const pesanan=await evaluate(`LombaData.session.players.map(p=>p.data.nilai)`);
  await click('.arena:nth-child(2) [data-cek]');await delay(150);assert(await evaluate(`LombaData.session.players[1].coba===1&&!!document.querySelector('.arena:nth-child(2) .koki-baris.salah')`),'tabel salah ditandai');
  await tapSintetis(['.arena:nth-child(1) [data-tiket="0"]','.arena:nth-child(2) [data-tiket="1"]']);
  assert.deepEqual(await evaluate(`[1,2].map(i=>document.querySelectorAll('.arena:nth-child('+i+') .tiket[aria-pressed="true"]').length)`),[1,1],'kertas pesanan dicoret');
  for(let k=0;k<Math.max(...pesanan.flat());k++){const t=[];pesanan.forEach((v,i)=>v.forEach((x,r)=>{if(k<x)t.push(`.arena:nth-child(${i+1}) [data-tambah="${r}"][data-arah="1"]`)}));await tapSintetis(t)}
  assert.deepEqual(await evaluate(`LombaData.session.players.map(p=>p.tabel.join())`),pesanan.map(v=>v.join()),'tabel terisi dengan jari bersamaan');await shot('koki-tabel');
  await tapSintetis(['.arena:nth-child(1) [data-cek]','.arena:nth-child(2) [data-cek]']);await waitFor(`LombaData.session.players.every(p=>p.phase==='saji')`,5000);await delay(300);
  const hasil=await evaluate(`(()=>{const ps=LombaData.session.players,ev=(el,t,id,x,y)=>el.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',clientX:x,clientY:y}));
    const pt=(p,k)=>{const svg=p.pizza.svg,n=p.data.total,m=-Math.PI/2+(k+.5)*2*Math.PI/n,q=svg.createSVGPoint();q.x=170+105*Math.cos(m);q.y=170+105*Math.sin(m);return q.matrixTransform(svg.getScreenCTM())};
    const pie=ps.filter(p=>p.pizza);
    for(let t=0;t<5;t++){const aktif=pie.filter(p=>t<p.data.label.length);if(!aktif.length)break;
      aktif.forEach(p=>{const b=p.el.querySelector('[data-topping="'+t+'"]');ev(b,'pointerdown',90+p.i);ev(b,'pointerup',90+p.i)});
      const mulai=aktif.map(p=>p.data.nilai.slice(0,t).reduce((a,b)=>a+b,0));
      aktif.forEach((p,j)=>{const a=pt(p,mulai[j]);ev(p.pizza.svg,'pointerdown',40+p.i,a.x,a.y)});
      for(let s=1;s<20;s++)aktif.forEach((p,j)=>{if(s<p.data.nilai[t]){const a=pt(p,mulai[j]+s);ev(p.pizza.svg,'pointermove',40+p.i,a.x,a.y)}});
      aktif.forEach(p=>ev(p.pizza.svg,'pointerup',40+p.i))}
    ps.filter(p=>p.editor).forEach(p=>p.editor.set(p.data.nilai));
    return ps.map(p=>p.pizza?'pizza:'+(p.pizza.hitung().join()===p.data.nilai.join()):'jus')})()`);
  console.log('  sajian Koki:',hasil.join(', '));assert(hasil.every(h=>h!=='pizza:false'),'dua jari mewarnai pizza');await shot('koki-saji');
  await tapSintetis(['.arena:nth-child(1) [data-cek]','.arena:nth-child(2) [data-cek]']);await delay(400);await shot('koki-rapi');
  await waitFor(`LombaData.session.players.every(p=>p.phase==='tanya')`,5000);assert.deepEqual(await evaluate('LombaData.session.players.map(p=>p.diagram)'),[2,2],'tabel dan sajian tepat');
  await tapSintetis([...await jawabBenar(0),...await jawabBenar(1)]);await waitFor(`LombaData.session.players.every(p=>p.phase==='hasil')`);await delay(2500);await shot('koki-bahas');
  assert.deepEqual(await evaluate('LombaData.session.players.map(p=>p.benar+p.diagram)'),[3,3]);
  await tapSintetis(['.arena:nth-child(1) [data-lanjut]']);await waitFor(`LombaData.session.players[0].phase==='hitung'&&LombaData.session.players[0].ronde===1`);
  await click('#pauseGame');await click('#endGame');await waitFor(`LombaData.screen==='results'`);await delay(1500);await shot('koki-juara');
  tidakAdaGalat('koki');console.log('PASS Koki Data: tabel diisi bersamaan, pizza diwarnai dua jari, pertanyaan pelanggan, podium');

  /* layar kecil (HP) tetap bisa dipakai */
  await send('Emulation.setDeviceMetricsOverride',{width:420,height:860,deviceScaleFactor:1,mobile:true});await buka(base+'/data/lab.html#potong',`typeof DataLab!=='undefined'`);await shot('hp-lab');
  await buka(base+'/data/lomba.html',`typeof LombaData!=='undefined'&&MenaraScene.ready`);await click('[data-players="1"]');await pilihTokoh(1);await click('.start-btn');await waitFor(`LombaData.session?.status==='play'`,7000);await delay(300);await shot('hp-detektif');
  tidakAdaGalat('hp');console.log('PASS tampilan HP');
}
main().then(()=>{console.log('Selesai. Tangkapan layar di .qa/');process.exitCode=0}).catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{try{ws?.close()}catch(_){}browser?.kill();server?.close();setTimeout(()=>{try{fs.rmSync(profile,{recursive:true,force:true})}catch(_){}process.exit()},300)});
