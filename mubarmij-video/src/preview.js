const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('console',m=>console.log('console',m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+process.cwd()+'/index.html'); await p.evaluate(()=>document.fonts.ready); await p.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))}); await p.waitForTimeout(500);
 const ts=process.argv.slice(2).map(Number);
 for(const t of ts){ await p.evaluate(t=>render(t),t); await p.screenshot({path:`prev_${t}.jpg`,type:'jpeg',quality:70}); }
 await b.close();
})();
