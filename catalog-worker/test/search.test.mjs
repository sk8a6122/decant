import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker,{searchCatalog,parseQuery} from '../src/index.mjs';
const filename=process.env.CATALOG_DB;
if(!filename)throw new Error('Set CATALOG_DB to the imported catalog.sqlite file.');
const sqlite=new DatabaseSync(filename,{readOnly:true});
const DB={prepare(sql){return {bind(...args){return {async all(){return {results:sqlite.prepare(sql).all(...args)}},async first(){return sqlite.prepare(sql).get(...args)||null}}},async first(){return sqlite.prepare(sql).get()||null}}}};
for(const query of ['Vietti Barolo','Château Margaux','chateau mar','Penfolds Grange 2019']){
 const start=performance.now();const result=await searchCatalog(DB,query);
 assert.ok(result.items.length,query);assert.ok(result.items.length<=15);
 assert.ok(result.items.every(w=>['Wine','Fortified Wine'].includes(w.type)));
 assert.equal(new Set(result.items.map(w=>w.lwin)).size,result.items.length);
 const exact=await searchCatalog(DB,result.items[0].lwin);assert.equal(exact.items[0].lwin,result.items[0].lwin);
 console.log(query,result.items.length,Math.round(performance.now()-start)+'ms');
}
assert.equal(parseQuery('Penfolds Grange 2019').vintage,'2019');
assert.equal(parseQuery('Champagne NV').vintage,'NV');
assert.deepEqual((await searchCatalog(DB,'* "')).items,[]);
const env={DB,ALLOWED_ORIGINS:'https://sk8a6122.github.io'};
const request=(path,init)=>worker.fetch(new Request('https://catalog.example'+path,init),env);
assert.equal((await request('/health')).status,200);
assert.equal((await request('/v1/wines?q=barolo',{headers:{Origin:'https://evil.example'}})).status,403);
const allowed=await request('/v1/wines?q=barolo&limit=200',{headers:{Origin:'https://sk8a6122.github.io'}});
assert.equal(allowed.headers.get('Access-Control-Allow-Origin'),'https://sk8a6122.github.io');
assert.equal((await allowed.json()).items.length,20);
assert.equal((await request('/v1/wines?q='+ 'x'.repeat(101))).status,400);
assert.equal((await request('/v1/wines',{method:'POST'})).status,405);
sqlite.close();console.log('Catalog search and HTTP checks passed.');
