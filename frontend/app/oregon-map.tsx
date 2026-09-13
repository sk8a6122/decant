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
const labelLayouts:Record<string,Array<[number,number,'start'|'end']>>={
 'oregon-overview':[[23,4,'start'],[23,4,'start'],[23,4,'start'],[23,4,'start']],
 'oregon-willamette':[[24,4,'start'],[24,4,'start'],[-24,26,'end']],
 'oregon-south':[[-24,4,'end'],[24,4,'start'],[24,4,'start'],[-24,27,'end']],
};
const colors={cool:'#387d91',warm:'#b95264',plain:'#ac8432'};
export default function OregonMap({focus}:{focus:string}){
 const uid=useId().replace(/:/g,'');
 const spec=OREGON_MAPS[focus];if(!spec)return null;
 // Transform geography uniformly into one stable canvas; labels stay in screen units.
 const bounds=focus==='oregon-willamette'?[48,58,92,61]:focus==='oregon-south'?[35,168,132,137]:focus==='oregon-gorge'?[170,28,75,52]:[0,0,510,325];
 const [bx,by,bw,bh]=bounds, scale=Math.min(520/bw,310/bh);
 const ox=300-(bx+bw/2)*scale, oy=205-(by+bh/2)*scale;
 const point=(lon:number,lat:number)=>{const [x,y]=project(lon,lat);return [x*scale+ox,y*scale+oy]};
 const textStyle={fontFamily:'Arial, sans-serif',fontSize:13,fill:'#38443e'};
 return <figure className="region-map atlas-map oregon-map">
  <header className="atlas-heading"><span>DECANT ATLAS / OREGON</span><strong>{spec.title}</strong></header>
  <svg className="atlas-canvas" viewBox="0 0 600 410" width="600" height="410" role="img" aria-labelledby={`${uid}-title ${uid}-desc`} preserveAspectRatio="xMidYMid meet">
   <title id={`${uid}-title`}>{spec.title}</title><desc id={`${uid}-desc`}>{spec.description}</desc>
   <defs>
    <clipPath id={`${uid}-frame`}><rect x="16" y="16" width="568" height="378" rx="2"/></clipPath>
    <clipPath id={`${uid}-land`}><path d={outlinePath}/></clipPath>
    <pattern id={`${uid}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V7" stroke="#9d9b84" strokeWidth="1" opacity=".3"/></pattern>
    <linearGradient id={`${uid}-climate`}><stop stopColor="#387d91"/><stop offset=".5" stopColor="#b4b16c"/><stop offset="1" stopColor="#c66d55"/></linearGradient>
   </defs>
   <rect width="600" height="410" fill="#f8f3e7"/>
   <g clipPath={`url(#${uid}-frame)`}>
    <rect x="16" y="16" width="568" height="378" fill="#dcebee"/>
    <g transform={`translate(${ox} ${oy}) scale(${scale})`}>
     <path d={outlinePath} fill="#eee7d2" stroke="#7a8275" strokeWidth={1.4/scale}/>
     <g clipPath={`url(#${uid}-land)`}>
      <path d="M121 36Q166 100 141 160T138 304" fill="none" stroke="#ced3b6" strokeWidth="19"/>
      <path d="M121 36Q166 100 141 160T138 304" fill="none" stroke={`url(#${uid}-hatch)`} strokeWidth="19"/>
      <path d="M65 31Q48 89 62 160T55 285" fill="none" stroke="#d5d8bf" strokeWidth="10"/>
      {focus==='oregon-overview'&&<>
       <ellipse cx="102" cy="109" rx="15" ry="49" fill="#a8b889" opacity=".8"/>
       <ellipse cx="85" cy="208" rx="19" ry="26" fill="#d8b560" opacity=".75"/>
       <ellipse cx="113" cy="274" rx="25" ry="15" fill="#cf8790" opacity=".75"/>
      </>}
     </g>
     {/* Columbia River follows the simplified northern state boundary. */}
     <path d="M76.7 13.4L97.35 14.74L119.18 36.85L120.36 50.25L150.45 56.95L182.9 46.9L215.35 52.26L241.9 44.89L289.1 31.49L336.3 26.8" stroke="#659aab" strokeWidth={3/scale} fill="none"/>
    </g>
    {focus==='oregon-overview'&&<>
     <text x="334" y="54" style={{...textStyle,fontSize:12,letterSpacing:3}}>WASHINGTON</text>
     <text x="374" y="220" style={{...textStyle,fontFamily:'Georgia, serif',fontSize:37,fill:'#737b63'}}>Oregon</text>
     <text x="67" y="264" transform="rotate(-90 67 264)" style={{...textStyle,fontSize:12,letterSpacing:3,fill:'#447887'}}>PACIFIC OCEAN</text>
     <text x="305" y="294" transform="rotate(-85 305 294)" style={{...textStyle,fontSize:11,letterSpacing:2}}>CASCADES</text>
     <text x="352" y="377" style={{...textStyle,fontSize:11,letterSpacing:2}}>CALIFORNIA / NEVADA</text>
    </>}
    {spec.gorge&&<>
     <rect x="16" y="16" width="568" height="125" fill="#ece8d8"/>
     <text x="48" y="65" style={{...textStyle,fontSize:14,letterSpacing:3}}>WASHINGTON</text>
     <text x="48" y="327" style={{...textStyle,fontSize:14,letterSpacing:3}}>OREGON</text>
     <text x="300" y="124" textAnchor="middle" style={{...textStyle,fontFamily:'Georgia, serif',fontStyle:'italic',fontSize:18,fill:'#39788c'}}>Columbia River</text>
     <rect x="65" y="349" width="470" height="7" rx="3" fill={`url(#${uid}-climate)`}/>
     <text x="65" y="380" style={{...textStyle,fontSize:13}}>WEST · cooler / wetter</text>
     <text x="535" y="380" textAnchor="end" style={{...textStyle,fontSize:13}}>EAST · drier</text>
    </>}
    {spec.wind&&<g>
     <path d="M65 338Q110 310 160 310M148 302L160 310L148 318" stroke="#387d91" strokeWidth="3" fill="none"/>
     <text x="48" y="365" style={{...textStyle,fontSize:13,fill:'#387d91'}}>Marine air →</text>
    </g>}
    {spec.places.map((place,i)=>{const [x,y]=point(place.lon,place.lat);return <g key={place.name}>
     <circle cx={x} cy={y} r="21" fill={colors[place.tone]} opacity=".15"/>
     <circle cx={x} cy={y} r="12" fill={colors[place.tone]} stroke="#fffdf8" strokeWidth="2"/>
     <text x={x} y={y+4} textAnchor="middle" style={{fontSize:12,fill:'#fff',fontFamily:'Arial, sans-serif',fontWeight:700}}>{i+1}</text>
     {!spec.gorge&&(()=>{const [dx,dy,anchor]=labelLayouts[focus][i];return <text x={x+dx} y={y+dy} textAnchor={anchor} style={{...textStyle,fontSize:16,fontWeight:600,paintOrder:'stroke',stroke:'#f8f3e7',strokeWidth:3,strokeLinejoin:'round'}}>{place.name}</text>})()}
     {spec.gorge&&<><path d={`M${x} ${y+16}V${y+43}`} stroke={colors[place.tone]} strokeWidth="1.5"/><text x={x} y={y+65} textAnchor="middle" style={{...textStyle,fontSize:20,fontFamily:'Georgia, serif'}}>{i===0?'Hood River':'The Dalles'}</text></>}
    </g>})}
   </g>
   <rect x="16" y="16" width="568" height="378" fill="none" stroke="#c8c5b2"/>
   <g transform="translate(552 46)"><path d="M0 18V-5M-5 2L0-5L5 2" stroke="#465449" fill="none" strokeWidth="1.5"/><text x="0" y="-12" textAnchor="middle" style={{...textStyle,fontSize:11}}>N</text></g>
  </svg>
  <ol className="oregon-map-key">{spec.places.map((place,i)=><li key={place.name}><span style={{background:colors[place.tone]}} aria-hidden="true">{i+1}</span><div><strong>{place.name}</strong><small>{place.note}</small></div></li>)}</ol>
  <figcaption>Reference locations and illustrative growing areas, not AVA boundaries. Mountain bands and river simplified for orientation.</figcaption>
 </figure>;
}
