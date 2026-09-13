'use client';
import React, {useId} from 'react';

type Tone='lake'|'vine'|'warm'|'maritime';
type Place={name:string;note:string;lon:number;lat:number;tone:Tone};
type Spec={title:string;description:string;places:Place[]};
const colors:Record<Tone,string>={lake:'#24758b',vine:'#6f8e3f',warm:'#d07a32',maritime:'#a33f67'};
const places:Record<string,Place>={
 finger:{name:'Finger Lakes',note:'Deep lakes moderate nearby vineyard slopes',lon:-76.88,lat:42.68,tone:'lake'},
 longIsland:{name:'Long Island',note:'Atlantic maritime growing conditions',lon:-72.63,lat:40.92,tone:'maritime'},
 hudson:{name:'Hudson River Region',note:'River valley south of Albany',lon:-73.9,lat:41.72,tone:'vine'},
 upperHudson:{name:'Upper Hudson',note:'Cold-climate growing north and west of Albany',lon:-73.86,lat:43.16,tone:'vine'},
 champlain:{name:'Champlain Valley of New York',note:'Short season along Lake Champlain',lon:-73.43,lat:44.55,tone:'lake'},
 lakeErie:{name:'Lake Erie',note:'Cross-state grape belt along the lakeshore',lon:-79.28,lat:42.48,tone:'warm'},
 niagara:{name:'Niagara Escarpment',note:'Lake Ontario plain and escarpment',lon:-78.72,lat:43.18,tone:'warm'},
};
export const NEW_YORK_MAPS:Record<string,Spec>={
 'new-york-overview':{title:'New York, seven regions shaped by water',description:'Orientation map of New York State showing the seven top-level American Viticultural Areas and their relationship to the Great Lakes, Finger Lakes, Hudson River and Atlantic Ocean.',places:[places.lakeErie,places.niagara,places.finger,places.hudson,places.upperHudson,places.champlain,places.longIsland]},
 'new-york-other-regions':{title:'Beyond the Finger Lakes and Long Island',description:'Orientation map locating Lake Erie, Niagara Escarpment, Hudson River Region, Upper Hudson and Champlain Valley of New York.',places:[places.lakeErie,places.niagara,places.hudson,places.upperHudson,places.champlain]},
};

// State coordinates are projected uniformly. AVAs remain markers rather than legal boundaries.
const outline=[[-73.343806,45.013027],[-73.332852,44.804903],[-73.387622,44.618687],[-73.294514,44.437948],[-73.321898,44.246255],[-73.436914,44.043608],[-73.349283,43.769761],[-73.404052,43.687607],[-73.245221,43.523299],[-73.278083,42.833204],[-73.267129,42.745573],[-73.508114,42.08834],[-73.486206,42.050002],[-73.55193,41.294184],[-73.48073,41.21203],[-73.727192,41.102491],[-73.655992,40.987475],[-73.22879,40.905321],[-73.141159,40.965568],[-72.774204,40.965568],[-72.587988,40.998429],[-72.28128,41.157261],[-72.259372,41.042245],[-72.100541,40.992952],[-72.467496,40.845075],[-73.239744,40.625997],[-73.562884,40.582182],[-73.776484,40.593136],[-73.935316,40.543843],[-74.022947,40.708151],[-73.902454,40.998429],[-74.236547,41.14083],[-74.69661,41.359907],[-74.740426,41.431108],[-74.89378,41.436584],[-75.074519,41.60637],[-75.052611,41.754247],[-75.173104,41.869263],[-75.249781,41.863786],[-75.35932,42.000709],[-79.76278,42.000709],[-79.76278,42.269079],[-79.149363,42.55388],[-79.050778,42.690804],[-78.853608,42.783912],[-78.930285,42.953697],[-79.012439,42.986559],[-79.072686,43.260406],[-78.486653,43.375421],[-77.966344,43.369944],[-77.75822,43.34256],[-77.533665,43.233021],[-77.391265,43.276836],[-76.958587,43.271359],[-76.695693,43.34256],[-76.41637,43.523299],[-76.235631,43.528776],[-76.230154,43.802623],[-76.137046,43.961454],[-76.3616,44.070993],[-76.312308,44.196962],[-75.912491,44.366748],[-75.764614,44.514625],[-75.282643,44.848718],[-74.828057,45.018503],[-74.148916,44.991119],[-73.343806,45.013027]];
const project=(lon:number,lat:number):[number,number]=>[(lon+80)*72,(45.3-lat)*78];
const outlinePath=outline.map(([lon,lat],i)=>(i?'L':'M')+project(lon,lat).join(' ')).join(' ')+'Z';
const lakePath='M226 193C235 207 238 226 234 252M274 186C282 205 280 233 275 261M329 177C338 201 336 239 330 270M374 174C382 202 380 239 374 267';
const marker=(place:Place,i:number)=>{const [x,y]=project(place.lon,place.lat);return <g key={place.name}>
 <circle cx={x} cy={y} r="19" fill={colors[place.tone]} opacity=".18"/><circle cx={x} cy={y} r="11" fill={colors[place.tone]} stroke="#fffaf0" strokeWidth="2"/>
 <text x={x} y={y+4} textAnchor="middle" className="atlas-number">{i+1}</text>
 </g>};

