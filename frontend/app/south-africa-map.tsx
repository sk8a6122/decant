'use client';
import React,{useId} from 'react';

type Tone='ocean'|'mountain'|'vine'|'warm';
type Place={name:string;note:string;x:number;y:number;tone:Tone;anchor?:'start'|'end'};
type Spec={title:string;description:string;places:Place[];band?:'core'|'west'|'south'|'inland'};
const colors:Record<Tone,string>={ocean:'#24758b',mountain:'#755b88',vine:'#6f8e3f',warm:'#cf7a32'};
const all:Record<string,Place>={
 capeTown:{name:'Cape Town',note:'Atlantic gateway',x:105,y:272,tone:'ocean',anchor:'end'},
 constantia:{name:'Constantia',note:'maritime peninsula',x:120,y:303,tone:'ocean',anchor:'end'},
 stellenbosch:{name:'Stellenbosch',note:'mountains · Cabernet blends',x:171,y:278,tone:'mountain'},
 paarl:{name:'Paarl',note:'warm core',x:178,y:227,tone:'warm'},
 franschhoek:{name:'Franschhoek',note:'mountain valley',x:221,y:255,tone:'mountain'},
 wellington:{name:'Wellington',note:'inland slopes',x:191,y:196,tone:'warm'},
 swartland:{name:'Swartland',note:'old-vine Chenin · Syrah',x:129,y:161,tone:'vine',anchor:'end'},
 darling:{name:'Darling',note:'Atlantic influence',x:80,y:188,tone:'ocean',anchor:'end'},
 olifants:{name:'Olifants River',note:'north · hot to high',x:89,y:86,tone:'warm',anchor:'end'},
 breedekloof:{name:'Breedekloof',note:'mountain gateway',x:260,y:207,tone:'mountain'},
 worcester:{name:'Worcester',note:'Breede River Valley',x:293,y:224,tone:'warm'},
 robertson:{name:'Robertson',note:'wine · fizz · brandy',x:359,y:251,tone:'warm'},
 elgin:{name:'Elgin',note:'elevated and cool',x:214,y:310,tone:'ocean'},
 walker:{name:'Walker Bay',note:'Pinot Noir · Chardonnay',x:269,y:343,tone:'ocean'},
 agulhas:{name:'Cape Agulhas',note:'wind · Sauvignon Blanc',x:342,y:375,tone:'ocean'},
 calitzdorp:{name:'Calitzdorp',note:'fortified traditions',x:464,y:259,tone:'warm'},
};
const SPECS:Record<string,Spec>={
 'south-africa-cape-core':{title:'The Cape core: mountains redraw distance',description:'Orientation map locating Cape Town, Constantia, Stellenbosch, Paarl, Franschhoek and Wellington, with ocean air and mountain barriers.',places:[all.capeTown,all.constantia,all.stellenbosch,all.paarl,all.franschhoek,all.wellington],band:'core'},
 'south-africa-swartland':{title:'Swartland: dry country with an Atlantic edge',description:'Orientation map locating Swartland, Darling and the northern Olifants River relative to Cape Town and the Atlantic.',places:[all.capeTown,all.darling,all.swartland,all.olifants],band:'west'},
 'south-africa-south-coast':{title:'The south-coast cooling corridor',description:'Orientation map following cool sites from Constantia through Elgin and Walker Bay to windy Cape Agulhas.',places:[all.constantia,all.stellenbosch,all.elgin,all.walker,all.agulhas],band:'south'},
 'south-africa-inland':{title:'Across the mountains: river valleys and dry country',description:'Orientation map locating Breedekloof, Worcester, Robertson and Calitzdorp east of the Cape core.',places:[all.stellenbosch,all.breedekloof,all.worcester,all.robertson,all.calitzdorp],band:'inland'},
};

function National({uid}:{uid:string}){
 return <svg className="atlas-canvas" viewBox="0 0 600 410" width="600" height="410" role="img" aria-labelledby={uid+'-title '+uid+'-desc'}>
  <title id={uid+'-title'}>South Africa, with the Cape wine country highlighted</title><desc id={uid+'-desc'}>National orientation map showing the concentration of wine regions in the Western Cape, the Atlantic and Indian oceans, the Benguela Current and the Orange River wine area.</desc>
  <defs><pattern id={uid+'-grain'} width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#9aa47c" opacity=".36"/></pattern></defs>
  <rect width="600" height="410" fill="#dcebee"/>
  <path d="M128 88L212 55 302 71 390 57 485 95 517 159 493 236 446 292 353 348 278 374 210 349 168 300 119 243 94 171Z" fill="#f3ecd6" stroke="#536659" strokeWidth="1.8"/>
  <path d="M128 88L212 55 302 71 390 57 485 95 517 159 493 236 446 292 353 348 278 374 210 349 168 300 119 243 94 171Z" fill={'url(#'+uid+'-grain)'}/>
  <path d="M119 243L168 300 210 349 278 374 326 359 286 316 226 292 185 245Z" fill="#a33f67" opacity=".72"/>
  <path d="M52 283Q46 212 78 142" fill="none" stroke="#24758b" strokeWidth="4" strokeLinecap="round"/><path d="M72 154L78 142 82 157" fill="none" stroke="#24758b" strokeWidth="4"/>
  <text x="24" y="212" transform="rotate(-78 24 212)" className="atlas-water-label">COLD BENGUELA CURRENT</text>
  <text x="55" y="373" className="atlas-water-label">ATLANTIC OCEAN</text><text x="402" y="373" className="atlas-water-label">INDIAN OCEAN</text>
  <circle cx="222" cy="333" r="13" fill="#a33f67"/><text x="222" y="337" textAnchor="middle" className="atlas-number">1</text><text x="245" y="331" className="atlas-place-label">Western Cape</text><text x="245" y="350" className="atlas-place-note">the heart of the winelands</text>
  <circle cx="309" cy="81" r="9" fill="#cf7a32"/><text x="309" y="85" textAnchor="middle" className="atlas-number">2</text><text x="326" y="78" className="atlas-place-label">Orange River</text><text x="326" y="96" className="atlas-place-note">northern wine area</text>
  <g transform="translate(554 54)"><path d="M0 18V-6M-5 1L0-6L5 1" stroke="#354438" fill="none" strokeWidth="1.5"/><text x="0" y="-13" textAnchor="middle" className="atlas-compass">N</text></g>
 </svg>;
}

