import {test} from 'node:test';
import assert from 'node:assert/strict';
import {saveEntry,importEntries} from '../lib/notebook.ts';
import {mergeLessonProgress} from '../lib/lesson-progress.ts';
import {emptyAcademy,mergeAcademy} from '../lib/academy-state.ts';
test('medium survives saving and backup while unrecorded fields remain absent',()=>{
 const records=saveEntry([],{kind:'note',data:{name:'Medium tasting',rating:4,acidity:3,tannin:3,body:3,finish:3}},'medium');
 const restored=importEntries([],{bottles:[],notes:records.map(r=>({...r.data,id:r.id}))});
 for(const key of ['acidity','tannin','body','finish'])assert.equal(restored[0].data[key],3);
 const blank=saveEntry([],{kind:'note',data:{name:'Untouched',rating:4}},'blank');
 assert.equal(blank[0].data.acidity,undefined);
});
test('editing a consumed last bottle does not consume again and can restore stock',()=>{
 const bottle={id:'b',kind:'bottle',data:{name:'Wine',qty:1}};
 const note={kind:'note',data:{name:'Wine',rating:4,bottleId:'b',consumedBottles:1}};
 const first=saveEntry([bottle],note,'n');const again=saveEntry(first,note,'n');
 assert.equal(again.find(r=>r.id==='b').data.qty,0);
 assert.throws(()=>saveEntry(again,note,'new'),/no bottles/);
 const restored=saveEntry(again,{...note,data:{...note.data,consumedBottles:0}},'n');assert.equal(restored.find(r=>r.id==='b').data.qty,1);
});
test('legacy completion merges idempotently and survives Academy backup',()=>{
 const a={content_id:'old-course',lesson:0},b={content_id:'old-course',lesson:1};
 const merged=mergeLessonProgress([a],[a,b]);assert.deepEqual(merged,[a,b]);
 const state={...emptyAcademy(),legacyProgress:merged};
 assert.deepEqual(mergeAcademy(emptyAcademy(),JSON.parse(JSON.stringify(state))).legacyProgress,[a,b]);
});
