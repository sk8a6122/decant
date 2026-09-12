import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {rolldown}=await import(pathToFileURL(require.resolve('rolldown',{paths:[require.resolve('vite')]})).href);

const plugin={name:'github-pages-edition',transform(code,id){if(!id.replaceAll('\\','/').endsWith('/app/experience.tsx'))return null;
code=code.replace(/async function request\([^\n]+\n/,'');
code="import {accountRequest} from '../work/account-api';\nimport {AccountBar} from './accounts';\n"+code;
code=code.replace('export default function Experience(){','export default function Experience(){\nconst [request]=useState(()=>accountRequest());');
code=code.replace("history.pushState({},'',v==='overview'?'/':'/?view='+v);","history.replaceState({},'',location.pathname+'?'+new URLSearchParams({...((new URLSearchParams(location.search).get('studio')==='1')?{studio:'1'}:{}),...(v==='overview'?{}:{view:v})}));");
code=code.replace("history.pushState({},'','/?view=academy');","history.replaceState({},'',location.pathname+'?view=academy'+(new URLSearchParams(location.search).get('studio')==='1'?'&studio=1':''));");
code=code.replace('progress:data.progress,academy:data.academy||emptyAcademy()};','progress:data.progress,academy:data.academy||emptyAcademy(),education:data.content};');
code=code.replace('<main className="main" id="main">','<main className="main" id="main"><AccountBar refresh={refresh} request={request} exportData={exportData} ready={!!member && !loading && !error}/>');
return {code,map:null};}};
const bundle=await rolldown({input:'app/client.tsx',platform:'browser',plugins:[plugin],resolve:{alias:{'@':process.cwd()}},transform:{define:{'process.env.NODE_ENV':JSON.stringify('production')},jsx:{runtime:'automatic'}}});
const result=await bundle.generate({format:'iife',minify:true});
const js=result.output.find(o=>o.type==='chunk').code;
const {default:postcss}=await import(pathToFileURL(require.resolve('postcss',{paths:[require.resolve('@tailwindcss/postcss')]})).href);
const {default:tailwind}=await import('@tailwindcss/postcss');
const compiledCss=await postcss([tailwind()]).process(await fs.readFile('app/globals.css','utf8'),{from:process.cwd()+'/app/globals.css'});
const css=compiledCss.css+await fs.readFile('app/wine-lookup.css','utf8');
const favicon='data:image/svg+xml;base64,'+(await fs.readFile('public/favicon.svg')).toString('base64');
const digest=value=>createHash('sha256').update(value).digest('hex').slice(0,12);
await fs.mkdir('../assets',{recursive:true});
const jsName='app-'+digest(js)+'.js',cssName='app-'+digest(css)+'.css';
await fs.writeFile('../assets/'+jsName,js);
await fs.writeFile('../assets/'+cssName,css);
for(const size of [800,1600])await fs.copyFile('public/assets/wine-editorial-'+size+'.webp','../assets/wine-editorial-'+size+'.webp');
const html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#742c46"><title>Decant — Your wine notebook</title><meta name="description" content="Your wine cellar, tasting journal and learning academy."><link rel="icon" href="'+favicon+'"><link rel="stylesheet" href="./assets/'+cssName+'"></head><body><div id="root"><p style="padding:2rem;font-family:Georgia,serif">Opening Decant…</p></div><noscript>Enable JavaScript to use the Decant notebook.</noscript><script src="./catalog-config.js"></script><script src="./supabase-config.js"></script><script defer src="./assets/'+jsName+'"></script><script>if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}</script></body></html>';
await fs.writeFile('../index.html',html);
const version=digest(html+js+css+await fs.readFile('../catalog-config.js','utf8')+await fs.readFile('../supabase-config.js','utf8'));
const precache=['./index.html','./catalog-config.js','./supabase-config.js','./assets/'+jsName,'./assets/'+cssName,'./assets/wine-editorial-800.webp','./assets/wine-editorial-1600.webp'];
const worker=`// Only Decant's static files are cached; catalog requests stay online.
const CACHE='decant-shell-${version}';
const FILES=${JSON.stringify(precache)};
const urls=FILES.map(file=>new URL(file,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('decant-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(event.request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html')){
  event.respondWith((async()=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2000);try{const response=await fetch(event.request,{signal:controller.signal});if(response.ok)return response;}catch{}finally{clearTimeout(timer)}return (await caches.open(CACHE)).match(urls[0]);})());return;
 }
 if(urls.includes(url.href))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
`;
await fs.writeFile('../sw.js',worker);
console.log('Built HTML '+Buffer.byteLength(html)+' bytes; JS '+Math.round(Buffer.byteLength(js)/1024)+' KB; CSS '+Math.round(Buffer.byteLength(css)/1024)+' KB.');
