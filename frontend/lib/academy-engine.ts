export type WineStyle='red'|'white'|'rose';
export type Descriptor={term:string;stage?:'primary'|'secondary'|'tertiary'};
export type Grid=Record<string,unknown>;
export type WineReference={id:string;title:string;style:WineStyle;level:1|2|3;regions:string[];grapes:string[];country:string;region:string;parentRegions:string[];vintage:number;quality:string;grid:Grid;aromas:Descriptor[];flavors:string[];clue:string;lwin?:string;referenceVintage?:string;version:number;};
export type Field={label:string;section:string;kind:'list'|'3pt'|'5pt';scale:string[];marks:number;redsOnly?:boolean};
const five=['low','medium-','medium','medium+','high'];
export const FIELDS:Record<string,Field>={
 'app.clarity':{label:'Clarity',section:'Appearance',kind:'list',scale:['clear','hazy'],marks:1},
 'app.intensity':{label:'Color intensity',section:'Appearance',kind:'3pt',scale:['pale','medium','deep'],marks:1},
 'app.colour':{label:'Color',section:'Appearance',kind:'list',scale:[],marks:1},
 'nose.condition':{label:'Condition',section:'Nose',kind:'list',scale:['clean','unclean'],marks:1},
 'nose.intensity':{label:'Aroma intensity',section:'Nose',kind:'5pt',scale:['light','medium-','medium','medium+','pronounced'],marks:1},
 'nose.development':{label:'Development',section:'Nose',kind:'list',scale:['youthful','developing','fully-developed','tiring'],marks:1},
 'pal.sweetness':{label:'Sweetness',section:'Palate',kind:'list',scale:['dry','off-dry','medium-dry','medium-sweet','sweet','luscious'],marks:1},
 'pal.acidity':{label:'Acidity',section:'Palate',kind:'5pt',scale:five,marks:1},
 'pal.tannin':{label:'Tannin',section:'Palate',kind:'5pt',scale:five,marks:1,redsOnly:true},
 'pal.alcohol':{label:'Alcohol',section:'Palate',kind:'3pt',scale:['low','medium','high'],marks:1},
 'pal.body':{label:'Body',section:'Palate',kind:'5pt',scale:['light','medium-','medium','medium+','full'],marks:1},
 'pal.flavIntensity':{label:'Flavor intensity',section:'Palate',kind:'5pt',scale:['light','medium-','medium','medium+','pronounced'],marks:1},
 'pal.finish':{label:'Finish',section:'Palate',kind:'5pt',scale:['short','medium-','medium','medium+','long'],marks:1},
 'con.quality':{label:'Quality',section:'Conclusions',kind:'list',scale:['faulty','poor','acceptable','good','very-good','outstanding'],marks:1},
 'con.readiness':{label:'Readiness',section:'Conclusions',kind:'list',scale:['too-young','drink-or-age','drink-now','too-old'],marks:1}
};
export const COLOURS={red:['purple','ruby','garnet','tawny','brown'],white:['lemon-green','lemon','gold','amber','brown'],rose:['pink','salmon','orange']};
export const READINESS:Record<string,string>={'too-young':'Too young','drink-or-age':'Can drink now but has potential for aging','drink-now':'Drink now, not suitable for aging','too-old':'Too old'};
export const pretty=(v:string)=>READINESS[v]||v.replace('medium-','medium (−)').replace('medium+','medium (+)').replaceAll('-',' ');
export const norm=(value:unknown)=>typeof value==='string'?value.trim().toLowerCase().replace(/\s+/g,' '):'';
export const CATEGORY=new Set(['fruit','berries','red fruit','black fruit','citrus','stone fruit','tropical fruit','green fruit','dried fruit','floral','herbaceous','spice','oak','earthy','savoury','savory','mineral']);
export const fieldScale=(key:string,style:WineStyle)=>key==='app.colour'?COLOURS[style]:FIELDS[key].scale;
export type FieldScore={marks:number;max:number;given:unknown;reference:unknown;message:string;delta?:number;hits?:string[];missed?:string[]};
export type Score={marks:number;max:number;percent:number;byField:Record<string,FieldScore>;messages:string[]};
const finish=(byField:Record<string,FieldScore>,extra:string[]=[]):Score=>{
 const rows=Object.values(byField),marks=rows.reduce((a,b)=>a+b.marks,0),max=rows.reduce((a,b)=>a+b.max,0);
 return {marks,max,percent:max?Math.round(marks/max*100):0,byField,messages:[...extra,...rows.filter(r=>r.message).map(r=>r.message)]};
};
function singular(term:string,accepted:Set<string>){
 const t=norm(term);if(accepted.has(t))return t;
 const candidates=[t.replace(/ies$/,'y'),t.replace(/s$/,'')];
 return candidates.find(c=>accepted.has(c))||t;
}
export function scoreDescriptors(input:unknown,acceptedInput:string[],required:number,label:string):FieldScore{
 const accepted=new Set(acceptedInput.map(norm));
 if(!Array.isArray(input))return {marks:0,max:required,given:input,reference:[...accepted],message:`${label}: enter individual descriptors.`,hits:[],missed:[...accepted]};
 const all=input.map(d=>typeof d==='string'?d:typeof d?.term==='string'?d.term:'').map(d=>singular(d,accepted)).filter(Boolean);
 const categories=[...new Set(all.filter(d=>CATEGORY.has(d)))],specific=[...new Set(all.filter(d=>!CATEGORY.has(d)))],hits=specific.filter(d=>accepted.has(d));
 const messages:string[]=[];
 if(categories.length)messages.push(`${label}: ${categories.join(', ')} ${categories.length===1?'is a category':'are categories'}. Name the fruit, not the basket.`);
 if(specific.length<required)messages.push(`${label}: ${specific.length} specific descriptor${specific.length===1?'':'s'} remain; aim for ${required}.`);
 const missed=[...accepted].filter(d=>!hits.includes(d));
 if(missed.length)messages.push(`The reference also found ${missed.join(', ')}.`);
 return {marks:Math.min(hits.length,required),max:required,given:input,reference:[...accepted],message:messages.join(' '),hits,missed};
}
export function validateReference(ref:WineReference){
 if(!ref||!COLOURS[ref.style]||!ref.id||!ref.title||!Array.isArray(ref.aromas)||!Array.isArray(ref.flavors))throw new Error('Reference is incomplete.');
 for(const [key,f] of Object.entries(FIELDS))if(!(f.redsOnly&&ref.style!=='red')&&!fieldScale(key,ref.style).includes(ref.grid?.[key] as string))throw new Error(`Reference ${f.label.toLowerCase()} is missing or invalid.`);
 if(ref.style!=='red'&&ref.grid['pal.tannin'])throw new Error('Non-red references must omit tannin.');
 if(ref.aromas.some(d=>!['primary','secondary','tertiary'].includes(d.stage||'')))throw new Error('Tag each reference aroma as primary, secondary or tertiary.');
 if(new Set(ref.aromas.map(d=>norm(d.term)).filter(d=>d&&!CATEGORY.has(d))).size<5||new Set(ref.flavors.map(norm).filter(d=>d&&!CATEGORY.has(d))).size<3)throw new Error('Add at least five specific aromas and three flavors.');
 if(!ref.grapes?.length||!ref.country||!ref.region||!Number.isInteger(ref.vintage)||ref.vintage<1900||ref.vintage>2100||!FIELDS['con.quality'].scale.includes(ref.quality))throw new Error('Complete the deduction reference: grape, country, region, vintage and quality.');
 if(!!ref.lwin!==!!ref.referenceVintage)throw new Error('A bottle reference needs both LWIN and the exact vintage.');
}
export function scoreGrid(given:Grid,ref:WineReference):Score{
 validateReference(ref);const rows:Record<string,FieldScore>={},extra:string[]=[];
 for(const [key,f] of Object.entries(FIELDS)){
  if(f.redsOnly&&ref.style!=='red'){if(given[key]!=null&&given[key]!=='')extra.push('Tannin is not assessed for this white or rosé practice grid.');continue;}
  const scale=fieldScale(key,ref.style),value=given[key],g=typeof value==='string'?scale.indexOf(value):-1,r=scale.indexOf(ref.grid[key] as string);
  const row:FieldScore={given:value,reference:ref.grid[key],marks:0,max:f.marks,message:''};
  if(value==null||value==='')row.message=`${f.label}: left blank. An omitted field scores nothing.`;
  else if(g<0)row.message=`${f.label}: choose one value ${f.kind==='3pt'?'on its three-level scale':''}: ${scale.map(pretty).join(', ')}.`;
  else {const d=g-r;if(f.kind==='5pt')row.delta=d;row.marks=d===0?f.marks:f.kind==='5pt'&&Math.abs(d)===1?f.marks/2:0;if(d)row.message=`${f.label}: ${f.kind==='5pt'&&Math.abs(d)===1?'one level away; half credit. ':''}Reference: ${pretty(String(ref.grid[key]))}.`;}
  rows[key]=row;
 }
 rows['nose.aromas']=scoreDescriptors(given['nose.aromas'],ref.aromas.map(d=>d.term),5,'Aromas');
 rows['pal.flavours']=scoreDescriptors(given['pal.flavours'],ref.flavors,3,'Flavors');
 if(Array.isArray(given['nose.aromas'])&&given['nose.aromas'].some(d=>typeof d!=='object'||!['primary','secondary','tertiary'].includes(d?.stage)))extra.push('Tag each aroma as primary, secondary or tertiary. Descriptor marks assess the words; category tags are feedback only.');
 return finish(rows,extra);
}
export const DEDUCTION_WEIGHTS={grape:35,region:25,country:15,vintage:15,quality:10};
const alias=(s:unknown)=>({shiraz:'syrah','pinot grigio':'pinot gris',usa:'united states',us:'united states'}[norm(s)]||norm(s));
export function scoreDeduction(given:Record<string,unknown>,ref:WineReference):Score{
 validateReference(ref);const rows:Record<string,FieldScore>={};
 for(const [key,max] of Object.entries(DEDUCTION_WEIGHTS)){
  const value=given[key],v=alias(value);let fraction=0,reference:unknown=ref[key as keyof WineReference];
  if(key==='grape'){reference=ref.grapes.join(' / ');fraction=ref.grapes.some(g=>alias(g)===v)?1:0;}
  if(key==='region')fraction=v===norm(ref.region)?1:ref.parentRegions.some(p=>norm(p)===v)?0.5:0;
  if(key==='country')fraction=v===alias(ref.country)?1:0;
  if(key==='quality')fraction=v===norm(ref.quality)?1:0;
  if(key==='vintage'){const year=typeof value==='number'?value:typeof value==='string'&&/^\d{4}$/.test(value.trim())?Number(value):NaN;const d=Math.abs(year-ref.vintage);fraction=Number.isInteger(year)&&d<=2?1:Number.isInteger(year)&&d<=4?0.5:0;}
  rows[key]={given:value,reference,marks:max*fraction,max,message:fraction===1?'':`${key[0].toUpperCase()+key.slice(1)}: ${fraction===0.5?'partial credit. ':''}Reference: ${pretty(String(reference))}.`};
 }
 return finish(rows,typeof given.reasoning==='string'&&given.reasoning.trim()?['Your reasoning is saved for reflection; the deterministic score assesses the five conclusion fields.']:['Add a reasoning chain next time: observation → possible grape → place.']);
}
export type RecallState={ease:number;interval:number;due:string;lapses:number};
export const day=(at=new Date())=>`${at.getFullYear()}-${String(at.getMonth()+1).padStart(2,'0')}-${String(at.getDate()).padStart(2,'0')}`;
export function schedule(previous:RecallState|undefined,good:boolean,today:string):RecallState{
 const p=previous||{ease:2.5,interval:1,due:today,lapses:0};
 const interval=good?Math.max(1,Math.round(p.interval*p.ease)):1,ease=good?Math.min(2.8,p.ease+.1):Math.max(1.3,p.ease-.2);
 const d=new Date(today+'T12:00:00');d.setDate(d.getDate()+interval);
 return {ease:Math.round(ease*10)/10,interval,due:day(d),lapses:p.lapses+(good?0:1)};
}
export function calibration(attempts:any[]):string[]{
 const grids=attempts.filter(a=>a.kind==='grid'&&!a.partial&&a.observationSource==='bottle'&&a.referenceSnapshot?.lwin&&a.referenceSnapshot?.referenceVintage);if(grids.length<10)return [];
 return Object.entries(FIELDS).filter(([,f])=>f.kind==='5pt').flatMap(([key,f])=>{
  const deltas=grids.map(a=>a.result?.byField?.[key]?.delta).filter(v=>typeof v==='number'&&Number.isFinite(v));if(deltas.length<10)return [];
  const mean=deltas.reduce((a,b)=>a+b,0)/deltas.length;
  return Math.abs(mean)>=.5?[`Across ${deltas.length} valid calls, you rate ${f.label.toLowerCase()} about ${Math.abs(mean).toFixed(1)} level${Math.abs(mean)>=1.5?'s':''} ${mean<0?'below':'above'} the authored references.`]:[];
 });
}
