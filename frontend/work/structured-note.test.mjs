import assert from 'node:assert/strict';
import {benchmarkReferences} from '../lib/academy-content.ts';
import {noteExercise,scoreNote} from '../lib/structured-note.ts';
import {recordAttempt,emptyAcademy} from '../lib/academy-state.ts';
for(const ref of benchmarkReferences){
 const exercise=noteExercise(ref);
 assert.ok(exercise.paragraphs.every(p=>p&&!p.includes('undefined')));
 const answers={...ref.grid,'nose.aromas':ref.aromas,'pal.flavours':ref.flavours};
 const score=scoreNote(answers,ref);
 assert.equal(score.percent,100);
 for(const key of ['pal.alcohol','con.quality','con.readiness','nose.intensity']){
  assert.ok(!(key in score.byField));
  answers[key]='unsupported answer';
 }
 assert.equal(scoreNote(answers,ref).percent,100);
 const attempt=recordAttempt(emptyAcademy(),{id:ref.id,kind:'grid',contentId:ref.id,noteTranslation:true,answers},[]).attempts[0];
 assert.equal(attempt.noteTranslation,true);
 assert.equal(attempt.observationSource,'text');
 assert.equal(attempt.result.percent,100);
 answers['pal.acidity']='low to high';
 assert.equal(scoreNote(answers,ref).byField['pal.acidity'].marks,0);
}
console.log('26 translation cases: source completeness, scoring, missing fields and saved provenance passed.');
