import {scoreDrill,drillFor,type Drill} from './deduction-drill.ts';
import {scoreGrid,scoreDeduction,schedule,day,FIELDS,validateReference,type WineReference,type RecallState,type Score} from './academy-engine.ts';
import {academyLessons,benchmarkReferences,type AcademyLesson} from './academy-content.ts';
export type Attempt={id:string;at:string;kind:'grid'|'deduction'|'mcq'|'drill';contentId:string;title:string;answers:any;result:Score;referenceVersion?:number;drillSnapshot?:Drill;referenceSnapshot?:WineReference;partial?:boolean;observationSource?:'bottle'|'text';bottleId?:string;noteId?:string;elapsedSeconds?:number};
export type AcademyState={version:1;attempts:Attempt[];reviews:{id:string;cardId:string;at:string;good:boolean}[];srs:Record<string,RecallState>;references:WineReference[];lessons:AcademyLesson[]};
export const emptyAcademy=():AcademyState=>({version:1,attempts:[],reviews:[],srs:{},references:[],lessons:[]});
export const referencesFor=(s:AcademyState)=>[...benchmarkReferences.filter(r=>!s.references.some(c=>c.id===r.id)),...s.references];
export const lessonsFor=(s:AcademyState)=>[...academyLessons.filter(r=>!s.lessons.some(c=>c.id===r.id)),...s.lessons];
export function validateLesson(c:AcademyLesson){
 if(!c||!c.id||!c.title?.trim()||!c.summary?.trim()||!['structured','deductive','both'].includes(c.track)||![1,2,3].includes(c.tier)||!Array.isArray(c.body)||!c.body.length||!Array.isArray(c.checks)||!c.checks.length)throw new Error('Complete the title, summary, track, level, lesson and knowledge check.');
 for(const b of c.body){if(!['prose','callout','prompt','term'].includes(b.block)||(b.block==='term'?!(b.term?.trim()&&b.gloss?.trim()):!b.text?.trim()))throw new Error('Every lesson block needs its text.');}
 for(const q of c.checks)if(q.type!=='mcq'||!q.stem?.trim()||!Array.isArray(q.options)||q.options.length<2||q.options.some(o=>!o.trim())||!Number.isInteger(q.answer)||!q.options[q.answer]||!q.why?.trim())throw new Error('Complete the answer options, correct answer and explanation.');
 for(const key of ['topics','regions','grapes','requires','recall'])if(!Array.isArray(c[key]))throw new Error('Lesson metadata must be lists.');
 if(c.recall.some(r=>!r.front?.trim()||!r.back?.trim()))throw new Error('Recall cards need a question and answer.');
}
export function recallCards(state:AcademyState,records:any[]){
 const cards=lessonsFor(state).flatMap(l=>l.recall.map((r,i)=>({id:`lesson:${l.id}:${i}`,source:l.title,...r})));
 for(const r of records.filter(r=>r.kind==='bottle'))for(const key of ['region','country','grapes']){
  const answer=Array.isArray(r.data[key])?r.data[key].join(', '):String(r.data[key]||'').trim();
  if(answer)cards.push({id:`bottle:${r.id}:${key}`,source:'Your cellar · saved details',front:`${r.data.name}${r.data.vintage?' '+r.data.vintage:''}: what ${key==='grapes'?'grapes are':key+' is'} saved?`,back:answer});
 }
 return cards;
}
export function dueCards(s:AcademyState,records:any[],today=day()){
 const remaining=Math.max(0,25-s.reviews.filter(r=>day(new Date(r.at))===today).length);
 return recallCards(s,records).filter(c=>!s.srs[c.id]||s.srs[c.id].due<=today).sort((a,b)=>(s.srs[a.id]?.due||'').localeCompare(s.srs[b.id]?.due||'')).slice(0,remaining);
}
export function recordAttempt(state:AcademyState,body:any,records:any[],at=new Date().toISOString()){
 const s=structuredClone(state);if(!body.id||typeof body.id!=='string')throw new Error('Attempt identifier missing.');
 if(s.attempts.some(a=>a.id===body.id))return s;
 let result:Score,title='',version:number|undefined,referenceSnapshot:WineReference|undefined,answers=body.answers||{},partial=false;
 if(body.kind==='grid'||body.kind==='deduction'||body.kind==='drill'){
  const ref=referencesFor(s).find(r=>r.id===body.contentId);if(!ref)throw new Error('Practice reference not found.');
  if(body.observationSource==='bottle'){
   const bottle=records.find(r=>r.kind==='bottle'&&r.id===body.bottleId);
   if(body.kind==='drill'||!bottle||!ref.lwin||String(ref.lwin)!==String(bottle.data.lwin)||String(ref.referenceVintage)!==String(bottle.data.vintage))throw new Error('Bottle practice requires an exact LWIN and vintage reference.');
  }
  if(body.noteId){
   const note=records.find(r=>r.kind==='note'&&r.id===body.noteId),bottle=records.find(r=>r.kind==='bottle'&&r.id===note?.data.bottleId);
   if(!note||!bottle||!ref.lwin||String(ref.lwin)!==String(bottle.data.lwin)||String(ref.referenceVintage)!==String(bottle.data.vintage))throw new Error('A personal tasting needs an authored reference for its exact LWIN and vintage.');
   answers={};for(const key of ['acidity','tannin','body','finish'])if(note.data[key]!=null&&!(key==='tannin'&&ref.style!=='red'))answers['pal.'+key]=FIELDS['pal.'+key].scale[Number(note.data[key])-1];
   if(!Object.keys(answers).length)throw new Error('This note has no structural calls to compare.');partial=true;
  }
  result=body.kind==='drill'?scoreDrill(answers,ref):body.kind==='grid'?scoreGrid(answers,ref):scoreDeduction(answers,ref);title=ref.title;version=ref.version;referenceSnapshot=structuredClone(ref);
  if(partial){result.byField=Object.fromEntries(Object.entries(result.byField).filter(([k])=>k in answers));const rows=Object.values(result.byField);result.max=rows.reduce((n,r)=>n+r.max,0);result.marks=rows.reduce((n,r)=>n+r.marks,0);result.percent=Math.round(result.marks/result.max*100);result.messages=rows.map(r=>r.message).filter(Boolean);}
 }else if(body.kind==='mcq'){
  const lesson=lessonsFor(s).find(l=>l.id===body.contentId);if(!lesson)throw new Error('Lesson not found.');
  title=lesson.title;const byField=Object.fromEntries(lesson.checks.map((q,i)=>{const correct=answers[i]===q.answer;return [String(i),{given:answers[i],reference:q.options[q.answer],marks:correct?1:0,max:1,message:q.why}];}));const marks=Object.values(byField).reduce((n,r)=>n+r.marks,0),max=lesson.checks.length;result={byField,marks,max,percent:Math.round(marks/max*100),messages:Object.values(byField).map(r=>r.message)};
 }else throw new Error('Unknown exercise type.');
 s.attempts.push({id:body.id,at,kind:body.kind,contentId:body.contentId,title,answers,result,referenceVersion:version,referenceSnapshot,drillSnapshot:body.kind==='drill'&&referenceSnapshot?structuredClone(drillFor(referenceSnapshot)):undefined,partial,observationSource:body.observationSource==='bottle'?'bottle':'text',bottleId:body.observationSource==='bottle'?body.bottleId:undefined,noteId:body.noteId,elapsedSeconds:Number.isFinite(body.elapsedSeconds)?Math.max(0,Math.round(body.elapsedSeconds)):undefined});return s;
}
export function reviewCard(state:AcademyState,body:any,records:any[],at=new Date().toISOString()){
 const s=structuredClone(state);if(s.reviews.some(r=>r.id===body.id))return s;
 if(typeof body.id!=='string'||typeof body.good!=='boolean'||!dueCards(s,records,day(new Date(at))).some(c=>c.id===body.cardId))throw new Error('This card is not in today’s queue.');
 s.srs[body.cardId]=schedule(s.srs[body.cardId],body.good,day(new Date(at)));s.reviews.push({id:body.id,cardId:body.cardId,good:body.good,at});return s;
}
export function mergeAcademy(current:AcademyState,incoming:any):AcademyState{
 if(!incoming||incoming.version!==1||!Array.isArray(incoming.attempts)||!Array.isArray(incoming.references)||!Array.isArray(incoming.lessons)||!Array.isArray(incoming.reviews)||typeof incoming.srs!=='object'||!incoming.srs)throw new Error('Invalid Academy backup.');
 incoming.references.forEach(validateReference);incoming.lessons.forEach(validateLesson);
 for(const a of incoming.attempts){
  if(typeof a.id!=='string'||!['grid','deduction','mcq','drill'].includes(a.kind)||typeof a.at!=='string'||!Number.isFinite(Date.parse(a.at))||!a.result||!Number.isFinite(a.result.percent)||a.result.percent<0||a.result.percent>100||!Number.isFinite(a.result.max)||a.result.max<=0||!Number.isFinite(a.result.marks)||a.result.marks<0||a.result.marks>a.result.max||!a.result.byField||!Array.isArray(a.result.messages))throw new Error('Invalid Academy attempt in backup.');
 }
 const s=structuredClone(current);
 for(const key of ['attempts','reviews','references','lessons'] as const){for(const entry of incoming[key])if(!s[key].some(e=>e.id===entry.id))(s[key] as any[]).push(entry);}
 for(const [key,value] of Object.entries(incoming.srs) as [string,RecallState][]){if(key==='__proto__'||key==='constructor'||key==='prototype')continue;if(!value||!Number.isFinite(value.ease)||value.ease<1.3||value.ease>2.8||!Number.isInteger(value.interval)||value.interval<1||!/^\d{4}-\d{2}-\d{2}$/.test(value.due))throw new Error('Invalid recall schedule.');if(!s.srs[key])s.srs[key]=value;}
 return s;
}
