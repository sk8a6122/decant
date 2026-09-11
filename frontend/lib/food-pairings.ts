type PairingRecommendation={name:string;styles:string[];keywords:string[];why:string};
type PairingProfile={label:string;terms:string[];intro:string;recommendations:PairingRecommendation[]};
const pairingProfiles:PairingProfile[]=[
{label:'Tomato-led dishes',terms:['tomato','marinara','pizza','bolognese','lasagna','red sauce'],intro:'Tomato brings acidity, so start with wines that stay fresh and savoury.',recommendations:[{name:'Sangiovese',styles:['Red'],keywords:['sangiovese','chianti','brunello'],why:'Bright acidity and savoury character can meet tomato sauce without feeling heavy.'},{name:'Barbera',styles:['Red'],keywords:['barbera'],why:'Juicy fruit and lively acidity make it a flexible tomato-pasta partner.'},{name:'Dry rosé',styles:['Rosé'],keywords:['rose','rosé','provence'],why:'A lighter option when vegetables or fresh cheese lead the dish.'}]},
{label:'Steak and beef',terms:['steak','beef','burger','short rib','brisket'],intro:'Rich beef welcomes structure; sauce and cooking method guide the final choice.',recommendations:[{name:'Cabernet Sauvignon',styles:['Red'],keywords:['cabernet','bordeaux'],why:'Tannin and dark fruit are classic starting points for browned steak.'},{name:'Syrah or Shiraz',styles:['Red'],keywords:['syrah','shiraz','hermitage','cornas'],why:'Peppery, savoury notes can work especially well with char and smoke.'},{name:'Malbec',styles:['Red'],keywords:['malbec','cahors'],why:'Plush fruit and firm structure suit burgers, grilled beef, and chimichurri.'}]},
{label:'Chicken and pork',terms:['chicken','turkey','poultry','pork','ham','sausage'],intro:'Preparation matters most: crisp, creamy, grilled, and spicy versions invite different wines.',recommendations:[{name:'Chardonnay',styles:['White'],keywords:['chardonnay','white burgundy','bourgogne blanc'],why:'A useful match for roast poultry or a creamy sauce.'},{name:'Pinot Noir',styles:['Red'],keywords:['pinot noir','red burgundy','bourgogne rouge'],why:'A lighter red can complement roast meat or mushrooms.'},{name:'Brut sparkling wine',styles:['Sparkling'],keywords:['champagne','cremant','cava','brut','sparkling'],why:'Freshness and bubbles are lively with fried or salty food.'}]},
{label:'Fish and seafood',terms:['salmon','tuna','trout','oyster','shrimp','prawn','crab','lobster','scallop','mussel','clam','seafood','cod','halibut','fish','swordfish'],intro:'Fresh, dry wines keep the focus on seafood; richer fish can also carry a light red.',recommendations:[{name:'Chablis or Chardonnay',styles:['White'],keywords:['chablis','chardonnay','white burgundy'],why:'Freshness and texture suit shellfish, white fish, or a butter sauce.'},{name:'Albariño or Muscadet',styles:['White'],keywords:['albarino','albariño','muscadet'],why:'Citrus and saline character complement simply cooked seafood.'},{name:'Pinot Noir',styles:['Red'],keywords:['pinot noir','red burgundy'],why:'A light, low-tannin red can work with grilled salmon or tuna.'}]},
{label:'Spicy dishes and curry',terms:['spicy','chili','chilli','curry','thai','indian','szechuan','sichuan','taco'],intro:'With chilli heat, lower alcohol and a touch of sweetness are useful starting points.',recommendations:[{name:'Off-dry Riesling',styles:['White'],keywords:['riesling','kabinett','spatlese','spätlese'],why:'A little sweetness can soften heat while acidity keeps things bright.'},{name:'Gewürztraminer',styles:['White'],keywords:['gewurztraminer','gewürztraminer'],why:'Aromatic intensity can stand beside fragrant spices.'},{name:'Fruity sparkling wine',styles:['Sparkling'],keywords:['demi sec','prosecco','sparkling','moscato'],why:'Bubbles refresh; choose a fruitier style and keep alcohol modest.'}]},
{label:'Mushrooms and earthy dishes',terms:['mushroom','truffle','risotto','lentil'],intro:'Earthy flavours often reward savoury detail rather than sheer power.',recommendations:[{name:'Pinot Noir',styles:['Red'],keywords:['pinot noir','red burgundy','bourgogne rouge'],why:'Earthy, lighter reds can echo mushrooms without overwhelming them.'},{name:'Chenin Blanc',styles:['White'],keywords:['chenin','vouvray','savennieres'],why:'Freshness and texture work well with creamy risotto.'},{name:'Nebbiolo',styles:['Red'],keywords:['nebbiolo','barolo','barbaresco'],why:'An aromatic, savoury option for truffle or deeply flavoured mushrooms.'}]},
{label:'Cheese',terms:['cheese','cheeseboard','charcuterie','brie','cheddar','goat cheese','blue cheese'],intro:'Salt, texture, and intensity matter more than one universal cheese rule.',recommendations:[{name:'Sparkling wine',styles:['Sparkling'],keywords:['champagne','cremant','cava','brut','sparkling'],why:'Acidity and bubbles refresh across many salty, creamy cheeses.'},{name:'Sauvignon Blanc',styles:['White'],keywords:['sauvignon blanc','sancerre','pouilly fume'],why:'A bright choice for goat cheese and fresh herbs.'},{name:'Tawny Port',styles:['Dessert'],keywords:['tawny port','port'],why:'Sweetness and nutty depth can suit blue or mature hard cheese.'}]},
{label:'Chocolate and dessert',terms:['chocolate','cake','brownie','dessert','caramel','tart','cookie','ice cream'],intro:'The wine should usually be at least as sweet as the dessert.',recommendations:[{name:'Ruby or vintage Port',styles:['Dessert'],keywords:['ruby port','vintage port','port'],why:'Rich fruit and sweetness are natural starting points for dark chocolate.'},{name:'Banyuls',styles:['Dessert'],keywords:['banyuls','maury','sweet grenache'],why:'Berry and cocoa-friendly flavours suit chocolate desserts.'},{name:'Moscato d’Asti',styles:['Dessert','Sparkling'],keywords:['moscato','asti'],why:'Light sweetness and gentle bubbles suit fruit-led desserts.'}]}
];
const defaultPairing:PairingProfile={label:'A flexible starting point',terms:[],intro:'We did not find one exact dish, so let the sauce, sweetness, and spice guide you.',recommendations:[{name:'Brut sparkling wine',styles:['Sparkling'],keywords:['champagne','cremant','cava','brut','sparkling'],why:'Freshness and bubbles make this a flexible table wine.'},{name:'Dry rosé',styles:['Rosé'],keywords:['rose','rosé','provence'],why:'A dry rosé can bridge vegetables, seafood, poultry, and gentle spice.'},{name:'Pinot Noir',styles:['Red'],keywords:['pinot noir','red burgundy'],why:'A lighter red is adaptable when the dish is not very sweet or hot.'}]};

