/* Browser QA Bab 5 Soal TKA: buku, menu, latihan, skor + pembahasan, PDF, tampilan HP. BROWSER_BIN dapat menunjuk Chrome/Edge. */
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
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(artifacts,'soal-'+name+'.png'),Buffer.from(r.data,'base64'))}
async function waitFor(expression,timeout=6000){for(let elapsed=0;elapsed<timeout;elapsed+=100){if(await evaluate(expression))return;await delay(100)}throw Error('Condition timed out: '+expression)}
const tidakAdaGalat=label=>{if(errors.length){console.error(JSON.stringify(errors,null,1).slice(0,3000));throw Error('Galat JavaScript di '+label)}};
async function buka(url,siap){await send('Page.navigate',{url});await waitFor(siap,20000);await delay(400)}
async function main(){
  server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403).end();return}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');fs.readFile(f,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');res.end(data)})});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  browser=spawn(process.env.BROWSER_BIN||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  browser.on('error',e=>console.error(e.message));const portFile=path.join(profile,'DevToolsActivePort');for(let i=0;!fs.existsSync(portFile);i++){if(i>100)throw Error('Browser unavailable');await delay(100)}
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0],target=await(await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails)};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:10});

  const P=require('../soal/data/latihan-1.js'),butir=require('../soal/js/soal-core.js').datar(P);
  const rupiah=n=>String(n);

  /* buku: Bab 5 */
  await buka(base+'/index.html#6',`document.querySelector('[data-play="soal/index.html"]')`);
  await waitFor(`document.getElementById('whereTxt').textContent==='Bab 5: Soal TKA'`,20000);await delay(900);await shot('buku');tidakAdaGalat('buku');console.log('PASS buku Bab 5');
  await buka(base+'/index.html?toc=1#1',`document.querySelector('[data-go="6"]')`);await delay(900);await shot('toc');console.log('PASS daftar isi');

  /* menu: Try Out nonaktif, PDF di samping Paket 1 */
  await buka(base+'/soal/index.html',`document.querySelector('[data-pdf="latihan-1"]')`);
  assert.equal(await evaluate(`document.getElementById('tabTO').disabled`),true);
  await click('[data-pdf="latihan-1"]');await delay(300);await shot('menu-pdf');
  assert.match(await evaluate(`document.getElementById('pdfCoret').href`),/cetak\.html\?p=latihan-1&mode=coret/);
  tidakAdaGalat('menu');console.log('PASS menu Soal TKA');

  /* latihan: isi lewat antarmuka; benar=true isi kunci, false isi salah semua */
  async function kerjakan(benar){
    await buka(base+'/soal/ujian.html?p=latihan-1',`document.querySelector('.pertanyaan')`);
    for(let i=0;i<butir.length;i++){
      await waitFor(`document.querySelector('.nomor').textContent==='${butir[i].huruf}'&&document.querySelector('.cerita b').textContent==='${butir[i].soal.judul}'`).catch(async e=>{await shot('gagal');console.log(await evaluate('document.querySelector(".nomor").textContent+" "+scrollY+" "+innerHeight'));throw e});
      await waitFor('[...document.images].every(m=>m.complete)');
      for(let j=0;j<butir[i].bagian.length;j++){const g=butir[i].bagian[j];
        if(g.kind==='angka')await evaluate(`(()=>{const e=document.getElementById('in${j}');if(!e)throw Error('butir  bagian : '+document.querySelector('#soal').innerHTML.slice(0,400));e.value=${JSON.stringify(benar?String(g.jawab).replace('.',','):'1')};e.dispatchEvent(new Event('input',{bubbles:true}))})()`);
        else if(g.kind==='pg')await click(`#bag${j} .opsi label:nth-child(${((benar?g.benar:(g.benar+1)%g.opsi.length))+1}) input`);
        else for(let k=0;k<g.baris.length;k++)await click(`tbody tr:nth-child(${k+1}) td:nth-child(${(g.baris[k].benar===benar)?2:3}) input`);
      }
      if(i===2)await click('.nav .ragu');
      if(i<butir.length-1)await click('.nav .btn:last-child');
    }
  }
  await buka(base+'/soal/ujian.html?p=latihan-1',`document.querySelector('.pertanyaan')`);await shot('ujian');
  await kerjakan(true);await shot('ujian-akhir');
  assert.equal(await evaluate(`document.querySelectorAll('#grid .ragu').length`),1);
  await click('.nav .utama');await waitFor(`document.getElementById('dlgSelesai').open`);await shot('konfirmasi');await click('#sOk');
  await waitFor(`!document.getElementById('hasil').hidden`);await delay(300);await shot('hasil');
  assert.equal(await evaluate(`document.querySelector('.skor .angka').textContent`),'100');
  assert.equal(await evaluate(`document.querySelectorAll('.bahas details.n').length`),0);
  await evaluate(`document.querySelector('.bahas details').open=true`);await shot('pembahasan');
  tidakAdaGalat('latihan benar');console.log('PASS latihan: kunci -> skor 100');
  await kerjakan(false);await click('.nav .utama');await click('#sOk');await waitFor(`!document.getElementById('hasil').hidden`);
  assert.equal(await evaluate(`document.querySelector('.skor .angka').textContent`),'0');tidakAdaGalat('latihan salah');console.log('PASS latihan: jawaban salah -> skor 0');

  /* PDF */
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.print=()=>{}'}); // cetak.html membuka dialog cetak sendiri
  for(const mode of ['coret','hemat']){
    await buka(base+'/soal/cetak.html?p=latihan-1&mode='+mode,`document.querySelector('.kertas')&&[...document.images].every(i=>i.complete)`);await delay(400);await shot('pdf-'+mode);
    assert.equal(await evaluate(`document.querySelectorAll('.kertas').length`),mode==='coret'?15:1);
    if(mode==='coret')assert.equal(await evaluate(`document.querySelectorAll('.coret-area').length`),15);
    if(mode==='coret')assert.equal(await evaluate(`[...document.querySelectorAll('.kiri')].every(k=>k.scrollHeight<=k.clientHeight+1)`),true,'butir terpotong di lembar coret-coret');
    const pdf=Buffer.from((await send('Page.printToPDF',{preferCSSPageSize:true,printBackground:true})).data,'base64').toString('latin1');
    const hal=(pdf.match(/\/Type\s*\/Page[^s]/g)||[]).length,pot=/\/MediaBox\s*\[\s*0\s+0\s+(\d+\.?\d*)\s+(\d+\.?\d*)/.exec(pdf);
    assert(+pot[1]>+pot[2],'PDF harus landscape');if(mode==='coret')assert.equal(hal,15,'halaman PDF coret-coret (tidak boleh ada halaman kosong)');
  }
  assert.match(await evaluate(`document.body.textContent`),/Nama:/);tidakAdaGalat('pdf');console.log('PASS PDF coret-coret dan hemat');
  await buka(base+'/soal/cetak.html?p=../x',`document.body.textContent.includes('tidak ditemukan')`);console.log('PASS nama paket tak valid ditolak');

  /* HP */
  await send('Emulation.setDeviceMetricsOverride',{width:400,height:860,deviceScaleFactor:1,mobile:true});
  await buka(base+'/soal/index.html',`document.querySelector('[data-pdf]')`);await shot('hp-menu');
  await buka(base+'/soal/ujian.html?p=latihan-1',`document.querySelector('.pertanyaan')`);await click('#tglNomor');await shot('hp-ujian');
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  tidakAdaGalat('hp');console.log('PASS tampilan HP');
}
main().then(()=>{console.log('Selesai. Tangkapan layar di .qa/');process.exitCode=0}).catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{try{ws?.close()}catch(_){}browser?.kill();server?.close();setTimeout(()=>{try{fs.rmSync(profile,{recursive:true,force:true})}catch(_){}process.exit()},300)});
