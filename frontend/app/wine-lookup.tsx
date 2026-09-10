import React,{useEffect,useRef,useState} from 'react';
export function WineLookup({onSelect}:{onSelect:(wine:any,vintage:string|null)=>void}){
 const [query,setQuery]=useState(''),[result,setResult]=useState<any>(null),[status,setStatus]=useState(''),[loading,setLoading]=useState(false);
 const generation=useRef(0);
 const endpoint=(window as any).DECANT_CATALOG_URL as string|undefined;
 useEffect(()=>{
  const id=++generation.current,controller=new AbortController();setResult(null);setStatus('');setLoading(false);
  if(!endpoint||query.trim().length<2)return ()=>controller.abort();
  setLoading(true);
  const timer=setTimeout(async()=>{
   try{const response=await fetch(endpoint.replace(/\/$/,'')+'/v1/wines?q='+encodeURIComponent(query.trim()),{signal:controller.signal});
    if(!response.ok)throw new Error('unavailable');const data=await response.json();
    if(id===generation.current){setResult(data);setStatus(data.items.length?'':'No matches. Try a producer or wine name, or enter the details below.');}
   }catch(error:any){if(error.name!=='AbortError'&&id===generation.current)setStatus('Wine search is temporarily unavailable. You can still enter the details below.');}
   finally{if(id===generation.current)setLoading(false);}
  },300);
  return()=>{clearTimeout(timer);controller.abort();};
 },[query,endpoint]);
 return <section className="wine-lookup wide" aria-label="Find a wine">
  <label className="field">Find your wine<input type="search" value={query} maxLength={100} placeholder="Try Vietti Barolo or Penfolds Grange 2019" autoComplete="off" onChange={e=>setQuery(e.target.value)} disabled={!endpoint}/></label>
  <p className="lookup-help">{endpoint?'Search by producer, wine, region, or LWIN. Select a match to fill the details below.':'Catalog search is being connected. For now, enter your bottle’s details below.'}</p>
  <div role="status" aria-live="polite">{loading?'Searching wines…':status}</div>
  {result?.correctedQuery&&<p className="lookup-help">Showing matches for “{result.correctedQuery}”.</p>}
  {!!result?.items?.length&&<ul className="wine-results">{result.items.map((wine:any)=><li key={wine.lwin}><button type="button" onClick={()=>{onSelect(wine,result.vintageHint);setQuery('');}}><strong>{wine.displayName}</strong><span>{[wine.country,wine.region,wine.colour].filter(Boolean).join(' · ')} · LWIN {wine.lwin}</span></button></li>)}</ul>}
  <small>Wine identification: <a href="https://www.liv-ex.com/lwin/" target="_blank" rel="noreferrer">LWIN © Liv-ex</a>. <a href="https://www.liv-ex.com/lwin-creative-commons-licence/" target="_blank" rel="noreferrer">Licence</a>. Catalog filtered and normalized for search.</small>
 </section>;
}
