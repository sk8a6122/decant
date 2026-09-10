import http from 'node:http';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/index.mjs';
if(!process.env.CATALOG_DB)throw new Error('Set CATALOG_DB to the imported SQLite catalog.');
const sqlite=new DatabaseSync(process.env.CATALOG_DB,{readOnly:true});
const DB={prepare(sql){return {bind(...args){return {async all(){return {results:sqlite.prepare(sql).all(...args)}},async first(){return sqlite.prepare(sql).get(...args)||null}}},async first(){return sqlite.prepare(sql).get()||null}}}};
const origin='http://127.0.0.1:5174';
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin);
 if(url.pathname==='/health'||url.pathname==='/v1/wines'){
  const result=await worker.fetch(new Request(url,{headers:req.headers}),{DB,ALLOWED_ORIGINS:origin});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
 }
 if(url.pathname==='/catalog-config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.DECANT_CATALOG_URL='+JSON.stringify(origin)+';');return;}
 if(url.pathname!=='/'){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await fs.readFile(new URL('../../index.html',import.meta.url)));
}catch{res.writeHead(500);res.end('Preview unavailable');}}).listen(5174,'127.0.0.1',()=>console.log('Decant catalog preview: '+origin));
