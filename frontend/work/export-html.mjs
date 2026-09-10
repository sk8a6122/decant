import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {rolldown}=await import(pathToFileURL(require.resolve('rolldown',{paths:[require.resolve('vite')]})).href);
const image='data:image/png;base64,'+(await fs.readFile('public/wine-editorial.png')).toString('base64');
const plugin={name:'portable-edition',transform(code,id){if(!id.replaceAll('\\','/').endsWith('/app/experience.tsx'))return null;
code=code.replace(/async function request\([^\n]+\n/,'');
code="import {portableRequest as request} from '../work/portable-api';\n"+code;
code=code.replace('src="/wine-editorial.png"','src="'+image+'"');
code=code.replace("history.pushState({},'',v==='overview'?'/':'/?view='+v);","history.replaceState({},'',location.pathname+(v==='overview'?'':'?view='+v));");
code=code.replace("history.pushState({},'','/?view=academy');","history.replaceState({},'',location.pathname+'?view=academy');");
code=code.replace('progress:data.progress};','progress:data.progress,education:data.content};');
code=code.replace("['free','unrecognized'].includes(member.status)","['free','unrecognized','local'].includes(member.status)");
code=code.replace('{member.admin&&<div className="panel wide">','{false&&<div className="panel wide">');
code=code.replace('<a className="text-button" href="/signout-with-chatgpt?return_to=%2F" target="_top"><LogOut size={16}/>Sign out</a>','<button type="button" className="text-button" onClick={()=>go(\'overview\')}>Return to notebook</button>');
code=code.replace('<main className="main" id="main">','<main className="main" id="main"><div className="banner">Standalone notebook · Saved in this browser only. Export regularly. Accounts and payments are not connected.</div>');
for(const [a,b] of [
['OWNER ACCESS','LOCAL EDITOR'],['OWNER WORKSPACE','LOCAL EDUCATION EDITOR'],['Owner access','Browser notebook'],['Signed-in email','Storage location'],
['A notebook that travels with you.','Your notebook in this browser. Export it to keep a copy.'],
['You can explore every course and manage education content.','This HTML edition lets you explore every course and edit education locally. It does not create a member account.'],
['Content published to the academy.','Content saved to the academy in this browser. Export your notebook to keep a copy.'],
['Publish to academy','Save in this browser'],['Published in academy','Visible in this browser'],['Draft — owner only','Draft — local preview'],
['Drafts are visible only to the owner.','Drafts are local to this browser.'],
['Articles and courses can be saved as drafts, edited, and published to the membership tier you choose.','Edit articles and courses locally. All lessons are available in this standalone edition; tier labels do not enforce paid access. Export your notebook to save education changes.'],
['Private notebook','Browser notebook'],['Your private cellar','Your personal cellar'],
['Decant uses your signed-in account ID and email to keep your notebook separate from other members. Your profile, cellar entries, tasting notes, hosting plans, and lesson progress are stored for your account.','This standalone HTML edition stores your notebook in this browser’s local storage. It does not sign you in, sync across devices, or create private member accounts.'],
['The site owner manages education content. Your notebook is not displayed to other members. You can export it from your account and remove individual entries.','Anyone using this browser profile may be able to access the notebook. Clearing browser data can remove it. Export regularly; the export includes your education edits and learning progress.'],
['When billing is enabled, checkout and subscription management are handled by the payment provider. Decant does not collect card numbers in its own forms.','Payment buttons show proposed memberships only. No checkout, payment collection, or paid-access protection exists in this HTML edition.'],
['This is an operational data summary. Final launch policies and a contact for account deletion still need to be approved by the owner.','Edits stay in your browser; they do not update the HTML file on GitHub. A public member service requires the backend application and separate launch configuration.']
])code=code.replaceAll(a,b);
return {code,map:null};}};
const bundle=await rolldown({input:'app/client.tsx',platform:'browser',plugins:[plugin],resolve:{alias:{'@':process.cwd()}},transform:{define:{'process.env.NODE_ENV':JSON.stringify('production')},jsx:{runtime:'automatic'}}});
const result=await bundle.generate({format:'iife',minify:true});
const js=result.output.find(o=>o.type==='chunk').code;
const {default:postcss}=await import(pathToFileURL(require.resolve('postcss',{paths:[require.resolve('@tailwindcss/postcss')]})).href);
const {default:tailwind}=await import('@tailwindcss/postcss');
const compiledCss=await postcss([tailwind()]).process(await fs.readFile('app/globals.css','utf8'),{from:process.cwd()+'/app/globals.css'});
const css=compiledCss.css+await fs.readFile('app/wine-lookup.css','utf8');
const favicon='data:image/svg+xml;base64,'+(await fs.readFile('public/favicon.svg')).toString('base64');
const html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#283b2d"><title>Decant — Your wine notebook</title><meta name="description" content="A standalone wine notebook and learning academy."><link rel="icon" href="'+favicon+'"><style>'+css.replaceAll('</style','<\\/style')+'</style></head><body><div id="root"></div><noscript>Enable JavaScript to use the Decant notebook.</noscript><script src="./catalog-config.js"></script><script>'+js.replaceAll('</script','<\\/script')+'</script></body></html>';
await fs.writeFile('../index.html',html);
console.log('Created standalone index.html ('+Math.round(Buffer.byteLength(html)/1024)+' KB).');
