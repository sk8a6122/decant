import {FIELDS,pretty,scoreGrid,type Grid,type WineReference,type Score} from './academy-engine.ts';

// Everyday observations are deliberately separate from the grid's vocabulary.
const phrases:Record<string,string[]>={
 'app.intensity':['Only a faint wash of color shows.','The color is neither faint nor dense.','The color looks dense and strongly saturated.'],
 'app.colour':[''],
 'pal.sweetness':['There is no noticeable sugar on my tongue.','There is just a small hint of sugar.','It tastes gently sugary.','It tastes noticeably sugary, though not intensely so.','It tastes strongly sugary.','It is intensely sugary and syrupy.'],
 'pal.acidity':['It barely makes my mouth water.','It makes my mouth water a little.','It makes my mouth water a moderate amount.','It makes my mouth water quite strongly, though not at the strongest end.','It makes my mouth water very strongly.'],
 'pal.tannin':['There is almost no drying grip on my gums.','There is a little drying grip on my gums.','There is a moderate drying grip on my gums.','The drying grip is quite strong, but not at the strongest end.','The drying grip on my gums is very strong.'],
 'pal.body':['It feels very delicate and almost weightless.','It feels on the lighter side, with a little weight.','It feels neither light nor heavy.','It feels fairly weighty, though not at the heaviest end.','It feels very weighty and broad.'],
 'pal.finish':['The flavor disappears quickly after swallowing.','The flavor lingers briefly, a little beyond the shortest finish.','The flavor lasts a moderate time after swallowing.','The flavor lingers quite a while, though not at the longest end.','The flavor stays with me for a long time after swallowing.']
};
const colors:Record<string,string>={purple:'violet-red',ruby:'bright jewel-red',garnet:'red with a rusty edge',tawny:'orange-brown',brown:'brown',pink:'pink',salmon:'orange-pink',orange:'orange','lemon-green':'yellow with a green tinge',lemon:'plain yellow',gold:'a rich golden yellow',amber:'an orange-yellow amber shade'};
export function noteExercise(ref:WineReference){
 const evidence:Record<string,string>={};
 for(const [key,options] of Object.entries(phrases)){
  if(key==='app.colour'){evidence[key]=`Its hue is ${colors[String(ref.grid[key])]}.`;continue;}
  if(key==='pal.tannin'&&ref.style!=='red')continue;
  evidence[key]=options[FIELDS[key].scale.indexOf(String(ref.grid[key]))];
 }
 evidence['nose.aromas']=`When I smell it, I think of ${ref.aromas.map(a=>a.term).join(', ')}.`;
 evidence['pal.flavours']=`On my tongue I find ${ref.flavors.join(', ')}.`;
 return {evidence,keys:Object.keys(evidence),paragraphs:[['app.intensity','app.colour','nose.aromas'],['pal.sweetness','pal.acidity','pal.tannin','pal.body','pal.flavours','pal.finish']].map(keys=>keys.map(k=>evidence[k]).filter(Boolean).join(' '))};
}
export function scoreNote(given:Grid,ref:WineReference):Score{
 const exercise=noteExercise(ref),scored=scoreGrid(given,ref);
 const byField=Object.fromEntries(Object.entries(scored.byField).filter(([k])=>exercise.keys.includes(k)));
 for(const [key,row] of Object.entries(byField)){
  if(FIELDS[key])row.message=`“${exercise.evidence[key]}” → ${FIELDS[key].label}: ${pretty(String(row.reference))}.${row.marks===row.max?'':row.marks?' Your adjacent choice earns partial credit in this exercise.':' Choose the grid term supported by this sentence.'}`;
 }
 const rows=Object.values(byField),max=rows.reduce((n,r)=>n+r.max,0),marks=rows.reduce((n,r)=>n+r.marks,0);
 return {byField,max,marks,percent:Math.round(marks/max*100),messages:['This assesses translation into Decant’s vocabulary, not sensory accuracy. Fields the source does not establish are not scored.',...rows.map(r=>r.message).filter(Boolean)]};
}
