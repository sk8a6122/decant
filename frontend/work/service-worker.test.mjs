import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
test('offline navigation uses the cached shell and leaves catalog requests alone',async()=>{
 const handlers={},stored=new Map(),deleted=[];
 const shell={ok:true,body:'cached notebook'};
 const cache={addAll:async urls=>urls.forEach(u=>stored.set(u,shell)),match:async request=>stored.get(typeof request==='string'?request:request.url)};
 const context={URL,AbortController,setTimeout,clearTimeout,
  self:{registration:{scope:'https://example.test/decant/'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>handlers[name]=fn},
  caches:{open:async()=>cache,keys:async()=>['unrelated-app','decant-shell-old'],delete:async key=>deleted.push(key)},
  fetch:async()=>{throw new Error('offline')}
 };
 vm.runInNewContext(await fs.readFile(new URL('../../sw.js',import.meta.url),'utf8'),context);
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;
 assert.ok(stored.has('https://example.test/decant/index.html'));
 assert.ok([...stored.keys()].some(u=>u.endsWith('.webp')));
 handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['decant-shell-old']);
 let response;handlers.fetch({request:{url:'https://example.test/decant/?view=journal',method:'GET',mode:'navigate'},respondWith:p=>response=p});
 assert.equal(await response,shell);
 let intercepted=false;
 handlers.fetch({request:{url:'https://catalog.example.test/v1/wines?q=barolo',method:'GET',mode:'cors'},respondWith:()=>intercepted=true});
 assert.equal(intercepted,false);
 handlers.fetch({request:{url:'https://example.test/another-app/',method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});
 assert.equal(intercepted,false);
});
