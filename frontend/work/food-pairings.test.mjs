import assert from 'node:assert/strict';
import {pairingFor,cellarPairingMatches} from '../lib/food-pairings.ts';
const cases=[
 ['sushi','Sushi and sashimi'],['salmon nigiri','Sushi and sashimi'],
 ['spicy tuna roll','Spicy sushi'],['rigatoni','Pasta — let the sauce lead'],
 ['rigatoni with tomato sauce','Tomato-led dishes'],['penne pesto','Pesto, herbs, and vegetables'],
 ['fettuccine alfredo','Creamy and buttery dishes'],['rigatoni with mushrooms','Mushrooms and earthy dishes'],
 ['potato chips','Classic salty snacks'],['salt & vinegar potato chips','Salt & vinegar snacks'],
 ['BBQ chips','Barbecue and smoky flavours'],['sour cream & onion chips','Sour cream & onion snacks'],
 ['jalapeño chips','Spicy snacks'],['cheddar popcorn','Cheesy snacks'],
 ['truffle chips','Truffle and mushroom snacks'],['dill pickle chips','Salt & vinegar snacks'],
 ['ranch chips','Sour cream & onion snacks'],['pretzels','Classic salty snacks'],
 ['fish and chips','Classic salty snacks'],['lamb','Lamb and game'],
 ['dumplings','Casual favourites'],['unlisted meal','A flexible starting point'],
 ['champagne','A flexible starting point']
];
for(const [query,label] of cases){
 const p=pairingFor(query);assert.equal(p?.label,label,query);
 assert.ok(p.recommendations.length>=2&&p.recommendations.length<=3);
}
assert.equal(pairingFor('  '),null);
assert.equal(pairingFor('SUSHI!!').label,'Sushi and sashimi');
const bottle=(id,name,style='White',qty=1)=>({id,kind:'bottle',data:{name,style,qty}});
const matches=cellarPairingMatches([
 bottle('riesling','Dry Riesling'),bottle('empty','Riesling','White',0),
 bottle('unrelated','Sauvignon Blanc'),bottle('gruner','Grüner Veltliner'),
 {...bottle('producer','Unknown'),data:{name:'Unknown',producer:'Riesling Family',style:'White',qty:1}},
],pairingFor('sushi').recommendations);
assert.deepEqual(matches.map(m=>m.record.id),['riesling','gruner']);
console.log('Food pairings: 23 food searches, normalization, fallback, and cellar matching passed.');