const normalize=(value:unknown)=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim();
const contains=(text:string,term:string)=>(' '+text+' ').includes(' '+normalize(term)+' ')||(' '+text+' ').includes(' '+normalize(term)+'s ');
const wine=(name:string,styles:string[],keywords:string[],why:string):PairingRecommendation=>({name,styles,keywords,why});
const bubbles=wine('Brut sparkling wine',['Sparkling'],['champagne','cremant','cava','brut','sparkling'],'Fresh acidity and bubbles are a lively contrast to salt, crunch, and richness.');
const riesling=wine('Riesling',['White'],['riesling'],'Choose dry for delicate food, or off-dry when chilli heat leads; check the bottle’s sweetness.');
const crisp=wine('Sauvignon Blanc',['White'],['sauvignon blanc','sancerre','pouilly fume'],'Crisp acidity and herbal notes complement tangy, green, and fresh flavours.');
const chardonnay=wine('Chardonnay',['White'],['chardonnay','chablis','white burgundy'],'Freshness with a little texture complements creamy or buttery flavours; choose lighter oak for delicate food.');
const pinot=wine('Pinot Noir',['Red'],['pinot noir','red burgundy'],'Light tannins and red fruit work with savoury flavours without dominating them.');
const rose=wine('Dry rosé',['Rosé'],['rose','provence'],'A fresh, fruity middle ground for salty snacks and gently seasoned dishes; confirm it is dry.');
const extra=(label:string,terms:string[],intro:string,recommendations:PairingRecommendation[]):PairingProfile=>({label,terms,intro,recommendations});
const sushi=extra('Sushi and sashimi',['sushi','sashimi','nigiri','maki','uramaki','california roll','dragon roll','rainbow roll','poke'],'Start with clean, fresh wines. Soy sauce, wasabi, spicy mayo, and fried toppings can change the best match.',[riesling,bubbles,wine('Grüner Veltliner',['White'],['gruner veltliner'],'Fresh acidity and a savoury edge suit delicate fish and vegetable rolls.')]);
const pasta=extra('Pasta — let the sauce lead',['pasta','rigatoni','penne','spaghetti','linguine','fettuccine','tagliatelle','ravioli','tortellini','gnocchi','macaroni','ziti','fusilli','farfalle','bucatini','orzo'],'Rigatoni and other pasta shapes do not determine the pairing. These are flexible starting points; add tomato, pesto, cream, or meat sauce to refine them.',[wine('Sangiovese',['Red'],['sangiovese','chianti','brunello'],'Choose this bright, savoury red when tomato or meat sauce leads.'),chardonnay,rose]);
const creamy=extra('Creamy and buttery dishes',['alfredo','carbonara','cream','creamy','cacio e pepe','mac and cheese','mac n cheese','butter','vodka sauce'],'Acidity helps balance richness. For vodka sauce, these lean toward the creamy side; a tomato-heavy version also suits Sangiovese.',[chardonnay,bubbles,pinot]);
const herbs=extra('Pesto, herbs, and vegetables',['pesto','salad','vegetable','veggie','asparagus','artichoke','zucchini','falafel','hummus','avocado'],'Keep the wine fresh and consider the dressing or sauce, especially vinegar and lemon.',[crisp,rose,wine('Grüner Veltliner',['White'],['gruner veltliner'],'A crisp, savoury white can complement green vegetables and herbs.')]);
const chips=extra('Classic salty snacks',['chip','crisp','popcorn','pretzel','fries','french fry','potato chip','french fries'],'Salt and crunch make an easy excuse to open something fresh. Add a chip flavour to find a more specific match.',[bubbles,rose,chardonnay]);
const vinegar=extra('Salt & vinegar snacks',['salt and vinegar','salt vinegar','vinegar','pickle','dill'],'Tangy snacks call for bright acidity so the wine does not feel flat beside the seasoning.',[bubbles,crisp,riesling]);
const bbq=extra('Barbecue and smoky flavours',['bbq','barbecue','barbeque','smoky','smoked','ribs'],'Sweet, smoky seasoning likes fruit-forward wine. If the sauce is very sweet, choose a wine with some sweetness too.',[wine('Zinfandel',['Red'],['zinfandel','primitivo'],'Ripe fruit can complement smoky barbecue seasoning; keep chilli heat modest with higher-alcohol bottles.'),rose,riesling]);
const sourCream=extra('Sour cream & onion snacks',['sour cream','onion','ranch'],'Creamy seasoning and herbs welcome fresh whites or bubbles.',[crisp,chardonnay,bubbles]);
const cheesy=extra('Cheesy snacks',['cheddar','cheese','cheetos','doritos','nacho'],'For cheesy chips, crackers, or popcorn, acidity balances richness and salt.',[bubbles,chardonnay,rose]);
const spicy=pairingProfiles.find(p=>p.label==='Spicy dishes and curry')!;
const expanded=[sushi,pasta,creamy,herbs,bbq,
extra('Fried food',['fried','tempura','fish and chips','nugget'], 'Crunchy coatings and rich frying oils are a natural place to start with refreshing wines.',[bubbles,riesling,rose]),
extra('Lamb and game',['lamb','duck','venison','game'],'Rich, savoury meat welcomes a red; choose lighter styles for delicate preparations.',[pinot,pairingProfiles[1].recommendations[1],pairingProfiles[1].recommendations[0]]),
extra('Casual favourites',['sandwich','hot dog','hotdog','burrito','quesadilla','dumpling','gyoza','ramen','noodle'],'These are flexible starting points. Include the filling, sauce, or spice level for a closer recommendation.',[bubbles,rose,riesling]),chips];
export function pairingFor(food:string):PairingProfile|null{
 const q=normalize(food);if(!q)return null;
 const has=(terms:string[])=>terms.some(t=>contains(q,t));
 // Snack flavour takes precedence over isolated ingredients such as cheese or onion.
 if(has(chips.terms)||has(['cheetos','doritos','nacho','cracker'])){
  if(has(['spicy','hot','chilli','chili','jalapeno','flamin','takis']))return {...spicy,label:'Spicy snacks'};
  if(has(vinegar.terms))return vinegar;
  if(has(bbq.terms))return bbq;
  if(has(sourCream.terms))return sourCream;
  if(has(cheesy.terms))return cheesy;
  if(has(['truffle','mushroom']))return {...pairingProfiles[5],label:'Truffle and mushroom snacks'};
  return chips;
 }
 if(has(sushi.terms)||has(['spicy tuna roll','spicy salmon roll'])){
  if(has(['spicy','wasabi','chilli','chili']))return {...sushi,label:'Spicy sushi',recommendations:[riesling,bubbles,rose],intro:'For chilli or spicy mayo, start with off-dry Riesling. Check sweetness and alcohol; wasabi and soy can make pairings more challenging.'};
  return sushi;
 }
 if(has(['spicy','chilli','chili','curry','sichuan','szechuan','buffalo']))return spicy;
 if(has(herbs.terms)&&has(['pesto']))return herbs;
 if(has(creamy.terms))return creamy;
 let best:PairingProfile=defaultPairing,score=0;
 for(const profile of [...pairingProfiles,...expanded]){
  const next=profile.terms.reduce((sum,term)=>sum+(contains(q,term)?term.length:0),0);
  if(next>score){score=next;best=profile}
 }
 // A sauce or topping is more useful than a pasta shape.
 if(has(pasta.terms)){
  for(const p of [pairingProfiles[0],pairingProfiles[5],herbs,bbq])if(has(p.terms))return p;
  return pasta;
 }
 return best;
}
type CellarRecord={id:string;kind:string;data:any};
export function cellarPairingMatches(bottles:CellarRecord[],recommendations:PairingRecommendation[]){
 return bottles.filter(r=>Number(r.data.qty)>0).map(record=>{
  const text=normalize([record.data.name,record.data.region,record.data.grape,record.data.varietal].join(' '));
  let recommendation:PairingRecommendation|null=null,score=0;
  for(const option of recommendations){
   const next=option.keywords.filter(k=>contains(text,k)).length*10;
   if(next>score){score=next;recommendation=option}
  }
  return {record,recommendation,score};
 }).filter(match=>match.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
}

