// Exports athr-mockups.html to Athr-Brand-Identity.pdf (one section per 1280x860 page). Run: node export-pdf.js
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
let h=fs.readFileSync('/home/user/test/athr/athr-mockups.html','utf8');
const css=`<style>
@page{size:1280px 860px;margin:0}
html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#0d0c0b}
body{padding:0 48px!important;margin:0!important}
.hero,.system,.variants,section.item{break-after:page}
.hero,.system,.variants,section.item,.next{box-sizing:border-box;height:858px;overflow:hidden;display:grid;align-content:center}
.hero h1{background:none!important;color:#f6d27a!important;-webkit-text-fill-color:#f6d27a}
.hero{border:0;padding-block:40px}
.system{padding-block:40px;align-content:center}
.variants{padding-block:60px;grid-template-columns:repeat(3,minmax(0,1fr))!important}
.variants .v{aspect-ratio:3/4}
section.item{border:0;padding-block:40px;align-items:center}
section.item .scene{max-height:740px}
.next{border:0;padding-block:60px;align-content:center}
</style>`;
await p.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+h+css+'</body></html>',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
await p.pdf({path:'/home/user/test/athr/Athr-Brand-Identity.pdf',width:'1280px',height:'860px',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
await b.close();})();
