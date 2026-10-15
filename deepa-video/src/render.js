// usage: node render.js out.mp4 [scenesJSON] [audio]
const { chromium } = require('playwright'); const {spawn}=require('child_process');
(async()=>{
 const [out,scenes,audio]=process.argv.slice(2); const FPS=30;
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.log('ERR',e.message));
 if(scenes) await p.addInitScript(s=>{window.SCENES=JSON.parse(s)},scenes);
 await p.goto('file://'+process.cwd()+'/index.html'); await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
 const total=await p.evaluate(()=>TOTAL()); const N=Math.ceil(total*FPS);
 const args=['-y','-loglevel','error','-f','image2pipe','-framerate',''+FPS,'-i','-'];
 if(audio) args.push('-i',audio);
 args.push('-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','18','-r',''+FPS);
 if(audio) args.push('-c:a','aac','-b:a','192k','-shortest');
 args.push(out);
 const ff=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});
 for(let f=0;f<N;f++){ await p.evaluate(t=>render(t),f/FPS); const buf=await p.screenshot({type:'jpeg',quality:92});
   if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(f%300==0) console.log('frame',f,'/',N); }
 ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close(); console.log('done',out,total);
})();
