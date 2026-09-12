import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scoreGrid,scoreDeduction,scoreDescriptors,schedule,calibration,validateReference} from '../lib/academy-engine.ts';
import {benchmarkReferences,academyLessons} from '../lib/academy-content.ts';
import {emptyAcademy,recordAttempt,mergeAcademy,dueCards,reviewCard,validateLesson} from '../lib/academy-state.ts';
const red=benchmarkReferences[0],white=benchmarkReferences[10];
const correct=ref=>({...ref.grid,'nose.aromas':ref.aromas,'pal.flavours':ref.flavors});
test('all 26 original references and six lessons are valid',()=>{assert.equal(benchmarkReferences.length,26);benchmarkReferences.forEach(validateReference);academyLessons.forEach(validateLesson)});
test('red and white totals are 23 and 22 with equal percentages',()=>{const r=scoreGrid(correct(red),red),w=scoreGrid(correct(white),white);assert.equal(r.max,23);assert.equal(w.max,22);assert.equal(r.percent,100);assert.equal(w.percent,100)});
test('scale errors, ranges, blank fields and adjacent half marks',()=>{
 const grid=correct(red);grid['pal.alcohol']='medium+';grid['app.intensity']=['pale','deep'];grid['pal.acidity']='medium';grid['pal.body']='medium to full';delete grid['con.readiness'];
 const result=scoreGrid(grid,red);assert.equal(result.byField['pal.alcohol'].marks,0);assert.match(result.byField['pal.alcohol'].message,/three-level/);assert.equal(result.byField['pal.acidity'].marks,.5);assert.equal(result.byField['pal.acidity'].delta,-1);assert.equal(result.byField['pal.body'].marks,0);assert.match(result.byField['con.readiness'].message,/blank/);
});
test('non-red tannin gives feedback without changing the denominator',()=>{const r=scoreGrid({...correct(white),'pal.tannin':'high'},white);assert.equal(r.max,22);assert.equal(r.percent,100);assert.ok(r.messages.some(m=>m.includes('not assessed')))});
test('descriptors normalise whitespace and plurals, deduplicate, reject categories',()=>{
 const r=scoreDescriptors([' RASPBERRIES ','raspberry','red fruit','mineral','wet   leaves'],['raspberry','wet leaves','violet'],3,'Aromas');assert.equal(r.marks,2);assert.deepEqual(r.hits,['raspberry','wet leaves']);assert.deepEqual(r.missed,['violet']);assert.match(r.message,/2 specific/);assert.equal(scoreDescriptors('raspberry',['raspberry'],1,'Aromas').marks,0);
});
test('invalid references fail instead of rewarding an invalid reference position',()=>{assert.throws(()=>scoreGrid(correct(red),{...red,grid:{...red.grid,'pal.acidity':'bogus'}}),/invalid/)});
test('deduction weighs country independently and grants parent-region half credit',()=>{
 const r={...red,region:'Chablis',parentRegions:['Burgundy']};const result=scoreDeduction({grape:red.grapes[0],region:'Burgundy',country:'Wrong',vintage:red.vintage+3,quality:red.quality},r);
 assert.equal(result.byField.grape.marks,35);assert.equal(result.byField.region.marks,12.5);assert.equal(result.byField.country.marks,0);assert.equal(result.byField.vintage.marks,7.5);assert.equal(result.max,100);
 const years=[-5,-4,-2,0,2,4,5].map(d=>scoreDeduction({vintage:red.vintage+d},red).byField.vintage.marks);assert.deepEqual(years,[0,7.5,15,15,15,7.5,0]);assert.equal(scoreDeduction({vintage:''},red).byField.vintage.marks,0);
});
test('attempt IDs are idempotent and new attempts append',()=>{const body={id:'a',kind:'grid',contentId:red.id,answers:correct(red)};const s=recordAttempt(emptyAcademy(),body,[]);assert.equal(recordAttempt(s,body,[]).attempts.length,1);assert.equal(recordAttempt(s,{...body,id:'b'},[]).attempts.length,2);assert.deepEqual(s.attempts[0].referenceSnapshot,red)});
test('backup round trip preserves attempt, reference and recall history',()=>{
 const s=recordAttempt(emptyAcademy(),{id:'a',kind:'grid',contentId:red.id,answers:correct(red)},[]);s.references=[{...red,id:'custom'}];s.srs.x={ease:2.5,interval:3,due:'2026-09-14',lapses:0};const restored=mergeAcademy(emptyAcademy(),JSON.parse(JSON.stringify(s)));assert.deepEqual(restored,JSON.parse(JSON.stringify(s)));assert.equal(mergeAcademy(restored,s).attempts.length,1);assert.throws(()=>mergeAcademy(emptyAcademy(),{...s,attempts:[{...s.attempts[0],result:{...s.attempts[0].result,percent:NaN}}]}),/Invalid/);
});
test('journal retro scoring requires exact LWIN and vintage and stays partial',()=>{
 const s=emptyAcademy();s.references=[{...red,id:'linked',lwin:'1234567',referenceVintage:'2019'}];const records=[{id:'b',kind:'bottle',data:{lwin:'1234567',vintage:'2019'}},{id:'n',kind:'note',data:{bottleId:'b',acidity:4}}];
 const result=recordAttempt(s,{id:'x',kind:'grid',contentId:'linked',noteId:'n'},records).attempts[0];assert.equal(result.partial,true);assert.equal(result.result.max,1);assert.equal(result.result.percent,100);
 records[0].data.vintage='2020';assert.throws(()=>recordAttempt(s,{id:'y',kind:'grid',contentId:'linked',noteId:'n'},records),/exact/);
});
test('SM-2 lite schedules good and lapse answers within ease bounds',()=>{const p=schedule(undefined,true,'2026-09-11');assert.equal(p.due,'2026-09-14');assert.equal(p.ease,2.6);const lapse=schedule(p,false,'2026-09-14');assert.equal(lapse.due,'2026-09-15');assert.equal(lapse.lapses,1);assert.equal(schedule({...p,ease:2.8},true,'2026-09-11').ease,2.8);assert.equal(schedule({...p,ease:1.3},false,'2026-09-11').ease,1.3)});
test('daily recall queue is capped at 25 across visits and does not invent grapes',()=>{
 const records=Array.from({length:20},(_,i)=>({id:String(i),kind:'bottle',data:{name:'Wine '+i,region:'Piedmont',country:'Italy'}}));let s=emptyAcademy();assert.equal(dueCards(s,records,'2026-09-11').length,25);
 for(let i=0;i<25;i++){const card=dueCards(s,records,'2026-09-11')[0];assert.ok(!card.id.endsWith(':grapes'));s=reviewCard(s,{id:'review'+i,cardId:card.id,good:true},records,'2026-09-11T12:00:00Z')}
 assert.equal(dueCards(s,records,'2026-09-11').length,0);assert.equal(s.reviews.length,25);
});
test('calibration waits for ten valid full grids and preserves signed bias',()=>{const attempts=Array.from({length:10},()=>({kind:'grid',observationSource:'bottle',referenceSnapshot:{lwin:'1234567',referenceVintage:'2019'},result:{byField:{'pal.acidity':{delta:-1}}}}));assert.equal(calibration(attempts.slice(0,9)).length,0);assert.match(calibration(attempts)[0],/below/);assert.equal(calibration(attempts.map(a=>({...a,partial:true}))).length,0)});

