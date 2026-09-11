import {test} from 'node:test';
import assert from 'node:assert/strict';
import {labelReading} from '../lib/label-reading.ts';
function data(lines){return {tsv:'level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n'+lines.flatMap(([text,conf,height],i)=>text.split(' ').map((word,j)=>[5,1,1,1,i+1,j+1,0,0,100,height,conf,word].join('\t'))).join('\n')}}
test('garbled low-confidence scan cannot propose a name or year',()=>{const parsed=labelReading(data([['ER rs CY a ru',30,20],['TA HAS i',42,20],['1971',95,10]]));assert.equal(parsed.query,'');assert.deepEqual(parsed.years,[])});
test('vintage candidates must be clear standalone lines, not historical prose',()=>{const parsed=labelReading(data([['TIGNANELLO',94,55],['ANTINORI',93,35],['2021',95,28],['First vintage 1971',95,10]]));assert.equal(parsed.query,'TIGNANELLO');assert.deepEqual(parsed.years,['2021']);assert.equal(parsed.vintage,undefined)});
test('ambiguous or unclear years are not silently selected',()=>{const parsed=labelReading(data([['TIGNANELLO',94,55],['2021',95,28],['1971',91,14],['2011',40,12]]));assert.deepEqual(parsed.years,['2021','1971']);assert.equal(parsed.vintage,undefined)});
test('missing word confidence data fails closed even when raw text contains a year',()=>{assert.deepEqual(labelReading({text:'TIGNANELLO 1971',confidence:90}),{query:'',years:[],reliable:false})});

test('producer search does not append smaller label prose',()=>{const parsed=labelReading(data([['ANTINORI',94,35],['affinato in bottigh',82,20],['2021',95,28]]));assert.equal(parsed.query,'ANTINORI');assert.deepEqual(parsed.years,['2021'])});
