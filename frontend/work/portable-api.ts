import {mergeLessonProgress} from '../lib/lesson-progress';
import {currencyCode} from '../lib/bottle-details';
import {emptyAcademy,recordAttempt,reviewCard,mergeAcademy,validateLesson} from '../lib/academy-state';
import {validateReference} from '../lib/academy-engine';
import {linkLegacyNotes,saveEntry,importEntries} from '../lib/notebook';
import {initialContent,plans} from '../lib/content';
const key='decant-portable-notebook-v1';
function load(){const raw=localStorage.getItem(key);const s=raw?JSON.parse(raw):{name:'',records:[],progress:[],content:initialContent};if(s.schemaVersion!==4){s.records=linkLegacyNotes(s.records);s.academy=s.academy||emptyAcademy();s.academy.legacyProgress=mergeLessonProgress(s.academy.legacyProgress,s.progress);delete s.progress;s.schemaVersion=4;save(s);}return s;}
function save(s:any){try{localStorage.setItem(key,JSON.stringify(s))}catch{throw new Error('This browser could not save your notebook. Enable browser storage or export your notes before closing.')}}
export async function portableRequest(path:string,body?:any,method='POST'){
const s=load();s.academy=s.academy||emptyAcademy();
if(path==='bootstrap')return {member:{id:'local-notebook',email:'Stored only in this browser',name:s.name,currency:s.currency||'USD',admin:new URLSearchParams(location.search).get('studio')==='1',tier:3,status:'local'},records:s.records,academy:s.academy,progress:s.academy.legacyProgress||[],content:s.content.map((c:any)=>({...c,locked:false,lessonCount:c.body.length})),plans,billingReady:false,launch:null};
if(path==='records'&&method==='DELETE'){s.records=s.records.filter((r:any)=>r.id!==body.id);save(s);return {deleted:true}}
if(path==='records'){const id=body.id||crypto.randomUUID();s.records=saveEntry(s.records,body,id);save(s);return {saved:true,id}}
if(path==='academy/attempt'){s.academy=recordAttempt(s.academy,body,s.records);save(s);return {saved:true}}
if(path==='academy/recall'){s.academy=reviewCard(s.academy,body,s.records);save(s);return {saved:true}}
if(path==='academy/reference'||path==='academy/lesson'){
 if(new URLSearchParams(location.search).get('studio')!=='1')throw new Error('Open studio mode to author Academy content.');
 const bucket=path.endsWith('reference')?'references':'lessons';const entry={...body,id:body.id||crypto.randomUUID()};
 if(bucket==='references'){entry.version=(s.academy.references.find(r=>r.id===entry.id)?.version||0)+1;validateReference(entry);}else validateLesson(entry);
 s.academy[bucket]=[...s.academy[bucket].filter(r=>r.id!==entry.id),entry];save(s);return {saved:true};
}
if(path==='profile'){s.name=String(body.name||'').slice(0,100);s.currency=currencyCode(body.currency||s.currency);save(s);return {saved:true}}
if(path==='content'){if(new URLSearchParams(location.search).get('studio')!=='1')throw new Error('Open studio mode to edit education.');if(!body.title?.trim()||!body.summary?.trim()||!body.body?.length||body.body.some((l:any)=>!l.title?.trim()||!l.body?.trim()))throw new Error('Add a title, summary and lesson text.');const id=body.id||crypto.randomUUID();s.content=s.content.filter((c:any)=>c.id!==id);s.content.push({...body,id});save(s);return {saved:true,id}}
if(path==='progress'){const c=s.content.find((c:any)=>c.id===body.contentId);const lesson=c?.body?.[body.lesson];if(!lesson)throw new Error('Lesson not found.');if(lesson.question&&lesson.answer!==body.answer)throw new Error('Not quite. Revisit the lesson and try again.');s.academy.legacyProgress=s.academy.legacyProgress||[];if(!s.academy.legacyProgress.some((p:any)=>p.content_id===body.contentId&&p.lesson===body.lesson))s.academy.legacyProgress.push({content_id:body.contentId,lesson:body.lesson});save(s);return {saved:true}}
if(path==='import'){if(!Array.isArray(body.bottles)||!Array.isArray(body.notes))throw new Error('Choose a Decant notebook JSON export.');s.records=importEntries(s.records,body);if(body.preferences?.currency)s.currency=currencyCode(body.preferences.currency);if(body.academy)s.academy=mergeAcademy(s.academy,body.academy);if(Array.isArray(body.education))s.content=body.education;s.academy.legacyProgress=mergeLessonProgress(s.academy.legacyProgress,body.progress);save(s);return {saved:true}}
throw new Error('Member accounts and payments require the full backend application. This HTML edition saves only in your browser.');
}