import {drillFor,scoreDrill,structureClue} from '../lib/deduction-drill.ts';
test('every benchmark has a complete reveal ladder and plausible authored choices',()=>{
 for(const ref of benchmarkReferences){const d=drillFor(ref);assert.equal(new Set(d.candidates).size,3);assert.ok(d.candidates.includes(d.answer));assert.ok(d.fruit.length);assert.ok(d.nonFruit.length);assert.equal(d.discriminator.options.length,3);assert.ok(d.discriminator.options[d.discriminator.answer]);for(const term of ref.aromas.map(a=>a.term).filter(t=>t!==ref.grid['app.colour']))assert.ok(!structureClue(ref).toLowerCase().includes(term));}
});
test('clue costs reduce both components and persist through backup',()=>{
 const d=drillFor(red),answers={world:'Uncertain',climate:'Uncertain',choice:d.answer,discriminator:d.discriminator.answer};
 assert.deepEqual([1,2,3].map(round=>scoreDrill({...answers,round},red).marks),[100,80,60]);
 assert.equal(scoreDrill({...answers,round:1,choice:d.candidates.find(c=>c!==d.answer)},red).marks,25);
 assert.throws(()=>scoreDrill({...answers,round:4},red));
 const s=recordAttempt(emptyAcademy(),{id:'drill',kind:'drill',contentId:red.id,answers:{...answers,round:2}},[]);
 assert.equal(mergeAcademay(s).attempts[0].result.marks,80);
 function mergeAcademay(s){return mergeAcademy(emptyAcademy(),JSON.parse(JSON.stringify(s)))}
});
test('supplied grids and drills never produce calibration',()=>{
 const a={kind:'grid',result:{byField:{'pal.acidity':{delta:-1}}}};
 assert.deepEqual(calibration(Array(15).fill(a)),[]);
 assert.deepEqual(calibration(Array(15).fill({...a,observationSource:'text',referenceSnapshot:{lwin:'123',referenceVintage:'2020'}})),[]);
 assert.deepEqual(calibration(Array(15).fill({...a,observationSource:'bottle'})),[]);
});
test('bottle observation provenance requires a matching cellar bottle and reference',()=>{
 const s=emptyAcademy();s.references=[{...red,id:'actual',lwin:'1234567',referenceVintage:'2020'}];
 const body={id:'observed',kind:'grid',contentId:'actual',observationSource:'bottle',bottleId:'b',answers:correct(red)};
 assert.throws(()=>recordAttempt(s,body,[]),/exact/);
 const saved=recordAttempt(s,body,[{id:'b',kind:'bottle',data:{lwin:'1234567',vintage:'2020'}}]);
 assert.equal(saved.attempts[0].observationSource,'bottle');assert.equal(saved.attempts[0].bottleId,'b');
});
