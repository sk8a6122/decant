import {test} from 'node:test';
import assert from 'node:assert/strict';
import {purchaseTotals,validateYears,currencyCode} from '../lib/bottle-details.ts';
import {saveEntry,importEntries} from '../lib/notebook.ts';
test('purchase totals stay separate by currency and old USD records remain USD',()=>{const total=purchaseTotals([{data:{price:10,qty:2}},{data:{price:15,qty:1,currency:'EUR'}},{data:{price:9,qty:0,currency:'GBP'}}]);assert.match(total,/USD 20/);assert.match(total,/EUR 15/);assert.ok(!total.includes('GBP'));assert.equal(currencyCode('eur'),'EUR')});
test('year validation accepts NV and older vintages but rejects partial or reversed years',()=>{assert.equal(validateYears({vintage:'nv'}),'NV');assert.equal(validateYears({vintage:'1974',from:'2026',to:'2060'}),'1974');assert.throws(()=>validateYears({vintage:'198'}));assert.throws(()=>validateYears({from:'2040',to:'2030'}))});
test('per-bottle currency survives edit and backup import',()=>{const records=saveEntry([],{kind:'bottle',data:{name:'Test',qty:2,price:12,currency:'EUR',vintage:'1985',from:'2026',to:'2060'}},'b');const edited=saveEntry(records,{kind:'bottle',data:{...records[0].data,qty:3}},'b');const restored=importEntries([],{bottles:edited.map(r=>({...r.data,id:r.id})),notes:[]});assert.equal(restored[0].data.currency,'EUR');assert.equal(restored[0].data.to,'2060')});