function Cape({spec,uid}:{spec:Spec;uid:string}){
 return <svg className="atlas-canvas" viewBox="0 0 600 410" width="600" height="410" role="img" aria-labelledby={uid+'-title '+uid+'-desc'}>
  <title id={uid+'-title'}>{spec.title}</title><desc id={uid+'-desc'}>{spec.description}</desc>
  <defs><pattern id={uid+'-dots'} width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#a6ae8a" opacity=".42"/></pattern></defs>
  <rect width="600" height="410" fill="#dcebee"/>
  <path d="M60 24L176 22 284 51 407 72 548 116 571 180 548 236 514 281 476 317 427 347 354 376 284 384 226 367 183 338 146 319 113 292 89 251 70 193Z" fill="#f3ecd6" stroke="#536659" strokeWidth="1.7"/>
  <path d="M60 24L176 22 284 51 407 72 548 116 571 180 548 236 514 281 476 317 427 347 354 376 284 384 226 367 183 338 146 319 113 292 89 251 70 193Z" fill={'url(#'+uid+'-dots)'}/>
  {spec.band==='core'&&<path d="M91 186Q160 168 237 210L248 292Q191 333 116 306Z" fill="#755b88" opacity=".16"/>}
  {spec.band==='west'&&<path d="M63 54Q120 36 169 62L180 208Q125 248 75 212Z" fill="#6f8e3f" opacity=".2"/>}
  {spec.band==='south'&&<path d="M106 282Q220 290 354 356L426 350Q314 401 205 363Z" fill="#24758b" opacity=".2"/>}
  {spec.band==='inland'&&<path d="M230 170Q351 146 503 225L487 302Q358 289 243 234Z" fill="#cf7a32" opacity=".18"/>}
  <path d="M137 242Q188 188 228 235T321 229 402 265 490 237" fill="none" stroke="#755b88" strokeWidth="12" opacity=".3" strokeLinecap="round"/>
  <text x="263" y="197" className="atlas-water-label">CAPE FOLD MOUNTAINS</text>
  <path d="M18 255Q52 257 95 272" fill="none" stroke="#24758b" strokeWidth="3"/><path d="M83 265L96 272 82 276" fill="none" stroke="#24758b" strokeWidth="3"/>
  <path d="M238 402Q260 378 291 360" fill="none" stroke="#24758b" strokeWidth="3"/><path d="M278 362L291 360 284 372" fill="none" stroke="#24758b" strokeWidth="3"/>
  <text x="16" y="238" className="atlas-water-label">ATLANTIC AIR</text><text x="163" y="401" className="atlas-water-label">FALSE BAY AIR</text>
  {spec.places.map((p,i)=><g key={p.name}>
   <circle cx={p.x} cy={p.y} r="16" fill={colors[p.tone]} opacity=".18"/><circle cx={p.x} cy={p.y} r="9" fill={colors[p.tone]} stroke="#fffaf0" strokeWidth="2"/>
   <text x={p.x} y={p.y+4} textAnchor="middle" className="atlas-number">{i+1}</text>
  </g>)}
  <g transform="translate(554 48)"><path d="M0 18V-6M-5 1L0-6L5 1" stroke="#354438" fill="none" strokeWidth="1.5"/><text x="0" y="-13" textAnchor="middle" className="atlas-compass">N</text></g>
 </svg>;
}

export default function SouthAfricaMap({focus}:{focus:string}){
 const uid='za-'+useId().replace(/:/g,'');
 const overview=focus==='south-africa-overview';
 const spec=SPECS[focus];
 if(!overview&&!spec)return null;
 const title=overview?'South Africa: wine country at the Cape':spec.title;
 return <figure className="region-map atlas-map south-africa-map">
  <header className="atlas-heading"><span>DECANT ATLAS / SOUTH AFRICA</span><strong>{title}</strong></header>
  {overview?<National uid={uid}/>:<Cape spec={spec} uid={uid}/>}
  {!overview&&<ol className="atlas-map-key">{spec.places.map((place,i)=><li key={place.name}><span style={{background:colors[place.tone]}}>{i+1}</span><div><strong>{place.name}</strong><small>{place.note}</small></div></li>)}</ol>}
  <div className="atlas-legend"><span><i style={{background:colors.ocean}}/>Ocean influence</span><span><i style={{background:colors.mountain}}/>Mountain corridor</span><span><i style={{background:colors.vine}}/>Old-vine country</span><span><i style={{background:colors.warm}}/>Warmer inland</span></div>
  <figcaption>Original orientation diagram; points and color fields are explanatory, not legal Wine of Origin boundaries.</figcaption>
 </figure>;
}
