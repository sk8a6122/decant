import {test} from 'node:test';
import assert from 'node:assert/strict';
import {linkLegacyNotes,saveEntry,importEntries,catalogWineName} from '../lib/notebook.ts';
const bottle=(id='b1',qty=2)=>({id,kind:'bottle',data:{name:'Barolo',producer:'Marchesi di Barolo',vintage:'2019',qty,price:''}});
const note=(extra={})=>({kind:'note',data:{name:'Barolo',producer:'Marchesi di Barolo',vintage:'2019',rating:4,...extra}});
test('legacy links are unambiguous and do not consume stock',()=>{
 const records=linkLegacyNotes([bottle(),{id:'n1',...note()}]);
 assert.equal(records[1].data.bottleId,'b1');assert.equal(records[0].data.qty,2);
 assert.equal(linkLegacyNotes([bottle(),bottle('b2'),{id:'n1',...note()}])[2].data.bottleId,undefined);
});
test('explicit consumption, edits, rollback and insufficient stock',()=>{
 const original=[bottle()];const entry=note({bottleId:'b1',consumedBottles:1,acidity:4});
 let records=saveEntry(original,entry,'n1');assert.equal(records.find(r=>r.id==='b1').data.qty,1);
 records=saveEntry(records,entry,'n1');assert.equal(records.find(r=>r.id==='b1').data.qty,1);
 assert.equal(original[0].data.qty,2);
 records=saveEntry(records,note({bottleId:'b1',consumedBottles:0}),'n1');assert.equal(records.find(r=>r.id==='b1').data.qty,2);
 assert.throws(()=>saveEntry([bottle('b1',0)],entry,'n2'),/no bottles/);
 assert.throws(()=>saveEntry(original,note({acidity:6}),'n3'),/Structure/);
});
test('moving or unlinking a tasting reverses only its prior stock change',()=>{
 let records=saveEntry([bottle(),bottle('b2')],note({bottleId:'b1',consumedBottles:1}),'n1');
 records=saveEntry(records,note({bottleId:'b2',consumedBottles:1}),'n1');
 assert.equal(records.find(r=>r.id==='b1').data.qty,2);assert.equal(records.find(r=>r.id==='b2').data.qty,1);
 records=saveEntry(records,note({bottleId:'',consumedBottles:0}),'n1');
 assert.equal(records.find(r=>r.id==='b2').data.qty,2);
});
test('renaming keeps identity; deleting bottle preserves note snapshot',()=>{
 let records=saveEntry([bottle()],note({bottleId:'b1'}),'n1');
 records=saveEntry(records,{kind:'bottle',data:{...bottle().data,name:'Renamed Barolo'}},'b1');
 assert.equal(records.find(r=>r.id==='n1').data.bottleId,'b1');
 records=saveEntry(records.filter(r=>r.id!=='b1'),{kind:'note',data:records.find(r=>r.id==='n1').data},'n1');
 assert.equal(records[0].data.name,'Barolo');
});
test('export/import preserves IDs, sliders and stock without replaying consumption',()=>{
 const payload={version:3,bottles:[{...bottle().data,id:'b1',qty:1}],notes:[{...note({bottleId:'b1',consumedBottles:1,body:5}).data,id:'n1'}]};
 const records=importEntries([],payload);
 assert.equal(records.find(r=>r.id==='n1').data.bottleId,'b1');assert.equal(records.find(r=>r.id==='n1').data.body,5);
 assert.equal(records.find(r=>r.id==='b1').data.qty,1);assert.deepEqual(importEntries(records,payload),records);
 const legacy=importEntries([{...bottle(),id:'import-bottle-b1'}],payload);
 assert.equal(legacy.find(r=>r.id==='n1').data.bottleId,'import-bottle-b1');
});
test('catalog prefix stripping respects word boundaries',()=>{
 assert.equal(catalogWineName('Marchesi di Barolo, Barolo','Marchesi di Barolo'),'Barolo');
 assert.equal(catalogWineName('Marchesi di Barolo','Marchesi di Barolo'),'Marchesi di Barolo');
 assert.equal(catalogWineName('Foobar','Foo'),'Foobar');
});
