import assert from 'node:assert/strict';
import {wineFor,pairingForBottle,cellarMatchesForWine,detectPairingMode,normalizeStyle} from '../lib/wine-pairings.ts';
import {pairingFor} from '../lib/food-pairings.ts';

// A wine search resolves grapes, regions and label synonyms to one profile.
const lookups=[
 ['chianti','Sangiovese','Red'],['Brunello di Montalcino','Sangiovese','Red'],
 ['cabernet sauvignon','Cabernet Sauvignon','Red'],['claret','Cabernet Sauvignon','Red'],
 ['Pinot Noir','Pinot Noir','Red'],['bourgogne rouge','Pinot Noir','Red'],
 ['barolo','Nebbiolo','Red'],['shiraz','Syrah or Shiraz','Red'],
 ['rioja','Tempranillo','Red'],['beaujolais','Gamay or Beaujolais','Red'],
 ['chablis','Chablis','White'],['sancerre','Sauvignon Blanc','White'],
 ['mosel riesling','Riesling','White'],['alvarinho','Albariño','White'],
 ['vouvray','Chenin Blanc','White'],['gruner veltliner','Grüner Veltliner','White'],
 ['champagne','Champagne and traditional-method sparkling','Sparkling'],
 ['prosecco','Prosecco','Sparkling'],['tawny port','Port','Dessert'],
 ['sauternes','Sauternes and sweet botrytis wines','Dessert'],['fino sherry','Sherry','Dessert'],
 ['orange wine','Orange and skin-contact wine','White'],
];
for(const [query,label,style] of lookups){
 const match=wineFor(query);
 assert.equal(match?.label,label,query);
 assert.equal(match.style,style,query);
 assert.ok(match.exact,query);
 assert.ok(match.dishes.length>=4&&match.dishes.length<=6,query);
 for(const dish of match.dishes){assert.ok(dish.name.trim());assert.ok(dish.why.trim())}
 assert.equal(new Set(match.dishes.map(d=>d.name)).size,match.dishes.length,'no duplicate dishes for '+query);
}

// Punctuation, accents and case are ignored the same way the food search ignores them.
assert.equal(wineFor('CHIANTI CLASSICO!').label,'Sangiovese');
assert.equal(wineFor('Grüner Veltliner').label,'Grüner Veltliner');
assert.equal(wineFor('   '),null);
assert.equal(wineFor('rigatoni'),null);

// A bare style still answers, but is flagged as a rough match rather than a grape.
const red=wineFor('red wine');
assert.equal(red.label,'Red wine');
assert.equal(red.exact,false);
assert.equal(wineFor('sparkling').style,'Sparkling');

// Both directions agree: a wine recommended for a dish lists that dish back.
const tomato=pairingFor('spaghetti with tomato sauce');
assert.equal(tomato.label,'Tomato-led dishes');
assert.ok(tomato.recommendations.some(r=>r.name==='Sangiovese'));
assert.ok(wineFor('sangiovese').dishes.some(d=>/tomato/i.test(d.name)),'Sangiovese points back at tomato');
assert.ok(wineFor('champagne').dishes.some(d=>/chip|fried|popcorn/i.test(d.name)),'Champagne points back at salty, fried food');

// The search box can tell which direction the user meant.
assert.equal(detectPairingMode('chianti'),'wine');
assert.equal(detectPairingMode('red wine'),'wine');
assert.equal(detectPairingMode('rigatoni'),'food');
assert.equal(detectPairingMode('salt & vinegar chips'),'food');
assert.equal(detectPairingMode(''),'food');

// Pairing from a cellar bottle reads the grape first, then the region, then the style.
const bottle=(data)=>({id:data.name,kind:'bottle',data:{qty:1,...data}});
assert.equal(pairingForBottle(bottle({name:'Cloudy Bay',style:'White',grape:'Sauvignon Blanc'})).label,'Sauvignon Blanc');
assert.equal(pairingForBottle(bottle({name:'Marchesi di Barolo, Barolo',style:'Red',region:'Piedmont'})).label,'Nebbiolo');
const styleOnly=pairingForBottle(bottle({name:'Unlabelled house red',style:'Red'}));
assert.equal(styleOnly.label,'Red wine');
assert.equal(styleOnly.exact,false);
// A stated style is trusted over a place name that belongs to another colour.
assert.equal(pairingForBottle(bottle({name:'Château Blanc',style:'White',region:'Bordeaux'})).label,'White wine');
assert.equal(pairingForBottle(bottle({name:'Mystery',style:''})),null);
assert.equal(pairingForBottle(null),null);
assert.equal(normalizeStyle('rosé'),'Rosé');
assert.equal(normalizeStyle('sparkling'),'Sparkling');
assert.equal(normalizeStyle('orange'),'');

// Cellar matches rank a named grape above a bottle that only shares the style.
const cellar=[
 bottle({name:'Cono Sur Pinot Noir',style:'Red'}),
 bottle({name:'House Red',style:'Red'}),
 bottle({name:'Chablis 1er Cru',style:'White'}),
 bottle({name:'Finished Pinot Noir',style:'Red',qty:0}),
];
const matches=cellarMatchesForWine(cellar,wineFor('pinot noir'));
assert.deepEqual(matches.map(m=>m.record.id),['Cono Sur Pinot Noir','House Red']);
assert.equal(matches[0].exact,true);
assert.equal(matches[1].exact,false);
assert.deepEqual(cellarMatchesForWine(cellar,null),[]);
assert.ok(cellarMatchesForWine(cellar,wineFor('champagne')).length===0);

console.log('Wine pairings: '+lookups.length+' wine lookups, style fallbacks, direction detection, bottle pairing and cellar ranking passed.');
for(const query of ['reserva','rosso','vinho verde','marlborough','langhe'])assert.equal(wineFor(query),null,query);
assert.equal(pairingForBottle(bottle({name:'Cabernet Sauvignon Estate',grape:'Cabernet Franc',style:'Red'})).label,'Cabernet Franc');
assert.equal(pairingForBottle(bottle({name:'Unknown',producer:'Pinot Noir Family',style:'Red'})).exact,false);
assert.deepEqual(cellarMatchesForWine([bottle({name:'Bordeaux Blanc',style:'White'})],wineFor('bordeaux')),[]);
assert.equal(cellarMatchesForWine([bottle({name:'Unknown',producer:'Pinot Noir Family',style:'Red'})],wineFor('pinot noir'))[0].exact,false);

