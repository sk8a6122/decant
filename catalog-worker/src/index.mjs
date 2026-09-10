export const attribution={name:'LWIN © Liv-ex',url:'https://www.liv-ex.com/lwin/',licenseUrl:'https://www.liv-ex.com/lwin-creative-commons-licence/'};
export function normalize(s){return s.toLowerCase().replaceAll('œ','oe').replaceAll('æ','ae').replaceAll('ß','ss').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ')}
export function parseQuery(value){
  const normalized=normalize(value.slice(0,100));
  const parts=normalized.split(' ').filter(Boolean);let vintage=null;
  // A year typed by the user is a hint to prefill, never a verified production vintage.
  const year=parts.find(t=>/^(18|19|20)\d{2}$/.test(t));
  if(year){vintage=year;parts.splice(parts.indexOf(year),1)}
  if(parts.at(-1)==='nv'){vintage='NV';parts.pop()}
  return {tokens:parts.slice(0,8),vintage,normalized};
}
export function ftsExpression(tokens){return tokens.map(t=>'"'+t.replaceAll('"','')+'"*').join(' AND ')}
function distance(a,b){if(Math.abs(a.length-b.length)>1)return 2;const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let previous=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const next=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));previous=next}}return row[b.length]}
function describe(r){return {lwin:r.lwin,displayName:r.display_name,name:r.wine||r.display_name,producer:r.producer,country:r.country,region:r.region,subRegion:r.sub_region,colour:r.colour,type:r.type,subType:r.sub_type,vintageConfig:r.vintage_config,firstVintage:r.first_vintage,lastVintage:r.final_vintage,sourceUpdated:r.source_updated,style:r.sub_type==='Sparkling'?'Sparkling':r.colour==='Rose'?'Rosé':['Red','White','Rosé'].includes(r.colour)?r.colour:null};}
const querySql=`SELECT c.* FROM wine_search JOIN catalog c ON c.rowid=wine_search.rowid WHERE wine_search MATCH ? AND c.status='Live' AND c.type IN ('Wine','Fortified Wine') ORDER BY rank LIMIT ?`;
async function search(db,tokens,limit){return (await db.prepare(querySql).bind(ftsExpression(tokens),limit).all()).results;}
export async function searchCatalog(db,q,limit=15){
  const {tokens,vintage}=parseQuery(q);
  if(!tokens.length||tokens.join('').length<2)return {items:[],vintageHint:vintage,correctedQuery:null,attribution};
  let results;
  if(tokens.length===1&&/^\d{7}$/.test(tokens[0]))results=(await db.prepare("SELECT * FROM catalog WHERE lwin=? AND status='Live' AND type IN ('Wine','Fortified Wine')").bind(tokens[0]).all()).results;
  else results=await search(db,tokens,limit);
  let correctedQuery=null;
  if(!results.length&&tokens.length<=5){
    const fixed=[...tokens];let changed=false;
    for(let i=0;i<tokens.length;i++){
      const token=tokens[i];if(token.length<4)continue;
      const exists=await db.prepare('SELECT term FROM search_terms WHERE term=?').bind(token).first();if(exists)continue;
      const candidates=(await db.prepare('SELECT term,frequency FROM search_terms WHERE prefix=? ORDER BY frequency DESC LIMIT 150').bind(token.slice(0,2)).all()).results;
      const candidate=candidates.find(c=>distance(token,c.term)===1);
      if(candidate){fixed[i]=candidate.term;changed=true}
    }
    if(changed){results=await search(db,fixed,limit);if(results.length)correctedQuery=fixed.join(' ')}
  }
  return {items:results.map(describe),vintageHint:vintage,correctedQuery,attribution};
}
function cors(req,env){const origin=req.headers.get('Origin');const allowed=(env.ALLOWED_ORIGINS||'https://sk8a6122.github.io').split(',').map(s=>s.trim());return origin&&allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400','Vary':'Origin'}:{'Vary':'Origin'};}
const json=(data,status,headers)=>Response.json(data,{status,headers:{...headers,'X-Content-Type-Options':'nosniff'}});
export default {async fetch(req,env,ctx){
  const headers=cors(req,env);const url=new URL(req.url);
  if(req.headers.has('Origin')&&!headers['Access-Control-Allow-Origin'])return json({error:'This website is not enabled for catalog search.'},403,headers);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='GET')return json({error:'Method not allowed.'},405,headers);
  if(!env.DB)return json({error:'Catalog storage has not been connected.'},503,headers);
  try{
    if(url.pathname==='/health'){
      const record=await env.DB.prepare("SELECT value FROM catalog_meta WHERE key='searchable_wines'").first();
      return json({ready:!!record,searchableWines:record?Number(record.value):0,attribution},record?200:503,headers);
    }
    if(url.pathname!=='/v1/wines')return json({error:'Not found.'},404,headers);
    const q=url.searchParams.get('q')||'';
    if(q.length>100)return json({error:'Use a shorter search.'},400,headers);
    const limit=Math.max(1,Math.min(20,Number.parseInt(url.searchParams.get('limit')||'15',10)||15));
    const cacheKey=new Request(url.origin+'/v1/wines?q='+encodeURIComponent(normalize(q))+'&limit='+limit,{method:'GET'});
    const cache=typeof caches!=='undefined'?caches.default:null;
    const cached=cache?await cache.match(cacheKey):null;
    if(cached)return json(await cached.json(),200,{...headers,'Cache-Control':'public, max-age=300'});
    const result=await searchCatalog(env.DB,q,limit);
    if(cache&&ctx)ctx.waitUntil(cache.put(cacheKey,Response.json(result,{headers:{'Cache-Control':'public, max-age=300'}})));
    return json(result,200,{...headers,'Cache-Control':'public, max-age=300'});
  }catch{return json({error:'Wine search is temporarily unavailable. You can still enter a bottle manually.'},503,{...headers,'Cache-Control':'no-store'})}
}};
