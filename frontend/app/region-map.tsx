'use client';
import React, {useId} from 'react';
import OregonMap from './oregon-map';
import NewYorkMap from './new-york-map';
// One projected outline of California, reused at different zooms. Points are real coordinates
// run through an equirectangular projection, so the shape and the relative positions are honest.
// Everything drawn on top is a simplified marker, not a survey boundary.
const CA='M6.0 5.5 L93.4 5.5 L93.4 83.2 L204.9 187.2 L203.1 246.5 L153.0 251.4 L149.1 234.0 L131.0 220.0 L124.6 212.7 L108.6 206.7 L99.7 202.3 L83.7 201.5 L80.2 189.8 L80.4 183.8 L72.7 171.6 L62.3 157.3 L54.0 145.6 L56.1 140.4 L55.0 136.0 L43.6 130.0 L41.1 114.9 L43.6 114.4 L42.2 109.2 L31.1 100.9 L16.0 84.5 L13.5 62.4 L2.9 45.8 L8.3 31.2 L6.0 5.5 Z';
const OCEAN='M153.0 251.4 L149.1 234.0 L131.0 220.0 L124.6 212.7 L108.6 206.7 L99.7 202.3 L83.7 201.5 L80.2 189.8 L80.4 183.8 L72.7 171.6 L62.3 157.3 L54.0 145.6 L56.1 140.4 L55.0 136.0 L43.6 130.0 L41.1 114.9 L43.6 114.4 L42.2 109.2 L31.1 100.9 L16.0 84.5 L13.5 62.4 L2.9 45.8 L8.3 31.2 L6.0 5.5 L-90 5.5 L-90 268 L153.0 268 Z';
type Marker={x:number;y:number;label:string;note?:string;tone?:'cool'|'warm'|'plain';anchor?:'start'|'end'|'middle';dy?:number};
type Arrow={x:number;y:number;label?:string;len?:number};
type MapSpec={title:string;desc:string;view:string;markers:Marker[];arrows?:Arrow[];zones?:boolean;strip?:'napa';current?:boolean};
const SPECS:Record<string,MapSpec>={
 fog:{title:'Where the cool air gets in',desc:'A map of California marking the four main gaps in the coastal hills that let Pacific air reach the vineyards: the Petaluma Gap and San Pablo Bay in the north, the Salinas Valley at Monterey, and the east-west valleys of Santa Barbara.',
  view:'-74 0 296 272',current:true,
  arrows:[{x:35.3,y:99.0,label:'Petaluma Gap',len:26},{x:44.6,y:110.0,label:'San Pablo Bay',len:34},{x:63.3,y:149.5,label:'Salinas Valley',len:26},{x:86.2,y:189.0,label:'Santa Barbara',len:26}],
  markers:[{x:112,y:150,label:'Hot interior',note:'pulls the marine air inland',tone:'warm',anchor:'start'}]},
 zones:{title:'The four growing zones',desc:'A map of California shaded into its four broad wine zones: North Coast, Central Coast, South Coast, and the Central Valley inland.',
  view:'0 0 218 258',zones:true,markers:[]},
 napa:{title:'Napa, cool at the bottom and hot at the top',desc:'A map locating the Napa Valley north of San Pablo Bay, with a schematic strip showing the valley running from cool Carneros in the south to hot Calistoga in the north.',
  view:'0 0 356 262',strip:'napa',
  markers:[{x:44.6,y:96.2,label:'Napa Valley',tone:'plain',anchor:'start'},{x:44.6,y:107.4,label:'San Pablo Bay',note:'the cool end',tone:'cool',anchor:'start',dy:9}]},
 sonoma:{title:'Sonoma, cold coast to warm inland',desc:'A map of the north coast marking Sonoma County appellations from the cold Sonoma Coast and Petaluma Gap through the Russian River Valley to warmer Dry Creek and Alexander Valley inland.',
  view:'14 74 58 46',
  markers:[
   {x:34.3,y:89.7,label:'Alexander Valley',note:'warm · Cabernet',tone:'warm',anchor:'start'},
   {x:32.2,y:92.3,label:'Dry Creek',note:'old-vine Zinfandel',tone:'warm',anchor:'start',dy:9},
   {x:33.2,y:96.7,label:'Russian River',note:'fog · Pinot, Chardonnay',tone:'cool',anchor:'start',dy:9},
   {x:24.9,y:96.2,label:'Sonoma Coast',note:'coldest',tone:'cool',anchor:'end'},
   {x:35.3,y:102.7,label:'Petaluma Gap',note:'wind, not just fog',tone:'cool',anchor:'end',dy:2},
   {x:44.6,y:103.5,label:'Carneros',note:'cool · shared with Napa',tone:'cool',anchor:'start',dy:6}]},
 'central-coast':{title:'The Central Coast',desc:'A map of the California Central Coast marking Monterey and the Santa Lucia Highlands, Paso Robles, and the east-west valleys of Santa Barbara from Santa Maria and the Sta. Rita Hills to warmer Happy Canyon.',
  view:'42 130 84 84',
  arrows:[{x:63.3,y:149.5},{x:86.2,y:189.0}],
  markers:[
   {x:65.4,y:152.1,label:'Santa Lucia Highlands',note:'wind · Pinot, Chardonnay',tone:'cool',anchor:'start'},
   {x:78.9,y:170.8,label:'Paso Robles',note:'big day to night swing · Rhone grapes',tone:'warm',anchor:'start'},
   {x:86.2,y:189.0,label:'Santa Maria Valley',note:'cold',tone:'cool',anchor:'start'},
   {x:85.1,y:196.0,label:'Sta. Rita Hills',note:'cold',tone:'cool',anchor:'end',dy:2},
   {x:96.4,y:197.1,label:'Happy Canyon',note:'warm · Cabernet',tone:'warm',anchor:'start',dy:6}]}
};
const TONE={cool:'#387d91',warm:'#b95264',plain:'#a17d2e'};
export function RegionMap({focus}:{focus:string}){
 const uid=useId().replace(/:/g,'');
 if(focus.startsWith('oregon-'))return <OregonMap focus={focus}/>;
 if(focus.startsWith('new-york-'))return <NewYorkMap focus={focus}/>;
 const spec=SPECS[focus];
 if(!spec)return null;
 const id='ca-'+focus+'-'+uid;
 // Text and markers are sized in user units, so a zoomed viewBox would magnify them. Scale them back.
 const k=Number(spec.view.split(/\s+/)[2])/218;
 const px=(n:number)=>Math.round(n*k*100)/100;
 return <figure className="region-map atlas-map california-map">
  <header className="atlas-heading"><span>DECANT ATLAS / CALIFORNIA</span><strong>{spec.title}</strong></header>
  <svg className="atlas-canvas" viewBox={spec.view} style={{["--ms" as any]:k}} role="img" aria-labelledby={id+'-t '+id+'-d'} preserveAspectRatio="xMidYMid meet">
   <title id={id+'-t'}>{spec.title}</title><desc id={id+'-d'}>{spec.desc}</desc>
   <defs><clipPath id={id+'-clip'}><path d={CA}/></clipPath></defs>
   <path d={OCEAN} fill="#dcebee"/>
   <path d={CA} fill="#eee7d2" stroke="#929780" strokeWidth={px(1.1)}/>
   {spec.zones&&<g clipPath={`url(#${id}-clip)`} opacity="0.85">
    <rect x="0" y="58" width="62" height="58" fill="#9eaf77"/>
    <rect x="40" y="132" width="66" height="80" fill="#dfb25c"/>
    <rect x="120" y="208" width="95" height="50" fill="#cd8591"/>
    <path d="M62 88 L86 82 L116 168 L96 174 Z" fill="#b8be75"/>
   </g>}
   {spec.zones&&<g className="zone-label">
    <text x="8" y="78">NORTH COAST</text><text x="44" y="168">CENTRAL COAST</text>
    <text x="128" y="234">SOUTH COAST</text><text x="88" y="126">CENTRAL VALLEY</text>
   </g>}
   {(spec.arrows||[]).map((a,i)=><g key={i} className="fog-arrow">
     <path d={`M${a.x-px(a.len||16)} ${a.y} L${a.x-px(2)} ${a.y}`} strokeLinecap="round" strokeWidth={px(1.5)}/>
     <path d={`M${a.x-px(6)} ${a.y-px(3.2)} L${a.x-px(1)} ${a.y} L${a.x-px(6)} ${a.y+px(3.2)}`} fill="none" strokeWidth={px(1.5)}/>
     {a.label&&<text x={a.x-px((a.len||16)+3)} y={a.y+px(2.2)} textAnchor="end">{a.label}</text>}
   </g>)}
   {spec.current&&<g className="current">
    <path d="M-52 46 L-52 214" strokeLinecap="round"/>
    <path d="M-56 204 L-52 213 L-48 204" fill="none"/>
    <text x="-46" y="160">Cold current,</text><text x="-46" y="169">running south</text>
   </g>}
   {spec.markers.map((m,i)=><g key={i} className="map-marker">
    <circle cx={m.x} cy={m.y} r={px(4.5)} fill={TONE[m.tone||'plain']} opacity=".15"/>
    <circle cx={m.x} cy={m.y} r={px(2.4)} fill={TONE[m.tone||'plain']}/>
    <text x={m.anchor==='end'?m.x-px(4):m.x+px(4)} y={m.y+px(2.6+(m.dy||0))} textAnchor={m.anchor==='end'?'end':'start'}>{m.label}</text>
    {m.note&&<text className="map-note" x={m.anchor==='end'?m.x-px(4):m.x+px(4)} y={m.y+px(9.4+(m.dy||0))} textAnchor={m.anchor==='end'?'end':'start'}>{m.note}</text>}
   </g>)}
   {spec.strip==='napa'&&<g className="napa-strip" transform="translate(198 58)">
    <text x="0" y="-10" className="strip-title">The valley, north to south</text>
    <rect x="0" y="0" width="46" height="150" rx="6" fill={`url(#${id}-grad)`}/>
    <defs><linearGradient id={`${id}-grad`} x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stopColor="#b8615c"/><stop offset="0.55" stopColor="#c99a72"/><stop offset="1" stopColor="#7f9f9d"/>
    </linearGradient></defs>
    <text x="54" y="14">Calistoga</text><text className="map-note" x="54" y="23">hottest</text>
    <text x="54" y="62">St. Helena</text><text className="map-note" x="54" y="71">valley floor</text>
    <text x="54" y="110">Oakville, Rutherford</text><text className="map-note" x="54" y="119">benchland</text>
    <text x="54" y="146">Carneros</text><text className="map-note" x="54" y="155">coolest, by the bay</text>
   </g>}
  </svg>
  <div className="atlas-legend"><span><i style={{background:TONE.cool}}/>Marine influence</span><span><i style={{background:TONE.warm}}/>Warmer inland</span><span><i style={{background:TONE.plain}}/>Reference location</span></div>
  <figcaption>{spec.title}. Simplified, for orientation rather than navigation.</figcaption>
 </figure>;
}
export default RegionMap;
