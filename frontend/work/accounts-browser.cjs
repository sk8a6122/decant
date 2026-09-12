const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const rows=new Map();let fail=false,conflict=false;
 const id=e=>e.startsWith('alice')?'11111111-1111-4111-8111-111111111111':'22222222-2222-4222-8222-222222222222';
 await page.route('https://lzgtaybhonopjtdyjtcq.supabase.co/**',async route=>{
 const req=route.request(),url=new URL(req.url()),body=req.postDataJSON();let data={};
 if(url.pathname.endsWith('/token')){const uid=id(body.email),jwt='e30.'+Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url')+'.sig';data={access_token:jwt,refresh_token:'refresh',expires_in:3600,token_type:'bearer',user:{id:uid,email:body.email,aud:'authenticated',role:'authenticated'}};}
 if(url.pathname.endsWith('/decant_notebooks')){const uid=(url.searchParams.get('user_id')||'').replace('eq.','')||body?.user_id;if(req.method()==='GET')data=rows.get(uid)||null;else if(fail)return route.fulfill({status:503,contentType:'application/json',body:'{"message":"offline"}'});else if(conflict)data=null;else {rows.set(uid,{notebook:body.notebook,revision:(rows.get(uid)?.revision||0)+1});data={revision:rows.get(uid).revision};}}
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('http://127.0.0.1:8768/');await page.getByRole('button',{name:'Sign in / Create account'}).waitFor();
 async function profile(name){await page.getByRole('button',{name:'Your account',exact:true}).click();await page.getByLabel('Display name').fill(name);await page.getByRole('button',{name:'Save profile',exact:true}).click();}
 await profile('Browser original');await page.getByText('Profile updated.',{exact:true}).waitFor();const original=await page.evaluate(()=>localStorage.getItem('decant-portable-notebook-v1'));
 async function login(email){await page.getByRole('button',{name:'Sign in / Create account'}).click();await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByText('Account notebook · '+email,{exact:true}).waitFor();}
 await login('alice@example.test');await profile('Alice private');await page.getByText('Profile updated.',{exact:true}).waitFor();assert.equal(rows.get(id('alice')).notebook.name,'Alice private');assert.equal(await page.evaluate(()=>localStorage.getItem('decant-portable-notebook-v1')),original);
 await page.reload();await page.getByText('Account notebook · alice@example.test',{exact:true}).waitFor();await page.getByRole('button',{name:'Your account',exact:true}).click();assert.equal(await page.getByLabel('Display name').inputValue(),'Alice private');
 fail=true;await profile('Must not save');await page.getByRole('alert').filter({hasText:'This change was not saved'}).waitFor();assert.equal(rows.get(id('alice')).notebook.name,'Alice private');fail=false;
 conflict=true;await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.getByRole('alert').filter({hasText:'changed on another device'}).waitFor();conflict=false;
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('button',{name:'Sign in / Create account'}).waitFor();assert.equal(await page.getByLabel('Display name').inputValue(),'Browser original');
 await login('bob@example.test');await page.getByRole('button',{name:'Your account',exact:true}).click();assert.equal(await page.getByLabel('Display name').inputValue(),'');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../account-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 console.log('PASS mocked browser checks: sign-in, restore, account isolation, guest preservation, failed writes, conflicts, mobile.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
