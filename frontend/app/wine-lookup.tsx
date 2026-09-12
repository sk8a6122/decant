import React,{useEffect,useId,useRef,useState} from 'react';
export function WineLookup({onSelect,scanSearch,purpose='bottle'}:{purpose?:'bottle'|'pairing';onSelect:(wine:any,vintage:string|null)=>void;scanSearch?:{query:string;vintage:string;id:number}}){
 const [query,setQuery]=useState(''),[result,setResult]=useState<any>(null),[status,setStatus]=useState(''),[loading,setLoading]=useState(false);
 const generation=useRef(0);
 useEffect(()=>{if(scanSearch){setQuery(scanSearch.query);setExpanded(false)}},[scanSearch]);
 const listId=useId(),[active,setActive]=useState(-1),[expanded,setExpanded]=useState(false);
 const items=result?.items||[],isOpen=expanded&&items.length>0;
 const select=(wine:any)=>{onSelect(wine,scanSearch?.query===query?scanSearch.vintage||result.vintageHint:result.vintageHint);setQuery('');setResult(null);setExpanded(false);setActive(-1);};
 const endpoint=(window as any).DECANT_CATALOG_URL as string|undefined;
 useEffect(()=>{
  const id=++generation.current,controller=new AbortController();setResult(null);setStatus('');setLoading(false);setActive(-1);
  if(!endpoint||query.trim().length<2)return ()=>controller.abort();
  setLoading(true);
  const timer=setTimeout(async()=>{
   try{const response=await fetch(endpoint.replace(/\/$/,'')+'/v1/wines?q='+encodeURIComponent(query.trim().replace(/^lwin\s*[:#]?\s+(?=\d)/i,'')),{signal:controller.signal});
    if(!response.ok)throw new Error('unavailable');const data=await response.json();
    if(id===generation.current){setResult(data);setExpanded(true);setStatus(data.items.length?`${data.items.length} wine${data.items.length===1?'':'s'} found. Use up and down arrows to explore, then Enter to select.`:(purpose==='pairing'?'No catalog matches. Try another bottle name, or the grape/style search above.':'No matches. Try a producer or wine name, or enter the details below.'));}
   }catch(error:any){if(error.name!=='AbortError'&&id===generation.current)setStatus(purpose==='pairing'?'Wine search is temporarily unavailable. Try the grape or style search above.':'Wine search is temporarily unavailable. You can still enter the details below.');}
   finally{if(id===generation.current)setLoading(false);}
  },300);
  return()=>{clearTimeout(timer);controller.abort();};
 },[query,endpoint,purpose]);
 return <section className="wine-lookup wide" aria-label="Find a wine">
  <label className="field">{purpose==='pairing'?'Find a bottle in the wine catalog':'Find your wine'}<input role="combobox" aria-autocomplete="list" aria-expanded={!!isOpen} aria-controls={listId} aria-activedescendant={isOpen&&active>=0?`${listId}-${active}`:undefined} type="search" value={query} maxLength={100} placeholder="Try Vietti Barolo or Penfolds Grange 2019" autoComplete="off" onChange={e=>{setQuery(e.target.value);setExpanded(false);setActive(-1);}} onFocus={()=>setExpanded(true)} onBlur={()=>setExpanded(false)} onKeyDown={e=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setExpanded(false);setActive(-1);}
   if((e.key==='ArrowDown'||e.key==='ArrowUp')&&items.length){e.preventDefault();setExpanded(true);const next=e.key==='ArrowDown'?(active+1)%items.length:(active<=0?items.length-1:active-1);setActive(next);document.getElementById(`${listId}-${next}`)?.scrollIntoView({block:'nearest'});}
   if(e.key==='Enter'&&isOpen&&active>=0){e.preventDefault();select(items[active]);}
  }} disabled={!endpoint}/></label>
  <p className="lookup-help">{endpoint?(purpose==='pairing'?'Search by producer, bottle name, region, or LWIN. Select a bottle to see food suggestions.':'Search by producer, wine, region, or LWIN. Select a match to fill the details below.'):(purpose==='pairing'?'Catalog search is unavailable. Use the grape/style search above.':'Catalog search is being connected. For now, enter your bottle’s details below.')}</p>
  <div role="status" aria-live="polite">{loading?'Searching wines…':status}</div>
  {result?.correctedQuery&&<p className="lookup-help">Showing matches for “{result.correctedQuery}”.</p>}
  <ul id={listId} role="listbox" aria-label="Wine matches" className="wine-results" hidden={!isOpen}>{isOpen&&items.map((wine:any,i:number)=><li role="option" id={`${listId}-${i}`} aria-selected={active===i} key={wine.lwin} onMouseDown={e=>e.preventDefault()} onClick={()=>select(wine)}><strong>{wine.displayName}</strong><span>{[wine.country,wine.region,wine.color].filter(Boolean).join(' · ')} · LWIN {wine.lwin}</span></li>)}</ul>
  <small>Wine identification: <a href="https://www.liv-ex.com/lwin/" target="_blank" rel="noreferrer">LWIN © Liv-ex</a>. <a href="https://www.liv-ex.com/lwin-creative-commons-licence/" target="_blank" rel="noreferrer">Licence</a>. Catalog filtered and normalized for search.</small>
 </section>;
}
