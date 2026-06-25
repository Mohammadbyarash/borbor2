/**
 * BorBor Loader Engine — assets/js/borbor-loader.js
 * ─────────────────────────────────────────────────
 * آخر <body> همه صفحات include کن.
 *
 * API عمومی:
 *   window.bbHoldLoader()   ← قبل از fetch/AJAX صدا بزن
 *   window.bbLoaderReady()  ← وقتی render DOM تموم شد صدا بزن
 */
(function () {
  'use strict';

  const loader = document.getElementById('bb-loader');
  const main   = document.getElementById('bb-main');
  const wordEl = document.getElementById('bb-word');
  const tagEl  = document.getElementById('bb-tag');
  const strip  = document.getElementById('bb-strip');
  const canvas = document.getElementById('bb-bg');
  if (!loader || !canvas) return;

  const ctx = canvas.getContext('2d');
  document.body.style.visibility = 'visible';

  /* ── state ── */
  let resourcesReady = false;
  let minTimeDone    = false;
  let manualHold     = false;

  function hideBorBorLoader() {
    if (manualHold) return;
    loader.classList.add('hide');
    if (main) main.style.opacity = '1';
    setTimeout(() => { loader.style.display = 'none'; }, 700);
  }
  function tryHide() {
    if (resourcesReady && minTimeDone && !manualHold) hideBorBorLoader();
  }

  window.bbHoldLoader  = () => { manualHold = true; };
  window.bbLoaderReady = () => { manualHold = false; tryHide(); };

  /* ── canvas ── */
  let W, H;
  function resize() {
    W = canvas.offsetWidth;  canvas.width  = W;
    H = canvas.offsetHeight; canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── particles ── */
  const COLS = ['rgba(74,144,217,','rgba(142,95,212,','rgba(6,214,160,','rgba(255,200,80,'];
  const pts = Array.from({length:70}, () => ({
    x:Math.random()*900, y:Math.random()*600,
    vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4,
    a:Math.random(), va:(Math.random()-.5)*.015,
    r:Math.random()*1.6+.4,
    c:COLS[Math.floor(Math.random()*COLS.length)]
  }));

  /* ── aurora ── */
  let aT = 0;
  function drawAurora() {
    aT += .004;
    [{y:.28,col:'rgba(74,144,217,',amp:32,freq:.6,ph:0},
     {y:.52,col:'rgba(142,95,212,',amp:25,freq:.8,ph:1.2},
     {y:.72,col:'rgba(6,214,160,', amp:20,freq:1.0,ph:2.5}
    ].forEach(b => {
      ctx.save(); ctx.beginPath();
      const by = H*b.y; ctx.moveTo(0, by);
      for (let x=0;x<=W;x+=4) {
        ctx.lineTo(x, by
          + Math.sin((x/W)*Math.PI*b.freq*2+aT+b.ph)*b.amp
          + Math.sin((x/W)*Math.PI*b.freq*3-aT*.7)*b.amp*.4);
      }
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
      const g = ctx.createLinearGradient(0,by-60,0,by+60);
      g.addColorStop(0,b.col+'0)');
      g.addColorStop(.5,b.col+'0.06)');
      g.addColorStop(1,b.col+'0)');
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });
  }

  /* ── render loop ── */
  let animRunning = true;
  function tick() {
    if (!animRunning) return;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(74,144,217,0.035)'; ctx.lineWidth=.5;
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    drawAurora();
    pts.forEach(p => {
      p.x=(p.x+p.vx+W)%W; p.y=(p.y+p.vy+H)%H;
      p.a=Math.max(0,Math.min(1,p.a+p.va));
      if(p.a<=0||p.a>=1) p.va*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c+p.a.toFixed(2)+')'; ctx.fill();
    });
    pts.forEach((p,i) => {
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[j].x-p.x, dy=pts[j].y-p.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<80){
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(74,144,217,${((1-d/80)*.1).toFixed(3)})`;
          ctx.lineWidth=.4; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(tick);
  }
  tick();

  /* ── letters ── */
  const chars=['B','O','R','B','O','R'];
  const accents=new Set([3,4,5]);
  const delays=[0,120,240,480,600,720];

  chars.forEach((ch,i) => {
    if(i===3){
      const dv=document.createElement('div');
      dv.className='bb-divider';
      wordEl.appendChild(dv);
      setTimeout(()=>dv.classList.add('shown'),1100);
    }
    const el=document.createElement('div');
    el.className='bb-ltr'+(accents.has(i)?' accent':'');
    el.innerHTML=`<span class="bb-face">${ch}</span><span class="bb-shad">${ch}</span>`;
    wordEl.appendChild(el);
    setTimeout(()=>{ el.classList.add('shown'); spawnBurst(el); }, delays[i]+200);
  });

  setTimeout(()=> tagEl && tagEl.classList.add('shown'), 1600);
  setTimeout(()=> strip && strip.classList.add('shown'), 2000);

  /* ── burst + beam ── */
  function spawnBurst(el){
    const r=el.getBoundingClientRect(), sr=loader.getBoundingClientRect();
    const cx=r.left-sr.left+r.width/2, cy=r.top-sr.top+r.height/2;
    [60,110,160].forEach((size,k)=>{
      const b=document.createElement('div');
      b.className='bb-burst';
      b.style.cssText=`width:${size}px;height:${size}px;left:${cx-size/2}px;top:${cy-size/2}px;`
        +`animation-delay:${k*.12}s;border-color:${['rgba(74,144,217,.7)','rgba(142,95,212,.5)','rgba(6,214,160,.4)'][k]};`;
      loader.appendChild(b);
      setTimeout(()=>b.remove(),1300);
    });
    const bm=document.createElement('div');
    bm.className='bb-beam'; bm.style.left=cx+'px';
    loader.appendChild(bm);
    setTimeout(()=>bm.remove(),2200);
  }

  /* ── شرایط پنهان شدن ── */
  setTimeout(()=>{ minTimeDone=true; tryHide(); }, 2200);

  function onResourcesReady(){ resourcesReady=true; tryHide(); }

  if(document.fonts && document.fonts.ready){
    Promise.all([
      document.fonts.ready,
      new Promise(res=>{ if(document.readyState==='complete') res(); else window.addEventListener('load',res); })
    ]).then(onResourcesReady);
  } else {
    if(document.readyState==='complete') onResourcesReady();
    else window.addEventListener('load', onResourcesReady);
  }

  /* ── فال‌بک ۸ ثانیه ── */
  setTimeout(()=>{
    if(loader && !loader.classList.contains('hide')){
      console.warn('BorBor Loader: timeout fallback');
      manualHold=false; hideBorBorLoader(); animRunning=false;
    }
  }, 8000);
})();