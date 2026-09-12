'use client';
import React, {useId} from 'react';

type Place={name:string;note:string;lon:number;lat:number;tone:'cool'|'warm'|'plain'};
type Spec={title:string;description:string;places:Place[];wind?:boolean;gorge?:boolean};
const places:Record<string,Place>={
 willamette:{name:'Willamette Valley',note:'Between the Coast Range and Cascades',lon:-123.05,lat:44.9,tone:'cool'},
 umpqua:{name:'Umpqua Valley',note:'Cool northern sites; warmer areas farther south',lon:-123.35,lat:43.22,tone:'plain'},
 rogue:{name:'Rogue Valley',note:'Varied elevations and mountain influences',lon:-122.87,lat:42.33,tone:'warm'},
 gorge:{name:'Columbia Gorge',note:'A cross-border region with a west–east gradient',lon:-121.3,lat:45.7,tone:'plain'},
 dundee:{name:'Dundee Hills',note:'Red volcanic soils',lon:-123.05,lat:45.28,tone:'plain'},
 eola:{name:'Eola-Amity Hills',note:'Cooling winds from the Van Duzer Corridor',lon:-123.16,lat:45.06,tone:'cool'},
 vanDuzer:{name:'Van Duzer Corridor',note:'A break in the Coast Range; also an AVA',lon:-123.32,lat:44.99,tone:'cool'},
 elkton:{name:'Elkton Oregon',note:'Marine influence in the northern Umpqua',lon:-123.57,lat:43.64,tone:'cool'},
 applegate:{name:'Applegate Valley',note:'Nested within the Rogue Valley',lon:-123.22,lat:42.22,tone:'warm'},
 hood:{name:'Hood River area',note:'The cooler, wetter western side',lon:-121.52,lat:45.7,tone:'cool'},
 dalles:{name:'The Dalles area',note:'Drier conditions toward the east',lon:-121.18,lat:45.6,tone:'warm'},
};
export const OREGON_MAPS:Record<string,Spec>={
 'oregon-overview':{title:'Oregon, four places to start',description:'Schematic Oregon map locating the Willamette, Umpqua and Rogue valleys and the Columbia Gorge relative to the Pacific and Cascades.',places:[places.willamette,places.umpqua,places.rogue,places.gorge]},
 'oregon-willamette':{title:'A closer look at the Willamette',description:'Northern Willamette Valley orientation diagram locating Dundee Hills, Eola-Amity Hills and the Van Duzer Corridor. An arrow indicates marine air moving inland.',places:[places.dundee,places.eola,places.vanDuzer],wind:true},
 'oregon-south':{title:'Southern Oregon, a range of possibilities',description:'Southern Oregon orientation map locating Elkton, the Umpqua Valley, the Rogue Valley and the Applegate Valley.',places:[places.elkton,places.umpqua,places.rogue,places.applegate]},
 'oregon-gorge':{title:'Along the Columbia, west to east',description:'Columbia Gorge orientation diagram along the Oregon–Washington border, from the cooler Hood River area toward drier conditions near The Dalles. Markers are reference locations, not AVA boundaries.',places:[places.hood,places.dalles],gorge:true},
};
// Deliberately simplified state outline and representative locations, not legal AVA geometry.
const project=(lon:number,lat:number):[number,number]=>[(lon+124.8)*59, (46.4-lat)*67];
const outline=[[-124.57,42],[-124.4,42.7],[-124.5,42.9],[-124.18,43.4],[-124.05,44.1],[-123.96,45],[-123.97,45.75],[-124.05,46.25],[-123.5,46.2],[-123.15,46.18],[-122.78,45.85],[-122.76,45.65],[-122.25,45.55],[-121.7,45.7],[-121.15,45.62],[-120.7,45.73],[-119.9,45.93],[-119.1,46],[-116.92,46],[-116.7,45.8],[-116.46,45.56],[-116.7,45.3],[-116.85,45.1],[-117.03,44.97],[-116.94,44.7],[-117.18,44.3],[-117.03,44],[-117.03,42],[-124.57,42]];
const outlinePath=outline.map(([lon,lat],i)=>(i?'L':'M')+project(lon,lat).join(' ')).join(' ')+'Z';
const colors={cool:'#4a6b86',warm:'#8c4652',plain:'#4f6b45'};
export default function OregonMap({focus}:{focus:string}){
 const uid=useId().replace(/:/g,'');
 const spec=OREGON_MAPS[focus];if(!spec)return null;
 const zoom=focus==='oregon-willamette'?[48,58,92,61]:focus==='oregon-south'?[35,168,132,137]:focus==='oregon-gorge'?[170,32,75,40]:[0,0,510,325];
 const scale=zoom[2]/510;
 const p=(n:number)=>n*scale;
 return <figure className="region-map oregon-map">
  <svg viewBox={zoom.join(' ')} role="img" aria-labelledby={`${uid}-title ${uid}-desc`} preserveAspectRatio="xMidYMid meet">
   <title id={`${uid}-title`}>{spec.title}</title><desc id={`${uid}-desc`}>{spec.description}</desc>
   <defs><clipPath id={`${uid}-land`}><path d={outlinePath}/></clipPath></defs>
   <rect x="0" y="0" width="510" height="325" fill="#f8f6ef"/>
   <path d="M0 0H45L38 45L52 90L48 140L37 195L24 250L14 295H0Z" fill="#e4ecf1"/>
   <path d={outlinePath} fill="#edeee1" stroke="#9fa994" strokeWidth={p(1.5)}/>
   <g clipPath={`url(#${uid}-land)`}>
    <path d="M121 36Q166 100 141 160T138 304" fill="none" stroke="#d4dccb" strokeWidth="19"/>
    <path d="M65 31Q48 89 62 160T55 285" fill="none" stroke="#dce1d4" strokeWidth="10"/>
   </g>
   {focus==='oregon-overview'&&<g fill="#68745e" fontSize="13" fontFamily="system-ui, sans-serif"><text x="200" y="22">WASHINGTON</text><text x="250" y="310">CALIFORNIA / NEVADA</text><text x="320" y="163" fontSize="25" fontFamily="Georgia, serif">Oregon</text><text x="20" y="180" transform="rotate(-90 20 180)">PACIFIC OCEAN</text><text x="155" y="235" transform="rotate(-85 155 235)">CASCADES</text><text x="49" y="150" transform="rotate(-90 49 150)">COAST RANGE</text></g>}
   {spec.wind&&<g stroke="#4a6b86" fill="none" strokeWidth={p(2.5)}><path d="M49 94L80 94"/><path d="M77 92L80 94L77 96"/></g>}
   {spec.gorge&&<g fontFamily="system-ui, sans-serif" fill="#68745e" fontSize={p(17)}><text x="185" y="37">WASHINGTON</text><text x="185" y="70">OREGON</text><path d="M185 65L220 65" fill="none" stroke="#8c4652" strokeWidth={p(2)}/><text x="185" y="62" fontSize={p(14)}>WEST · cooler</text><text x="220" y="62" textAnchor="end" fontSize={p(14)}>EAST · drier</text></g>}
   {spec.places.map((place,i)=>{const [x,y]=project(place.lon,place.lat);return <g key={place.name}><circle cx={x} cy={y} r={p(10)} fill={colors[place.tone]} stroke="#fffdf8" strokeWidth={p(2)}/><text x={x} y={y+p(4)} textAnchor="middle" fill="white" style={{fontSize:p(12),fontFamily:'system-ui, sans-serif',fontWeight:600}}>{i+1}</text></g>})}
  </svg>
  <ol className="oregon-map-key">{spec.places.map((place,i)=><li key={place.name}><span style={{background:colors[place.tone]}} aria-hidden="true">{i+1}</span><div><strong>{place.name}</strong><small>{place.note}</small></div></li>)}</ol>
  <figcaption>{spec.title}. Approximate reference locations, not AVA boundaries. Shaded bands indicate mountain ranges schematically.</figcaption>
 </figure>;
}