function StateMap({focus,uid}:{focus:string;uid:string}){
 const spec=NEW_YORK_MAPS[focus];
 return <>
  <svg className="atlas-canvas" viewBox="0 0 600 410" width="600" height="410" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
   <title id={`${uid}-title`}>{spec.title}</title><desc id={`${uid}-desc`}>{spec.description}</desc>
   <defs><pattern id={`${uid}-dots`} width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#a6ae8a" opacity=".42"/></pattern></defs>
   <rect width="600" height="410" fill="#dcebee"/>
   <path d={outlinePath} fill="#f3ecd6" stroke="#536659" strokeWidth="1.6"/>
   <path d={outlinePath} fill={`url(#${uid}-dots)`} opacity=".7"/>
   <path d="M18 175Q62 145 112 162T205 146" fill="none" stroke="#24758b" strokeWidth="26" opacity=".22"/>
   <text x="45" y="132" className="atlas-water-label">LAKE ERIE</text>
   <path d="M95 73Q185 35 350 68" fill="none" stroke="#24758b" strokeWidth="37" opacity=".22"/>
   <text x="170" y="45" className="atlas-water-label">LAKE ONTARIO</text>
   <path d={lakePath} fill="none" stroke="#24758b" strokeWidth="5" strokeLinecap="round" opacity=".82"/>
   <text x="282" y="286" className="atlas-water-label">FINGER LAKES</text>
   <path d="M452 182Q480 227 488 278T501 355" fill="none" stroke="#24758b" strokeWidth="4" strokeLinecap="round"/>
   <text x="476" y="250" transform="rotate(73 476 250)" className="atlas-water-label">HUDSON</text>
   <text x="515" y="391" className="atlas-water-label">ATLANTIC</text>
   {spec.places.map(marker)}
   <g transform="translate(560 45)"><path d="M0 18V-6M-5 1L0-6L5 1" stroke="#354438" fill="none" strokeWidth="1.5"/><text x="0" y="-13" textAnchor="middle" className="atlas-compass">N</text></g>
  </svg>
  <ol className="atlas-map-key">{spec.places.map((place,i)=><li key={place.name}><span style={{background:colors[place.tone]}}>{i+1}</span><div><strong>{place.name}</strong><small>{place.note}</small></div></li>)}</ol>
 </>;
}

function FingerLakesMap({uid}:{uid:string}){
 const lakes=[['Canandaigua','Moderating lake',150,'M0 0C-8 24-7 58 0 104'],['Keuka','Y-shaped lake',260,'M0 104C-4 70-2 42 0 24M0 55L-21 22M0 55L19 25'],['Seneca','Nested AVA',365,'M0 0C-9 30-7 78 0 126'],['Cayuga','Nested AVA',470,'M0 0C8 36 6 88 0 132']];
 return <svg className="atlas-canvas" viewBox="0 0 600 410" width="600" height="410" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
  <title id={`${uid}-title`}>Finger Lakes: four lakes to learn first</title><desc id={`${uid}-desc`}>Schematic north-up map comparing Canandaigua, Keuka, Seneca and Cayuga Lakes, with Seneca Lake and Cayuga Lake identified as nested AVAs.</desc>
  <rect width="600" height="410" fill="#f3ecd6"/><path d="M0 64Q180 43 300 61T600 48V0H0Z" fill="#b9d8df"/>
  <text x="300" y="32" textAnchor="middle" className="atlas-water-label">LAKE ONTARIO · NORTH</text>
  <path d="M62 319Q280 270 538 300" fill="none" stroke="#a6ae8a" strokeWidth="42" opacity=".2"/>
  {lakes.map(([name,note,x,path],i)=><g key={String(name)} transform={`translate(${x} 118)`}>
   {(name==='Seneca'||name==='Cayuga')&&<rect x="-35" y="-20" width="70" height="190" rx="35" fill="#a33f67" opacity=".12"/>}
   <path d={String(path)} fill="none" stroke="#24758b" strokeWidth={name==='Seneca'||name==='Cayuga'?16:12} strokeLinecap="round" strokeLinejoin="round"/>
   <circle cx="0" cy="178" r="12" fill={name==='Seneca'||name==='Cayuga'?'#a33f67':'#6f8e3f'}/><text x="0" y="182" textAnchor="middle" className="atlas-number">{i+1}</text>
   <text x="0" y="211" textAnchor="middle" className="atlas-place-label">{name}</text><text x="0" y="230" textAnchor="middle" className="atlas-place-note">{note}</text>
  </g>)}
  <g transform="translate(555 50)"><path d="M0 18V-6M-5 1L0-6L5 1" stroke="#354438" fill="none" strokeWidth="1.5"/><text x="0" y="-13" textAnchor="middle" className="atlas-compass">N</text></g>
 </svg>;
}

