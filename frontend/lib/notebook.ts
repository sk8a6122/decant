import {currencyCode,validateYears} from './bottle-details.ts';
export type Entry={id:string;kind:string;data:any};
const text=(v:any)=>String(v??'').trim().toLocaleLowerCase();

// Never guess between two lots of the same wine. Keep snapshots if a bottle is removed.
export function linkLegacyNotes(records:Entry[]){
  const bottles=records.filter(r=>r.kind==='bottle');
  for(const note of records.filter(r=>r.kind==='note'&&!r.data.bottleId)){
    const n=note.data;
    const matches=bottles.filter(({data:b})=>text(n.vintage)===text(b.vintage)&&
      (n.lwin&&b.lwin?text(n.lwin)===text(b.lwin):text(n.name)!==''&&text(n.name)===text(b.name)&&text(n.producer)===text(b.producer)));
    if(matches.length===1)note.data={...n,bottleId:matches[0].id};
  }
  return records;
}

export function saveEntry(records:Entry[],body:any,id:string):Entry[]{
  if(!['note','bottle','host'].includes(body.kind))throw new Error('Unknown entry type.');
  const next=structuredClone(records), data={...body.data};
  const previous=next.find(r=>r.id===id);
  if(previous&&previous.kind!==body.kind)throw new Error('Entry type cannot change.');
  if(body.kind==='bottle'){
    data.vintage=validateYears(data);data.currency=currencyCode(data.currency);
    if(data.qty===''||!Number.isInteger(Number(data.qty))||Number(data.qty)<0)throw new Error('Enter a whole bottle quantity of zero or more.');
    data.qty=Number(data.qty);
    if(data.price!==''&&data.price!=null&&(!Number.isFinite(Number(data.price))||Number(data.price)<0))throw new Error('Enter a valid price or leave it blank.');
  }
  if(body.kind==='note'){
    data.rating=Number(data.rating);
    if(!Number.isInteger(data.rating)||data.rating<1||data.rating>5)throw new Error('Choose a rating from 1 to 5.');
    for(const key of ['acidity','tannin','body','finish']){
      if(data[key]==null||data[key]===''){delete data[key];continue;}
      data[key]=Number(data[key]);
      if(!Number.isInteger(data[key])||data[key]<1||data[key]>5)throw new Error('Structure scores must be from 1 to 5.');
    }
    data.consumedBottles=Number(data.consumedBottles||0);
    if(![0,1].includes(data.consumedBottles))throw new Error('Choose whether one bottle was opened.');
    const bottle=next.find(r=>r.kind==='bottle'&&r.id===data.bottleId);
    const oldBottle=next.find(r=>r.kind==='bottle'&&r.id===previous?.data.bottleId);
    if(data.bottleId&&!bottle&&data.bottleId!==previous?.data.bottleId)throw new Error('That bottle is no longer in your cellar.');
    if(!bottle&&(data.bottleId?data.consumedBottles!==Number(previous?.data.consumedBottles||0):data.consumedBottles!==0))throw new Error('Link an available bottle before changing stock.');
    if(bottle){
      if(oldBottle)oldBottle.data.qty=Number(oldBottle.data.qty)+Number(previous?.data.consumedBottles||0);
      if(Number(bottle.data.qty)<data.consumedBottles)throw new Error('There are no bottles left to open. Uncheck the stock change to save a tasting only.');
      bottle.data.qty=Number(bottle.data.qty)-data.consumedBottles;
      for(const key of ['name','producer','vintage','lwin'])data[key]=bottle.data[key];
    }else if(oldBottle){oldBottle.data.qty=Number(oldBottle.data.qty)+Number(previous?.data.consumedBottles||0);}
  }
  if(!String(data.name||'').trim())throw new Error('Please enter a wine name or reflection title.');
  return [{id,kind:body.kind,data},...next.filter(r=>r.id!==id)];
}

export function importEntries(records:Entry[],payload:any):Entry[]{
  if(!Array.isArray(payload.bottles)||!Array.isArray(payload.notes))throw new Error('Choose a Decant notebook JSON export.');
  const next=structuredClone(records),bottleIds=new Map<string,string>();
  for(const [kind,list] of [['bottle',payload.bottles],['note',payload.notes],['host',payload.gatherings||[]]] as const){
    for(const raw of list){
      if(!raw||typeof raw!=='object'||!String(raw.name||'').trim())throw new Error('The notebook contains an invalid entry.');
      const oldId=String(raw.id||'');
      const legacyId='import-'+kind+'-'+(oldId||JSON.stringify(raw));
      const existing=next.find(r=>r.kind===kind&&(r.id===oldId||r.id===legacyId));
      const id=existing?.id||(oldId&&!next.some(r=>r.id===oldId)?oldId:legacyId);
      if(kind==='bottle'&&oldId)bottleIds.set(oldId,id);
      if(existing)continue;
      const {id:ignored,...data}=raw;
      if(kind==='note'&&data.bottleId)data.bottleId=bottleIds.get(String(data.bottleId))||data.bottleId;
      data.tags=Array.isArray(data.tags)?data.tags.join(', '):data.tags;
      // Imported quantities are already snapshots; never replay consumption.
      next.push({id,kind,data});
    }
  }
  return linkLegacyNotes(next);
}

export function catalogWineName(name:string,producer:string){
  const trimmed=String(name||'').trim(),prefix=String(producer||'').trim();
  if(prefix&&trimmed.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase())){
    const remainder=trimmed.slice(prefix.length);
    if(/^[\s,–—-]+/.test(remainder))return remainder.replace(/^[\s,–—-]+/,'')||trimmed;
  }
  return trimmed;
}
