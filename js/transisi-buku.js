/* Transisi bersama: meja kayu melebar dari tombol yang ditekan, lalu halaman buku terbuka kembali di baliknya. */
(()=>{
  const key='jejak-kembali-ke-buku';
  let leaving=false,curtain=null;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function overlay(){
    if(curtain)return curtain;
    curtain=document.createElement('div');curtain.className='book-return-curtain';
    curtain.setAttribute('role','status');
    curtain.innerHTML='<div class="return-book" aria-hidden="true"></div><span>Kembali ke buku…</span>';
    document.body.appendChild(curtain);return curtain;
  }
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[data-book-return]');
    if(!link||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    e.preventDefault();if(leaving)return;leaving=true;
    try{sessionStorage.setItem(key,JSON.stringify({time:Date.now()}))}catch(_){}
    const el=overlay(),b=link.getBoundingClientRect();
    /* lingkaran melebar dari tombol (atau dari tengah tombol kalau ditekan lewat keyboard) */
    el.style.setProperty('--x',(e.clientX||b.left+b.width/2)+'px');el.style.setProperty('--y',(e.clientY||b.top+b.height/2)+'px');
    void el.offsetWidth;el.classList.add('show');
    window.dispatchEvent(new Event('bookreturn'));
    setTimeout(()=>location.assign(link.href),reduced()?90:760);
  });
  if(document.getElementById('book')){
    let arrived=false;
    try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');arrived=saved&&Date.now()-saved.time<10000;sessionStorage.removeItem(key)}catch(_){}
    if(arrived){
      const el=overlay();el.classList.add('arrived','show');el.querySelector('span').textContent='Jejak Mengajar';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.add('unveil');setTimeout(()=>{el.remove();curtain=null},950)}));
    }
  }
  addEventListener('pageshow',e=>{if(e.persisted){leaving=false;curtain?.remove();curtain=null}});
})();