function LongIslandMap({uid}:{uid:string}){
 return <svg className="atlas-canvas" viewBox="0 0 600 410" width="600" height="410" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
  <title id={`${uid}-title`}>Long Island: two forks, three bodies of water</title><desc id={`${uid}-desc`}>Schematic west-to-east map showing the North Fork between Long Island Sound and Peconic Bay and The Hamptons on the South Fork beside the Atlantic Ocean.</desc>
  <rect width="600" height="410" fill="#dcebee"/>
  <text x="300" y="44" textAnchor="middle" className="atlas-water-label">LONG ISLAND SOUND</text><text x="300" y="377" textAnchor="middle" className="atlas-water-label">ATLANTIC OCEAN</text>
  <path d="M35 205C120 164 224 151 337 157C407 160 455 138 548 101L565 114C481 170 427 193 346 201C227 213 120 230 50 238Z" fill="#f3ecd6" stroke="#536659" strokeWidth="1.6"/>
  <path d="M346 201C426 212 488 238 559 283L544 296C462 258 405 242 329 236Z" fill="#f3ecd6" stroke="#536659" strokeWidth="1.6"/>
  <path d="M336 157C407 160 455 138 548 101L565 114C481 170 427 193 346 201Z" fill="#6f8e3f" opacity=".76"/>
  <path d="M346 201C426 212 488 238 559 283L544 296C462 258 405 242 329 236Z" fill="#a33f67" opacity=".72"/>
  <text x="448" y="145" textAnchor="middle" className="atlas-region-label">NORTH FORK</text><text x="456" y="266" textAnchor="middle" className="atlas-region-label">THE HAMPTONS</text>
  <text x="415" y="215" textAnchor="middle" className="atlas-water-label">PECONIC BAY</text><text x="85" y="270" className="atlas-place-note">New York City ← west</text><text x="528" y="76" className="atlas-place-note">east →</text>
  <g transform="translate(555 50)"><path d="M0 18V-6M-5 1L0-6L5 1" stroke="#354438" fill="none" strokeWidth="1.5"/><text x="0" y="-13" textAnchor="middle" className="atlas-compass">N</text></g>
 </svg>;
}

export default function NewYorkMap({focus}:{focus:string}){
 const uid='ny-'+useId().replace(/:/g,'');
 const title=focus==='new-york-finger-lakes'?'Finger Lakes: four lakes to learn first':focus==='new-york-long-island'?'Long Island: two forks, three bodies of water':NEW_YORK_MAPS[focus]?.title;
 if(!title)return null;
 return <figure className="region-map atlas-map new-york-map">
  <header className="atlas-heading"><span>DECANT ATLAS / NEW YORK</span><strong>{title}</strong></header>
  {focus==='new-york-finger-lakes'?<FingerLakesMap uid={uid}/>:focus==='new-york-long-island'?<LongIslandMap uid={uid}/>:<StateMap focus={focus} uid={uid}/>}
  <div className="atlas-legend"><span><i style={{background:colors.lake}}/>Lake influence</span><span><i style={{background:colors.vine}}/>Cool-climate region</span><span><i style={{background:colors.warm}}/>Western grape belt</span><span><i style={{background:colors.maritime}}/>Maritime influence</span></div>
  <figcaption>Orientation diagram with representative locations; numbered points are not legal AVA boundaries.</figcaption>
 </figure>;
}
