import {mergeLessonProgress} from '../lib/lesson-progress';
import {currencyCode} from '../lib/bottle-details';
import {emptyAcademy,recordAttempt,reviewCard,mergeAcademy,validateLesson} from '../lib/academy-state';
import {validateReference} from '../lib/academy-engine';
import {linkLegacyNotes,saveEntry,importEntries} from '../lib/notebook';
import {initialContent} from '../lib/content';
export const localNotebookKey='decant-portable-notebook-v1';
export function freshNotebook(){return {schemaVersion:4,name:'',records:[],content:structuredClone(initialContent),academy:emptyAcademy()};}
export function readLocalNotebook(){const raw=localStorage.getItem(localNotebookKey);return raw?JSON.parse(raw):freshNotebook();}
function saveLocal(s:any){try{localStorage.setItem(localNotebookKey,JSON.stringify(s))}catch{throw new Error('This browser could not save your notebook. Export your notes before closing.')}}
export function createNotebookRequest(storage:{read:()=>Promise<any>;write:(s:any)=>Promise<void>;member:()=>any}){
 return (path:string,body?:any,method='POST')=>runRequest(path,body,method,storage);
}
export const portableRequest=createNotebookRequest({read:async()=>readLocalNotebook(),write:async s=>saveLocal(s),member:()=>({id:'local-notebook',email:'Stored only in this browser',status:'local'})});
async function runRequest(path:string,body:any,method:string,storage:any){
const s=await storage.read()||freshNotebook();
const save=(next:any)=>storage.write(next);
if(s.schemaVersion!==4){s.records=linkLegacyNotes(s.records);s.academy=s.academy||emptyAcademy();s.academy.legacyProgress=mergeLessonProgress(s.academy.legacyProgress,s.progress);delete s.progress;s.schemaVersion=4;}
s.academy=s.academy||emptyAcademy();
// Stock education published after a notebook was created still has to reach it. Existing entries are never overwritten.
s.content=Array.isArray(s.content)?s.content:[];
const newlyPublished=initialContent.filter(c=>!s.content.some((x:any)=>x.id===c.id));
if(newlyPublished.length)s.content=[...s.content,...structuredClone(newlyPublished)];
if(path==='bootstrap')return {member:{...storage.member(),name:s.name,currency:s.currency||'USD',admin:new URLSearchParams(location.search).get('studio')==='1',tier:0},records:s.records,academy:s.academy,progress:s.academy.legacyProgress||[],content:s.content.map((c:any)=>({...c,locked:false,lessonCount:c.body.length})),plans:[],billingReady:false,launch:null};
if(path==='records'&&method==='DELETE'){s.records=s.records.filter((r:any)=>r.id!==body.id);await save(s);return {deleted:true}}
if(path==='records'){const id=body.id||crypto.randomUUID();s.records=saveEntry(s.records,body,id);await save(s);return {saved:true,id}}
if(path==='academy/attempt'){s.academy=recordAttempt(s.academy,body,s.records);await save(s);return {saved:true}}
if(path==='academy/recall'){s.academy=reviewCard(s.academy,body,s.records);await save(s);return {saved:true}}
if(path==='academy/reference'||path==='academy/lesson'){
 if(new URLSearchParams(location.search).get('studio')!=='1')throw new Error('Open studio mode to author Academy content.');
 const bucket=path.endsWith('reference')?'references':'lessons';const entry={...body,id:body.id||crypto.randomUUID()};
 if(bucket==='references'){entry.version=(s.academy.references.find(r=>r.id===entry.id)?.version||0)+1;validateReference(entry);}else validateLesson(entry);
 s.academy[bucket]=[...s.academy[bucket].filter(r=>r.id!==entry.id),entry];await save(s);return {saved:true};
}
if(path==='profile'){s.name=String(body.name||'').slice(0,100);s.currency=currencyCode(body.currency||s.currency);await save(s);return {saved:true}}
if(path==='content'){if(new URLSearchParams(location.search).get('studio')!=='1')throw new Error('Open studio mode to edit education.');if(!body.title?.trim()||!body.summary?.trim()||!body.body?.length||body.body.some((l:any)=>!l.title?.trim()||!l.body?.trim()))throw new Error('Add a title, summary and lesson text.');const id=body.id||crypto.randomUUID();s.content=s.content.filter((c:any)=>c.id!==id);s.content.push({...body,id});await save(s);return {saved:true,id}}
if(path==='progress'){const c=s.content.find((c:any)=>c.id===body.contentId);const lesson=c?.body?.[body.lesson];if(!lesson)throw new Error('Lesson not found.');if(lesson.question&&lesson.answer!==body.answer)throw new Error('Not quite. Revisit the lesson and try again.');s.academy.legacyProgress=s.academy.legacyProgress||[];if(!s.academy.legacyProgress.some((p:any)=>p.content_id===body.contentId&&p.lesson===body.lesson))s.academy.legacyProgress.push({content_id:body.contentId,lesson:body.lesson});await save(s);return {saved:true}}
if(path==='import'){if(!Array.isArray(body.bottles)||!Array.isArray(body.notes))throw new Error('Choose a Decant notebook JSON export.');s.records=importEntries(s.records,body);if(body.preferences?.currency)s.currency=currencyCode(body.preferences.currency);if(body.academy)s.academy=mergeAcademy(s.academy,body.academy);if(Array.isArray(body.education))s.content=body.education;s.academy.legacyProgress=mergeLessonProgress(s.academy.legacyProgress,body.progress);await save(s);return {saved:true}}
throw new Error('Member accounts and payments require the full backend application. This HTML edition saves only in your browser.');
}
